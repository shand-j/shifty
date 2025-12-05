/**
 * @shifty/sdk-playwright
 * 
 * Playwright fixtures and auto-healing hooks for Shifty AI-Powered Testing Platform
 * Provides shiftyTest wrapper with self-healing selectors and automatic screenshot uploads.
 */

import { test as base, Page, Locator, expect } from '@playwright/test';
import { ShiftySDK, ShiftyConfig } from '@shifty/sdk-core';

// ============================================================
// CONFIGURATION
// ============================================================

export interface ShiftyPlaywrightConfig extends ShiftyConfig {
  /** Auto-heal broken selectors during test execution */
  autoHeal?: boolean;
  /** Upload screenshots on test failure */
  uploadScreenshots?: boolean;
  /** Healing strategy preference */
  healingStrategy?: 'data-testid-recovery' | 'text-content-matching' | 'css-hierarchy-analysis' | 'ai-powered-analysis';
  /** Maximum healing attempts per selector */
  maxHealingAttempts?: number;
}

// ============================================================
// SHIFTY FIXTURES
// ============================================================

export interface ShiftyFixtures {
  /** Shifty SDK instance */
  shifty: ShiftySDK;
  /** Page with self-healing locator methods */
  shiftyPage: ShiftyPage;
  /** Test configuration */
  shiftyConfig: ShiftyPlaywrightConfig;
}

/**
 * Extended Page class with self-healing selector capabilities
 */
export class ShiftyPage {
  private sdk: ShiftySDK;
  private page: Page;
  private config: ShiftyPlaywrightConfig;
  private healingCache: Map<string, string> = new Map();

  constructor(page: Page, sdk: ShiftySDK, config: ShiftyPlaywrightConfig) {
    this.page = page;
    this.sdk = sdk;
    this.config = config;
  }

  /**
   * Get a locator with auto-healing support
   */
  async locator(selector: string, options?: { expectedType?: string }): Promise<Locator> {
    // Check if we have a cached healed selector
    if (this.healingCache.has(selector)) {
      const healedSelector = this.healingCache.get(selector)!;
      return this.page.locator(healedSelector);
    }

    // Try the original selector first
    const locator = this.page.locator(selector);
    const count = await locator.count().catch(() => 0);

    if (count > 0) {
      return locator;
    }

    // Attempt to heal if auto-heal is enabled
    if (this.config.autoHeal !== false) {
      const healedSelector = await this.healSelector(selector, options?.expectedType);
      if (healedSelector) {
        this.healingCache.set(selector, healedSelector);
        return this.page.locator(healedSelector);
      }
    }

    // Return original locator (will fail with proper error message)
    return locator;
  }

  /**
   * Attempt to heal a broken selector
   */
  async healSelector(brokenSelector: string, expectedType?: string): Promise<string | null> {
    try {
      const result = await this.sdk.api.healSelector({
        url: this.page.url(),
        brokenSelector,
        expectedElementType: expectedType,
        strategy: this.config.healingStrategy
      });

      if (result.success && result.healedSelector) {
        this.sdk.telemetry.emitEvent({
          eventType: 'selector_healed',
          attributes: {
            original_selector: brokenSelector,
            healed_selector: result.healedSelector,
            confidence: result.confidence,
            strategy: result.strategy
          }
        });

        return result.healedSelector;
      }

      return null;
    } catch (error) {
      console.warn(`Selector healing failed for "${brokenSelector}":`, error);
      return null;
    }
  }

  /**
   * Navigate to URL with telemetry
   */
  async goto(url: string, options?: Parameters<Page['goto']>[1]): Promise<ReturnType<Page['goto']>> {
    this.sdk.telemetry.emitEvent({
      eventType: 'page_navigation',
      attributes: { url }
    });
    return this.page.goto(url, options);
  }

  /**
   * Click with auto-healing
   */
  async click(selector: string, options?: Parameters<Locator['click']>[0]): Promise<void> {
    const locator = await this.locator(selector);
    await locator.click(options);
  }

  /**
   * Fill with auto-healing
   */
  async fill(selector: string, value: string, options?: Parameters<Locator['fill']>[1]): Promise<void> {
    const locator = await this.locator(selector);
    await locator.fill(value, options);
  }

