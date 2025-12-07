import { FastifyRequest, FastifyReply } from 'fastify';

// Mock data store - will be initialized on startup
let mockDataStore: any = null;

// Simulated latency for realistic feel
function simulateLatency(): Promise<void> {
  const delay = 50 + Math.random() * 250; // 50-300ms
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Initialize mock data
export function initializeMockData() {
  try {
    const mocks = require('@shifty/shared/dist/mocks');
    mockDataStore = mocks.initializeMockDataStore();
    console.log('✅ Mock data store initialized');
    console.log(`   - Users: ${mockDataStore.users.length}`);
    console.log(`   - Teams: ${mockDataStore.teams.length}`);
    console.log(`   - Projects: ${mockDataStore.projects.length}`);
    console.log(`   - Tests: ${mocks.totalTestCount || 'N/A'}`);
  } catch (error) {
    console.error('Failed to initialize mock data:', error);
    // Fallback to minimal mock data
    mockDataStore = {
      users: [
        {
          id: 'user-1',
          name: 'Dev User',
          email: 'dev@shifty.ai',
          persona: 'dev',
          role: 'admin',
        },
        {
          id: 'user-2',
          name: 'QA User',
          email: 'qa@shifty.ai',
          persona: 'qa',
          role: 'admin',
        },
        {
          id: 'user-3',
          name: 'Product Owner',
          email: 'po@shifty.ai',
          persona: 'po',
          role: 'admin',
        },
      ],
      teams: [],
      projects: [],
      healingItems: [],
      pipelines: [],
      roiMetrics: null,
      doraMetrics: null,
    };
  }
}

// Mock request handler
export async function mockInterceptor(request: FastifyRequest, reply: FastifyReply): Promise<boolean> {
  const isMockMode = process.env.MOCK_MODE === 'true' || request.headers['x-mock-mode'] === 'true';
  
  if (!isMockMode) {
    return false; // Not in mock mode, continue to real backend
  }
  
  if (!mockDataStore) {
    initializeMockData();
  }
  
  await simulateLatency();
  
  const { method, url } = request;
  const path = url.split('?')[0];
  
  // Authentication endpoints
  if (method === 'POST' && path === '/api/v1/auth/login') {
    const { email, password } = request.body as { email: string; password: string };
    
    // Mock authentication - accept any @shifty.ai email with password 'test' or 'password'
    if (email.endsWith('@shifty.ai') && (password === 'test' || password === 'password')) {
      const user = mockDataStore.users.find((u: any) => u.email === email) || {
        id: 'user-mock',
        name: email.split('@')[0].replace('.', ' '),
        email,
        persona: 'dev',
        role: 'admin',
      };
      
      reply.code(200).send({
        token: `mock-jwt-token-${Date.now()}`,
        refreshToken: `mock-refresh-token-${Date.now()}`,
        user,
      });
      return true;
    }
    
    reply.code(401).send({ message: 'Invalid credentials' });
    return true;
  }
  
  if (method === 'POST' && path === '/api/v1/auth/logout') {
    reply.code(204).send();
    return true;
  }
  
  if (method === 'GET' && path === '/api/v1/auth/me') {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      reply.code(401).send({ message: 'No authorization header' });
      return true;
    }
    
    // Return first admin user or create a mock one
    const user = mockDataStore.users.find((u: any) => u.role === 'admin') || {
      id: 'user-mock',
      name: 'Test User',
      email: 'test@shifty.ai',
      persona: 'dev',
      role: 'admin',
    };
    
    reply.code(200).send(user);
    return true;
  }
  
  // Tenant endpoints
  if (method === 'GET' && path === '/api/v1/tenants/current') {
    reply.code(200).send({
      id: 'tenant-1',
      name: 'Acme Corp',
      slug: 'acme',
    });
    return true;
  }
  
  if (method === 'GET' && path === '/api/v1/tenants') {
    reply.code(200).send([
      { id: 'tenant-1', name: 'Acme Corp', slug: 'acme' },
    ]);
    return true;
  }
  
  // Notifications
  if (method === 'GET' && path === '/api/v1/notifications') {
    reply.code(200).send([
      {
        id: '1',
        type: 'ci_failure',
        title: 'Pipeline Failed',
        message: 'main branch build failed on acme/web-app',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/pipelines/1',
      },
      {
        id: '2',
        type: 'healing_required',
        title: 'Selector Healing Required',
        message: '3 selectors need review (confidence < 70%)',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/healing',
      },
    ]);
    return true;
  }
  
  if (method === 'PATCH' && path.startsWith('/api/v1/notifications/')) {
    reply.code(204).send();
    return true;
  }
  
  // Insights endpoints
  if (method === 'GET' && path === '/api/v1/insights/developer') {
    reply.code(200).send({
      testsWritten: 42,
      testsHealed: 15,
      activePRs: 3,
      codeReviews: 8,
      pipelines: mockDataStore.pipelines?.slice(0, 5) || [],
    });
    return true;
  }
  
  if (method === 'GET' && path === '/api/v1/insights/qa') {
    reply.code(200).send({
      testSuites: 25,
      testCoverage: 78,
      flakyTests: 12,
      healingQueue: mockDataStore.healingItems?.slice(0, 10) || [],
      sessions: mockDataStore.sessions?.slice(0, 5) || [],
    });
    return true;
  }
  
  if (method === 'GET' && path === '/api/v1/insights/po') {
    reply.code(200).send({
      features: 18,
      qualityScore: 87,
      roi: mockDataStore.roiMetrics || {},
      incidents: [],
    });
    return true;
  }
  
  if (method === 'GET' && path === '/api/v1/insights/manager') {
    reply.code(200).send({
      teams: mockDataStore.teams?.slice(0, 10) || [],
      dora: mockDataStore.doraMetrics || {},
      roi: mockDataStore.roiMetrics || {},
      adoption: { overall: 75 },
    });
    return true;
  }
  
  // Projects endpoints
  if (method === 'GET' && path === '/api/v1/projects') {
    reply.code(200).send(mockDataStore.projects || []);
    return true;
  }
  
  // Healing endpoints
  if (method === 'GET' && path === '/api/v1/healing') {
    reply.code(200).send(mockDataStore.healingItems || []);
    return true;
  }
  
  // Pipelines endpoints
  if (method === 'GET' && path === '/api/v1/pipelines') {
    reply.code(200).send(mockDataStore.pipelines || []);
    return true;
  }
  
  // Teams endpoints
  if (method === 'GET' && path === '/api/v1/teams') {
    reply.code(200).send(mockDataStore.teams || []);
    return true;
  }
  
  // Users endpoints
  if (method === 'GET' && path === '/api/v1/users') {
    reply.code(200).send(mockDataStore.users || []);
    return true;
  }
  
  // ROI endpoints
  if (method === 'GET' && path === '/api/v1/roi/insights') {
    reply.code(200).send(mockDataStore.roiMetrics || {});
    return true;
  }
  
  // Default: not handled by mock
  return false;
}

// Export for use in API Gateway
export default mockInterceptor;
