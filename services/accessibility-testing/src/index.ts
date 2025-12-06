import Fastify from 'fastify';
import { DatabaseManager } from '@shifty/database';
import { AccessibilityTestingService } from './services/accessibility-testing.service';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

class AccessibilityTestingServiceApp {
  private dbManager: DatabaseManager;
  private accessibilityService: AccessibilityTestingService;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.accessibilityService = new AccessibilityTestingService(this.dbManager);
  }

  async start() {
    try {
      await this.dbManager.initialize();
      await this.registerPlugins();
      await this.registerRoutes();

      const port = parseInt(process.env.PORT || '3016', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      
      console.log(`♿ Accessibility Testing Service running on port ${port}`);
    } catch (error) {
      console.error('Failed to start Accessibility Testing Service:', error);
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
      service: 'accessibility-testing',
      timestamp: new Date().toISOString()
    }));

    // ==================== Scan Configurations ====================

    fastify.post('/api/v1/accessibility/configs', async (request, reply) => {
      try {
        const body = request.body as {
          tenantId: string;
          name: string;
          description?: string;
          targetUrls: string[];
          standard: string;
          viewport?: { width: number; height: number };
          settings: any;
          thresholds: any;
          schedule?: any;
        };

        const config = await this.accessibilityService.createScanConfig(body.tenantId, {
          name: body.name,
          description: body.description,
          targetUrls: body.targetUrls,
          standard: body.standard as any,
          viewport: body.viewport,
          settings: body.settings,
          thresholds: body.thresholds,
          schedule: body.schedule,
        });

        return reply.code(201).send({ success: true, data: config });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/accessibility/configs', async (request, reply) => {
      try {
        const { tenantId, standard } = request.query as { tenantId: string; standard?: string };
        
        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const configs = await this.accessibilityService.getTenantScanConfigs(tenantId, standard as any);
        return { success: true, data: configs };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/accessibility/configs/:configId', async (request, reply) => {
      try {
        const { configId } = request.params as { configId: string };
        const config = await this.accessibilityService.getScanConfig(configId);

        if (!config) {
          return reply.code(404).send({ success: false, error: 'Config not found' });
        }

        return { success: true, data: config };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.put('/api/v1/accessibility/configs/:configId', async (request, reply) => {
      try {
        const { configId } = request.params as { configId: string };
        const body = request.body as any;

        const config = await this.accessibilityService.updateScanConfig(configId, body);

        if (!config) {
          return reply.code(404).send({ success: false, error: 'Config not found' });
        }

        return { success: true, data: config };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.delete('/api/v1/accessibility/configs/:configId', async (request, reply) => {
      try {
        const { configId } = request.params as { configId: string };
        await this.accessibilityService.deleteScanConfig(configId);
        return reply.code(204).send();
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== Scan Runs ====================

    fastify.post('/api/v1/accessibility/scans', async (request, reply) => {
      try {
        const { configId } = request.body as { configId: string };
        
        if (!configId) {
          return reply.code(400).send({ success: false, error: 'configId required' });
        }

        const run = await this.accessibilityService.startScan(configId);
        return reply.code(201).send({ success: true, data: run });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/accessibility/scans', async (request, reply) => {
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

        const runs = await this.accessibilityService.getScanRuns(
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

    fastify.get('/api/v1/accessibility/scans/:scanId', async (request, reply) => {
      try {
        const { scanId } = request.params as { scanId: string };
        const run = await this.accessibilityService.getScanRun(scanId);

        if (!run) {
          return reply.code(404).send({ success: false, error: 'Scan not found' });
        }

        return { success: true, data: run };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== Issues ====================

    fastify.get('/api/v1/accessibility/scans/:scanId/issues', async (request, reply) => {
      try {
        const { scanId } = request.params as { scanId: string };
        const { impact, status } = request.query as { impact?: string; status?: string };

        const issues = await this.accessibilityService.getIssues(
          scanId,
          impact as any,
          status
        );

        return { success: true, data: issues };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.patch('/api/v1/accessibility/issues/:issueId', async (request, reply) => {
      try {
        const { issueId } = request.params as { issueId: string };
        const { status } = request.body as { status: string };

        await this.accessibilityService.updateIssueStatus(issueId, status as any);

        return { success: true, message: 'Issue updated' };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Summary/Dashboard ====================

    fastify.get('/api/v1/accessibility/summary', async (request, reply) => {
      try {
        const { tenantId } = request.query as { tenantId: string };

        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const summary = await this.accessibilityService.getTenantAccessibilitySummary(tenantId);
        return { success: true, data: summary };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== WCAG Standards Info ====================

    fastify.get('/api/v1/accessibility/standards', async () => {
      return {
        success: true,
        data: [
          { id: 'WCAG2A', name: 'WCAG 2.0 Level A', description: 'Basic accessibility requirements' },
          { id: 'WCAG2AA', name: 'WCAG 2.0 Level AA', description: 'Enhanced accessibility (most common compliance target)' },
          { id: 'WCAG2AAA', name: 'WCAG 2.0 Level AAA', description: 'Highest level accessibility' },
          { id: 'WCAG21A', name: 'WCAG 2.1 Level A', description: 'Basic accessibility with mobile considerations' },
          { id: 'WCAG21AA', name: 'WCAG 2.1 Level AA', description: 'Enhanced accessibility with mobile support' },
          { id: 'WCAG21AAA', name: 'WCAG 2.1 Level AAA', description: 'Highest level with mobile support' },
          { id: 'WCAG22AA', name: 'WCAG 2.2 Level AA', description: 'Latest standard with cognitive accessibility' },
          { id: 'Section508', name: 'Section 508', description: 'US federal accessibility requirements' },
        ]
      };
    });
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log('Accessibility Testing Service stopped');
  }
}

const app = new AccessibilityTestingServiceApp();
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

export default AccessibilityTestingServiceApp;
