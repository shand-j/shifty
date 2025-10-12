import { DatabaseManager } from '@shifty/database';
import { OllamaService, OllamaGenerateRequest, OllamaGenerateResponse } from './ollama.service.js';

interface TestGenerationRequest {
  description: string;
  testType: 'e2e' | 'integration' | 'unit' | 'smoke';
  framework?: 'playwright' | 'cypress' | 'webdriver';
  pageUrl?: string;
  userStory?: string;
  acceptanceCriteria?: string[];
}

interface GeneratedTest {
  code: string;
  framework: string;
  language: string;
  confidence: number;
  suggestions: string[];
  metadata: {
    testType: string;
    description: string;
    estimatedDuration: number;
  };
}

export class TestGenerationService {
  private ollama: OllamaService;
  private dbManager: DatabaseManager;
  private defaultModel: string;

  constructor(ollamaService: OllamaService, dbManager: DatabaseManager) {
    this.ollama = ollamaService;
    this.dbManager = dbManager;
    this.defaultModel = process.env.AI_MODEL || 'llama3.1';
  }

  async generateTest(tenantId: string, request: TestGenerationRequest): Promise<GeneratedTest> {
    console.log(`🧪 Generating ${request.testType} test for tenant: ${tenantId}`);
    
    try {
      // Build context-aware prompt
      const prompt = this.buildTestGenerationPrompt(request);
      
      // Generate test using Ollama
      const ollamaRequest: OllamaGenerateRequest = {
        model: this.defaultModel,
        prompt,
        options: {
          temperature: 0.3,
          max_tokens: 2000
        }
      };

      const response = await this.ollama.generate(ollamaRequest);
      
      // Parse and validate generated test
      const testCode = this.extractTestCode(response.response);
      const confidence = this.calculateConfidence(response, request);
      
      // Store generation history
      await this.logTestGeneration(tenantId, request, testCode, confidence);

      return {
        code: testCode,
        framework: request.framework || 'playwright',
        language: 'typescript',
        confidence,
        suggestions: this.extractSuggestions(response.response),
        metadata: {
          testType: request.testType,
          description: request.description,
          estimatedDuration: this.estimateTestDuration(request.testType, testCode)
        }
      };

    } catch (error: any) {
      console.error('Test generation failed:', error);
      throw new Error(`Test generation failed: ${error.message}`);
    }
  }

  async improveTest(tenantId: string, existingTest: string, feedback: string): Promise<GeneratedTest> {
    console.log(`🔧 Improving test for tenant: ${tenantId}`);

    const prompt = `
You are an expert test engineer. Improve this test based on the feedback provided.

Existing Test:
\`\`\`typescript
${existingTest}
\`\`\`

Feedback: ${feedback}

Please provide an improved version addressing the feedback. Focus on:
1. Better reliability and stability
2. Improved readability and maintainability
3. Best practices for Playwright testing
4. Proper error handling and assertions

Return only the improved TypeScript code wrapped in \`\`\`typescript blocks.
`;

    try {
      const response = await this.ollama.generate({
        model: this.defaultModel,
        prompt,
        options: { temperature: 0.2 }
      });

      const improvedCode = this.extractTestCode(response.response);
      const confidence = this.calculateConfidence(response, { testType: 'e2e' } as TestGenerationRequest);

      await this.logTestGeneration(tenantId, { 
        description: 'Test improvement',
        testType: 'e2e'
      } as TestGenerationRequest, improvedCode, confidence);

      return {
        code: improvedCode,
        framework: 'playwright',
        language: 'typescript',
        confidence,
        suggestions: this.extractSuggestions(response.response),
        metadata: {
          testType: 'e2e',
          description: 'Improved test',
          estimatedDuration: this.estimateTestDuration('e2e', improvedCode)
        }
      };

    } catch (error: any) {
      console.error('Test improvement failed:', error);
      throw new Error(`Test improvement failed: ${error.message}`);
    }
  }

  private buildTestGenerationPrompt(request: TestGenerationRequest): string {
    let prompt = `You are an expert QA engineer specializing in ${request.framework || 'Playwright'} test automation.

Generate a ${request.testType} test in TypeScript for the following requirement:

**Description:** ${request.description}
`;

    if (request.pageUrl) {
      prompt += `\n**Target URL:** ${request.pageUrl}`;
    }

    if (request.userStory) {
      prompt += `\n**User Story:** ${request.userStory}`;
    }

    if (request.acceptanceCriteria?.length) {
      prompt += `\n**Acceptance Criteria:**\n${request.acceptanceCriteria.map(c => `- ${c}`).join('\n')}`;
    }

    prompt += `

**Requirements:**
1. Use Playwright with TypeScript
2. Follow best practices for ${request.testType} testing
3. Include proper error handling and assertions
4. Use data-testid selectors when possible
5. Add meaningful comments
6. Handle async/await properly
7. Include setup and teardown if needed

**Test Type Guidelines:**
${this.getTestTypeGuidelines(request.testType)}

Return only the TypeScript test code wrapped in \`\`\`typescript blocks.
No explanations, just the complete, runnable test code.`;

    return prompt;
  }

