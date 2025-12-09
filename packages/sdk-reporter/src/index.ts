/**
 * @shifty/sdk-reporter
 * 
 * Playwright reporter for Shifty test orchestration platform.
 * Streams test results in real-time during execution to the results service.
 * Compatible with Currents.dev reporter API patterns.
 */

import {
  Reporter,
  TestCase,
  TestResult,
  TestStep,
  FullConfig,
  Suite,
  TestError,
  FullResult,
} from '@playwright/test/reporter';
import { ShiftySDK, ShiftyConfig } from '@shifty/sdk-core';
import WebSocket from 'ws';

export interface ShiftyReporterConfig extends ShiftyConfig {
  /** Results service WebSocket URL */
  resultsServiceUrl?: string;
  /** Run ID for this test execution */
  runId?: string;
  /** Worker index for sharding */
  shardIndex?: number;
  /** Total number of workers */
  totalShards?: number;
  /** Batch size for result streaming (default: 10) */
  batchSize?: number;
  /** Enable artifact uploads */
  uploadArtifacts?: boolean;
  /** Artifact service URL */
  artifactServiceUrl?: string;
}

interface TestResultPayload {
  runId: string;
  testFile: string;
  testName: string;
  testTitle: string;
  shardIndex?: number;
  workerId: string;
  status: string;
  durationMs: number;
  retryCount: number;
  errorMessage?: string;
  errorStack?: string;
  traceUrl?: string;
  screenshotUrl?: string;
  videoUrl?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface TestStartPayload {
  runId: string;
  testFile: string;
  testName: string;
  shardIndex?: number;
  workerId: string;
  timestamp: string;
}

interface RunUpdatePayload {
  runId: string;
  status: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  timestamp: string;
}

/**
 * Shifty Playwright Reporter
 * 
 * Implements Playwright Reporter interface to stream test results
 * in real-time to the Shifty results service.
 */
export class ShiftyReporter implements Reporter {
  private sdk: ShiftySDK;
  private config: ShiftyReporterConfig;
  private ws: WebSocket | null = null;
  private resultBatch: TestResultPayload[] = [];
  private runId: string;
  private stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  };
  private startTime: number = 0;
  private workerId: string;

  constructor(config: Partial<ShiftyReporterConfig> = {}) {
    this.config = {
      ...config,
      apiUrl: config.apiUrl || process.env.SHIFTY_API_URL || 'http://localhost:3000',
      apiKey: config.apiKey || process.env.SHIFTY_API_KEY || '',
      tenantId: config.tenantId || process.env.SHIFTY_TENANT_ID || '',
      resultsServiceUrl: config.resultsServiceUrl || process.env.SHIFTY_RESULTS_WS_URL || 'ws://localhost:3023/ws',
      runId: config.runId || process.env.SHIFTY_RUN_ID,
      shardIndex: config.shardIndex ?? (process.env.SHIFTY_SHARD_INDEX ? Number.parseInt(process.env.SHIFTY_SHARD_INDEX) : undefined),
      totalShards: config.totalShards ?? (process.env.SHIFTY_TOTAL_SHARDS ? Number.parseInt(process.env.SHIFTY_TOTAL_SHARDS) : undefined),
      batchSize: config.batchSize ?? 10,
      uploadArtifacts: config.uploadArtifacts ?? (process.env.SHIFTY_UPLOAD_ARTIFACTS !== 'false'),
      artifactServiceUrl: config.artifactServiceUrl || process.env.SHIFTY_ARTIFACT_URL || 'http://localhost:3024',
    };

    this.sdk = new ShiftySDK({ config: this.config });
    this.runId = this.config.runId || this.generateRunId();
    this.workerId = process.env.PLAYWRIGHT_WORKER_ID || '0';

    // Initialize WebSocket connection
    this.connectWebSocket();
  }

  /**
   * Connect to results service via WebSocket
   */
  private connectWebSocket(): void {
    if (!this.config.resultsServiceUrl) {
      console.warn('[ShiftyReporter] Results service URL not configured, streaming disabled');
      return;
    }

    try {
      this.ws = new WebSocket(this.config.resultsServiceUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Tenant-ID': this.config.tenantId,
          'X-Run-ID': this.runId,
        },
      });

      this.ws.on('open', () => {
        console.log('[ShiftyReporter] Connected to results service');
      });

      this.ws.on('error', (error) => {
        console.error('[ShiftyReporter] WebSocket error:', error.message);
      });

