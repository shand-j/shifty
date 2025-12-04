"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("@shifty/database");
const zod_1 = require("zod");
const fastify = (0, fastify_1.default)({
    logger: {
        level: process.env.LOG_LEVEL || 'info'
    }
});
// Validation schemas
const RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    tenantName: zod_1.z.string().min(1).optional()
});
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
class AuthService {
    constructor() {
        this.dbManager = new database_1.DatabaseManager();
        // CRITICAL: Hardcoded JWT secret - SECURITY VULNERABILITY
        // FIXME: Must be changed before production or all auth is compromised
        // TODO: See api-gateway JWT secret fix for implementation steps
        // Effort: 30 minutes | Priority: CRITICAL
        this.jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    }
    async start() {
        try {
            await this.dbManager.initialize();
            await this.registerPlugins();
            await this.registerRoutes();
            const port = parseInt(process.env.PORT || '3002', 10);
            await fastify.listen({ port, host: '0.0.0.0' });
            console.log(`🔐 Auth Service running on port ${port}`);
        }
        catch (error) {
            console.error('Failed to start Auth Service:', error);
            process.exit(1);
        }
    }
    async registerPlugins() {
        await fastify.register(Promise.resolve().then(() => __importStar(require('@fastify/cors'))), {
            origin: true,
            credentials: true
        });
        await fastify.register(Promise.resolve().then(() => __importStar(require('@fastify/helmet'))));
        await fastify.register(Promise.resolve().then(() => __importStar(require('@fastify/rate-limit'))), {
            max: 1000,
            timeWindow: '1 minute'
        });
    }
    async registerRoutes() {
        // MEDIUM: Health endpoint publicly exposed - information disclosure
        // FIXME: No authentication, reveals service name, version, internal status
        // TODO: Add authentication or move to internal network:
        //   1. Add API key validation for health checks
        //   2. Only expose /health to load balancer IP range
        //   3. Separate public /status (minimal info) from internal /health (detailed)
        //   4. Remove detailed error messages from public responses
        // Impact: Attackers learn service topology, versions, dependencies
        // Effort: 4 hours | Priority: MEDIUM
        fastify.get('/health', async () => {
            return {
                status: 'healthy',
                service: 'auth-service',
                timestamp: new Date().toISOString()
            };
        });
        // Register new user and tenant
        fastify.post('/api/v1/auth/register', async (request, reply) => {
            try {
                const body = RegisterSchema.parse(request.body);
                // Check if user already exists
                const existingUser = await this.findUserByEmail(body.email);
                if (existingUser) {
                    return reply.status(409).send({ error: 'User already exists' });
                }
                // LOW: Bcrypt cost factor is good (12 rounds)
                // Note: This provides adequate security for MVP
                // TODO (post-MVP): Consider Argon2id for even better resistance to GPU attacks
                const hashedPassword = await bcrypt_1.default.hash(body.password, 12);
                // Create user and tenant in transaction
                const result = await this.createUserAndTenant({
                    ...body,
                    password: hashedPassword
                });
                // Generate JWT
                const token = this.generateToken({
                    userId: result.user.id,
                    tenantId: result.user.tenantId,
                    role: result.user.role,
                    email: result.user.email
                });
                reply.send({
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        firstName: result.user.firstName,
                        lastName: result.user.lastName,
                        tenantId: result.user.tenantId,
                        role: result.user.role
                    },
                    token,
                    tenant: result.tenant
                });
            }
            catch (error) {
                console.error('Registration error:', error);
                if (error instanceof zod_1.z.ZodError) {
                    return reply.status(400).send({ error: 'Invalid input', details: error.errors });
                }
                reply.status(500).send({ error: 'Internal server error' });
            }
        });
        // Login
        fastify.post('/api/v1/auth/login', async (request, reply) => {
            try {
                const { email, password } = LoginSchema.parse(request.body);
                // Find user
                const user = await this.findUserByEmail(email);
                if (!user) {
                    return reply.status(401).send({ error: 'Invalid credentials' });
                }
                // Verify password
                const passwordMatch = await bcrypt_1.default.compare(password, user.password);
                if (!passwordMatch) {
                    return reply.status(401).send({ error: 'Invalid credentials' });
                }
                // Generate JWT
                const token = this.generateToken({
                    userId: user.id,
                    tenantId: user.tenantId,
                    role: user.role,
                    email: user.email
                });
                reply.send({
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        tenantId: user.tenantId,
                        role: user.role
                    },
                    token
                });
            }
            catch (error) {
                // MEDIUM: Generic error messages - poor developer experience
                // FIXME: No error codes, logs, or correlation IDs for debugging
                // TODO: Implement structured error handling:
                //   1. Add unique error codes (AUTH_001, AUTH_002, etc.)
                //   2. Include request correlation ID in all responses
                //   3. Log full error with context to centralized logging
                //   4. Return different messages for dev vs production
                // Impact: Hard to debug, poor DX, longer incident resolution
                // Effort: 1 day | Priority: MEDIUM
                console.error('Login error:', error);
                if (error instanceof zod_1.z.ZodError) {
                    return reply.status(400).send({ error: 'Invalid input' });
                }
                reply.status(500).send({ error: 'Internal server error' });
            }
        });
        // Token verification endpoint
        fastify.post('/api/v1/auth/verify', async (request, reply) => {
            try {
                const authHeader = request.headers.authorization;
                if (!authHeader?.startsWith('Bearer ')) {
                    return reply.status(401).send({ error: 'Missing or invalid token' });
                }
                const token = authHeader.substring(7);
                const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
                // Get fresh user data
                const user = await this.findUserById(decoded.userId);
                if (!user) {
                    return reply.status(401).send({ error: 'User not found' });
                }
                reply.send({
                    valid: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        tenantId: user.tenantId,
                        role: user.role
                    }
                });
            }
            catch (error) {
                console.error('Token verification error:', error);
                reply.status(401).send({ error: 'Invalid token' });
            }
        });
        // Logout (mainly for client-side cleanup)
        fastify.post('/api/v1/auth/logout', async (request, reply) => {
            reply.send({ message: 'Logged out successfully' });
        });
    }
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, {
            expiresIn: '24h',
            issuer: 'shifty-auth'
        });
    }
    async findUserByEmail(email) {
        const client = await this.dbManager.getClient();
        try {
            const result = await client.query(`
        SELECT u.*, t.name as tenant_name
        FROM users u
        JOIN tenants t ON u.tenant_id = t.id
        WHERE u.email = $1
      `, [email]);
            const row = result.rows[0];
            if (!row)
                return null;
            // Transform snake_case to camelCase
            return {
                id: row.id,
                email: row.email,
                password: row.password,
                firstName: row.first_name,
                lastName: row.last_name,
                tenantId: row.tenant_id,
                role: row.role,
                createdAt: row.created_at,
                tenantName: row.tenant_name
            };
        }
        finally {
            client.release();
        }
    }
    async findUserById(id) {
        const client = await this.dbManager.getClient();
        try {
            const result = await client.query(`
        SELECT u.*, t.name as tenant_name
        FROM users u
        JOIN tenants t ON u.tenant_id = t.id
        WHERE u.id = $1
      `, [id]);
            const row = result.rows[0];
            if (!row)
                return null;
            // Transform snake_case to camelCase
            return {
                id: row.id,
                email: row.email,
                firstName: row.first_name,
                lastName: row.last_name,
                tenantId: row.tenant_id,
                role: row.role,
                createdAt: row.created_at
            };
        }
        finally {
            client.release();
        }
    }
    async createUserAndTenant(userData) {
        const client = await this.dbManager.getClient();
        try {
            await client.query('BEGIN');
            // Create tenant if specified
            let tenantId;
            let tenant;
            if (userData.tenantName) {
                const tenantResult = await client.query(`
          INSERT INTO tenants (id, name, slug, plan, status, region, database_url, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, 'starter', 'active', 'us-east-1', 'postgresql://tenant:password@localhost:5432/tenant_' || gen_random_uuid(), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *
        `, [userData.tenantName, userData.tenantName.toLowerCase().replace(/\s+/g, '-')]);
                tenant = tenantResult.rows[0];
                tenantId = tenant.id;
            }
            else {
                throw new Error('Tenant name is required');
            }
            // Create user
            const userResult = await client.query(`
        INSERT INTO users (id, email, password, first_name, last_name, tenant_id, role)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'owner')
        RETURNING id, email, first_name, last_name, tenant_id, role, created_at
      `, [
                userData.email,
                userData.password,
                userData.firstName,
                userData.lastName,
                tenantId
            ]);
            const row = userResult.rows[0];
            // Transform snake_case to camelCase
            const user = {
                id: row.id,
                email: row.email,
                firstName: row.first_name,
                lastName: row.last_name,
                tenantId: row.tenant_id,
                role: row.role,
                createdAt: row.created_at
            };
            await client.query('COMMIT');
            return { user, tenant };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async stop() {
        await this.dbManager.close();
        await fastify.close();
        console.log('Auth Service stopped');
    }
}
const authService = new AuthService();
authService.start();
// Graceful shutdown
process.on('SIGTERM', async () => {
    await authService.stop();
    process.exit(0);
});
process.on('SIGINT', async () => {
    await authService.stop();
    process.exit(0);
});
exports.default = AuthService;
//# sourceMappingURL=index.js.map