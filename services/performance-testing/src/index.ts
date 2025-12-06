import Fastify from 'fastify';
import { DatabaseManager } from '@shifty/database';
import { PerformanceTestingService } from './services/performance-testing.service';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

class PerformanceTestingServiceApp {
  private dbManager: DatabaseManager;
  private performanceService: PerformanceTestingService;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.performanceService = new PerformanceTestingService(this.dbManager);
  }

  async start() {
    try {
      await this.dbManager.initialize();
      await this.registerPlugins();
      await this.registerRoutes();

      const port = parseInt(process.env.PORT || '3014', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      
      console.log(`⚡ Performance Testing Service running on port ${port}`);
    } catch (error) {
      console.error('Failed to start Performance Testing Service:', error);
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
      service: 'performance-testing',
      timestamp: new Date().toISOString()
    }));

    // ==================== Test Configurations ====================

    fastify.post('/api/v1/performance/configs', async (request, reply) => {
      try {
        const body = request.body as {
          tenantId: string;
          name: string;
          description?: string;
          testType: string;
          targetUrl: string;
          virtualUsers: number;
          rampUpSeconds: number;
          durationSeconds: number;
          thresholds: any;
          scenarios: any[];
          schedule?: any;
        };

        const config = await this.performanceService.createTestConfig(body.tenantId, {
          name: body.name,
          description: body.description,
          testType: body.testType as any,
          targetUrl: body.targetUrl,
          virtualUsers: body.virtualUsers,
          rampUpSeconds: body.rampUpSeconds,
          durationSeconds: body.durationSeconds,
          thresholds: body.thresholds,
          scenarios: body.scenarios,
          schedule: body.schedule,
        });

        return reply.code(201).send({ success: true, data: config });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/performance/configs', async (request, reply) => {
      try {
        const { tenantId } = request.query as { tenantId: string };
        
        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const configs = await this.performanceService.getTenantTestConfigs(tenantId);
        return { success: true, data: configs };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/performance/configs/:configId', async (request, reply) => {
      try {
        const { configId } = request.params as { configId: string };
        const config = await this.performanceService.getTestConfig(configId);

        if (!config) {
          return reply.code(404).send({ success: false, error: 'Config not found' });
        }

        return { success: true, data: config };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.put('/api/v1/performance/configs/:configId', async (request, reply) => {
      try {
        const { configId } = request.params as { configId: string };
        const body = request.body as any;

        const config = await this.performanceService.updateTestConfig(configId, body);

        if (!config) {
          return reply.code(404).send({ success: false, error: 'Config not found' });
        }

        return { success: true, data: config };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.delete('/api/v1/performance/configs/:configId', async (request, reply) => {
      try {
        const { configId } = request.params as { configId: string };
        await this.performanceService.deleteTestConfig(configId);
        return reply.code(204).send();
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== Test Runs ====================

    fastify.post('/api/v1/performance/runs', async (request, reply) => {
      try {
        const { configId } = request.body as { configId: string };
        
        if (!configId) {
          return reply.code(400).send({ success: false, error: 'configId required' });
        }

        const run = await this.performanceService.startTestRun(configId);
        return reply.code(201).send({ success: true, data: run });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/performance/runs', async (request, reply) => {
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

        const runs = await this.performanceService.getTestRuns(
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

    fastify.get('/api/v1/performance/runs/:runId', async (request, reply) => {
      try {
        const { runId } = request.params as { runId: string };
        const run = await this.performanceService.getTestRun(runId);

        if (!run) {
          return reply.code(404).send({ success: false, error: 'Run not found' });
        }

        return { success: true, data: run };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.delete('/api/v1/performance/runs/:runId', async (request, reply) => {
      try {
        const { runId } = request.params as { runId: string };
        await this.performanceService.cancelTestRun(runId);
        return { success: true, message: 'Test run cancelled' };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== Comparison ====================

    fastify.post('/api/v1/performance/compare', async (request, reply) => {
      try {
        const { runIds } = request.body as { runIds: string[] };

        if (!runIds || runIds.length < 2) {
          return reply.code(400).send({ success: false, error: 'At least 2 run IDs required' });
        }

        const comparison = await this.performanceService.compareRuns(runIds);
        return { success: true, data: comparison };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log('Performance Testing Service stopped');
  }
}

const app = new PerformanceTestingServiceApp();
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

export default PerformanceTestingServiceApp;
