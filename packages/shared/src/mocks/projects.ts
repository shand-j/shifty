import {
  generateId,
  generateProjectName,
  randomInt,
  randomChoice,
  randomDate,
  generateSlug
} from './faker-utils';

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  teamId: string;
  repository: string;
  testSuites: MockTestSuite[];
  qualityScore: number;
  testCoverage: number;
  flakyTestRatio: number;
  createdAt: string;
}

export interface MockTestSuite {
  id: string;
  name: string;
  projectId: string;
  tests: MockTest[];
  passingCount: number;
  failingCount: number;
  flakyCount: number;
}

export interface MockTest {
  id: string;
  name: string;
  suiteId: string;
  projectId: string;
  status: 'passing' | 'failing' | 'flaky' | 'skipped';
  framework: 'playwright' | 'cypress' | 'jest' | 'vitest';
  lastRun: string;
  duration: number;
}

const testFrameworks = ['playwright', 'cypress', 'jest', 'vitest'] as const;
const testTypes = ['Login', 'Navigation', 'Form submission', 'Data validation', 'API integration', 'UI rendering'];

function generateMockTest(suiteId: string, projectId: string, index: number): MockTest {
  // 70% passing, 20% flaky, 10% failing
  const rand = Math.random();
  let status: MockTest['status'];
  if (rand < 0.7) status = 'passing';
  else if (rand < 0.9) status = 'flaky';
  else status = 'failing';
  
  return {
    id: generateId('test'),
    name: `${randomChoice(testTypes)} test #${index + 1}`,
    suiteId,
    projectId,
    status,
    framework: randomChoice(testFrameworks),
    lastRun: randomDate(7, 0).toISOString(),
    duration: randomInt(100, 5000),
  };
}

function generateMockTestSuite(projectId: string, index: number): MockTestSuite {
  const id = generateId('suite');
  const testCount = randomInt(20, 100);
  const tests: MockTest[] = [];
  
  for (let i = 0; i < testCount; i++) {
    tests.push(generateMockTest(id, projectId, i));
  }
  
  const passingCount = tests.filter(t => t.status === 'passing').length;
  const failingCount = tests.filter(t => t.status === 'failing').length;
  const flakyCount = tests.filter(t => t.status === 'flaky').length;
  
  return {
    id,
    name: `Test Suite ${String.fromCharCode(65 + index)}`,
    projectId,
    tests,
    passingCount,
    failingCount,
    flakyCount,
  };
}

function generateMockProject(teamId: string, index: number): MockProject {
  const id = generateId('project');
  const name = generateProjectName();
  const suitesCount = randomInt(2, 8);
  const suites: MockTestSuite[] = [];
  
  for (let i = 0; i < suitesCount; i++) {
    suites.push(generateMockTestSuite(id, i));
  }
  
  const totalTests = suites.reduce((sum, s) => sum + s.tests.length, 0);
  const totalPassing = suites.reduce((sum, s) => sum + s.passingCount, 0);
  const totalFlaky = suites.reduce((sum, s) => sum + s.flakyCount, 0);
  
  return {
    id,
    name,
    slug: generateSlug(name),
    teamId,
    repository: `github.com/acme/${generateSlug(name)}`,
    testSuites: suites,
    qualityScore: randomInt(60, 98),
    testCoverage: randomInt(50, 95),
    flakyTestRatio: totalFlaky / totalTests,
    createdAt: randomDate(365, 30).toISOString(),
  };
}

// Generate 100+ projects with 5000+ total tests
export function generateMockProjects(teamIds: string[], targetProjects = 100): MockProject[] {
  const projects: MockProject[] = [];
  const projectsPerTeam = Math.ceil(targetProjects / teamIds.length);
  
  teamIds.forEach(teamId => {
    const teamProjects = randomInt(projectsPerTeam - 2, projectsPerTeam + 2);
    for (let i = 0; i < teamProjects; i++) {
      projects.push(generateMockProject(teamId, i));
    }
  });
  
  return projects;
}

export const mockProjects = generateMockProjects(['team-1', 'team-2', 'team-3']);

// Calculate total test count
export const totalTestCount = mockProjects.reduce(
  (sum, p) => sum + p.testSuites.reduce((s, suite) => s + suite.tests.length, 0),
  0
);

console.log(`Generated ${mockProjects.length} projects with ${totalTestCount} total tests`);
