import { DatabaseManager } from '@shifty/database';
import { OllamaService, OllamaGenerateRequest } from './ollama.service.js';

interface SelectorHealingRequest {
  brokenSelector: string;
  pageUrl: string;
  expectedElementType?: string;
  context?: {
    previouslyWorking: boolean;
    errorMessage?: string;
    browserType: 'chromium' | 'firefox' | 'webkit';
    screenshot?: string;
  };
}

interface HealingSuggestion {
  selector: string;
  confidence: number;
  strategy: string;
  reasoning: string;
}

interface SelectorHealingResult {
  success: boolean;
  suggestions: HealingSuggestion[];
  recommendedSelector?: string;
  confidence: number;
  analysisTime: number;
  strategy: string;
  metadata: {
    originalSelector: string;
    pageUrl: string;
    timestamp: string;
  };
}

export class SelectorHealingService {
  private ollama: OllamaService;
  private dbManager: DatabaseManager;
  private defaultModel: string;

  constructor(ollamaService: OllamaService, dbManager: DatabaseManager) {
    this.ollama = ollamaService;
    this.dbManager = dbManager;
    this.defaultModel = process.env.AI_MODEL || 'llama3.1';
  }

  async healSelector(tenantId: string, request: SelectorHealingRequest): Promise<SelectorHealingResult> {
    console.log(`🔧 Healing selector for tenant: ${tenantId}`);
    const startTime = Date.now();
    
    try {
      // Analyze the broken selector
      const analysis = await this.analyzeSelector(request);
      
      // Generate healing suggestions using AI
      const aiSuggestions = await this.generateAISuggestions(request, analysis);
      
      // Apply rule-based healing strategies
      const ruleSuggestions = this.applyRuleBasedStrategies(request.brokenSelector);
      
      // Combine and rank suggestions
      const allSuggestions = [...aiSuggestions, ...ruleSuggestions];
      const rankedSuggestions = this.rankSuggestions(allSuggestions);
      
      // Select best recommendation
      const recommendedSelector = rankedSuggestions.length > 0 ? 
        rankedSuggestions[0].selector : undefined;
      
      const confidence = rankedSuggestions.length > 0 ? 
        rankedSuggestions[0].confidence : 0;
      
      const analysisTime = Date.now() - startTime;
      
      // Log healing attempt
      await this.logHealingAttempt(tenantId, request, rankedSuggestions, analysisTime);

      return {
        success: rankedSuggestions.length > 0,
        suggestions: rankedSuggestions.slice(0, 5), // Top 5 suggestions
        recommendedSelector,
        confidence,
        analysisTime,
        strategy: rankedSuggestions.length > 0 ? rankedSuggestions[0].strategy : 'none',
        metadata: {
          originalSelector: request.brokenSelector,
          pageUrl: request.pageUrl,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error: any) {
      console.error('Selector healing failed:', error);
      throw new Error(`Selector healing failed: ${error.message}`);
    }
  }

  async batchHealSelectors(tenantId: string, requests: SelectorHealingRequest[]): Promise<SelectorHealingResult[]> {
    console.log(`🔄 Batch healing ${requests.length} selectors for tenant: ${tenantId}`);

    // Process requests in parallel with concurrency limit
    const concurrency = 3;
    const results: SelectorHealingResult[] = [];

    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const batchPromises = batch.map(request => this.healSelector(tenantId, request));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Batch healing failed for request ${i + index}:`, result.reason);
          results.push({
            success: false,
            suggestions: [],
            confidence: 0,
            analysisTime: 0,
            strategy: 'error',
            metadata: {
              originalSelector: batch[index].brokenSelector,
              pageUrl: batch[index].pageUrl,
              timestamp: new Date().toISOString()
            }
          });
        }
      });
    }

    return results;
  }

  private async analyzeSelector(request: SelectorHealingRequest): Promise<any> {
    // Analyze selector structure and extract information
    const analysis = {
      selectorType: this.getSelectorType(request.brokenSelector),
      hasDataTestId: request.brokenSelector.includes('data-testid') || request.brokenSelector.includes('data-test-id'),
      hasClasses: request.brokenSelector.includes('.') && !request.brokenSelector.includes('[class'),
      hasIds: request.brokenSelector.includes('#'),
      hasAttributes: request.brokenSelector.includes('[') && request.brokenSelector.includes(']'),
      hasText: request.brokenSelector.includes('text=') || request.brokenSelector.includes(':has-text'),
      complexity: this.calculateSelectorComplexity(request.brokenSelector),
      likelyIssues: this.identifyLikelyIssues(request.brokenSelector, request.context)
    };

    return analysis;
  }

  private async generateAISuggestions(request: SelectorHealingRequest, analysis: any): Promise<HealingSuggestion[]> {
    const prompt = `You are an expert Playwright test engineer specializing in selector healing and maintenance.

**Broken Selector:** ${request.brokenSelector}
**Page URL:** ${request.pageUrl}
**Expected Element:** ${request.expectedElementType || 'unknown'}
**Previously Working:** ${request.context?.previouslyWorking ? 'Yes' : 'No'}
${request.context?.errorMessage ? `**Error:** ${request.context.errorMessage}` : ''}

**Selector Analysis:**
- Type: ${analysis.selectorType}
- Has data-testid: ${analysis.hasDataTestId}
- Has classes: ${analysis.hasClasses}
- Has IDs: ${analysis.hasIds}
- Complexity: ${analysis.complexity}/10

**Task:** Provide 3-5 alternative selectors that might work for the same element.

**Guidelines:**
1. Prioritize data-testid and role-based selectors
2. Avoid fragile selectors (nth-child, specific classes)
3. Consider text-based selectors if appropriate
4. Explain the reasoning for each suggestion
5. Rate confidence (0.1-0.9) for each suggestion

**Response Format:**
For each suggestion, provide:
\`\`\`
Selector: [proposed selector]
Confidence: [0.1-0.9]
Strategy: [strategy name]
Reasoning: [why this might work]
\`\`\`

Focus on practical, robust selectors that are likely to work.`;

    try {
      const response = await this.ollama.generate({
        model: this.defaultModel,
        prompt,
        options: {
          temperature: 0.3,
          max_tokens: 1500
        }
      });

      return this.parseAISuggestions(response.response);

    } catch (error) {
      console.warn('AI suggestion generation failed:', error);
      return [];
    }
  }

  private applyRuleBasedStrategies(brokenSelector: string): HealingSuggestion[] {
    const suggestions: HealingSuggestion[] = [];

    // Strategy 1: Remove nth-child selectors
    if (brokenSelector.includes(':nth-child(')) {
      const withoutNthChild = brokenSelector.replace(/:nth-child\(\d+\)/g, '');
      if (withoutNthChild.trim() && withoutNthChild !== brokenSelector) {
        suggestions.push({
          selector: withoutNthChild,
          confidence: 0.7,
          strategy: 'remove-nth-child',
          reasoning: 'Removed brittle nth-child selector'
        });
      }
    }

    // Strategy 2: Extract data-testid if present
    const testIdMatch = brokenSelector.match(/\[data-testid[~=]*["']([^"']+)["']\]/);
    if (testIdMatch) {
      suggestions.push({
        selector: `[data-testid="${testIdMatch[1]}"]`,
        confidence: 0.9,
        strategy: 'extract-testid',
        reasoning: 'Extracted and simplified data-testid selector'
      });
    }

    // Strategy 3: Convert complex selectors to simpler forms
    if (brokenSelector.includes(' > ')) {
      const simplified = brokenSelector.replace(/ > /g, ' ');
      suggestions.push({
        selector: simplified,
        confidence: 0.6,
        strategy: 'simplify-hierarchy',
        reasoning: 'Simplified parent-child relationship to descendant'
      });
    }

    // Strategy 4: Extract text content if present
    const textMatch = brokenSelector.match(/text=["']([^"']+)["']/);
    if (textMatch) {
      suggestions.push({
        selector: `text="${textMatch[1]}"`,
        confidence: 0.8,
        strategy: 'extract-text',
        reasoning: 'Extracted text-based selector'
      });
    }

    // Strategy 5: Try role-based alternatives for common elements
    if (brokenSelector.includes('button') || brokenSelector.includes('[type="button"]')) {
      suggestions.push({
        selector: '[role="button"]',
        confidence: 0.7,
        strategy: 'role-based',
        reasoning: 'Alternative role-based button selector'
      });
    }

    return suggestions;
  }

  private parseAISuggestions(response: string): HealingSuggestion[] {
    const suggestions: HealingSuggestion[] = [];
    
    // Split response into sections
    const sections = response.split(/```\s*\n?/).filter(section => section.trim());
    
    for (const section of sections) {
      const selectorMatch = section.match(/Selector:\s*(.+)/i);
      const confidenceMatch = section.match(/Confidence:\s*([0-9.]+)/i);
      const strategyMatch = section.match(/Strategy:\s*(.+)/i);
      const reasoningMatch = section.match(/Reasoning:\s*(.+)/i);

      if (selectorMatch) {
        suggestions.push({
          selector: selectorMatch[1].trim(),
          confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
          strategy: strategyMatch ? strategyMatch[1].trim() : 'ai-generated',
          reasoning: reasoningMatch ? reasoningMatch[1].trim() : 'AI-generated suggestion'
        });
      }
    }

    return suggestions;
  }

  private rankSuggestions(suggestions: HealingSuggestion[]): HealingSuggestion[] {
    return suggestions
      .filter(s => s.selector.trim().length > 0)
      .sort((a, b) => {
        // Primary sort: confidence
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        
        // Secondary sort: strategy preference
        const strategyPriority = {
          'extract-testid': 10,
          'role-based': 9,
          'extract-text': 8,
          'ai-generated': 7,
          'remove-nth-child': 6,
          'simplify-hierarchy': 5
        };
        
        const aPriority = strategyPriority[a.strategy as keyof typeof strategyPriority] || 0;
        const bPriority = strategyPriority[b.strategy as keyof typeof strategyPriority] || 0;
        
        return bPriority - aPriority;
      })
      .slice(0, 5); // Keep top 5
  }

  private getSelectorType(selector: string): string {
    if (selector.includes('data-testid') || selector.includes('data-test-id')) return 'data-testid';
    if (selector.includes('[role=')) return 'role';
    if (selector.includes('text=')) return 'text';
    if (selector.includes('#')) return 'id';
    if (selector.includes('.') && !selector.includes('[class')) return 'class';
    if (selector.includes('[')) return 'attribute';
    if (selector.match(/^[a-z-]+$/i)) return 'tag';
    return 'complex';
  }

  private calculateSelectorComplexity(selector: string): number {
    let complexity = 0;
    
    // Count complexity factors
    complexity += (selector.match(/ /g) || []).length; // Spaces
    complexity += (selector.match(/>/g) || []).length; // Direct children
    complexity += (selector.match(/\+/g) || []).length; // Siblings
    complexity += (selector.match(/~/g) || []).length; // General siblings
    complexity += (selector.match(/:/g) || []).length; // Pseudo-selectors
    complexity += (selector.match(/\[/g) || []).length; // Attributes
    
    return Math.min(complexity, 10);
  }

  private identifyLikelyIssues(selector: string, context?: SelectorHealingRequest['context']): string[] {
    const issues: string[] = [];
    
    if (selector.includes(':nth-child(')) {
      issues.push('Contains brittle nth-child selectors');
    }
    
    if (selector.includes('#') && !selector.includes('[id=')) {
      issues.push('Uses ID selector - may have changed');
    }
    
    if (selector.split(' ').length > 4) {
      issues.push('Complex selector hierarchy');
    }
    
    if (context?.previouslyWorking && !context.errorMessage?.includes('timeout')) {
      issues.push('Element may have been removed or changed');
    }
    
    if (selector.includes('.') && selector.split('.').length > 3) {
      issues.push('Multiple CSS classes - may be fragile');
    }
    
    return issues;
  }

  private async logHealingAttempt(
    tenantId: string, 
    request: SelectorHealingRequest, 
    suggestions: HealingSuggestion[],
    analysisTime: number
  ): Promise<void> {
    try {
      console.log(`📝 Logging selector healing for tenant ${tenantId}`);
      
      // For MVP, just console log
      // In production, this would store in tenant's database
      console.log({
        tenantId,
        originalSelector: request.brokenSelector,
        pageUrl: request.pageUrl,
        suggestionsCount: suggestions.length,
        bestConfidence: suggestions.length > 0 ? suggestions[0].confidence : 0,
        analysisTime,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.warn('Failed to log healing attempt:', error);
    }
  }
}