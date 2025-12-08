import { FastifyRequest, FastifyReply } from 'fastify';
// @ts-ignore - Import from compiled dist
import { getMockDataStore } from '../../../packages/shared/dist/mocks/index.js';
// @ts-ignore - Import from compiled dist
import { MOCK_PERSONAS } from '../../../packages/shared/dist/mocks/index.js';

const MOCK_MODE = process.env.MOCK_MODE === 'true';
const mockStore = MOCK_MODE ? getMockDataStore() : null;

// Simulate realistic network delay
function simulateDelay(): Promise<void> {
  const delay = Math.floor(Math.random() * 250) + 50; // 50-300ms
  return new Promise(resolve => setTimeout(resolve, delay));
}

export async function mockInterceptor(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Check if mock mode is enabled
  const mockModeHeader = request.headers['x-mock-mode'] === 'true';
  if (!MOCK_MODE && !mockModeHeader) {
    return; // Continue to real services
  }

  if (!mockStore) {
    return; // No mock store available
  }

  await simulateDelay();

  const { method, url } = request;
  const path = url.split('?')[0];
  const queryParams = new URLSearchParams(url.split('?')[1] || '');

  console.log(`[MockInterceptor] ${method} ${path}`);

  try {
    // Auth endpoints
    if (path === '/api/v1/auth/login' && method === 'POST') {
      const body = request.body as { email: string; password: string };
      const user = mockStore.getUserByEmail(body.email);

      // Check for mock personas or any user with matching email
      if (user) {
        // Simple mock auth - any password works in mock mode
        reply.code(200).send({
          success: true,
          token: `mock-jwt-token-${user.id}`,
          refreshToken: `mock-refresh-token-${user.id}`,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            persona: user.persona,
            role: user.role,
          },
        });
        return;
      } else {
        reply.code(401).send({
          success: false,
          error: 'Invalid credentials',
        });
        return;
      }
    }

    if (path === '/api/v1/auth/register' && method === 'POST') {
      const body = request.body as { email: string; password: string; firstName: string; lastName: string };
      reply.code(201).send({
        success: true,
        token: 'mock-jwt-token-new-user',
        refreshToken: 'mock-refresh-token-new-user',
        user: {
          id: 'new-user',
          email: body.email,
          name: `${body.firstName} ${body.lastName}`,
          firstName: body.firstName,
          lastName: body.lastName,
          persona: 'developer',
          role: 'member',
        },
      });
      return;
    }

    if (path === '/api/v1/auth/refresh' && method === 'POST') {
      reply.code(200).send({
        success: true,
        token: 'mock-jwt-token-refreshed',
        refreshToken: 'mock-refresh-token-refreshed',
      });
      return;
    }

    if (path === '/api/v1/auth/logout' && method === 'POST') {
      reply.code(200).send({ success: true });
      return;
    }

    // User endpoints
    if (path === '/api/v1/users/me' && method === 'GET') {
      // Extract user from mock token
      const authHeader = request.headers.authorization;
      const userId = authHeader?.split('mock-jwt-token-')[1] || 'user-dev-1';
      const user = mockStore.getUserById(userId);

      if (user) {
        reply.code(200).send({ success: true, data: user });
        return;
      }
    }

    if (path.match(/\/api\/v1\/users\/[^/]+$/) && method === 'PATCH') {
      reply.code(200).send({
        success: true,
        data: { ...(typeof request.body === 'object' && request.body !== null ? request.body : {}), updated: true },
      });
      return;
    }

    // Tenant endpoints
    if (path === '/api/v1/tenants' && method === 'GET') {
      reply.code(200).send({
        success: true,
        data: [
          {
            id: 'tenant-1',
            name: 'Acme Corp',
            slug: 'acme',
            plan: 'enterprise',
          },
        ],
      });
      return;
    }

    // Teams endpoints
    if (path === '/api/v1/teams' && method === 'GET') {
      reply.code(200).send({
        success: true,
        data: mockStore.teams,
      });
      return;
    }

    if (path.match(/\/api\/v1\/teams\/[^/]+$/) && method === 'GET') {
      const teamId = path.split('/').pop();
      const team = mockStore.getTeamById(teamId!);
      reply.code(200).send({
        success: true,
        data: team,
      });
      return;
    }

    // Projects endpoints
    if (path === '/api/v1/projects' && method === 'GET') {
      const teamId = queryParams.get('teamId');
      const projects = teamId
        ? mockStore.getProjectsByTeam(teamId)
        : mockStore.projects.slice(0, 50); // Limit to 50 for performance

      reply.code(200).send({
        success: true,
        data: projects,
        pagination: {
          total: mockStore.projects.length,
          page: 1,
          limit: 50,
        },
      });
      return;
    }

    if (path.match(/\/api\/v1\/projects\/[^/]+$/) && method === 'GET') {
      const projectId = path.split('/').pop();
      const project = mockStore.getProjectById(projectId!);
      reply.code(200).send({
        success: true,
        data: project,
      });
      return;
    }

    if (path === '/api/v1/projects' && method === 'POST') {
      const newProject = mockStore.createProject(request.body as any);
      reply.code(201).send({
        success: true,
        data: newProject,
      });
      return;
    }

    // Tests endpoints
    if (path === '/api/v1/tests' && method === 'GET') {
      const projectId = queryParams.get('projectId');
      const limit = parseInt(queryParams.get('limit') || '100');
      const page = parseInt(queryParams.get('page') || '1');

      const tests = projectId
        ? mockStore.getTestsByProject(projectId)
        : mockStore.tests;

      const startIndex = (page - 1) * limit;
      const paginatedTests = tests.slice(startIndex, startIndex + limit);

      reply.code(200).send({
        success: true,
        data: paginatedTests,
        pagination: {
          total: tests.length,
          page,
          limit,
        },
      });
      return;
    }

    if (path.match(/\/api\/v1\/tests\/[^/]+$/) && method === 'GET') {
      const testId = path.split('/').pop();
      const test = mockStore.getTestById(testId!);
      reply.code(200).send({
        success: true,
        data: test,
      });
      return;
    }

    if (path === '/api/v1/ai/generate-tests' && method === 'POST') {
      reply.code(200).send({
        success: true,
        data: {
          jobId: 'mock-job-id',
          status: 'processing',
          estimatedTime: 30,
        },
      });
      return;
    }

    // Healing endpoints
    if (path === '/api/v1/healing/suggestions' && method === 'GET') {
      const status = queryParams.get('status');
      const limit = parseInt(queryParams.get('limit') || '100');

      let suggestions = status === 'pending'
        ? mockStore.getPendingHealingSuggestions()
        : mockStore.healingSuggestions;

      suggestions = suggestions.slice(0, limit);

      reply.code(200).send({
        success: true,
        data: suggestions,
        pagination: {
          total: mockStore.healingSuggestions.length,
          page: 1,
          limit,
        },
      });
      return;
    }

    if (path.match(/\/api\/v1\/healing\/[^/]+\/approve$/) && method === 'POST') {
      const healingId = path.split('/')[4];
      const authHeader = request.headers.authorization;
      const userId = authHeader?.split('mock-jwt-token-')[1] || 'user-dev-1';

      mockStore.approveHealing(healingId, userId);
      reply.code(200).send({
        success: true,
        data: mockStore.getHealingSuggestionById(healingId),
      });
      return;
    }

    if (path.match(/\/api\/v1\/healing\/[^/]+\/reject$/) && method === 'POST') {
      const healingId = path.split('/')[4];
      const authHeader = request.headers.authorization;
      const userId = authHeader?.split('mock-jwt-token-')[1] || 'user-dev-1';

      mockStore.rejectHealing(healingId, userId);
      reply.code(200).send({
        success: true,
        data: mockStore.getHealingSuggestionById(healingId),
      });
      return;
    }

    // Pipelines endpoints
    if (path === '/api/v1/pipelines' && method === 'GET') {
      const projectId = queryParams.get('projectId');
      const limit = parseInt(queryParams.get('limit') || '50');

      const pipelines = projectId
        ? mockStore.getPipelinesByProject(projectId)
        : mockStore.pipelines;

      reply.code(200).send({
        success: true,
        data: pipelines.slice(0, limit),
        pagination: {
          total: pipelines.length,
          page: 1,
          limit,
        },
      });
      return;
    }

    if (path.match(/\/api\/v1\/pipelines\/[^/]+$/) && method === 'GET') {
      const pipelineId = path.split('/').pop();
      const pipeline = mockStore.getPipelineById(pipelineId!);
      reply.code(200).send({
        success: true,
        data: pipeline,
      });
      return;
    }

    // Sessions endpoints
    if (path === '/api/v1/sessions' && method === 'GET') {
      reply.code(200).send({
        success: true,
        data: Array.from(mockStore.sessions.values()),
      });
      return;
    }

    if (path === '/api/v1/sessions' && method === 'POST') {
      const session = mockStore.createSession(request.body);
      reply.code(201).send({
        success: true,
        data: session,
      });
      return;
    }

    // Dashboard/Insights endpoints
    if (path === '/api/v1/insights/dashboard' && method === 'GET') {
      const persona = queryParams.get('persona') || 'developer';

      reply.code(200).send({
        success: true,
        data: {
          totalTests: mockStore.tests.length,
          passingTests: mockStore.tests.filter((t: any) => t.status === 'passing').length,
          failingTests: mockStore.tests.filter((t: any) => t.status === 'failing').length,
          flakyTests: mockStore.tests.filter((t: any) => t.status === 'flaky').length,
          pendingHealings: mockStore.getPendingHealingSuggestions().length,
          activeProjects: mockStore.projects.filter((p: any) => p.status === 'active').length,
          recentPipelines: mockStore.pipelines.slice(0, 10),
          teamMetrics: {
            testMaturityScore: 87,
            automationCoverage: 78,
            avgHealingTime: 145,
          },
        },
      });
      return;
    }

    if (path === '/api/v1/insights/roi' && method === 'GET') {
      reply.code(200).send({
        success: true,
        data: {
          metrics: mockStore.roiMetrics,
          summary: {
            totalTimeSaved: mockStore.roiMetrics.reduce((sum: number, m: any) => sum + m.timeSaved, 0),
            totalCostSaved: mockStore.roiMetrics.reduce((sum: number, m: any) => sum + m.costSaved, 0),
            totalTestsAutomated: mockStore.roiMetrics.reduce((sum: number, m: any) => sum + m.testsAutomated, 0),
          },
        },
      });
      return;
    }

    if (path === '/api/v1/insights/dora' && method === 'GET') {
      reply.code(200).send({
        success: true,
        data: mockStore.doraMetrics,
      });
      return;
    }

    // Notifications endpoints
    if (path === '/api/v1/notifications' && method === 'GET') {
      const authHeader = request.headers.authorization;
      const userId = authHeader?.split('mock-jwt-token-')[1] || 'user-dev-1';
      const notifications = mockStore.getUserNotifications(userId);

      reply.code(200).send({
        success: true,
        data: notifications,
      });
      return;
    }

    if (path.match(/\/api\/v1\/notifications\/[^/]+\/read$/) && method === 'PATCH') {
      const notificationId = path.split('/')[4];
      const authHeader = request.headers.authorization;
      const userId = authHeader?.split('mock-jwt-token-')[1] || 'user-dev-1';

      mockStore.markNotificationRead(userId, notificationId);
      reply.code(200).send({ success: true });
      return;
    }

    // Knowledge base endpoints
    if (path === '/api/v1/knowledge' && method === 'GET') {
      const limit = parseInt(queryParams.get('limit') || '50');
      const category = queryParams.get('category');

      let entries = category
        ? mockStore.knowledgeEntries.filter((e: any) => e.category === category)
        : mockStore.knowledgeEntries;

      reply.code(200).send({
        success: true,
        data: entries.slice(0, limit),
        pagination: {
          total: entries.length,
          page: 1,
          limit,
        },
      });
      return;
    }

    if (path.match(/\/api\/v1\/knowledge\/[^/]+$/) && method === 'GET') {
      const entryId = path.split('/').pop();
      const entry = mockStore.getKnowledgeEntryById(entryId!);
      reply.code(200).send({
        success: true,
        data: entry,
      });
      return;
    }

    // Arcade endpoints
    if (path === '/api/v1/arcade/missions' && method === 'GET') {
      reply.code(200).send({
        success: true,
        data: mockStore.arcadeMissions,
      });
      return;
    }

    if (path === '/api/v1/arcade/leaderboard' && method === 'GET') {
      const leaderboard = mockStore.users
        .map((u: any) => ({
          userId: u.id,
          name: u.name,
          avatar: u.avatar,
          points: u.activityScore * 10,
          rank: 0,
        }))
        .sort((a: any, b: any) => b.points - a.points)
        .slice(0, 100)
        .map((entry: any, index: number) => ({ ...entry, rank: index + 1 }));

      reply.code(200).send({
        success: true,
        data: leaderboard,
      });
      return;
    }

    // ==================== THIRD-PARTY INTEGRATION DATA ====================
    // Forward to integrations service in mock mode
    
    if (path.startsWith('/api/v1/github/') || 
        path.startsWith('/api/v1/jira/') ||
        path.startsWith('/api/v1/slack/') ||
        path.startsWith('/api/v1/sentry/') ||
        path.startsWith('/api/v1/datadog/') ||
        path.startsWith('/api/v1/jenkins/') ||
        path.startsWith('/api/v1/newrelic/') ||
        path.startsWith('/api/v1/notion/') ||
        path.startsWith('/api/v1/gitlab/') ||
        path.startsWith('/api/v1/circleci/') ||
        path.startsWith('/api/v1/logs/') ||
        path.startsWith('/api/v1/ollama/')) {
      // In mock mode, these would normally hit the integrations service
      // For now, return a helpful message indicating the integrations service should be called
      console.log(`[MockInterceptor] Integration endpoint ${path} - would forward to integrations service`);
      return; // Let it pass through to integrations service
    }

    // If no mock route matched, continue to real service
    console.log(`[MockInterceptor] No mock handler for ${method} ${path}`);
  } catch (error) {
    console.error('[MockInterceptor] Error:', error);
    reply.code(500).send({
      success: false,
      error: 'Mock interceptor error',
    });
  }
}
