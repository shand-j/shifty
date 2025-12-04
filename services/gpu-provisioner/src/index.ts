import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { DatabaseManager } from '@shifty/database';
import { GpuProvisionerService } from './services/gpu-provisioner.service';
import { GpuProvisioningRequestSchema } from '@shifty/shared';

class GpuProvisionerApp {
  private app: express.Application;
  private port: number;
  private dbManager: DatabaseManager;
  private gpuService: GpuProvisionerService;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3006', 10);
    this.dbManager = new DatabaseManager();
    this.gpuService = new GpuProvisionerService(this.dbManager);

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware() {
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }));
    this.app.use(compression());

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP',
    });
    this.app.use(limiter);

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'gpu-provisioner',
        timestamp: new Date().toISOString()
      });
    });

    // Provision new GPU instance
    this.app.post('/api/v1/instances', async (req, res) => {
      try {
        const validatedRequest = GpuProvisioningRequestSchema.parse(req.body);
        const result = await this.gpuService.provisionInstance(validatedRequest);
        res.status(201).json({
          success: true,
          data: result,
        });
      } catch (error: any) {
        console.error('Failed to provision instance:', error);
        res.status(400).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Get instance status
    this.app.get('/api/v1/instances/:instanceId', async (req, res) => {
      try {
        const instance = await this.gpuService.getInstanceStatus(req.params.instanceId);
        if (!instance) {
          return res.status(404).json({
            success: false,
            error: 'Instance not found',
          });
        }
        res.json({
          success: true,
          data: instance,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Get tenant instances
    this.app.get('/api/v1/tenants/:tenantId/instances', async (req, res) => {
      try {
        const instances = await this.gpuService.getTenantInstances(req.params.tenantId);
        res.json({
          success: true,
          data: instances,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Terminate instance
    this.app.delete('/api/v1/instances/:instanceId', async (req, res) => {
      try {
        await this.gpuService.terminateInstance(req.params.instanceId);
        res.json({
          success: true,
          message: 'Instance terminated',
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Get cost summary
    this.app.get('/api/v1/tenants/:tenantId/costs', async (req, res) => {
      try {
        const periodStart = new Date(req.query.start as string || Date.now() - 30 * 24 * 60 * 60 * 1000);
        const periodEnd = new Date(req.query.end as string || Date.now());
        
        const costs = await this.gpuService.getCostSummary(
          req.params.tenantId,
          periodStart,
          periodEnd
        );
        res.json({
          success: true,
          data: costs,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Health check for specific instance
    this.app.get('/api/v1/instances/:instanceId/health', async (req, res) => {
      try {
        const health = await this.gpuService.healthCheck(req.params.instanceId);
        res.json({
          success: true,
          data: health,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });
  }

  private initializeErrorHandling() {
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    });
  }

  public async start() {
    try {
      await this.dbManager.initialize();
      
      this.app.listen(this.port, () => {
        console.log(`🖥️ GPU Provisioner service running on port ${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
      });

      // Start cost tracking interval (every 5 minutes)
      setInterval(() => this.gpuService.updateCostTracking(), 5 * 60 * 1000);
    } catch (error) {
      console.error('Failed to start GPU Provisioner service:', error);
      process.exit(1);
    }
  }

  public async stop() {
    await this.dbManager.close();
    console.log('GPU Provisioner service stopped');
  }
}

const app = new GpuProvisionerApp();
app.start();

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

export default GpuProvisionerApp;
