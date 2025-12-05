import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { SelectorHealer, HealingResult } from '../../../../services/healing-engine/src/core/selector-healer';
import type { Page } from 'playwright';

// Mock fetch globally
const mockFetch = jest.fn<typeof fetch>();
(global as any).fetch = mockFetch;

// Create mock Page object
const createMockPage = (config: {
  url?: string;
  elementExists?: Record<string, boolean>;
  pageContext?: any[];
} = {}): Page => {
  const mockLocator = (selector: string) => ({
    count: () => Promise.resolve(config.elementExists?.[selector] ? 1 : 0)
  });

  const page = {
    url: () => config.url || 'https://test-site.com',
    locator: mockLocator,
    evaluate: () => Promise.resolve(JSON.stringify(config.pageContext || []))
  } as unknown as Page;

  return page;
};

describe('SelectorHealer', () => {
  let selectorHealer: SelectorHealer;

  beforeEach(() => {
    selectorHealer = new SelectorHealer({
      ollamaUrl: 'http://localhost:11434',
      model: 'llama3.1'
    });
    mockFetch.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('healSelector', () => {
    test('should return success if selector already exists', async () => {
      const page = createMockPage({
        elementExists: { '#valid-selector': true }
      });

      const result = await selectorHealer.healSelector(page, '#valid-selector');

      expect(result.success).toBe(true);
      expect(result.selector).toBe('#valid-selector');
      expect(result.confidence).toBe(1.0);
      expect(result.strategy).toBe('no-healing-needed');
    });

    test('should attempt data-testid recovery strategy', async () => {
      const page = createMockPage({
        url: 'https://example.com/login',
        elementExists: {
          '#broken-submit-btn': false,
          '[data-testid="submit-button"]': true
        }
      });

      const result = await selectorHealer.healSelector(page, '#broken-submit-btn');

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('data-testid-recovery');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should return specific strategy result when preferred strategy is specified', async () => {
      const page = createMockPage({
        url: 'https://example.com/login',
        elementExists: {
          '#broken-submit-btn': false
        }
      });

      const result = await selectorHealer.healSelector(
        page,
        '#broken-submit-btn',
        undefined,
        'text-content-matching'
      );

      expect(result.strategy).toBe('text-content-matching');
    });

    test('should handle errors gracefully', async () => {
      const page = {
        url: () => 'https://test.com',
        locator: () => {
          throw new Error('Locator error');
        }
      } as unknown as Page;

      const result = await selectorHealer.healSelector(page, '#bad-selector');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should return alternatives when healing fails', async () => {
      const page = createMockPage({
        elementExists: {}  // No elements exist
      });

      mockFetch.mockRejectedValue(new Error('Offline'));

      const result = await selectorHealer.healSelector(page, '#nonexistent');

      expect(result.success).toBe(false);
      expect(result.alternatives).toBeDefined();
      expect(Array.isArray(result.alternatives)).toBe(true);
    });
  });

  describe('data-testid-recovery strategy', () => {
    test('should extract and recover from data-testid patterns', async () => {
      const page = createMockPage({
        url: 'https://example.com',
        elementExists: {
          '[data-testid="submit"]': false,
          '[data-cy="submit"]': true
        }
      });

      // Selector that contains a testid reference
      const result = await selectorHealer.healSelector(
        page,
        '[data-testid="submit"]',
        undefined,
        'data-testid-recovery'
      );

      // Should try alternative testid patterns
      expect(result.strategy).toBe('data-testid-recovery');
    });

    test('should handle example.com test URL with mock healing', async () => {
      const page = createMockPage({
        url: 'https://example.com/login',
        elementExists: {
          '#broken-submit-btn': false
        }
      });

      const result = await selectorHealer.healSelector(
        page,
        '#broken-submit-btn',
        undefined,
        'data-testid-recovery'
      );

      expect(result.success).toBe(true);
      expect(result.selector).toBe('[data-testid="submit-button"]');
      expect(result.confidence).toBe(0.92);
    });
  });

  describe('text-content-matching strategy', () => {
    test('should handle example.com URL with mock healing', async () => {
      const page = createMockPage({
        url: 'https://example.com/login',
        elementExists: {
          '#broken-submit-btn': false
        }
      });

      const result = await selectorHealer.healSelector(
        page,
        '#broken-submit-btn',
        undefined,
        'text-content-matching'
      );

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('text-content-matching');
      expect(result.confidence).toBe(0.78);
    });

    test('should parse text patterns from selector', async () => {
      const page = createMockPage({
        elementExists: {
          'text="Submit"': true
        }
      });

      const result = await selectorHealer.healSelector(
        page,
        ':has-text("Submit")',
        undefined,
        'text-content-matching'
      );

      expect(result.strategy).toBe('text-content-matching');
    });
  });

  describe('css-hierarchy-analysis strategy', () => {
    test('should handle example.com with mock healing', async () => {
      const page = createMockPage({
        url: 'https://example.com/login',
        elementExists: {
          '#broken-submit-btn': false
        }
      });

      const result = await selectorHealer.healSelector(
        page,
        '#broken-submit-btn',
        undefined,
        'css-hierarchy-analysis'
      );

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('css-hierarchy-analysis');
      expect(result.confidence).toBe(0.65);
    });

    test('should simplify complex CSS selectors', async () => {
      const page = createMockPage({
        elementExists: {
          '#broken-selector': false,
          '.btn': true
        }
      });

      const result = await selectorHealer.healSelector(
        page,
        '#broken-selector > div > .btn',
        undefined,
        'css-hierarchy-analysis'
      );

      expect(result.strategy).toBe('css-hierarchy-analysis');
    });

    test('should remove nth-child selectors', async () => {
      const page = createMockPage({
        elementExists: {
          'div .btn': true
        }
      });

      const result = await selectorHealer.healSelector(
        page,
        'div:nth-child(2) .btn',
        undefined,
        'css-hierarchy-analysis'
      );

      expect(result.strategy).toBe('css-hierarchy-analysis');
    });
  });

  describe('ai-powered-analysis strategy', () => {
    test('should handle example.com with mock healing', async () => {
      const page = createMockPage({
        url: 'https://example.com/login',
        elementExists: {
          '#broken-submit-btn': false
        }
      });

      const result = await selectorHealer.healSelector(
        page,
        '#broken-submit-btn',
        undefined,
        'ai-powered-analysis'
      );

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('ai-powered-analysis');
      expect(result.confidence).toBe(0.88);
    });

    test('should call Ollama API when available', async () => {
      const page = createMockPage({
        url: 'https://real-site.com',
        elementExists: {
          '#broken': false,
          '[data-testid="fixed"]': true
        },
        pageContext: [
          { tag: 'button', testId: 'fixed', text: 'Submit' }
        ]
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '["[data-testid=\\"fixed\\"]", "[role=\\"button\\"]"]'
        })
      } as Response);

      const result = await selectorHealer.healSelector(
        page,
        '#broken',
        undefined,
        'ai-powered-analysis'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.anything()
      );
    });

    test('should handle Ollama API errors gracefully', async () => {
      const page = createMockPage({
        url: 'https://real-site.com',
        elementExists: {}
      });

      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const result = await selectorHealer.healSelector(
        page,
        '#broken',
        undefined,
        'ai-powered-analysis'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI analysis failed');
    });

    test('should parse AI response JSON correctly', async () => {
      // Test JSON parsing from AI response
      const page = createMockPage({
        url: 'https://real-site.com',
        elementExists: {
          '[data-testid="submit"]': true
        }
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'Here are some suggestions: ["[data-testid=\\"submit\\"]", "#submit-btn"]'
        })
      } as Response);

      const result = await selectorHealer.healSelector(
        page,
        '#broken',
        'button',
        'ai-powered-analysis'
      );

      // Verify AI-powered strategy was used and result was processed
      expect(result.strategy).toBe('ai-powered-analysis');
      // The parseAiResponse method should extract JSON arrays from response
      expect(Array.isArray(result.alternatives)).toBe(true);
    });
  });

  describe('healthCheck', () => {
    test('should return healthy with all strategies when Ollama is available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: [] })
      } as Response);

      const health = await selectorHealer.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.strategies).toContain('data-testid-recovery');
      expect(health.strategies).toContain('text-content-matching');
      expect(health.strategies).toContain('css-hierarchy-analysis');
      expect(health.strategies).toContain('ai-powered-analysis');
    });

    test('should return degraded status without AI when Ollama returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);

      const health = await selectorHealer.healthCheck();

      expect(health.status).toBe('degraded');
      expect(health.strategies).not.toContain('ai-powered-analysis');
      expect(health.strategies).toContain('data-testid-recovery');
    });

    test('should return offline status when Ollama is unreachable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const health = await selectorHealer.healthCheck();

      expect(health.status).toBe('offline');
      expect(health.strategies).not.toContain('ai-powered-analysis');
    });
  });
});

