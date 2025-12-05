import Fastify from 'fastify';
import { DatabaseManager } from '@shifty/database';
import { ModelRegistryService } from './services/model-registry.service';
import {
  ModelRegistrationRequestSchema,
  TrainingJobConfigSchema,
  ModelDeploymentConfigSchema,
} from '@shifty/shared';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

class ModelRegistryApp {
  private dbManager: DatabaseManager;
  private registryService: ModelRegistryService;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.registryService = new ModelRegistryService(this.dbManager);
  }

  async start() {
    try {
      await this.dbManager.initialize();
      await this.registerPlugins();
      await this.registerRoutes();

      const port = parseInt(process.env.PORT || '3007', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      
      console.log(`📦 Model Registry running on port ${port}`);
    } catch (error) {
      console.error('Failed to start Model Registry:', error);
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
    fastify.get('/health', async () => {
      return {
        status: 'healthy',
        service: 'model-registry',
        timestamp: new Date().toISOString()
      };
    });

    // Register a new model
    fastify.post('/api/v1/models', async (request, reply) => {
      try {
        const validated = ModelRegistrationRequestSchema.parse(request.body);
        const model = await this.registryService.registerModel(validated);
        return reply.code(201).send({ success: true, data: model });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // Get model by ID
    fastify.get('/api/v1/models/:modelId', async (request, reply) => {
      const { modelId } = request.params as { modelId: string };
      const model = await this.registryService.getModel(modelId);
      
      if (!model) {
        return reply.code(404).send({ success: false, error: 'Model not found' });
      }
      
      return { success: true, data: model };
    });

    // Get tenant models
    fastify.get('/api/v1/tenants/:tenantId/models', async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const models = await this.registryService.getTenantModels(tenantId);
      return { success: true, data: models };
    });

    // Deploy model
    fastify.post('/api/v1/models/:modelId/deploy', async (request, reply) => {
      try {
        const { modelId } = request.params as { modelId: string };
        const body = request.body as any;
        
        const config = ModelDeploymentConfigSchema.parse({
          modelId,
          ...body,
        });
        
        const result = await this.registryService.deployModel(config);
        return { success: true, data: result };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // Delete model
    fastify.delete('/api/v1/models/:modelId', async (request, reply) => {
      try {
        const { modelId } = request.params as { modelId: string };
        await this.registryService.deleteModel(modelId);
        return { success: true, message: 'Model deleted' };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // Start training job
    fastify.post('/api/v1/tenants/:tenantId/training-jobs', async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const config = TrainingJobConfigSchema.parse(request.body);
        
        const job = await this.registryService.startTrainingJob(tenantId, config);
        return reply.code(201).send({ success: true, data: job });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // Get training job
    fastify.get('/api/v1/training-jobs/:jobId', async (request, reply) => {
      const { jobId } = request.params as { jobId: string };
      const job = await this.registryService.getTrainingJob(jobId);
      
      if (!job) {
        return reply.code(404).send({ success: false, error: 'Training job not found' });
      }
      
      return { success: true, data: job };
    });

    // Get tenant training jobs
    fastify.get('/api/v1/tenants/:tenantId/training-jobs', async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const jobs = await this.registryService.getTenantTrainingJobs(tenantId);
      return { success: true, data: jobs };
    });

    // Get model evaluations
    fastify.get('/api/v1/models/:modelId/evaluations', async (request, reply) => {
      const { modelId } = request.params as { modelId: string };
      const evaluations = await this.registryService.getModelEvaluations(modelId);
      return { success: true, data: evaluations };
    });

    // Create model evaluation
    fastify.post('/api/v1/models/:modelId/evaluations', async (request, reply) => {
      try {
        const { modelId } = request.params as { modelId: string };
        const body = request.body as any;
        
        const evaluation = await this.registryService.createEvaluation(
          modelId,
          body.tenantId,
          body.evaluationType,
          body.metrics
        );
        
        return reply.code(201).send({ success: true, data: evaluation });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log('Model Registry stopped');
  }
}

const app = new ModelRegistryApp();
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

export default ModelRegistryApp;
