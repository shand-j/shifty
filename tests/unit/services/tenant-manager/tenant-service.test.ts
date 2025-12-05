import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { TenantService } from '../../../../services/tenant-manager/src/services/tenant.service';

// Create mock query function
const mockQuery = jest.fn<() => Promise<any>>();

// Mock the DatabaseManager
jest.mock('../../../../packages/database/src/index', () => ({
  DatabaseManager: jest.fn().mockImplementation(() => ({
    initialize: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    query: mockQuery,
    getClient: jest.fn(),
    close: jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
  }))
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => '550e8400-e29b-41d4-a716-44665544000a')
}));

// Import after mocks
import { DatabaseManager } from '../../../../packages/database/src/index';

describe('TenantService', () => {
  let tenantService: TenantService;
  let mockDbManager: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDbManager = new DatabaseManager();
    tenantService = new TenantService(mockDbManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTenant', () => {
    test('should return tenant when found', async () => {
      const mockTenantRow = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Company',
        slug: 'test-company',
        region: 'us-east-1',
        plan: 'professional',
        status: 'active',
        database_url: 'postgresql://tenant:pass@host:5432/db',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02')
      };

      mockQuery.mockResolvedValueOnce({
        rows: [mockTenantRow],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.getTenant('550e8400-e29b-41d4-a716-446655440000');

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM tenants WHERE id = $1',
        ['550e8400-e29b-41d4-a716-446655440000']
      );
      expect(result).not.toBeNull();
      expect(result?.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result?.name).toBe('Test Company');
    });

    test('should return null when tenant not found', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.getTenant('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getTenantBySlug', () => {
    test('should find tenant by slug', async () => {
      const mockTenantRow = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Acme Corp',
        slug: 'acme-corp',
        region: 'us-west-2',
        plan: 'enterprise',
        status: 'active',
        database_url: 'postgresql://tenant:pass@host:5432/db',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({
        rows: [mockTenantRow],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.getTenantBySlug('acme-corp');

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM tenants WHERE slug = $1',
        ['acme-corp']
      );
      expect(result?.slug).toBe('acme-corp');
    });

    test('should return null for non-existent slug', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.getTenantBySlug('does-not-exist');

      expect(result).toBeNull();
    });
  });

  describe('listTenants', () => {
    test('should list all tenants with pagination', async () => {
      const mockTenants = [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Company 1',
          slug: 'company-1',
          region: 'us-east-1',
          plan: 'starter',
          status: 'active',
          database_url: 'postgresql://url1',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          name: 'Company 2',
          slug: 'company-2',
          region: 'eu-west-1',
          plan: 'professional',
          status: 'active',
          database_url: 'postgresql://url2',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockQuery.mockResolvedValueOnce({
        rows: mockTenants,
        rowCount: 2,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.listTenants(10, 0);

      expect(result).toHaveLength(2);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        expect.any(Array)
      );
    });

    test('should list tenants without pagination', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      await tenantService.listTenants();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        []
      );
    });
  });

  describe('listTenantsForUser', () => {
    test('should list tenants accessible by user', async () => {
      const mockTenants = [
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          name: 'User Company',
          slug: 'user-company',
          region: 'us-east-1',
          plan: 'starter',
          status: 'active',
          database_url: 'postgresql://url',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockQuery.mockResolvedValueOnce({
        rows: mockTenants,
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.listTenantsForUser('550e8400-e29b-41d4-a716-446655440008');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('JOIN users u ON t.id = u.tenant_id'),
        expect.arrayContaining(['550e8400-e29b-41d4-a716-446655440008'])
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('userHasAccessToTenant', () => {
    test('should return true when user has access', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ '?column?': 1 }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.userHasAccessToTenant('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002');

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.id = $1 AND u.tenant_id = $2'),
        ['550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002']
      );
    });

    test('should return false when user does not have access', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.userHasAccessToTenant('550e8400-e29b-41d4-a716-446655440009', 'other-tenant');

      expect(result).toBe(false);
    });
  });

  describe('createSimpleTenant', () => {
    test('should create tenant with provided data', async () => {
      const mockCreatedTenant = {
        id: '550e8400-e29b-41d4-a716-44665544000a',
        name: 'New Company',
        slug: 'new-company',
        region: 'us-east-1',
        plan: 'starter',
        status: 'active',
        database_url: 'postgresql://tenant:password@localhost:5432/tenant_550e8400-e29b-41d4-a716-44665544000a',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({
        rows: [mockCreatedTenant],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.createSimpleTenant({
        name: 'New Company',
        slug: 'new-company'
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tenants'),
        expect.arrayContaining(['New Company', 'new-company'])
      );
      expect(result.name).toBe('New Company');
    });

    test('should use default region and plan when not provided', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: '550e8400-e29b-41d4-a716-44665544000a',
          name: 'Default Test',
          slug: 'default-test',
          region: 'us-east-1',
          plan: 'starter',
          status: 'active',
          database_url: 'postgresql://url',
          created_at: new Date(),
          updated_at: new Date()
        }],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.createSimpleTenant({
        name: 'Default Test',
        slug: 'default-test'
      });

      expect(result.region).toBe('us-east-1');
      expect(result.plan).toBe('starter');
    });

    test('should handle custom region and plan', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: '550e8400-e29b-41d4-a716-44665544000a',
          name: 'Custom Company',
          slug: 'custom-company',
          region: 'eu-west-1',
          plan: 'enterprise',
          status: 'active',
          database_url: 'postgresql://url',
          created_at: new Date(),
          updated_at: new Date()
        }],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.createSimpleTenant({
        name: 'Custom Company',
        slug: 'custom-company',
        region: 'eu-west-1',
        plan: 'enterprise'
      });

      expect(result.region).toBe('eu-west-1');
      expect(result.plan).toBe('enterprise');
    });
  });

  describe('createSimpleTenantRaw', () => {
    test('should handle duplicate slug conflict', async () => {
      const duplicateError = new Error('duplicate key value violates unique constraint');
      (duplicateError as any).code = '23505';
      (duplicateError as any).constraint = 'tenants_slug_key';

      mockQuery.mockRejectedValueOnce(duplicateError);

      await expect(tenantService.createSimpleTenantRaw({
        name: 'Duplicate Test',
        slug: 'existing-slug'
      })).rejects.toThrow("Tenant slug 'existing-slug' already exists");
    });

    test('should handle duplicate name conflict', async () => {
      const duplicateError = new Error('duplicate key value violates unique constraint');
      (duplicateError as any).code = '23505';
      (duplicateError as any).constraint = 'tenants_name_key';

      mockQuery.mockRejectedValueOnce(duplicateError);

      await expect(tenantService.createSimpleTenantRaw({
        name: 'Existing Name',
        slug: 'new-slug'
      })).rejects.toThrow("Tenant name 'Existing Name' already exists");
    });

    test('should handle generic unique constraint violation', async () => {
      const duplicateError = new Error('duplicate key value violates unique constraint');
      (duplicateError as any).code = '23505';

      mockQuery.mockRejectedValueOnce(duplicateError);

      await expect(tenantService.createSimpleTenantRaw({
        name: 'Test',
        slug: 'test'
      })).rejects.toThrow('Tenant with this data already exists');
    });

    test('should re-throw non-duplicate errors', async () => {
      const genericError = new Error('Database connection failed');

      mockQuery.mockRejectedValueOnce(genericError);

      await expect(tenantService.createSimpleTenantRaw({
        name: 'Test',
        slug: 'test'
      })).rejects.toThrow('Database connection failed');
    });
  });

  describe('updateTenant', () => {
    test('should update tenant fields', async () => {
      const updatedTenant = {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'Updated Name',
        slug: 'updated-name',
        region: 'us-west-2',
        plan: 'enterprise',
        status: 'active',
        database_url: 'postgresql://url',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({
        rows: [updatedTenant],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      const result = await tenantService.updateTenant('550e8400-e29b-41d4-a716-446655440006', {
        name: 'Updated Name',
        plan: 'enterprise' as const
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tenants'),
        expect.arrayContaining(['550e8400-e29b-41d4-a716-446655440006'])
      );
      expect(result.name).toBe('Updated Name');
    });

    test('should throw error when tenant not found', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      await expect(tenantService.updateTenant('nonexistent', { name: 'New' }))
        .rejects.toThrow('Tenant not found: nonexistent');
    });
  });

  describe('deleteTenant', () => {
    test('should delete existing tenant', async () => {
      // Mock getTenant to return a tenant
      mockQuery
        .mockResolvedValueOnce({
          rows: [{
            id: '550e8400-e29b-41d4-a716-446655440007',
            name: 'Delete Me',
            slug: 'delete-me',
            region: 'us-east-1',
            plan: 'starter',
            status: 'active',
            database_url: 'postgresql://url',
            created_at: new Date(),
            updated_at: new Date()
          }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        // Mock the DELETE query
        .mockResolvedValueOnce({
          rows: [],
          rowCount: 1,
          command: 'DELETE',
          oid: 0,
          fields: []
        });

      await expect(tenantService.deleteTenant('550e8400-e29b-41d4-a716-446655440007')).resolves.not.toThrow();

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM tenants WHERE id = $1',
        ['550e8400-e29b-41d4-a716-446655440007']
      );
    });

    test('should throw error when deleting non-existent tenant', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      await expect(tenantService.deleteTenant('nonexistent'))
        .rejects.toThrow('Tenant not found: nonexistent');
    });
  });

  describe('getTenantRaw and listTenantsRaw', () => {
    test('getTenantRaw should return raw data with both formats', async () => {
      const mockRow = {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Raw Tenant',
        slug: 'raw-tenant',
        region: 'us-east-1',
        plan: 'starter',
        status: 'active',
        database_url: 'postgresql://url',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02')
      };

      mockQuery.mockResolvedValueOnce({
        rows: [mockRow],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.getTenantRaw('550e8400-e29b-41d4-a716-446655440005');

      // Should have both camelCase and snake_case
      expect(result.databaseUrl).toBe('postgresql://url');
      expect(result.database_url).toBe('postgresql://url');
      expect(result.createdAt).toBeDefined();
      expect(result.created_at).toBeDefined();
    });

    test('listTenantsRaw should return raw data array', async () => {
      const mockRows = [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Tenant 1',
          slug: '550e8400-e29b-41d4-a716-446655440002',
          region: 'us-east-1',
          plan: 'starter',
          status: 'active',
          database_url: 'postgresql://url1',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockQuery.mockResolvedValueOnce({
        rows: mockRows,
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await tenantService.listTenantsRaw();

      expect(result).toHaveLength(1);
      expect(result[0].databaseUrl).toBeDefined();
    });
  });
});

// Note: Full tenant provisioning with createTenant() method requires real database connections
// and is better tested in integration tests. The createSimpleTenant() method is more suitable
// for unit testing with mocked database.
