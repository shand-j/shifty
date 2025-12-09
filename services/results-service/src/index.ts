/**
 * Results Service
 * 
 * Collects and streams test results from Playwright reporter in real-time.
 * Provides WebSocket endpoint for streaming and REST API for querying results.
 */

import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { DatabaseManager } from '@shifty/database';
import {
  validateProductionConfig,
  getJwtConfig,
  RequestLimits,
} from '@shifty/shared';
import { z } from 'zod';

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

// WebSocket connections map
const connections = new Map<string, Set<any>>();

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

await fastify.register(websocket);

// ============================================================
// AUTHENTICATION DECORATOR
// ============================================================

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// ============================================================
// WEBSOCKET ENDPOINT
// ============================================================

fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    const runId = req.headers['x-run-id'] as string;
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!runId || !tenantId) {
      connection.socket.close(1008, 'Missing run ID or tenant ID');
      return;
    }

    // Add connection to map
    if (!connections.has(runId)) {
      connections.set(runId, new Set());
    }
    connections.get(runId)!.add(connection);

    console.log(`[ResultsService] Client connected for run: ${runId}`);

    connection.socket.on('message', async (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        await handleMessage(data, tenantId);
      } catch (error) {
        console.error('[ResultsService] Error handling message:', error);
      }
    });

    connection.socket.on('close', () => {
      connections.get(runId)?.delete(connection);
      if (connections.get(runId)?.size === 0) {
        connections.delete(runId);
      }
      console.log(`[ResultsService] Client disconnected from run: ${runId}`);
    });
  });
});

// ============================================================
// MESSAGE HANDLERS
// ============================================================

async function handleMessage(data: any, tenantId: string): Promise<void> {
  const { type, payload } = data;

  switch (type) {
    case 'run:start':
      await handleRunStart(payload, tenantId);
      break;
    case 'test:start':
      await handleTestStart(payload, tenantId);
      break;
    case 'test:batch':
      await handleTestBatch(payload, tenantId);
      break;
    case 'run:end':
      await handleRunEnd(payload, tenantId);
      break;
    case 'run:error':
      await handleRunError(payload, tenantId);
      break;
    default:
      console.warn(`[ResultsService] Unknown message type: ${type}`);
  }
}

async function handleRunStart(payload: any, tenantId: string): Promise<void> {
  const { runId, totalTests, shardIndex, totalShards, workerId } = payload;

  try {
    await dbManager.query(
      `INSERT INTO test_runs (id, tenant_id, status, total_tests, worker_count, metadata, started_at)
       VALUES ($1, $2, 'running', $3, $4, $5, NOW())
       ON CONFLICT (id) DO UPDATE 
       SET status = 'running', started_at = NOW()`,
      [runId, tenantId, totalTests, totalShards || 1, JSON.stringify({ shardIndex, totalShards, workerId })]
    );

    console.log(`[ResultsService] Run started: ${runId}`);
  } catch (error) {
    console.error('[ResultsService] Error handling run start:', error);
  }
}

async function handleTestStart(payload: any, tenantId: string): Promise<void> {
  // Log test start for monitoring (optional)
  console.log(`[ResultsService] Test started: ${payload.testName}`);
}

async function handleTestBatch(payload: any, tenantId: string): Promise<void> {
  const { runId, results } = payload;

  try {
    // Insert all test results in batch
    for (const result of results) {
      await dbManager.query(
        `INSERT INTO test_results (
          run_id, tenant_id, test_file, test_name, test_title,
          shard_index, worker_id, status, duration_ms, retry_count,
          error_message, error_stack, trace_url, screenshot_url, video_url,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          runId,
          tenantId,
          result.testFile,
          result.testName,
          result.testTitle,
          result.shardIndex,
          result.workerId,
          result.status,
          result.durationMs,
          result.retryCount,
          result.errorMessage,
          result.errorStack,
          result.traceUrl,
          result.screenshotUrl,
          result.videoUrl,
          JSON.stringify(result.metadata || {}),
        ]
      );

      // Update test history
      await updateTestHistory(tenantId, result);
    }

    // Update run stats
    await updateRunStats(runId, tenantId);

    console.log(`[ResultsService] Batch processed: ${results.length} results for run ${runId}`);
  } catch (error) {
    console.error('[ResultsService] Error handling test batch:', error);
  }
}

async function handleRunEnd(payload: any, tenantId: string): Promise<void> {
  const { runId, status, totalTests, passedTests, failedTests, skippedTests } = payload;

  try {
    await dbManager.query(
      `UPDATE test_runs 
       SET status = $1, total_tests = $2, passed_tests = $3, 
           failed_tests = $4, skipped_tests = $5, completed_at = NOW(),
           duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000
       WHERE id = $6 AND tenant_id = $7`,
      [status, totalTests, passedTests, failedTests, skippedTests, runId, tenantId]
    );

    console.log(`[ResultsService] Run completed: ${runId}`);

    // Broadcast completion to all connected clients
    broadcastToRun(runId, { type: 'run:complete', payload });
  } catch (error) {
    console.error('[ResultsService] Error handling run end:', error);
  }
}

async function handleRunError(payload: any, tenantId: string): Promise<void> {
  const { runId, error } = payload;
  console.error(`[ResultsService] Run error for ${runId}:`, error);
}

async function updateTestHistory(tenantId: string, result: any): Promise<void> {
  try {
    const isFlaky = result.retryCount > 0 && result.status === 'passed';
    
    await dbManager.query(
      `INSERT INTO test_history (
        tenant_id, test_file, test_name, total_runs, passed_runs, failed_runs, flaky_runs,
        avg_duration_ms, last_run_at, last_passed_at, last_failed_at
      ) VALUES ($1, $2, $3, 1, $4, $5, $6, $7, NOW(), $8, $9)
      ON CONFLICT (tenant_id, project_id, test_file, test_name) 
      DO UPDATE SET
        total_runs = test_history.total_runs + 1,
        passed_runs = test_history.passed_runs + $4,
        failed_runs = test_history.failed_runs + $5,
        flaky_runs = test_history.flaky_runs + $6,
        avg_duration_ms = (test_history.avg_duration_ms * test_history.total_runs + $7) / (test_history.total_runs + 1),
        last_run_at = NOW(),
        last_passed_at = CASE WHEN $4 = 1 THEN NOW() ELSE test_history.last_passed_at END,
        last_failed_at = CASE WHEN $5 = 1 THEN NOW() ELSE test_history.last_failed_at END,
        updated_at = NOW()`,
      [
        tenantId,
        result.testFile,
        result.testName,
        result.status === 'passed' ? 1 : 0,
        result.status === 'failed' ? 1 : 0,
        isFlaky ? 1 : 0,
        result.durationMs,
        result.status === 'passed' ? new Date() : null,
        result.status === 'failed' ? new Date() : null,
      ]
    );
  } catch (error) {
    console.error('[ResultsService] Error updating test history:', error);
  }
}

async function updateRunStats(runId: string, tenantId: string): Promise<void> {
  try {
    const { rows } = await dbManager.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'passed') as passed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status IN ('skipped', 'interrupted')) as skipped
       FROM test_results 
       WHERE run_id = $1 AND tenant_id = $2`,
      [runId, tenantId]
    );

    if (rows[0]) {
      await dbManager.query(
        `UPDATE test_runs 
         SET passed_tests = $1, failed_tests = $2, skipped_tests = $3
         WHERE id = $4 AND tenant_id = $5`,
        [rows[0].passed, rows[0].failed, rows[0].skipped, runId, tenantId]
      );
    }
  } catch (error) {
    console.error('[ResultsService] Error updating run stats:', error);
  }
}

function broadcastToRun(runId: string, message: any): void {
  const clients = connections.get(runId);
  if (!clients) return;

  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.socket.readyState === 1) {
      client.socket.send(messageStr);
    }
  });
}

