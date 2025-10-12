import { Pool, PoolClient, QueryResult } from 'pg';
export declare class DatabaseManager {
    private platformPool;
    private tenantPools;
    initialize(): Promise<void>;
    query(text: string, params?: any[]): Promise<QueryResult>;
    getClient(): Promise<PoolClient>;
    getTenantPool(tenantId: string, databaseUrl?: string): Promise<Pool>;
    queryTenant(tenantId: string, databaseUrl: string, text: string, params?: any[]): Promise<QueryResult>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    tenantTransaction<T>(tenantId: string, databaseUrl: string, callback: (client: PoolClient) => Promise<T>): Promise<T>;
    close(): Promise<void>;
    healthCheck(): Promise<{
        platform: boolean;
        tenants: Record<string, boolean>;
    }>;
}
export declare class MigrationRunner {
    private dbManager;
    constructor(dbManager: DatabaseManager);
    runPlatformMigrations(): Promise<void>;
    runTenantMigrations(tenantId: string, databaseUrl: string): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map