/**
 * Test Execution Worker
 * 
 * Consumes test execution jobs from BullMQ queue.
 * Executes Playwright tests with auto-healing integration.
 * Reports results back to results service in real-time.
 */

import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import fetch from 'node-fetch';

const execAsync = promisify(exec);

// Configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const HEALING_ENGINE_URL = process.env.HEALING_ENGINE_URL || 'http://localhost:3005';
const RESULTS_SERVICE_URL = process.env.RESULTS_SERVICE_URL || 'http://localhost:3023';
const WORKER_ID = process.env.WORKER_ID || `worker-${Math.random().toString(36).substring(7)}`;

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

interface TestJob {
  runId: string;
  tenantId: string;
  shardIndex: number;
  totalShards: number;
  testFiles: string[];
  project?: string;
  branch?: string;
  commitSha?: string;
}

interface HealingAttempt {
  testFile: string;
  testName: string;
  originalSelector: string;
  healedSelector?: string;
  confidence?: number;
  success: boolean;
  strategy?: string;
  executionTime: number;
  error?: string;
}

/**
 * Create Playwright config for test execution
 */
async function createPlaywrightConfig(job: TestJob): Promise<string> {
  const config = `
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker per shard
  reporter: [
    ['list'],
    ['@shifty/sdk-reporter', {
      apiUrl: '${RESULTS_SERVICE_URL}',
      apiKey: process.env.SHIFTY_API_KEY,
      tenantId: '${job.tenantId}',
      runId: '${job.runId}',
      shardIndex: ${job.shardIndex},
      totalShards: ${job.totalShards},
      uploadArtifacts: true,
    }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
`;

  const configPath = join(process.cwd(), 'playwright.config.ts');
  await writeFile(configPath, config);
  return configPath;
}

/**
 * Download test files for this shard
 */
async function downloadTestFiles(job: TestJob): Promise<void> {
  // In production, fetch test files from repository or artifact storage
  // For now, assume tests are provided in job data or available locally
  console.log(`[Worker ${WORKER_ID}] Test files for shard ${job.shardIndex}:`, job.testFiles);
  
  // Create tests directory
  await mkdir(join(process.cwd(), 'tests'), { recursive: true });
  
  // Note: In real implementation, you would:
  // 1. Clone repository at specific commit SHA
  // 2. Or download test files from artifact storage
  // 3. Or receive test code in job payload
}

/**
 * Execute tests with Playwright
 */
async function executeTests(job: TestJob): Promise<{ success: boolean; error?: string }> {
  try {
    await downloadTestFiles(job);
    await createPlaywrightConfig(job);

    // Build test file pattern
    const testPattern = job.testFiles.map(f => `"${f}"`).join(' ');

    // Execute Playwright
    const command = `npx playwright test ${testPattern} --shard=${job.shardIndex + 1}/${job.totalShards}`;
    
    console.log(`[Worker ${WORKER_ID}] Executing: ${command}`);

    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        SHIFTY_API_KEY: process.env.SHIFTY_API_KEY,
        SHIFTY_RUN_ID: job.runId,
        SHIFTY_SHARD_INDEX: job.shardIndex.toString(),
        SHIFTY_TOTAL_SHARDS: job.totalShards.toString(),
        PLAYWRIGHT_WORKER_ID: WORKER_ID,
      },
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    });

    console.log(`[Worker ${WORKER_ID}] Tests completed successfully`);
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);

    return { success: true };
  } catch (error: any) {
    console.error(`[Worker ${WORKER_ID}] Test execution failed:`, error.message);
    
    // Playwright returns non-zero exit code for test failures (which is normal)
    // Check if it's a genuine execution error or just failed tests
    if (error.code && error.stdout) {
      // Tests ran but some failed - this is expected
      console.log(error.stdout);
      return { success: true };
    }

    return { success: false, error: error.message };
  }
}

/**
 * Attempt selector healing for failed test
 */
