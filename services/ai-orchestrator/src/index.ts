import Fastify from 'fastify';
import { DatabaseManager } from '@shifty/database';
import { OllamaService } from './services/ollama.service';
import { TestGenerationService } from './services/test-generation.service';
import { SelectorHealingService } from './services/selector-healing.service';
import { AnalyticsService } from './services/analytics.service';
import { aiRoutes } from './routes/ai.routes';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

class AIOrchestrator {
  private dbManager: DatabaseManager;
  private ollamaService: OllamaService;
  private testGenerationService: TestGenerationService;
  private healingService: SelectorHealingService;
  private analyticsService: AnalyticsService;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.ollamaService = new OllamaService();
    this.testGenerationService = new TestGenerationService(this.ollamaService, this.dbManager);
    this.healingService = new SelectorHealingService(this.ollamaService, this.dbManager);
    this.analyticsService = new AnalyticsService(this.dbManager);
  }

  async start() {
    try {
      // Initialize database
      await this.dbManager.initialize();

      // Register plugins and routes
      await this.registerPlugins();
      await this.registerRoutes();

      // Start server
      const port = parseInt(process.env.PORT || '3003', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      
      console.log(`🤖 AI Orchestrator running on port ${port}`);
    } catch (error) {
      console.error('Failed to start AI Orchestrator:', error);
      process.exit(1);
    }
  }

  private async registerPlugins() {
    // CORS
    await fastify.register(import('@fastify/cors'), {
      origin: true,
      credentials: true
    });

    // Rate limiting
    await fastify.register(import('@fastify/rate-limit'), {
      max: 1000,
      timeWindow: '1 minute'
    });
  }

  private async registerRoutes() {
    // Health check
    fastify.get('/health', async () => {
      const dbHealth = await this.dbManager.healthCheck();
      const ollamaHealth = await this.ollamaService.healthCheck();

      return {
        status: 'healthy',
        service: 'ai-orchestrator',
        timestamp: new Date().toISOString(),
        dependencies: {
          database: dbHealth,
          ollama: ollamaHealth
        }
      };
    });

    // AI routes
    await fastify.register(aiRoutes, {
      testGenerationService: this.testGenerationService,
      healingService: this.healingService,
      ollamaService: this.ollamaService,
      analyticsService: this.analyticsService
    });
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log('AI Orchestrator stopped');
  }
}

const app = new AIOrchestrator();
app.start();

// Graceful shutdown
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