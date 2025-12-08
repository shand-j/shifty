import { DatabaseManager } from "@shifty/database";
import { RequestLimits, validateProductionConfig } from "@shifty/shared";
import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { errorHandler } from "./middleware/error-handler";
import { requestLogger } from "./middleware/request-logger";
import { tenantRoutes } from "./routes/tenant.routes";
import { TenantService } from "./services/tenant.service";

// Validate configuration on startup
try {
  validateProductionConfig();
} catch (error) {
  console.error("Configuration validation failed:", error);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

class TenantManagerApp {
  private app: express.Application;
  private port: number;
  private tenantService: TenantService;
  private dbManager: DatabaseManager;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || "3001", 10);
    this.dbManager = new DatabaseManager();
    this.tenantService = new TenantService(this.dbManager);

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware() {
    // Security headers with hardened CSP configuration
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        hsts: {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true,
        },
        frameguard: {
          action: "deny",
        },
        noSniff: true,
        xssFilter: true,
      })
    );

    this.app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS?.split(",") || [
          "http://localhost:3000",
        ],
        credentials: true,
      })
    );

    // Performance middleware
    this.app.use(compression());

    // Note: In-memory rate limiting is acceptable for MVP
    // For production multi-instance deployments, migrate to Redis-backed rate limiting
    // using rate-limit-redis or similar distributed store
    const limiter = rateLimit({
      windowMs:
        process.env.NODE_ENV === "test" ? 1 * 60 * 1000 : 15 * 60 * 1000,
      max: process.env.NODE_ENV === "test" ? 1000 : 100,
      message: "Too many requests from this IP",
      skip: (req) => {
        return req.path === "/health" || req.path === "/api/v1/health";
      },
    });
    this.app.use(limiter);

    // Body parsing with centralized request limits
    this.app.use(express.json({ limit: RequestLimits.bodyLimit }));
    this.app.use(
      express.urlencoded({ extended: true, limit: RequestLimits.bodyLimit })
    );

    // Request logging
    this.app.use(requestLogger);
  }

  private initializeRoutes() {
    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        service: "tenant-manager",
        timestamp: new Date().toISOString(),
      });
    });

    // API routes
    this.app.use("/api/v1/tenants", tenantRoutes(this.tenantService));
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  public async start() {
    try {
      // Initialize database connections
      await this.dbManager.initialize();

      // Start the server
      this.app.listen(this.port, () => {
        console.log(`🏢 Tenant Manager service running on port ${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
      });
    } catch (error) {
      console.error("Failed to start Tenant Manager service:", error);
      process.exit(1);
    }
  }

  public async stop() {
    await this.dbManager.close();
    console.log("Tenant Manager service stopped");
  }
}

// Start the service
const app = new TenantManagerApp();
app.start();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await app.stop();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await app.stop();
  process.exit(0);
});

export default TenantManagerApp;
