"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITestGenerator = void 0;
class AITestGenerator {
    constructor() {
        this.aiEndpoint = process.env.AI_ENDPOINT || 'http://localhost:11434';
        this.defaultModel = process.env.AI_MODEL || 'llama3.1:8b';
    }
    async generate(options) {
        console.log(`🤖 Generating ${options.testType} test for: ${options.url}`);
        // Analyze the page first
        const pageAnalysis = await this.analyzePage(options.url);
        // Generate test based on requirements and analysis
        const prompt = this.buildPrompt(options, pageAnalysis);
        const aiResponse = await this.callAI(prompt, options.aiProvider, options.model);
        // Parse and validate the generated test
        const generatedTest = this.parseAIResponse(aiResponse, options);
        console.log(`✅ Generated test with ${generatedTest.selectors.length} selectors`);
        return generatedTest;
    }
    async analyzePage(url) {
        // In a real implementation, this would use Playwright to analyze the page
        // For now, return mock analysis
        return {
            title: 'Sample Page',
            forms: ['login-form'],
            buttons: ['submit-btn', 'cancel-btn'],
            inputs: ['username', 'password'],
            links: ['home', 'about', 'contact'],
            structure: {
                header: true,
                navigation: true,
                main: true,
                footer: true
            }
        };
    }
    buildPrompt(options, pageAnalysis) {
        const basePrompt = `Generate a Playwright test for the following requirements:

URL: ${options.url}
Test Type: ${options.testType}
Requirements: ${options.requirements}

Page Analysis:
${JSON.stringify(pageAnalysis, null, 2)}

Generate a complete Playwright test that:
1. Uses robust selectors (prefer data-test attributes)
2. Includes proper assertions
3. Has error handling
4. Is maintainable and readable

Format your response as a TypeScript test file using @playwright/test.
Include only the test code, no explanations.`;
        const typeSpecificPrompts = {
            smoke: 'Focus on basic functionality - page loads, key elements visible, critical user flows work.',
            regression: 'Focus on comprehensive coverage - test all interactive elements, form validations, edge cases.',
            e2e: 'Focus on complete user journeys - multi-step processes, cross-page navigation, data persistence.',
            accessibility: 'Focus on accessibility - ARIA labels, keyboard navigation, color contrast, screen reader support.'
        };
        return `${basePrompt}\n\nSpecific guidance for ${options.testType} tests:\n${typeSpecificPrompts[options.testType]}`;
    }
    async callAI(prompt, provider, model) {
        const useModel = model || this.defaultModel;
        try {
            if (provider === 'ollama') {
                return await this.callOllama(prompt, useModel);
            }
            else {
                // Future: Add Anthropic/OpenAI implementations
                throw new Error(`Provider ${provider} not yet implemented`);
            }
        }
        catch (error) {
            console.error('AI call failed:', error);
            return this.getFallbackTest();
        }
    }
    async callOllama(prompt, model) {
        const axios = require('axios');
        const response = await axios.post(`${this.aiEndpoint}/api/generate`, {
            model,
            prompt,
            stream: false,
            options: {
                temperature: 0.3, // Lower temperature for more consistent code
                top_p: 0.9,
                max_tokens: 2000
            }
        });
        return response.data.response;
    }
    parseAIResponse(response, options) {
        // Extract code from AI response
        const code = this.extractCode(response);
        // Extract selectors from the generated code
        const selectors = this.extractSelectors(code);
        // Calculate confidence based on selector quality
        const confidence = this.calculateConfidence(selectors);
        return {
            code,
            selectors,
            metadata: {
                generatedAt: new Date(),
                aiModel: options.model || this.defaultModel,
                confidence,
                estimatedDuration: this.estimateDuration(code)
            }
        };
    }
    extractCode(response) {
        // Extract code blocks from AI response
        const codeBlockRegex = /```(?:typescript|ts|javascript|js)?\n?([\s\S]*?)```/g;
        const matches = [...response.matchAll(codeBlockRegex)];
        if (matches.length > 0) {
            return matches[0][1].trim();
        }
        // If no code blocks, return the whole response cleaned up
        return response
            .split('\n')
            .filter(line => !line.trim().startsWith('//') || line.includes('import') || line.includes('test'))
            .join('\n')
            .trim();
    }
    extractSelectors(code) {
        const selectors = [];
        // Extract selectors from locator calls
        const locatorRegex = /(?:page\.locator|locator)\(['"`]([^'"`]+)['"`]\)/g;
        const matches = [...code.matchAll(locatorRegex)];
        for (const match of matches) {
            const selector = match[1];
            const confidence = this.calculateSelectorConfidence(selector);
            const alternatives = this.generateSelectorAlternatives(selector);
            selectors.push({
                selector,
                confidence,
                alternatives
            });
        }
        return selectors;
    }
    calculateSelectorConfidence(selector) {
        let confidence = 0.5; // Base confidence
        // Data attributes are most reliable
        if (selector.includes('[data-test') || selector.includes('[data-testid')) {
            confidence = 0.95;
        }
        // ARIA attributes are good
        else if (selector.includes('[aria-') || selector.includes('[role=')) {
            confidence = 0.8;
        }
        // IDs are fairly reliable
        else if (selector.startsWith('#')) {
            confidence = 0.7;
        }
        // Text-based selectors are moderate
        else if (selector.includes('text=') || selector.includes(':has-text')) {
            confidence = 0.6;
        }
        // CSS classes are less reliable
        else if (selector.startsWith('.')) {
            confidence = 0.4;
        }
        // Tag names alone are unreliable
        else if (/^[a-z]+$/i.test(selector)) {
            confidence = 0.2;
        }
        return Math.round(confidence * 100) / 100;
    }
    generateSelectorAlternatives(selector) {
        const alternatives = [];
        // Generate alternatives based on selector type
        if (selector.includes('data-test')) {
            const value = selector.match(/data-test[^=]*=['"`]([^'"`]+)['"`]/)?.[1];
            if (value) {
                alternatives.push(`[data-testid="${value}"]`);
                alternatives.push(`[data-cy="${value}"]`);
            }
        }
        if (selector.startsWith('#')) {
            const id = selector.substring(1);
            alternatives.push(`[id="${id}"]`);
            alternatives.push(`*[id="${id}"]`);
        }
        return alternatives;
    }
    calculateConfidence(selectors) {
        if (selectors.length === 0)
            return 0.3;
        const avgConfidence = selectors.reduce((sum, s) => sum + s.confidence, 0) / selectors.length;
        return Math.round(avgConfidence * 100) / 100;
    }
    estimateDuration(code) {
        // Estimate test duration based on code complexity
        const lines = code.split('\n').filter(line => line.trim());
        const interactions = (code.match(/\.(click|fill|select|check|wait)/g) || []).length;
        const assertions = (code.match(/expect\(/g) || []).length;
        // Base time + interaction time + assertion time
        return Math.max(5, lines.length * 0.5 + interactions * 2 + assertions * 1);
    }
    getFallbackTest() {
        return `import { test, expect } from '@playwright/test';

test('Basic page test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
  
  // Add more specific tests based on page analysis
  const mainContent = page.locator('main, [role="main"], .content');
  await expect(mainContent).toBeVisible();
});`;
    }
}
exports.AITestGenerator = AITestGenerator;
//# sourceMappingURL=test-generator.js.map