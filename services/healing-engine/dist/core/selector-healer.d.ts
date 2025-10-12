import { Page } from 'playwright';
export interface HealingResult {
    success: boolean;
    selector: string;
    confidence: number;
    strategy: string;
    alternatives: string[];
    error?: string;
}
export interface HealingOptions {
    ollamaUrl?: string;
    model?: string;
}
export declare class SelectorHealer {
    private ollamaUrl;
    private model;
    constructor(options?: HealingOptions);
    healSelector(page: Page, brokenSelector: string, expectedElementType?: string, preferredStrategy?: string): Promise<HealingResult>;
    healthCheck(): Promise<{
        status: string;
        strategies: string[];
    }>;
    private checkSelectorExists;
    private tryStrategy;
    private tryDataTestIdRecovery;
    private tryTextContentMatching;
    private tryCssHierarchyAnalysis;
    private tryAiAnalysis;
    private getPageContext;
    private callOllama;
    private parseAiResponse;
}
//# sourceMappingURL=selector-healer.d.ts.map