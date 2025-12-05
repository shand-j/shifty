import Fastify from 'fastify';
import { DatabaseManager } from '@shifty/database';
import { SecurityTestingService } from './services/security-testing.service';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

class SecurityTestingServiceApp {
  private dbManager: DatabaseManager;
  private securityService: SecurityTestingService;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.securityService = new SecurityTestingService(this.dbManager);
  }

  async start() {
    try {
      await this.dbManager.initialize();
      await this.registerPlugins();
      await this.registerRoutes();

      const port = parseInt(process.env.PORT || '3015', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      
      console.log(`🔒 Security Testing Service running on port ${port}`);
    } catch (error) {
      console.error('Failed to start Security Testing Service:', error);
      process.exit(1);
    }
  }

  private async registerPlugins() {
    await fastify.register(import('@fastify/cors'), {
      origin: true,
      credentials: true
    });

    await fastify.register(import('@fastify/rate-limit'), {
      max: 1000,
      timeWindow: '1 minute'
    });
  }

  private async registerRoutes() {
    // Health check
    fastify.get('/health', async () => ({
      status: 'healthy',
      service: 'security-testing',
      timestamp: new Date().toISOString()
    }));

    // ==================== Scan Configurations ====================

    fastify.post('/api/v1/security/configs', async (request, reply) => {
      try {
        const body = request.body as {
          tenantId: string;
          name: string;
          description?: string;
          scanType: string;
          target: any;
          authentication?: any;
          settings: any;
          thresholds: any;
          schedule?: any;
        };

        const config = await this.securityService.createScanConfig(body.tenantId, {
          name: body.name,
          description: body.description,
          scanType: body.scanType as any,
          target: body.target,
          authentication: body.authentication,
          settings: body.settings,
          thresholds: body.thresholds,
          schedule: body.schedule,
        });

        return reply.code(201).send({ success: true, data: config });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/security/configs', async (request, reply) => {
      try {
        const { tenantId, scanType } = request.query as { tenantId: string; scanType?: string };
        
        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const configs = await this.securityService.getTenantScanConfigs(tenantId, scanType as any);
        return { success: true, data: configs };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/security/configs/:configId', async (request, reply) => {
      try {
        const { configId } = request.params as { configId: string };
        const config = await this.securityService.getScanConfig(configId);

        if (!config) {
          return reply.code(404).send({ success: false, error: 'Config not found' });
        }

        return { success: true, data: config };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.put('/api/v1/security/configs/:configId', async (request, reply) => {
      try {
        const { configId } = request.params as { configId: string };
        const body = request.body as any;

        const config = await this.securityService.updateScanConfig(configId, body);

        if (!config) {
          return reply.code(404).send({ success: false, error: 'Config not found' });
        }

        return { success: true, data: config };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.delete('/api/v1/security/configs/:configId', async (request, reply) => {
      try {
        const { configId } = request.params as { configId: string };
        await this.securityService.deleteScanConfig(configId);
        return reply.code(204).send();
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== Scan Runs ====================

    fastify.post('/api/v1/security/scans', async (request, reply) => {
      try {
        const { configId } = request.body as { configId: string };
        
        if (!configId) {
          return reply.code(400).send({ success: false, error: 'configId required' });
        }

        const run = await this.securityService.startScan(configId);
        return reply.code(201).send({ success: true, data: run });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/security/scans', async (request, reply) => {
      try {
        const { tenantId, configId, status, limit } = request.query as {
          tenantId: string;
          configId?: string;
          status?: string;
          limit?: string;
        };

        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const runs = await this.securityService.getScanRuns(
          tenantId,
          configId,
          status as any,
          parseInt(limit || '20')
        );

        return { success: true, data: runs };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/security/scans/:scanId', async (request, reply) => {
      try {
        const { scanId } = request.params as { scanId: string };
        const run = await this.securityService.getScanRun(scanId);

        if (!run) {
          return reply.code(404).send({ success: false, error: 'Scan not found' });
        }

        return { success: true, data: run };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== Vulnerabilities ====================

    fastify.get('/api/v1/security/scans/:scanId/vulnerabilities', async (request, reply) => {
      try {
        const { scanId } = request.params as { scanId: string };
        const { severity, status } = request.query as { severity?: string; status?: string };

        const vulnerabilities = await this.securityService.getVulnerabilities(
          scanId,
          severity as any,
          status
        );

        return { success: true, data: vulnerabilities };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.patch('/api/v1/security/vulnerabilities/:vulnerabilityId', async (request, reply) => {
      try {
        const { vulnerabilityId } = request.params as { vulnerabilityId: string };
        const { status, assignedTo } = request.body as { status: string; assignedTo?: string };

        await this.securityService.updateVulnerabilityStatus(
          vulnerabilityId,
          status as any,
          assignedTo
        );

        return { success: true, message: 'Vulnerability updated' };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Summary/Dashboard ====================

    fastify.get('/api/v1/security/summary', async (request, reply) => {
      try {
        const { tenantId } = request.query as { tenantId: string };

        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const summary = await this.securityService.getTenantVulnerabilitySummary(tenantId);
        return { success: true, data: summary };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log('Security Testing Service stopped');
  }
}

const app = new SecurityTestingServiceApp();
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

export default SecurityTestingServiceApp;
