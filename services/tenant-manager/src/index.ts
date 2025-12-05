import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
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

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);
    this.dbManager = new DatabaseManager();
    this.tenantService = new TenantService(this.dbManager);
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware() {
    // MEDIUM: Express security middleware not optimally configured
    // FIXME: Using defaults, no custom CSP, HSTS, or frame options
    // TODO: Harden helmet configuration with strict CSP
    // Effort: 4 hours | Priority: MEDIUM
    this.app.use(helmet());
    // MEDIUM: CORS configuration - see API Gateway comments
    // Effort: 2 hours | Priority: MEDIUM
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }));

    // Performance middleware
    this.app.use(compression());

    // HIGH: In-memory rate limiting - doesn't scale
    // FIXME: Rate limits reset on restart, no distributed state
    // TODO: Use Redis-backed rate limiting for multi-instance deployments
    // Effort: 1 day | Priority: HIGH
    const limiter = rateLimit({
      windowMs: process.env.NODE_ENV === 'test' ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 min for test, 15 min for production
      max: process.env.NODE_ENV === 'test' ? 1000 : 100, // Much more permissive for testing
      message: 'Too many requests from this IP',
      skip: (req) => {
        // Exclude health checks from rate limiting
        return req.path === '/health' || req.path === '/api/v1/health';
      }
    });
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
    await this.dbManager.close();
    console.log('Tenant Manager service stopped');
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