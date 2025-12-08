import { DatabaseManager } from "@shifty/database";
import {
  getJwtConfig,
  getTenantDatabaseUrl,
  RequestLimits,
  validateProductionConfig,
} from "@shifty/shared";
import bcrypt from "bcrypt";
import Fastify from "fastify";
import jwt from "jsonwebtoken";
import { z } from "zod";

// Validate configuration on startup
try {
  validateProductionConfig();
} catch (error) {
  console.error("Configuration validation failed:", error);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

// Configure Fastify with proper request limits
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
  bodyLimit: RequestLimits.bodyLimit,
  requestTimeout: RequestLimits.requestTimeout,
});

// Validation schemas
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  tenantName: z.string().min(1).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  role: "owner" | "admin" | "member";
  createdAt: Date;
}

interface AuthToken {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

class AuthService {
  private dbManager: DatabaseManager;
  private jwtSecret: string;
  private jwtConfig: ReturnType<typeof getJwtConfig>;

  constructor() {
    this.dbManager = new DatabaseManager();
    // Use centralized JWT configuration with production validation
    this.jwtConfig = getJwtConfig();
    this.jwtSecret = this.jwtConfig.secret;
  }

  async start() {
    try {
      await this.dbManager.initialize();
      await this.registerPlugins();
      await this.registerRoutes();

      const port = parseInt(process.env.PORT || "3002", 10);
      await fastify.listen({ port, host: "0.0.0.0" });

      console.log(`🔐 Auth Service running on port ${port}`);
    } catch (error) {
      console.error("Failed to start Auth Service:", error);
      process.exit(1);
    }
  }

  private async registerPlugins() {
    await fastify.register(import("@fastify/cors"), {
      origin: true,
      credentials: true,
    });

    await fastify.register(import("@fastify/helmet"));

    await fastify.register(import("@fastify/rate-limit"), {
      max: 1000,
      timeWindow: "1 minute",
    });
  }

  private async registerRoutes() {
    // Minimal health endpoint for load balancers (no sensitive info)
    fastify.get("/health", async () => {
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
      };
    });

