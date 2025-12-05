import Fastify from 'fastify';
import { DatabaseManager } from '@shifty/database';
import { ProductionFeedbackService } from './services/production-feedback.service';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

class ProductionFeedbackApp {
  private dbManager: DatabaseManager;
  private feedbackService: ProductionFeedbackService;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.feedbackService = new ProductionFeedbackService(this.dbManager);
  }

  async start() {
    try {
      await this.dbManager.initialize();
      await this.registerPlugins();
      await this.registerRoutes();

      const port = parseInt(process.env.PORT || '3011', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      
      console.log(`🔄 Production Feedback running on port ${port}`);
    } catch (error) {
      console.error('Failed to start Production Feedback:', error);
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
      service: 'production-feedback',
      timestamp: new Date().toISOString()
    }));

    // ==================== Error Ingestion ====================

    fastify.post('/api/v1/errors', async (request, reply) => {
      try {
        const body = request.body as {
          tenantId: string;
          source: any;
          externalId: string;
          errorType: string;
          message: string;
          stackTrace?: string;
          severity: any;
          environment: string;
          service: string;
          endpoint?: string;
          userId?: string;
          metadata?: Record<string, unknown>;
          occurrenceCount?: number;
        };

        const event = await this.feedbackService.ingestError(body.tenantId, body.source, {
          externalId: body.externalId,
          errorType: body.errorType,
          message: body.message,
          stackTrace: body.stackTrace,
          severity: body.severity,
          environment: body.environment,
          service: body.service,
          endpoint: body.endpoint,
          userId: body.userId,
          metadata: body.metadata || {},
          firstSeen: new Date(),
          lastSeen: new Date(),
          occurrenceCount: body.occurrenceCount || 1,
        });

        return reply.code(201).send({ success: true, data: event });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // Webhook for Sentry
    fastify.post('/api/v1/webhooks/sentry', async (request, reply) => {
      try {
        const body = request.body as any;
        const tenantId = (request.headers['x-tenant-id'] as string) || body.tenantId;

        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        // Transform Sentry payload
        const event = await this.feedbackService.ingestError(tenantId, 'sentry', {
          externalId: body.event?.event_id || body.id,
          errorType: body.event?.exception?.values?.[0]?.type || 'Unknown',
          message: body.event?.exception?.values?.[0]?.value || body.message || 'Unknown error',
          stackTrace: body.event?.exception?.values?.[0]?.stacktrace?.frames
            ?.map((f: any) => `${f.filename}:${f.lineno} in ${f.function}`)
            .join('\n'),
          severity: body.level === 'fatal' ? 'critical' : body.level || 'medium',
          environment: body.event?.environment || 'production',
          service: body.project_slug || 'unknown',
          endpoint: body.event?.request?.url,
          userId: body.event?.user?.id,
          metadata: { sentryPayload: body },
          firstSeen: new Date(body.event?.timestamp || Date.now()),
          lastSeen: new Date(),
          occurrenceCount: 1,
        });

        return reply.code(201).send({ success: true, data: event });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Error Clusters ====================

    fastify.get('/api/v1/tenants/:tenantId/clusters', async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const { status, severity, limit } = request.query as { 
        status?: string; severity?: string; limit?: string 
      };

      const clusters = await this.feedbackService.getTenantClusters(
        tenantId, status, severity as any, parseInt(limit || '50')
      );

      return { success: true, data: clusters };
    });

    fastify.get('/api/v1/clusters/:clusterId', async (request, reply) => {
      const { clusterId } = request.params as { clusterId: string };
      const cluster = await this.feedbackService.getCluster(clusterId);

      if (!cluster) {
        return reply.code(404).send({ success: false, error: 'Cluster not found' });
      }

      return { success: true, data: cluster };
    });

    fastify.patch('/api/v1/clusters/:clusterId/status', async (request, reply) => {
      try {
        const { clusterId } = request.params as { clusterId: string };
        const { status } = request.body as { status: string };

        await this.feedbackService.updateClusterStatus(clusterId, status as any);
        return { success: true };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Regression Tests ====================

    fastify.post('/api/v1/regression-tests', async (request, reply) => {
      try {
        const body = request.body as {
          tenantId: string;
          errorClusterId: string;
          framework?: string;
          priority?: string;
        };

        const test = await this.feedbackService.generateRegressionTest({
          tenantId: body.tenantId,
          errorClusterId: body.errorClusterId,
          framework: (body.framework as any) || 'playwright',
          priority: (body.priority as any) || 'medium',
          targetEndpoints: [],
          includeStackTrace: true,
          generateMultipleScenarios: true,
        });

        return reply.code(201).send({ success: true, data: test });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/regression-tests/:testId', async (request, reply) => {
      const { testId } = request.params as { testId: string };
      const test = await this.feedbackService.getRegressionTest(testId);

      if (!test) {
        return reply.code(404).send({ success: false, error: 'Test not found' });
      }

      return { success: true, data: test };
    });

    fastify.post('/api/v1/regression-tests/:testId/approve', async (request, reply) => {
      try {
        const { testId } = request.params as { testId: string };
        const { approvedBy } = request.body as { approvedBy: string };

        await this.feedbackService.approveRegressionTest(testId, approvedBy);
        return { success: true };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Feedback Loop Rules ====================

    fastify.post('/api/v1/tenants/:tenantId/feedback-rules', async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const rule = await this.feedbackService.createFeedbackLoopRule(tenantId, request.body as any);
        return reply.code(201).send({ success: true, data: rule });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Impact Analysis ====================

    fastify.post('/api/v1/clusters/:clusterId/analyze', async (request, reply) => {
      try {
        const { clusterId } = request.params as { clusterId: string };
        const analysis = await this.feedbackService.analyzeImpact(clusterId);
        return { success: true, data: analysis };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log('Production Feedback stopped');
  }
}

const app = new ProductionFeedbackApp();
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

export default ProductionFeedbackApp;
