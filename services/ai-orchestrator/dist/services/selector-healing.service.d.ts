import { DatabaseManager } from '@shifty/database';
import { OllamaService } from './ollama.service.js';
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
export declare class SelectorHealingService {
    private ollama;
    private dbManager;
    private defaultModel;
    constructor(ollamaService: OllamaService, dbManager: DatabaseManager);
    healSelector(tenantId: string, request: SelectorHealingRequest): Promise<SelectorHealingResult>;
    batchHealSelectors(tenantId: string, requests: SelectorHealingRequest[]): Promise<SelectorHealingResult[]>;
    private analyzeSelector;
    private generateAISuggestions;
    private applyRuleBasedStrategies;
    private parseAISuggestions;
    private rankSuggestions;
    private getSelectorType;
    private calculateSelectorComplexity;
    private identifyLikelyIssues;
    private logHealingAttempt;
}
export {};
//# sourceMappingURL=selector-healing.service.d.ts.map