/**
 * Orchestrator Service
 * 
 * Manages test orchestration with smart sharding using greedy bin-packing.
 * Creates jobs for worker pool and tracks execution progress.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { DatabaseManager } from '@shifty/database';
import {
  validateProductionConfig,
  getJwtConfig,
  RequestLimits,
} from '@shifty/shared';
import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
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
  bodyLimit: RequestLimits.bodyLimit,
  requestTimeout: RequestLimits.requestTimeout,
});

// Database manager
const dbManager = new DatabaseManager();

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// BullMQ queue
const testQueue = new Queue('test-execution', {
  connection: redis,
});

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
// SHARDING ALGORITHM
// ============================================================

interface TestFile {
  file: string;
  estimatedDuration?: number;
}

interface Shard {
  index: number;
  files: string[];
  estimatedDuration: number;
}

/**
 * Greedy bin-packing algorithm for duration-aware sharding
 * Distributes tests across workers to minimize total execution time
 */
async function createShards(
  testFiles: TestFile[],
  workerCount: number,
  tenantId: string
): Promise<Shard[]> {
  // Fetch historical durations from test_history
  const { rows } = await dbManager.query(
    `SELECT test_file, p50_duration_ms 
     FROM test_history 
     WHERE tenant_id = $1 AND test_file = ANY($2)`,
    [tenantId, testFiles.map(t => t.file)]
  );

  // Create duration map
  const durationMap = new Map<string, number>();
  rows.forEach(row => {
    durationMap.set(row.test_file, row.p50_duration_ms || 10000); // Default 10s
  });

  // Assign durations to test files
  const testsWithDurations = testFiles.map(test => ({
    file: test.file,
    duration: test.estimatedDuration || durationMap.get(test.file) || 10000,
  }));

  // Sort by duration (descending) for better packing
  testsWithDurations.sort((a, b) => b.duration - a.duration);

  // Initialize shards
  const shards: Shard[] = Array.from({ length: workerCount }, (_, i) => ({
    index: i,
    files: [],
    estimatedDuration: 0,
  }));

  // Greedy bin-packing: assign each test to shard with smallest total duration
  for (const test of testsWithDurations) {
    // Find shard with minimum duration
    const minShard = shards.reduce((min, shard) =>
      shard.estimatedDuration < min.estimatedDuration ? shard : min
    );

    minShard.files.push(test.file);
    minShard.estimatedDuration += test.duration;
  }

  console.log(`[Orchestrator] Created ${workerCount} shards with estimated durations:`,
    shards.map(s => `${s.index}: ${(s.estimatedDuration / 1000).toFixed(1)}s`).join(', ')
  );

  return shards;
}

// ============================================================
// ORCHESTRATION ENDPOINTS
// ============================================================

