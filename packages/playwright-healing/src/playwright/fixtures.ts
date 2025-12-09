import { test as base, Page } from '@playwright/test';
import { HealingPage } from './page-wrapper';
import { HealingConfig } from '../core/healer';
import { loadConfig } from '../config/healing-config';

/**
 * Healing test fixtures
 * 
 * Provides Playwright test fixtures with self-healing capabilities.
 * Drop-in replacement for @playwright/test
 */

interface HealingFixtures {
  healingPage: HealingPage;
  healingConfig: HealingConfig;
}

/**
 * Load healing configuration from environment and config file
 */
const getHealingConfig = (): Partial<HealingConfig> => {
  try {
    return loadConfig();
  } catch (error) {
    console.warn('[HealingFixtures] Failed to load config:', error);
    return {};
  }
};

/**
 * Healing test with fixtures
 */
export const healingTest = base.extend<HealingFixtures>({
  /**
   * Healing configuration fixture
   * Loaded once per test
   */
  healingConfig: async ({}, use) => {
    const config = getHealingConfig();
    const fullConfig: HealingConfig = {
      enabled: config.enabled ?? true,
      strategies: config.strategies ?? [
        'data-testid-recovery',
        'text-content-matching',
        'css-hierarchy-analysis',
        'ai-powered-analysis'
      ],
      maxAttempts: config.maxAttempts ?? 3,
      cacheHealing: config.cacheHealing ?? true,
      ollama: config.ollama ?? {
        url: 'http://localhost:11434',
        model: 'llama3.1:8b',
        timeout: 30000
      },
      retry: config.retry ?? {
        onTimeout: true,
        onFlakiness: true,
        maxRetries: 2,
        initialBackoff: 1000
      },
      telemetry: config.telemetry ?? {
        enabled: true,
        logLevel: 'info' as const
      }
    };

    await use(fullConfig);
  },

  /**
   * Healing page fixture
   * Provides a HealingPage instance that wraps the standard Playwright Page
   */
  healingPage: async ({ page, healingConfig }, use) => {
    const healingPage = new HealingPage(page, healingConfig);

    // Run initial health checks
    try {
      await page.goto('about:blank');
      await healingPage.healingEngine.runHealthChecks(page);
    } catch (error) {
      console.warn('[HealingFixtures] Health check failed:', error);
    }

    // Use the healing page
    await use(healingPage);

    // Report statistics at the end of the test
    const stats = healingPage.getHealingStats();
    
    if (stats.totalAttempts > 0) {
      console.log('\n[Healing Statistics]');
      console.log(`  Total healing attempts: ${stats.totalAttempts}`);
      console.log(`  Successful heals: ${stats.successfulHeals}`);
      console.log(`  Failed heals: ${stats.failedHeals}`);
      console.log(`  Cache hits: ${stats.cacheHits}`);
      console.log(`  Success rate: ${((stats.successfulHeals / stats.totalAttempts) * 100).toFixed(1)}%`);
      
      if (stats.successfulHeals > 0) {
        console.log(`  Average confidence: ${stats.averageConfidence.toFixed(1)}%`);
        console.log(`  Average heal time: ${stats.averageHealTime.toFixed(0)}ms`);
      }
      
      if (stats.strategyUsage.size > 0) {
        console.log('  Strategy usage:');
        stats.strategyUsage.forEach((count, strategy) => {
          console.log(`    - ${strategy}: ${count} times`);
        });
      }
    }
  }
});

/**
 * Export expect from Playwright for convenience
 */
export { expect } from '@playwright/test';

/**
 * Create a healing page from a standard Playwright page
 */
export function createHealingPage(
  page: Page,
  config?: Partial<HealingConfig>
): HealingPage {
  const mergedConfig = { ...getHealingConfig(), ...config };
  return new HealingPage(page, mergedConfig);
}

/**
 * Type exports for convenience
 */
export type { HealingPage, HealingConfig };