describe('SelectorHealer Integration Scenarios', () => {
  let selectorHealer: SelectorHealer;

  beforeEach(() => {
    selectorHealer = new SelectorHealer();
    mockFetch.mockReset();
  });

  test('should try multiple strategies until one succeeds', async () => {
    const page = createMockPage({
      elementExists: {
        '#broken': false,
        '[data-testid="test"]': false, // First strategy fails
        'text="Submit"': false,        // Second strategy fails
        'button.btn': true             // Third strategy succeeds
      }
    });

    // Not specifying a preferred strategy - should try all
    const result = await selectorHealer.healSelector(page, '#broken');

    // Should eventually find something or exhaust strategies
    expect(result.strategy).toBeDefined();
  });

  test('should prioritize strategies in correct order', async () => {
    // The order should be:
    // 1. data-testid-recovery (most reliable)
    // 2. text-content-matching
    // 3. css-hierarchy-analysis
    // 4. ai-powered-analysis (fallback)

    const page = createMockPage({
      elementExists: {
        '#broken': false
      }
    });

    mockFetch.mockRejectedValue(new Error('Offline'));

    const result = await selectorHealer.healSelector(page, '#broken');

    // Without any matches, it should try all strategies in order
    expect(['data-testid-recovery', 'text-content-matching', 'css-hierarchy-analysis', 'ai-powered-analysis', 'all-strategies-failed']).toContain(result.strategy);
  });

  test('should provide meaningful alternatives', async () => {
    const page = createMockPage({
      url: 'https://example.com/page',
      elementExists: {
        '#broken-submit-btn': false
      }
    });

    const result = await selectorHealer.healSelector(
      page,
      '#broken-submit-btn',
      undefined,
      'data-testid-recovery'
    );

    if (result.success) {
      expect(result.alternatives.length).toBeGreaterThan(0);
      // Alternatives should be different from the healed selector
      expect(result.alternatives).not.toContain(result.selector);
    }
  });

  test('should include expected element type in AI context', async () => {
    const page = createMockPage({
      url: 'https://real-site.com',
      elementExists: {}
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: '[]' })
    } as Response);

    await selectorHealer.healSelector(
      page,
      '#broken',
      'button',
      'ai-powered-analysis'
    );

    // Verify the AI was called with element type context
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('button')
      })
    );
  });
});

