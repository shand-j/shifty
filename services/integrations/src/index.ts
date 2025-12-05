import Fastify from 'fastify';
import { DatabaseManager } from '@shifty/database';
import { IntegrationsService } from './services/integrations.service';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

class IntegrationsApp {
  private dbManager: DatabaseManager;
  private integrationsService: IntegrationsService;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.integrationsService = new IntegrationsService(this.dbManager);
  }

  async start() {
    try {
      await this.dbManager.initialize();
      await this.registerPlugins();
      await this.registerRoutes();

      const port = parseInt(process.env.PORT || '3012', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      
      console.log(`🔌 Integrations Service running on port ${port}`);
    } catch (error) {
      console.error('Failed to start Integrations Service:', error);
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
      service: 'integrations',
      timestamp: new Date().toISOString()
    }));

    // ==================== Integration Management ====================

    fastify.post('/api/v1/tenants/:tenantId/integrations', async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const body = request.body as {
          type: any;
          name: string;
          config: Record<string, unknown>;
        };

        const integration = await this.integrationsService.createIntegration(
          tenantId, body.type, body.name, body.config
        );

        return reply.code(201).send({ success: true, data: integration });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/tenants/:tenantId/integrations', async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const { type } = request.query as { type?: string };

      const integrations = await this.integrationsService.getTenantIntegrations(
        tenantId, type as any
      );

      return { success: true, data: integrations };
    });

    fastify.get('/api/v1/integrations/:integrationId', async (request, reply) => {
      const { integrationId } = request.params as { integrationId: string };
      const integration = await this.integrationsService.getIntegration(integrationId);

      if (!integration) {
        return reply.code(404).send({ success: false, error: 'Integration not found' });
      }

      return { success: true, data: integration };
    });

    fastify.delete('/api/v1/integrations/:integrationId', async (request, reply) => {
      try {
        const { integrationId } = request.params as { integrationId: string };
        await this.integrationsService.deleteIntegration(integrationId);
        return { success: true };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== GitHub ====================

    fastify.get('/api/v1/integrations/:integrationId/github/repos', async (request, reply) => {
      try {
        const { integrationId } = request.params as { integrationId: string };
        const repos = await this.integrationsService.getGitHubRepositories(integrationId);
        return { success: true, data: repos };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.post('/api/v1/integrations/:integrationId/github/webhooks', async (request, reply) => {
      try {
        const { integrationId } = request.params as { integrationId: string };
        const body = request.body as {
          repoOwner: string;
          repoName: string;
          events: string[];
        };

        const webhookId = await this.integrationsService.createGitHubWebhook(
          integrationId, body.repoOwner, body.repoName, body.events
        );

        return reply.code(201).send({ success: true, data: { webhookId } });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Jira ====================

    fastify.post('/api/v1/jira/tickets', async (request, reply) => {
      try {
        const body = request.body as {
          tenantId: string;
          summary: string;
          description: string;
          issueType?: string;
          priority?: string;
          labels?: string[];
        };

        // Find Jira integration for tenant
        const integrations = await this.integrationsService.getTenantIntegrations(
          body.tenantId, 'jira'
        );

        if (integrations.length === 0) {
          return reply.code(400).send({ success: false, error: 'No Jira integration configured' });
        }

        const result = await this.integrationsService.createJiraTicket(
          integrations[0].id,
          body.summary,
          body.description,
          body.issueType,
          body.priority,
          body.labels
        );

        return reply.code(201).send({ success: true, data: result });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Slack ====================

    fastify.post('/api/v1/integrations/:integrationId/slack/message', async (request, reply) => {
      try {
        const { integrationId } = request.params as { integrationId: string };
        const body = request.body as {
          channel: string;
          message: string;
          blocks?: any[];
        };

        await this.integrationsService.sendSlackMessage(
          integrationId, body.channel, body.message, body.blocks
        );

        return { success: true };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Notifications ====================

    fastify.post('/api/v1/notifications', async (request, reply) => {
      try {
        const body = request.body as {
          tenantId: string;
          type: string;
          data: Record<string, unknown>;
        };

        await this.integrationsService.sendNotification(body.tenantId, body.type, body.data);
        return { success: true };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Webhooks ====================

    fastify.post('/api/v1/webhooks/github/:integrationId', async (request, reply) => {
      try {
        const { integrationId } = request.params as { integrationId: string };
        const eventType = request.headers['x-github-event'] as string;

        const event = await this.integrationsService.processWebhook(
          integrationId, eventType, request.body as any
        );

        return reply.code(201).send({ success: true, data: { eventId: event.id } });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.post('/api/v1/webhooks/gitlab/:integrationId', async (request, reply) => {
      try {
        const { integrationId } = request.params as { integrationId: string };
        const eventType = request.headers['x-gitlab-event'] as string;

        const event = await this.integrationsService.processWebhook(
          integrationId, eventType, request.body as any
        );

        return reply.code(201).send({ success: true, data: { eventId: event.id } });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log('Integrations Service stopped');
  }
}

const app = new IntegrationsApp();
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

export default IntegrationsApp;
