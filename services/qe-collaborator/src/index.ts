import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import { DatabaseManager } from '@shifty/database';
import { QECollaboratorService } from './services/qe-collaborator.service';
import { DataIngestionService } from './services/data-ingestion.service';
import { qeRoutes } from './routes/qe.routes';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
});

class QECollaboratorServer {
  private qeService: QECollaboratorService;
  private dataIngestionService: DataIngestionService;
  private dbManager: DatabaseManager;
  private port: number;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.qeService = new QECollaboratorService();
    this.dataIngestionService = new DataIngestionService();
    this.port = parseInt(process.env.PORT || "3010", 10);
  }

  async start() {
    try {
      // Initialize database
      await this.dbManager.initialize();

      // Register plugins
      await this.registerPlugins();

      // Register routes
      await this.registerRoutes();

      // Start scheduled data ingestion
      this.startScheduledIngestion();

      // Start server
      await fastify.listen({ port: this.port, host: "0.0.0.0" });

      console.log(`🤖 QE Collaborator service running on port ${this.port}`);
      console.log(
        `   WebSocket: ws://localhost:${this.port}/api/v1/qe/chat/ws`
      );
    } catch (error) {
      console.error("Failed to start QE Collaborator service:", error);
      process.exit(1);
    }
  }

  private async registerPlugins() {
    // CORS
    await fastify.register(cors, {
      origin: process.env.CORS_ORIGIN || true,
      credentials: true,
    });

    // Rate limiting
    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: "1 minute",
    });

    // WebSocket
    await fastify.register(websocket, {
      options: {
        maxPayload: 1048576, // 1MB
      },
    });
  }

  private async registerRoutes() {
    // Health check
    fastify.get("/health", async () => {
      return {
        status: "healthy",
        service: "qe-collaborator",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      };
    });

    // QE routes
    await fastify.register(qeRoutes, {
      qeService: this.qeService,
      dataIngestionService: this.dataIngestionService,
    });
  }

  private startScheduledIngestion() {
    // Run data ingestion every hour
    const intervalMs = Number.parseInt(
      process.env.INGESTION_INTERVAL_MS || "3600000",
      10
    );

    setInterval(async () => {
      try {
        console.log('Running scheduled data ingestion...');
        
        // Fetch tenant IDs from database
        const tenantLimit = parseInt(process.env.INGESTION_TENANT_LIMIT || '10', 10);
        const tenants = await this.dbManager.query(
          'SELECT id FROM tenants WHERE is_active = true LIMIT $1',
          [tenantLimit]
        );
        const tenantIds = tenants.rows.map((row: any) => row.id);
        
        if (tenantIds.length > 0) {
          console.log(`Ingesting data for ${tenantIds.length} tenants`);
          await this.dataIngestionService.scheduledIngestion(tenantIds);
        } else {
          console.log('No active tenants found for data ingestion');
        }
      } catch (error) {
        console.error("Error in scheduled ingestion:", error);
      }
    }, intervalMs);

    console.log(
      `Scheduled data ingestion every ${intervalMs / 1000 / 60} minutes`
    );
  }

  async stop() {
    await fastify.close();
    console.log("QE Collaborator service stopped");
  }
}

const server = new QECollaboratorServer();
server.start();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await server.stop();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await server.stop();
  process.exit(0);
});
