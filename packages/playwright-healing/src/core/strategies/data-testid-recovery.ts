import { Page } from '@playwright/test';

export interface HealingResult {
  success: boolean;
  selector: string;
  confidence: number;
  strategy: string;
  reasoning?: string;
  alternatives?: Array<{ selector: string; confidence: number }>;
  timestamp: number;
}

/**
 * Data Test ID Recovery Strategy
 * 
 * Attempts to find similar data-testid attributes using Levenshtein distance
 * and handles various naming conventions (kebab-case, snake_case, camelCase).
 * 
 * This strategy is highly reliable for finding test-specific attributes
 * that may have been slightly renamed or moved.
 */
export class DataTestIdRecoveryStrategy {
  private readonly attributeNames = [
    'data-testid',
    'data-test-id',
    'data-cy',
    'data-test',
    'testid',
    'test-id'
  ];

  /**
   * Calculate Levenshtein distance between two strings
   * Used for fuzzy matching of test IDs
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Calculate distances
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Calculate similarity score (0-100) based on Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);
    
    if (maxLength === 0) return 100;
    
    const similarity = ((maxLength - distance) / maxLength) * 100;
    return Math.max(0, Math.min(100, similarity));
  }

  /**
   * Normalize test ID to handle different naming conventions
   */
  private normalizeTestId(testId: string): string {
    return testId
      .toLowerCase()
      .replace(/[-_]/g, '')  // Remove separators
      .replace(/\s+/g, '');   // Remove spaces
  }

  /**
   * Extract test ID from a selector string
   */
  private extractTestIdFromSelector(selector: string): string | null {
    // Match patterns like [data-testid="value"] or [data-test-id='value']
    for (const attr of this.attributeNames) {
      const pattern = new RegExp(`\\[${attr}=["']([^"']+)["']\\]`, 'i');
      const match = selector.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Convert test ID between naming conventions
   */
  private convertNamingConvention(testId: string, format: 'kebab' | 'snake' | 'camel'): string {
    const words = testId.split(/[-_]|(?=[A-Z])/).filter(Boolean);
    
    switch (format) {
      case 'kebab':
        return words.join('-').toLowerCase();
      case 'snake':
        return words.join('_').toLowerCase();
      case 'camel':
        return words.map((w, i) => 
          i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        ).join('');
      default:
        return testId;
    }
  }

  /**
   * Attempt to heal a failed selector by finding similar test IDs
   */
  async heal(page: Page, originalSelector: string): Promise<HealingResult> {
    const timestamp = Date.now();
    const originalTestId = this.extractTestIdFromSelector(originalSelector);

    if (!originalTestId) {
      return {
        success: false,
        selector: originalSelector,
        confidence: 0,
        strategy: 'data-testid-recovery',
        reasoning: 'No data-testid attribute found in original selector',
        timestamp
      };
    }

    console.log(`[DataTestIdRecovery] Attempting to heal selector: ${originalSelector}`);
    console.log(`[DataTestIdRecovery] Extracted test ID: ${originalTestId}`);

    const alternatives: Array<{ selector: string; confidence: number }> = [];

    try {
      // Scan all elements with test ID attributes
      for (const attr of this.attributeNames) {
        const elements = await page.locator(`[${attr}]`).all();
        
        for (const element of elements) {
          const testId = await element.getAttribute(attr);
          if (!testId) continue;

          // Calculate similarity
          const directSimilarity = this.calculateSimilarity(originalTestId, testId);
          
          // Also check normalized versions
          const normalizedSimilarity = this.calculateSimilarity(
            this.normalizeTestId(originalTestId),
            this.normalizeTestId(testId)
          );

          // Check different naming conventions
          const conventions: Array<'kebab' | 'snake' | 'camel'> = ['kebab', 'snake', 'camel'];
          let maxConventionSimilarity = 0;
          
          for (const convention of conventions) {
            const convertedId = this.convertNamingConvention(originalTestId, convention);
            const similarity = this.calculateSimilarity(convertedId, testId);
            maxConventionSimilarity = Math.max(maxConventionSimilarity, similarity);
          }

          // Use the highest similarity score
          const confidence = Math.max(directSimilarity, normalizedSimilarity, maxConventionSimilarity);

          // Only consider matches with >70% similarity
          if (confidence > 70) {
            const newSelector = `[${attr}="${testId}"]`;
            alternatives.push({ selector: newSelector, confidence });
            
            console.log(`[DataTestIdRecovery] Found candidate: ${newSelector} (confidence: ${confidence.toFixed(2)}%)`);
          }
        }
      }

      // Sort by confidence (highest first)
      alternatives.sort((a, b) => b.confidence - a.confidence);

      if (alternatives.length > 0) {
        const best = alternatives[0];
        
        // Verify the element exists and is visible
        try {
          const element = page.locator(best.selector);
          const count = await element.count();
          
          if (count > 0) {
            console.log(`[DataTestIdRecovery] Successfully healed to: ${best.selector}`);
            return {
              success: true,
              selector: best.selector,
              confidence: best.confidence,
              strategy: 'data-testid-recovery',
              reasoning: `Found similar test ID with ${best.confidence.toFixed(2)}% confidence`,
              alternatives: alternatives.slice(0, 5), // Top 5 alternatives
              timestamp
            };
          }
        } catch (error) {
          console.log(`[DataTestIdRecovery] Candidate element not found: ${best.selector}`);
        }
      }

      return {
        success: false,
        selector: originalSelector,
        confidence: 0,
        strategy: 'data-testid-recovery',
        reasoning: 'No similar test IDs found with sufficient confidence',
        alternatives: alternatives.slice(0, 5),
        timestamp
      };

    } catch (error) {
      console.error(`[DataTestIdRecovery] Error during healing:`, error);
      return {
        success: false,
        selector: originalSelector,
        confidence: 0,
        strategy: 'data-testid-recovery',
        reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp
      };
    }
  }

  /**
   * Check if this strategy is applicable to the given selector
   */
  isApplicable(selector: string): boolean {
    return this.extractTestIdFromSelector(selector) !== null;
  }

  /**
   * Get strategy name
   */
  getName(): string {
    return 'data-testid-recovery';
  }

  /**
   * Perform health check for this strategy
   */
  async healthCheck(page: Page): Promise<boolean> {
    try {
      // Check if we can query elements with data-testid
      const elements = await page.locator('[data-testid]').count();
      return true; // Strategy is always healthy if no error is thrown
    } catch (error) {
      console.error('[DataTestIdRecovery] Health check failed:', error);
      return false;
    }
  }
}
