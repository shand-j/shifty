"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const http_proxy_1 = __importDefault(require("@fastify/http-proxy"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const redis_1 = require("redis");
// HIGH: No request body size limits - DoS vulnerability
// FIXME: Allows attackers to send huge payloads, exhausting memory
// TODO: Add body limits to Fastify config:
//   bodyLimit: 1048576 (1MB for JSON),
//   requestTimeout: 30000 (30 seconds)
// Impact: Service crashes via memory exhaustion attacks
// Effort: 30 minutes | Priority: HIGH
const fastify = (0, fastify_1.default)({
    logger: {
        level: process.env.LOG_LEVEL || 'info'
    }
});
class APIGateway {
    constructor() {
        this.redis = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        // MEDIUM: Hardcoded service URLs - manual configuration required
        // FIXME: Service discovery hardcoded, not K8s-friendly
        // TODO: Implement service discovery:
        //   1. Use Kubernetes DNS (service-name.namespace.svc.cluster.local)
        //   2. Or integrate with Consul/etcd for service registry
        //   3. Add health-check based routing (skip unhealthy instances)
        //   4. Support dynamic service registration
        // Impact: Manual config for each environment, no auto-scaling
        // Effort: 2-3 days | Priority: MEDIUM
        this.services = [
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
            }
        ];
    }
    async start() {
        try {
            await this.redis.connect();
            await this.registerMiddleware();
            await this.registerRoutes();
            await this.registerProxies();
            const port = parseInt(process.env.PORT || '3000', 10);
            await fastify.listen({ port, host: '0.0.0.0' });
            console.log(`🌐 API Gateway running on port ${port}`);
            console.log('📡 Registered services:', this.services.map(s => s.prefix));
        }
        catch (error) {
            console.error('Failed to start API Gateway:', error);
            process.exit(1);
        }
    }
    async registerMiddleware() {
        // MEDIUM: CSP disabled - XSS vulnerability
        // FIXME: contentSecurityPolicy: false removes important protection
        // TODO: Configure proper CSP headers:
        //   1. Set directives: default-src 'self', script-src 'self', etc.
        //   2. Add nonce-based inline script allowance if needed
        //   3. Report violations to security monitoring
        //   4. Start with report-only mode, then enforce
        // Impact: Cross-site scripting attacks possible
        // Effort: 4 hours | Priority: MEDIUM
        await fastify.register(helmet_1.default, {
            contentSecurityPolicy: false
        });
        // CORS
        // MEDIUM: CORS misconfiguration risk
        // FIXME: Falls back to single origin, missing wildcard protection
        // TODO: Improve CORS security:
        //   1. Validate ALLOWED_ORIGINS is set in production
        //   2. Never use '*' for credentials: true
        //   3. Log CORS violations for monitoring
        //   4. Restrict methods: methods: ['GET', 'POST', 'PUT', 'DELETE']
        // Impact: CSRF vulnerability if misconfigured
        // Effort: 2 hours | Priority: MEDIUM
        await fastify.register(cors_1.default, {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3010'],
            credentials: true
        });
        // Rate limiting - use memory store with reasonable limits
        // HIGH: In-memory rate limiting doesn't persist - DDoS vulnerability
        // FIXME: Redis integration commented out, limits reset on restart
        // TODO: Fix Redis integration:
        //   1. Upgrade @fastify/rate-limit to compatible version
        //   2. Enable redis: this.redis in config
        //   3. Test rate limits persist across pod restarts
        //   4. Add per-tenant rate limiting (use tenantId as key)
        // Impact: No DDoS protection, per-tenant limits don't work
        // Effort: 1 day | Priority: HIGH
        await fastify.register(rate_limit_1.default, {
            max: process.env.NODE_ENV === 'test' ? 10 : 1000, // Lower limit for testing
            timeWindow: '1 minute',
            errorResponseBuilder: (request, context) => {
                return {
                    error: 'Rate limit exceeded',
                    message: `Too many requests, limit: ${context.max} per minute`,
                    retryAfter: context.ttl
                };
            },
            addHeaders: {
                'x-ratelimit-limit': true,
                'x-ratelimit-remaining': true,
                'x-ratelimit-reset': true
            }
            // Use built-in memory store instead of Redis for now
            // redis: this.redis  // Commented out due to compatibility issues
        });
        // CRITICAL: Hardcoded JWT secret - SECURITY VULNERABILITY
        // FIXME: All tokens can be forged if deployed without changing this
        // TODO: Implement secure JWT secret handling:
        //   1. Generate strong secret: openssl rand -base64 64
        //   2. Store in AWS Secrets Manager or environment
        //   3. Add startup validation: if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-in-production')) { throw new Error('JWT_SECRET must be set in production'); }
        //   4. Never commit real secrets to git
        // Impact: Complete authentication bypass, privilege escalation
        // Effort: 30 minutes | Priority: CRITICAL
        await fastify.register(jwt_1.default, {
            secret: process.env.JWT_SECRET || 'dev-secret-change-in-production'
        });
    }
    async registerRoutes() {
        // Health check with service discovery
        fastify.get('/health', async () => {
            // HIGH: No circuit breaker - cascading failures
            // FIXME: When one service is down, health checks keep hammering it
            // TODO: Implement circuit breaker pattern:
            //   1. Track failure rate per service (open circuit after 50% failures)
            //   2. Add half-open state (test recovery after timeout)
            //   3. Return cached status when circuit is open
            //   4. Use library like opossum or implement custom
            // Impact: One service down can take entire platform offline
            // Effort: 2 days | Priority: HIGH
            const serviceHealth = await Promise.allSettled(this.services.map(async (service) => {
                try {
                    const response = await fetch(`${service.target}/health`, {
                        method: 'GET',
                        signal: AbortSignal.timeout(5000)
                    });
                    return {
                        service: service.prefix,
                        status: response.ok ? 'healthy' : 'unhealthy',
                        target: service.target
                    };
                }
                catch {
                    return {
                        service: service.prefix,
                        status: 'unreachable',
                        target: service.target
                    };
                }
            }));
            return {
                status: 'healthy',
                service: 'api-gateway',
                timestamp: new Date().toISOString(),
                services: serviceHealth.map(result => result.status === 'fulfilled' ? result.value : {
                    service: 'unknown',
                    status: 'error'
                })
            };
        });
        // Service health aggregation endpoint
        fastify.get('/api/v1/services/health', async () => {
            const serviceHealth = await Promise.allSettled(this.services.map(async (service) => {
                try {
                    const response = await fetch(`${service.target}/health`, {
                        method: 'GET',
                        signal: AbortSignal.timeout(3000)
                    });
                    return {
                        service: service.prefix.replace('/api/v1/', ''),
                        status: response.ok ? 'healthy' : 'unhealthy',
                        last_check: new Date().toISOString(),
                        response_time: '< 100ms', // Simplified for MVP
                        target: service.target
                    };
                }
                catch {
                    return {
                        service: service.prefix.replace('/api/v1/', ''),
                        status: 'unhealthy',
                        last_check: new Date().toISOString(),
                        response_time: 'timeout',
                        target: service.target
                    };
                }
            }));
            const services = serviceHealth.reduce((acc, result) => {
                if (result.status === 'fulfilled') {
                    acc[result.value.service] = {
                        status: result.value.status,
                        last_check: result.value.last_check,
                        response_time: result.value.response_time
                    };
                }
                return acc;
            }, {});
            const healthyCount = Object.values(services).filter((s) => s.status === 'healthy').length;
            const totalCount = Object.keys(services).length;
            let overall_status;
            if (healthyCount === totalCount) {
                overall_status = 'healthy';
            }
            else if (healthyCount > 0) {
                overall_status = 'degraded';
            }
            else {
                overall_status = 'unhealthy';
            }
            return {
                overall_status,
                services,
                timestamp: new Date().toISOString()
            };
        });
        // Gateway metrics endpoint
        fastify.get('/api/v1/metrics', async () => {
            // HIGH: Mock metrics - monitoring is fake
            // FIXME: Random data doesn't reflect actual system state
            // TODO: Implement real metrics collection:
            //   1. Install Prometheus client or CloudWatch SDK
            //   2. Track actual request counters, latencies, status codes
            //   3. Aggregate from all services via service mesh
            //   4. Add Redis for metrics storage/aggregation
            // Impact: Cannot diagnose production issues, false sense of health
            // Effort: 3-5 days | Priority: HIGH
            return {
                requests: {
                    total: Math.floor(Math.random() * 1000) + 100, // MOCK: data for MVP
                    rate: Math.floor(Math.random() * 50) + 10 + ' req/min'
                },
                responses: {
                    by_status: {
                        '200': Math.floor(Math.random() * 800) + 100,
                        '404': Math.floor(Math.random() * 50) + 5,
                        '500': Math.floor(Math.random() * 20) + 1
                    },
                    average_time: Math.floor(Math.random() * 200) + 50 + 'ms'
                },
                services: this.services.length,
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
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
        // Authentication middleware
        fastify.addHook('preHandler', async (request, reply) => {
            try {
                const service = this.services.find(s => request.url.startsWith(s.prefix));
                if (service?.requiresAuth) {
                    try {
                        await request.jwtVerify();
                        // CRITICAL: No input validation on JWT payload - injection risk
                        // FIXME: User can inject arbitrary tenant IDs, privilege escalation
                        // TODO: Add Zod validation:
                        //   1. Create PayloadSchema with strict types
                        //   2. Validate payload before using: PayloadSchema.parse(request.user)
                        //   3. Sanitize all string fields (tenantId, userId, role)
                        //   4. Verify tenant exists and user has access
                        // Impact: XSS, SQL injection, privilege escalation
                        // Effort: 4 hours | Priority: CRITICAL
                        const payload = request.user;
                        if (payload) {
                            request.headers['x-tenant-id'] = payload.tenantId;
                            request.headers['x-user-id'] = payload.userId;
                            request.headers['x-user-role'] = payload.role;
                        }
                    }
                    catch (jwtErr) {
                        console.log('JWT verification failed:', jwtErr.message);
                        return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' });
                    }
                }
            }
            catch (err) {
                console.error('Auth middleware error:', err);
                return reply.status(500).send({ error: 'Authentication service error' });
            }
        });
    }
    async registerProxies() {
        for (const service of this.services) {
            await fastify.register(http_proxy_1.default, {
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
exports.default = APIGateway;
//# sourceMappingURL=index.js.map