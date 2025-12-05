import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { DatabaseManager } from '@shifty/database';
import { DataLifecycleService } from './services/data-lifecycle.service';

class DataLifecycleApp {
  private app: express.Application;
  private port: number;
  private dbManager: DatabaseManager;
  private lifecycleService: DataLifecycleService;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3008', 10);
    this.dbManager = new DatabaseManager();
    this.lifecycleService = new DataLifecycleService(this.dbManager);

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeScheduledJobs();
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
    });
    this.app.use(limiter);

    this.app.use(express.json({ limit: '10mb' }));
  }

  private initializeRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'data-lifecycle',
        timestamp: new Date().toISOString()
      });
    });

    // ==================== Retention Policies ====================
    
    this.app.post('/api/v1/tenants/:tenantId/retention-policies', async (req, res) => {
      try {
        const policy = await this.lifecycleService.createRetentionPolicy(
          req.params.tenantId,
          req.body
        );
        res.status(201).json({ success: true, data: policy });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/v1/tenants/:tenantId/retention-policies', async (req, res) => {
      try {
        const policies = await this.lifecycleService.getTenantRetentionPolicies(req.params.tenantId);
        res.json({ success: true, data: policies });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== Data Assets ====================

    this.app.post('/api/v1/tenants/:tenantId/assets', async (req, res) => {
      try {
        const asset = await this.lifecycleService.registerDataAsset(
          req.params.tenantId,
          req.body
        );
        res.status(201).json({ success: true, data: asset });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/v1/tenants/:tenantId/assets', async (req, res) => {
      try {
        const assets = await this.lifecycleService.getTenantDataAssets(
          req.params.tenantId,
          {
            type: req.query.type as any,
            classification: req.query.classification as any,
            status: req.query.status as any,
          }
        );
        res.json({ success: true, data: assets });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== Deletion Jobs ====================

    this.app.post('/api/v1/tenants/:tenantId/deletion-jobs', async (req, res) => {
      try {
        const job = await this.lifecycleService.requestDeletion(
          req.params.tenantId,
          req.body.assetIds,
          req.body.method,
          req.body.reason,
          req.body.requestedBy
        );
        res.status(201).json({ success: true, data: job });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/v1/deletion-jobs/:jobId/execute', async (req, res) => {
      try {
        const job = await this.lifecycleService.executeDeletionJob(
          req.params.jobId,
          req.body.approvedBy
        );
        res.json({ success: true, data: job });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/v1/deletion-jobs/:jobId', async (req, res) => {
      try {
        const job = await this.lifecycleService.getDeletionJob(req.params.jobId);
        if (!job) {
          return res.status(404).json({ success: false, error: 'Job not found' });
        }
        res.json({ success: true, data: job });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // ==================== Disposable Workspaces ====================

    this.app.post('/api/v1/tenants/:tenantId/workspaces', async (req, res) => {
      try {
        const workspace = await this.lifecycleService.createDisposableWorkspace(
          req.params.tenantId,
          req.body.type,
          req.body.sizeAllocatedBytes,
          req.body.autoDestroyAfterMinutes
        );
        res.status(201).json({ success: true, data: workspace });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    this.app.delete('/api/v1/workspaces/:workspaceId', async (req, res) => {
      try {
        await this.lifecycleService.destroyWorkspace(req.params.workspaceId);
        res.json({ success: true, message: 'Workspace destroyed' });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    // ==================== Compliance Reports ====================

    this.app.post('/api/v1/tenants/:tenantId/compliance-reports', async (req, res) => {
      try {
        const report = await this.lifecycleService.generateComplianceReport(
          req.params.tenantId,
          req.body.reportType,
          new Date(req.body.periodStart),
          new Date(req.body.periodEnd),
          req.body.generatedBy
        );
        res.status(201).json({ success: true, data: report });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    // ==================== Audit Logging ====================

    this.app.post('/api/v1/access-logs', async (req, res) => {
      try {
        await this.lifecycleService.logDataAccess(req.body);
        res.status(201).json({ success: true });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    // Secure delete endpoint for other services
    this.app.post('/api/v1/secure-delete', async (req, res) => {
      try {
        const job = await this.lifecycleService.requestDeletion(
          req.body.tenantId,
          req.body.assetIds || [],
          req.body.method || 'secure_overwrite',
          req.body.reason || 'API request',
          req.body.requestedBy || 'system'
        );
        
        // Auto-execute if requested
        if (req.body.autoExecute) {
          await this.lifecycleService.executeDeletionJob(job.id);
        }
        
        res.status(201).json({ success: true, data: job });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
    });
  }

  private initializeScheduledJobs() {
    // Check for expired workspaces every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        const destroyed = await this.lifecycleService.processExpiredWorkspaces();
        if (destroyed > 0) {
          console.log(`🧹 Destroyed ${destroyed} expired workspaces`);
        }
      } catch (error) {
        console.error('Failed to process expired workspaces:', error);
      }
    });

    console.log('📅 Scheduled jobs initialized');
  }

  private initializeErrorHandling() {
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    });
  }

  public async start() {
    try {
      await this.dbManager.initialize();
      
      this.app.listen(this.port, () => {
        console.log(`📋 Data Lifecycle service running on port ${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
      });
    } catch (error) {
      console.error('Failed to start Data Lifecycle service:', error);
      process.exit(1);
    }
  }

  public async stop() {
    await this.dbManager.close();
    console.log('Data Lifecycle service stopped');
  }
}

const app = new DataLifecycleApp();
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

export default DataLifecycleApp;
