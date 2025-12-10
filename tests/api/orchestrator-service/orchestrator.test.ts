import { describe, test, expect, beforeAll } from '@jest/globals';
import { APIClient, TestDataFactory, APIAssertions } from '../../utils/api-client';
import { TEST_CONFIG } from '../../config/api-test.config';

describe('Orchestrator Service API', () => {
  let apiClient: APIClient;
  let authToken: string;
  let tenantId: string;

  beforeAll(async () => {
    apiClient = new APIClient();
    
    // Login with test user
    const loginResponse = await apiClient.login({
      email: 'test@shifty.com',
      password: 'password123'
    });
    
    authToken = loginResponse.token;
    tenantId = loginResponse.user.tenantId;
    apiClient.setAuthToken(authToken);
  });

  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const response = await apiClient.getServiceHealth(TEST_CONFIG.PORTS.ORCHESTRATOR_SERVICE);
      
      APIAssertions.expectValidHealthResponse(response, 'Orchestrator Service');
      expect(response.timestamp).toBeTruthy();
    });
  });

  describe('Test Orchestration', () => {
    test('should accept orchestration request with valid payload', async () => {
      const orchestrateRequest = {
        testFiles: ['tests/example.spec.ts', 'tests/login.spec.ts'],
        workerCount: 2,
        project: 'frontend-tests',
        branch: 'main',
        commitSha: 'abc123',
        metadata: {
          ciProvider: 'github-actions',
          buildNumber: '123'
        }
      };

      const response = await apiClient.orchestrateTests(orchestrateRequest);
      
      expect(response).toHaveProperty('runId');
      expect(response).toHaveProperty('status');
      expect(response.status).toMatch(/queued|pending|running/);
      expect(response).toHaveProperty('shards');
      expect(Array.isArray(response.shards)).toBe(true);
    });

    test('should validate required fields', async () => {
      const invalidRequest = {
        testFiles: [],
        workerCount: 0
      };

      try {
        await apiClient.orchestrateTests(invalidRequest);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('error');
      }
    });

    test('should handle worker count validation', async () => {
      const invalidWorkerCount = {
        testFiles: ['test.spec.ts'],
        workerCount: 0,
        project: 'test'
      };

      try {
        await apiClient.orchestrateTests(invalidWorkerCount);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Results Collection', () => {
    test('should retrieve test run status', async () => {
      // First create a test run
      const orchestrateRequest = {
        testFiles: ['tests/sample.spec.ts'],
        workerCount: 1,
        project: 'status-check-test',
        branch: 'main',
        commitSha: 'status123'
      };

      const orchestrateResponse = await apiClient.orchestrateTests(orchestrateRequest);
      const runId = orchestrateResponse.runId;

      // Now get the status
      const statusResponse = await apiClient.getTestRunStatus(runId);
      
      expect(statusResponse).toHaveProperty('runId', runId);
      expect(statusResponse).toHaveProperty('status');
      expect(statusResponse).toHaveProperty('totalTests');
      expect(statusResponse).toHaveProperty('passedTests');
      expect(statusResponse).toHaveProperty('failedTests');
    });
  });

  describe('Sharding Strategy', () => {
    test('should support duration-aware sharding', async () => {
      const request = {
        testFiles: ['test1.spec.ts', 'test2.spec.ts', 'test3.spec.ts', 'test4.spec.ts'],
        workerCount: 2,
        project: 'sharding-test',
        shardStrategy: 'duration-aware'
      };

      const response = await apiClient.orchestrateTests(request);
      
      expect(response.shards).toHaveLength(2);
      expect(response.shards[0].testFiles).toBeDefined();
      expect(response.shards[1].testFiles).toBeDefined();
    });

    test('should support round-robin sharding', async () => {
      const request = {
        testFiles: ['test1.spec.ts', 'test2.spec.ts', 'test3.spec.ts'],
        workerCount: 3,
        project: 'round-robin-test',
        shardStrategy: 'round-robin'
      };

      const response = await apiClient.orchestrateTests(request);
      
      expect(response.shards).toHaveLength(3);
    });
  });

  describe('Authentication & Authorization', () => {
    test('should reject requests without authentication', async () => {
      const unauthenticatedClient = new APIClient();
      
      try {
        await unauthenticatedClient.orchestrateTests({
          testFiles: ['test.spec.ts'],
          workerCount: 1,
          project: 'auth-test'
        });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    test('should require valid tenant context', async () => {
      const clientWithoutTenant = new APIClient();
      clientWithoutTenant.setAuthToken(authToken);
      // Remove tenant header
      
      try {
        await clientWithoutTenant.orchestrateTests({
          testFiles: ['test.spec.ts'],
          workerCount: 1,
          project: 'tenant-test'
        });
        expect(true).toBe(false);
      } catch (error: any) {
        expect([400, 401, 403]).toContain(error.response.status);
      }
    });
  });
});
