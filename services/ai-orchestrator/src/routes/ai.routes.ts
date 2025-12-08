import { FastifyInstance } from "fastify";
import { z } from "zod";
import { OllamaService } from "../services/ollama.service.js";
import { SelectorHealingService } from "../services/selector-healing.service.js";
import { TestGenerationService } from "../services/test-generation.service.js";

// Request validation schemas
const TestGenerationSchema = z.object({
  description: z.string().min(1),
  testType: z.enum(["e2e", "integration", "unit", "smoke"]),
  framework: z.enum(["playwright", "cypress", "webdriver"]).optional(),
  pageUrl: z.string().url().optional(),
  userStory: z.string().optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
});

const TestImprovementSchema = z.object({
  existingTest: z.string().min(1),
  feedback: z.string().min(1),
});

const SelectorHealingSchema = z.object({
  brokenSelector: z.string().min(1),
  pageUrl: z.string().url(),
  expectedElementType: z.string().optional(),
  context: z
    .object({
      previouslyWorking: z.boolean().default(false),
      errorMessage: z.string().optional(),
      browserType: z
        .enum(["chromium", "firefox", "webkit"])
        .default("chromium"),
      screenshot: z.string().optional(),
    })
    .optional(),
});

const BatchHealingSchema = z.object({
  requests: z.array(SelectorHealingSchema).min(1).max(10),
});

export async function aiRoutes(
  fastify: FastifyInstance,
  options: {
    testGenerationService: TestGenerationService;
    healingService: SelectorHealingService;
    ollamaService: OllamaService;
  }
) {
  const { testGenerationService, healingService, ollamaService } = options;

  // Test Generation Routes
  fastify.post("/api/v1/ai/generate-test", async (request, reply) => {
    try {
      const tenantId = request.headers["x-tenant-id"] as string;
      if (!tenantId) {
        return reply.status(401).send({ error: "Tenant ID required" });
      }

      const body = TestGenerationSchema.parse(request.body);
      const result = await testGenerationService.generateTest(tenantId, body);

      reply.send({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Test generation error:", error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: "Invalid input",
          details: error.errors,
        });
      }
      reply.status(500).send({
        error: "Test generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  fastify.post("/api/v1/ai/improve-test", async (request, reply) => {
    try {
      const tenantId = request.headers["x-tenant-id"] as string;
      if (!tenantId) {
        return reply.status(401).send({ error: "Tenant ID required" });
      }

      const body = TestImprovementSchema.parse(request.body);
      const result = await testGenerationService.improveTest(
        tenantId,
        body.existingTest,
        body.feedback
      );

      reply.send({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Test improvement error:", error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: "Invalid input",
          details: error.errors,
        });
      }
      reply.status(500).send({
        error: "Test improvement failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Selector Healing Routes
  fastify.post("/api/v1/ai/heal-selector", async (request, reply) => {
    try {
      const tenantId = request.headers["x-tenant-id"] as string;
      if (!tenantId) {
        return reply.status(401).send({ error: "Tenant ID required" });
      }

      const body = SelectorHealingSchema.parse(request.body);
      const result = await healingService.healSelector(tenantId, body);

      reply.send({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Selector healing error:", error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: "Invalid input",
          details: error.errors,
        });
      }
      reply.status(500).send({
        error: "Selector healing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  fastify.post("/api/v1/ai/heal-selectors/batch", async (request, reply) => {
    try {
      const tenantId = request.headers["x-tenant-id"] as string;
      if (!tenantId) {
        return reply.status(401).send({ error: "Tenant ID required" });
      }

      const body = BatchHealingSchema.parse(request.body);
      const results = await healingService.batchHealSelectors(
        tenantId,
        body.requests
      );

      const summary = {
        total: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        averageConfidence:
          results.length > 0
            ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length
            : 0,
      };

      reply.send({
        success: true,
        data: {
          results,
          summary,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Batch healing error:", error);
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: "Invalid input",
          details: error.errors,
        });
      }
      reply.status(500).send({
        error: "Batch healing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // AI Model Management Routes
  fastify.get("/api/v1/ai/models", async (request, reply) => {
    try {
      const models = await ollamaService.listModels();
      reply.send({
        success: true,
        data: {
          models: models.map((model) => ({
            name: model.name,
            size: model.size,
            modified: model.modified_at,
          })),
        },
      });
    } catch (error) {
      console.error("Models list error:", error);
      reply.status(500).send({
        error: "Failed to list models",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // AI Status endpoint
  fastify.get("/api/v1/ai/status", async (request, reply) => {
    try {
      const modelHealth = await ollamaService.healthCheck();

      reply.send({
        success: true,
        data: {
          service: "ai-orchestrator",
          status: modelHealth.status,
          models: modelHealth.models || [],
          services: {
            ollama: modelHealth.status,
            testGeneration: "healthy",
            selectorHealing: "healthy",
          },
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("AI status error:", error);
      reply.status(500).send({
        error: "Failed to get AI status",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  fastify.get("/api/v1/ai/health", async (request, reply) => {
    try {
      const health = await ollamaService.healthCheck();
      reply.send({
        success: true,
        data: {
          ollama: health,
          services: {
            testGeneration: "healthy",
            selectorHealing: "healthy",
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("AI health check error:", error);
      reply.status(500).send({
        error: "AI health check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // AI Analytics and Insights
  fastify.get("/api/v1/ai/analytics", async (request, reply) => {
    try {
      const tenantId = request.headers["x-tenant-id"] as string;
      if (!tenantId) {
        return reply.status(401).send({ error: "Tenant ID required" });
      }

      // Analytics with placeholder data - real data requires aggregation from test-generator and healing-engine
      const analytics = {
        testGeneration: {
          totalGenerated: 0,
          successRate: 0.85,
          averageConfidence: 0.78,
          mostUsedTypes: ["e2e", "smoke", "integration"],
        },
        selectorHealing: {
          totalAttempts: 0,
          healingSuccessRate: 0.72,
          averageConfidence: 0.68,
          mostUsedStrategies: ["extract-testid", "role-based", "ai-generated"],
        },
        modelUsage: {
          totalRequests: 0,
          averageResponseTime: 2500,
          currentModel: process.env.AI_MODEL || "llama3.1",
        },
      };

      reply.send({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Analytics error:", error);
      reply.status(500).send({
        error: "Analytics retrieval failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}
