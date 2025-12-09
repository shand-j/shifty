import { Page } from '@playwright/test';
import { DataTestIdRecoveryStrategy, HealingResult } from './strategies/data-testid-recovery';
import { TextContentMatchingStrategy } from './strategies/text-content-matching';
import { CSSHierarchyAnalysisStrategy } from './strategies/css-hierarchy-analysis';
import { AIPoweredAnalysisStrategy } from './strategies/ai-powered-analysis';

/**
 * Healing strategy interface
 */
export interface HealingStrategy {
  heal(page: Page, selector: string): Promise<HealingResult>;
  isApplicable(selector: string): boolean;
  getName(): string;
  healthCheck(page: Page): Promise<boolean>;
}

/**
 * Healing configuration
 */
export interface HealingConfig {
  enabled: boolean;
  strategies: string[];
  maxAttempts: number;
  cacheHealing: boolean;
  ollama?: {
    url: string;
    model: string;
    timeout: number;
  };
  retry?: {
    onTimeout: boolean;
    onFlakiness: boolean;
    maxRetries: number;
    initialBackoff: number;
  };
  telemetry?: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

/**
 * Default healing configuration
 */
export const DEFAULT_HEALING_CONFIG: HealingConfig = {
  enabled: true,
  strategies: [
    'data-testid-recovery',
    'text-content-matching',
    'css-hierarchy-analysis',
    'ai-powered-analysis'
  ],
  maxAttempts: 3,
  cacheHealing: true,
  ollama: {
    url: 'http://localhost:11434',
    model: 'llama3.1:8b',
    timeout: 30000
  },
  retry: {
    onTimeout: true,
    onFlakiness: true,
    maxRetries: 2,
    initialBackoff: 1000
  },
  telemetry: {
    enabled: true,
    logLevel: 'info'
  }
};

/**
 * Cache entry for healed selectors
 */
interface CacheEntry {
  originalSelector: string;
  healedSelector: string;
  confidence: number;
  strategy: string;
  timestamp: number;
  useCount: number;
}

/**
 * Flakiness tracking for selectors
 */
interface FlakinessRecord {
  selector: string;
  failureCount: number;
  successCount: number;
  lastFailure: number;
  isFlaky: boolean;
}

/**
 * Healing statistics
 */
export interface HealingStats {
  totalAttempts: number;
  successfulHeals: number;
  failedHeals: number;
  cacheHits: number;
  strategyUsage: Map<string, number>;
  averageConfidence: number;
  averageHealTime: number;
}

/**
 * Main Healing Engine
 * 
 * Orchestrates multiple healing strategies to automatically fix broken selectors.
 * Implements caching, flakiness detection, and strategy prioritization.
 */
export class HealingEngine {
  private config: HealingConfig;
  private strategies: Map<string, HealingStrategy>;
  private cache: Map<string, CacheEntry>;
  private flakinessRecords: Map<string, FlakinessRecord>;
  private stats: HealingStats;
  private healthStatus: Map<string, boolean>;

  constructor(config?: Partial<HealingConfig>) {
    this.config = { ...DEFAULT_HEALING_CONFIG, ...config };
    this.strategies = new Map();
    this.cache = new Map();
    this.flakinessRecords = new Map();
    this.healthStatus = new Map();
    
    this.stats = {
      totalAttempts: 0,
      successfulHeals: 0,
      failedHeals: 0,
      cacheHits: 0,
      strategyUsage: new Map(),
      averageConfidence: 0,
      averageHealTime: 0
    };

    this.initializeStrategies();
  }

  /**
   * Initialize healing strategies based on configuration
   */
  private initializeStrategies(): void {
    const strategyInstances: Array<[string, HealingStrategy]> = [
      ['data-testid-recovery', new DataTestIdRecoveryStrategy()],
      ['text-content-matching', new TextContentMatchingStrategy()],
      ['css-hierarchy-analysis', new CSSHierarchyAnalysisStrategy()],
      ['ai-powered-analysis', new AIPoweredAnalysisStrategy(this.config.ollama)]
    ];

    for (const [name, strategy] of strategyInstances) {
      if (this.config.strategies.includes(name)) {
        this.strategies.set(name, strategy);
        this.healthStatus.set(name, true); // Assume healthy initially
        this.log('info', `Initialized strategy: ${name}`);
      }
    }
  }

