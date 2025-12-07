// Enterprise-scale mock CI/CD pipeline data
export interface MockPipeline {
  id: string;
  repo: string;
  branch: string;
  status: 'running' | 'passed' | 'failed' | 'cancelled';
  provider: 'github' | 'gitlab' | 'circle-ci' | 'jenkins';
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
  stages: MockPipelineStage[];
}

export interface MockPipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  startedAt?: string;
  completedAt?: string;
}

const providers: Array<'github' | 'gitlab' | 'circle-ci' | 'jenkins'> = ['github', 'github', 'github', 'gitlab', 'circle-ci'];
const branches = ['main', 'develop', 'staging', 'feature/auth', 'feature/checkout', 'hotfix/critical-bug'];
const stageNames = ['build', 'lint', 'unit-tests', 'integration-tests', 'e2e-tests', 'deploy'];

function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateMockPipelines(count: number = 200, projectRepos: string[]): MockPipeline[] {
  const pipelines: MockPipeline[] = [];
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const triggeredAt = randomDate(oneWeekAgo, now);
    const duration = randomInt(60, 1800); // 1-30 minutes
    const completedAt = new Date(new Date(triggeredAt).getTime() + duration * 1000).toISOString();
    
    const testsTotal = randomInt(50, 500);
    const statusRand = Math.random();
    let status: 'running' | 'passed' | 'failed' | 'cancelled';
    let testsPassed: number;
    let testsFailed: number;

    if (i < 5) {
      status = 'running';
      testsPassed = 0;
      testsFailed = 0;
    } else if (statusRand < 0.75) {
      status = 'passed';
      testsPassed = testsTotal;
      testsFailed = 0;
    } else if (statusRand < 0.95) {
      status = 'failed';
      testsPassed = randomInt(Math.floor(testsTotal * 0.6), Math.floor(testsTotal * 0.9));
      testsFailed = randomInt(1, Math.floor(testsTotal * 0.2));
    } else {
      status = 'cancelled';
      testsPassed = 0;
      testsFailed = 0;
    }

    const testsSkipped = testsTotal - testsPassed - testsFailed;

    const stages = generatePipelineStages(status, triggeredAt, duration);

    pipelines.push({
      id: `pipeline-${i + 1}`,
      repo: randomElement(projectRepos),
      branch: randomElement(branches),
      status,
      provider: randomElement(providers),
      duration,
      testsTotal,
      testsPassed,
      testsFailed,
      testsSkipped,
      healsCount: randomInt(0, 10),
      triggeredAt,
      completedAt: status !== 'running' ? completedAt : undefined,
      triggeredBy: `user-${randomInt(1, 200)}`,
      commit: {
        sha: Math.random().toString(36).substring(2, 10),
        message: randomElement([
          'feat: add new feature',
          'fix: resolve critical bug',
          'chore: update dependencies',
          'test: add test coverage',
          'refactor: improve code quality',
          'docs: update documentation'
        ]),
        author: `user-${randomInt(1, 200)}`
      },
      stages
    });
  }

  return pipelines.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
}

function generatePipelineStages(
  pipelineStatus: string,
  pipelineStart: string,
  totalDuration: number
): MockPipelineStage[] {
  const stages: MockPipelineStage[] = [];
  let cumulativeDuration = 0;

  stageNames.forEach((name, index) => {
    const stageDuration = Math.floor(totalDuration / stageNames.length) + randomInt(-30, 30);
    const startedAt = new Date(new Date(pipelineStart).getTime() + cumulativeDuration * 1000).toISOString();
    const completedAt = new Date(new Date(startedAt).getTime() + stageDuration * 1000).toISOString();

    let status: MockPipelineStage['status'];
    if (pipelineStatus === 'running') {
      status = index < 2 ? 'passed' : index === 2 ? 'running' : 'pending';
    } else if (pipelineStatus === 'failed') {
      status = index < stageNames.length - 1 ? 'passed' : 'failed';
    } else if (pipelineStatus === 'cancelled') {
      status = index < 2 ? 'passed' : 'skipped';
    } else {
      status = 'passed';
    }

    stages.push({
      id: `stage-${index + 1}`,
      name,
      status,
      duration: stageDuration,
      startedAt: status !== 'pending' ? startedAt : undefined,
      completedAt: status === 'passed' || status === 'failed' ? completedAt : undefined
    });

    cumulativeDuration += stageDuration;
  });

  return stages;
}
