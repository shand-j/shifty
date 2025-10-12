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
        // Security
        await fastify.register(helmet_1.default, {
            contentSecurityPolicy: false
        });
        // CORS
        await fastify.register(cors_1.default, {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3010'],
            credentials: true
        });
        // Rate limiting - use memory store with reasonable limits
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
        // JWT
        await fastify.register(jwt_1.default, {
            secret: process.env.JWT_SECRET || 'dev-secret-change-in-production'
        });
    }
    async registerRoutes() {
        // Health check with service discovery
        fastify.get('/health', async () => {
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
            // Basic metrics for MVP
            return {
                requests: {
                    total: Math.floor(Math.random() * 1000) + 100, // Mock data for MVP
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
                        // Add tenant context to request headers
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