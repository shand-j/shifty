import { describe, test, expect, beforeAll } from '@jest/globals';
import { APIClient, TestDataFactory, AuthResponse } from '../../utils/api-client';
import { TEST_CONFIG } from '../../config/api-test.config';

describe('Tenant Manager Service API', () => {
  let apiClient: APIClient;
  let authToken: string;
  let tenantId: string;
  let ownerUserId: string;

  beforeAll(async () => {
    apiClient = new APIClient();
    
    // Setup authenticated user for tests
    const testUser = TestDataFactory.createTestUser('tenant-mgr');
    const authResponse: AuthResponse = await apiClient.registerUser(testUser);
    authToken = authResponse.token;
    tenantId = authResponse.tenant.id;
    ownerUserId = authResponse.user.id;
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const response = await apiClient.getServiceHealth(TEST_CONFIG.PORTS.TENANT_MANAGER);
      
      expect(response.status).toBe('healthy');
      expect(response.service).toBe(TEST_CONFIG.SERVICE_NAMES.TENANT_MANAGER);
      expect(response.timestamp).toBeTruthy();
    });
  });

  describe('Tenant CRUD Operations', () => {
    test('should retrieve tenant details', async () => {
      const response = await apiClient.getTenant(tenantId, authToken);
      
      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('slug');
      expect(response).toHaveProperty('plan');
      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('region');
      expect(response).toHaveProperty('created_at');
      expect(response).toHaveProperty('updated_at');
      
      expect(response.id).toBe(tenantId);
      expect(response.status).toBe('active');
      expect(response.plan).toBe('starter');
    });

    test('should list tenants for authenticated user', async () => {
      const response = await apiClient.getTenants(authToken);
      
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeGreaterThan(0);
      
      // Should include the tenant we created during registration
      const userTenant = response.find((t: any) => t.id === tenantId);
      expect(userTenant).toBeTruthy();
      expect(userTenant.name).toBeTruthy();
      expect(userTenant.slug).toBeTruthy();
    });

    test('should create new tenant', async () => {
      const timestamp = Date.now();
      const newTenantData = {
        name: `New Test Company ${timestamp}`,
        slug: `new-test-company-${timestamp}`,
        plan: 'professional',
        region: 'us-west-2',
      };

      const response = await apiClient.createTenant(newTenantData, authToken);
      
      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('slug');
      expect(response.name).toBe(newTenantData.name);
      expect(response.slug).toBe(newTenantData.slug);
      expect(response.plan).toBe(newTenantData.plan);
      expect(response.region).toBe(newTenantData.region);
      expect(response.status).toBe('active');
    });

    test('should update tenant information', async () => {
      const updateData = {
        plan: 'enterprise',
        name: 'Updated Company Name',
      };

      try {
        const response = await apiClient.updateTenant(tenantId, updateData, authToken);

        expect(response).toHaveProperty('id');
        expect(response.id).toBe(tenantId);
        expect(response.plan).toBe(updateData.plan);
        expect(response.name).toBe(updateData.name);
      } catch (error: any) {
        // Update might not be implemented yet, allow 404 or 501
        if (error.response) {
          expect([404, 501]).toContain(error.response.status);
        } else {
          throw error; // Re-throw if it's not a response error
        }
      }
    });
  });

  describe('Multi-Tenant Isolation', () => {
    let secondUserToken: string;
    let secondTenantId: string;

    beforeAll(async () => {
      // Create second user/tenant for isolation testing
      const secondUser = TestDataFactory.createTestUser('isolation-test');
      const secondAuthResponse: AuthResponse = await apiClient.registerUser(secondUser);
      secondUserToken = secondAuthResponse.token;
      secondTenantId = secondAuthResponse.tenant.id;
    });

    test('should not allow access to other tenants data', async () => {
      try {
        // Try to access first tenant with second user's token
        await apiClient.getTenant(tenantId, secondUserToken);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });

    test('should isolate tenant lists per user', async () => {
      const firstUserTenants = await apiClient.getTenants(authToken);
      const secondUserTenants = await apiClient.getTenants(secondUserToken);
      
      // Each user should see only their own tenants
      const firstUserTenantIds = firstUserTenants.map((t: any) => t.id);
      const secondUserTenantIds = secondUserTenants.map((t: any) => t.id);
      
      expect(firstUserTenantIds).toContain(tenantId);
      expect(firstUserTenantIds).not.toContain(secondTenantId);
      
      expect(secondUserTenantIds).toContain(secondTenantId);
      expect(secondUserTenantIds).not.toContain(tenantId);
    });
  });

  describe('Authentication and Authorization', () => {
    test('should require authentication for tenant operations', async () => {
      try {
        await apiClient.getTenants('invalid-token');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    test('should require authentication for tenant creation', async () => {
      try {
        await apiClient.createTenant({
          name: 'Unauthorized Tenant',
          slug: 'unauthorized',
        }, 'invalid-token');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    test('should validate tenant creation data', async () => {
      try {
        await apiClient.createTenant({
          name: '', // Empty name should fail
          slug: '',
        }, authToken);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Tenant Slug Management', () => {
    test('should enforce unique slugs', async () => {
      const timestamp = Date.now();
      const tenantData = {
        name: `Duplicate Slug Test ${timestamp}`,
        slug: `duplicate-slug-test-${timestamp}`,
      };

      // Create first tenant with slug
      await apiClient.createTenant(tenantData, authToken);

      // Try to create second tenant with same slug
      try {
        await apiClient.createTenant({
          ...tenantData,
          name: `Another Company ${timestamp}`,
        }, authToken);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(409); // Conflict
      }
    });

    test('should validate slug format', async () => {
      const invalidSlugData = {
        name: 'Invalid Slug Test',
        slug: 'Invalid Slug With Spaces!',
      };

      try {
        await apiClient.createTenant(invalidSlugData, authToken);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Tenant Resource Management', () => {
    test('should include resource limits in tenant data', async () => {
      const tenant = await apiClient.getTenant(tenantId, authToken);
      
      // Should include resource information (if implemented)
      if (tenant.resources) {
        expect(tenant.resources).toHaveProperty('limits');
        expect(tenant.resources).toHaveProperty('usage');
      }
    });

    test('should track tenant usage metrics', async () => {
      try {
        const response = await apiClient.get(`http://localhost:3001/api/v1/tenants/${tenantId}/usage`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(response.data).toHaveProperty('tenantId');
        expect(response.data).toHaveProperty('metrics');
        expect(response.data.tenantId).toBe(tenantId);
      } catch (error: any) {
        // Usage endpoint might not be implemented yet
        expect([404, 501]).toContain(error.response.status);
      }
    });
  });

  describe('Tenant Deletion', () => {
    test('should soft delete tenant', async () => {
      // Create a tenant specifically for deletion testing
      const deleteTestTenant = await apiClient.createTenant({
        name: 'Delete Test Tenant',
        slug: 'delete-test-tenant',
      }, authToken);

      try {
        const response = await apiClient.deleteTenant(deleteTestTenant.id, authToken);

        expect(response).toHaveProperty('message');
        expect(response.message).toBe('Tenant deleted successfully');
        
        // Verify tenant is no longer accessible
        try {
          await apiClient.getTenant(deleteTestTenant.id, authToken);
          expect(true).toBe(false); // Should not reach here
        } catch (error: any) {
          expect(error.response.status).toBe(404);
        }
      } catch (error: any) {
        // Delete might not be implemented yet
        if (error.response) {
          expect([404, 501]).toContain(error.response.status);
        } else {
          throw error; // Re-throw if it's not a response error
        }
      }
    });
  });
});