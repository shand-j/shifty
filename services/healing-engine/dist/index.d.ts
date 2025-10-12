declare class HealingEngineService {
    private dbManager;
    private selectorHealer;
    constructor();
    start(): Promise<void>;
    private registerPlugins;
    private registerRoutes;
    private getBrowser;
    private getMockHealingResult;
    private logHealingAttempt;
    private getHealingStats;
    stop(): Promise<void>;
}
export default HealingEngineService;
//# sourceMappingURL=index.d.ts.map