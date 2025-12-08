// Enterprise-scale mock project data with test suites
export interface MockProject {
  id: string;
  name: string;
  slug: string;
  tenantId: string;
  teamId: string;
  repo: string;
  description: string;
  createdAt: string;
  testSuites: MockTestSuite[];
  qualityScore: number;
  testCoverage: number;
  flakyTestRatio: number;
  avgCycleTime: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface MockTestSuite {
  id: string;
  name: string;
  projectId: string;
  framework: 'playwright' | 'cypress' | 'jest' | 'vitest';
  testCount: number;
  passingCount: number;
  failingCount: number;
  flakyCount: number;
  skippedCount: number;
  avgDuration: number;
  lastRun: string;
  tests: MockTest[];
}

export interface MockTest {
  id: string;
  name: string;
  suiteId: string;
  projectId: string;
  status: 'passing' | 'failing' | 'flaky' | 'skipped';
  tags: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
  duration: number;
  retries: number;
}

const projectPrefixes = ['web', 'mobile', 'api', 'admin', 'customer', 'partner', 'internal'];
const projectTypes = ['app', 'service', 'platform', 'portal', 'dashboard', 'gateway', 'engine'];
const testSuiteTypes = ['auth', 'checkout', 'search', 'profile', 'dashboard', 'settings', 'admin', 'reports'];

function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateMockProjects(count: number = 100, teamIds: string[]): MockProject[] {
  const projects: MockProject[] = [];
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const prefix = randomElement(projectPrefixes);
    const type = randomElement(projectTypes);
    const name = `${prefix}-${type}`;
    const slug = name.toLowerCase();
    const createdAt = randomDate(oneYearAgo, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));

    const testCount = randomInt(30, 80);
    const passingCount = randomInt(Math.floor(testCount * 0.7), Math.floor(testCount * 0.95));
    const failingCount = randomInt(0, Math.floor(testCount * 0.1));
    const flakyCount = randomInt(0, Math.floor(testCount * 0.15));
    const skippedCount = testCount - passingCount - failingCount - flakyCount;

    const testSuites = generateTestSuitesForProject(`project-${i + 1}`, testCount);
    
    projects.push({
      id: `project-${i + 1}`,
      name,
      slug,
      tenantId: 'tenant-1',
      teamId: teamIds[i % teamIds.length] || 'team-1',
      repo: `acme/${slug}`,
      description: `${name.charAt(0).toUpperCase() + name.slice(1)} project for Acme Corp`,
      createdAt,
      testSuites,
      qualityScore: randomInt(60, 99),
      testCoverage: randomInt(45, 95),
      flakyTestRatio: randomInt(1, 15) / 100,
      avgCycleTime: randomInt(300, 3600), // seconds
      riskLevel: passingCount / testCount > 0.9 ? 'low' : 
                 passingCount / testCount > 0.8 ? 'medium' : 
                 passingCount / testCount > 0.7 ? 'high' : 'critical'
    });
  }

  return projects;
}

function generateTestSuitesForProject(projectId: string, targetTestCount: number): MockTestSuite[] {
  const suiteCount = randomInt(3, 8);
  const testsPerSuite = Math.floor(targetTestCount / suiteCount);
  const suites: MockTestSuite[] = [];
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < suiteCount; i++) {
    const suiteName = `${randomElement(testSuiteTypes)}-tests`;
    const testCount = testsPerSuite + randomInt(-5, 5);
    const passingCount = randomInt(Math.floor(testCount * 0.7), Math.floor(testCount * 0.95));
    const failingCount = randomInt(0, Math.floor(testCount * 0.1));
    const flakyCount = randomInt(0, Math.floor(testCount * 0.1));
    const skippedCount = Math.max(0, testCount - passingCount - failingCount - flakyCount);

    const tests = generateTestsForSuite(`suite-${projectId}-${i + 1}`, projectId, testCount);

    suites.push({
      id: `suite-${projectId}-${i + 1}`,
      name: suiteName,
      projectId,
      framework: randomElement(['playwright', 'cypress', 'jest', 'vitest'] as const),
      testCount,
      passingCount,
      failingCount,
      flakyCount,
      skippedCount,
      avgDuration: randomInt(1000, 30000),
      lastRun: randomDate(oneMonthAgo, now),
      tests
    });
  }

  return suites;
}

function generateTestsForSuite(suiteId: string, projectId: string, count: number): MockTest[] {
  const tests: MockTest[] = [];
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const statuses: Array<'passing' | 'failing' | 'flaky' | 'skipped'> = ['passing', 'failing', 'flaky', 'skipped'];
  const tagOptions = ['smoke', 'regression', 'critical', 'p0', 'p1', 'p2', 'ui', 'api', 'e2e', 'integration'];

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(oneMonthAgo, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    
    tests.push({
      id: `test-${suiteId}-${i + 1}`,
      name: `Test ${i + 1}: validates expected behavior`,
      suiteId,
      projectId,
      status: i < count * 0.85 ? 'passing' : randomElement(statuses),
      tags: Array.from({ length: randomInt(1, 3) }, () => randomElement(tagOptions)),
      owner: `user-${randomInt(1, 200)}`,
      createdAt,
      updatedAt: randomDate(new Date(createdAt), now),
      duration: randomInt(500, 15000),
      retries: randomInt(0, 3)
    });
  }

  return tests;
}
