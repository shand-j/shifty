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
export declare class TestGenerator {
    private ollamaUrl;
    private model;
    private templates;
    constructor(config: TestGeneratorConfig);
    generateTest(request: TestGenerationOptions): Promise<GeneratedTest>;
    validateTest(code: string, url?: string): Promise<ValidationResult>;
    private extractLineNumber;
    improveTest(originalCode: string, feedback: string): Promise<string>;
    healthCheck(): Promise<{
        status: string;
        model?: string;
        details?: any;
    }>;
    private enhanceWithAI;
    private buildPrompt;
    private callOllama;
    private extractCodeFromResponse;
    private extractSelectors;
    private estimateExecutionTime;
}
//# sourceMappingURL=test-generator.d.ts.map