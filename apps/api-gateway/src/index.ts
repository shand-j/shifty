import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import proxy from '@fastify/http-proxy';
import jwt from '@fastify/jwt';
import Redis from 'ioredis';
import { 
  getJwtConfig, 
  validateProductionConfig,
  RequestLimits,
  safeValidateJwtPayload,
  createValidationErrorResponse
} from '@shifty/shared';

// Validate configuration on startup
try {
  validateProductionConfig();
} catch (error) {
  console.error('Configuration validation failed:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Configure Fastify with proper request limits to prevent DoS attacks
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  },
  bodyLimit: RequestLimits.bodyLimit, // 1MB limit for JSON requests
  requestTimeout: RequestLimits.requestTimeout // 30 seconds timeout
});

interface ServiceRoute {
  prefix: string;
  target: string;
  requiresAuth?: boolean;
}

// ============================================================
// CIRCUIT BREAKER IMPLEMENTATION
// ============================================================

interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

class CircuitBreaker {
  private circuits: Map<string, CircuitBreakerState> = new Map();
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenSuccessThreshold: number;

  constructor(options: {
    failureThreshold?: number;
    resetTimeout?: number;
    halfOpenSuccessThreshold?: number;
  } = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.halfOpenSuccessThreshold = options.halfOpenSuccessThreshold || 2;
  }

  getState(serviceName: string): CircuitBreakerState {
    if (!this.circuits.has(serviceName)) {
      this.circuits.set(serviceName, {
        state: 'closed',
        failureCount: 0,
        successCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0
      });
    }
    return this.circuits.get(serviceName)!;
  }

  canAttempt(serviceName: string): boolean {
    const circuit = this.getState(serviceName);
    
    if (circuit.state === 'closed') {
      return true;
    }
    
    if (circuit.state === 'open') {
      // Check if we should transition to half-open
      if (Date.now() >= circuit.nextAttemptTime) {
        circuit.state = 'half-open';
        circuit.successCount = 0;
        console.log(`🔄 Circuit for ${serviceName} transitioning to half-open`);
        return true;
      }
      return false;
    }
    
    // half-open state - allow the request
    return true;
  }

  recordSuccess(serviceName: string): void {
    const circuit = this.getState(serviceName);
    
    if (circuit.state === 'half-open') {
      circuit.successCount++;
      if (circuit.successCount >= this.halfOpenSuccessThreshold) {
        circuit.state = 'closed';
        circuit.failureCount = 0;
        console.log(`✅ Circuit for ${serviceName} closed - service recovered`);
      }
    } else if (circuit.state === 'closed') {
      // Reset failure count on success
      circuit.failureCount = Math.max(0, circuit.failureCount - 1);
    }
  }

  recordFailure(serviceName: string): void {
    const circuit = this.getState(serviceName);
    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();
    
    if (circuit.state === 'half-open') {
      // Immediately open circuit on failure during half-open
      circuit.state = 'open';
      circuit.nextAttemptTime = Date.now() + this.resetTimeout;
      console.log(`🔴 Circuit for ${serviceName} opened - half-open test failed`);
    } else if (circuit.state === 'closed' && circuit.failureCount >= this.failureThreshold) {
      circuit.state = 'open';
      circuit.nextAttemptTime = Date.now() + this.resetTimeout;
      console.log(`🔴 Circuit for ${serviceName} opened - failure threshold reached`);
    }
  }

  getStatus(): Record<string, { state: string; failures: number }> {
    const status: Record<string, { state: string; failures: number }> = {};
    for (const [name, circuit] of this.circuits) {
      status[name] = { state: circuit.state, failures: circuit.failureCount };
    }
    return status;
  }
}

// ============================================================
// REAL METRICS COLLECTION
// ============================================================

interface MetricsData {
  requests: {
    total: number;
    byStatus: Record<string, number>;
    byService: Record<string, number>;
  };
  latency: {
    samples: number[];
    sum: number;
  };
  startTime: number;
}

