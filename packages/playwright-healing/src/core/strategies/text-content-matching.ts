import { Page, Locator } from '@playwright/test';
import { HealingResult } from './data-testid-recovery';

/**
 * Text Content Matching Strategy
 * 
 * Finds elements by matching visible text content using fuzzy matching.
 * Considers element type, role, and context to improve accuracy.
 * 
 * This strategy is excellent for finding buttons, links, and labels
 * that have consistent text even when their selectors change.
 */
export class TextContentMatchingStrategy {
  private readonly minSimilarity = 80; // Minimum 80% similarity threshold
  private readonly interactiveRoles = [
    'button', 'link', 'checkbox', 'radio', 'textbox', 'combobox',
    'menuitem', 'tab', 'option', 'switch'
  ];

  /**
   * Calculate word overlap similarity between two strings
   */
  private calculateWordOverlap(str1: string, str2: string): number {
    const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 2));

    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return (intersection.size / union.size) * 100;
  }

  /**
   * Calculate character-level similarity (Jaro-Winkler inspired)
   */
  private calculateCharacterSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;

    // Check if one string contains the other
    if (s1.includes(s2) || s2.includes(s1)) {
      const shorter = Math.min(s1.length, s2.length);
      const longer = Math.max(s1.length, s2.length);
      return (shorter / longer) * 95; // High score for containment
    }

    // Simple character matching
    let matches = 0;
    const maxLen = Math.max(s1.length, s2.length);
    const minLen = Math.min(s1.length, s2.length);

    for (let i = 0; i < minLen; i++) {
      if (s1[i] === s2[i]) matches++;
    }

    return (matches / maxLen) * 100;
  }

  /**
   * Calculate fuzzy text similarity combining multiple algorithms
   */
  private calculateTextSimilarity(original: string, candidate: string): number {
    const wordOverlap = this.calculateWordOverlap(original, candidate);
    const charSimilarity = this.calculateCharacterSimilarity(original, candidate);

    // Weighted average: word overlap is more important for longer text
    const weight = original.split(/\s+/).length > 3 ? 0.7 : 0.4;
    return (wordOverlap * weight) + (charSimilarity * (1 - weight));
  }

  /**
   * Extract visible text from a selector if it contains text
   */
  private extractTextFromSelector(selector: string): string | null {
    // Match text() or has-text() patterns
    const textPatterns = [
      /text=["']([^"']+)["']/i,
      /text=([^,\]]+)/i,
      /has-text\(["']([^"']+)["']\)/i,
      /:has-text\(["']([^"']+)["']\)/i,
      />>.*text=["']([^"']+)["']/i
    ];

    for (const pattern of textPatterns) {
      const match = selector.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Get element tag name safely
   */
  private async getTagName(element: Locator): Promise<string | null> {
    try {
      return await element.evaluate(el => el.tagName.toLowerCase());
    } catch {
      return null;
    }
  }

  /**
   * Get element role safely
   */
  private async getRole(element: Locator): Promise<string | null> {
    try {
      return await element.getAttribute('role');
    } catch {
      return null;
    }
  }

  /**
   * Check if element is likely interactive
   */
  private async isInteractiveElement(element: Locator): Promise<boolean> {
    try {
      const tagName = await this.getTagName(element);
      const role = await this.getRole(element);

      const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
      
      const isInteractive = (
        (tagName !== null && interactiveTags.includes(tagName)) ||
        (role !== null && this.interactiveRoles.includes(role))
      );
      
      return isInteractive;
    } catch {
      return false;
    }
  }

  /**
   * Get all visible text content from an element
   */
  private async getElementText(element: Locator): Promise<string> {
    try {
      // Try innerText first (visible text only)
      const innerText = await element.innerText();
      if (innerText && innerText.trim()) {
        return innerText.trim();
      }

      // Fallback to textContent
      const textContent = await element.textContent();
      return (textContent || '').trim();
    } catch {
      return '';
    }
  }

  /**
   * Build a selector for an element based on its text
   */
  private async buildTextSelector(element: Locator, text: string): Promise<string> {
    try {
      const tagName = await this.getTagName(element);
      const role = await this.getRole(element);

      // Prefer role-based selectors for interactive elements
      if (role && this.interactiveRoles.includes(role)) {
        return `[role="${role}"]:has-text("${text}")`;
      }

      // Use tag-based selectors
      if (tagName) {
        const interactiveTags = ['button', 'a', 'input', 'select'];
        if (interactiveTags.includes(tagName)) {
          return `${tagName}:has-text("${text}")`;
        }
      }

      // Generic text selector as fallback
      return `text="${text}"`;
    } catch {
      return `text="${text}"`;
    }
  }

  /**
   * Check if element is visible
   */
  private async isVisible(element: Locator): Promise<boolean> {
    try {
      return await element.isVisible({ timeout: 1000 });
    } catch {
      return false;
    }
  }

  /**
   * Attempt to heal a failed selector using text content matching
   */
  async heal(page: Page, originalSelector: string): Promise<HealingResult> {
    const timestamp = Date.now();
    const originalText = this.extractTextFromSelector(originalSelector);

    if (!originalText) {
      return {
        success: false,
        selector: originalSelector,
        confidence: 0,
        strategy: 'text-content-matching',
        reasoning: 'No text content found in original selector',
        timestamp
      };
    }

    console.log(`[TextContentMatching] Attempting to heal selector: ${originalSelector}`);
    console.log(`[TextContentMatching] Extracted text: "${originalText}"`);

    const alternatives: Array<{ selector: string; confidence: number }> = [];

    try {
      // Get all visible elements with text content
      const allElements = await page.locator('body *').all();
      
      for (const element of allElements) {
        const elementText = await this.getElementText(element);
        if (!elementText) continue;

        // Calculate similarity
        const similarity = this.calculateTextSimilarity(originalText, elementText);

        // Only consider matches above threshold
        if (similarity >= this.minSimilarity) {
          const isVisible = await this.isVisible(element);
          if (!isVisible) continue;

          const isInteractive = await this.isInteractiveElement(element);
          
          // Boost confidence for interactive elements
          let confidence = similarity;
          if (isInteractive) {
            confidence = Math.min(100, similarity * 1.1);
          }

          const selector = await this.buildTextSelector(element, elementText);
          alternatives.push({ selector, confidence });

          console.log(`[TextContentMatching] Found candidate: "${elementText}" (confidence: ${confidence.toFixed(2)}%)`);
        }
      }

      // Also try partial text matches for longer text
      if (originalText.length > 20) {
        const words = originalText.split(/\s+/);
        const partialTexts = [
          words.slice(0, Math.ceil(words.length / 2)).join(' '),
          words.slice(-Math.ceil(words.length / 2)).join(' ')
        ];

        for (const partialText of partialTexts) {
          try {
            const partialElements = await page.locator(`text=${partialText}`).all();
            for (const element of partialElements) {
              const elementText = await this.getElementText(element);
              const similarity = this.calculateTextSimilarity(originalText, elementText);
              
              if (similarity >= this.minSimilarity - 10) { // Lower threshold for partial
                const isVisible = await this.isVisible(element);
                if (!isVisible) continue;

                const selector = await this.buildTextSelector(element, partialText);
                alternatives.push({ 
                  selector, 
                  confidence: similarity * 0.9 // Slightly lower confidence for partial
                });
              }
            }
          } catch {
            // Ignore errors with partial text
          }
        }
      }

      // Remove duplicates and sort by confidence
      const uniqueAlternatives = alternatives.reduce((acc, curr) => {
        const exists = acc.find(a => a.selector === curr.selector);
        if (!exists || exists.confidence < curr.confidence) {
          return [...acc.filter(a => a.selector !== curr.selector), curr];
        }
        return acc;
      }, [] as Array<{ selector: string; confidence: number }>);

      uniqueAlternatives.sort((a, b) => b.confidence - a.confidence);

      if (uniqueAlternatives.length > 0) {
        const best = uniqueAlternatives[0];

        // Verify the element can be located
        try {
          const element = page.locator(best.selector);
          const count = await element.count();

          if (count > 0) {
            console.log(`[TextContentMatching] Successfully healed to: ${best.selector}`);
            return {
              success: true,
              selector: best.selector,
              confidence: best.confidence,
              strategy: 'text-content-matching',
              reasoning: `Found element with matching text (${best.confidence.toFixed(2)}% similarity)`,
              alternatives: uniqueAlternatives.slice(0, 5),
              timestamp
            };
          }
        } catch (error) {
          console.log(`[TextContentMatching] Candidate element not accessible: ${best.selector}`);
        }
      }

      return {
        success: false,
        selector: originalSelector,
        confidence: 0,
        strategy: 'text-content-matching',
        reasoning: `No text matches found with >${this.minSimilarity}% similarity`,
        alternatives: uniqueAlternatives.slice(0, 5),
        timestamp
      };

    } catch (error) {
      console.error(`[TextContentMatching] Error during healing:`, error);
      return {
        success: false,
        selector: originalSelector,
        confidence: 0,
        strategy: 'text-content-matching',
        reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp
      };
    }
  }

  /**
   * Check if this strategy is applicable to the given selector
   */
  isApplicable(selector: string): boolean {
    return this.extractTextFromSelector(selector) !== null;
  }

  /**
   * Get strategy name
   */
  getName(): string {
    return 'text-content-matching';
  }

  /**
   * Perform health check for this strategy
   */
  async healthCheck(page: Page): Promise<boolean> {
    try {
      // Check if we can query text content
      const elements = await page.locator('body').count();
      return elements > 0;
    } catch (error) {
      console.error('[TextContentMatching] Health check failed:', error);
      return false;
    }
  }
}
