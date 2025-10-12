export interface TestGenerationOptions {
    url: string;
    requirements: string;
    testType: 'smoke' | 'regression' | 'e2e' | 'accessibility';
    aiProvider: 'ollama' | 'anthropic' | 'openai';
    model?: string;
}
export interface GeneratedTest {
    code: string;
    selectors: Array<{
        selector: string;
        confidence: number;
        alternatives: string[];
    }>;
    metadata: {
        generatedAt: Date;
        aiModel: string;
        confidence: number;
        estimatedDuration: number;
    };
}
export declare class AITestGenerator {
    private aiEndpoint;
    private defaultModel;
    constructor();
    generate(options: TestGenerationOptions): Promise<GeneratedTest>;
    private analyzePage;
    private buildPrompt;
    private callAI;
    private callOllama;
    private parseAIResponse;
    private extractCode;
    private extractSelectors;
    private calculateSelectorConfidence;
    private generateSelectorAlternatives;
    private calculateConfidence;
    private estimateDuration;
    private getFallbackTest;
}
//# sourceMappingURL=test-generator.d.ts.map