class MetricsCollector {
  private metrics: MetricsData = {
    requests: {
      total: 0,
      byStatus: {},
      byService: {}
    },
    latency: {
      samples: [],
      sum: 0
    },
    startTime: Date.now()
  };

  private readonly maxSamples = 1000;

  recordRequest(service: string, statusCode: number, latencyMs: number): void {
    this.metrics.requests.total++;
    
    // Track by status code
    const statusKey = String(statusCode);
    this.metrics.requests.byStatus[statusKey] = (this.metrics.requests.byStatus[statusKey] || 0) + 1;
    
    // Track by service
    this.metrics.requests.byService[service] = (this.metrics.requests.byService[service] || 0) + 1;
    
    // Track latency (keep rolling window)
    this.metrics.latency.samples.push(latencyMs);
    this.metrics.latency.sum += latencyMs;
    
    if (this.metrics.latency.samples.length > this.maxSamples) {
      const removed = this.metrics.latency.samples.shift()!;
      this.metrics.latency.sum -= removed;
    }
  }

  getMetrics(): {
    requests: { total: number; rate: string };
    responses: { by_status: Record<string, number>; average_time: string };
    services: Record<string, number>;
    uptime: number;
    timestamp: string;
  } {
    const uptimeSeconds = Math.floor((Date.now() - this.metrics.startTime) / 1000);
    const avgLatency = this.metrics.latency.samples.length > 0
      ? Math.round(this.metrics.latency.sum / this.metrics.latency.samples.length)
      : 0;
    
    // Calculate requests per minute
    const minutesUp = Math.max(1, uptimeSeconds / 60);
    const requestsPerMin = Math.round(this.metrics.requests.total / minutesUp);

    return {
      requests: {
        total: this.metrics.requests.total,
        rate: `${requestsPerMin} req/min`
      },
      responses: {
        by_status: { ...this.metrics.requests.byStatus },
        average_time: `${avgLatency}ms`
      },
      services: { ...this.metrics.requests.byService },
      uptime: uptimeSeconds,
      timestamp: new Date().toISOString()
    };
  }
}

