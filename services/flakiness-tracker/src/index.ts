/**
 * Flakiness Tracker Service
 * 
 * Analyzes test results to detect flaky tests.
 * Runs nightly cron jobs to calculate flakiness rates.
 * Provides API for querying flaky tests.
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
import cron from 'node-cron';
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
// FLAKINESS DETECTION LOGIC
// ============================================================

/**
 * Calculate flakiness rate for all tests
 * A test is flaky if it passed after one or more retries
 */
async function calculateFlakinessRates(): Promise<void> {
  console.log('[FlakinessTracker] Starting flakiness rate calculation...');

  try {
    // Get all tenants
    const { rows: tenants } = await dbManager.query('SELECT id FROM tenants');

    for (const tenant of tenants) {
      await calculateTenantFlakiness(tenant.id);
    }

    console.log('[FlakinessTracker] Flakiness calculation completed');
  } catch (error) {
    console.error('[FlakinessTracker] Error calculating flakiness:', error);
  }
}

/**
 * Calculate flakiness for a specific tenant
 */
async function calculateTenantFlakiness(tenantId: string): Promise<void> {
  // Query test history for flaky runs
  const { rows } = await dbManager.query(
    `SELECT 
      test_file,
      test_name,
      project_id,
      total_runs,
      flaky_runs,
      CASE 
        WHEN total_runs > 0 THEN (flaky_runs::DECIMAL / total_runs * 100)
        ELSE 0
      END as flakiness_rate
    FROM test_history
    WHERE tenant_id = $1 AND total_runs >= 3
    ORDER BY flakiness_rate DESC`,
    [tenantId]
  );

  // Update or insert flakiness records
  for (const test of rows) {
    await dbManager.query(
      `INSERT INTO test_flakiness (
        tenant_id, project_id, test_file, test_name, flakiness_rate, flaky_runs, total_runs, detection_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
      ON CONFLICT (tenant_id, project_id, test_file, test_name, detection_date)
      DO UPDATE SET
        flakiness_rate = $5,
        flaky_runs = $6,
        total_runs = $7,
        updated_at = NOW()`,
      [
        tenantId,
        test.project_id,
        test.test_file,
        test.test_name,
        test.flakiness_rate,
        test.flaky_runs,
        test.total_runs,
      ]
    );
  }

  console.log(`[FlakinessTracker] Updated flakiness for ${rows.length} tests in tenant ${tenantId}`);
}

/**
 * Update test_history flakiness_rate column
 */
async function updateTestHistoryFlakiness(): Promise<void> {
  await dbManager.query(
    `UPDATE test_history
     SET flakiness_rate = CASE 
       WHEN total_runs > 0 THEN (flaky_runs::DECIMAL / total_runs * 100)
       ELSE 0
     END,
     updated_at = NOW()
     WHERE total_runs >= 3`
  );

  console.log('[FlakinessTracker] Updated test_history flakiness rates');
}

// ============================================================
// API ENDPOINTS
// ============================================================