  /**
   * Logging with level support
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    if (!this.config.telemetry?.enabled) return;

    const configLevel = this.config.telemetry?.logLevel || 'info';
    const levels = ['debug', 'info', 'warn', 'error'];
    
    if (levels.indexOf(level) >= levels.indexOf(configLevel)) {
      const prefix = `[HealingEngine:${level.toUpperCase()}]`;
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Check cache for previously healed selector
   */
  private getCachedHealing(selector: string): CacheEntry | null {
    if (!this.config.cacheHealing) return null;

    const cached = this.cache.get(selector);
    if (!cached) return null;

    // Cache expires after 1 hour
    const cacheAge = Date.now() - cached.timestamp;
    if (cacheAge > 3600000) {
      this.cache.delete(selector);
      return null;
    }

    // Update use count
    cached.useCount++;
    this.stats.cacheHits++;
    
    this.log('info', `Cache hit for selector: ${selector} -> ${cached.healedSelector}`);
    return cached;
  }

  /**
   * Store healed selector in cache
   */
  private cacheHealing(
    originalSelector: string,
    healedSelector: string,
    confidence: number,
    strategy: string
  ): void {
    if (!this.config.cacheHealing) return;

    this.cache.set(originalSelector, {
      originalSelector,
      healedSelector,
      confidence,
      strategy,
      timestamp: Date.now(),
      useCount: 1
    });

    this.log('debug', `Cached healing: ${originalSelector} -> ${healedSelector}`);
  }

  /**
   * Track selector flakiness
   */
  private trackFlakiness(selector: string, success: boolean): void {
    let record = this.flakinessRecords.get(selector);
    
    if (!record) {
      record = {
        selector,
        failureCount: 0,
        successCount: 0,
        lastFailure: 0,
        isFlaky: false
      };
      this.flakinessRecords.set(selector, record);
    }

    if (success) {
      record.successCount++;
    } else {
      record.failureCount++;
      record.lastFailure = Date.now();
    }

    // Mark as flaky if failure rate > 30% and has multiple attempts
    const totalAttempts = record.failureCount + record.successCount;
    if (totalAttempts >= 5) {
      const failureRate = record.failureCount / totalAttempts;
      record.isFlaky = failureRate > 0.3 && failureRate < 0.7;
      
      if (record.isFlaky) {
        this.log('warn', `Selector marked as flaky: ${selector} (${(failureRate * 100).toFixed(1)}% failure rate)`);
      }
    }
  }

  /**
   * Check if selector is flaky
   */
  public isFlaky(selector: string): boolean {
    const record = this.flakinessRecords.get(selector);
    return record?.isFlaky || false;
  }

  /**
   * Run health check for all strategies
   */
  public async runHealthChecks(page: Page): Promise<Map<string, boolean>> {
    this.log('info', 'Running health checks for all strategies...');

    for (const [name, strategy] of this.strategies.entries()) {
      try {
        const isHealthy = await strategy.healthCheck(page);
        this.healthStatus.set(name, isHealthy);
        this.log('info', `Strategy ${name}: ${isHealthy ? 'healthy' : 'unhealthy'}`);
      } catch (error) {
        this.healthStatus.set(name, false);
        this.log('error', `Health check failed for ${name}: ${error}`);
      }
    }

    return new Map(this.healthStatus);
  }

