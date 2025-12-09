import { Page } from '@playwright/test';
import { HealingResult } from './data-testid-recovery';

interface OllamaRequest {
  model: string;
  prompt: string;
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

/**
 * AI-Powered Analysis Strategy
 * 
 * Uses Ollama's llama3.1:8b model to analyze page structure and suggest
 * intelligent healing alternatives based on semantic understanding of the DOM.
 * 
 * This strategy excels at understanding context and suggesting selectors
 * that align with the original intent of the test.
 */
export class AIPoweredAnalysisStrategy {
  private readonly ollamaUrl: string;
  private readonly model: string;
  private readonly timeout: number;

  constructor(config?: {
    ollamaUrl?: string;
    model?: string;
    timeout?: number;
  }) {
    this.ollamaUrl = config?.ollamaUrl || 'http://localhost:11434';
    this.model = config?.model || 'llama3.1:8b';
    this.timeout = config?.timeout || 30000;
  }

  /**
   * Call Ollama API with retry logic
   */
  private async callOllama(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const request: OllamaRequest = {
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.3, // Lower temperature for more consistent output
          top_p: 0.9,
          top_k: 40
        }
      };

      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as OllamaResponse;
      return data.response.trim();

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Ollama request timed out after ${this.timeout}ms`);
        }
        throw new Error(`Ollama API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Extract page context for AI analysis
   */
  private async extractPageContext(page: Page): Promise<{
    url: string;
    title: string;
    bodyText: string;
    interactiveElements: Array<{
      tag: string;
      text: string;
      id?: string;
      classes: string[];
      role?: string;
      type?: string;
    }>;
  }> {
    return await page.evaluate(() => {
      const url = (typeof window !== 'undefined' && window.location) ? window.location.href : '';
      const title = (typeof document !== 'undefined') ? document.title : '';
      const bodyText = (typeof document !== 'undefined' && document.body) ? document.body.innerText.slice(0, 500) : '';

      const interactiveElements: Array<{
        tag: string;
        text: string;
        id?: string;
        classes: string[];
        role?: string;
        type?: string;
      }> = [];

      if (typeof document === 'undefined') {
        return { url, title, bodyText, interactiveElements };
      }

      // Collect interactive elements
      const selectors = [
        'button', 'a', 'input', 'select', 'textarea',
        '[role="button"]', '[role="link"]', '[role="textbox"]'
      ];

      const elements = document.querySelectorAll(selectors.join(','));
      
      elements.forEach((el: Element, idx: number) => {
        if (idx > 50) return; // Limit to 50 elements
        
        const tag = el.tagName.toLowerCase();
        const text = (el.textContent || '').trim().slice(0, 50);
        const id = (el as HTMLElement).id || undefined;
        const classes = Array.from(el.classList) as string[];
        const role = el.getAttribute('role') || undefined;
        const type = el.getAttribute('type') || undefined;

        if (text || id || classes.length > 0) {
          interactiveElements.push({ tag, text, id, classes, role, type });
        }
      });

      return { url, title, bodyText, interactiveElements };
    });
  }

