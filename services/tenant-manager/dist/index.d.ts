declare class TenantManagerApp {
    private app;
    private port;
    private tenantService;
    private dbManager;
    constructor();
    private initializeMiddleware;
    private initializeRoutes;
    private initializeErrorHandling;
    start(): Promise<void>;
    stop(): Promise<void>;
}
export default TenantManagerApp;
//# sourceMappingURL=index.d.ts.map