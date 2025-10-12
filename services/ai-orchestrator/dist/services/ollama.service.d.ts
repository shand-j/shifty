export interface OllamaModel {
    name: string;
    size: number;
    digest: string;
    modified_at: string;
}
export interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    stream?: boolean;
    options?: {
        temperature?: number;
        top_p?: number;
        max_tokens?: number;
    };
}
export interface OllamaGenerateResponse {
    response: string;
    done: boolean;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    eval_count?: number;
    eval_duration?: number;
}
export declare class OllamaService {
    private baseUrl;
    private timeout;
    constructor();
    healthCheck(): Promise<{
        status: string;
        models?: string[];
    }>;
    generate(request: OllamaGenerateRequest): Promise<OllamaGenerateResponse>;
    listModels(): Promise<OllamaModel[]>;
    pullModel(modelName: string): Promise<void>;
    deleteModel(modelName: string): Promise<void>;
    generateTestCode(prompt: string, model?: string, options?: {
        temperature?: number;
        max_tokens?: number;
    }): Promise<string>;
    healSelector(originalSelector: string, pageContext: string, model?: string): Promise<string[]>;
    private buildTestGenerationPrompt;
    private buildSelectorHealingPrompt;
    private extractCodeFromResponse;
    private extractSelectorsFromResponse;
}
//# sourceMappingURL=ollama.service.d.ts.map