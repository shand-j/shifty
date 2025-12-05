import Fastify from 'fastify';
import { DatabaseManager } from '@shifty/database';
import { CICDGovernorService } from './services/cicd-governor.service';
import {
  ReleasePolicySchema,
  RollbackRequestSchema,
} from '@shifty/shared';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

class CICDGovernorApp {
  private dbManager: DatabaseManager;
  private governorService: CICDGovernorService;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.governorService = new CICDGovernorService(this.dbManager);
  }

  async start() {
    try {
      await this.dbManager.initialize();
      await this.registerPlugins();
      await this.registerRoutes();

      const port = parseInt(process.env.PORT || '3010', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      
      console.log(`🚦 CI/CD Governor running on port ${port}`);
    } catch (error) {
      console.error('Failed to start CI/CD Governor:', error);
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
      service: 'cicd-governor',
      timestamp: new Date().toISOString()
    }));

    // ==================== Release Policies ====================

    fastify.post('/api/v1/tenants/:tenantId/policies', async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const policy = await this.governorService.createReleasePolicy(tenantId, request.body as any);
        return reply.code(201).send({ success: true, data: policy });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/tenants/:tenantId/policies', async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const policies = await this.governorService.getTenantPolicies(tenantId);
      return { success: true, data: policies };
    });

    fastify.get('/api/v1/policies/:policyId', async (request, reply) => {
      const { policyId } = request.params as { policyId: string };
      const policy = await this.governorService.getReleasePolicy(policyId);

      if (!policy) {
        return reply.code(404).send({ success: false, error: 'Policy not found' });
      }

      return { success: true, data: policy };
    });

    fastify.put('/api/v1/policies/:policyId', async (request, reply) => {
      try {
        const { policyId } = request.params as { policyId: string };
        const policy = await this.governorService.updateReleasePolicy(policyId, request.body as any);
        return { success: true, data: policy };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Policy Evaluation ====================

    fastify.post('/api/v1/evaluate', async (request, reply) => {
      try {
        const body = request.body as {
          tenantId: string;
          policyId: string;
          pipelineId: string;
          commitSha: string;
          branch: string;
          metrics: Record<string, number>;
        };

        const evaluation = await this.governorService.evaluatePolicy(
          body.tenantId,
          body.policyId,
          body.pipelineId,
          body.commitSha,
          body.branch,
          body.metrics
        );

        return { success: true, data: evaluation };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Deployments ====================

    fastify.post('/api/v1/tenants/:tenantId/deployments', async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const body = request.body as {
          target: any;
          version: string;
          commitSha: string;
          branch: string;
          createdBy: string;
        };

        const deployment = await this.governorService.createDeployment(
          tenantId, body.target, body.version, body.commitSha, body.branch, body.createdBy
        );

        return reply.code(201).send({ success: true, data: deployment });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/tenants/:tenantId/deployments', async (request, reply) => {
      const { tenantId } = request.params as { tenantId: string };
      const { target, limit } = request.query as { target?: string; limit?: string };

      const deployments = await this.governorService.getTenantDeployments(
        tenantId, target as any, parseInt(limit || '20')
      );

      return { success: true, data: deployments };
    });

    fastify.get('/api/v1/deployments/:deploymentId', async (request, reply) => {
      const { deploymentId } = request.params as { deploymentId: string };
      const deployment = await this.governorService.getDeployment(deploymentId);

      if (!deployment) {
        return reply.code(404).send({ success: false, error: 'Deployment not found' });
      }

      return { success: true, data: deployment };
    });

    // ==================== Rollback ====================

    fastify.post('/api/v1/rollback', async (request, reply) => {
      try {
        const body = request.body as {
          deploymentId: string;
          targetVersion: string;
          reason: string;
          requestedBy: string;
        };

        const deployment = await this.governorService.initiateRollback({
          ...body,
          autoTriggered: false,
        });

        return { success: true, data: deployment };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Release Gates ====================

    fastify.post('/api/v1/tenants/:tenantId/gates', async (request, reply) => {
      try {
        const { tenantId } = request.params as { tenantId: string };
        const body = request.body as {
          pipelineId: string;
          stage: any;
          approvers: string[];
          expiresInMinutes?: number;
        };

        const gate = await this.governorService.createReleaseGate(
          tenantId, body.pipelineId, body.stage, body.approvers, body.expiresInMinutes
        );

        return reply.code(201).send({ success: true, data: gate });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.get('/api/v1/gates/:gateId', async (request, reply) => {
      const { gateId } = request.params as { gateId: string };
      const gate = await this.governorService.getReleaseGate(gateId);

      if (!gate) {
        return reply.code(404).send({ success: false, error: 'Gate not found' });
      }

      return { success: true, data: gate };
    });

    fastify.post('/api/v1/gates/:gateId/approve', async (request, reply) => {
      try {
        const { gateId } = request.params as { gateId: string };
        const { approvedBy } = request.body as { approvedBy: string };

        const gate = await this.governorService.approveReleaseGate(gateId, approvedBy);
        return { success: true, data: gate };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    fastify.post('/api/v1/gates/:gateId/reject', async (request, reply) => {
      try {
        const { gateId } = request.params as { gateId: string };
        const { rejectedBy } = request.body as { rejectedBy: string };

        const gate = await this.governorService.rejectReleaseGate(gateId, rejectedBy);
        return { success: true, data: gate };
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== CI Actions for GitHub Workflows ====================

    // Test Generation Action Endpoint
    fastify.post('/api/v1/ci/actions/test-gen', async (request, reply) => {
      try {
        const body = request.body as {
          repo: string;
          commitSha: string;
          url: string;
          requirements: string;
          testType?: string;
        };

        // Generate unique request ID
        const requestId = `gen-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Forward to test-generator service (internal call)
        const testGeneratorUrl = process.env.TEST_GENERATOR_URL || 'http://localhost:3004';
        const response = await fetch(`${testGeneratorUrl}/api/v1/tests/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': request.headers['x-tenant-id'] as string || 'default',
            'X-API-Key': request.headers['x-api-key'] as string || ''
          },
          body: JSON.stringify({
            url: body.url,
            requirements: body.requirements,
            testType: body.testType || 'e2e'
          })
        });

        const result = await response.json() as { requestId?: string; status?: string };

        // Log CI action to governor service
        console.log(`CI Action: test-gen for repo ${body.repo} at ${body.commitSha}`);

        return reply.code(201).send({
          success: true,
          requestId: result.requestId || requestId,
          status: result.status || 'pending',
          message: 'Test generation request submitted',
          metadata: {
            repo: body.repo,
            commitSha: body.commitSha,
            testType: body.testType || 'e2e'
          }
        });
      } catch (error: any) {
        console.error('CI test-gen action failed:', error);
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // Test Healing Action Endpoint
    fastify.post('/api/v1/ci/actions/test-heal', async (request, reply) => {
      try {
        const body = request.body as {
          repo: string;
          commitSha: string;
          testFile: string;
          failingSelector: string;
          pageUrl: string;
        };

        // Forward to healing-engine service (internal call)
        const healingEngineUrl = process.env.HEALING_ENGINE_URL || 'http://localhost:3005';
        const response = await fetch(`${healingEngineUrl}/api/v1/healing/heal-selector`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': request.headers['x-tenant-id'] as string || 'default',
            'X-API-Key': request.headers['x-api-key'] as string || ''
          },
          body: JSON.stringify({
            url: body.pageUrl,
            brokenSelector: body.failingSelector,
            strategy: 'ai-powered-analysis'
          })
        });

        const result = await response.json() as {
          success?: boolean;
          status?: string;
          healedSelector?: string;
          healed?: string;
          confidence?: number;
          strategy?: string;
          alternatives?: string[];
        };

        // Log CI action
        console.log(`CI Action: test-heal for repo ${body.repo} at ${body.commitSha}`);

        return {
          success: result.success || result.status === 'success',
          healedSelector: result.healedSelector || result.healed,
          confidence: result.confidence || 0,
          strategy: result.strategy || 'unknown',
          alternatives: result.alternatives || [],
          metadata: {
            repo: body.repo,
            commitSha: body.commitSha,
            testFile: body.testFile,
            originalSelector: body.failingSelector
          }
        };
      } catch (error: any) {
        console.error('CI test-heal action failed:', error);
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // Quality Insights Action Endpoint
    fastify.post('/api/v1/ci/actions/quality-insights', async (request, reply) => {
      try {
        const body = request.body as {
          repo: string;
          branch: string;
          commitSha: string;
          prNumber?: number;
          testCount?: number;
          changedFiles?: number;
        };

        // Calculate quality metrics
        const testCoverage = body.testCount ? Math.min(100, body.testCount * 2) : 0;
        const changeRisk = body.changedFiles ? Math.min(100, body.changedFiles * 5) : 0;
        
        // Calculate quality score (simplified algorithm)
        const qualityScore = Math.round(
          (testCoverage * 0.5) + 
          ((100 - changeRisk) * 0.3) + 
          (50 * 0.2) // Base score
        );

        // Determine gate status
        const gateStatus = qualityScore >= 70 ? 'passed' : 
                          qualityScore >= 50 ? 'warning' : 'failed';

        // Generate recommendations
        const recommendations: string[] = [];
        if (testCoverage < 70) {
          recommendations.push('Consider adding more tests to improve coverage');
        }
        if (changeRisk > 50) {
          recommendations.push('Large number of changed files - consider splitting into smaller PRs');
        }
        if (qualityScore < 70) {
          recommendations.push('Run additional test suites before merging');
        }

        // Log CI action
        console.log(`CI Action: quality-insights for repo ${body.repo} branch ${body.branch}`);

        return {
          success: true,
          gateStatus,
          qualityScore,
          coverage: `${testCoverage}%`,
          recommendations,
          metadata: {
            repo: body.repo,
            branch: body.branch,
            commitSha: body.commitSha,
            prNumber: body.prNumber,
            analyzedAt: new Date().toISOString()
          }
        };
      } catch (error: any) {
        console.error('CI quality-insights action failed:', error);
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // CI Status Endpoint (MCP tool interface)
    fastify.get('/api/v1/ci/status', async (request, reply) => {
      try {
        const { repo, branch, provider } = request.query as {
          repo?: string;
          branch?: string;
          provider?: string;
        };

        // Return CI status for the repository
        return {
          success: true,
          status: 'operational',
          provider: provider || 'github',
          pipelines: {
            active: 0,
            queued: 0,
            completed: 0
          },
          lastSync: new Date().toISOString(),
          capabilities: [
            'test-generation',
            'test-healing',
            'quality-insights',
            'release-gates'
          ]
        };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log('CI/CD Governor stopped');
  }
}

const app = new CICDGovernorApp();
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

export default CICDGovernorApp;
