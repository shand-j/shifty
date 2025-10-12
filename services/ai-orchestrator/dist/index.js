"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const database_1 = require("@shifty/database");
const ollama_service_1 = require("./services/ollama.service");
const test_generation_service_1 = require("./services/test-generation.service");
const selector_healing_service_1 = require("./services/selector-healing.service");
const ai_routes_1 = require("./routes/ai.routes");
const fastify = (0, fastify_1.default)({
    logger: {
        level: process.env.LOG_LEVEL || 'info'
    }
});
class AIOrchestrator {
    constructor() {
        this.dbManager = new database_1.DatabaseManager();
        this.ollamaService = new ollama_service_1.OllamaService();
        this.testGenerationService = new test_generation_service_1.TestGenerationService(this.ollamaService, this.dbManager);
        this.healingService = new selector_healing_service_1.SelectorHealingService(this.ollamaService, this.dbManager);
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
        }
        catch (error) {
            console.error('Failed to start AI Orchestrator:', error);
            process.exit(1);
        }
    }
    async registerPlugins() {
        // CORS
        await fastify.register(Promise.resolve().then(() => __importStar(require('@fastify/cors'))), {
            origin: true,
            credentials: true
        });
        // Rate limiting
        await fastify.register(Promise.resolve().then(() => __importStar(require('@fastify/rate-limit'))), {
            max: 100,
            timeWindow: '1 minute'
        });
    }
    async registerRoutes() {
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
        await fastify.register(ai_routes_1.aiRoutes, {
            testGenerationService: this.testGenerationService,
            healingService: this.healingService,
            ollamaService: this.ollamaService
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
//# sourceMappingURL=index.js.map