async function attemptHealing(
  tenantId: string,
  runId: string,
  testFile: string,
  testName: string,
  selector: string,
  pageUrl: string
): Promise<HealingAttempt> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${HEALING_ENGINE_URL}/api/v1/healing/heal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        url: pageUrl,
        brokenSelector: selector,
        strategy: 'auto', // Let healing engine choose best strategy
      }),
    });

    if (!response.ok) {
      throw new Error(`Healing request failed: ${response.statusText}`);
    }

    const result = await response.json();
    const executionTime = Date.now() - startTime;

    // Save healing event to database
    await saveHealingEvent(tenantId, runId, testFile, testName, {
      originalSelector: selector,
      healedSelector: result.healedSelector,
      confidence: result.confidence,
      success: result.success,
      strategy: result.strategy,
      executionTime,
    });

    return {
      testFile,
      testName,
      originalSelector: selector,
      healedSelector: result.healedSelector,
      confidence: result.confidence,
      success: result.success,
      strategy: result.strategy,
      executionTime,
    };
  } catch (error: any) {
    const executionTime = Date.now() - startTime;

    // Save failed healing attempt
    await saveHealingEvent(tenantId, runId, testFile, testName, {
      originalSelector: selector,
      success: false,
      executionTime,
      error: error.message,
    });

    return {
      testFile,
      testName,
      originalSelector: selector,
      success: false,
      executionTime,
      error: error.message,
    };
  }
}

/**
 * Save healing event to database
 */
async function saveHealingEvent(
  tenantId: string,
  runId: string,
  testFile: string,
  testName: string,
  healing: Partial<HealingAttempt>
): Promise<void> {
  try {
    await fetch(`${RESULTS_SERVICE_URL}/api/v1/healing/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        runId,
        testFile,
        testName,
        ...healing,
      }),
    });
  } catch (error) {
    console.error('[Worker] Failed to save healing event:', error);
  }
}

/**
 * Update shard status in database
 */
async function updateShardStatus(
  runId: string,
  shardIndex: number,
  status: 'running' | 'completed' | 'failed',
  duration?: number
): Promise<void> {
  try {
    await fetch(`${RESULTS_SERVICE_URL}/api/v1/shards/${runId}/${shardIndex}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        workerId: WORKER_ID,
        actualDuration: duration,
      }),
    });
  } catch (error) {
    console.error('[Worker] Failed to update shard status:', error);
  }
}

/**
 * Process test execution job
 */
async function processJob(job: Job<TestJob>): Promise<void> {
  const { runId, tenantId, shardIndex } = job.data;
  const startTime = Date.now();

  console.log(`[Worker ${WORKER_ID}] Starting job for run ${runId}, shard ${shardIndex}`);

  try {
    // Update shard status to running
    await updateShardStatus(runId, shardIndex, 'running');

    // Execute tests
    const result = await executeTests(job.data);

    const duration = Date.now() - startTime;

    if (result.success) {
      await updateShardStatus(runId, shardIndex, 'completed', duration);
      console.log(`[Worker ${WORKER_ID}] Job completed in ${duration}ms`);
    } else {
      await updateShardStatus(runId, shardIndex, 'failed', duration);
      throw new Error(result.error || 'Test execution failed');
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    await updateShardStatus(runId, shardIndex, 'failed', duration);
    console.error(`[Worker ${WORKER_ID}] Job failed:`, error.message);
    throw error;
  }
}

// ============================================================
// WORKER INITIALIZATION
// ============================================================

const worker = new Worker('test-execution', processJob, {
  connection: redis,
  concurrency: 1, // Process one job at a time per worker
  limiter: {
    max: 10,
    duration: 1000, // Max 10 jobs per second
  },
});

worker.on('completed', (job) => {
  console.log(`[Worker ${WORKER_ID}] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker ${WORKER_ID}] Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error(`[Worker ${WORKER_ID}] Worker error:`, err);
});

console.log(`[Worker ${WORKER_ID}] Started and waiting for jobs...`);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log(`[Worker ${WORKER_ID}] SIGTERM received, shutting down gracefully...`);
  await worker.close();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log(`[Worker ${WORKER_ID}] SIGINT received, shutting down gracefully...`);
  await worker.close();
  await redis.quit();
  process.exit(0);
});