// ============================================================
// REST API ENDPOINTS
// ============================================================

// Get test runs with filtering
fastify.get('/api/v1/runs', {
  onRequest: [fastify.authenticate],
}, async (request, reply) => {
  const { tenant, project, branch, status, limit = '50', offset = '0' } = request.query as any;

  try {
    let query = 'SELECT * FROM test_runs WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (tenant) {
      query += ` AND tenant_id = $${paramIndex++}`;
      params.push(tenant);
    }
    if (project) {
      query += ` AND project_id = $${paramIndex++}`;
      params.push(project);
    }
    if (branch) {
      query += ` AND branch = $${paramIndex++}`;
      params.push(branch);
    }
    if (status && status !== 'all') {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const { rows } = await dbManager.query(query, params);
    reply.send({ runs: rows });
  } catch (error: any) {
    reply.status(500).send({ error: error.message });
  }
});

// Get specific run details
fastify.get('/api/v1/runs/:runId', {
  onRequest: [fastify.authenticate],
}, async (request, reply) => {
  const { runId } = request.params as any;

  try {
    const runResult = await dbManager.query(
      'SELECT * FROM test_runs WHERE id = $1',
      [runId]
    );

    if (runResult.rows.length === 0) {
      return reply.status(404).send({ error: 'Run not found' });
    }

    const resultsResult = await dbManager.query(
      'SELECT * FROM test_results WHERE run_id = $1 ORDER BY created_at',
      [runId]
    );

    reply.send({
      run: runResult.rows[0],
      results: resultsResult.rows,
    });
  } catch (error: any) {
    reply.status(500).send({ error: error.message });
  }
});

// Get failed tests from a run
fastify.get('/api/v1/runs/:runId/failed-tests', {
  onRequest: [fastify.authenticate],
}, async (request, reply) => {
  const { runId } = request.params as any;

  try {
    const { rows } = await dbManager.query(
      `SELECT test_file, test_name, error_message 
       FROM test_results 
       WHERE run_id = $1 AND status = 'failed'
       ORDER BY test_file, test_name`,
      [runId]
    );

    reply.send({ failedTests: rows });
  } catch (error: any) {
    reply.status(500).send({ error: error.message });
  }
});

// SSE endpoint for real-time progress
fastify.get('/api/v1/runs/:runId/progress', async (request, reply) => {
  const { runId } = request.params as any;

  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send current status immediately
  try {
    const { rows } = await dbManager.query(
      'SELECT * FROM test_runs WHERE id = $1',
      [runId]
    );

    if (rows[0]) {
      reply.raw.write(`data: ${JSON.stringify(rows[0])}\n\n`);
    }
  } catch (error) {
    console.error('[ResultsService] Error fetching run status:', error);
  }

  // Keep connection alive
  const interval = setInterval(() => {
    reply.raw.write(':keepalive\n\n');
  }, 30000);

  reply.raw.on('close', () => {
    clearInterval(interval);
  });
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  try {
    await dbManager.query('SELECT 1');
    reply.send({ status: 'healthy', service: 'results-service' });
  } catch (error) {
    reply.status(503).send({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

// ============================================================
// SERVER STARTUP
// ============================================================

const PORT = parseInt(process.env.PORT || '3023');

async function start() {
  try {
    await dbManager.initialize();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[ResultsService] Server listening on port ${PORT}`);
  } catch (err) {
    console.error('[ResultsService] Error starting server:', err);
    process.exit(1);
  }
}

start();
