import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
    firstName?: string;
    lastName?: string;
    persona?: string;
  };
  token: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL?: string) {
    const apiUrl =
      baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh and errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 errors - token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt token refresh
            const newToken = await this.refreshToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Token refresh failed - logout
            this.clearToken();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        }

        // Format error response
        const apiError: ApiError = {
          error: error.response?.data?.error || "Request failed",
          message:
            error.response?.data?.message ||
            error.message ||
            "An error occurred",
          statusCode: error.response?.status,
        };

        return Promise.reject(apiError);
      }
    );

    // Load token from localStorage on client-side
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("shifty_token");
      if (savedToken) {
        this.token = savedToken;
      }
    }
  }

  // Token management
  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("shifty_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("shifty_token");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Token refresh logic
  private async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await axios.post<AuthResponse>(
          `${this.client.defaults.baseURL}/api/v1/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );

        const newToken = response.data.token;
        this.setToken(newToken);
        return newToken;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/api/v1/auth/login",
      credentials
    );
    this.setToken(response.data.token);
    return response.data;
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantName?: string;
  }): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/api/v1/auth/register",
      data
    );
    this.setToken(response.data.token);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post("/api/v1/auth/logout");
    } finally {
      this.clearToken();
    }
  }

  async verifyToken(): Promise<AuthResponse["user"]> {
    const response = await this.client.post<{ user: AuthResponse["user"] }>(
      "/api/v1/auth/verify"
    );
    return response.data.user;
  }

  // User endpoints
  async getCurrentUser(): Promise<AuthResponse["user"]> {
    const response = await this.client.get<{ user: AuthResponse["user"] }>(
      "/api/v1/users/me"
    );
    return response.data.user;
  }

  async updateUser(
    userId: string,
    data: Partial<AuthResponse["user"]>
  ): Promise<AuthResponse["user"]> {
    const response = await this.client.put<{ user: AuthResponse["user"] }>(
      `/api/v1/users/${userId}`,
      data
    );
    return response.data.user;
  }

  // Tenant endpoints
  async getTenants(): Promise<any[]> {
    const response = await this.client.get("/api/v1/tenants");
    return response.data.data || response.data;
  }

  async getTenant(tenantId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/tenants/${tenantId}`);
    return response.data.data || response.data;
  }

  async createTenant(data: any): Promise<any> {
    const response = await this.client.post("/api/v1/tenants", data);
    return response.data.data || response.data;
  }

  // Test generation endpoints
  async generateTest(data: {
    requirements: string;
    url: string;
    testType?: string;
    browserType?: string;
  }): Promise<any> {
    const response = await this.client.post("/api/v1/tests/generate", data);
    return response.data;
  }

  async getGenerationStatus(jobId: string): Promise<any> {
    const response = await this.client.get(
      `/api/v1/tests/generate/${jobId}/status`
    );
    return response.data;
  }

  // Healing endpoints
  async healSelector(data: {
    url: string;
    brokenSelector: string;
    strategy: string;
  }): Promise<any> {
    const response = await this.client.post(
      "/api/v1/healing/heal-selector",
      data
    );
    return response.data;
  }

  async getHealingStrategies(): Promise<any> {
    const response = await this.client.get("/api/v1/healing/strategies");
    return response.data;
  }

  async batchHeal(data: {
    url: string;
    selectors: Array<{
      id: string;
      selector: string;
      expectedElementType: string;
    }>;
    browserType?: string;
  }): Promise<any> {
    const response = await this.client.post("/api/v1/healing/batch-heal", data);
    return response.data;
  }

  // Notifications
  async getNotifications(): Promise<any[]> {
    const response = await this.client.get("/api/v1/notifications");
    return response.data.data || response.data;
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.client.put(`/api/v1/notifications/${notificationId}/read`);
  }

  // Teams
  async getTeams(): Promise<any[]> {
    const response = await this.client.get("/api/v1/teams");
    return response.data.data || response.data;
  }

  async getTeam(teamId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/teams/${teamId}`);
    return response.data.data || response.data;
  }

  // Projects
  async getProjects(): Promise<any[]> {
    const response = await this.client.get("/api/v1/projects");
    return response.data.data || response.data;
  }

  async getProject(projectId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/projects/${projectId}`);
    return response.data.data || response.data;
  }

  // Pipelines
  async getPipelines(): Promise<any[]> {
    const response = await this.client.get("/api/v1/pipelines");
    return response.data.data || response.data;
  }

  async getPipeline(pipelineId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/pipelines/${pipelineId}`);
    return response.data.data || response.data;
  }

  // Knowledge
  async getKnowledge(params?: {
    type?: string;
    search?: string;
  }): Promise<any[]> {
    const response = await this.client.get("/api/v1/knowledge", { params });
    return response.data.data || response.data;
  }

  async getKnowledgeEntry(entryId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/knowledge/${entryId}`);
    return response.data.data || response.data;
  }

  // ROI & Analytics
  async getROIInsights(params?: { timeframe?: string }): Promise<any> {
    const response = await this.client.get("/api/v1/roi/insights", { params });
    return response.data.data || response.data;
  }

  async getDORAMetrics(params?: { timeframe?: string }): Promise<any> {
    const response = await this.client.get("/api/v1/roi/dora", { params });
    return response.data.data || response.data;
  }

  // Arcade / Gamification
  async getMissions(): Promise<any[]> {
    const response = await this.client.get("/api/v1/arcade/missions");
    return response.data.data || response.data;
  }

  async claimMission(missionId: string): Promise<any> {
    const response = await this.client.post(
      `/api/v1/arcade/missions/${missionId}/claim`
    );
    return response.data;
  }

  async getLeaderboard(): Promise<any[]> {
    const response = await this.client.get("/api/v1/arcade/leaderboard");
    return response.data.data || response.data;
  }

  // Test Orchestration
  async startOrchestration(data: {
    testFiles: string[];
    workerCount?: number;
    project?: string;
    branch?: string;
    commitSha?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    const response = await this.client.post("/api/v1/orchestrate", data);
    return response.data;
  }

  async getTestRuns(params?: {
    tenant?: string;
    project?: string;
    branch?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const response = await this.client.get("/api/v1/runs", { params });
    return response.data;
  }

  async getTestRun(runId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/runs/${runId}`);
    return response.data;
  }

  async getFailedTests(runId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/runs/${runId}/failed-tests`);
    return response.data;
  }

  async getRunArtifacts(runId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/runs/${runId}/artifacts`);
    return response.data;
  }

  async cancelOrchestration(runId: string): Promise<any> {
    const response = await this.client.delete(`/api/v1/orchestrate/${runId}`);
    return response.data;
  }

  async getQueueStats(): Promise<any> {
    const response = await this.client.get("/api/v1/orchestrate/queue/stats");
    return response.data;
  }

  // Flakiness Analytics
  async getFlakyTests(params?: {
    project?: string;
    minRate?: number;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const response = await this.client.get("/api/v1/analytics/flaky-tests", { params });
    return response.data;
  }

  async getFlakinessTrends(params?: {
    project?: string;
    days?: number;
  }): Promise<any> {
    const response = await this.client.get("/api/v1/analytics/flakiness-trends", { params });
    return response.data;
  }

  async getFlakyRecommendations(): Promise<any> {
    const response = await this.client.get("/api/v1/analytics/flaky-recommendations");
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get("/health");
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;
