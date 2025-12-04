import Fastify from 'fastify';
import { DatabaseManager } from '@shifty/database';
import { HITLArcadeService } from './services/hitl-arcade.service';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

class HITLArcadeApp {
  private dbManager: DatabaseManager;
  private arcadeService: HITLArcadeService;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.arcadeService = new HITLArcadeService(this.dbManager);
  }

  async start() {
    try {
      await this.dbManager.initialize();
      await this.registerPlugins();
      await this.registerRoutes();

      const port = parseInt(process.env.PORT || '3009', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      
      console.log(`🎮 HITL Arcade running on port ${port}`);
    } catch (error) {
      console.error('Failed to start HITL Arcade:', error);
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
      service: 'hitl-arcade',
      timestamp: new Date().toISOString()
    }));

    // ==================== User Profile ====================

    fastify.get('/api/v1/profiles/:userId', async (request, reply) => {
      const { userId } = request.params as { userId: string };
      const { tenantId } = request.query as { tenantId: string };

      if (!tenantId) {
        return reply.code(400).send({ success: false, error: 'tenantId required' });
      }

      const profile = await this.arcadeService.getOrCreateProfile(userId, tenantId);
      return { success: true, data: profile };
    });

    fastify.patch('/api/v1/profiles/:userId', async (request, reply) => {
      const { userId } = request.params as { userId: string };
      const body = request.body as { tenantId: string; displayName: string };

      await this.arcadeService.updateDisplayName(userId, body.tenantId, body.displayName);
      return { success: true };
    });

    // ==================== Missions ====================

    fastify.post('/api/v1/tenants/:tenantId/missions', async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const mission = await this.arcadeService.createMission(tenantId, request.body as any);
        return reply.code(201).send({ success: true, data: mission });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/tenants/:tenantId/missions/available', async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const { userId, limit } = request.query as { userId: string; limit?: string };

      if (!userId) {
        return reply.code(400).send({ success: false, error: 'userId required' });
      }

      const missions = await this.arcadeService.getAvailableMissions(
        userId,
        tenantId,
        parseInt(limit || '10')
      );
      return { success: true, data: missions };
    });

    fastify.get('/api/v1/missions/:missionId', async (request, reply) => {
      const { missionId } = request.params as { missionId: string };
      const mission = await this.arcadeService.getMission(missionId);

      if (!mission) {
        return reply.code(404).send({ success: false, error: 'Mission not found' });
      }

      return { success: true, data: mission };
    });

    fastify.post('/api/v1/missions/:missionId/assign', async (request, reply) => {
      try {
        const { missionId } = request.params as { missionId: string };
        const { userId } = request.body as { userId: string };

        const mission = await this.arcadeService.assignMission(missionId, userId);
        return { success: true, data: mission };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.post('/api/v1/missions/:missionId/start', async (request, reply) => {
      try {
        const { missionId } = request.params as { missionId: string };
        const { userId } = request.body as { userId: string };

        const mission = await this.arcadeService.startMission(missionId, userId);
        return { success: true, data: mission };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.post('/api/v1/missions/:missionId/complete', async (request, reply) => {
      try {
        const { missionId } = request.params as { missionId: string };
        const { userId, result } = request.body as { userId: string; result: any };

        const completionResult = await this.arcadeService.completeMission(missionId, userId, result);
        return { success: true, data: completionResult };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/users/:userId/missions/active', async (request, reply) => {
      const { userId } = request.params as { userId: string };
      const { tenantId } = request.query as { tenantId: string };

      if (!tenantId) {
        return reply.code(400).send({ success: false, error: 'tenantId required' });
      }

      const missions = await this.arcadeService.getUserActiveMissions(userId, tenantId);
      return { success: true, data: missions };
    });

    fastify.get('/api/v1/users/:userId/missions/completed', async (request, reply) => {
      const { userId } = request.params as { userId: string };
      const { tenantId, limit } = request.query as { tenantId: string; limit?: string };

      if (!tenantId) {
        return reply.code(400).send({ success: false, error: 'tenantId required' });
      }

      const missions = await this.arcadeService.getUserCompletedMissions(
        userId,
        tenantId,
        parseInt(limit || '20')
      );
      return { success: true, data: missions };
    });

    // ==================== Leaderboards ====================

    fastify.get('/api/v1/tenants/:tenantId/leaderboard', async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const { type, limit } = request.query as { type?: string; limit?: string };

      const leaderboard = await this.arcadeService.getLeaderboard(
        tenantId,
        (type || 'xp_all_time') as any,
        parseInt(limit || '10')
      );
      return { success: true, data: leaderboard };
    });

    // ==================== Datasets ====================

    fastify.post('/api/v1/tenants/:tenantId/datasets', async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const body = request.body as { name: string; missionType: any; description?: string };

        const dataset = await this.arcadeService.createDataset(
          tenantId,
          body.name,
          body.missionType,
          body.description
        );
        return reply.code(201).send({ success: true, data: dataset });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/datasets/:datasetId', async (request, reply) => {
      const { datasetId } = request.params as { datasetId: string };
      const dataset = await this.arcadeService.getDataset(datasetId);

      if (!dataset) {
        return reply.code(404).send({ success: false, error: 'Dataset not found' });
      }

      return { success: true, data: dataset };
    });

    fastify.get('/api/v1/tenants/:tenantId/datasets', async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const datasets = await this.arcadeService.getTenantDatasets(tenantId);
      return { success: true, data: datasets };
    });

    // ==================== Statistics ====================

    fastify.get('/api/v1/tenants/:tenantId/stats', async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const { start, end } = request.query as { start?: string; end?: string };

      const periodStart = new Date(start || Date.now() - 30 * 24 * 60 * 60 * 1000);
      const periodEnd = new Date(end || Date.now());

      const stats = await this.arcadeService.getArcadeStats(tenantId, periodStart, periodEnd);
      return { success: true, data: stats };
    });
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log('HITL Arcade stopped');
  }
}

const app = new HITLArcadeApp();
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

export default HITLArcadeApp;
