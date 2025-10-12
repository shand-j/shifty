// MEDIUM: console.log throughout production code - no structured logging
// FIXME: Logs are unstructured, no correlation IDs, log levels, or persistence
// TODO: Replace all console.log with proper logger (Winston/Pino):
//   1. Add correlation IDs to all log statements
//   2. Use log levels (debug, info, warn, error)
//   3. Structure logs as JSON for parsing
//   4. Send to centralized logging (CloudWatch, Datadog, ELK)
// Impact: Hard to debug, no production observability
// Effort: 2 days | Priority: MEDIUM
// NOTE: This applies to ALL services with console.log

// Service-specific interfaces that match the API schema
export interface TestGenerationOptions {
  url: string;
  requirements: string;
  testType: 'e2e' | 'integration' | 'smoke' | 'regression';
  browserType?: 'chromium' | 'firefox' | 'webkit';
  options?: {
    generateVisualTests?: boolean;
    includeAccessibility?: boolean;
    mobileViewport?: boolean;
    timeout?: number;
  };
}

export interface GeneratedTest {
  code: string;
  metadata: {
    generator: string;
    version: string;
    generatedAt: string;
  };
  selectors: string[];
  estimatedExecutionTime: number;
}

export interface ValidationIssue {
  type: 'syntax' | 'structure' | 'import' | 'logic' | 'general';
  message: string;
  line?: number;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  suggestions: string[];
  executionTime: number;
}

export interface TestGeneratorConfig {
  ollamaUrl: string;
  model: string;
}

export class TestGenerator {
  private ollamaUrl: string;
  private model: string;
  private templates: TestTemplates;

  constructor(config: TestGeneratorConfig) {
    this.ollamaUrl = config.ollamaUrl;
    this.model = config.model;
    this.templates = new TestTemplates();
  }

  async generateTest(request: TestGenerationOptions): Promise<GeneratedTest> {
    try {
      console.log(`🧪 Generating ${request.testType} test for: ${request.url}`);
      
      // Start with template-based generation
      const template = this.templates.getTemplate(request.testType);
      const baseCode = this.templates.fillTemplate(template, request);
      
      // Enhance with AI if available
      const enhancedCode = await this.enhanceWithAI(baseCode, request);
      
      // Extract metadata
      const selectors = this.extractSelectors(enhancedCode);
      const executionTime = this.estimateExecutionTime(enhancedCode);

      return {
        code: enhancedCode,
        metadata: {
          generator: 'ai-enhanced-template',
          version: '1.0.0',
          generatedAt: new Date().toISOString()
        },
        selectors,
        estimatedExecutionTime: executionTime
      };

    } catch (error: any) {
      console.error('Test generation failed:', error);
      
      // Fallback to basic template
      const template = this.templates.getTemplate(request.testType);
      const basicCode = this.templates.fillTemplate(template, request);
      
      return {
        code: basicCode,
        metadata: {
          generator: 'template-fallback',
          version: '1.0.0',
          generatedAt: new Date().toISOString()
        },
        selectors: this.extractSelectors(basicCode),
        estimatedExecutionTime: this.estimateExecutionTime(basicCode)
      };
    }
  }

  async validateTest(code: string, url?: string): Promise<ValidationResult> {
    console.log(`✅ Validating test code`);
    const issues: ValidationIssue[] = [];
    const suggestions: string[] = [];

    // 1. Syntax validation using eval in try-catch
    try {
      // Create a safe evaluation context to check syntax
      new Function(code);
    } catch (syntaxError: any) {
      issues.push({
        type: 'syntax',
        message: `Syntax error: ${syntaxError.message}`,
        line: this.extractLineNumber(syntaxError.message),
        severity: 'error'
      });
    }

    // 2. Basic static analysis
    if (!code.includes('test(')) {
      issues.push({
        type: 'structure',
        message: 'No test function found',
        severity: 'error'
      });
    }

    if (!code.includes('expect(')) {
      suggestions.push('Consider adding assertions with expect()');
    }

    if (url && !code.includes(url)) {
      suggestions.push(`Consider navigating to the provided URL: ${url}`);
    }

    if (!code.includes('page.goto')) {
      issues.push({
        type: 'structure',
        message: 'No page navigation found',
        severity: 'warning'
      });
    }

    // 3. Check for common Playwright patterns
    if (!code.includes('import') || !code.includes('@playwright/test')) {
      issues.push({
        type: 'import',
        message: 'Missing Playwright test imports',
        severity: 'error'
      });
    }

    // 4. Check for unclosed braces/brackets
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push({
        type: 'syntax',
        message: 'Mismatched braces - missing opening or closing brace',
        severity: 'error'
      });
    }

