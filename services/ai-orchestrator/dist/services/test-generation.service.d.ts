import { DatabaseManager } from '@shifty/database';
import { OllamaService } from './ollama.service.js';
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
export declare class TestGenerationService {
    private ollama;
    private dbManager;
    private defaultModel;
    constructor(ollamaService: OllamaService, dbManager: DatabaseManager);
    generateTest(tenantId: string, request: TestGenerationRequest): Promise<GeneratedTest>;
    improveTest(tenantId: string, existingTest: string, feedback: string): Promise<GeneratedTest>;
    private buildTestGenerationPrompt;
    private getTestTypeGuidelines;
    private extractTestCode;
    private extractSuggestions;
    private calculateConfidence;
    private estimateTestDuration;
    private logTestGeneration;
}
export {};
//# sourceMappingURL=test-generation.service.d.ts.map