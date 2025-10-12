import { Page } from '@playwright/test';

export interface HealingStrategy {
  name: string;
  priority: number;
  heal(page: Page, originalSelector: string): Promise<string | null>;
}

export class SelectorHealer {
  private strategies: HealingStrategy[] = [];

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    this.strategies = [
      new DataTestStrategy(),
      new AriaLabelStrategy(), 
      new TextContentStrategy(),
      new SimilarElementStrategy(),
      new PositionalStrategy()
    ].sort((a, b) => b.priority - a.priority);
  }

  async heal(page: Page, originalSelector: string): Promise<string | null> {
    console.log(`🔧 Attempting to heal selector: ${originalSelector}`);
    
    for (const strategy of this.strategies) {
      try {
        const healedSelector = await strategy.heal(page, originalSelector);
        if (healedSelector) {
          // Verify the healed selector works
          const element = page.locator(healedSelector);
          if (await element.count() > 0) {
            console.log(`✅ Successfully healed using ${strategy.name}: ${healedSelector}`);
            return healedSelector;
          }
        }
      } catch (error) {
        console.log(`❌ ${strategy.name} strategy failed:`, error);
      }
    }

    console.log(`💔 All healing strategies failed for: ${originalSelector}`);
    return null;
  }
}

// Data-test attribute strategy (highest priority)
class DataTestStrategy implements HealingStrategy {
  name = 'data-test-attribute';
  priority = 10;

  async heal(page: Page, originalSelector: string): Promise<string | null> {
    // Try to find elements with data-test attributes
    const elements = await page.$$('[data-test], [data-testid], [data-cy]');
    
    for (const element of elements) {
      const dataTest = await element.getAttribute('data-test') || 
                      await element.getAttribute('data-testid') ||
                      await element.getAttribute('data-cy');
      
      if (dataTest) {
        const candidate = `[data-test="${dataTest}"], [data-testid="${dataTest}"], [data-cy="${dataTest}"]`;
        if (this.isSimilarElement(originalSelector, candidate)) {
          return `[data-test="${dataTest}"]`;
        }
      }
    }
    
    return null;
  }

  private isSimilarElement(original: string, candidate: string): boolean {
    // Simple similarity check - in production, use more sophisticated matching
    const originalWords = original.toLowerCase().split(/[-_\s]/);
    const candidateWords = candidate.toLowerCase().split(/[-_\s]/);
    
    return originalWords.some(word => 
      candidateWords.some(cWord => cWord.includes(word) || word.includes(cWord))
    );
  }
}

// ARIA label strategy
class AriaLabelStrategy implements HealingStrategy {
  name = 'aria-label';
  priority = 8;

  async heal(page: Page, originalSelector: string): Promise<string | null> {
    // Extract expected text from original selector
    const expectedText = this.extractTextFromSelector(originalSelector);
    if (!expectedText) return null;

    // Try aria-label
    const ariaElement = await page.locator(`[aria-label*="${expectedText}" i]`).first();
    if (await ariaElement.count() > 0) {
      return `[aria-label*="${expectedText}" i]`;
    }

    // Try aria-labelledby
    const labelledByElement = await page.locator(`[aria-labelledby*="${expectedText}" i]`).first();
    if (await labelledByElement.count() > 0) {
      return `[aria-labelledby*="${expectedText}" i]`;
    }

    return null;
  }

  private extractTextFromSelector(selector: string): string | null {
    // Extract text from selectors like 'button:has-text("Login")'
    const textMatch = selector.match(/:has-text\(["'](.+?)["']\)/i);
    if (textMatch) return textMatch[1];

    // Extract from class names
    const classMatch = selector.match(/\.([a-z-]+)/i);
    if (classMatch) return classMatch[1].replace(/-/g, ' ');

    return null;
  }
}

// Text content strategy
class TextContentStrategy implements HealingStrategy {
  name = 'text-content';
  priority = 6;

  async heal(page: Page, originalSelector: string): Promise<string | null> {
    const expectedText = this.extractTextFromSelector(originalSelector);
    if (!expectedText) return null;

    // Try exact text match
    const exactMatch = await page.locator(`text="${expectedText}"`).first();
    if (await exactMatch.count() > 0) {
      return `text="${expectedText}"`;
    }

    // Try partial text match
    const partialMatch = await page.locator(`text*="${expectedText}"`).first();
    if (await partialMatch.count() > 0) {
      return `text*="${expectedText}"`;
    }

    return null;
  }

  private extractTextFromSelector(selector: string): string | null {
    const textMatch = selector.match(/:has-text\(["'](.+?)["']\)/i);
    return textMatch ? textMatch[1] : null;
  }
}

// Similar element strategy
class SimilarElementStrategy implements HealingStrategy {
  name = 'similar-element';
  priority = 4;

  async heal(page: Page, originalSelector: string): Promise<string | null> {
    const tagName = this.extractTagName(originalSelector);
    if (!tagName) return null;

    // Find elements with the same tag name
    const elements = await page.$$(tagName);
    
    for (const element of elements) {
      const classList = await element.getAttribute('class');
      const id = await element.getAttribute('id');
      
      if (classList || id) {
        const candidate = id ? `#${id}` : `.${classList?.split(' ')[0]}`;
        return candidate;
      }
    }

    return null;
  }

  private extractTagName(selector: string): string | null {
    const tagMatch = selector.match(/^([a-z]+)/i);
    return tagMatch ? tagMatch[1] : null;
  }
}

// Positional strategy (last resort)
class PositionalStrategy implements HealingStrategy {
  name = 'positional';
  priority = 2;

  async heal(page: Page, originalSelector: string): Promise<string | null> {
    const tagName = this.extractTagName(originalSelector);
    if (!tagName) return null;

    // Try nth-child selectors
    const elements = await page.$$(tagName);
    if (elements.length > 0) {
      return `${tagName}:nth-child(1)`;
    }

    return null;
  }

  private extractTagName(selector: string): string | null {
    const tagMatch = selector.match(/^([a-z]+)/i);
    return tagMatch ? tagMatch[1] : null;
  }
}