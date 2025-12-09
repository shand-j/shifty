/**
 * @shifty/playwright-healing
 * 
 * Autonomous selector healing for Playwright tests
 * 
 * @license MIT
 * @version 1.0.0
 */

// Core exports
export { HealingEngine, HealingConfig, HealingStats, HealingStrategy, DEFAULT_HEALING_CONFIG } from './core/healer';
export { HealingResult } from './core/strategies/data-testid-recovery';

// Strategy exports
export { DataTestIdRecoveryStrategy } from './core/strategies/data-testid-recovery';
export { TextContentMatchingStrategy } from './core/strategies/text-content-matching';
export { CSSHierarchyAnalysisStrategy } from './core/strategies/css-hierarchy-analysis';
export { AIPoweredAnalysisStrategy } from './core/strategies/ai-powered-analysis';

// Playwright integration exports
export { HealingPage } from './playwright/page-wrapper';
export { healingTest, expect, createHealingPage } from './playwright/fixtures';
export { RetryHandler, RetryConfig } from './playwright/retry-handler';

// Configuration exports
export {
  loadConfig,
  validateConfig,
  createSampleConfig,
  ENV_VAR_REFERENCE
} from './config/healing-config';
