import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token interceptor
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const authStore = localStorage.getItem('shifty-auth');
      if (authStore) {
        try {
          const { state } = JSON.parse(authStore);
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (error) {
          console.error('Failed to parse auth token:', error);
        }
      }
      return config;
    });
  }

  // Auth APIs
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return this.client.post('/api/v1/auth/register', data);
  }

  async login(email: string, password: string) {
    return this.client.post('/api/v1/auth/login', { email, password });
  }

  async logout() {
    return this.client.post('/api/v1/auth/logout');
  }

  // Tenant APIs
  async getTenants() {
    return this.client.get('/api/v1/tenants');
  }

  async getTenant(tenantId: string) {
    return this.client.get(`/api/v1/tenants/${tenantId}`);
  }

  // Manual Session APIs
  async getManualSessions(tenantId: string) {
    return this.client.get(`/api/v1/sessions/manual`, {
      headers: { 'X-Tenant-ID': tenantId },
    });
  }

  async createManualSession(tenantId: string, data: {
    name: string;
    description?: string;
    testPlanId?: string;
  }) {
    return this.client.post('/api/v1/sessions/manual', {
      tenantId,
      userId: '', // Will be extracted from JWT
      persona: 'qa',
      sessionType: 'exploratory',
      riskLevel: 'medium',
      title: data.name,
      description: data.description,
      testPlanId: data.testPlanId,
    }, {
      headers: { 'X-Tenant-ID': tenantId },
    });
  }

  async getManualSession(tenantId: string, sessionId: string) {
    return this.client.get(`/api/v1/sessions/manual/${sessionId}`, {
      headers: { 'X-Tenant-ID': tenantId },
    });
  }

  async updateManualSession(
    tenantId: string,
    sessionId: string,
    data: { status?: string; completedAt?: string }
  ) {
    return this.client.patch(`/api/v1/sessions/manual/${sessionId}`, data, {
      headers: { 'X-Tenant-ID': tenantId },
    });
  }

  async addSessionStep(tenantId: string, sessionId: string, data: {
    action: string;
    expected: string;
    actual: string;
    status: 'pass' | 'fail' | 'pending';
    screenshotUrl?: string;
    evidence?: string[];
  }) {
    return this.client.post(`/api/v1/sessions/manual/${sessionId}/steps`, data, {
      headers: { 'X-Tenant-ID': tenantId },
    });
  }

  // HITL Arcade APIs
  async getHITLProfile(userId: string) {
    return this.client.get(`/api/v1/hitl/profiles/${userId}`);
  }

  async getAvailableMissions(tenantId: string, userId: string) {
    return this.client.get(`/api/v1/hitl/tenants/${tenantId}/missions/available`, {
      params: { userId },
      headers: { 'X-Tenant-ID': tenantId },
    });
  }

  async assignMission(missionId: string, userId: string) {
    return this.client.post(`/api/v1/hitl/missions/${missionId}/assign`, { userId });
  }

  async startMission(missionId: string, userId: string) {
    return this.client.post(`/api/v1/hitl/missions/${missionId}/start`, { userId });
  }

  async completeMission(missionId: string, data: {
    userId: string;
    result: any;
    evidence?: string[];
  }) {
    return this.client.post(`/api/v1/hitl/missions/${missionId}/complete`, data);
  }

  async getLeaderboard(tenantId: string, timeframe: string = '7d') {
    return this.client.get(`/api/v1/hitl/tenants/${tenantId}/leaderboard`, {
      params: { timeframe },
      headers: { 'X-Tenant-ID': tenantId },
    });
  }

  // Production Feedback APIs
  async getErrorClusters(tenantId: string) {
    return this.client.get(`/api/v1/tenants/${tenantId}/clusters`, {
      headers: { 'X-Tenant-ID': tenantId },
    });
  }

  async analyzeCluster(clusterId: string, sessionId: string) {
    return this.client.post(`/api/v1/clusters/${clusterId}/analyze`, {
      sessionId,
    });
  }

  // Test Generation & Healing APIs
  async generateTest(tenantId: string, data: {
    url: string;
    description: string;
    requirements?: string[];
    testType?: string;
  }) {
    return this.client.post('/api/v1/ai/generate-test', data, {
      headers: { 'X-Tenant-ID': tenantId },
    });
  }

  async healSelector(tenantId: string, data: {
    url: string;
    selector: string;
    elementType: string;
  }) {
    return this.client.post('/api/v1/ai/heal-selector', data, {
      headers: { 'X-Tenant-ID': tenantId },
    });
  }

  // CI/CD & Quality APIs
  async getQualityInsights(tenantId: string, timeframe: string = '7d') {
    return this.client.get('/api/v1/ci/actions/quality-insights', {
      params: { tenantId, timeframe },
      headers: { 'X-Tenant-ID': tenantId },
    });
  }
}

export const apiClient = new ApiClient();
