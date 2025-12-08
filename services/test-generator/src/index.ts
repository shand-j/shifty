import Fastify from 'fastify';
import { DatabaseManager, TestGenerationRequestsRepository, TestGenerationRequestRecord } from '@shifty/database';
import { TestGenerator } from './core/test-generator';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { 
  getJwtConfig, 
  validateProductionConfig,
  RequestLimits,
  GenerateTestRequestSchema
} from '@shifty/shared';

// Validate configuration on startup
try {
  validateProductionConfig();
} catch (error) {
  console.error('Configuration validation failed:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Get centralized JWT configuration
const jwtConfig = getJwtConfig();

// Configure Fastify with proper request limits
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  },
  bodyLimit: RequestLimits.bodyLimit,
  requestTimeout: RequestLimits.requestTimeout
});

// Use shared validation schema for test generation requests
const GenerateTestSchema = GenerateTestRequestSchema;

const ValidateTestSchema = z.object({
  testCode: z.string(),
  testType: z.string(),
  url: z.string().url().optional()
});

// Helper function to extract tenant from JWT
const extractTenantFromAuth = (request: any) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    // Use centralized JWT configuration
    const decoded = jwt.verify(token, jwtConfig.secret) as any;
    return decoded.tenantId || 'default-tenant';
  } catch (error) {
    return null;
  }
};

interface TestGenerationRequest {
  id: string;
  tenantId: string;
  url: string;
  requirements: string;
  testType: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  generatedCode?: string;
  validationResult?: any;
  createdAt: Date;
  completedAt?: Date;
}

class TestGeneratorService {
  private dbManager: DatabaseManager;
  private testGenerator: TestGenerator;
  private testGenRepo: TestGenerationRequestsRepository;
  // Configuration for tenant database URLs - in production, this would come from tenant manager
  private tenantDbUrlTemplate: string;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.testGenRepo = new TestGenerationRequestsRepository(this.dbManager);
    this.testGenerator = new TestGenerator({
      ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
      model: process.env.AI_MODEL || 'llama3.1'
    });
    