    return {
      valid: issues.length === 0 || issues.every(issue => issue.severity !== 'error'),
      issues,
      suggestions,
      executionTime: this.estimateExecutionTime(code)
    };
  }

  private extractLineNumber(errorMessage: string): number | undefined {
    const lineMatch = errorMessage.match(/line (\d+)/i);
    return lineMatch ? parseInt(lineMatch[1], 10) : undefined;
  }

  async improveTest(originalCode: string, feedback: string): Promise<string> {
    console.log(`🔧 Improving test with feedback: ${feedback.substring(0, 50)}...`);
    
    let improvedCode = originalCode;

    // Apply improvements based on feedback
    if (feedback.toLowerCase().includes('slow')) {
      improvedCode = improvedCode.replace(
        /page\.waitForTimeout\(\d+\)/g, 
        'page.waitForLoadState("networkidle")'
      );
    }

    if (feedback.toLowerCase().includes('selector')) {
      improvedCode = `// Improved: Use data-testid attributes for more stable selectors\n${improvedCode}`;
    }

    // Try AI enhancement if available
    try {
      return await this.enhanceWithAI(improvedCode, {
        url: 'https://example.com',
        requirements: `Improve this test based on feedback: ${feedback}`,
        testType: 'e2e'
      });
    } catch {
      return improvedCode;
    }
  }

  async healthCheck(): Promise<{ status: string; model?: string; details?: any }> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json() as any;
        return {
          status: 'healthy',
          model: this.model,
          details: { availableModels: data.models?.length || 0 }
        };
      } else {
        return { status: 'degraded', details: { error: `HTTP ${response.status}` } };
      }
    } catch (error: any) {
      return { status: 'offline', details: { error: error.message } };
    }
  }

  private async enhanceWithAI(baseCode: string, request: TestGenerationOptions): Promise<string> {
    try {
      const prompt = this.buildPrompt(baseCode, request);
      const response = await this.callOllama(prompt);
      
      const enhancedCode = this.extractCodeFromResponse(response);
      return enhancedCode || baseCode;
      
    } catch (error: any) {
      console.warn('AI enhancement failed:', error.message);
      return baseCode;
    }
  }

  private buildPrompt(baseCode: string, request: TestGenerationOptions): string {
    return `You are an expert Playwright test engineer. Enhance this test code.

Base test:
\`\`\`typescript
${baseCode}
\`\`\`

Requirements: ${request.requirements}
URL: ${request.url}
Type: ${request.testType}

Improve by adding:
1. Better selectors (prefer data-testid)
2. Proper waits and error handling  
3. Meaningful assertions
4. Playwright best practices

Return only the enhanced TypeScript code.`;
  }

  private async callOllama(prompt: string): Promise<string> {
    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: { temperature: 0.3, max_tokens: 1000 }
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.response || '';
  }

  private extractCodeFromResponse(response: string): string {
    const codeBlockRegex = /```(?:typescript|ts|javascript|js)?\n([\s\S]*?)\n```/i;
    const match = response.match(codeBlockRegex);
    return match ? match[1].trim() : response.trim();
  }

  private extractSelectors(code: string): string[] {
    const patterns = [
      /page\.locator\(['"`]([^'"`]+)['"`]\)/g,
      /page\.getByRole\(['"`]([^'"`]+)['"`]/g,
      /page\.getByTestId\(['"`]([^'"`]+)['"`]/g,
      /page\.getByText\(['"`]([^'"`]+)['"`]/g
    ];

    // MEDIUM: Naive selector extraction - misses complex cases
    // FIXME: Doesn't handle template literals, dynamic selectors, chained locators
    // TODO: Improve extraction:
    //   1. Parse AST using @babel/parser for accuracy
    //   2. Handle page.locator().locator() chains
    //   3. Extract selectors from helper functions
    //   4. Support page.frameLocator() and shadow DOM
    // Impact: Incomplete test analysis, missing healing opportunities
    // Effort: 3 days | Priority: MEDIUM
    const selectors: string[] = [];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        selectors.push(match[1]);
      }
    }

    return [...new Set(selectors)];
  }

  private estimateExecutionTime(code: string): number {
    // MEDIUM: Naive execution time estimation
    // FIXME: Doesn't account for network latency, page load time, element wait times
    // TODO: Improve estimation algorithm:
    //   1. Add network delay factor (2-5s per request)
    //   2. Parse page.goto() and add typical page load time (3-8s)
    //   3. Count page.waitFor*() and add their timeout values
    //   4. Factor in screenshot/video recording overhead
    //   5. Use historical data from actual test runs
    // Impact: Misleading time estimates, poor capacity planning
    // Effort: 3 days | Priority: MEDIUM
    const lines = code.split('\n').length;
    const interactions = (code.match(/page\.(click|fill|type|goto)/g) || []).length;
    const waits = (code.match(/waitFor/g) || []).length;
    
    return (lines * 50) + (interactions * 200) + (waits * 1000);
  }
}

class TestTemplates {
  private templates: Record<string, string> = {
    e2e: `import { test, expect } from '@playwright/test';

test('{{TEST_NAME}}', async ({ page }) => {
  // Navigate to the application
  await page.goto('{{URL}}');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Test: {{REQUIREMENTS}}
  
  // Verify page loads successfully
  await expect(page).toHaveTitle(/{{DOMAIN}}/i);
  
  // HIGH: Incomplete test generation - generates boilerplate only
  // FIXME: Core feature doesn't deliver value, tests are empty shells
  // TODO: Implement actual test step generation:
  //   1. Parse requirements to extract actions (click, fill, verify)
  //   2. Use AI to generate specific Playwright assertions
  //   3. Add proper selectors based on page analysis
  //   4. Include data-testid recommendations
  // Impact: Primary value proposition doesn't work
  // Effort: 1-2 weeks | Priority: HIGH
  console.log('✅ Test completed successfully');
});`,

    integration: `import { test, expect } from '@playwright/test';

test('{{TEST_NAME}} - Integration', async ({ page }) => {
  await page.goto('{{URL}}');
  await page.waitForLoadState('domcontentloaded');
  
  // Integration test: {{REQUIREMENTS}}
  
  // Verify core functionality is available
  await expect(page.locator('main, #app, .app')).toBeVisible();
  
  console.log('🔗 Integration test passed');
});`,

    smoke: `import { test, expect } from '@playwright/test';

test('{{TEST_NAME}} - Smoke Test', async ({ page }) => {
  // Quick smoke test: {{REQUIREMENTS}}
  
  await page.goto('{{URL}}');
  
  // Verify basic functionality
  await expect(page).toHaveURL('{{URL}}');
  await expect(page.locator('body')).toBeVisible();
  
  console.log('💨 Smoke test passed');
});`,

    regression: `import { test, expect } from '@playwright/test';

test('{{TEST_NAME}} - Regression', async ({ page }) => {
  await page.goto('{{URL}}');
  
  // Regression test: {{REQUIREMENTS}}
  
  // Verify previously working functionality
  await expect(page).toHaveTitle(/.+/);
  
  console.log('🔄 Regression test passed');
});`
  };

  getTemplate(testType: string): string {
    return this.templates[testType] || this.templates.e2e;
  }

  fillTemplate(template: string, request: TestGenerationOptions): string {
    const url = new URL(request.url);
    const domain = url.hostname.replace('www.', '');
    const testName = this.generateTestName(request.requirements);

    return template
      .replace(/\{\{URL\}\}/g, request.url)
      .replace(/\{\{REQUIREMENTS\}\}/g, request.requirements)
      .replace(/\{\{TEST_NAME\}\}/g, testName)
      .replace(/\{\{DOMAIN\}\}/g, domain);
  }

  private generateTestName(requirements: string): string {
    const words = requirements
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .slice(0, 4)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return words || 'Generated Test';
  }
}