"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = void 0;
const pg_1 = require("pg");
const shared_1 = require("@shifty/shared");
const uuid_1 = require("uuid");
class TenantService {
    constructor(dbManager) {
        this.dbManager = dbManager;
    }
    async createTenant(name, email, config) {
        const tenantId = (0, uuid_1.v4)();
        const slug = shared_1.TenantUtils.createTenantSlug(name);
        console.log(`🏢 Creating tenant: ${name} (${tenantId})`);
        try {
            // 1. Provision database infrastructure
            const databaseUrl = await this.provisionTenantDatabase(tenantId, config);
            // 2. Create S3 storage
            const s3Bucket = await this.provisionTenantStorage(tenantId, config);
            // 3. Create Kubernetes namespace
            const namespace = await this.provisionTenantNamespace(tenantId, config);
            // 4. Create Git repository
            const gitRepo = await this.provisionTenantRepository(tenantId, name);
            // 5. Create tenant record in platform database
            const tenant = await this.createTenantRecord({
                id: tenantId,
                name,
                slug,
                region: config.region,
                plan: config.plan,
                status: 'active',
                databaseUrl,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            // 6. Initialize tenant database schema
            await this.initializeTenantSchema(databaseUrl);
            console.log(`✅ Tenant created successfully: ${tenantId}`);
            return {
                tenant,
                databaseUrl,
                s3Bucket,
                kubernetesNamespace: namespace,
                gitRepository: gitRepo
            };
        }
        catch (error) {
            console.error(`❌ Failed to create tenant ${tenantId}:`, error);
            // Cleanup any partially created resources
            await this.cleanupFailedTenant(tenantId);
            throw error;
        }
    }
    async getTenant(id) {
        const query = 'SELECT * FROM tenants WHERE id = $1';
        const result = await this.dbManager.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return shared_1.TenantSchema.parse(this.transformTenantRow(result.rows[0]));
    }
    async getTenantRaw(id) {
        const query = 'SELECT * FROM tenants WHERE id = $1';
        const result = await this.dbManager.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return this.transformTenantRow(result.rows[0]);
    }
    async getTenantBySlug(slug) {
        const query = 'SELECT * FROM tenants WHERE slug = $1';
        const result = await this.dbManager.query(query, [slug]);
        if (result.rows.length === 0) {
            return null;
        }
        return shared_1.TenantSchema.parse(this.transformTenantRow(result.rows[0]));
    }
    async listTenants(limit, offset) {
        let query = 'SELECT * FROM tenants ORDER BY created_at DESC';
        const values = [];
        if (limit) {
            query += ' LIMIT $' + (values.length + 1);
            values.push(limit);
        }
        if (offset) {
            query += ' OFFSET $' + (values.length + 1);
            values.push(offset);
        }
        const result = await this.dbManager.query(query, values);
        return result.rows.map(row => shared_1.TenantSchema.parse(this.transformTenantRow(row)));
    }
    async listTenantsForUser(userId, limit, offset) {
        let query = `
      SELECT DISTINCT t.* FROM tenants t
      JOIN users u ON t.id = u.tenant_id
      WHERE u.id = $1
      ORDER BY t.created_at DESC
    `;
        const values = [userId];
        if (limit) {
            query += ' LIMIT $' + (values.length + 1);
            values.push(limit);
        }
        if (offset) {
            query += ' OFFSET $' + (values.length + 1);
            values.push(offset);
        }
        const result = await this.dbManager.query(query, values);
        return result.rows.map(row => shared_1.TenantSchema.parse(this.transformTenantRow(row)));
    }
    async listTenantsForUserRaw(userId, limit, offset) {
        let query = `
      SELECT DISTINCT t.* FROM tenants t
      JOIN users u ON t.id = u.tenant_id
      WHERE u.id = $1
      ORDER BY t.created_at DESC
    `;
        const values = [userId];
        if (limit) {
            query += ' LIMIT $' + (values.length + 1);
            values.push(limit);
        }
        if (offset) {
            query += ' OFFSET $' + (values.length + 1);
            values.push(offset);
        }
        const result = await this.dbManager.query(query, values);
        return result.rows.map(row => this.transformTenantRow(row));
    }
    async listTenantsRaw(limit, offset) {
        let query = 'SELECT * FROM tenants ORDER BY created_at DESC';
        const values = [];
        if (limit) {
            query += ' LIMIT $' + (values.length + 1);
            values.push(limit);
        }
        if (offset) {
            query += ' OFFSET $' + (values.length + 1);
            values.push(offset);
        }
        const result = await this.dbManager.query(query, values);
        return result.rows.map(row => this.transformTenantRow(row));
    }
    async userHasAccessToTenant(userId, tenantId) {
        const query = `
      SELECT 1 FROM users u
      WHERE u.id = $1 AND u.tenant_id = $2
    `;
        const result = await this.dbManager.query(query, [userId, tenantId]);
        return result.rows.length > 0;
    }
    async updateTenant(id, updates) {
        const setClause = Object.keys(updates)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ');
        const query = `
      UPDATE tenants 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1 
      RETURNING *
    `;
        const values = [id, ...Object.values(updates)];
        const result = await this.dbManager.query(query, values);
        if (result.rows.length === 0) {
            throw new Error(`Tenant not found: ${id}`);
        }
        return shared_1.TenantSchema.parse(this.transformTenantRow(result.rows[0]));
    }
    async deleteTenant(id) {
        console.log(`🗑️ Deleting tenant: ${id}`);
        try {
            // 1. Get tenant info first
            const tenant = await this.getTenant(id);
            if (!tenant) {
                throw new Error(`Tenant not found: ${id}`);
            }
            // 2. Cleanup tenant infrastructure
            await this.cleanupTenantInfrastructure(tenant);
            // 3. Delete tenant record
            const query = 'DELETE FROM tenants WHERE id = $1';
            await this.dbManager.query(query, [id]);
            console.log(`✅ Tenant deleted successfully: ${id}`);
        }
        catch (error) {
            console.error(`❌ Failed to delete tenant ${id}:`, error);
            throw error;
        }
    }
    async provisionTenantDatabase(tenantId, config) {
        // In a real implementation, this would:
        // 1. Create RDS instance via AWS SDK
        // 2. Configure security groups and network access
        // 3. Set up automated backups and monitoring
        // For now, return a mock database URL
        return shared_1.TenantUtils.getTenantDatabaseUrl(tenantId, config.region);
    }
    async provisionTenantStorage(tenantId, config) {
        // In a real implementation, this would:
        // 1. Create S3 bucket with tenant-specific name
        // 2. Configure encryption and lifecycle policies
        // 3. Set up IAM roles and access policies
        return shared_1.TenantUtils.getTenantS3Bucket(tenantId, config.region);
    }
    async provisionTenantNamespace(tenantId, config) {
        // In a real implementation, this would:
        // 1. Create Kubernetes namespace via k8s API
        // 2. Apply network policies for isolation
        // 3. Set up resource quotas and limits
        return `shifty-tenant-${tenantId}`;
    }
    async provisionTenantRepository(tenantId, tenantName) {
        // In a real implementation, this would:
        // 1. Create Git repository in AWS CodeCommit or GitHub
        // 2. Set up branch protection rules
        // 3. Initialize with framework structure
        return `shifty-tenant-${tenantId}-tests`;
    }
    async createTenantRecord(tenantData) {
        const query = `
      INSERT INTO tenants (id, name, slug, region, plan, status, database_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
        const values = [
            tenantData.id,
            tenantData.name,
            tenantData.slug,
            tenantData.region,
            tenantData.plan,
            tenantData.status || 'active',
            tenantData.databaseUrl,
            tenantData.createdAt,
            tenantData.updatedAt
        ];
        const result = await this.dbManager.query(query, values);
        return shared_1.TenantSchema.parse(this.transformTenantRow(result.rows[0]));
    }
    async initializeTenantSchema(databaseUrl) {
        // Connect to tenant database and create schema
        const client = new pg_1.Client({ connectionString: databaseUrl });
        try {
            await client.connect();
            // Create tenant-specific schema
            await client.query(`
        CREATE SCHEMA IF NOT EXISTS tenant_data;
        CREATE SCHEMA IF NOT EXISTS ai_models;
        CREATE SCHEMA IF NOT EXISTS test_executions;
        CREATE SCHEMA IF NOT EXISTS generated_code;
      `);
            // Create core tables
            await client.query(`
        CREATE TABLE IF NOT EXISTS tenant_data.projects (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          repository_url TEXT,
          webhook_secret VARCHAR(255),
          ai_config JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS tenant_data.test_suites (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES tenant_data.projects(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          generated_by_ai BOOLEAN DEFAULT false,
          test_code TEXT NOT NULL,
          selectors JSONB DEFAULT '[]',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
            console.log(`📊 Tenant database schema initialized`);
        }
        finally {
            await client.end();
        }
    }
    async cleanupFailedTenant(tenantId) {
        console.log(`🧹 Cleaning up failed tenant provisioning: ${tenantId}`);
        try {
            // Cleanup any partially created resources
            // In a real implementation, this would cleanup:
            // - RDS instances
            // - S3 buckets 
            // - Kubernetes namespaces
            // - Git repositories
            // Remove from platform database if exists
            await this.dbManager.query('DELETE FROM tenants WHERE id = $1', [tenantId]);
        }
        catch (error) {
            console.error(`Failed to cleanup tenant ${tenantId}:`, error);
        }
    }
    async cleanupTenantInfrastructure(tenant) {
        console.log(`🧹 Cleaning up tenant infrastructure: ${tenant.id}`);
        // In a real implementation, this would:
        // 1. Delete RDS instance
        // 2. Delete S3 bucket and all objects
        // 3. Delete Kubernetes namespace and all resources
        // 4. Delete Git repository
        // 5. Cleanup IAM roles and policies
        console.log(`✅ Tenant infrastructure cleanup completed: ${tenant.id}`);
    }
    async createSimpleTenant(data) {
        const tenantData = {
            id: (0, uuid_1.v4)(),
            name: data.name,
            slug: data.slug,
            region: (data.region || 'us-east-1'),
            plan: (data.plan || 'starter'),
            status: 'active',
            databaseUrl: `postgresql://tenant:password@localhost:5432/tenant_${(0, uuid_1.v4)()}`,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return this.createTenantRecord(tenantData);
    }
    async createSimpleTenantRaw(data) {
        const tenantData = {
            id: (0, uuid_1.v4)(),
            name: data.name,
            slug: data.slug,
            region: (data.region || 'us-east-1'),
            plan: (data.plan || 'starter'),
            status: 'active',
            databaseUrl: `postgresql://tenant:password@localhost:5432/tenant_${(0, uuid_1.v4)()}`,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return this.createTenantRecordRaw(tenantData);
    }
    async createTenantRecordRaw(tenantData) {
        const query = `
      INSERT INTO tenants (id, name, slug, region, plan, status, database_url, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
        const values = [
            tenantData.id,
            tenantData.name,
            tenantData.slug,
            tenantData.region,
            tenantData.plan,
            tenantData.status || 'active',
            tenantData.databaseUrl,
            tenantData.createdAt,
            tenantData.updatedAt
        ];
        try {
            const result = await this.dbManager.query(query, values);
            return this.transformTenantRow(result.rows[0]);
        }
        catch (error) {
            if (error.code === '23505') { // Unique constraint violation
                if (error.constraint?.includes('slug')) {
                    const customError = new Error(`Tenant slug '${tenantData.slug}' already exists`);
                    customError.statusCode = 409;
                    throw customError;
                }
                if (error.constraint?.includes('name')) {
                    const customError = new Error(`Tenant name '${tenantData.name}' already exists`);
                    customError.statusCode = 409;
                    throw customError;
                }
                const customError = new Error('Tenant with this data already exists');
                customError.statusCode = 409;
                throw customError;
            }
            throw error;
        }
    }
    transformTenantRow(row) {
        // Return row with both camelCase and snake_case fields for compatibility
        const transformed = {
            ...row,
            databaseUrl: row.database_url,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        // Keep snake_case fields for test compatibility
        transformed.created_at = row.created_at;
        transformed.updated_at = row.updated_at;
        transformed.database_url = row.database_url;
        return transformed;
    }
}
exports.TenantService = TenantService;
//# sourceMappingURL=tenant.service.js.map