import { describe, test, expect, beforeAll } from '@jest/globals';
import { APIClient, TestDataFactory, APIAssertions, AuthResponse } from '../../utils/api-client';
import { TEST_CONFIG } from '../../config/api-test.config';

describe('Test Generator Service API', () => {
  let apiClient: APIClient;
  let authToken: string;
  let tenantId: string;

  beforeAll(async () => {
    apiClient = new APIClient();
    
    // Setup authenticated user for tests
    const testUser = TestDataFactory.createTestUser('test-gen');
    const authResponse: AuthResponse = await apiClient.registerUser(testUser);
    authToken = authResponse.token;
    tenantId = authResponse.tenant.id;
  });

  describe('Health Check', () => {
    test('should return healthy status with AI info', async () => {
      const response = await apiClient.getServiceHealth(TEST_CONFIG.PORTS.TEST_GENERATOR);
      
      APIAssertions.expectValidHealthResponse(response, TEST_CONFIG.SERVICE_NAMES.TEST_GENERATOR);
      
      // Should include AI status
      expect(response).toHaveProperty('ai');
      expect(response.ai).toHaveProperty('status');
      expect(response.ai).toHaveProperty('model');
      expect(response.ai.status).toBe('healthy');
    });
  });

  describe('Test Generation', () => {
    test('should generate test from natural language description', async () => {
      const testRequest = {
        description: TEST_CONFIG.TEST_SCENARIOS.VALID_TEST_DESCRIPTION,
        url: TEST_CONFIG.TEST_SCENARIOS.VALID_PAGE_URL,
        framework: 'playwright',
        tenantId,
      };

      const response = await apiClient.generateTest(
        testRequest.description,
        testRequest.url,
        testRequest.framework,
        testRequest.tenantId,
        authToken
      );

      expect(response).toHaveProperty('requestId');
      expect(response).toHaveProperty('status');
      expect(response.status).toBe('pending');
      expect(typeof response.requestId).toBe('string');
    }, TEST_CONFIG.TIMEOUTS.AI_OPERATION);

    test('should require tenant ID', async () => {
      try {
        await apiClient.generateTest(
          'Test description',
          'https://example.com',
          'playwright',
          '', // Empty tenant ID
          authToken
        );
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        // Should return validation error (400) or auth error (401)
        expect(error.response).toBeTruthy();
        expect([400, 401]).toContain(error.response.status);
        expect(error.response.data).toHaveProperty('error');
      }
    });

    test('should require authentication', async () => {
      try {
        await apiClient.generateTest(
          'Test description',
          'https://example.com',
          'playwright',
          tenantId,
          'invalid-token'
        );
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    test('should validate framework parameter', async () => {
      try {
        await apiClient.generateTest(
          'Test description',
          'https://example.com',
          'invalid-framework',
          tenantId,
          authToken
        );
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        // Should return validation error (400) or auth error (401)
        expect(error.response).toBeTruthy();
        expect([400, 401]).toContain(error.response.status);
      }
    });
  });

  describe('Generation Status Tracking', () => {
    let jobId: string;

    beforeAll(async () => {
      // Start a test generation job
      const response = await apiClient.generateTest(
        'Simple login test',
        'https://example.com/login',
        'playwright',
        tenantId,
        authToken
      );
      jobId = response.requestId;
    });

    test('should track generation status', async () => {
      const statusResponse = await apiClient.getGenerationStatus(jobId, authToken);
      
      expect(statusResponse).toHaveProperty('id');
      expect(statusResponse).toHaveProperty('status');
      expect(statusResponse.id).toBe(jobId);
      expect(['processing', 'completed', 'failed', 'generating', 'pending']).toContain(statusResponse.status);
    });

    test('should require authentication for status check', async () => {
      try {
        await apiClient.getGenerationStatus(jobId, 'invalid-token');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    test('should handle non-existent job ID', async () => {
      try {
        await apiClient.getGenerationStatus('non-existent-job-id', authToken);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        // Should return not found (404) or auth error (401)
        expect(error.response).toBeTruthy();
        expect([404, 401]).toContain(error.response.status);
      }
    });
  });

  describe('Test Validation', () => {
    test('should validate Playwright test code', async () => {
      const validTestCode = `
        import { test, expect } from '@playwright/test';

        test('login test', async ({ page }) => {
          await page.goto('https://example.com/login');
          await page.fill('#email', 'test@example.com');
          await page.fill('#password', 'password');
          await page.click('#login-btn');
          await expect(page).toHaveURL(/dashboard/);
        });
      `;

      const response = await apiClient.validateTest(validTestCode, authToken);
      
      expect(response).toHaveProperty('valid');
      expect(response).toHaveProperty('issues');
      expect(typeof response.valid).toBe('boolean');
      expect(Array.isArray(response.issues)).toBe(true);
    });

    test('should detect syntax errors in test code', async () => {
      const invalidTestCode = `
        import { test, expect } from '@playwright/test';

        test('broken test', async ({ page }) => {
          await page.goto('https://example.com');
          // Missing closing brace
      `;

      const response = await apiClient.validateTest(invalidTestCode, authToken);
      
      expect(response.valid).toBe(false);
      expect(response.issues.length).toBeGreaterThan(0);
      expect(response.issues[0]).toHaveProperty('type');
      expect(response.issues[0]).toHaveProperty('message');
    });

    test('should require authentication for validation', async () => {
      try {
        await apiClient.validateTest('test code', 'invalid-token');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        // Should return auth error (401) or validation error (400)
        expect(error.response).toBeTruthy();
        expect([400, 401]).toContain(error.response.status);
      }
    });
  });

  describe('AI Model Integration', () => {
    test('should have required AI models available', async () => {
      const healthResponse = await apiClient.getServiceHealth(TEST_CONFIG.PORTS.TEST_GENERATOR);
      
      expect(healthResponse.ai).toBeTruthy();
      expect(healthResponse.ai.model).toBeTruthy();
      expect(typeof healthResponse.ai.model).toBe('string');
      expect(healthResponse.ai.details).toHaveProperty('availableModels');
      expect(healthResponse.ai.details.availableModels).toBeGreaterThan(0);
    });
  });
});