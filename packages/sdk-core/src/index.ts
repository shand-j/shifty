/**
 * @shifty/sdk-core
 * 
 * Core SDK for Shifty AI-Powered Testing Platform
 * Provides authentication, telemetry, and persona-aware API clients.
 */

import { trace, SpanKind, SpanStatusCode, Tracer } from '@opentelemetry/api';

// ============================================================
// CONFIGURATION
// ============================================================

export interface ShiftyConfig {
  /** Shifty API base URL */
  apiUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Tenant ID */
  tenantId: string;
  /** Persona scope for API requests */
  persona?: PersonaScope;
  /** Enable telemetry collection */
  enableTelemetry?: boolean;
  /** OpenTelemetry collector endpoint */
  otlpEndpoint?: string;
}

export type PersonaScope = 'pm' | 'designer' | 'qa' | 'dev' | 'manager';

export interface ShiftyClientOptions {
  config: ShiftyConfig;
}

// ============================================================
// AUTH CLIENT
// ============================================================

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  persona: PersonaScope;
}

export class ShiftyAuthClient {
  private config: ShiftyConfig;
  private token: AuthToken | null = null;

  constructor(config: ShiftyConfig) {
    this.config = config;
  }

  /**
   * Authenticate with API key and get access token
   */
  async authenticate(): Promise<AuthToken> {
    const response = await fetch(`${this.config.apiUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
        'X-Tenant-ID': this.config.tenantId
      },
      body: JSON.stringify({
        persona: this.config.persona || 'dev'
      })
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { accessToken: string; refreshToken?: string; expiresIn: number };
    this.token = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + (data.expiresIn * 1000),
      persona: this.config.persona || 'dev'
    };

    return this.token;
  }

  /**
   * Get current access token, refreshing if needed
   */
  async getToken(): Promise<string> {
    if (!this.token || Date.now() >= this.token.expiresAt - 60000) {
      await this.authenticate();
    }
    return this.token!.accessToken;
  }

  /**
   * Get authorization headers for API requests
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': this.config.tenantId,
      'X-Persona-Scope': this.config.persona || 'dev'
    };
  }
}

// ============================================================
// TELEMETRY CLIENT
// ============================================================

export interface TelemetryEvent {
  eventType: string;
  attributes?: Record<string, string | number | boolean>;
  timestamp?: number;
}

export class ShiftyTelemetryClient {
  private config: ShiftyConfig;
  private tracer: Tracer;
  private events: TelemetryEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: ShiftyConfig) {
    this.config = config;
    this.tracer = trace.getTracer('@shifty/sdk-core', '1.0.0');

    if (config.enableTelemetry) {
      this.startAutoFlush();
    }
  }

  /**
   * Emit an SDK event span for telemetry
   */
  emitEvent(event: TelemetryEvent): void {
    const span = this.tracer.startSpan('sdk.event', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'event_type': event.eventType,
        'tenant_id': this.config.tenantId,
        'sdk_version': '1.0.0',
        'persona': this.config.persona || 'dev',
        ...event.attributes
      }
    });

    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    this.events.push({
      ...event,
      timestamp: event.timestamp || Date.now()
    });
  }

  /**
   * Record a custom span for tracing
   */
  startSpan(name: string, attributes?: Record<string, string | number | boolean>) {
    return this.tracer.startSpan(name, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'tenant_id': this.config.tenantId,
        'persona': this.config.persona || 'dev',
        ...attributes
      }
    });
  }

  /**
   * Flush events to the telemetry endpoint
   */
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    try {
      const endpoint = this.config.otlpEndpoint || `${this.config.apiUrl}/telemetry/events`;
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Tenant-ID': this.config.tenantId
        },
        body: JSON.stringify({ events: this.events })
      });

      this.events = [];
    } catch (error) {
      console.warn('Failed to flush telemetry events:', error);
    }
  }

  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => this.flush(), 30000);
  }

  /**
   * Stop telemetry collection and flush remaining events
   */
  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flush();
  }
}

// ============================================================
// API CLIENT
// ============================================================

export interface TestGenerationRequest {
  url: string;
  requirements: string;
  testType?: 'e2e' | 'integration' | 'smoke' | 'regression';
  options?: {
    generateVisualTests?: boolean;
    includeAccessibility?: boolean;
    mobileViewport?: boolean;
  };
}

export interface HealSelectorRequest {
  url: string;
  brokenSelector: string;
  expectedElementType?: string;
  strategy?: 'data-testid-recovery' | 'text-content-matching' | 'css-hierarchy-analysis' | 'ai-powered-analysis';
}

export class ShiftyApiClient {
  private config: ShiftyConfig;
  private auth: ShiftyAuthClient;
  private telemetry: ShiftyTelemetryClient;

  constructor(config: ShiftyConfig) {
    this.config = config;
    this.auth = new ShiftyAuthClient(config);
    this.telemetry = new ShiftyTelemetryClient(config);
  }

  /**
   * Generate a test from natural language requirements
   */
  async generateTest(request: TestGenerationRequest): Promise<{ requestId: string; status: string }> {
    const span = this.telemetry.startSpan('api.generate_test');
    
    try {
      const headers = await this.auth.getAuthHeaders();
      const response = await fetch(`${this.config.apiUrl}/api/v1/tests/generate`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Test generation failed: ${response.status}`);
      }

