(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/frontend/lib/api-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiClient",
    ()=>apiClient,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/apps/frontend/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/frontend/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
class APIClient {
    client;
    token = null;
    refreshPromise = null;
    constructor(baseURL){
        const apiUrl = baseURL || ("TURBOPACK compile-time value", "http://localhost:3000") || "http://localhost:3000";
        this.client = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
            baseURL: apiUrl,
            timeout: 30000,
            headers: {
                "Content-Type": "application/json"
            }
        });
        // Request interceptor - add auth token
        this.client.interceptors.request.use((config)=>{
            if (this.token && config.headers) {
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            return config;
        }, (error)=>Promise.reject(error));
        // Response interceptor - handle token refresh and errors
        this.client.interceptors.response.use((response)=>response, async (error)=>{
            const originalRequest = error.config;
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
                    if ("TURBOPACK compile-time truthy", 1) {
                        window.location.href = "/login";
                    }
                    return Promise.reject(refreshError);
                }
            }
            // Format error response
            const apiError = {
                error: error.response?.data?.error || "Request failed",
                message: error.response?.data?.message || error.message || "An error occurred",
                statusCode: error.response?.status
            };
            return Promise.reject(apiError);
        });
        // Load token from localStorage on client-side
        if ("TURBOPACK compile-time truthy", 1) {
            const savedToken = localStorage.getItem("shifty_token");
            if (savedToken) {
                this.token = savedToken;
            }
        }
    }
    // Token management
    setToken(token) {
        this.token = token;
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.setItem("shifty_token", token);
        }
    }
    clearToken() {
        this.token = null;
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.removeItem("shifty_token");
        }
    }
    getToken() {
        return this.token;
    }
    // Token refresh logic
    async refreshToken() {
        // Prevent multiple simultaneous refresh requests
        if (this.refreshPromise) {
            return this.refreshPromise;
        }
        this.refreshPromise = (async ()=>{
            try {
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$frontend$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${this.client.defaults.baseURL}/api/v1/auth/refresh`, {}, {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });
                const newToken = response.data.token;
                this.setToken(newToken);
                return newToken;
            } finally{
                this.refreshPromise = null;
            }
        })();
        return this.refreshPromise;
    }
    // Authentication endpoints
    async login(credentials) {
        const response = await this.client.post("/api/v1/auth/login", credentials);
        this.setToken(response.data.token);
        return response.data;
    }
    async register(data) {
        const response = await this.client.post("/api/v1/auth/register", data);
        this.setToken(response.data.token);
        return response.data;
    }
    async logout() {
        try {
            await this.client.post("/api/v1/auth/logout");
        } finally{
            this.clearToken();
        }
    }
    async verifyToken() {
        const response = await this.client.post("/api/v1/auth/verify");
        return response.data.user;
    }
    // User endpoints
    async getCurrentUser() {
        const response = await this.client.get("/api/v1/users/me");
        return response.data.user;
    }
    async updateUser(userId, data) {
        const response = await this.client.put(`/api/v1/users/${userId}`, data);
        return response.data.user;
    }
    // Tenant endpoints
    async getTenants() {
        const response = await this.client.get("/api/v1/tenants");
        return response.data.data || response.data;
    }
    async getTenant(tenantId) {
        const response = await this.client.get(`/api/v1/tenants/${tenantId}`);
        return response.data.data || response.data;
    }
    async createTenant(data) {
        const response = await this.client.post("/api/v1/tenants", data);
        return response.data.data || response.data;
    }
    // Test generation endpoints
    async generateTest(data) {
        const response = await this.client.post("/api/v1/tests/generate", data);
        return response.data;
    }
    async getGenerationStatus(jobId) {
        const response = await this.client.get(`/api/v1/tests/generate/${jobId}/status`);
        return response.data;
    }
    // Healing endpoints
    async healSelector(data) {
        const response = await this.client.post("/api/v1/healing/heal-selector", data);
        return response.data;
    }
    async getHealingStrategies() {
        const response = await this.client.get("/api/v1/healing/strategies");
        return response.data;
    }
    async batchHeal(data) {
        const response = await this.client.post("/api/v1/healing/batch-heal", data);
        return response.data;
    }
    // Notifications
    async getNotifications() {
        const response = await this.client.get("/api/v1/notifications");
        return response.data.data || response.data;
    }
    async markNotificationRead(notificationId) {
        await this.client.put(`/api/v1/notifications/${notificationId}/read`);
    }
    // Teams
    async getTeams() {
        const response = await this.client.get("/api/v1/teams");
        return response.data.data || response.data;
    }
    async getTeam(teamId) {
        const response = await this.client.get(`/api/v1/teams/${teamId}`);
        return response.data.data || response.data;
    }
    // Projects
    async getProjects() {
        const response = await this.client.get("/api/v1/projects");
        return response.data.data || response.data;
    }
    async getProject(projectId) {
        const response = await this.client.get(`/api/v1/projects/${projectId}`);
        return response.data.data || response.data;
    }
    // Pipelines
    async getPipelines() {
        const response = await this.client.get("/api/v1/pipelines");
        return response.data.data || response.data;
    }
    async getPipeline(pipelineId) {
        const response = await this.client.get(`/api/v1/pipelines/${pipelineId}`);
        return response.data.data || response.data;
    }
    // Knowledge
    async getKnowledge(params) {
        const response = await this.client.get("/api/v1/knowledge", {
            params
        });
        return response.data.data || response.data;
    }
    async getKnowledgeEntry(entryId) {
        const response = await this.client.get(`/api/v1/knowledge/${entryId}`);
        return response.data.data || response.data;
    }
    // ROI & Analytics
    async getROIInsights(params) {
        const response = await this.client.get("/api/v1/roi/insights", {
            params
        });
        return response.data.data || response.data;
    }
    async getDORAMetrics(params) {
        const response = await this.client.get("/api/v1/roi/dora", {
            params
        });
        return response.data.data || response.data;
    }
    // Arcade / Gamification
    async getMissions() {
        const response = await this.client.get("/api/v1/arcade/missions");
        return response.data.data || response.data;
    }
    async claimMission(missionId) {
        const response = await this.client.post(`/api/v1/arcade/missions/${missionId}/claim`);
        return response.data;
    }
    async getLeaderboard() {
        const response = await this.client.get("/api/v1/arcade/leaderboard");
        return response.data.data || response.data;
    }
    // Test Orchestration
    async startOrchestration(data) {
        const response = await this.client.post("/api/v1/orchestrate", data);
        return response.data;
    }
    async getTestRuns(params) {
        const response = await this.client.get("/api/v1/runs", {
            params
        });
        return response.data;
    }
    async getTestRun(runId) {
        const response = await this.client.get(`/api/v1/runs/${runId}`);
        return response.data;
    }
    async getFailedTests(runId) {
        const response = await this.client.get(`/api/v1/runs/${runId}/failed-tests`);
        return response.data;
    }
    async getRunArtifacts(runId) {
        const response = await this.client.get(`/api/v1/runs/${runId}/artifacts`);
        return response.data;
    }
    async cancelOrchestration(runId) {
        const response = await this.client.delete(`/api/v1/orchestrate/${runId}`);
        return response.data;
    }
    async getQueueStats() {
        const response = await this.client.get("/api/v1/orchestrate/queue/stats");
        return response.data;
    }
    // Flakiness Analytics
    async getFlakyTests(params) {
        const response = await this.client.get("/api/v1/analytics/flaky-tests", {
            params
        });
        return response.data;
    }
    async getFlakinessTrends(params) {
        const response = await this.client.get("/api/v1/analytics/flakiness-trends", {
            params
        });
        return response.data;
    }
    async getFlakyRecommendations() {
        const response = await this.client.get("/api/v1/analytics/flaky-recommendations");
        return response.data;
    }
    // Health check
    async healthCheck() {
        const response = await this.client.get("/health");
        return response.data;
    }
}
const apiClient = new APIClient();
const __TURBOPACK__default__export__ = apiClient;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_frontend_lib_api-client_ts_f78d2aca._.js.map