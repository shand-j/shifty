import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { APIClient, TestDataFactory } from '../utils/api-client';

/**
 * End-to-End Integration Tests
 * 
 * Tests complete user journeys across multiple services:
 * 1. User registration → Test generation → Test execution → Results analysis
 * 2. Login → Test healing → PR creation
 * 3. Manual testing session → Bug reporting → Analytics
 */

describe('E2E: Complete Test Automation Journey', () => {
  let apiClient: APIClient;
  let userEmail: string;
  let authToken: string;
  let tenantId: string;
  let testUser: ReturnType<typeof TestDataFactory.createTestUser>;

  beforeAll(async () => {
    apiClient = new APIClient();
    testUser = TestDataFactory.createTestUser();
  });

  test('complete user onboarding to test execution flow', async () => {
    // Step 1: Register new user
    const registerResponse = await apiClient.registerUser(testUser);
    
    expect(registerResponse).toHaveProperty('token');
    expect(registerResponse).toHaveProperty('user');
    expect(registerResponse).toHaveProperty('tenant');
    
    authToken = registerResponse.token;
    tenantId = registerResponse.tenant.id;
    userEmail = registerResponse.user.email;
    
    apiClient.setAuthToken(authToken);
    
    // Step 2: Verify tenant is active
    const tenantsResponse = await apiClient.getTenants();
    expect(tenantsResponse.tenants).toContainEqual(
      expect.objectContaining({
        id: tenantId,
        status: 'active'
      })
    );
    
    // Step 3: Generate test cases
    const generateRequest = {
      url: 'https://example.com/login',
      testType: 'functional',
      coverage: 'comprehensive',
      framework: 'playwright'
    };
    
    const generateResponse = await apiClient.generateTests(generateRequest);
    
    expect(generateResponse).toHaveProperty('requestId');
    expect(generateResponse.status).toMatch(/queued|processing|completed/);
    
    // Step 4: Check test generation status
    const statusResponse = await apiClient.getTestGenerationStatus(generateResponse.requestId);
    expect(statusResponse).toHaveProperty('status');
    expect(statusResponse).toHaveProperty('requestId', generateResponse.requestId);
    
    // Step 5: Orchestrate test execution
    const orchestrateRequest = {
      testFiles: ['tests/login.spec.ts', 'tests/checkout.spec.ts'],
      workerCount: 2,
      project: 'e2e-integration-test',
      branch: 'main',
      commitSha: 'e2e-test-123'
    };
    
    const orchestrateResponse = await apiClient.orchestrateTests(orchestrateRequest);
    
    expect(orchestrateResponse).toHaveProperty('runId');
    expect(orchestrateResponse).toHaveProperty('status');
    expect(orchestrateResponse).toHaveProperty('shards');
    
    // Step 6: Check run status
    const runStatusResponse = await apiClient.getTestRunStatus(orchestrateResponse.runId);
    
    expect(runStatusResponse).toHaveProperty('runId', orchestrateResponse.runId);
    expect(runStatusResponse).toHaveProperty('totalTests');
    expect(runStatusResponse).toHaveProperty('status');
  }, 60000); // 60 second timeout for complete flow

  test('complete selector healing to PR creation flow', async () => {
    // Use existing authenticated client
    if (!authToken) {
      // Login with test user
      const loginResponse = await apiClient.login({
        email: 'test@shifty.com',
        password: 'password123'
      });
      
      authToken = loginResponse.token;
      tenantId = loginResponse.user.tenantId;
      apiClient.setAuthToken(authToken);
    }
    
    // Step 1: Submit selector for healing
    const healRequest = {
      url: 'https://example.com/form',
      brokenSelector: '#submit-btn',
      strategy: 'data-testid-recovery',
      context: {
        browserType: 'chromium'
      }
    };
    
    const healResponse = await apiClient.healSelector(healRequest);
    
    expect(healResponse).toHaveProperty('id');
    expect(healResponse).toHaveProperty('originalSelector', '#submit-btn');
    expect(healResponse).toHaveProperty('status');
    
    if (healResponse.success) {
      expect(healResponse).toHaveProperty('healedSelector');
      expect(healResponse).toHaveProperty('confidence');
      expect(healResponse.confidence).toBeGreaterThan(0);
    }
    
    // Step 2: Get healing attempts for tenant
    const healingAttemptsResponse = await apiClient.get('/api/v1/healing/attempts', {
      params: { limit: 10 }
    });
    
    expect(healingAttemptsResponse.status).toBe(200);
    expect(Array.isArray(healingAttemptsResponse.data.attempts)).toBe(true);
  }, 30000);

  test('complete analytics and ROI metrics flow', async () => {
    if (!authToken) {
      const loginResponse = await apiClient.login({
        email: 'test@shifty.com',
        password: 'password123'
      });
      
      authToken = loginResponse.token;
      tenantId = loginResponse.user.tenantId;
      apiClient.setAuthToken(authToken);
    }
    
    // Step 1: Get ROI insights
    const roiResponse = await apiClient.get('/api/v1/roi/insights', {
      params: {
        tenant: tenantId,
        timeframe: '7d'
      }
    });
    
    expect(roiResponse.status).toBe(200);
    expect(roiResponse.data).toHaveProperty('timeSaved');
    expect(roiResponse.data).toHaveProperty('bugsPrevented');
    
    // Step 2: Get DORA metrics
    const doraResponse = await apiClient.get('/api/v1/roi/dora', {
      params: { tenant: tenantId }
    });
    
    expect(doraResponse.status).toBe(200);
    expect(doraResponse.data).toHaveProperty('deploymentFrequency');
    
    // Step 3: Get quality score
    const qualityResponse = await apiClient.get('/api/v1/roi/quality-score', {
      params: {
        tenant: tenantId,
        repo: 'test-repo'
      }
    });
    
    expect(qualityResponse.status).toBe(200);
    expect(qualityResponse.data).toHaveProperty('qualityScore');
    expect(qualityResponse.data.qualityScore).toBeGreaterThanOrEqual(0);
    expect(qualityResponse.data.qualityScore).toBeLessThanOrEqual(100);
  }, 30000);
});

