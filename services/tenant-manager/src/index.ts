import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { TenantService } from './services/tenant.service';
import { tenantRoutes } from './routes/tenant.routes';
import { DatabaseManager } from '@shifty/database';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { RequestLimits, validateProductionConfig } from '@shifty/shared';

// Validate configuration on startup
try {
  validateProductionConfig();
} catch (error) {
  console.error('Configuration validation failed:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

class TenantManagerApp {
  private app: express.Application;
  private port: number;
  private tenantService: TenantService;
  private dbManager: DatabaseManager;
  private redisClient: Redis | null = null;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);
    this.dbManager = new DatabaseManager();
    this.tenantService = new TenantService(this.dbManager);
    
    this.initializeRedis();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeRedis() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    try {
      this.redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            console.error('❌ Redis connection failed after 3 retries, falling back to in-memory rate limiting');
            return null; // Stop retrying
          }
          return Math.min(times * 1000, 3000); // Exponential backoff
        }
      });

      this.redisClient.on('connect', () => {
        console.log('✅ Redis connected for distributed rate limiting');
      });

      this.redisClient.on('error', (err) => {
        console.error('⚠️  Redis error:', err.message);
      });

      this.redisClient.on('close', () => {
        console.log('⚠️  Redis connection closed');
      });
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      this.redisClient = null;
    }
  }

  private initializeMiddleware() {
    // Hardened security middleware with strict CSP and HSTS
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for UI frameworks
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
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
        preload: true
      },
      frameguard: {
        action: 'deny' // Prevent clickjacking
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
      },
      xssFilter: true,
      noSniff: true,
      ieNoOpen: true,
      hidePoweredBy: true
    }));
    // Hardened CORS configuration
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        // Check if origin is allowed
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
      exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
      maxAge: 86400 // 24 hours
    }));

    // Performance middleware
    this.app.use(compression());

    // Redis-backed distributed rate limiting with fallback to in-memory
    const limiterConfig: any = {
      windowMs: process.env.NODE_ENV === 'test' ? 1 * 60 * 1000 : 15 * 60 * 1000,
      max: process.env.NODE_ENV === 'test' ? 1000 : 100,
      message: 'Too many requests from this IP',
      skip: (req: express.Request) => {
        // Exclude health checks from rate limiting
        return req.path === '/health' || req.path === '/api/v1/health';
      },
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    };

    // Use Redis store if available, otherwise fallback to in-memory
    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        // Type assertion needed due to library interface mismatch
        limiterConfig.store = new (RedisStore as any)({
          client: this.redisClient,
          prefix: 'rl:tenant-manager:',
        });
        console.log('✅ Using Redis-backed distributed rate limiting');
      } catch (error) {
        console.error('⚠️  Failed to create Redis store, falling back to in-memory:', error);
      }
    } else {
      console.log('⚠️  Redis not available, using in-memory rate limiting (not suitable for production)');
    }

    const limiter = rateLimit(limiterConfig);
    this.app.use(limiter);

    // Body parsing with centralized request limits
    this.app.use(express.json({ limit: RequestLimits.bodyLimit }));
    this.app.use(express.urlencoded({ extended: true, limit: RequestLimits.bodyLimit }));

    // Request logging
    this.app.use(requestLogger);
  }

  private initializeRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        service: 'tenant-manager',
        timestamp: new Date().toISOString()
      });
    });

    // API routes
    this.app.use('/api/v1/tenants', tenantRoutes(this.tenantService));
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
      console.error('Failed to start Tenant Manager service:', error);
      process.exit(1);
    }
  }

  public async stop() {
    console.log('Shutting down Tenant Manager...');
    
    // Close Redis connection
    if (this.redisClient) {
      await this.redisClient.quit();
      console.log('✅ Redis connection closed');
    }
    
    // Close database connections
    await this.dbManager.close();
    
    console.log('✅ Tenant Manager service stopped');
  }
}

// Start the service
const app = new TenantManagerApp();
app.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

export default TenantManagerApp;