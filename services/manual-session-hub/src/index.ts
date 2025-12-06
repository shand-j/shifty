import Fastify from 'fastify';
import { DatabaseManager } from '@shifty/database';
import { ManualSessionHubService, SessionRecording, ExploratoryCharter } from './services/manual-session-hub.service';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

class ManualSessionHubApp {
  private dbManager: DatabaseManager;
  private hubService: ManualSessionHubService;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.hubService = new ManualSessionHubService(this.dbManager);
  }

  async start() {
    try {
      await this.dbManager.initialize();
      await this.registerPlugins();
      await this.registerRoutes();

      const port = parseInt(process.env.PORT || '3017', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      
      console.log(`📋 Manual Session Hub running on port ${port}`);
    } catch (error) {
      console.error('Failed to start Manual Session Hub:', error);
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
      service: 'manual-session-hub',
      timestamp: new Date().toISOString()
    }));

    // ==================== Quality Sessions ====================

    fastify.post('/api/v1/sessions/manual', async (request, reply) => {
      try {
        const body = request.body as {
          tenantId: string;
          userId: string;
          persona: string;
          sessionType: string;
          repo?: string;
          branch?: string;
          component?: string;
          riskLevel: string;
          title: string;
          description?: string;
          charter?: string;
          testStepsTotal?: number;
        };

        const session = await this.hubService.createSession(body.tenantId, {
          userId: body.userId,
          persona: body.persona as any,
          sessionType: body.sessionType as any,
          repo: body.repo,
          branch: body.branch,
          component: body.component,
          riskLevel: body.riskLevel as any,
          status: 'active',
          startTs: new Date(),
          title: body.title,
          description: body.description,
          charter: body.charter,
          testStepsTotal: body.testStepsTotal,
        });

        return reply.code(201).send({ success: true, data: session });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/sessions/manual/:sessionId', async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const session = await this.hubService.getSession(sessionId);

        if (!session) {
          return reply.code(404).send({ success: false, error: 'Session not found' });
        }

        return { success: true, data: session };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.patch('/api/v1/sessions/manual/:sessionId', async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const body = request.body as any;

        const session = await this.hubService.updateSession(sessionId, body);

        if (!session) {
          return reply.code(404).send({ success: false, error: 'Session not found' });
        }

        return { success: true, data: session };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.post('/api/v1/sessions/manual/:sessionId/complete', async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const body = request.body as {
          notes?: string;
          bugsFound?: number;
          testStepsCompleted?: number;
          automationCoverage?: number;
        };

        const session = await this.hubService.completeSession(sessionId, body);

        if (!session) {
          return reply.code(404).send({ success: false, error: 'Session not found' });
        }

        return { success: true, data: session };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.post('/api/v1/sessions/manual/:sessionId/abandon', async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const { reason } = request.body as { reason?: string };

        await this.hubService.abandonSession(sessionId, reason);

        return { success: true, message: 'Session abandoned' };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/sessions/manual/:sessionId/summary', async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const summary = await this.hubService.getSessionSummary(sessionId);
        return { success: true, data: summary };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/users/:userId/sessions/active', async (request, reply) => {
      try {
        const { userId } = request.params as { userId: string };
        const { tenantId } = request.query as { tenantId: string };

        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const sessions = await this.hubService.getUserActiveSessions(userId, tenantId);
        return { success: true, data: sessions };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/tenants/:tenantId/sessions', async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const { persona, sessionType, status, startDate, endDate, limit } = request.query as {
          persona?: string;
          sessionType?: string;
          status?: string;
          startDate?: string;
          endDate?: string;
          limit?: string;
        };

        const sessions = await this.hubService.getTenantSessions(
          tenantId,
          {
            persona,
            sessionType,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
          },
          parseInt(limit || '50')
        );

        return { success: true, data: sessions };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== Test Steps ====================

    fastify.post('/api/v1/sessions/manual/:sessionId/steps', async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const body = request.body as {
          sequence: number;
          action: string;
          expectedResult?: string;
          status?: string;
          attachments?: string[];
          confidence?: number;
          notes?: string;
        };

        const step = await this.hubService.addTestStep(sessionId, {
          sequence: body.sequence,
          action: body.action,
          expectedResult: body.expectedResult,
          status: (body.status as any) || 'pending',
          attachments: body.attachments || [],
          confidence: body.confidence || 1,
          notes: body.notes,
        });

        return reply.code(201).send({ success: true, data: step });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/sessions/manual/:sessionId/steps', async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const steps = await this.hubService.getSessionSteps(sessionId);
        return { success: true, data: steps };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.patch('/api/v1/steps/:stepId', async (request, reply) => {
      try {
        const { stepId } = request.params as { stepId: string };
        const body = request.body as any;

        const step = await this.hubService.updateTestStep(stepId, body);

        if (!step) {
          return reply.code(404).send({ success: false, error: 'Step not found' });
        }

        return { success: true, data: step };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.post('/api/v1/steps/:stepId/comments', async (request, reply) => {
      try {
        const { stepId } = request.params as { stepId: string };
        const { userId, text } = request.body as { userId: string; text: string };

        await this.hubService.addStepComment(stepId, userId, text);
        return { success: true, message: 'Comment added' };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Session Recordings ====================

    fastify.post('/api/v1/sessions/manual/:sessionId/recordings/start', async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const { browserInfo } = request.body as {
          browserInfo: SessionRecording['browserInfo'];
        };

        const recording = await this.hubService.startRecording(sessionId, browserInfo);
        return reply.code(201).send({ success: true, data: recording });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.post('/api/v1/recordings/:recordingId/stop', async (request, reply) => {
      try {
        const { recordingId } = request.params as { recordingId: string };
        const { storageUrl } = request.body as { storageUrl?: string };

        await this.hubService.stopRecording(recordingId, storageUrl);
        return { success: true, message: 'Recording stopped' };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/sessions/manual/:sessionId/recordings', async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const recordings = await this.hubService.getSessionRecordings(sessionId);
        return { success: true, data: recordings };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== Exploratory Testing ====================

    fastify.post('/api/v1/sessions/manual/:sessionId/charter', async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const body = request.body as {
          explore: string;
          with: string;
          toDiscover: string;
          timeBox: number;
        };

        const charter = await this.hubService.createExploratoryCharter(sessionId, body);
        return reply.code(201).send({ success: true, data: charter });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.post('/api/v1/charters/:charterId/notes', async (request, reply) => {
      try {
        const { charterId } = request.params as { charterId: string };
        const { note } = request.body as { note: string };

        await this.hubService.addCharterNote(charterId, note);
        return { success: true, message: 'Note added' };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.post('/api/v1/charters/:charterId/complete', async (request, reply) => {
      try {
        const { charterId } = request.params as { charterId: string };
        const { debrief } = request.body as {
          debrief: ExploratoryCharter['debrief'];
        };

        await this.hubService.completeCharter(charterId, debrief);
        return { success: true, message: 'Charter completed' };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Jira Integration ====================

    fastify.post('/api/v1/sessions/manual/:sessionId/export/jira', async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const body = request.body as {
          stepId?: string;
          summary?: string;
          description?: string;
          issueType?: string;
          priority?: string;
          labels?: string[];
          components?: string[];
        };

        const result = await this.hubService.exportToJira(sessionId, body.stepId, {
          summary: body.summary || '',
          description: body.description || '',
          issueType: body.issueType || 'Bug',
          priority: body.priority || 'Medium',
          labels: body.labels,
          components: body.components,
        });

        return reply.code(201).send({ success: true, data: result });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Automation Gap Analysis ====================

    fastify.post('/api/v1/sessions/manual/:sessionId/automation-gaps', async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const body = request.body as {
          description: string;
          priority: 'high' | 'medium' | 'low';
          estimatedEffort: string;
        };

        await this.hubService.addAutomationGap(sessionId, body);
        return reply.code(201).send({ success: true, message: 'Automation gap added' });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/tenants/:tenantId/automation-gaps/report', async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const report = await this.hubService.getAutomationGapReport(tenantId);
        return { success: true, data: report };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log('Manual Session Hub stopped');
  }
}

const app = new ManualSessionHubApp();
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

export default ManualSessionHubApp;