      const result = await response.json() as { requestId: string; status: string };
      
      this.telemetry.emitEvent({
        eventType: 'test_generation_requested',
        attributes: {
          request_id: result.requestId,
          test_type: request.testType || 'e2e',
          url: request.url
        }
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Heal a broken selector
   */
  async healSelector(request: HealSelectorRequest): Promise<{
    healedSelector?: string;
    confidence: number;
    strategy: string;
    success: boolean;
  }> {
    const span = this.telemetry.startSpan('api.heal_selector');
    
    try {
      const headers = await this.auth.getAuthHeaders();
      const response = await fetch(`${this.config.apiUrl}/api/v1/healing/heal-selector`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Selector healing failed: ${response.status}`);
      }

      const result = await response.json() as {
        healedSelector?: string;
        confidence: number;
        strategy: string;
        success: boolean;
      };
      
      this.telemetry.emitEvent({
        eventType: 'selector_healing_requested',
        attributes: {
          success: result.success,
          strategy: result.strategy,
          confidence: result.confidence
        }
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Check generation status
   */
  async getGenerationStatus(requestId: string): Promise<{
    status: string;
    generatedCode?: string;
    error?: string;
  }> {
    const headers = await this.auth.getAuthHeaders();
    const response = await fetch(`${this.config.apiUrl}/api/v1/tests/generate/${requestId}/status`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    return await response.json() as { status: string; generatedCode?: string; error?: string };
  }

  /**
   * Get telemetry client for custom events
   */
  getTelemetry(): ShiftyTelemetryClient {
    return this.telemetry;
  }

  /**
   * Shutdown the client and flush telemetry
   */
  async shutdown(): Promise<void> {
    await this.telemetry.shutdown();
  }
}

// ============================================================
// MAIN SDK CLASS
// ============================================================

export class ShiftySDK {
  public readonly api: ShiftyApiClient;
  public readonly auth: ShiftyAuthClient;
  public readonly telemetry: ShiftyTelemetryClient;
  private readonly config: ShiftyConfig;

  constructor(options: ShiftyClientOptions) {
    this.config = options.config;
    this.auth = new ShiftyAuthClient(this.config);
    this.telemetry = new ShiftyTelemetryClient(this.config);
    this.api = new ShiftyApiClient(this.config);
  }

  /**
   * Create SDK instance from environment variables
   */
  static fromEnv(): ShiftySDK {
    const config: ShiftyConfig = {
      apiUrl: process.env.SHIFTY_API_URL || 'http://localhost:3000',
      apiKey: process.env.SHIFTY_API_KEY || '',
      tenantId: process.env.SHIFTY_TENANT_ID || '',
      persona: (process.env.SHIFTY_PERSONA as PersonaScope) || 'dev',
      enableTelemetry: process.env.SHIFTY_TELEMETRY !== 'false',
      otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
    };

    if (!config.apiKey) {
      throw new Error('SHIFTY_API_KEY environment variable is required');
    }

    return new ShiftySDK({ config });
  }

  /**
   * Shutdown the SDK
   */
  async shutdown(): Promise<void> {
    await this.api.shutdown();
  }
}

// Default export
export default ShiftySDK;
