import { generateId, randomInt, randomChoice, randomDate } from './faker-utils';

export interface MockPipeline {
  id: string;
  name: string;
  repo: string;
  branch: string;
  provider: 'github' | 'gitlab' | 'jenkins' | 'circleci';
  status: 'running' | 'passed' | 'failed' | 'cancelled';
  duration: number;
  testsTotal: number;
  testsPassed: number;
  testsFailed: number;
  testsSkipped: number;
  healsCount: number;
  triggeredAt: string;
  completedAt?: string;
  triggeredBy: string;
  commit: {
    sha: string;
    message: string;
    author: string;
  };
}

const repos = ['web-app', 'api-service', 'mobile-app', 'admin-dashboard', 'payment-service', 'user-service'];
const branches = ['main', 'develop', 'staging', 'feature/auth', 'feature/payments', 'hotfix/bug-123'];
const providers: MockPipeline['provider'][] = ['github', 'gitlab', 'jenkins', 'circleci'];

function generateMockPipeline(index: number): MockPipeline {
  const testsTotal = randomInt(50, 500);
  const testsFailed = randomInt(0, Math.floor(testsTotal * 0.1)); // Max 10% failures
  const testsSkipped = randomInt(0, Math.floor(testsTotal * 0.05));
  const testsPassed = testsTotal - testsFailed - testsSkipped;
  
  const status: MockPipeline['status'] = testsFailed > 0 
    ? (randomChoice(['failed', 'failed', 'failed', 'passed'] as const)) // Sometimes pass despite failures
    : randomChoice(['passed', 'passed', 'passed', 'running'] as const);
  
  const triggeredAt = randomDate(30, 0);
  const duration = randomInt(60, 1800); // 1 min to 30 min
  const completedAt = status !== 'running' 
    ? new Date(triggeredAt.getTime() + duration * 1000)
    : undefined;
  
  return {
    id: generateId('pipeline'),
    name: `Build #${index + 1000}`,
    repo: `acme/${randomChoice(repos)}`,
    branch: randomChoice(branches),
    provider: randomChoice(providers),
    status,
    duration,
    testsTotal,
    testsPassed,
    testsFailed,
    testsSkipped,
    healsCount: randomInt(0, 10),
    triggeredAt: triggeredAt.toISOString(),
    completedAt: completedAt?.toISOString(),
    triggeredBy: generateId('user'),
    commit: {
      sha: Math.random().toString(36).substring(2, 10),
      message: randomChoice([
        'feat: add new feature',
        'fix: resolve bug in login',
        'test: add unit tests',
        'refactor: improve code quality',
        'chore: update dependencies'
      ]),
      author: randomChoice(['Alice Smith', 'Bob Johnson', 'Carol Williams'])
    },
  };
}

// Generate 30+ pipelines
export function generateMockPipelines(count = 30): MockPipeline[] {
  const pipelines: MockPipeline[] = [];
  for (let i = 0; i < count; i++) {
    pipelines.push(generateMockPipeline(i));
  }
  return pipelines.sort((a, b) => 
    new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
  );
}

export const mockPipelines = generateMockPipelines();