  /**
   * Main healing method
   */
  public async heal(page: Page, selector: string): Promise<HealingResult> {
    if (!this.config.enabled) {
      return {
        success: false,
        selector,
        confidence: 0,
        strategy: 'none',
        reasoning: 'Healing is disabled',
        timestamp: Date.now()
      };
    }

    this.stats.totalAttempts++;
    const startTime = Date.now();

    this.log('info', `Attempting to heal selector: ${selector}`);

    // Check cache first
    const cached = this.getCachedHealing(selector);
    if (cached) {
      return {
        success: true,
        selector: cached.healedSelector,
        confidence: cached.confidence,
        strategy: `${cached.strategy} (cached)`,
        reasoning: `Retrieved from cache (used ${cached.useCount} times)`,
        timestamp: Date.now()
      };
    }

    // Try strategies in order of priority
    const prioritizedStrategies = this.getPrioritizedStrategies(selector);

    for (const [name, strategy] of prioritizedStrategies) {
      // Skip unhealthy strategies
      if (!this.healthStatus.get(name)) {
        this.log('warn', `Skipping unhealthy strategy: ${name}`);
        continue;
      }

      // Check if strategy is applicable
      if (!strategy.isApplicable(selector)) {
        this.log('debug', `Strategy ${name} not applicable to selector`);
        continue;
      }

      this.log('info', `Trying strategy: ${name}`);

      try {
        const result = await strategy.heal(page, selector);

        // Update strategy usage stats
        const currentUsage = this.stats.strategyUsage.get(name) || 0;
        this.stats.strategyUsage.set(name, currentUsage + 1);

        if (result.success) {
          // Update statistics
          this.stats.successfulHeals++;
          const healTime = Date.now() - startTime;
          this.stats.averageHealTime = 
            (this.stats.averageHealTime * (this.stats.successfulHeals - 1) + healTime) / 
            this.stats.successfulHeals;
          this.stats.averageConfidence =
            (this.stats.averageConfidence * (this.stats.successfulHeals - 1) + result.confidence) /
            this.stats.successfulHeals;

          // Cache the result
          this.cacheHealing(selector, result.selector, result.confidence, name);

          // Track success
          this.trackFlakiness(selector, true);

          this.log('info', `Successfully healed with ${name}: ${result.selector} (confidence: ${result.confidence}%)`);
          return result;
        }
      } catch (error) {
        this.log('error', `Strategy ${name} threw error: ${error}`);
        // Mark strategy as unhealthy if it throws errors
        this.healthStatus.set(name, false);
      }
    }

    // All strategies failed
    this.stats.failedHeals++;
    this.trackFlakiness(selector, false);

    this.log('warn', `All healing strategies failed for: ${selector}`);

    return {
      success: false,
      selector,
      confidence: 0,
      strategy: 'all-failed',
      reasoning: 'All healing strategies were unable to find a working alternative',
      timestamp: Date.now()
    };
  }

  /**
   * Get strategies prioritized for a specific selector
   */
  private getPrioritizedStrategies(selector: string): Array<[string, HealingStrategy]> {
    const strategies = Array.from(this.strategies.entries());

    // Custom priority order
    const priority: Record<string, number> = {
      'data-testid-recovery': 100,
      'text-content-matching': 80,
      'css-hierarchy-analysis': 60,
      'ai-powered-analysis': 40
    };

    // If selector has data-testid, prioritize that strategy
    if (selector.includes('data-testid') || selector.includes('data-test')) {
      priority['data-testid-recovery'] = 150;
    }

    // If selector has text, prioritize text matching
    if (selector.includes('text=') || selector.includes('has-text')) {
      priority['text-content-matching'] = 140;
    }

    return strategies.sort((a, b) => 
      (priority[b[0]] || 0) - (priority[a[0]] || 0)
    );
  }

  /**
   * Get healing statistics
   */
  public getStats(): HealingStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      totalAttempts: 0,
      successfulHeals: 0,
      failedHeals: 0,
      cacheHits: 0,
      strategyUsage: new Map(),
      averageConfidence: 0,
      averageHealTime: 0
    };
    this.log('info', 'Statistics reset');
  }

  /**
   * Clear healing cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.log('info', 'Cache cleared');
  }

  /**
   * Clear flakiness records
   */
  public clearFlakinessRecords(): void {
    this.flakinessRecords.clear();
    this.log('info', 'Flakiness records cleared');
  }

  /**
   * Get configuration
   */
  public getConfig(): HealingConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<HealingConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Reinitialize strategies if needed
    if (config.strategies || config.ollama) {
      this.strategies.clear();
      this.healthStatus.clear();
      this.initializeStrategies();
    }

    this.log('info', 'Configuration updated');
  }
}

// Export types
export type { HealingResult };