describe('E2E: Multi-Persona Workflows', () => {
  let apiClient: APIClient;
  let authToken: string;
  let tenantId: string;

  beforeAll(async () => {
    apiClient = new APIClient();
    
    // Login once for all tests
    const loginResponse = await apiClient.login({
      email: 'test@shifty.com',
      password: 'password123'
    });
    
    authToken = loginResponse.token;
    tenantId = loginResponse.user.tenantId;
    apiClient.setAuthToken(authToken);
  });

  test('PO workflow: Check release readiness across services', async () => {
    // Check quality score
    const qualityResponse = await apiClient.get('/api/v1/roi/quality-score', {
      params: { tenant: tenantId, repo: 'main-app' }
    });
    expect(qualityResponse.status).toBe(200);
    
    // Check release readiness
    const releaseResponse = await apiClient.get('/api/v1/roi/release-readiness', {
      params: { tenant: tenantId, repo: 'main-app', branch: 'main' }
    });
    expect(releaseResponse.status).toBe(200);
    expect(releaseResponse.data).toHaveProperty('status');
    
    // Check incidents
    const incidentsResponse = await apiClient.get('/api/v1/roi/incidents', {
      params: { tenant: tenantId }
    });
    expect(incidentsResponse.status).toBe(200);
  }, 30000);

  test('QA workflow: Manual test to automated test generation', async () => {
    // Generate tests from manual session insights
    const generateRequest = {
      url: 'https://example.com/checkout',
      testType: 'functional',
      coverage: 'critical-path',
      framework: 'playwright'
    };
    
    const generateResponse = await apiClient.generateTests(generateRequest);
    expect(generateResponse).toHaveProperty('requestId');
    
    // Check generation status
    const statusResponse = await apiClient.getTestGenerationStatus(generateResponse.requestId);
    expect(statusResponse).toHaveProperty('status');
    
    // Get generated test content (if completed)
    if (statusResponse.status === 'completed') {
      expect(statusResponse).toHaveProperty('tests');
    }
  }, 30000);

  test('Developer workflow: PR test results to debugging', async () => {
    // Run tests for PR
    const orchestrateRequest = {
      testFiles: ['tests/feature.spec.ts'],
      workerCount: 1,
      project: 'pr-workflow',
      branch: 'feature/new-ui',
      commitSha: 'pr-123'
    };
    
    const runResponse = await apiClient.orchestrateTests(orchestrateRequest);
    expect(runResponse).toHaveProperty('runId');
    
    // Get test results
    const statusResponse = await apiClient.getTestRunStatus(runResponse.runId);
    expect(statusResponse).toHaveProperty('status');
    
    // If failures, check healing suggestions
    if (statusResponse.failedTests > 0) {
      const healingResponse = await apiClient.get('/api/v1/healing/attempts', {
        params: { limit: 5 }
      });
      expect(healingResponse.status).toBe(200);
    }
  }, 30000);
});