    // Register new user and tenant
    fastify.post("/api/v1/auth/register", async (request, reply) => {
      try {
        const body = RegisterSchema.parse(request.body);

        // Check if user already exists
        const existingUser = await this.findUserByEmail(body.email);
        if (existingUser) {
          return reply.status(409).send({ error: "User already exists" });
        }

        // Bcrypt with 12 rounds provides adequate security
        // Note: For future hardening, consider Argon2id for GPU attack resistance
        const hashedPassword = await bcrypt.hash(body.password, 12);

        // Create user and tenant in transaction
        const result = await this.createUserAndTenant({
          ...body,
          password: hashedPassword,
        });

        // Generate JWT
        const token = this.generateToken({
          userId: result.user.id,
          tenantId: result.user.tenantId,
          role: result.user.role,
          email: result.user.email,
        });

        reply.send({
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            tenantId: result.user.tenantId,
            role: result.user.role,
          },
          token,
          tenant: result.tenant,
        });
      } catch (error) {
        const correlationId = `reg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        console.error(`[${correlationId}] Registration error:`, error);
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: "Invalid input",
            code: "AUTH_001",
            correlationId,
            details: error.errors,
          });
        }
        reply.status(500).send({
          error: "Internal server error",
          code: "AUTH_002",
          correlationId,
        });
      }
    });

    // Login
    fastify.post("/api/v1/auth/login", async (request, reply) => {
      try {
        const { email, password } = LoginSchema.parse(request.body);

        // Find user
        const user = await this.findUserByEmail(email);
        if (!user) {
          return reply.status(401).send({ error: "Invalid credentials" });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return reply.status(401).send({ error: "Invalid credentials" });
        }

        // Generate JWT
        const token = this.generateToken({
          userId: user.id,
          tenantId: user.tenantId,
          role: user.role,
          email: user.email,
        });

        reply.send({
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            tenantId: user.tenantId,
            role: user.role,
          },
          token,
        });
      } catch (error) {
        const correlationId = `login-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        console.error(`[${correlationId}] Login error:`, error);
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: "Invalid input",
            code: "AUTH_003",
            correlationId,
          });
        }
        reply.status(401).send({
          error: "Invalid credentials",
          code: "AUTH_004",
          correlationId,
        });
      }
    });

    // Token verification endpoint
    fastify.post("/api/v1/auth/verify", async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
          return reply.status(401).send({ error: "Missing or invalid token" });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, this.jwtSecret) as AuthToken;

        // Get fresh user data
        const user = await this.findUserById(decoded.userId);
        if (!user) {
          return reply.status(401).send({ error: "User not found" });
        }

        reply.send({
          valid: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            tenantId: user.tenantId,
            role: user.role,
          },
        });
      } catch (error) {
        console.error("Token verification error:", error);
        reply.status(401).send({ error: "Invalid token" });
      }
    });

    // Logout (mainly for client-side cleanup)
    fastify.post("/api/v1/auth/logout", async (request, reply) => {
      reply.send({ message: "Logged out successfully" });
    });
  }

  private generateToken(payload: AuthToken): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: "24h",
      issuer: "shifty-auth",
    });
  }

  private async findUserByEmail(email: string): Promise<any> {
    const client = await this.dbManager.getClient();
    try {
      const result = await client.query(
        `
        SELECT u.*, t.name as tenant_name
        FROM users u
        JOIN tenants t ON u.tenant_id = t.id
        WHERE u.email = $1
      `,
        [email]
      );

      const row = result.rows[0];
      if (!row) return null;

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
        tenantName: row.tenant_name,
      };
    } finally {
      client.release();
    }
  }

  private async findUserById(id: string): Promise<AuthUser | null> {
    const client = await this.dbManager.getClient();
    try {
      const result = await client.query(
        `
        SELECT u.*, t.name as tenant_name
        FROM users u
        JOIN tenants t ON u.tenant_id = t.id
        WHERE u.id = $1
      `,
        [id]
      );

      const row = result.rows[0];
      if (!row) return null;

      // Transform snake_case to camelCase
      return {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        tenantId: row.tenant_id,
        role: row.role,
        createdAt: row.created_at,
      };
    } finally {
      client.release();
    }
  }

  private async createUserAndTenant(
    userData: any
  ): Promise<{ user: AuthUser; tenant: any }> {
    const client = await this.dbManager.getClient();

    try {
      await client.query("BEGIN");

      // Create tenant if specified
      let tenantId: string;
      let tenant: any;

      if (userData.tenantName) {
        // First insert the tenant with a placeholder database URL,
        // then update with the actual URL using the generated ID
        const tenantResult = await client.query(
          `
          INSERT INTO tenants (id, name, slug, plan, status, region, database_url, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, 'starter', 'active', 'us-east-1', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *
        `,
          [
            userData.tenantName,
            userData.tenantName.toLowerCase().replaceAll(/\s+/g, "-"),
          ]
        );

        tenant = tenantResult.rows[0];
        tenantId = tenant.id;

        // Update with the proper database URL using centralized config
        const tenantDbUrl = getTenantDatabaseUrl(tenantId);
        await client.query(
          `
          UPDATE tenants SET database_url = $1 WHERE id = $2
        `,
          [tenantDbUrl, tenantId]
        );
        tenant.database_url = tenantDbUrl;
      } else {
        throw new Error("Tenant name is required");
      }

      // Create user
      const userResult = await client.query(
        `
        INSERT INTO users (id, email, password, first_name, last_name, tenant_id, role)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'owner')
        RETURNING id, email, first_name, last_name, tenant_id, role, created_at
      `,
        [
          userData.email,
          userData.password,
          userData.firstName,
          userData.lastName,
          tenantId,
        ]
      );

      const row = userResult.rows[0];

      // Transform snake_case to camelCase
      const user = {
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        tenantId: row.tenant_id,
        role: row.role,
        createdAt: row.created_at,
      };

      await client.query("COMMIT");

      return { user, tenant };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log("Auth Service stopped");
  }
}

const authService = new AuthService();
authService.start();

// Graceful shutdown
process.on("SIGTERM", async () => {
  await authService.stop();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await authService.stop();
  process.exit(0);
});

export default AuthService;
