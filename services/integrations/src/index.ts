import Fastify from 'fastify';
import { DatabaseManager } from '@shifty/database';
import { IntegrationsService } from './services/integrations.service';
import { createMockAdapters } from './mocks/adapters';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

// Initialize mock adapters if in mock mode
const MOCK_MODE = process.env.MOCK_MODE === 'true';
const mockAdapters = MOCK_MODE ? createMockAdapters() : null;

if (MOCK_MODE) {
  console.log('🎭 Integration Service running in MOCK MODE - using mock third-party data');
}

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
      mockMode: MOCK_MODE,
      timestamp: new Date().toISOString()
    }));

    // ==================== MOCK THIRD-PARTY DATA ENDPOINTS ====================
    // These endpoints return data FROM the integrated third-party services

    // GitHub Integration - Get repositories
    fastify.get('/api/v1/github/repos', async (request, reply) => {
      if (MOCK_MODE && mockAdapters) {
        return { success: true, data: mockAdapters.github.getRepos(), source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live GitHub integration not implemented' });
    });

    // GitHub Integration - Get pull requests
    fastify.get('/api/v1/github/repos/:owner/:repo/pulls', async (request, reply) => {
      const { owner, repo } = request.params as { owner: string; repo: string };
      if (MOCK_MODE && mockAdapters) {
        return { success: true, data: mockAdapters.github.getPullRequests(owner, repo), source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live GitHub integration not implemented' });
    });

    // GitHub Integration - Get commits
    fastify.get('/api/v1/github/repos/:owner/:repo/commits', async (request, reply) => {
      const { owner, repo } = request.params as { owner: string; repo: string };
      if (MOCK_MODE && mockAdapters) {
        return { success: true, data: mockAdapters.github.getCommits(owner, repo), source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live GitHub integration not implemented' });
    });

    // Jira Integration - Get issues
    fastify.get('/api/v1/jira/issues', async (request, reply) => {
      if (MOCK_MODE && mockAdapters) {
        return { success: true, data: mockAdapters.jira.getIssues(), source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live Jira integration not implemented' });
    });

    // Jira Integration - Get specific issue
    fastify.get('/api/v1/jira/issues/:key', async (request, reply) => {
      const { key } = request.params as { key: string };
      if (MOCK_MODE && mockAdapters) {
        const issue = mockAdapters.jira.getIssue(key);
        if (!issue) {
          return reply.code(404).send({ success: false, error: 'Issue not found' });
        }
        return { success: true, data: issue, source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live Jira integration not implemented' });
    });

    // Slack Integration - Get channels
    fastify.get('/api/v1/slack/channels', async (request, reply) => {
      if (MOCK_MODE && mockAdapters) {
        return { success: true, data: mockAdapters.slack.getChannels(), source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live Slack integration not implemented' });
    });

    // Slack Integration - Get messages
    fastify.get('/api/v1/slack/channels/:channelId/messages', async (request, reply) => {
      const { channelId } = request.params as { channelId: string };
      if (MOCK_MODE && mockAdapters) {
        return { success: true, data: mockAdapters.slack.getMessages(channelId), source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live Slack integration not implemented' });
    });

    // Sentry Integration - Get errors
    fastify.get('/api/v1/sentry/errors', async (request, reply) => {
      if (MOCK_MODE && mockAdapters) {
        return { success: true, data: mockAdapters.sentry.getErrors(), source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live Sentry integration not implemented' });
    });

    // Datadog Integration - Get metrics
    fastify.get('/api/v1/datadog/metrics', async (request, reply) => {
      const { query } = request.query as { query?: string };
      if (MOCK_MODE && mockAdapters) {
        const metrics = await mockAdapters.datadog.getMetrics(query || '');
        return { success: true, data: metrics, source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live Datadog integration not implemented' });
    });

    // Jenkins Integration - Get builds
    fastify.get('/api/v1/jenkins/builds', async (request, reply) => {
      if (MOCK_MODE && mockAdapters) {
        return { success: true, data: mockAdapters.jenkins.getBuilds(), source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live Jenkins integration not implemented' });
    });

    // Jenkins Integration - Get specific build
    fastify.get('/api/v1/jenkins/builds/:buildNumber', async (request, reply) => {
      const { buildNumber } = request.params as { buildNumber: string };
      if (MOCK_MODE && mockAdapters) {
        const build = mockAdapters.jenkins.getBuild(parseInt(buildNumber));
        if (!build) {
          return reply.code(404).send({ success: false, error: 'Build not found' });
        }
        return { success: true, data: build, source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live Jenkins integration not implemented' });
    });

    // Ollama Integration - Generate AI response
    fastify.post('/api/v1/ollama/generate', async (request, reply) => {
      const { prompt } = request.body as { prompt: string };
      if (MOCK_MODE && mockAdapters) {
        const response = await mockAdapters.ollama.generate(prompt);
        return { success: true, data: response, source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live Ollama integration not implemented' });
    });

    // New Relic Integration - Get alerts (mock)
    fastify.get('/api/v1/newrelic/alerts', async (request, reply) => {
      if (MOCK_MODE) {
        // Generate mock New Relic alerts
        const alerts = Array.from({ length: 20 }, (_, i) => ({
          id: `alert-${i + 1}`,
          severity: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)],
          title: ['High Error Rate', 'Slow Response Time', 'Memory Usage High', 'CPU Spike'][Math.floor(Math.random() * 4)],
          description: 'Alert triggered based on threshold',
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: Math.random() > 0.3 ? 'open' : 'closed',
          application: ['web-app', 'api-server', 'worker', 'database'][Math.floor(Math.random() * 4)],
        }));
        return { success: true, data: alerts, source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live New Relic integration not implemented' });
    });

    // Notion Integration - Get documents (mock)
    fastify.get('/api/v1/notion/documents', async (request, reply) => {
      if (MOCK_MODE) {
        const { faker } = await import('@faker-js/faker');
        const documents = Array.from({ length: 50 }, (_, i) => ({
          id: `doc-${i + 1}`,
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(3),
          type: ['requirements', 'design', 'user-story', 'technical-spec'][Math.floor(Math.random() * 4)],
          author: faker.person.fullName(),
          lastEdited: faker.date.recent({ days: 30 }).toISOString(),
          tags: faker.helpers.arrayElements(['frontend', 'backend', 'testing', 'design', 'product'], { min: 1, max: 3 }),
          url: `https://notion.so/doc-${i + 1}`,
        }));
        return { success: true, data: documents, source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live Notion integration not implemented' });
    });

    // Production Logs - Get recent logs (mock)
    fastify.get('/api/v1/logs/production', async (request, reply) => {
      if (MOCK_MODE) {
        const { faker } = await import('@faker-js/faker');
        const { level } = request.query as { level?: string };
        const logs = Array.from({ length: 100 }, (_, i) => {
          const logLevel = level || ['info', 'warn', 'error', 'debug'][Math.floor(Math.random() * 4)];
          return {
            timestamp: faker.date.recent({ days: 1 }).toISOString(),
            level: logLevel,
            message: faker.lorem.sentence(),
            service: ['api-gateway', 'auth-service', 'test-runner', 'healing-engine'][Math.floor(Math.random() * 4)],
            traceId: faker.string.uuid(),
            userId: `user-${Math.floor(Math.random() * 100) + 1}`,
            metadata: {
              ip: faker.internet.ip(),
              userAgent: faker.internet.userAgent(),
            },
          };
        });
        return { success: true, data: logs, source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live logging integration not implemented' });
    });

    // GitLab Integration - Get projects (mock)
    fastify.get('/api/v1/gitlab/projects', async (request, reply) => {
      if (MOCK_MODE) {
        const { faker } = await import('@faker-js/faker');
        const projects = Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          name: faker.lorem.slug(),
          description: faker.company.catchPhrase(),
          web_url: `https://gitlab.com/acme/${faker.lorem.slug()}`,
          star_count: faker.number.int({ min: 0, max: 100 }),
          forks_count: faker.number.int({ min: 0, max: 50 }),
          last_activity_at: faker.date.recent({ days: 30 }).toISOString(),
          default_branch: 'main',
        }));
        return { success: true, data: projects, source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live GitLab integration not implemented' });
    });

    // CircleCI Integration - Get pipelines (mock)
    fastify.get('/api/v1/circleci/pipelines', async (request, reply) => {
      if (MOCK_MODE) {
        const { faker } = await import('@faker-js/faker');
        const pipelines = Array.from({ length: 20 }, (_, i) => ({
          id: faker.string.uuid(),
          number: i + 1,
          state: ['success', 'failed', 'running', 'canceled'][Math.floor(Math.random() * 4)],
          created_at: faker.date.recent({ days: 7 }).toISOString(),
          trigger: {
            type: ['webhook', 'scheduled', 'manual'][Math.floor(Math.random() * 3)],
            actor: faker.person.fullName(),
          },
          vcs: {
            branch: ['main', 'develop', 'feature/new-ui'][Math.floor(Math.random() * 3)],
            commit: {
              subject: faker.git.commitMessage(),
              sha: faker.git.commitSha(),
            },
          },
        }));
        return { success: true, data: pipelines, source: 'mock' };
      }
      return reply.code(501).send({ success: false, error: 'Live CircleCI integration not implemented' });
    });

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
