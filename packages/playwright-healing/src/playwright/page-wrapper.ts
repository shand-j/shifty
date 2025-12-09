import { Page, Locator } from '@playwright/test';
import { HealingEngine, HealingConfig } from '../core/healer';

/**
 * Healing Page Wrapper
 * 
 * Wraps Playwright's Page object to automatically heal broken selectors.
 * Provides the same API as Page but with self-healing capabilities.
 */
export class HealingPage {
  private page: Page;
  private engine: HealingEngine;
  private selectorCache: Map<string, string>;

  constructor(page: Page, config?: Partial<HealingConfig>) {
    this.page = page;
    this.engine = new HealingEngine(config);
    this.selectorCache = new Map();
  }

  /**
   * Get the underlying Playwright Page
   */
  get underlyingPage(): Page {
    return this.page;
  }

  /**
   * Get the healing engine
   */
  get healingEngine(): HealingEngine {
    return this.engine;
  }

  /**
   * Heal a selector if needed
   */
  private async healSelector(selector: string): Promise<string> {
    // Check cache first
    const cached = this.selectorCache.get(selector);
    if (cached) {
      return cached;
    }

    // Try original selector first
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      
      if (count > 0) {
        return selector; // Original works
      }
    } catch (error) {
      // Original selector failed, try healing
    }

    // Attempt healing
    const result = await this.engine.heal(this.page, selector);
    
    if (result.success) {
      this.selectorCache.set(selector, result.selector);
      return result.selector;
    }

    // Return original if healing failed
    return selector;
  }

  /**
   * Create a locator with auto-healing
   */
  locator(selector: string): Locator {
    const originalLocator = this.page.locator(selector);
    
    // Wrap locator methods to add healing
    return new Proxy(originalLocator, {
      get: (target, prop) => {
        const value = (target as any)[prop];
        
        // Methods that need healing
        const methodsToWrap = [
          'click', 'fill', 'type', 'press', 'check', 'uncheck',
          'selectOption', 'hover', 'focus', 'blur', 'clear',
          'isVisible', 'isHidden', 'isEnabled', 'isDisabled',
          'textContent', 'innerText', 'innerHTML', 'getAttribute'
        ];

        if (typeof value === 'function' && methodsToWrap.includes(prop as string)) {
          return async (...args: any[]) => {
            try {
              // Try with original selector
              return await value.apply(target, args);
            } catch (error) {
              // Try healing
              const healedSelector = await this.healSelector(selector);
              
              if (healedSelector !== selector) {
                // Use healed selector
                const healedLocator = this.page.locator(healedSelector);
                const healedMethod = (healedLocator as any)[prop];
                return await healedMethod.apply(healedLocator, args);
              }
              
              // Re-throw if healing didn't help
              throw error;
            }
          };
        }

        return value;
      }
    });
  }

  /**
   * Navigate to URL
   */
  async goto(url: string, options?: any): Promise<any> {
    return await this.page.goto(url, options);
  }

  /**
   * Wait for selector with auto-healing
   */
  async waitForSelector(selector: string, options?: any): Promise<any> {
    try {
      return await this.page.waitForSelector(selector, options);
    } catch (error) {
      const healedSelector = await this.healSelector(selector);
      if (healedSelector !== selector) {
        return await this.page.waitForSelector(healedSelector, options);
      }
      throw error;
    }
  }

  /**
   * Fill input with auto-healing
   */
  async fill(selector: string, value: string, options?: any): Promise<void> {
    const healedSelector = await this.healSelector(selector);
    return await this.page.fill(healedSelector, value, options);
  }

  /**
   * Click element with auto-healing
   */
  async click(selector: string, options?: any): Promise<void> {
    const healedSelector = await this.healSelector(selector);
    return await this.page.click(healedSelector, options);
  }

  /**
   * Type text with auto-healing
   */
  async type(selector: string, text: string, options?: any): Promise<void> {
    const healedSelector = await this.healSelector(selector);
    return await this.page.type(healedSelector, text, options);
  }

  /**
   * Get element text content with auto-healing
   */
  async textContent(selector: string, options?: any): Promise<string | null> {
    const healedSelector = await this.healSelector(selector);
    return await this.page.textContent(healedSelector, options);
  }

  /**
   * Check if element is visible with auto-healing
   */
  async isVisible(selector: string, options?: any): Promise<boolean> {
    const healedSelector = await this.healSelector(selector);
    return await this.page.isVisible(healedSelector, options);
  }

  /**
   * Get healing statistics
   */
  getHealingStats() {
    return this.engine.getStats();
  }

  /**
   * Clear selector cache
   */
  clearSelectorCache(): void {
    this.selectorCache.clear();
  }

  /**
   * Proxy all other Page methods
   */
  [key: string]: any;
}

// Proxy remaining Page methods
const pageMethods = [
  'url', 'title', 'content', 'screenshot', 'pdf', 'reload', 'goBack',
  'goForward', 'close', 'isClosed', 'evaluate', 'evaluateHandle',
  'waitForTimeout', 'waitForFunction', 'waitForLoadState', 'setContent',
  'setViewportSize', 'viewportSize', 'context', 'mainFrame', 'frames',
  'frame', 'addScriptTag', 'addStyleTag', 'mouse', 'keyboard', 'touchscreen'
];

pageMethods.forEach(method => {
  if (!(HealingPage.prototype as any)[method]) {
    (HealingPage.prototype as any)[method] = function(...args: any[]) {
      return (this.page as any)[method](...args);
    };
  }
});