  /**
   * Parse AI response to extract selector suggestions
   */
  private parseAISuggestions(response: string): Array<{
    selector: string;
    confidence: number;
    reasoning: string;
  }> {
    const suggestions: Array<{ selector: string; confidence: number; reasoning: string }> = [];
    
    // Look for selector patterns in the response
    const lines = response.split('\n');
    
    for (const line of lines) {
      // Match patterns like: "1. #submit-btn (95% confidence) - ..."
      const pattern = /^[\d.-]*\s*([#.\[a-zA-Z][\w\-#.\[\]='":\s>+~*]*?)[\s]*(?:\((\d+)%?\s*(?:confidence)?\))?[\s]*[-–—:]?\s*(.*?)$/i;
      const match = line.match(pattern);
      
      if (match) {
        const selector = match[1].trim();
        const confidence = match[2] ? parseInt(match[2]) : 70;
        const reasoning = match[3] ? match[3].trim() : 'AI-suggested alternative';

        // Validate selector format
        if (this.isValidSelector(selector)) {
          suggestions.push({
            selector,
            confidence: Math.min(100, Math.max(0, confidence)),
            reasoning
          });
        }
      }
    }

    // If no structured suggestions found, try to extract any CSS selectors
    if (suggestions.length === 0) {
      const selectorPattern = /([#.][\w-]+|\[[\w-]+(?:=["'][^"']*["'])?\]|[\w-]+\[[\w-]+\])/g;
      const matches = response.matchAll(selectorPattern);
      
      for (const match of matches) {
        const selector = match[1];
        if (this.isValidSelector(selector)) {
          suggestions.push({
            selector,
            confidence: 60,
            reasoning: 'Extracted from AI response'
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Validate if a string is a valid CSS selector
   */
  private isValidSelector(selector: string): boolean {
    try {
      // Try to parse as CSS selector
      if (typeof document !== 'undefined') {
        document.querySelector(selector);
      }
      return (
        selector.length > 0 &&
        selector.length < 200 &&
        /^[#.\[a-zA-Z]/.test(selector)
      );
    } catch {
      return false;
    }
  }

  /**
   * Build AI prompt for healing
   */
  private buildHealingPrompt(
    originalSelector: string,
    context: {
      url: string;
      title: string;
      bodyText: string;
      interactiveElements: Array<{
        tag: string;
        text: string;
        id?: string;
        classes: string[];
        role?: string;
        type?: string;
      }>;
    }
  ): string {
    const elementsDescription = context.interactiveElements
      .slice(0, 20)
      .map(el => {
        const parts = [el.tag];
        if (el.id) parts.push(`id="${el.id}"`);
        if (el.classes.length > 0) parts.push(`class="${el.classes.slice(0, 2).join(' ')}"`);
        if (el.role) parts.push(`role="${el.role}"`);
        if (el.text) parts.push(`text="${el.text.slice(0, 30)}"`);
        return parts.join(' ');
      })
      .join('\n');

    return `You are a test automation expert analyzing a web page to heal a broken selector.

Page Context:
URL: ${context.url}
Title: ${context.title}
Page Preview: ${context.bodyText.slice(0, 200)}...

Interactive Elements Found:
${elementsDescription}

ORIGINAL SELECTOR (BROKEN): ${originalSelector}

Task: Suggest 3-5 alternative CSS selectors that might work for the same element.

Requirements:
1. Each suggestion should be on a new line starting with a number
2. Format: "1. <selector> (confidence%) - reasoning"
3. Order by confidence (highest first)
4. Consider semantic meaning and likely test intent
5. Prefer stable selectors (data-testid, role, unique classes over nth-child)

Example format:
1. #submit-button (95%) - Unique ID suggests submit action
2. button[type="submit"] (85%) - Semantic button type
3. .btn-primary (70%) - Primary action class pattern

Your suggestions:`;
  }

  /**
   * Attempt to heal using AI-powered analysis
   */
  async heal(page: Page, originalSelector: string): Promise<HealingResult> {
    const timestamp = Date.now();

    console.log(`[AIPowered] Attempting to heal selector: ${originalSelector}`);
    console.log(`[AIPowered] Using Ollama at ${this.ollamaUrl} with model ${this.model}`);

    try {
      // Check if Ollama is available
      const healthCheck = await fetch(`${this.ollamaUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000)
      }).catch(() => null);

      if (!healthCheck || !healthCheck.ok) {
        console.warn(`[AIPowered] Ollama not available at ${this.ollamaUrl}`);
        return {
          success: false,
          selector: originalSelector,
          confidence: 0,
          strategy: 'ai-powered-analysis',
          reasoning: `Ollama service not available at ${this.ollamaUrl}`,
          timestamp
        };
      }

      // Extract page context
      const context = await this.extractPageContext(page);
      
      // Build AI prompt
      const prompt = this.buildHealingPrompt(originalSelector, context);
      
      console.log(`[AIPowered] Sending request to AI model...`);
      
      // Get AI suggestions
      const aiResponse = await this.callOllama(prompt);
      
      console.log(`[AIPowered] Received AI response`);
      console.log(`[AIPowered] Response preview: ${aiResponse.slice(0, 200)}...`);

      // Parse suggestions from AI response
      const suggestions = this.parseAISuggestions(aiResponse);

      if (suggestions.length === 0) {
        return {
          success: false,
          selector: originalSelector,
          confidence: 0,
          strategy: 'ai-powered-analysis',
          reasoning: 'AI did not suggest valid alternatives',
          timestamp
        };
      }

      console.log(`[AIPowered] Found ${suggestions.length} AI suggestions`);

      // Verify each suggestion on the page
      const verifiedAlternatives: Array<{ selector: string; confidence: number }> = [];

      for (const suggestion of suggestions) {
        try {
          const elements = await page.locator(suggestion.selector).all();
          
          if (elements.length > 0) {
            const isVisible = await elements[0].isVisible().catch(() => false);
            
            if (isVisible) {
              console.log(`[AIPowered] Verified: ${suggestion.selector} (${suggestion.confidence}%)`);
              verifiedAlternatives.push({
                selector: suggestion.selector,
                confidence: suggestion.confidence
              });
            } else {
              console.log(`[AIPowered] Element found but not visible: ${suggestion.selector}`);
            }
          } else {
            console.log(`[AIPowered] Element not found: ${suggestion.selector}`);
          }
        } catch (error) {
          console.log(`[AIPowered] Invalid selector: ${suggestion.selector}`);
        }
      }

      if (verifiedAlternatives.length > 0) {
        const best = verifiedAlternatives[0];
        const bestSuggestion = suggestions.find(s => s.selector === best.selector);

        console.log(`[AIPowered] Successfully healed to: ${best.selector}`);

        return {
          success: true,
          selector: best.selector,
          confidence: best.confidence,
          strategy: 'ai-powered-analysis',
          reasoning: bestSuggestion?.reasoning || 'AI-suggested alternative selector',
          alternatives: verifiedAlternatives.slice(0, 5),
          timestamp
        };
      }

      return {
        success: false,
        selector: originalSelector,
        confidence: 0,
        strategy: 'ai-powered-analysis',
        reasoning: 'AI suggestions could not be verified on the page',
        alternatives: suggestions.map(s => ({
          selector: s.selector,
          confidence: s.confidence
        })).slice(0, 5),
        timestamp
      };

    } catch (error) {
      console.error(`[AIPowered] Error during healing:`, error);
      return {
        success: false,
        selector: originalSelector,
        confidence: 0,
        strategy: 'ai-powered-analysis',
        reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp
      };
    }
  }

  /**
   * Check if this strategy is applicable
   */
  isApplicable(selector: string): boolean {
    // AI strategy can be applied to any selector
    return selector.length > 0;
  }

  /**
   * Get strategy name
   */
  getName(): string {
    return 'ai-powered-analysis';
  }

  /**
   * Perform health check
   */
  async healthCheck(page: Page): Promise<boolean> {
    try {
      // Check if Ollama is available
      const response = await fetch(`${this.ollamaUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        console.warn('[AIPowered] Ollama service not responding correctly');
        return false;
      }

      const data = await response.json() as { models?: Array<{ name: string }> };
      
      // Check if the required model is available
      const models = data.models || [];
      const hasModel = models.some((m: any) => m.name.includes(this.model.split(':')[0]));
      
      if (!hasModel) {
        console.warn(`[AIPowered] Model ${this.model} not found in Ollama`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[AIPowered] Health check failed:', error);
      return false;
    }
  }
}