// Get flaky tests
fastify.get('/api/v1/analytics/flaky-tests', {
  onRequest: [fastify.authenticate],
  schema: {
    querystring: z.object({
      project: z.string().optional(),
      minRate: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      offset: z.string().transform(Number).optional(),
    }),
  },
}, async (request, reply) => {
  const { project, minRate = '10', limit = '50', offset = '0' } = request.query as any;
  const tenantId = request.headers['x-tenant-id'] as string;

  try {
    let query = `
      SELECT 
        f.*,
        h.last_run_at,
        h.avg_duration_ms
      FROM test_flakiness f
      LEFT JOIN test_history h ON 
        f.tenant_id = h.tenant_id AND 
        f.test_file = h.test_file AND 
        f.test_name = h.test_name
      WHERE f.tenant_id = $1 AND f.flakiness_rate >= $2
    `;
    const params: any[] = [tenantId, minRate];
    let paramIndex = 3;

    if (project) {
      query += ` AND f.project_id = $${paramIndex++}`;
      params.push(project);
    }

    query += ` ORDER BY f.flakiness_rate DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const { rows } = await dbManager.query(query, params);
    reply.send({ flakyTests: rows });
  } catch (error: any) {
    reply.status(500).send({ error: error.message });
  }
});

// Get flakiness trends over time
fastify.get('/api/v1/analytics/flakiness-trends', {
  onRequest: [fastify.authenticate],
  schema: {
    querystring: z.object({
      project: z.string().optional(),
      days: z.string().transform(Number).default('30'),
    }),
  },
}, async (request, reply) => {
  const { project, days = '30' } = request.query as any;
  const tenantId = request.headers['x-tenant-id'] as string;

  try {
    let query = `
      SELECT 
        detection_date,
        COUNT(*) as flaky_test_count,
        AVG(flakiness_rate) as avg_flakiness_rate
      FROM test_flakiness
      WHERE tenant_id = $1 
        AND detection_date >= CURRENT_DATE - INTERVAL '${days} days'
    `;
    const params: any[] = [tenantId];

    if (project) {
      query += ` AND project_id = $2`;
      params.push(project);
    }

    query += ` GROUP BY detection_date ORDER BY detection_date DESC`;

    const { rows } = await dbManager.query(query, params);
    reply.send({ trends: rows });
  } catch (error: any) {
    reply.status(500).send({ error: error.message });
  }
});

// Get specific test flakiness history
fastify.get('/api/v1/analytics/test-flakiness/:testFile/:testName', {
  onRequest: [fastify.authenticate],
}, async (request, reply) => {
  const { testFile, testName } = request.params as any;
  const tenantId = request.headers['x-tenant-id'] as string;

  try {
    const { rows } = await dbManager.query(
      `SELECT * FROM test_flakiness
       WHERE tenant_id = $1 AND test_file = $2 AND test_name = $3
       ORDER BY detection_date DESC
       LIMIT 30`,
      [tenantId, decodeURIComponent(testFile), decodeURIComponent(testName)]
    );

    reply.send({ history: rows });
  } catch (error: any) {
    reply.status(500).send({ error: error.message });
  }
});

// Trigger manual flakiness calculation
fastify.post('/api/v1/analytics/calculate-flakiness', {
  onRequest: [fastify.authenticate],
}, async (request, reply) => {
  try {
    // Run calculation asynchronously
    setImmediate(() => calculateFlakinessRates());
    
    reply.send({ 
      success: true, 
      message: 'Flakiness calculation started' 
    });
  } catch (error: any) {
    reply.status(500).send({ error: error.message });
  }
});

// Get flaky test recommendations
fastify.get('/api/v1/analytics/flaky-recommendations', {
  onRequest: [fastify.authenticate],
}, async (request, reply) => {
  const tenantId = request.headers['x-tenant-id'] as string;

  try {
    // Find tests with high flakiness that should be fixed or quarantined
    const { rows } = await dbManager.query(
      `SELECT 
        f.*,
        h.avg_duration_ms,
        h.last_failed_at
      FROM test_flakiness f
      LEFT JOIN test_history h ON 
        f.tenant_id = h.tenant_id AND 
        f.test_file = h.test_file AND 
        f.test_name = h.test_name
      WHERE f.tenant_id = $1 AND f.flakiness_rate >= 20
      ORDER BY f.flakiness_rate DESC
      LIMIT 20`,
      [tenantId]
    );

    const recommendations = rows.map(test => ({
      test: {
        file: test.test_file,
        name: test.test_name,
        flakinessRate: test.flakiness_rate,
      },
      severity: test.flakiness_rate >= 50 ? 'high' : test.flakiness_rate >= 30 ? 'medium' : 'low',
      recommendation: test.flakiness_rate >= 50 
        ? 'Consider quarantining this test or rewriting it' 
        : 'Investigate and fix flakiness issues',
      impact: `Failing ${test.flaky_runs} out of ${test.total_runs} runs`,
    }));

    reply.send({ recommendations });
  } catch (error: any) {
    reply.status(500).send({ error: error.message });
  }
});

// ============================================================
// CRON JOBS
// ============================================================

// Run flakiness calculation nightly at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('[FlakinessTracker] Running nightly flakiness calculation...');
  await calculateFlakinessRates();
  await updateTestHistoryFlakiness();
});

// ============================================================
// HEALTH CHECK
// ============================================================

fastify.get('/health', async (request, reply) => {
  try {
    await dbManager.query('SELECT 1');
    reply.send({ status: 'healthy', service: 'flakiness-tracker' });
  } catch (error) {
    reply.status(503).send({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

// ============================================================
// SERVER STARTUP
// ============================================================

const PORT = parseInt(process.env.PORT || '3025');

async function start() {
  try {
    await dbManager.initialize();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[FlakinessTracker] Server listening on port ${PORT}`);
    console.log('[FlakinessTracker] Cron job scheduled for nightly flakiness calculation');
  } catch (err) {
    console.error('[FlakinessTracker] Error starting server:', err);
    process.exit(1);
  }
}

start();
