"use client"

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true"

interface AuthTokens {
  token: string
  refreshToken?: string
}

interface ApiClientConfig {
  baseURL?: string
  mockMode?: boolean
}

interface RefreshTokenResponse {
  token: string
  refreshToken?: string
}

class APIClient {
  private client: AxiosInstance
  private authTokens: AuthTokens | null = null
  private mockMode: boolean
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: unknown) => void
  }> = []

  constructor(config: ApiClientConfig = {}) {
    this.mockMode = config.mockMode ?? MOCK_MODE
    
    this.client = axios.create({
      baseURL: config.baseURL || API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
    this.loadTokensFromStorage()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add mock mode header
        if (this.mockMode) {
          config.headers["X-Mock-Mode"] = "true"
        }

        // Add auth token
        if (this.authTokens?.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.authTokens.token}`
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then(() => this.client(originalRequest))
              .catch((err) => Promise.reject(err))
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const newTokens = await this.refreshAccessToken()
            this.setAuthTokens(newTokens.token, newTokens.refreshToken)
            this.processQueue(null)
            return this.client(originalRequest)
          } catch (refreshError) {
            this.processQueue(refreshError)
            this.clearAuth()
            if (typeof window !== "undefined") {
              window.location.href = "/login"
            }
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private processQueue(error: unknown) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error)
      } else {
        promise.resolve()
      }
    })
    this.failedQueue = []
  }

  private loadTokensFromStorage() {
    if (typeof window === "undefined") return

    const token = localStorage.getItem("auth_token")
    const refreshToken = localStorage.getItem("refresh_token")

    if (token) {
      this.authTokens = { token, refreshToken: refreshToken || undefined }
    }
  }

  private saveTokensToStorage(token: string, refreshToken?: string) {
    if (typeof window === "undefined") return

    localStorage.setItem("auth_token", token)
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken)
    }
  }

  private clearTokensFromStorage() {
    if (typeof window === "undefined") return

    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
  }

  public setAuthTokens(token: string, refreshToken?: string) {
    this.authTokens = { token, refreshToken }
    this.saveTokensToStorage(token, refreshToken)
  }

  public clearAuth() {
    this.authTokens = null
    this.clearTokensFromStorage()
  }

  public getAuthToken(): string | null {
    return this.authTokens?.token || null
  }

  public isAuthenticated(): boolean {
    return !!this.authTokens?.token
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    const response = await this.client.post("/api/v1/auth/login", credentials)
    if (response.data.token) {
      this.setAuthTokens(response.data.token, response.data.refreshToken)
    }
    return response.data
  }

  async register(data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) {
    const response = await this.client.post("/api/v1/auth/register", data)
    if (response.data.token) {
      this.setAuthTokens(response.data.token, response.data.refreshToken)
    }
    return response.data
  }

  async logout() {
    try {
      await this.client.post("/api/v1/auth/logout")
    } finally {
      this.clearAuth()
    }
  }

  async refreshAccessToken(): Promise<RefreshTokenResponse> {
    if (!this.authTokens?.refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await this.client.post("/api/v1/auth/refresh", {
      refreshToken: this.authTokens.refreshToken,
    })

    return response.data
  }

  // User endpoints
  async getCurrentUser() {
    const response = await this.client.get("/api/v1/users/me")
    return response.data
  }

  async updateUser(userId: string, data: Record<string, unknown>) {
    const response = await this.client.patch(`/api/v1/users/${userId}`, data)
    return response.data
  }

  // Tenant endpoints
  async getTenants() {
    const response = await this.client.get("/api/v1/tenants")
    return response.data
  }

  async getTenant(tenantId: string) {
    const response = await this.client.get(`/api/v1/tenants/${tenantId}`)
    return response.data
  }

  async createTenant(data: { name: string; slug: string }) {
    const response = await this.client.post("/api/v1/tenants", data)
    return response.data
  }

  // Teams endpoints
  async getTeams() {
    const response = await this.client.get("/api/v1/teams")
    return response.data
  }

  async getTeam(teamId: string) {
    const response = await this.client.get(`/api/v1/teams/${teamId}`)
    return response.data
  }

  // Projects endpoints
  async getProjects() {
    const response = await this.client.get("/api/v1/projects")
    return response.data
  }

  async getProject(projectId: string) {
    const response = await this.client.get(`/api/v1/projects/${projectId}`)
    return response.data
  }

  async createProject(data: Record<string, unknown>) {
    const response = await this.client.post("/api/v1/projects", data)
    return response.data
  }

  // Tests endpoints
  async getTests(params?: Record<string, unknown>) {
    const response = await this.client.get("/api/v1/tests", { params })
    return response.data
  }

  async getTest(testId: string) {
    const response = await this.client.get(`/api/v1/tests/${testId}`)
    return response.data
  }

  async generateTests(data: Record<string, unknown>) {
    const response = await this.client.post("/api/v1/ai/generate-tests", data)
    return response.data
  }

  // Healing endpoints
  async getHealingSuggestions(params?: Record<string, unknown>) {
    const response = await this.client.get("/api/v1/healing/suggestions", { params })
    return response.data
  }

  async approveHealing(healingId: string) {
    const response = await this.client.post(`/api/v1/healing/${healingId}/approve`)
    return response.data
  }

  async rejectHealing(healingId: string, reason?: string) {
    const response = await this.client.post(`/api/v1/healing/${healingId}/reject`, { reason })
    return response.data
  }

  // Pipelines endpoints
  async getPipelines(params?: Record<string, unknown>) {
    const response = await this.client.get("/api/v1/pipelines", { params })
    return response.data
  }

  async getPipeline(pipelineId: string) {
    const response = await this.client.get(`/api/v1/pipelines/${pipelineId}`)
    return response.data
  }

  // Sessions endpoints
  async getSessions(params?: Record<string, unknown>) {
    const response = await this.client.get("/api/v1/sessions", { params })
    return response.data
  }

  async getSession(sessionId: string) {
    const response = await this.client.get(`/api/v1/sessions/${sessionId}`)
    return response.data
  }

  async createSession(data: Record<string, unknown>) {
    const response = await this.client.post("/api/v1/sessions", data)
    return response.data
  }

  // Dashboard/Insights endpoints
  async getDashboardMetrics(persona?: string) {
    const response = await this.client.get("/api/v1/insights/dashboard", {
      params: { persona },
    })
    return response.data
  }

  async getROIMetrics(params?: Record<string, unknown>) {
    const response = await this.client.get("/api/v1/insights/roi", { params })
    return response.data
  }

  async getDORAMetrics(params?: Record<string, unknown>) {
    const response = await this.client.get("/api/v1/insights/dora", { params })
    return response.data
  }

  // Notifications endpoints
  async getNotifications() {
    const response = await this.client.get("/api/v1/notifications")
    return response.data
  }

  async markNotificationRead(notificationId: string) {
    const response = await this.client.patch(`/api/v1/notifications/${notificationId}/read`)
    return response.data
  }

  // Knowledge base endpoints
  async getKnowledgeEntries(params?: Record<string, unknown>) {
    const response = await this.client.get("/api/v1/knowledge", { params })
    return response.data
  }

  async getKnowledgeEntry(entryId: string) {
    const response = await this.client.get(`/api/v1/knowledge/${entryId}`)
    return response.data
  }

  // Arcade endpoints
  async getArcadeMissions() {
    const response = await this.client.get("/api/v1/arcade/missions")
    return response.data
  }

  async getArcadeLeaderboard() {
    const response = await this.client.get("/api/v1/arcade/leaderboard")
    return response.data
  }

  // Generic request method
  async request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config)
    return response.data
  }

  // ==================== THIRD-PARTY INTEGRATIONS ====================

  // GitHub
  async getGitHubRepos() {
    return this.get('/api/v1/github/repos');
  }

  async getGitHubPullRequests(owner: string, repo: string) {
    return this.get(`/api/v1/github/repos/${owner}/${repo}/pulls`);
  }

  async getGitHubCommits(owner: string, repo: string) {
    return this.get(`/api/v1/github/repos/${owner}/${repo}/commits`);
  }

  // Jira
  async getJiraIssues() {
    return this.get('/api/v1/jira/issues');
  }

  async getJiraIssue(key: string) {
    return this.get(`/api/v1/jira/issues/${key}`);
  }

  // Slack
  async getSlackChannels() {
    return this.get('/api/v1/slack/channels');
  }

  async getSlackMessages(channelId: string) {
    return this.get(`/api/v1/slack/channels/${channelId}/messages`);
  }

  // Sentry
  async getSentryErrors() {
    return this.get('/api/v1/sentry/errors');
  }

  // Datadog
  async getDatadogMetrics(query?: string) {
    return this.get('/api/v1/datadog/metrics', { params: { query } });
  }

  // Jenkins
  async getJenkinsBuilds() {
    return this.get('/api/v1/jenkins/builds');
  }

  async getJenkinsBuild(buildNumber: number) {
    return this.get(`/api/v1/jenkins/builds/${buildNumber}`);
  }

  // New Relic
  async getNewRelicAlerts() {
    return this.get('/api/v1/newrelic/alerts');
  }

  // Notion
  async getNotionDocuments() {
    return this.get('/api/v1/notion/documents');
  }

  // Production Logs
  async getProductionLogs(level?: string) {
    return this.get('/api/v1/logs/production', { params: { level } });
  }

  // GitLab
  async getGitLabProjects() {
    return this.get('/api/v1/gitlab/projects');
  }

  // CircleCI
  async getCircleCIPipelines() {
    return this.get('/api/v1/circleci/pipelines');
  }

  // Ollama AI
  async generateAIResponse(prompt: string) {
    return this.post('/api/v1/ollama/generate', { prompt });
  }
}

// Singleton instance
let apiClientInstance: APIClient | null = null

export function getAPIClient(): APIClient {
  if (!apiClientInstance) {
    apiClientInstance = new APIClient()
  }
  return apiClientInstance
}

export { APIClient }
export type { ApiClientConfig, AuthTokens }