    // Template for tenant database URLs
    // In production, TENANT_DB_URL_TEMPLATE must be configured
    if (process.env.NODE_ENV === 'production' && !process.env.TENANT_DB_URL_TEMPLATE) {
      console.warn('⚠️ WARNING: TENANT_DB_URL_TEMPLATE not configured in production');
    }
    this.tenantDbUrlTemplate = process.env.TENANT_DB_URL_TEMPLATE || 
      process.env.DATABASE_URL || 
      'postgresql://localhost:5432/shifty_tenant_{tenantId}';
  }

  /**
   * Get tenant database URL for a given tenant.
   * In production, this would fetch from tenant manager service.
   */
  private getTenantDbUrl(tenantId: string): string {
    return this.tenantDbUrlTemplate.replace('{tenantId}', tenantId);
  }

  async start() {
    try {
      await this.dbManager.initialize();
      await this.registerPlugins();
      await this.registerRoutes();

      const port = parseInt(process.env.PORT || '3004', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      
      console.log(`🧪 Test Generator Service running on port ${port}`);
    } catch (error) {
      console.error('Failed to start Test Generator Service:', error);
      process.exit(1);
    }
  }

  private async registerPlugins() {
    await fastify.register(import('@fastify/cors'), {
      origin: true,
      credentials: true
    });

    await fastify.register(import('@fastify/helmet'));

    // Configure rate limiting based on environment
    const rateLimit = process.env.NODE_ENV === 'test' ? {
      max: 1000, // More permissive for testing
      timeWindow: '1 minute',
      skipOnError: true,
      skipSuccessfulRequests: false,
      allowList: (req: any) => {
        // Exclude health checks from rate limiting
        return req.url === '/health' || req.url === '/api/v1/health';
      }
    } : {
      max: 500, // Production limit - increased significantly
      timeWindow: '1 minute',
      allowList: (req: any) => {
        // Exclude health checks from rate limiting in production too
        return req.url === '/health' || req.url === '/api/v1/health';
      }
    };

    await fastify.register(import('@fastify/rate-limit'), rateLimit);
  }

  private async registerRoutes() {
    // Secured health endpoint - minimal public info
    fastify.get('/health', async () => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    });

    // Detailed health check - for internal monitoring
    fastify.get('/health/detailed', async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        const token = authHeader.substring(7);
        jwt.verify(token, jwtConfig.secret);

        const aiHealth = await this.testGenerator.healthCheck();
        
        return {
          status: aiHealth.status === 'healthy' ? 'healthy' : 'degraded',
          service: 'test-generator',
          version: process.env.SERVICE_VERSION || '1.0.0',
          ai: aiHealth,
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        };
      } catch (error) {
        return reply.status(401).send({ error: 'Invalid authentication' });
      }
    });

    // Generate test from requirements
    fastify.post('/api/v1/tests/generate', async (request, reply) => {
      try {
        // Try JWT auth first, fall back to header
        let tenantId = extractTenantFromAuth(request);
        if (!tenantId) {
          tenantId = request.headers['x-tenant-id'] as string;
        }
        if (!tenantId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        const body = GenerateTestSchema.parse(request.body);
        
        // Create generation request record
        const requestId = uuidv4();
        await this.createGenerationRequest(requestId, tenantId, body);

        // Start generation process asynchronously
        this.processTestGeneration(requestId, body).catch(error => {
          console.error('Test generation error:', error);
          this.updateGenerationStatus(requestId, 'failed', undefined, { error: error.message });
        });

        reply.send({
          requestId,
          status: 'pending',
          message: 'Test generation started. Use /status endpoint to check progress.'
        });

      } catch (error) {
        console.error('Test generation request error:', error);
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: 'Invalid input', details: error.errors });
        }
        reply.status(500).send({ error: 'Internal server error' });
      }
    });

    // Check generation status
    fastify.get('/api/v1/tests/generate/:requestId/status', async (request, reply) => {
      try {
        // Try JWT auth first, fall back to header
        let tenantId = extractTenantFromAuth(request);
        if (!tenantId) {
          tenantId = request.headers['x-tenant-id'] as string;
        }
        if (!tenantId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        const { requestId } = request.params as { requestId: string };

        const generationRequest = await this.getGenerationRequest(requestId, tenantId);
        if (!generationRequest) {
          return reply.status(404).send({ error: 'Generation request not found' });
        }

        reply.send(generationRequest);

      } catch (error) {
        console.error('Status check error:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    });

    // Validate generated test
    fastify.post('/api/v1/tests/validate', async (request, reply) => {
      try {
        // Extract and validate authentication
        const tenantId = extractTenantFromAuth(request);
        if (!tenantId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        const body = ValidateTestSchema.parse(request.body);
        
        const validationResult = await this.testGenerator.validateTest(
          body.testCode,
          body.url
        );

        reply.send({
          valid: validationResult.valid,
          issues: validationResult.issues,
          suggestions: validationResult.suggestions,
          executionTime: validationResult.executionTime
        });

      } catch (error) {
        console.error('Test validation error:', error);
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: 'Invalid input', details: error.errors });
        }
        reply.status(500).send({ error: 'Internal server error' });
      }
    });

    // List generation history for tenant
    fastify.get('/api/v1/tests/history', async (request, reply) => {
      try {
        // Try JWT auth first, fall back to header
        let tenantId = extractTenantFromAuth(request);
        if (!tenantId) {
          tenantId = request.headers['x-tenant-id'] as string;
        }
        if (!tenantId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        const { limit = '10', offset = '0' } = request.query as any;

        const history = await this.getGenerationHistory(
          tenantId,
          parseInt(limit),
          parseInt(offset)
        );

        reply.send(history);

      } catch (error) {
        console.error('History retrieval error:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    });

    // Get specific generated test
    fastify.get('/api/v1/tests/:requestId', async (request, reply) => {
      try {
        // Try JWT auth first, fall back to header
        let tenantId = extractTenantFromAuth(request);
        if (!tenantId) {
          tenantId = request.headers['x-tenant-id'] as string;
        }
        if (!tenantId) {
          return reply.status(401).send({ error: 'Authentication required' });
        }

        const { requestId } = request.params as { requestId: string };

        const test = await this.getGenerationRequest(requestId, tenantId);
        if (!test) {
          return reply.status(404).send({ error: 'Test not found' });
        }

        reply.send(test);

      } catch (error) {
        console.error('Test retrieval error:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    });

    // AI-enhanced test improvement
    fastify.post('/api/v1/tests/:requestId/improve', async (request, reply) => {
      try {
        const tenantId = request.headers['x-tenant-id'] as string;
        const { requestId } = request.params as { requestId: string };
        const { feedback } = request.body as { feedback: string };

        const originalTest = await this.getGenerationRequest(requestId, tenantId);
        if (!originalTest || !originalTest.generatedCode) {
          return reply.status(404).send({ error: 'Original test not found' });
        }

        const improvedCode = await this.testGenerator.improveTest(
          originalTest.generatedCode,
          feedback
        );

        // Create new generation request for improved version
        const newRequestId = uuidv4();
        await this.createGenerationRequest(newRequestId, tenantId, {
          url: originalTest.url,
          requirements: `${originalTest.requirements}\n\nImprovement feedback: ${feedback}`,
          testType: originalTest.testType as any
        });

        await this.updateGenerationStatus(newRequestId, 'completed', improvedCode);

        reply.send({
          requestId: newRequestId,
          improvedCode,
          status: 'completed'
        });

      } catch (error) {
        console.error('Test improvement error:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    });
  }

  private async processTestGeneration(requestId: string, request: any) {
    try {
      await this.updateGenerationStatus(requestId, 'generating');

      const generatedTest = await this.testGenerator.generateTest({
        url: request.url,
        requirements: request.requirements,
        testType: request.testType,
        browserType: request.browserType,
        options: request.options
      });

      await this.updateGenerationStatus(requestId, 'completed', generatedTest.code, {
        metadata: generatedTest.metadata,
        selectors: generatedTest.selectors,
        executionTime: generatedTest.estimatedExecutionTime
      });

    } catch (error) {
      await this.updateGenerationStatus(requestId, 'failed', undefined, { 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  // In-memory store for tracking tenant IDs per request (for status updates)
  private requestTenantMap: Map<string, string> = new Map();

  private async createGenerationRequest(
    id: string,
    tenantId: string,
    request: any
  ): Promise<void> {
    try {
      const dbUrl = this.getTenantDbUrl(tenantId);
      
      await this.testGenRepo.create(tenantId, dbUrl, {
        id,
        tenantId,
        url: request.url,
        requirements: request.requirements,
        testType: request.testType
      });

      // Store the tenant ID mapping for status updates
      this.requestTenantMap.set(id, tenantId);

      console.log(`✅ Generation request ${id} created for tenant ${tenantId}`);
    } catch (error) {
      // Log error but don't fail the request - persistence is best-effort
      console.error(`Failed to persist generation request ${id} for tenant ${tenantId}:`, error);
      // Store in memory map as fallback
      this.requestTenantMap.set(id, tenantId);
    }
  }

  private async updateGenerationStatus(
    id: string,
    status: string,
    code?: string,
    additional?: any
  ): Promise<void> {
    try {
      const tenantId = this.requestTenantMap.get(id);
      if (!tenantId) {
        console.warn(`No tenant ID found for request ${id}, status update skipped`);
        return;
      }

      const dbUrl = this.getTenantDbUrl(tenantId);
      
      await this.testGenRepo.updateStatus(tenantId, dbUrl, id, status, {
        generatedCode: code,
        selectors: additional?.selectors,
        metadata: additional?.metadata,
        validationResult: additional?.validationResult,
        errorMessage: additional?.error,
        executionTime: additional?.executionTime
      });

      console.log(`✅ Generation request ${id} status updated to ${status}`);

      // Clean up memory map on terminal states
      if (status === 'completed' || status === 'failed') {
        this.requestTenantMap.delete(id);
      }
    } catch (error) {
      console.error(`Failed to update generation request ${id} status:`, error);
    }
  }

  private async getGenerationRequest(
    id: string,
    tenantId: string
  ): Promise<TestGenerationRequest | null> {
    try {
      const dbUrl = this.getTenantDbUrl(tenantId);
      const record = await this.testGenRepo.getById(tenantId, dbUrl, id);

      if (!record) {
        return null;
      }

      return {
        id: record.id,
        tenantId: record.tenantId,
        url: record.url,
        requirements: record.requirements,
        testType: record.testType,
        status: record.status,
        generatedCode: record.generatedCode,
        validationResult: record.validationResult,
        createdAt: record.createdAt,
        completedAt: record.completedAt
      };
    } catch (error) {
      console.error(`Failed to get generation request ${id} for tenant ${tenantId}:`, error);
      // Return null if database is unavailable
      return null;
    }
  }

  private async getGenerationHistory(
    tenantId: string,
    limit: number,
    offset: number
  ): Promise<TestGenerationRequest[]> {
    try {
      const dbUrl = this.getTenantDbUrl(tenantId);
      const records = await this.testGenRepo.getHistory(tenantId, dbUrl, limit, offset);

      return records.map(record => ({
        id: record.id,
        tenantId: record.tenantId,
        url: record.url,
        requirements: record.requirements,
        testType: record.testType,
        status: record.status,
        generatedCode: record.generatedCode,
        validationResult: record.validationResult,
        createdAt: record.createdAt,
        completedAt: record.completedAt
      }));
    } catch (error) {
      console.error(`Failed to get generation history for tenant ${tenantId}:`, error);
      return [];
    }
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log('Test Generator Service stopped');
  }
}

const service = new TestGeneratorService();
service.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await service.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await service.stop();
  process.exit(0);
});

export default TestGeneratorService;