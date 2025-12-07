import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Token storage keys
const TOKEN_KEY = 'shifty-auth-token';
const REFRESH_TOKEN_KEY = 'shifty-refresh-token';

interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    persona: string;
    role: string;
  };
}

interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

class APIClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - inject auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add mock mode header if enabled
        if (MOCK_MODE && config.headers) {
          config.headers['X-Mock-Mode'] = 'true';
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for ongoing refresh
            try {
              const newToken = await this.refreshPromise;
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.client(originalRequest);
            } catch (refreshError) {
              return Promise.reject(refreshError);
            }
          }

          originalRequest._retry = true;
          this.isRefreshing = true;
          this.refreshPromise = this.refreshToken();

          try {
            const newToken = await this.refreshPromise;
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearAuth();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as { message?: string; error?: string };
      return {
        message: data.message || data.error || 'An error occurred',
        code: error.code,
        details: error.response.data,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: 'No response from server. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Error in request setup
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'REQUEST_ERROR',
      };
    }
  }

  // Token management
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  // Token refresh logic
  private async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}/api/v1/auth/refresh`,
        { refreshToken },
        { timeout: 10000 }
      );

      const { token, refreshToken: newRefreshToken } = response.data;
      this.setToken(token);
      if (newRefreshToken) {
        this.setRefreshToken(newRefreshToken);
      }

      return token;
    } catch (error) {
      this.clearAuth();
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/v1/auth/login', {
      email,
      password,
    });

    const { token, refreshToken, user } = response.data;
    this.setToken(token);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/v1/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await this.client.get<AuthResponse['user']>('/api/v1/auth/me');
    return response.data;
  }

  // Tenant endpoints
  async getCurrentTenant(): Promise<{ id: string; name: string; slug: string }> {
    const response = await this.client.get('/api/v1/tenants/current');
    return response.data;
  }

  async getTenants(): Promise<Array<{ id: string; name: string; slug: string }>> {
    const response = await this.client.get('/api/v1/tenants');
    return response.data;
  }

  // Notifications
  async getNotifications(): Promise<
    Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      read: boolean;
      createdAt: string;
      link?: string;
    }>
  > {
    const response = await this.client.get('/api/v1/notifications');
    return response.data;
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.client.patch(`/api/v1/notifications/${id}/read`);
  }

  // Dashboard insights
  async getDeveloperInsights(): Promise<unknown> {
    const response = await this.client.get('/api/v1/insights/developer');
    return response.data;
  }

  async getQAInsights(): Promise<unknown> {
    const response = await this.client.get('/api/v1/insights/qa');
    return response.data;
  }

  async getPOInsights(): Promise<unknown> {
    const response = await this.client.get('/api/v1/insights/po');
    return response.data;
  }

  async getManagerInsights(): Promise<unknown> {
    const response = await this.client.get('/api/v1/insights/manager');
    return response.data;
  }

  // Generic request methods
  async get<T = unknown>(url: string, config?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: Record<string, unknown>): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isMockMode(): boolean {
    return MOCK_MODE;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;