const OrchestrateSchema = z.object({
  testFiles: z.array(z.string()),
  workerCount: z.number().min(1).max(20).default(5),
  project: z.string().optional(),
  branch: z.string().optional(),
  commitSha: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Start orchestrated test run
fastify.post('/api/v1/orchestrate', {
  onRequest: [fastify.authenticate],
  schema: {
    body: OrchestrateSchema,
  },
}, async (request, reply) => {
  try {
    const { testFiles, workerCount, project, branch, commitSha, metadata } = request.body as any;
    const tenantId = request.headers['x-tenant-id'] as string;
    const userId = (request.user as any)?.id;

    if (!tenantId) {
      return reply.status(400).send({ error: 'Missing tenant ID' });
    }

    // Generate run ID
    const runId = randomUUID();

    // Create shards using greedy bin-packing
    const shards = await createShards(
      testFiles.map(file => ({ file })),
      workerCount,
      tenantId
    );

    // Create test run record
    await dbManager.query(
      `INSERT INTO test_runs (
        id, tenant_id, project_id, branch, commit_sha, status, total_tests, worker_count, shard_strategy, metadata, created_by
      ) VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, 'duration-aware', $8, $9)`,
      [runId, tenantId, project, branch, commitSha, testFiles.length, workerCount, JSON.stringify(metadata || {}), userId]
    );

    // Create shard records and enqueue jobs
    for (const shard of shards) {
      // Save shard to database
      await dbManager.query(
        `INSERT INTO test_shards (run_id, shard_index, test_files, estimated_duration_ms, status)
         VALUES ($1, $2, $3, $4, 'pending')`,
        [runId, shard.index, JSON.stringify(shard.files), shard.estimatedDuration]
      );

      // Enqueue job
      await testQueue.add(
        `shard-${shard.index}`,
        {
          runId,
          tenantId,
          shardIndex: shard.index,
          totalShards: workerCount,
          testFiles: shard.files,
          project,
          branch,
          commitSha,
        },
        {
          jobId: `${runId}-${shard.index}`,
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        }
      );
    }

    console.log(`[Orchestrator] Created run ${runId} with ${shards.length} shards`);

    reply.send({
      runId,
      status: 'pending',
      workerCount,
      totalTests: testFiles.length,
      shards: shards.map(s => ({
        index: s.index,
        testCount: s.files.length,
        estimatedDuration: s.estimatedDuration,
      })),
    });
  } catch (error: any) {
    console.error('[Orchestrator] Orchestration error:', error);
    reply.status(500).send({ error: error.message });
  }
});

// Get orchestration progress (SSE)
fastify.get('/api/v1/orchestrate/:runId/progress', async (request, reply) => {
  const { runId } = request.params as any;

  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send initial status
  try {
    const { rows } = await dbManager.query(
      `SELECT r.*, 
        (SELECT json_agg(s.*) FROM test_shards s WHERE s.run_id = r.id) as shards
       FROM test_runs r WHERE r.id = $1`,
      [runId]
    );

    if (rows[0]) {
      reply.raw.write(`data: ${JSON.stringify(rows[0])}\n\n`);
    }
  } catch (error) {
    console.error('[Orchestrator] Error fetching progress:', error);
  }

  // Poll for updates every 2 seconds
  const interval = setInterval(async () => {
    try {
      const { rows } = await dbManager.query(
        `SELECT r.*, 
          (SELECT json_agg(s.*) FROM test_shards s WHERE s.run_id = r.id) as shards
         FROM test_runs r WHERE r.id = $1`,
        [runId]
      );

      if (rows[0]) {
        reply.raw.write(`data: ${JSON.stringify(rows[0])}\n\n`);

        // Stop if run is completed
        if (rows[0].status === 'completed' || rows[0].status === 'failed') {
          clearInterval(interval);
          reply.raw.end();
        }
      }
    } catch (error) {
      console.error('[Orchestrator] Error in progress polling:', error);
    }
  }, 2000);

  reply.raw.on('close', () => {
    clearInterval(interval);
  });
});

// Cancel orchestration
fastify.delete('/api/v1/orchestrate/:runId', {
  onRequest: [fastify.authenticate],
}, async (request, reply) => {
  const { runId } = request.params as any;

  try {
    // Update run status
    await dbManager.query(
      `UPDATE test_runs SET status = 'cancelled', completed_at = NOW() WHERE id = $1`,
      [runId]
    );

    // Remove pending jobs from queue
    const jobs = await testQueue.getJobs(['waiting', 'active']);
    for (const job of jobs) {
      if (job.data.runId === runId) {
        await job.remove();
      }
    }

    reply.send({ success: true, message: 'Orchestration cancelled' });
  } catch (error: any) {
    console.error('[Orchestrator] Cancel error:', error);
    reply.status(500).send({ error: error.message });
  }
});

// Get queue stats
fastify.get('/api/v1/orchestrate/queue/stats', {
  onRequest: [fastify.authenticate],
}, async (request, reply) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      testQueue.getWaitingCount(),
      testQueue.getActiveCount(),
      testQueue.getCompletedCount(),
      testQueue.getFailedCount(),
    ]);

    reply.send({
      waiting,
      active,
      completed,
      failed,
    });
  } catch (error: any) {
    console.error('[Orchestrator] Stats error:', error);
    reply.status(500).send({ error: error.message });
  }
});

// ============================================================
// POST-RUN HEALING PR HOOK
// ============================================================

async function checkAndCreateHealingPR(runId: string, tenantId: string): Promise<void> {
  try {
    // Get healing events with high confidence
    const { rows } = await dbManager.query(
      `SELECT * FROM healing_events 
       WHERE run_id = $1 AND tenant_id = $2 AND confidence >= 0.7 AND success = true
       ORDER BY confidence DESC`,
      [runId, tenantId]
    );

    if (rows.length === 0) {
      console.log(`[Orchestrator] No high-confidence healing events for run ${runId}`);
      return;
    }

    console.log(`[Orchestrator] Found ${rows.length} healing events for PR creation`);

    // Call production-feedback service to create PR
    const productionFeedbackUrl = process.env.PRODUCTION_FEEDBACK_URL || 'http://localhost:3013';
    
    const response = await fetch(`${productionFeedbackUrl}/api/v1/healing/create-pr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        runId,
        healingEvents: rows,
      }),
    });

    if (response.ok) {
      const prData = await response.json();
      console.log(`[Orchestrator] Created healing PR: ${prData.prUrl}`);
    } else {
      console.error(`[Orchestrator] Failed to create healing PR: ${response.statusText}`);
    }
  } catch (error) {
    console.error('[Orchestrator] Error creating healing PR:', error);
  }
}

// ============================================================
// HEALTH CHECK
// ============================================================

fastify.get('/health', async (request, reply) => {
  try {
    await dbManager.query('SELECT 1');
    await redis.ping();
    reply.send({ status: 'healthy', service: 'orchestrator-service' });
  } catch (error) {
    reply.status(503).send({ status: 'unhealthy', error: 'Service unavailable' });
  }
});

// ============================================================
// SERVER STARTUP
// ============================================================

const PORT = parseInt(process.env.PORT || '3022');

async function start() {
  try {
    await dbManager.initialize();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[Orchestrator] Server listening on port ${PORT}`);
    console.log(`[Orchestrator] Queue ready for test execution jobs`);
  } catch (err) {
    console.error('[Orchestrator] Error starting server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Orchestrator] SIGTERM received, closing gracefully...');
  await testQueue.close();
  await redis.quit();
  await fastify.close();
  process.exit(0);
});

start();
