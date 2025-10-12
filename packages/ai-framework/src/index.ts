import { test as base, expect, Page, Locator } from '@playwright/test';
import { SelectorHealer } from './healing/selector-healer';
import { AITestGenerator, TestGenerationOptions, GeneratedTest } from './generation/test-generator';
import { AnalyticsCollector } from './analytics/collector';

// Export classes for service usage
export { SelectorHealer } from './healing/selector-healer';
export { AITestGenerator, TestGenerationOptions, GeneratedTest } from './generation/test-generator';
export { AITestGenerator as TestGenerator } from './generation/test-generator';
export { AnalyticsCollector } from './analytics/collector';

// Extend Playwright test with AI capabilities
export const test = base.extend<{
  aiPage: Page & AIEnhancedPage;
  healer: SelectorHealer;
  generator: AITestGenerator;
  analytics: AnalyticsCollector;
}>({
  aiPage: async ({ page }, use) => {
    const healer = new SelectorHealer();
    const analytics = new AnalyticsCollector();
    
    const aiPage = Object.assign(page, {
      locatorWithHealing: (selector: string) => new AILocator(page, selector, healer),
      generateTest: (options: TestGenerationOptions) => new AITestGenerator().generate(options),
      trackAnalytics: (event: string, data: any) => analytics.track(event, data)
    });
    
    await use(aiPage as Page & AIEnhancedPage);
  },
  
  healer: async ({}, use) => {
    await use(new SelectorHealer());
  },
  
  generator: async ({}, use) => {
    await use(new AITestGenerator());
  },
  
  analytics: async ({}, use) => {
    await use(new AnalyticsCollector());
  }
});

// AI-Enhanced Page interface
export interface AIEnhancedPage {
  locatorWithHealing(selector: string): AILocator;
  generateTest(options: TestGenerationOptions): Promise<GeneratedTest>;
  trackAnalytics(event: string, data: any): void;
}

// AI-Enhanced Locator class
export class AILocator {
  constructor(
    private page: Page,
    private selector: string,
    private healer: SelectorHealer
  ) {}

  async click(options?: Parameters<Locator['click']>[0]) {
    try {
      const locator = this.page.locator(this.selector);
      await locator.click(options);
    } catch (error) {
      console.log(`🔧 Selector failed: ${this.selector}, attempting AI healing...`);
      const healedSelector = await this.healer.heal(this.page, this.selector);
      
      if (healedSelector) {
        console.log(`✅ Healed to: ${healedSelector}`);
        await this.page.locator(healedSelector).click(options);
      } else {
        throw error;
      }
    }
  }

  async fill(value: string, options?: Parameters<Locator['fill']>[1]) {
    try {
      const locator = this.page.locator(this.selector);
      await locator.fill(value, options);
    } catch (error) {
      console.log(`🔧 Selector failed: ${this.selector}, attempting AI healing...`);
      const healedSelector = await this.healer.heal(this.page, this.selector);
      
      if (healedSelector) {
        console.log(`✅ Healed to: ${healedSelector}`);
        await this.page.locator(healedSelector).fill(value, options);
      } else {
        throw error;
      }
    }
  }

  async isVisible() {
    try {
      return await this.page.locator(this.selector).isVisible();
    } catch (error) {
      const healedSelector = await this.healer.heal(this.page, this.selector);
      if (healedSelector) {
        return await this.page.locator(healedSelector).isVisible();
      }
      return false;
    }
  }

  async textContent() {
    try {
      return await this.page.locator(this.selector).textContent();
    } catch (error) {
      const healedSelector = await this.healer.heal(this.page, this.selector);
      if (healedSelector) {
        return await this.page.locator(healedSelector).textContent();
      }
      throw error;
    }
  }

  // Proxy other Locator methods as needed
  async waitFor(options?: Parameters<Locator['waitFor']>[0]) {
    try {
      return await this.page.locator(this.selector).waitFor(options);
    } catch (error) {
      const healedSelector = await this.healer.heal(this.page, this.selector);
      if (healedSelector) {
        return await this.page.locator(healedSelector).waitFor(options);
      }
      throw error;
    }
  }
}

export { expect } from '@playwright/test';