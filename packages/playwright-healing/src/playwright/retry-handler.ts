import { TestInfo } from '@playwright/test';
import { HealingEngine } from '../core/healer';

/**
 * Retry configuration
 */
export interface RetryConfig {
  onTimeout: boolean;
  onFlakiness: boolean;
  maxRetries: number;
  initialBackoff: number;
}

/**
 * Retry context for tracking attempts
 */
interface RetryContext {
  selector: string;
  attempts: number;
  lastError?: Error;
  lastAttemptTime: number;
}

/**
 * Retry Handler
 * 
 * Handles intelligent retries for flaky tests with exponential backoff.
 * Integrates with the healing engine to detect and fix flaky selectors.
 */
export class RetryHandler {
  private config: RetryConfig;
  private engine: HealingEngine;
  private retryContexts: Map<string, RetryContext>;

  constructor(engine: HealingEngine, config?: Partial<RetryConfig>) {
    this.engine = engine;
    this.config = {
      onTimeout: config?.onTimeout ?? true,
      onFlakiness: config?.onFlakiness ?? true,
      maxRetries: config?.maxRetries ?? 2,
      initialBackoff: config?.initialBackoff ?? 1000
    };
    this.retryContexts = new Map();
  }

  /**
   * Check if error is a timeout error
   */
  private isTimeoutError(error: Error): boolean {
    const timeoutPatterns = [
      /timeout/i,
      /waiting for selector/i,
      /exceeded while waiting/i,
      /page\..*?: timeout/i
    ];

    return timeoutPatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Check if error is related to selector not found
   */
  private isSelectorError(error: Error): boolean {
    const selectorPatterns = [
      /selector.*not found/i,
      /element.*not found/i,
      /no element matches selector/i,
      /unable to find element/i,
      /could not find element/i
    ];

    return selectorPatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Extract selector from error message if possible
   */
  private extractSelector(error: Error): string | null {
    // Try to extract selector from common error patterns
    const patterns = [
      /selector "([^"]+)"/i,
      /selector '([^']+)'/i,
      /locator\("([^"]+)"\)/i,
      /waiting for selector "([^"]+)"/i
    ];

    for (const pattern of patterns) {
      const match = error.message.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Calculate backoff time with exponential increase
   */
  private calculateBackoff(attemptNumber: number): number {
    // Exponential backoff: initialBackoff * 2^attemptNumber
    const backoff = this.config.initialBackoff * Math.pow(2, attemptNumber - 1);
    
    // Add jitter (±20%) to avoid thundering herd
    const jitter = backoff * 0.2 * (Math.random() * 2 - 1);
    
    // Cap at 10 seconds
    return Math.min(backoff + jitter, 10000);
  }

  /**
   * Wait for backoff period
   */
  private async waitForBackoff(attemptNumber: number): Promise<void> {
    const backoffMs = this.calculateBackoff(attemptNumber);
    console.log(`[RetryHandler] Waiting ${backoffMs.toFixed(0)}ms before retry...`);
    await new Promise(resolve => setTimeout(resolve, backoffMs));
  }

  /**
   * Execute function with retry logic
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    context: {
      selector?: string;
      testInfo?: TestInfo;
    } = {}
  ): Promise<T> {
    const { selector, testInfo } = context;
    const contextKey = selector || 'default';

    // Initialize retry context
    if (!this.retryContexts.has(contextKey)) {
      this.retryContexts.set(contextKey, {
        selector: contextKey,
        attempts: 0,
        lastAttemptTime: Date.now()
      });
    }

    const retryContext = this.retryContexts.get(contextKey)!;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        retryContext.attempts++;
        retryContext.lastAttemptTime = Date.now();

        const result = await fn();
        
        // Success - clear retry context
        this.retryContexts.delete(contextKey);
        
        return result;
      } catch (error) {
        const err = error as Error;
        retryContext.lastError = err;

        console.log(`[RetryHandler] Attempt ${attempt + 1}/${this.config.maxRetries + 1} failed: ${err.message}`);

        // Check if we should retry
        const isTimeout = this.isTimeoutError(err);
        const isSelectorIssue = this.isSelectorError(err);
        const shouldRetry = 
          (this.config.onTimeout && isTimeout) ||
          (this.config.onFlakiness && isSelectorIssue);

        if (!shouldRetry || attempt >= this.config.maxRetries) {
          // No more retries - throw error
          console.log(`[RetryHandler] All retry attempts exhausted`);
          throw err;
        }

        // Try to extract and heal selector
        if (isSelectorIssue && selector) {
          console.log(`[RetryHandler] Detected selector issue, checking flakiness...`);
          
          const isFlaky = this.engine.isFlaky(selector);
          if (isFlaky) {
            console.log(`[RetryHandler] Selector is known to be flaky: ${selector}`);
          }
        }

        // Wait before retrying
        await this.waitForBackoff(attempt + 1);

        console.log(`[RetryHandler] Retrying (attempt ${attempt + 2}/${this.config.maxRetries + 1})...`);
      }
    }

    // Should never reach here, but TypeScript requires it
    throw retryContext.lastError || new Error('Retry failed');
  }

  /**
   * Get retry statistics for a selector
   */
  getRetryStats(selector: string): {
    attempts: number;
    lastError?: string;
    lastAttemptTime: number;
  } | null {
    const context = this.retryContexts.get(selector);
    if (!context) return null;

    return {
      attempts: context.attempts,
      lastError: context.lastError?.message,
      lastAttemptTime: context.lastAttemptTime
    };
  }

  /**
   * Clear retry contexts
   */
  clearRetryContexts(): void {
    this.retryContexts.clear();
  }

  /**
   * Update retry configuration
   */
  updateConfig(config: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[RetryHandler] Configuration updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): RetryConfig {
    return { ...this.config };
  }
}
