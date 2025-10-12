import { DatabaseManager } from '@shifty/database';
import { Tenant } from '@shifty/shared';
export interface TenantProvisioningConfig {
    region: "us-east-1" | "us-west-2" | "eu-west-1" | "ap-southeast-1";
    plan: 'starter' | 'professional' | 'enterprise' | 'enterprise-plus';
    databaseConfig?: {
        instanceType?: string;
        storage?: string;
        backup?: boolean;
    };
}
export interface TenantProvisioningResult {
    tenant: Tenant;
    databaseUrl: string;
    s3Bucket: string;
    kubernetesNamespace: string;
    gitRepository: string;
}
export declare class TenantService {
    private dbManager;
    constructor(dbManager: DatabaseManager);
    createTenant(name: string, email: string, config: TenantProvisioningConfig): Promise<TenantProvisioningResult>;
    getTenant(id: string): Promise<Tenant | null>;
    getTenantRaw(id: string): Promise<any | null>;
    getTenantBySlug(slug: string): Promise<Tenant | null>;
    listTenants(limit?: number, offset?: number): Promise<Tenant[]>;
    listTenantsForUser(userId: string, limit?: number, offset?: number): Promise<Tenant[]>;
    listTenantsForUserRaw(userId: string, limit?: number, offset?: number): Promise<any[]>;
    listTenantsRaw(limit?: number, offset?: number): Promise<any[]>;
    userHasAccessToTenant(userId: string, tenantId: string): Promise<boolean>;
    updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant>;
    deleteTenant(id: string): Promise<void>;
    private provisionTenantDatabase;
    private provisionTenantStorage;
    private provisionTenantNamespace;
    private provisionTenantRepository;
    private createTenantRecord;
    private initializeTenantSchema;
    private cleanupFailedTenant;
    private cleanupTenantInfrastructure;
    createSimpleTenant(data: {
        name: string;
        slug: string;
        region?: string;
        plan?: string;
    }): Promise<Tenant>;
    createSimpleTenantRaw(data: {
        name: string;
        slug: string;
        region?: string;
        plan?: string;
    }): Promise<any>;
    private createTenantRecordRaw;
    private transformTenantRow;
}
//# sourceMappingURL=tenant.service.d.ts.map