  private getTestTypeGuidelines(testType: string): string {
    switch (testType) {
      case 'e2e':
        return `- Test complete user workflows from start to finish
- Navigate through multiple pages
- Test real user interactions
- Verify end-to-end business processes`;
      
      case 'integration':
        return `- Test interactions between components/services
- Focus on data flow and API integrations
- Verify component communication
- Test with realistic data`;
      
      case 'smoke':
        return `- Quick validation of critical functionality
- Basic user flows only
- Fast execution (under 30 seconds)
- High-level sanity checks`;
      
      case 'unit':
        return `- Test individual functions/methods
- Mock external dependencies
- Fast execution
- High code coverage`;
      
      default:
        return '- Follow general testing best practices';
    }
  }

  private extractTestCode(response: string): string {
    // Extract code from markdown blocks
    const codeBlocks = response.match(/```(?:typescript|ts|javascript|js)?\n([\s\S]*?)\n```/g);
    
    if (codeBlocks && codeBlocks.length > 0) {
      // Get the largest code block (most likely the main test)
      const largestBlock = codeBlocks
        .map(block => block.replace(/```(?:typescript|ts|javascript|js)?\n/, '').replace(/\n```$/, ''))
        .reduce((a, b) => a.length > b.length ? a : b);
      
      return largestBlock.trim();
    }

    // Fallback: try to extract any code-like content
    const lines = response.split('\n');
    const codeStart = lines.findIndex(line => 
      line.includes('import') || 
      line.includes('test(') || 
      line.includes('describe(') ||
      line.includes('it(')
    );
    
    if (codeStart >= 0) {
      return lines.slice(codeStart).join('\n').trim();
    }

    return response.trim();
  }

  private extractSuggestions(response: string): string[] {
    const suggestions: string[] = [];
    
    // Look for suggestions in common formats
    const suggestionPatterns = [
      /suggestions?:\s*\n((?:[-*]\s*.+\n?)+)/gi,
      /recommendations?:\s*\n((?:[-*]\s*.+\n?)+)/gi,
      /improvements?:\s*\n((?:[-*]\s*.+\n?)+)/gi,
      /consider:\s*\n((?:[-*]\s*.+\n?)+)/gi
    ];

    for (const pattern of suggestionPatterns) {
      const matches = response.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const items = match.split('\n')
            .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
            .map(line => line.replace(/^[-*]\s*/, '').trim())
            .filter(item => item.length > 0);
          suggestions.push(...items);
        });
      }
    }

    // If no structured suggestions found, extract general advice
    if (suggestions.length === 0) {
      const sentences = response.split(/[.!?]/)
        .map(s => s.trim())
        .filter(s => s.length > 20 && (
          s.toLowerCase().includes('consider') ||
          s.toLowerCase().includes('recommend') ||
          s.toLowerCase().includes('suggest') ||
          s.toLowerCase().includes('improve')
        ));
      
      suggestions.push(...sentences.slice(0, 3));
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  private calculateConfidence(response: OllamaGenerateResponse, request: TestGenerationRequest): number {
    let confidence = 0.5; // Base confidence

    // Factors that increase confidence
    if (response.response.includes('import') && response.response.includes('test(')) confidence += 0.2;
    if (response.response.includes('await') && response.response.includes('page.')) confidence += 0.1;
    if (response.response.includes('expect(')) confidence += 0.1;
    if (response.response.includes('data-testid') || response.response.includes('[data-test')) confidence += 0.1;

    // Response quality factors
    if (response.response.length > 200) confidence += 0.05;
    if (response.response.length > 500) confidence += 0.05;
    
    // Test type complexity
    if (request.testType === 'smoke') confidence += 0.1;
    if (request.testType === 'e2e' && request.pageUrl) confidence += 0.05;

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  private estimateTestDuration(testType: string, testCode: string): number {
    // Base durations in seconds
    const baseDurations = {
      unit: 1,
      smoke: 10,
      integration: 30,
      e2e: 60
    };

    let duration = baseDurations[testType as keyof typeof baseDurations] || 30;

    // Adjust based on code complexity
    const navigationCount = (testCode.match(/page\.goto|page\.click|page\.fill/g) || []).length;
    const waitCount = (testCode.match(/waitFor|wait\(/g) || []).length;
    const assertionCount = (testCode.match(/expect\(/g) || []).length;

    duration += navigationCount * 2;
    duration += waitCount * 1;
    duration += assertionCount * 0.5;

    return Math.round(duration);
  }

  private async logTestGeneration(
    tenantId: string, 
    request: TestGenerationRequest, 
    generatedCode: string, 
    confidence: number
  ): Promise<void> {
    try {
      console.log(`📝 Logging test generation for tenant ${tenantId}: ${request.testType} test`);
      
      // For MVP, just console log
      // In production, this would store in tenant's database
      console.log({
        tenantId,
        testType: request.testType,
        description: request.description,
        codeLength: generatedCode.length,
        confidence,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.warn('Failed to log test generation:', error);
    }
  }
}