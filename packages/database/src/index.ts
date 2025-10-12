import { Pool, Client, PoolClient, QueryResult } from 'pg';
import { DatabaseConfig } from '@shifty/shared';

export class DatabaseManager {
  private platformPool: Pool | null = null;
  private tenantPools: Map<string, Pool> = new Map();

  async initialize(): Promise<void> {
    // Initialize platform database connection
    this.platformPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/shifty_platform',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    console.log('📊 Database Manager initialized');
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    if (!this.platformPool) {
      throw new Error('Database not initialized');
    }
    
    return await this.platformPool.query(text, params);
  }

  async getClient(): Promise<PoolClient> {
    if (!this.platformPool) {
      throw new Error('Database not initialized');
    }
    
    return await this.platformPool.connect();
  }

  async getTenantPool(tenantId: string, databaseUrl?: string): Promise<Pool> {
    if (this.tenantPools.has(tenantId)) {
      return this.tenantPools.get(tenantId)!;
    }

    if (!databaseUrl) {
      throw new Error(`Database URL required for tenant: ${tenantId}`);
    }

    const pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.tenantPools.set(tenantId, pool);
    return pool;
  }

  async queryTenant(tenantId: string, databaseUrl: string, text: string, params?: any[]): Promise<QueryResult> {
    const pool = await this.getTenantPool(tenantId, databaseUrl);
    return await pool.query(text, params);
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.platformPool) {
      throw new Error('Database not initialized');
    }

    const client = await this.platformPool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async tenantTransaction<T>(
    tenantId: string,
    databaseUrl: string,
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const pool = await this.getTenantPool(tenantId, databaseUrl);
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    // Close platform pool
    if (this.platformPool) {
      await this.platformPool.end();
      this.platformPool = null;
    }

    // Close all tenant pools
    for (const [tenantId, pool] of this.tenantPools) {
      await pool.end();
    }
    this.tenantPools.clear();

    console.log('📊 Database connections closed');
  }

  async healthCheck(): Promise<{ platform: boolean; tenants: Record<string, boolean> }> {
    const health = {
      platform: false,
      tenants: {} as Record<string, boolean>
    };

    // Check platform database
    try {
      if (this.platformPool) {
        await this.platformPool.query('SELECT 1');
        health.platform = true;
      }
    } catch (error) {
      console.error('Platform database health check failed:', error);
    }

    // Check tenant databases
    for (const [tenantId, pool] of this.tenantPools) {
      try {
        await pool.query('SELECT 1');
        health.tenants[tenantId] = true;
      } catch (error) {
        console.error(`Tenant database health check failed for ${tenantId}:`, error);
        health.tenants[tenantId] = false;
      }
    }

    return health;
  }
}

export class MigrationRunner {
  constructor(private dbManager: DatabaseManager) {}

  async runPlatformMigrations(): Promise<void> {
    console.log('🔄 Running platform migrations...');
    
    // Create migrations table if not exists
    await this.dbManager.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const migrations = [
      {
        name: '001_create_tenants_table',
        sql: `
          CREATE TABLE IF NOT EXISTS tenants (
            id UUID PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(100) UNIQUE NOT NULL,
            region VARCHAR(50) NOT NULL,
            plan VARCHAR(50) NOT NULL,
            database_url TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
          CREATE INDEX IF NOT EXISTS idx_tenants_region ON tenants(region);
        `
      },
      {
        name: '002_create_users_table',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            permissions JSONB DEFAULT '[]',
            is_active BOOLEAN DEFAULT true,
            last_login_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
          
          CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);
          CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
        `
      }
    ];

    for (const migration of migrations) {
      const result = await this.dbManager.query(
        'SELECT id FROM migrations WHERE name = $1',
        [migration.name]
      );

      if (result.rows.length === 0) {
        console.log(`📝 Running migration: ${migration.name}`);
        await this.dbManager.query(migration.sql);
        await this.dbManager.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration.name]
        );
        console.log(`✅ Migration completed: ${migration.name}`);
      }
    }

    console.log('✅ Platform migrations completed');
  }

  async runTenantMigrations(tenantId: string, databaseUrl: string): Promise<void> {
    console.log(`🔄 Running tenant migrations for: ${tenantId}`);

    // Create migrations table in tenant database
    await this.dbManager.queryTenant(tenantId, databaseUrl, `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const migrations = [
      {
        name: '001_create_tenant_schemas',
        sql: `
          CREATE SCHEMA IF NOT EXISTS tenant_data;
          CREATE SCHEMA IF NOT EXISTS ai_models;
          CREATE SCHEMA IF NOT EXISTS test_executions;
          CREATE SCHEMA IF NOT EXISTS generated_code;
        `
      },
      {
        name: '002_create_projects_table',
        sql: `
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
        `
      },
      {
        name: '003_create_test_suites_table',
        sql: `
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
          
          CREATE INDEX IF NOT EXISTS idx_test_suites_project_id ON tenant_data.test_suites(project_id);
          CREATE INDEX IF NOT EXISTS idx_test_suites_type ON tenant_data.test_suites(type);
        `
      },
      {
        name: '004_create_test_executions_table',
        sql: `
          CREATE TABLE IF NOT EXISTS test_executions.executions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            test_suite_id UUID NOT NULL,
            status VARCHAR(50) NOT NULL,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            results JSONB,
            artifacts JSONB DEFAULT '[]',
            healing_events JSONB DEFAULT '[]',
            execution_time INTEGER,
            error_message TEXT,
            created_at TIMESTAMP DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_executions_test_suite_id ON test_executions.executions(test_suite_id);
          CREATE INDEX IF NOT EXISTS idx_executions_status ON test_executions.executions(status);
          CREATE INDEX IF NOT EXISTS idx_executions_created_at ON test_executions.executions(created_at);
        `
      },
      {
        name: '005_create_ai_models_table',
        sql: `
          CREATE TABLE IF NOT EXISTS ai_models.models (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            type VARCHAR(50) NOT NULL,
            model_data BYTEA,
            training_metadata JSONB DEFAULT '{}',
            performance_metrics JSONB DEFAULT '{}',
            last_trained TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_ai_models_type ON ai_models.models(type);
        `
      },
      {
        name: '006_create_selector_knowledge_table',
        sql: `
          CREATE TABLE IF NOT EXISTS ai_models.selector_knowledge (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID,
            original_selector TEXT NOT NULL,
            healed_selector TEXT,
            success_rate DECIMAL(5,4) DEFAULT 0.0,
            confidence_score DECIMAL(5,4) DEFAULT 0.0,
            usage_count INTEGER DEFAULT 0,
            last_used TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_selector_knowledge_project_id ON ai_models.selector_knowledge(project_id);
          CREATE INDEX IF NOT EXISTS idx_selector_knowledge_original ON ai_models.selector_knowledge(original_selector);
        `
      }
    ];

    for (const migration of migrations) {
      const result = await this.dbManager.queryTenant(
        tenantId,
        databaseUrl,
        'SELECT id FROM migrations WHERE name = $1',
        [migration.name]
      );

      if (result.rows.length === 0) {
        console.log(`📝 Running tenant migration: ${migration.name}`);
        await this.dbManager.queryTenant(tenantId, databaseUrl, migration.sql);
        await this.dbManager.queryTenant(
          tenantId,
          databaseUrl,
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration.name]
        );
        console.log(`✅ Tenant migration completed: ${migration.name}`);
      }
    }

    console.log(`✅ Tenant migrations completed for: ${tenantId}`);
  }
}