      this.ws.on('close', () => {
        console.log('[ShiftyReporter] Disconnected from results service');
      });
    } catch (error) {
      console.error('[ShiftyReporter] Failed to connect to results service:', error);
    }
  }

  /**
   * Send message via WebSocket
   */
  private sendMessage(type: string, payload: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      this.ws.send(JSON.stringify({ type, payload }));
    } catch (error) {
      console.error('[ShiftyReporter] Failed to send message:', error);
    }
  }

  /**
   * Generate unique run ID
   */
  private generateRunId(): string {
    return `run_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Called once before running tests
   */
  onBegin(config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    const totalTests = suite.allTests().length;

    console.log(`[ShiftyReporter] Starting test run: ${this.runId}`);
    console.log(`[ShiftyReporter] Total tests: ${totalTests}`);
    console.log(`[ShiftyReporter] Shard: ${this.config.shardIndex}/${this.config.totalShards}`);

    this.stats.total = totalTests;

    this.sendMessage('run:start', {
      runId: this.runId,
      totalTests,
      shardIndex: this.config.shardIndex,
      totalShards: this.config.totalShards,
      workerId: this.workerId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Called for each test when it starts
   */
  onTestBegin(test: TestCase, result: TestResult): void {
    const payload: TestStartPayload = {
      runId: this.runId,
      testFile: test.location.file,
      testName: test.title,
      shardIndex: this.config.shardIndex,
      workerId: this.workerId,
      timestamp: new Date().toISOString(),
    };

    this.sendMessage('test:start', payload);
  }

  /**
   * Called for each test when it ends
   */
  async onTestEnd(test: TestCase, result: TestResult): Promise<void> {
    const status = result.status;
    
    // Update stats
    if (status === 'passed') this.stats.passed++;
    else if (status === 'failed') this.stats.failed++;
    else if (status === 'skipped' || status === 'interrupted') this.stats.skipped++;

    // Prepare result payload
    const payload: TestResultPayload = {
      runId: this.runId,
      testFile: test.location.file,
      testName: test.title,
      testTitle: test.titlePath().join(' › '),
      shardIndex: this.config.shardIndex,
      workerId: this.workerId,
      status,
      durationMs: result.duration,
      retryCount: result.retry,
      errorMessage: result.error?.message,
      errorStack: result.error?.stack,
      metadata: {
        annotations: test.annotations,
        tags: test.tags,
      },
      timestamp: new Date().toISOString(),
    };

    // Upload artifacts if enabled
    if (this.config.uploadArtifacts && result.attachments.length > 0) {
      await this.uploadArtifacts(test, result, payload);
    }

    // Add to batch
    this.resultBatch.push(payload);

    // Send batch if full
    if (this.resultBatch.length >= (this.config.batchSize || 10)) {
      await this.flushBatch();
    }
  }

  /**
   * Upload test artifacts (traces, screenshots, videos)
   */
  private async uploadArtifacts(
    test: TestCase,
    result: TestResult,
    payload: TestResultPayload
  ): Promise<void> {
    try {
      for (const attachment of result.attachments) {
        if (!attachment.path) continue;

        const formData = new FormData();
        const file = await import('fs').then(fs => fs.promises.readFile(attachment.path!));
        
        // Determine artifact type
        let artifactType = 'unknown';
        if (attachment.name.includes('trace')) artifactType = 'trace';
        else if (attachment.name.includes('screenshot')) artifactType = 'screenshot';
        else if (attachment.name.includes('video')) artifactType = 'video';

        // Upload to artifact service
        const response = await fetch(`${this.config.artifactServiceUrl}/api/v1/artifacts/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'X-Tenant-ID': this.config.tenantId,
            'X-Run-ID': this.runId,
            'Content-Type': 'application/octet-stream',
            'X-Artifact-Type': artifactType,
            'X-Artifact-Name': attachment.name,
          },
          body: file,
        });

        if (response.ok) {
          const data = await response.json() as { url?: string };
          
          // Add URL to payload
          if (artifactType === 'trace' && data.url) payload.traceUrl = data.url;
          else if (artifactType === 'screenshot' && data.url) payload.screenshotUrl = data.url;
          else if (artifactType === 'video' && data.url) payload.videoUrl = data.url;
        }
      }
    } catch (error) {
      console.error('[ShiftyReporter] Failed to upload artifacts:', error);
    }
  }

  /**
   * Flush batched results
   */
  private async flushBatch(): Promise<void> {
    if (this.resultBatch.length === 0) return;

    this.sendMessage('test:batch', {
      runId: this.runId,
      results: this.resultBatch,
    });

    this.resultBatch = [];
  }

  /**
   * Called after all tests complete
   */
  async onEnd(result: FullResult): Promise<void> {
    // Flush any remaining results
    await this.flushBatch();

    const duration = Date.now() - this.startTime;

    // Send final update
    const payload: RunUpdatePayload = {
      runId: this.runId,
      status: result.status === 'passed' ? 'completed' : 'failed',
      totalTests: this.stats.total,
      passedTests: this.stats.passed,
      failedTests: this.stats.failed,
      skippedTests: this.stats.skipped,
      timestamp: new Date().toISOString(),
    };

    this.sendMessage('run:end', payload);

    console.log(`[ShiftyReporter] Test run completed in ${duration}ms`);
    console.log(`[ShiftyReporter] Passed: ${this.stats.passed}, Failed: ${this.stats.failed}, Skipped: ${this.stats.skipped}`);

    // Close WebSocket
    if (this.ws) {
      this.ws.close();
    }

    // Shutdown SDK
    await this.sdk.shutdown();
  }

  /**
   * Called on errors (optional)
   */
  onError(error: TestError): void {
    console.error('[ShiftyReporter] Test error:', error.message);
    
    this.sendMessage('run:error', {
      runId: this.runId,
      error: {
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Export default for Playwright config
 */
export default ShiftyReporter;
