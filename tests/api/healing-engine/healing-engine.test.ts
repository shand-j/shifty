import { describe, test, expect, beforeAll } from '@jest/globals';
import { APIClient, TestDataFactory } from '../../utils/api-client';
import { TEST_CONFIG } from '../../config/api-test.config';

describe('Healing Engine Service API', () => {
  let apiClient: APIClient;
  let authToken: string;
  let tenantId: string;

  beforeAll(async () => {
    apiClient = new APIClient();
    
    // Setup authenticated user for tests
    const testUser = TestDataFactory.createTestUser('healing');
    const authResponse = await apiClient.registerUser(testUser);
    authToken = authResponse.token;
    tenantId = authResponse.tenant.id;
  });

  describe('Health Check', () => {
    test('should return healthy status with AI strategies', async () => {
      const response = await apiClient.getServiceHealth(TEST_CONFIG.PORTS.HEALING_ENGINE);
      
      expect(response.status).toBe('healthy');
      expect(response.service).toBe(TEST_CONFIG.SERVICE_NAMES.HEALING_ENGINE);
      
      // Should include AI and strategies info
      expect(response).toHaveProperty('ai');
      expect(response.ai).toHaveProperty('status');
      expect(response.ai).toHaveProperty('strategies');
      expect(response.ai.status).toBe('healthy');
      expect(Array.isArray(response.ai.strategies)).toBe(true);
      
      // Verify expected strategies are available
      const expectedStrategies = TEST_CONFIG.TEST_SCENARIOS.HEALING_STRATEGIES;
      expectedStrategies.forEach(strategy => {
        expect(response.ai.strategies).toContain(strategy);
      });
    });
  });

  describe('Selector Healing', () => {
    test('should heal broken selector with default strategy', async () => {
      const healingRequest = TestDataFactory.createSelectorHealingRequest();
      
      const response = await apiClient.healSelector(
        healingRequest.selector,
        healingRequest.pageUrl,
        healingRequest.strategy,
        authToken
      );

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('original');
      expect(response).toHaveProperty('healed');
      expect(response).toHaveProperty('confidence');
      expect(response).toHaveProperty('strategy');
      
      expect(response.original).toBe(healingRequest.selector);
      expect(response.strategy).toBe(healingRequest.strategy);
      expect(typeof response.success).toBe('boolean');
      expect(typeof response.confidence).toBe('number');
      
      if (response.success) {
        expect(response.confidence).toBeGreaterThan(0);
        expect(response.confidence).toBeLessThanOrEqual(1);
        expect(response.healed).toBeTruthy();
      }
    });

    test('should support different healing strategies', async () => {
      const strategies = TEST_CONFIG.TEST_SCENARIOS.HEALING_STRATEGIES;
      
      for (const strategy of strategies) {
        const response = await apiClient.healSelector(
          TEST_CONFIG.TEST_SCENARIOS.BROKEN_SELECTOR,
          TEST_CONFIG.TEST_SCENARIOS.VALID_PAGE_URL,
          strategy,
          authToken
        );
        
        expect(response.strategy).toBe(strategy);
        expect(response).toHaveProperty('success');
        expect(response).toHaveProperty('confidence');
      }
    }, TEST_CONFIG.TIMEOUTS.AI_OPERATION);

    test('should validate required parameters', async () => {
      try {
        await apiClient.healSelector('', '', '', authToken);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    test('should handle invalid strategy gracefully', async () => {
      try {
        await apiClient.healSelector(
          '#test-selector',
          'https://example.com',
          'invalid-strategy',
          authToken
        );
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Batch Healing Operations', () => {
    test('should heal multiple selectors', async () => {
      const selectors = [
        { selector: '#broken-btn-1', pageUrl: 'https://example.com/page1' },
        { selector: '#broken-btn-2', pageUrl: 'https://example.com/page2' },
        { selector: '.missing-class', pageUrl: 'https://example.com/page3' },
      ];

      const response = await apiClient.batchHeal(selectors, authToken);

      expect(response).toHaveProperty('results');
      expect(response).toHaveProperty('summary');
      expect(Array.isArray(response.results)).toBe(true);
      expect(response.results).toHaveLength(selectors.length);

      // Each result should have healing information
      response.results.forEach((result: any, index: number) => {
        expect(result).toHaveProperty('original');
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('confidence');
        expect(result.original).toBe(selectors[index].selector);
      });

      // Summary should have statistics
      expect(response.summary).toHaveProperty('total');
      expect(response.summary).toHaveProperty('successful');
      expect(response.summary).toHaveProperty('failed');
      expect(response.summary.total).toBe(selectors.length);
    }, TEST_CONFIG.TIMEOUTS.AI_OPERATION);

    test('should handle empty batch request', async () => {
      try {
        await apiClient.batchHeal([], authToken);
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Healing Strategies', () => {
    test('should provide available strategies', async () => {
      const response = await apiClient.getHealingStrategies();

      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);

      // Each strategy should have metadata
      response.data.forEach((strategy: any) => {
        expect(strategy).toHaveProperty('name');
        expect(strategy).toHaveProperty('description');
        expect(strategy).toHaveProperty('type');
        expect(['rule-based', 'ai-powered']).toContain(strategy.type);
      });

      // Verify expected strategies are present
      const strategyNames = response.data.map((s: any) => s.name);
      TEST_CONFIG.TEST_SCENARIOS.HEALING_STRATEGIES.forEach(expectedStrategy => {
        expect(strategyNames).toContain(expectedStrategy);
      });
    });
  });

  describe('Page Analysis', () => {
    test('should analyze page structure for healing insights', async () => {
      try {
        const response = await apiClient.post('http://localhost:3005/api/v1/healing/analyze-page', {
          pageUrl: 'https://example.com',
          selectors: ['#login-btn', '.submit-button', '[data-testid="submit"]'],
        });

        expect(response.data).toHaveProperty('analysis');
        expect(response.data).toHaveProperty('recommendations');
        expect(response.data.analysis).toHaveProperty('elements');
        expect(Array.isArray(response.data.recommendations)).toBe(true);
      } catch (error: any) {
        // This endpoint might not be implemented yet, so we allow 404
        expect([404, 501]).toContain(error.response.status);
      }
    });
  });

  describe('Performance and Reliability', () => {
    test('should respond within reasonable time for single healing', async () => {
      const startTime = Date.now();
      
      await apiClient.healSelector(
        '#test-selector',
        'https://example.com',
        'data-testid-recovery',
        authToken
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 5 seconds for rule-based strategy
      expect(duration).toBeLessThan(5000);
    });

    test('should handle concurrent healing requests', async () => {
      const promises = Array(5).fill(0).map((_, index) => 
        apiClient.healSelector(
          `#test-selector-${index}`,
          'https://example.com',
          'css-hierarchy-analysis',
          authToken
        )
      );

      const responses = await Promise.all(promises);
      
      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect(response).toHaveProperty('success');
        expect(response).toHaveProperty('confidence');
      });
    });
  });
});