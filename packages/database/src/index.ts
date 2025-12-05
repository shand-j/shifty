import { Pool, Client, PoolClient, QueryResult } from 'pg';
import { DatabaseConfig, getDatabaseConfig, validateProductionConfig } from '@shifty/shared';

// Validate configuration on startup
try {
  validateProductionConfig();
} catch (error) {
  console.error('Configuration validation failed:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export class DatabaseManager {
  private platformPool: Pool | null = null;
  private tenantPools: Map<string, Pool> = new Map();

  async initialize(): Promise<void> {
    // Use centralized database configuration with production validation
    const dbConfig = getDatabaseConfig();
    
    this.platformPool = new Pool({
      connectionString: dbConfig.connectionString,
      max: dbConfig.maxConnections,
      idleTimeoutMillis: dbConfig.idleTimeoutMillis,
      connectionTimeoutMillis: dbConfig.connectionTimeoutMillis,
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
      },
      {
        name: '007_create_healing_attempts_table',
        sql: `
          CREATE TABLE IF NOT EXISTS tenant_data.healing_attempts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
            url TEXT NOT NULL,
            original_selector TEXT NOT NULL,
            healed_selector TEXT,
            success BOOLEAN NOT NULL DEFAULT false,
            confidence DECIMAL(5,4) DEFAULT 0.0,
            strategy VARCHAR(100) NOT NULL,
            execution_time INTEGER NOT NULL,
            error_message TEXT,
            browser_type VARCHAR(50) DEFAULT 'chromium',
            created_at TIMESTAMP DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_healing_attempts_tenant_id ON tenant_data.healing_attempts(tenant_id);
          CREATE INDEX IF NOT EXISTS idx_healing_attempts_success ON tenant_data.healing_attempts(success);
          CREATE INDEX IF NOT EXISTS idx_healing_attempts_strategy ON tenant_data.healing_attempts(strategy);
          CREATE INDEX IF NOT EXISTS idx_healing_attempts_created_at ON tenant_data.healing_attempts(created_at);
        `
      },
      {
        name: '008_create_test_generation_requests_table',
        sql: `
          CREATE TABLE IF NOT EXISTS tenant_data.test_generation_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
            url TEXT NOT NULL,
            requirements TEXT NOT NULL,
            test_type VARCHAR(50) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            generated_code TEXT,
            selectors JSONB DEFAULT '[]',
            metadata JSONB DEFAULT '{}',
            validation_result JSONB,
            error_message TEXT,
            execution_time INTEGER,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            completed_at TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_test_gen_tenant_id ON tenant_data.test_generation_requests(tenant_id);
          CREATE INDEX IF NOT EXISTS idx_test_gen_status ON tenant_data.test_generation_requests(status);
          CREATE INDEX IF NOT EXISTS idx_test_gen_test_type ON tenant_data.test_generation_requests(test_type);
          CREATE INDEX IF NOT EXISTS idx_test_gen_created_at ON tenant_data.test_generation_requests(created_at);
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

// ============================================================
// HEALING ATTEMPTS REPOSITORY
// ============================================================

export interface HealingAttemptRecord {
  id: string;
  tenantId: string;
  url: string;
  originalSelector: string;
  healedSelector?: string;
  success: boolean;
  confidence: number;
  strategy: string;
  executionTime: number;
  errorMessage?: string;
  browserType?: string;
  createdAt: Date;
}

export interface HealingStats {
  totalAttempts: number;
  successRate: number;
  averageExecutionTime: number;
  strategyBreakdown: Array<{ strategy: string; count: number; successRate: number }>;
  recentAttempts: HealingAttemptRecord[];
}

export class HealingAttemptsRepository {
  constructor(private dbManager: DatabaseManager) {}

  async create(tenantId: string, databaseUrl: string, attempt: Omit<HealingAttemptRecord, 'id' | 'createdAt'>): Promise<HealingAttemptRecord> {
    const result = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      `INSERT INTO tenant_data.healing_attempts 
        (tenant_id, url, original_selector, healed_selector, success, confidence, strategy, execution_time, error_message, browser_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, tenant_id, url, original_selector, healed_selector, success, confidence, strategy, execution_time, error_message, browser_type, created_at`,
      [
        attempt.tenantId,
        attempt.url,
        attempt.originalSelector,
        attempt.healedSelector || null,
        attempt.success,
        attempt.confidence,
        attempt.strategy,
        attempt.executionTime,
        attempt.errorMessage || null,
        attempt.browserType || 'chromium'
      ]
    );

    return this.mapRowToRecord(result.rows[0]);
  }

  async getById(tenantId: string, databaseUrl: string, id: string): Promise<HealingAttemptRecord | null> {
    const result = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      'SELECT * FROM tenant_data.healing_attempts WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    return result.rows.length > 0 ? this.mapRowToRecord(result.rows[0]) : null;
  }

  async getStats(tenantId: string, databaseUrl: string): Promise<HealingStats> {
    // Get overall stats
    const overallResult = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      `SELECT 
        COUNT(*) as total_attempts,
        AVG(CASE WHEN success THEN 1 ELSE 0 END)::decimal * 100 as success_rate,
        AVG(execution_time) as avg_execution_time
       FROM tenant_data.healing_attempts 
       WHERE tenant_id = $1`,
      [tenantId]
    );

    // Get strategy breakdown
    const strategyResult = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      `SELECT 
        strategy,
        COUNT(*) as count,
        AVG(CASE WHEN success THEN 1 ELSE 0 END)::decimal * 100 as success_rate
       FROM tenant_data.healing_attempts 
       WHERE tenant_id = $1
       GROUP BY strategy
       ORDER BY count DESC`,
      [tenantId]
    );

    // Get recent attempts
    const recentResult = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      `SELECT * FROM tenant_data.healing_attempts 
       WHERE tenant_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [tenantId]
    );

    const overall = overallResult.rows[0] || { total_attempts: 0, success_rate: 0, avg_execution_time: 0 };

    return {
      totalAttempts: parseInt(overall.total_attempts) || 0,
      successRate: parseFloat(overall.success_rate) || 0,
      averageExecutionTime: parseFloat(overall.avg_execution_time) || 0,
      strategyBreakdown: strategyResult.rows.map(row => ({
        strategy: row.strategy,
        count: parseInt(row.count),
        successRate: parseFloat(row.success_rate) || 0
      })),
      recentAttempts: recentResult.rows.map(row => this.mapRowToRecord(row))
    };
  }

  private mapRowToRecord(row: any): HealingAttemptRecord {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      url: row.url,
      originalSelector: row.original_selector,
      healedSelector: row.healed_selector,
      success: row.success,
      confidence: parseFloat(row.confidence),
      strategy: row.strategy,
      executionTime: parseInt(row.execution_time),
      errorMessage: row.error_message,
      browserType: row.browser_type,
      createdAt: new Date(row.created_at)
    };
  }
}

// ============================================================
// TEST GENERATION REQUESTS REPOSITORY
// ============================================================

export interface TestGenerationRequestRecord {
  id: string;
  tenantId: string;
  url: string;
  requirements: string;
  testType: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generatedCode?: string;
  selectors: string[];
  metadata: Record<string, any>;
  validationResult?: Record<string, any>;
  errorMessage?: string;
  executionTime?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export class TestGenerationRequestsRepository {
  constructor(private dbManager: DatabaseManager) {}

  async create(
    tenantId: string, 
    databaseUrl: string, 
    request: Pick<TestGenerationRequestRecord, 'id' | 'tenantId' | 'url' | 'requirements' | 'testType'>
  ): Promise<TestGenerationRequestRecord> {
    const result = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      `INSERT INTO tenant_data.test_generation_requests 
        (id, tenant_id, url, requirements, test_type, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [request.id, request.tenantId, request.url, request.requirements, request.testType]
    );

    return this.mapRowToRecord(result.rows[0]);
  }

  async updateStatus(
    tenantId: string,
    databaseUrl: string,
    id: string,
    status: string,
    updates?: {
      generatedCode?: string;
      selectors?: string[];
      metadata?: Record<string, any>;
      validationResult?: Record<string, any>;
      errorMessage?: string;
      executionTime?: number;
    }
  ): Promise<TestGenerationRequestRecord | null> {
    const setClauses = ['status = $3', 'updated_at = NOW()'];
    const params: any[] = [tenantId, id, status];
    let paramIndex = 4;

    if (status === 'completed' || status === 'failed') {
      setClauses.push('completed_at = NOW()');
    }

    if (updates?.generatedCode !== undefined) {
      setClauses.push(`generated_code = $${paramIndex++}`);
      params.push(updates.generatedCode);
    }

    if (updates?.selectors !== undefined) {
      setClauses.push(`selectors = $${paramIndex++}`);
      params.push(JSON.stringify(updates.selectors));
    }

    if (updates?.metadata !== undefined) {
      setClauses.push(`metadata = $${paramIndex++}`);
      params.push(JSON.stringify(updates.metadata));
    }

    if (updates?.validationResult !== undefined) {
      setClauses.push(`validation_result = $${paramIndex++}`);
      params.push(JSON.stringify(updates.validationResult));
    }

    if (updates?.errorMessage !== undefined) {
      setClauses.push(`error_message = $${paramIndex++}`);
      params.push(updates.errorMessage);
    }

    if (updates?.executionTime !== undefined) {
      setClauses.push(`execution_time = $${paramIndex++}`);
      params.push(updates.executionTime);
    }

    const result = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      `UPDATE tenant_data.test_generation_requests 
       SET ${setClauses.join(', ')}
       WHERE tenant_id = $1 AND id = $2
       RETURNING *`,
      params
    );

    return result.rows.length > 0 ? this.mapRowToRecord(result.rows[0]) : null;
  }

  async getById(tenantId: string, databaseUrl: string, id: string): Promise<TestGenerationRequestRecord | null> {
    const result = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      'SELECT * FROM tenant_data.test_generation_requests WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    return result.rows.length > 0 ? this.mapRowToRecord(result.rows[0]) : null;
  }

  async getHistory(tenantId: string, databaseUrl: string, limit: number = 10, offset: number = 0): Promise<TestGenerationRequestRecord[]> {
    const result = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      `SELECT * FROM tenant_data.test_generation_requests 
       WHERE tenant_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );

    return result.rows.map(row => this.mapRowToRecord(row));
  }

  private mapRowToRecord(row: any): TestGenerationRequestRecord {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      url: row.url,
      requirements: row.requirements,
      testType: row.test_type,
      status: row.status,
      generatedCode: row.generated_code,
      selectors: row.selectors || [],
      metadata: row.metadata || {},
      validationResult: row.validation_result,
      errorMessage: row.error_message,
      executionTime: row.execution_time ? parseInt(row.execution_time) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined
    };
  }
}