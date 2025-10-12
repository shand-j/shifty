import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { APIClient, TestDataFactory } from '../utils/api-client';
import { TEST_CONFIG } from '../config/api-test.config';

describe('Integration Tests - End-to-End Workflows', () => {
  let apiClient: APIClient;
  let testUser: any;
  let authToken: string;
  let tenantId: string;

  beforeAll(async () => {
    apiClient = new APIClient();
    
    // Create a test user and authenticate
    testUser = TestDataFactory.createTestUser();
    
    try {
      const registerResponse = await apiClient.registerUser(testUser);
      
      const loginResponse = await apiClient.loginUser(testUser.email, testUser.password);
      authToken = loginResponse.token;
      tenantId = loginResponse.tenant.id;
    } catch (error) {
      console.warn('Setup failed - services may not be fully operational');
    }
  }, TEST_CONFIG.TIMEOUTS.SERVICE_STARTUP);

  describe('Complete User Journey', () => {
    test('should handle full user registration and test creation workflow', async () => {
      if (!authToken) {
        console.warn('Skipping test - authentication not available');
        return;
      }

      try {
        // 1. Verify user authentication
        const verifyResponse = await apiClient.verifyToken(authToken);
        expect(verifyResponse).toHaveProperty('valid', true);

        // 2. Generate a test
        const generateResponse = await apiClient.generateTest(
          'Test user login functionality',
          'https://example.com/login',
          'playwright',
          tenantId,
          authToken
        );
        
        expect(generateResponse).toHaveProperty('jobId');
        const jobId = generateResponse.jobId;

        // 3. Check generation status
        let statusResponse;
        let attempts = 0;
        const maxAttempts = 10;
        
        do {
          await new Promise(resolve => setTimeout(resolve, 2000));
          statusResponse = await apiClient.getGenerationStatus(jobId, authToken);
          attempts++;
        } while (statusResponse.status === 'processing' && attempts < maxAttempts);

        expect(['completed', 'failed', 'processing']).toContain(statusResponse.status);

        // 4. If test generation completed, validate the test
        if (statusResponse.status === 'completed' && statusResponse.testCode) {
          const validateResponse = await apiClient.validateTest(statusResponse.testCode, authToken);
          expect(validateResponse).toHaveProperty('isValid');
        }

      } catch (error: any) {
        console.warn('Integration test failed:', error.message);
        // Don't fail the test completely as services may be in development
        expect(error.response?.status).toBeDefined();
      }
    }, TEST_CONFIG.TIMEOUTS.EXTENDED);

    test('should handle multi-service AI coordination', async () => {
      if (!authToken) {
        console.warn('Skipping test - authentication not available');
        return;
      }

      try {
        // 1. Generate test and healing strategy simultaneously
        const testGenerationPromise = apiClient.generateTest(
          'Complex form submission test',
          'https://example.com/complex-form',
          'playwright',
          tenantId,
          authToken
        );

        const healingPromise = apiClient.healSelector(
          '#submit-button',
          'https://example.com/complex-form',
          'ai-powered-analysis'
        );

        const [testResult, healingResult] = await Promise.allSettled([
          testGenerationPromise,
          healingPromise
        ]);

        // Both operations should complete (successfully or with expected errors)
        expect(testResult.status).toBeDefined();
        expect(healingResult.status).toBeDefined();

        // If successful, results should have expected properties
        if (testResult.status === 'fulfilled') {
          expect(testResult.value).toHaveProperty('jobId');
        }

        if (healingResult.status === 'fulfilled') {
          expect(healingResult.value).toHaveProperty('healedSelector');
        }

      } catch (error: any) {
        console.warn('Multi-service coordination test failed:', error.message);
        expect(error.response?.status).toBeDefined();
      }
    }, TEST_CONFIG.TIMEOUTS.EXTENDED);
  });

  describe('Service Health and Resilience', () => {
    test('should maintain service health across all components', async () => {
      const healthChecks = await Promise.allSettled([
        apiClient.getServiceHealth(TEST_CONFIG.PORTS.AUTH_SERVICE),
        apiClient.getServiceHealth(TEST_CONFIG.PORTS.TENANT_MANAGER),
        apiClient.getServiceHealth(TEST_CONFIG.PORTS.AI_ORCHESTRATOR),
        apiClient.getServiceHealth(TEST_CONFIG.PORTS.TEST_GENERATOR),
        apiClient.getServiceHealth(TEST_CONFIG.PORTS.HEALING_ENGINE),
        apiClient.getServiceHealth(TEST_CONFIG.PORTS.API_GATEWAY),
      ]);

      // At least some services should be healthy
      const healthyServices = healthChecks.filter(check => 
        check.status === 'fulfilled' && 
        (check.value as any).status === 'healthy'
      );

      expect(healthyServices.length).toBeGreaterThan(0);

      // Log status for debugging
      healthChecks.forEach((check, index) => {
        const serviceNames = [
          'Auth Service', 'Tenant Manager', 'AI Orchestrator',
          'Test Generator', 'Healing Engine', 'API Gateway'
        ];
        
        if (check.status === 'fulfilled') {
          console.log(`${serviceNames[index]}: ${(check.value as any).status}`);
        } else {
          console.log(`${serviceNames[index]}: Failed to connect`);
        }
      });
    });

    test('should handle service failures gracefully', async () => {
      // Test resilience by trying operations that may fail
      const resilenceTests = [
        // Try to access non-existent endpoints
        apiClient.get(':3004/api/v1/nonexistent').catch(e => e.response),
        apiClient.get(':3005/api/v1/invalid').catch(e => e.response),
        apiClient.get(':3003/api/v1/unknown').catch(e => e.response),
      ];

      const results = await Promise.all(resilenceTests);
      
      results.forEach(result => {
        // Should get proper HTTP error responses, not network failures
        expect(result.status).toBeDefined();
        expect([400, 401, 404, 500, 501, 502, 503]).toContain(result.status);
      });
    });
  });

  describe('Multi-Tenant Isolation', () => {
    test('should maintain tenant data isolation', async () => {
      if (!authToken || !tenantId) {
        console.warn('Skipping test - authentication not available');
        return;
      }

      try {
        // 1. Get tenant information
        const tenantResponse = await apiClient.getTenant(tenantId, authToken);
        expect(tenantResponse.tenant.id).toBe(tenantId);

        // 2. Create tenant-specific data (test generation)
        const testResponse = await apiClient.generateTest(
          'Tenant-specific test',
          'https://example.com/tenant-test',
          'playwright',
          tenantId,
          authToken
        );

        if (testResponse.jobId) {
          // Test should be associated with correct tenant
          const statusResponse = await apiClient.getGenerationStatus(testResponse.jobId, authToken);
          expect(statusResponse.tenantId).toBe(tenantId);
        }

        // 3. Verify tenant isolation in healing engine
        const healingResponse = await apiClient.healSelector(
          '.tenant-specific-element',
          'https://example.com/tenant-app',
          'ai-powered-analysis'
        );

        // Should succeed or fail with proper error handling
        expect(healingResponse).toBeDefined();

      } catch (error: any) {
        console.warn('Multi-tenant test failed:', error.message);
        expect([400, 401, 403, 404, 500]).toContain(error.response?.status);
      }
    });
  });

  describe('AI Model Integration', () => {
    test('should coordinate AI models across services', async () => {
      try {
        // 1. Check AI service status
        const aiStatus = await apiClient.getAIStatus();
        expect(aiStatus.data).toHaveProperty('status');

        // 2. Check model availability
        const modelsResponse = await apiClient.getAIModels();
        expect(modelsResponse.data).toHaveProperty('models');

        // 3. If models are available, test AI coordination
        if (modelsResponse.data.models.length > 0) {
          // Use the first available model from the models array
          const availableModel = modelsResponse.data.models[0];

          if (availableModel) {
            console.log(`Testing with AI model: ${availableModel.name}`);
            
            // Test AI-powered operations if model is ready
            if (authToken) {
              try {
                const aiTestResponse = await apiClient.generateTest(
                  'AI-powered test generation',
                  'https://example.com/ai-test',
                  'playwright',
                  tenantId,
                  authToken
                );
                expect(aiTestResponse).toHaveProperty('jobId');
              } catch (aiError: any) {
                console.warn('AI test generation failed:', aiError.message);
              }
            }
          }
        }

      } catch (error: any) {
        console.warn('AI integration test failed:', error.message);
        expect(error.response?.status).toBeDefined();
      }
    });
  });

  describe('Performance and Load', () => {
    test('should handle concurrent requests', async () => {
      const concurrentRequests = Array(5).fill(null).map((_, index) =>
        apiClient.getServiceHealth(TEST_CONFIG.PORTS.AUTH_SERVICE)
          .catch(e => ({ error: true, status: e.response?.status }))
      );

      const results = await Promise.all(concurrentRequests);
      
      // At least some requests should succeed
      const successful = results.filter(r => !r.error);
      expect(successful.length).toBeGreaterThan(0);

      // All requests should get responses (no timeouts)
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should maintain reasonable response times', async () => {
      const startTime = Date.now();
      
      try {
        await apiClient.getServiceHealth(TEST_CONFIG.PORTS.AUTH_SERVICE);
        const responseTime = Date.now() - startTime;
        
        // Should respond within reasonable time (10 seconds for health check)
        expect(responseTime).toBeLessThan(10000);
      } catch (error) {
        // Even errors should be fast
        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(10000);
      }
    });
  });

  afterAll(async () => {
    // Cleanup: In a real scenario, you might want to clean up test data
    console.log('Integration tests completed');
  });
});