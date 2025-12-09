/**
 * Artifact Storage Service
 * 
 * Manages test artifacts (traces, screenshots, videos) using MinIO.
 * Provides pre-signed URLs for uploads and retrieval with lifecycle management.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { DatabaseManager } from '@shifty/database';
import {
  validateProductionConfig,
  getJwtConfig,
  RequestLimits,
} from '@shifty/shared';
import { Client as MinioClient } from 'minio';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Validate configuration on startup
try {
  validateProductionConfig();
} catch (error) {
  console.error('Configuration validation failed:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const jwtConfig = getJwtConfig();

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  bodyLimit: 50 * 1024 * 1024, // 50MB for artifacts
  requestTimeout: 60000, // 60 seconds for large uploads
});

// Database manager
const dbManager = new DatabaseManager();

// MinIO client configuration
const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'shifty-artifacts';
const DEFAULT_RETENTION_DAYS = 30;

// ============================================================
// REGISTER PLUGINS
// ============================================================

await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
});

await fastify.register(helmet, {
  contentSecurityPolicy: false,
});

await fastify.register(jwt, {
  secret: jwtConfig.secret,
});

await fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// ============================================================
// AUTHENTICATION DECORATOR
// ============================================================

fastify.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// ============================================================
// MINIO INITIALIZATION
// ============================================================

async function initializeMinio() {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`[ArtifactStorage] Created bucket: ${BUCKET_NAME}`);

      // Set lifecycle policy for automatic cleanup
      const lifecycleConfig = {
        Rule: [
          {
            ID: 'DeleteOldArtifacts',
            Status: 'Enabled',
            Expiration: {
              Days: DEFAULT_RETENTION_DAYS,
            },
            Filter: {
              Prefix: '',
            },
          },
        ],
      };
      
      // Note: lifecycle API might not be available in all MinIO versions
      console.log('[ArtifactStorage] Bucket created. Configure lifecycle policy manually if needed.');
    } else {
      console.log(`[ArtifactStorage] Bucket already exists: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.error('[ArtifactStorage] Error initializing MinIO:', error);
    throw error;
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateStorageKey(tenantId: string, runId: string, artifactType: string, filename: string): string {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${tenantId}/${runId}/${artifactType}/${Date.now()}-${sanitizedFilename}`;
}

function getRetentionDays(planTier?: string): number {
  switch (planTier) {
    case 'enterprise':
      return 90;
    case 'professional':
      return 60;
    case 'starter':
    default:
      return 30;
  }
}

// ============================================================
// UPLOAD ENDPOINTS
// ============================================================

// Direct upload endpoint
fastify.post('/api/v1/artifacts/upload', {
  onRequest: [fastify.authenticate],
}, async (request, reply) => {
  try {
    const tenantId = request.headers['x-tenant-id'] as string;
    const runId = request.headers['x-run-id'] as string;
    const artifactType = request.headers['x-artifact-type'] as string || 'unknown';
    const artifactName = request.headers['x-artifact-name'] as string || 'artifact';

    if (!tenantId || !runId) {
      return reply.status(400).send({ error: 'Missing tenant ID or run ID' });
    }

    // Generate storage key
    const storageKey = generateStorageKey(tenantId, runId, artifactType, artifactName);

    // Get file buffer
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file provided' });
    }

    const buffer = await data.toBuffer();
    const sizeBytes = buffer.length;

    // Upload to MinIO
    await minioClient.putObject(BUCKET_NAME, storageKey, buffer, sizeBytes, {
      'Content-Type': data.mimetype,
      'X-Tenant-ID': tenantId,
      'X-Run-ID': runId,
      'X-Artifact-Type': artifactType,
    });

    // Generate pre-signed URL for retrieval (24 hours)
    const url = await minioClient.presignedGetObject(BUCKET_NAME, storageKey, 24 * 60 * 60);

    // Calculate expiration
    const retentionDays = getRetentionDays();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    // Save metadata to database
    await dbManager.query(
      `INSERT INTO test_artifacts (
        run_id, tenant_id, artifact_type, storage_key, url, size_bytes, retention_days, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [runId, tenantId, artifactType, storageKey, url, sizeBytes, retentionDays, expiresAt]
    );

    reply.send({
      success: true,
      url,
      storageKey,
      sizeBytes,
      expiresAt,
    });
  } catch (error: any) {
    console.error('[ArtifactStorage] Upload error:', error);
    reply.status(500).send({ error: error.message });
  }
});

// Get pre-signed upload URL
fastify.post('/api/v1/artifacts/presigned-upload', {
  onRequest: [fastify.authenticate],
  schema: {
    body: z.object({
      runId: z.string(),
      artifactType: z.enum(['trace', 'screenshot', 'video', 'log']),
      filename: z.string(),
      contentType: z.string().optional(),
    }),
  },
}, async (request, reply) => {
  try {
    const { runId, artifactType, filename, contentType } = request.body as any;
    const tenantId = request.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return reply.status(400).send({ error: 'Missing tenant ID' });
    }

    // Generate storage key
    const storageKey = generateStorageKey(tenantId, runId, artifactType, filename);

    // Generate pre-signed URL for upload (1 hour)
    const uploadUrl = await minioClient.presignedPutObject(
      BUCKET_NAME,
      storageKey,
      60 * 60, // 1 hour
      {
        'Content-Type': contentType || 'application/octet-stream',
      }
    );

    reply.send({
      uploadUrl,
      storageKey,
      expiresIn: 3600,
    });
  } catch (error: any) {
    console.error('[ArtifactStorage] Presigned upload error:', error);
    reply.status(500).send({ error: error.message });
  }
});

// ============================================================
// RETRIEVAL ENDPOINTS
// ============================================================

// Get artifact by storage key
fastify.get('/api/v1/artifacts/:storageKey(*)', {
  onRequest: [fastify.authenticate],
}, async (request, reply) => {
  try {
    const { storageKey } = request.params as any;

    // Check if artifact exists in database
    const { rows } = await dbManager.query(
      'SELECT * FROM test_artifacts WHERE storage_key = $1',
      [storageKey]
    );

    if (rows.length === 0) {
      return reply.status(404).send({ error: 'Artifact not found' });
    }

    const artifact = rows[0];

    // Check if expired
    if (artifact.expires_at && new Date(artifact.expires_at) < new Date()) {
      return reply.status(410).send({ error: 'Artifact has expired' });
    }

    // Generate new pre-signed URL if needed
    const url = await minioClient.presignedGetObject(BUCKET_NAME, storageKey, 24 * 60 * 60);

    reply.send({
      ...artifact,
      url,
    });
  } catch (error: any) {
    console.error('[ArtifactStorage] Retrieval error:', error);
    reply.status(500).send({ error: error.message });
  }
});

// Get artifacts for a run
fastify.get('/api/v1/runs/:runId/artifacts', {
  onRequest: [fastify.authenticate],
}, async (request, reply) => {
  try {
    const { runId } = request.params as any;
    const tenantId = request.headers['x-tenant-id'] as string;

    const { rows } = await dbManager.query(
      `SELECT * FROM test_artifacts 
       WHERE run_id = $1 AND tenant_id = $2
       ORDER BY created_at DESC`,
      [runId, tenantId]
    );

    // Generate fresh URLs for all artifacts
    const artifacts = await Promise.all(
      rows.map(async (artifact) => {
        try {
          const url = await minioClient.presignedGetObject(
            BUCKET_NAME,
            artifact.storage_key,
            24 * 60 * 60
          );
          return { ...artifact, url };
        } catch (error) {
          console.error(`[ArtifactStorage] Error generating URL for ${artifact.storage_key}:`, error);
          return artifact;
        }
      })
    );

    reply.send({ artifacts });
  } catch (error: any) {
    console.error('[ArtifactStorage] Error fetching artifacts:', error);
    reply.status(500).send({ error: error.message });
  }
});

// ============================================================
// CLEANUP ENDPOINTS
// ============================================================

// Manual cleanup of expired artifacts
fastify.delete('/api/v1/artifacts/cleanup', {
  onRequest: [fastify.authenticate],
}, async (request, reply) => {
  try {
    // Get expired artifacts
    const { rows } = await dbManager.query(
      `SELECT storage_key FROM test_artifacts 
       WHERE expires_at < NOW()`
    );

    let deletedCount = 0;
    for (const artifact of rows) {
      try {
        await minioClient.removeObject(BUCKET_NAME, artifact.storage_key);
        deletedCount++;
      } catch (error) {
        console.error(`[ArtifactStorage] Error deleting ${artifact.storage_key}:`, error);
      }
    }

    // Remove from database
    await dbManager.query(
      'DELETE FROM test_artifacts WHERE expires_at < NOW()'
    );

    reply.send({
      success: true,
      deletedCount,
    });
  } catch (error: any) {
    console.error('[ArtifactStorage] Cleanup error:', error);
    reply.status(500).send({ error: error.message });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

fastify.get('/health', async (request, reply) => {
  try {
    await dbManager.query('SELECT 1');
    await minioClient.bucketExists(BUCKET_NAME);
    reply.send({ status: 'healthy', service: 'artifact-storage' });
  } catch (error) {
    reply.status(503).send({ status: 'unhealthy', error: 'Service unavailable' });
  }
});

// ============================================================
// SERVER STARTUP
// ============================================================

const PORT = parseInt(process.env.PORT || '3024');

async function start() {
  try {
    await dbManager.initialize();
    await initializeMinio();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[ArtifactStorage] Server listening on port ${PORT}`);
  } catch (err) {
    console.error('[ArtifactStorage] Error starting server:', err);
    process.exit(1);
  }
}

start();
