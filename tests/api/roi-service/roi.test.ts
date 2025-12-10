import { describe, test, expect, beforeAll } from '@jest/globals';
import { APIClient } from '../../utils/api-client';
import { TEST_CONFIG } from '../../config/api-test.config';

describe('ROI Service API - Product Owner Persona', () => {
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

  describe('ROI Insights', () => {
    test('should retrieve ROI insights for team', async () => {
      const response = await apiClient.get('/api/v1/roi/insights', {
        params: {
          tenant: tenantId,
          team: 'frontend-team',
          timeframe: '7d'
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('timeSaved');
      expect(response.data).toHaveProperty('bugsPrevented');
      expect(response.data).toHaveProperty('developerEfficiency');
      expect(response.data).toHaveProperty('costAvoidance');
    });

    test('should support different timeframes', async () => {
      const timeframes = ['24h', '7d', '30d', '90d'];
      
      for (const timeframe of timeframes) {
        const response = await apiClient.get('/api/v1/roi/insights', {
          params: { tenant: tenantId, timeframe }
        });
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('timeframe', timeframe);
      }
    });

    test('should calculate test coverage percentage', async () => {
      const response = await apiClient.get('/api/v1/roi/insights', {
        params: { tenant: tenantId }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('testCoverage');
      expect(typeof response.data.testCoverage).toBe('number');
      expect(response.data.testCoverage).toBeGreaterThanOrEqual(0);
      expect(response.data.testCoverage).toBeLessThanOrEqual(100);
    });
  });

  describe('Operational Cost', () => {
    test('should retrieve operational cost metrics', async () => {
      const response = await apiClient.get('/api/v1/roi/operational-cost', {
        params: { tenant: tenantId, team: 'platform-team' }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalCost');
      expect(response.data).toHaveProperty('costPerTest');
      expect(response.data).toHaveProperty('savings');
    });
  });

  describe('Incident Prevention', () => {
    test('should retrieve prevented incidents summary', async () => {
      const response = await apiClient.get('/api/v1/roi/incidents', {
        params: { 
          tenant: tenantId,
          repo: 'shifty-platform',
          team: 'qa-team'
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('preventedIncidents');
      expect(Array.isArray(response.data.preventedIncidents)).toBe(true);
      expect(response.data).toHaveProperty('riskAssessment');
    });

    test('should categorize incidents by severity', async () => {
      const response = await apiClient.get('/api/v1/roi/incidents', {
        params: { tenant: tenantId }
      });
      
      expect(response.status).toBe(200);
      
      const severities = ['critical', 'high', 'medium', 'low'];
      for (const severity of severities) {
        expect(response.data).toHaveProperty(severity);
      }
    });
  });

  describe('DORA Metrics', () => {
    test('should retrieve DORA metrics', async () => {
      const response = await apiClient.get('/api/v1/roi/dora', {
        params: { tenant: tenantId }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('deploymentFrequency');
      expect(response.data).toHaveProperty('leadTimeForChanges');
      expect(response.data).toHaveProperty('changeFailureRate');
      expect(response.data).toHaveProperty('timeToRestore');
    });

    test('should support historical DORA metrics', async () => {
      const response = await apiClient.get('/api/v1/roi/dora', {
        params: { 
          tenant: tenantId,
          timeframe: '90d',
          includeHistory: true
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('history');
      expect(Array.isArray(response.data.history)).toBe(true);
    });
  });

  describe('Quality Score', () => {
    test('should calculate AI-powered quality score', async () => {
      const response = await apiClient.get('/api/v1/roi/quality-score', {
        params: { 
          tenant: tenantId,
          repo: 'frontend-app'
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('qualityScore');
      expect(typeof response.data.qualityScore).toBe('number');
      expect(response.data.qualityScore).toBeGreaterThanOrEqual(0);
      expect(response.data.qualityScore).toBeLessThanOrEqual(100);
      expect(response.data).toHaveProperty('factors');
    });
  });

  describe('Release Readiness', () => {
    test('should assess release readiness', async () => {
      const response = await apiClient.get('/api/v1/roi/release-readiness', {
        params: { 
          tenant: tenantId,
          repo: 'frontend-app',
          branch: 'main'
        }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(['green', 'yellow', 'red']).toContain(response.data.status);
      expect(response.data).toHaveProperty('blockers');
      expect(response.data).toHaveProperty('recommendations');
    });
  });
});