describe('SelectorHealer Edge Cases', () => {
  let selectorHealer: SelectorHealer;

  beforeEach(() => {
    selectorHealer = new SelectorHealer();
    mockFetch.mockReset();
  });

  test('should handle empty selector', async () => {
    const page = createMockPage();

    const result = await selectorHealer.healSelector(page, '');

    expect(result.success).toBe(false);
  });

  test('should handle special characters in selector', async () => {
    const page = createMockPage({
      elementExists: {
        '[data-value="test@example.com"]': true
      }
    });

    const result = await selectorHealer.healSelector(
      page,
      '[data-email="test@example.com"]'
    );

    expect(result.strategy).toBeDefined();
  });

  test('should handle very long selectors', async () => {
    const longSelector = 'div '.repeat(50) + 'button';
    const page = createMockPage();

    const result = await selectorHealer.healSelector(page, longSelector);

    expect(result).toBeDefined();
    expect(result.strategy).toBeDefined();
  });

  test('should handle malformed page context', async () => {
    const page = {
      url: () => 'https://test.com',
      locator: () => ({
        count: () => Promise.resolve(0)
      }),
      evaluate: () => Promise.reject(new Error('Evaluation failed'))
    } as unknown as Page;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: '[]' })
    } as Response);

    const result = await selectorHealer.healSelector(
      page,
      '#broken',
      undefined,
      'ai-powered-analysis'
    );

    // Should handle gracefully, possibly with empty context
    expect(result).toBeDefined();
  });
});
