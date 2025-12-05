import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';

// Mock pg module before any imports
const mockQuery = jest.fn<() => Promise<any>>();
const mockConnect = jest.fn<() => Promise<any>>();
const mockEnd = jest.fn<() => Promise<void>>();
const mockRelease = jest.fn<() => void>();

jest.mock('pg', () => {
  return {
    Pool: jest.fn(() => ({
      query: mockQuery,
      connect: mockConnect,
      end: mockEnd
    })),
    Client: jest.fn(() => ({
      connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      query: jest.fn<() => Promise<any>>(),
      end: jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
    }))
  };
});

// Import after mocking
import { Pool } from 'pg';
import { DatabaseManager, MigrationRunner } from '../../../../packages/database/src/index';

describe('DatabaseManager', () => {
  let dbManager: DatabaseManager;
  let mockPoolClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock pool client
    mockPoolClient = {
      query: jest.fn<() => Promise<any>>().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: mockRelease
    };
    
    // Configure mock behaviors
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    mockConnect.mockResolvedValue(mockPoolClient);
    mockEnd.mockResolvedValue(undefined);
    
    dbManager = new DatabaseManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    test('should create platform pool with correct configuration', async () => {
      await dbManager.initialize();

      expect(Pool).toHaveBeenCalledWith(expect.objectContaining({
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      }));
    });

    test('should use DATABASE_URL from environment if set', async () => {
      const originalEnv = process.env.DATABASE_URL;
      process.env.DATABASE_URL = 'postgresql://custom:pass@host:5432/db';

      jest.clearAllMocks();
      const freshManager = new DatabaseManager();
      await freshManager.initialize();

      expect(Pool).toHaveBeenCalledWith(expect.objectContaining({
        connectionString: 'postgresql://custom:pass@host:5432/db'
      }));

      process.env.DATABASE_URL = originalEnv;
    });

    test('should use default connection string when DATABASE_URL not set', async () => {
      const originalEnv = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;

      jest.clearAllMocks();
      const freshManager = new DatabaseManager();
      await freshManager.initialize();

      expect(Pool).toHaveBeenCalledWith(expect.objectContaining({
        connectionString: 'postgresql://postgres:postgres@localhost:5432/shifty_platform'
      }));

      process.env.DATABASE_URL = originalEnv;
    });
  });

  describe('query', () => {
    test('should execute query on platform pool', async () => {
      await dbManager.initialize();
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: '1', name: 'Test' }],
        rowCount: 1
      });

      const result = await dbManager.query('SELECT * FROM test WHERE id = $1', ['1']);

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', ['1']);
      expect(result.rows).toEqual([{ id: '1', name: 'Test' }]);
    });

    test('should throw error if database not initialized', async () => {
      const uninitializedManager = new DatabaseManager();

      await expect(uninitializedManager.query('SELECT 1'))
        .rejects.toThrow('Database not initialized');
    });
  });

  describe('getClient', () => {
    test('should return pool client', async () => {
      await dbManager.initialize();
      const client = await dbManager.getClient();

      expect(mockConnect).toHaveBeenCalled();
      expect(client).toBe(mockPoolClient);
    });

    test('should throw error if database not initialized', async () => {
      const uninitializedManager = new DatabaseManager();

      await expect(uninitializedManager.getClient())
        .rejects.toThrow('Database not initialized');
    });
  });

  describe('getTenantPool', () => {
    test('should create new pool for new tenant', async () => {
      await dbManager.initialize();
      const tenantDatabaseUrl = 'postgresql://tenant:pass@host:5432/tenant_db';
      
      await dbManager.getTenantPool('tenant-123', tenantDatabaseUrl);

      expect(Pool).toHaveBeenCalledWith(expect.objectContaining({
        connectionString: tenantDatabaseUrl,
        max: 10
      }));
    });

    test('should reuse existing pool for same tenant', async () => {
      await dbManager.initialize();
      const tenantDatabaseUrl = 'postgresql://tenant:pass@host:5432/tenant_db';
      
      await dbManager.getTenantPool('tenant-123', tenantDatabaseUrl);
      const callCountBefore = (Pool as jest.MockedClass<typeof Pool>).mock.calls.length;
      
      await dbManager.getTenantPool('tenant-123');
      
      // Should not create a new pool
      expect((Pool as jest.MockedClass<typeof Pool>).mock.calls.length).toBe(callCountBefore);
    });

    test('should throw error if database URL not provided for new tenant', async () => {
      await dbManager.initialize();

      await expect(dbManager.getTenantPool('new-tenant'))
        .rejects.toThrow('Database URL required for tenant: new-tenant');
    });
  });

  describe('transaction', () => {
    test('should execute callback within transaction', async () => {
      await dbManager.initialize();
      const callback = jest.fn<() => Promise<any>>().mockResolvedValue({ success: true });

      const result = await dbManager.transaction(callback);

      expect(mockPoolClient.query).toHaveBeenCalledWith('BEGIN');
      expect(callback).toHaveBeenCalledWith(mockPoolClient);
      expect(mockPoolClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRelease).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    test('should rollback on error', async () => {
      await dbManager.initialize();
      const callback = jest.fn<() => Promise<any>>().mockRejectedValue(new Error('Transaction failed'));

      await expect(dbManager.transaction(callback))
        .rejects.toThrow('Transaction failed');

      expect(mockPoolClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockPoolClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRelease).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    test('should close platform pool', async () => {
      await dbManager.initialize();
      await dbManager.close();

      expect(mockEnd).toHaveBeenCalled();
    });

    test('should handle closing when not initialized', async () => {
      const uninitializedManager = new DatabaseManager();
      await expect(uninitializedManager.close()).resolves.not.toThrow();
    });
  });

  describe('healthCheck', () => {
    test('should return healthy status when database responds', async () => {
      await dbManager.initialize();
      mockQuery.mockResolvedValueOnce({ rows: [{ '?column?': 1 }], rowCount: 1 });

      const health = await dbManager.healthCheck();

      expect(health.platform).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith('SELECT 1');
    });

    test('should return unhealthy status when query fails', async () => {
      await dbManager.initialize();
      mockQuery.mockRejectedValueOnce(new Error('Connection failed'));

      const health = await dbManager.healthCheck();

      expect(health.platform).toBe(false);
    });
  });
});

describe('MigrationRunner', () => {
  let dbManager: DatabaseManager;
  let migrationRunner: MigrationRunner;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    mockConnect.mockResolvedValue({
      query: jest.fn<() => Promise<any>>().mockResolvedValue({ rows: [] }),
      release: mockRelease
    });
    mockEnd.mockResolvedValue(undefined);
    
    dbManager = new DatabaseManager();
    await dbManager.initialize();
    migrationRunner = new MigrationRunner(dbManager);
  });

  describe('runPlatformMigrations', () => {
    test('should create migrations table', async () => {
      await migrationRunner.runPlatformMigrations();

      const calls = mockQuery.mock.calls.map((c: any) => c[0]);
      const migrationTableCall = calls.find((sql: string) => 
        sql.includes('CREATE TABLE IF NOT EXISTS migrations')
      );
      expect(migrationTableCall).toBeDefined();
    });

    test('should execute migrations when not already run', async () => {
      // First call returns no existing migration, subsequent calls succeed
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });

      await migrationRunner.runPlatformMigrations();

      const calls = mockQuery.mock.calls.map((c: any) => c[0]);
      const insertCalls = calls.filter((sql: string) => 
        sql.includes('INSERT INTO migrations')
      );
      expect(insertCalls.length).toBeGreaterThan(0);
    });

    test('should create tenants table', async () => {
      await migrationRunner.runPlatformMigrations();

      const calls = mockQuery.mock.calls.map((c: any) => c[0]);
      const tenantsCall = calls.find((sql: string) => 
        sql.includes('CREATE TABLE IF NOT EXISTS tenants')
      );
      expect(tenantsCall).toBeDefined();
    });

    test('should create users table', async () => {
      await migrationRunner.runPlatformMigrations();

      const calls = mockQuery.mock.calls.map((c: any) => c[0]);
      const usersCall = calls.find((sql: string) => 
        sql.includes('CREATE TABLE IF NOT EXISTS users')
      );
      expect(usersCall).toBeDefined();
    });
  });
});