  /**
   * Type with auto-healing
   */
  async type(selector: string, text: string, options?: Parameters<Locator['type']>[1]): Promise<void> {
    const locator = await this.locator(selector);
    await locator.type(text, options);
  }

  /**
   * Take screenshot and optionally upload to Shifty
   */
  async screenshot(options?: Parameters<Page['screenshot']>[0] & { upload?: boolean }): Promise<Buffer> {
    const buffer = await this.page.screenshot(options);
    
    if (options?.upload !== false && this.config.uploadScreenshots) {
      await this.uploadScreenshot(buffer);
    }
    
    return buffer;
  }

  /**
   * Upload screenshot to Shifty
   */
  private async uploadScreenshot(buffer: Buffer): Promise<void> {
    try {
      const headers = await this.sdk.auth.getAuthHeaders();
      await fetch(`${this.config.apiUrl}/api/v1/artifacts/screenshots`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/octet-stream'
        },
        body: buffer
      });
    } catch (error) {
      console.warn('Failed to upload screenshot:', error);
    }
  }

  /**
   * Get the underlying Playwright Page
   */
  getPage(): Page {
    return this.page;
  }

  /**
   * Clear the healing cache
   */
  clearHealingCache(): void {
    this.healingCache.clear();
  }
}

// ============================================================
// TEST EXTENSION
// ============================================================

/**
 * Create Shifty-enhanced test with fixtures
 */
export function createShiftyTest(config: ShiftyPlaywrightConfig) {
  return base.extend<ShiftyFixtures>({
    shiftyConfig: [config, { option: true }],

    shifty: async ({}, use) => {
      const sdk = new ShiftySDK({ config });
      await use(sdk);
      await sdk.shutdown();
    },

    shiftyPage: async ({ page, shifty, shiftyConfig }, use) => {
      const shiftyPage = new ShiftyPage(page, shifty, shiftyConfig);
      await use(shiftyPage);
    }
  });
}

/**
 * Default Shifty test using environment variables
 */
export const shiftyTest = createShiftyTest({
  apiUrl: process.env.SHIFTY_API_URL || 'http://localhost:3000',
  apiKey: process.env.SHIFTY_API_KEY || '',
  tenantId: process.env.SHIFTY_TENANT_ID || '',
  autoHeal: process.env.SHIFTY_AUTO_HEAL !== 'false',
  uploadScreenshots: process.env.SHIFTY_UPLOAD_SCREENSHOTS === 'true'
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Helper to wrap existing tests with Shifty auto-healing
 */
export function withShiftyHealing(
  testFn: (shiftyPage: ShiftyPage) => Promise<void>,
  options?: { config?: Partial<ShiftyPlaywrightConfig> }
) {
  return async ({ shiftyPage }: { shiftyPage: ShiftyPage }) => {
    await testFn(shiftyPage);
  };
}

/**
 * Assertion helpers with auto-healing
 */
export const shiftyExpect = {
  async toBeVisible(shiftyPage: ShiftyPage, selector: string, options?: { timeout?: number }) {
    const locator = await shiftyPage.locator(selector);
    await expect(locator).toBeVisible(options);
  },

  async toHaveText(shiftyPage: ShiftyPage, selector: string, text: string | RegExp, options?: { timeout?: number }) {
    const locator = await shiftyPage.locator(selector);
    await expect(locator).toHaveText(text, options);
  },

  async toHaveValue(shiftyPage: ShiftyPage, selector: string, value: string | RegExp, options?: { timeout?: number }) {
    const locator = await shiftyPage.locator(selector);
    await expect(locator).toHaveValue(value, options);
  },

  async toBeEnabled(shiftyPage: ShiftyPage, selector: string, options?: { timeout?: number }) {
    const locator = await shiftyPage.locator(selector);
    await expect(locator).toBeEnabled(options);
  },

  async toBeDisabled(shiftyPage: ShiftyPage, selector: string, options?: { timeout?: number }) {
    const locator = await shiftyPage.locator(selector);
    await expect(locator).toBeDisabled(options);
  }
};

// ============================================================
// EXPORTS
// ============================================================

export { expect } from '@playwright/test';
export type { Page, Locator } from '@playwright/test';
