declare class TestGeneratorService {
    private dbManager;
    private testGenerator;
    constructor();
    start(): Promise<void>;
    private registerPlugins;
    private registerRoutes;
    private processTestGeneration;
    private createGenerationRequest;
    private updateGenerationStatus;
    private getGenerationRequest;
    private getGenerationHistory;
    stop(): Promise<void>;
}
export default TestGeneratorService;
//# sourceMappingURL=index.d.ts.map