class APIGateway {
  private redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  private circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 30000,
    halfOpenSuccessThreshold: 2
  });

  private metricsCollector = new MetricsCollector();

  // MEDIUM: Hardcoded service URLs - manual configuration required
  // FIXME: Service discovery hardcoded, not K8s-friendly
  // TODO: Implement service discovery:
  //   1. Use Kubernetes DNS (service-name.namespace.svc.cluster.local)
  //   2. Or integrate with Consul/etcd for service registry
  //   3. Add health-check based routing (skip unhealthy instances)
  //   4. Support dynamic service registration
  // Impact: Manual config for each environment, no auto-scaling
  // Effort: 2-3 days | Priority: MEDIUM
  private services: ServiceRoute[] = [
    {
      prefix: '/api/v1/tenants',
      target: process.env.TENANT_MANAGER_URL || 'http://localhost:3001',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/auth',
      target: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
      requiresAuth: false
    },
    {
      prefix: '/api/v1/users',
      target: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/ai',
      target: process.env.AI_ORCHESTRATOR_URL || 'http://localhost:3003',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/tests',
      target: process.env.TEST_GENERATOR_URL || 'http://localhost:3004',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/healing',
      target: process.env.HEALING_ENGINE_URL || 'http://localhost:3005',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/teams',
      target: process.env.TENANT_MANAGER_URL || 'http://localhost:3001',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/projects',
      target: process.env.TENANT_MANAGER_URL || 'http://localhost:3001',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/pipelines',
      target: process.env.CICD_GOVERNOR_URL || 'http://localhost:3012',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/knowledge',
      target: process.env.TENANT_MANAGER_URL || 'http://localhost:3001',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/notifications',
      target: process.env.TENANT_MANAGER_URL || 'http://localhost:3001',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/arcade',
      target: process.env.HITL_ARCADE_URL || 'http://localhost:3011',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/roi',
      target: process.env.ROI_SERVICE_URL || 'http://localhost:3015',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/performance',
      target: process.env.PERFORMANCE_TESTING_URL || 'http://localhost:3016',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/security',
      target: process.env.SECURITY_TESTING_URL || 'http://localhost:3017',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/accessibility',
      target: process.env.ACCESSIBILITY_TESTING_URL || 'http://localhost:3018',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/sessions/manual',
      target: process.env.MANUAL_SESSION_HUB_URL || 'http://localhost:3019',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/hitl',
      target: process.env.HITL_ARCADE_URL || 'http://localhost:3011',
      requiresAuth: true
    },
    {
      prefix: '/api/v1/ci',
      target: process.env.CICD_GOVERNOR_URL || 'http://localhost:3012',
      requiresAuth: true
    }
  ];

  async start() {
    try {
      await this.redis.ping();

      await this.registerMiddleware();
      await this.registerRoutes();
      await this.registerProxies();

      const port = parseInt(process.env.PORT || '3000', 10);
      await fastify.listen({ port, host: '0.0.0.0' });

      console.log(`🌐 API Gateway running on port ${port}`);
      console.log('📡 Registered services:', this.services.map(s => s.prefix));
    } catch (error) {
      console.error('Failed to start API Gateway:', error);
      process.exit(1);
    }
  }

  private async registerMiddleware() {
    // Enable CSP with secure defaults for API gateway
    // Note: For API-only gateway, CSP is less critical but still useful
    await fastify.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for error pages
          imgSrc: ["'self'", "data:"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
          blockAllMixedContent: process.env.NODE_ENV === 'production' ? [] : null
        },
        // Start with report-only in non-production for monitoring
        reportOnly: process.env.NODE_ENV !== 'production'
      },
      // Additional security headers
      xssFilter: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts: process.env.NODE_ENV === 'production' ? {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      } : false
    });

    // CORS - improved configuration with production validation
    const corsOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
    if (process.env.NODE_ENV === 'production' && corsOrigins.length === 0) {
      console.warn('⚠️ WARNING: ALLOWED_ORIGINS not configured in production');
    }

    // Default development origins - includes frontend apps
    const defaultOrigins = [
      'http://localhost:3010', // Next.js frontend
      'http://localhost:3000', // API Gateway itself (for development)
      'http://frontend:3000' // Docker network
    ];

    await fastify.register(cors, {
      origin: corsOrigins.length > 0 ? corsOrigins : defaultOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
      maxAge: 86400 // 24 hours
    });

    // Mock interceptor for development and testing
    // Provides enterprise-scale mock data when MOCK_MODE=true
    const { registerMockInterceptor } = await import('./middleware/mock-interceptor');
    registerMockInterceptor(fastify, {
      enabled: process.env.MOCK_MODE === 'true',
      latencyMin: 50,
      latencyMax: 300
    });

    // Rate limiting with Redis store for persistence across restarts
    // Falls back to memory store if Redis unavailable
    interface RateLimitContext {
      max: number;
      ttl: number;
    }
    
    const rateLimitConfig = {
      max: process.env.NODE_ENV === 'test' ? 100 : 500, // Requests per minute
      timeWindow: '1 minute',
      errorResponseBuilder: (_request: unknown, context: RateLimitContext) => {
        return {
          error: 'Rate limit exceeded',
          message: `Too many requests, limit: ${context.max} per minute`,
          retryAfter: context.ttl,
          code: 'RATE_LIMIT_EXCEEDED'
        };
      },
      addHeaders: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true
      },
      // Key generator for per-tenant rate limiting
      keyGenerator: (request: { headers: Record<string, string | string[] | undefined>; ip?: string }) => {
        const tenantId = request.headers['x-tenant-id'] || 'anonymous';
        const ip = request.ip || 'unknown';
        return `${tenantId}:${ip}`;
      },
      redis: undefined as unknown
    };

    // Try to use Redis for rate limiting if available
    try {
      if (this.redis.status === 'ready') {
        rateLimitConfig.redis = this.redis;
        console.log('✅ Rate limiting using Redis store');
      }
    } catch (error) {
      console.warn('⚠️ Redis not available for rate limiting, using memory store');
    }

    await fastify.register(rateLimit, rateLimitConfig);

    // JWT configuration using centralized config module
    // Production validation is handled at startup via validateProductionConfig()
    const jwtConfig = getJwtConfig();
    await fastify.register(jwt, {
      secret: jwtConfig.secret
    });
  }

  private async registerRoutes() {
    // Health check with circuit breaker protection
    fastify.get('/health', async () => {
      const serviceHealth = await Promise.allSettled(
        this.services.map(async (service) => {
          const serviceName = service.prefix.replace('/api/v1/', '');
          const startTime = Date.now();
          
          // Check circuit breaker before attempting
          if (!this.circuitBreaker.canAttempt(serviceName)) {
            return {
              service: service.prefix,
              status: 'circuit-open',
              target: service.target,
              circuitState: this.circuitBreaker.getState(serviceName).state
            };
          }

          try {
            const response = await fetch(`${service.target}/health`, {
              method: 'GET',
              signal: AbortSignal.timeout(5000)
            });
            
            const latency = Date.now() - startTime;
            
            if (response.ok) {
              this.circuitBreaker.recordSuccess(serviceName);
              this.metricsCollector.recordRequest(serviceName, 200, latency);
              return {
                service: service.prefix,
                status: 'healthy',
                target: service.target,
                responseTime: `${latency}ms`
              };
            } else {
              this.circuitBreaker.recordFailure(serviceName);
              this.metricsCollector.recordRequest(serviceName, response.status, latency);
              return {
                service: service.prefix,
                status: 'unhealthy',
                target: service.target,
                responseTime: `${latency}ms`
              };
            }
          } catch (error) {
            const latency = Date.now() - startTime;
            this.circuitBreaker.recordFailure(serviceName);
            this.metricsCollector.recordRequest(serviceName, 503, latency);
            return {
              service: service.prefix,
              status: 'unreachable',
              target: service.target,
              responseTime: `${latency}ms`
            };
          }
        })
      );

      const results = serviceHealth.map(result =>
        result.status === 'fulfilled' ? result.value : {
          service: 'unknown',
          status: 'error'
        }
      );

      // Determine overall status
      const healthyCount = results.filter(s => s.status === 'healthy').length;
      const overallStatus = healthyCount === results.length 
        ? 'healthy' 
        : healthyCount > 0 
          ? 'degraded' 
          : 'unhealthy';

      return {
        status: overallStatus,
        service: 'api-gateway',
        timestamp: new Date().toISOString(),
        services: results,
        circuitBreakers: this.circuitBreaker.getStatus()
      };
    });

    // Service health aggregation endpoint
    fastify.get('/api/v1/services/health', async () => {
      const serviceHealth = await Promise.allSettled(
        this.services.map(async (service) => {
          const serviceName = service.prefix.replace('/api/v1/', '');
          const startTime = Date.now();
          
          // Check circuit breaker
          if (!this.circuitBreaker.canAttempt(serviceName)) {
            return {
              service: serviceName,
              status: 'circuit-open',
              last_check: new Date().toISOString(),
              response_time: 'N/A',
              target: service.target,
              circuit_state: this.circuitBreaker.getState(serviceName).state
            };
          }

          try {
            const response = await fetch(`${service.target}/health`, {
              method: 'GET',
              signal: AbortSignal.timeout(3000)
            });
            const responseTime = Date.now() - startTime;
            
            if (response.ok) {
              this.circuitBreaker.recordSuccess(serviceName);
            } else {
              this.circuitBreaker.recordFailure(serviceName);
            }

            return {
              service: serviceName,
              status: response.ok ? 'healthy' : 'unhealthy',
              last_check: new Date().toISOString(),
              response_time: `${responseTime}ms`,
              target: service.target
            };
          } catch {
            this.circuitBreaker.recordFailure(serviceName);
            return {
              service: serviceName,
              status: 'unhealthy',
              last_check: new Date().toISOString(),
              response_time: 'timeout',
              target: service.target
            };
          }
        })
      );

      const services = serviceHealth.reduce((acc, result) => {
        if (result.status === 'fulfilled') {
          acc[result.value.service] = {
            status: result.value.status,
            last_check: result.value.last_check,
            response_time: result.value.response_time
          };
        }
        return acc;
      }, {} as any);

      const healthyCount = Object.values(services).filter((s: any) => s.status === 'healthy').length;
      const totalCount = Object.keys(services).length;

      let overall_status;
      if (healthyCount === totalCount) {
        overall_status = 'healthy';
      } else if (healthyCount > 0) {
        overall_status = 'degraded';
      } else {
        overall_status = 'unhealthy';
      }

      return {
        overall_status,
        services,
        circuitBreakers: this.circuitBreaker.getStatus(),
        timestamp: new Date().toISOString()
      };
    });

    // Gateway metrics endpoint - now with real metrics
    fastify.get('/api/v1/metrics', async () => {
      const metrics = this.metricsCollector.getMetrics();
      
      return {
        requests: metrics.requests,
        responses: metrics.responses,
        services: {
          count: this.services.length,
          breakdown: metrics.services
        },
        circuitBreakers: this.circuitBreaker.getStatus(),
        uptime: metrics.uptime,
        timestamp: metrics.timestamp
      };
    });

    // API documentation endpoint
    fastify.get('/api/docs', async () => {
      return {
        title: 'Shifty API Gateway',
        version: '1.0.0',
        services: this.services.map(service => ({
          prefix: service.prefix,
          requiresAuth: service.requiresAuth,
          documentation: `${service.target}/docs`
        }))
      };
    });

    // Track metrics for all requests via hook
    fastify.addHook('onResponse', async (request, reply) => {
      const service = this.services.find(s => request.url.startsWith(s.prefix));
      const serviceName = service ? service.prefix.replace('/api/v1/', '') : 'gateway';
      const latency = reply.getResponseTime();
      this.metricsCollector.recordRequest(serviceName, reply.statusCode, latency);
    });

    // Authentication middleware
    fastify.addHook('preHandler', async (request, reply) => {
      try {
        const service = this.services.find(s =>
          request.url.startsWith(s.prefix)
        );

        if (service?.requiresAuth) {
          try {
            await request.jwtVerify();

            // Validate JWT payload structure and content using Zod schema
            const payload = request.user as unknown;
            const validationResult = safeValidateJwtPayload(payload);
            
            if (!validationResult.success) {
              console.warn('JWT payload validation failed:', validationResult.error.errors);
              const validationError = createValidationErrorResponse(validationResult.error);
              return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Invalid token payload',
                code: validationError.code,
                details: validationError.details
              });
            }

            const validatedPayload = validationResult.data;
            
            // Set validated and sanitized headers
            request.headers['x-tenant-id'] = validatedPayload.tenantId;
            request.headers['x-user-id'] = validatedPayload.userId;
            request.headers['x-user-role'] = validatedPayload.role;

          } catch (jwtErr: any) {
            console.log('JWT verification failed:', jwtErr.message);
            return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' });
          }
        }
      } catch (err: any) {
        console.error('Auth middleware error:', err);
        return reply.status(500).send({ error: 'Authentication service error' });
      }
    });
  }

  private async registerProxies() {
    for (const service of this.services) {
      await fastify.register(proxy, {
        upstream: service.target,
        prefix: service.prefix,
        http2: false,
        replyOptions: {
          onError: (reply, error) => {
            console.error(`Proxy error for ${service.prefix}:`, error);
            reply.status(503).send({
              error: 'Service unavailable',
              service: service.prefix
            });
          }
        }
      });
    }
  }

  async stop() {
    await this.redis.quit();
    await fastify.close();
    console.log('API Gateway stopped');
  }
}

const gateway = new APIGateway();
gateway.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await gateway.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await gateway.stop();
  process.exit(0);
});

export default APIGateway;
