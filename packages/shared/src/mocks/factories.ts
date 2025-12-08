import { faker } from '@faker-js/faker';

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  avatar: string;
  persona: 'developer' | 'qa' | 'product' | 'manager';
  role: 'admin' | 'member' | 'viewer';
  teamId: string;
  createdAt: string;
  lastActive: string;
  activityScore: number;
  testsCreated: number;
  testsReviewed: number;
  healingsApproved: number;
}

export interface MockTeam {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  testMaturityScore: number;
  automationCoverage: number;
  avgHealingTime: number;
  createdAt: string;
  department: string;
}

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  description: string;
  teamId: string;
  repository: string;
  framework: 'playwright' | 'cypress' | 'selenium' | 'jest';
  testCount: number;
  passingTests: number;
  failingTests: number;
  flakyTests: number;
  coverage: number;
  lastRun: string;
  status: 'active' | 'maintenance' | 'archived';
  createdAt: string;
}

export interface MockTest {
  id: string;
  name: string;
  projectId: string;
  suite: string;
  filePath: string;
  status: 'passing' | 'failing' | 'flaky' | 'skipped';
  duration: number;
  lastRun: string;
  runCount: number;
  passRate: number;
  healingCount: number;
  tags: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  createdBy: string;
  createdAt: string;
}

export interface MockHealingSuggestion {
  id: string;
  testId: string;
  testName: string;
  projectId: string;
  selectorType: 'css' | 'xpath' | 'testid' | 'text';
  oldSelector: string;
  newSelector: string;
  confidence: number;
  strategy: 'data-testid-recovery' | 'text-content-matching' | 'css-hierarchy-analysis' | 'ai-powered-analysis';
  reason: string;
  domSnapshot: string;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface MockPipeline {
  id: string;
  name: string;
  projectId: string;
  provider: 'github' | 'gitlab' | 'jenkins' | 'circleci' | 'azure-devops';
  branch: string;
  status: 'success' | 'failure' | 'running' | 'pending';
  duration: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  healingsApplied: number;
  triggeredBy: string;
  commitHash: string;
  commitMessage: string;
  startedAt: string;
  finishedAt?: string;
}

export interface MockKnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: 'best-practices' | 'troubleshooting' | 'selector-patterns' | 'framework-tips' | 'ci-cd';
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockArcadeMission {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  points: number;
  category: 'test-writing' | 'healing' | 'optimization' | 'ci-cd' | 'collaboration';
  requirements: string[];
  completedBy: string[];
  totalParticipants: number;
  timeEstimate: string;
  createdAt: string;
}

export interface MockNotification {
  id: string;
  type: 'ci_failure' | 'healing_required' | 'roi_alert' | 'team_mention' | 'mission_complete' | 'system_update';
  title: string;
  message: string;
  read: boolean;
  userId: string;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface MockROIMetric {
  date: string;
  timeSaved: number;
  costSaved: number;
  testsAutomated: number;
  manualTestsEliminated: number;
  defectsCaught: number;
  healingsApplied: number;
}

export interface MockDORAMetric {
  date: string;
  deploymentFrequency: number;
  leadTimeForChanges: number;
  changeFailureRate: number;
  timeToRestore: number;
}

// Persona-specific mock users
export const MOCK_PERSONAS: MockUser[] = [
  {
    id: 'user-dev-1',
    email: 'dev@shifty.ai',
    firstName: 'Alex',
    lastName: 'Developer',
    name: 'Alex Developer',
    avatar: '/avatars/dev.png',
    persona: 'developer',
    role: 'member',
    teamId: 'team-eng-1',
    createdAt: new Date('2024-01-15').toISOString(),
    lastActive: new Date().toISOString(),
    activityScore: 92,
    testsCreated: 156,
    testsReviewed: 45,
    healingsApproved: 89,
  },
  {
    id: 'user-qa-1',
    email: 'qa@shifty.ai',
    firstName: 'Jordan',
    lastName: 'QA',
    name: 'Jordan QA',
    avatar: '/avatars/qa.png',
    persona: 'qa',
    role: 'admin',
    teamId: 'team-qa-1',
    createdAt: new Date('2024-01-10').toISOString(),
    lastActive: new Date().toISOString(),
    activityScore: 98,
    testsCreated: 342,
    testsReviewed: 567,
    healingsApproved: 234,
  },
  {
    id: 'user-po-1',
    email: 'po@shifty.ai',
    firstName: 'Morgan',
    lastName: 'Product',
    name: 'Morgan Product',
    avatar: '/avatars/po.png',
    persona: 'product',
    role: 'admin',
    teamId: 'team-product-1',
    createdAt: new Date('2024-01-05').toISOString(),
    lastActive: new Date().toISOString(),
    activityScore: 85,
    testsCreated: 23,
    testsReviewed: 145,
    healingsApproved: 12,
  },
  {
    id: 'user-mgr-1',
    email: 'manager@shifty.ai',
    firstName: 'Taylor',
    lastName: 'Manager',
    name: 'Taylor Manager',
    avatar: '/avatars/manager.png',
    persona: 'manager',
    role: 'admin',
    teamId: 'team-eng-1',
    createdAt: new Date('2024-01-01').toISOString(),
    lastActive: new Date().toISOString(),
    activityScore: 78,
    testsCreated: 5,
    testsReviewed: 89,
    healingsApproved: 67,
  },
];

export function generateMockUsers(count: number = 200): MockUser[] {
  const users: MockUser[] = [...MOCK_PERSONAS];
  const personas: MockUser['persona'][] = ['developer', 'qa', 'product', 'manager'];
  const roles: MockUser['role'][] = ['admin', 'member', 'viewer'];
  
  for (let i = 0; i < count - MOCK_PERSONAS.length; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    users.push({
      id: `user-${i + 5}`,
      email: faker.internet.email({ firstName, lastName }),
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      avatar: faker.image.avatar(),
      persona: faker.helpers.arrayElement(personas),
      role: faker.helpers.arrayElement(roles),
      teamId: `team-${faker.number.int({ min: 1, max: 50 })}`,
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      lastActive: faker.date.recent({ days: 30 }).toISOString(),
      activityScore: faker.number.int({ min: 40, max: 100 }),
      testsCreated: faker.number.int({ min: 0, max: 500 }),
      testsReviewed: faker.number.int({ min: 0, max: 800 }),
      healingsApproved: faker.number.int({ min: 0, max: 300 }),
    });
  }
  
  return users;
}

export function generateMockTeams(count: number = 50): MockTeam[] {
  const teams: MockTeam[] = [];
  const departments = ['Engineering', 'Product', 'QA', 'Design', 'Data', 'Infrastructure'];
  
  for (let i = 0; i < count; i++) {
    const name = `${faker.helpers.arrayElement(departments)} - ${faker.commerce.department()}`;
    teams.push({
      id: `team-${i + 1}`,
      name,
      slug: faker.helpers.slugify(name).toLowerCase(),
      description: faker.company.catchPhrase(),
      memberCount: faker.number.int({ min: 3, max: 25 }),
      testMaturityScore: faker.number.int({ min: 45, max: 98 }),
      automationCoverage: faker.number.int({ min: 30, max: 95 }),
      avgHealingTime: faker.number.int({ min: 30, max: 600 }),
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      department: faker.helpers.arrayElement(departments),
    });
  }
  
  return teams;
}

export function generateMockProjects(count: number = 100, teams: MockTeam[]): MockProject[] {
  const projects: MockProject[] = [];
  const frameworks: MockProject['framework'][] = ['playwright', 'cypress', 'selenium', 'jest'];
  const statuses: MockProject['status'][] = ['active', 'maintenance', 'archived'];
  
  for (let i = 0; i < count; i++) {
    const name = faker.commerce.productName();
    const testCount = faker.number.int({ min: 10, max: 500 });
    const passingTests = faker.number.int({ min: Math.floor(testCount * 0.5), max: testCount });
    const failingTests = faker.number.int({ min: 0, max: testCount - passingTests });
    const flakyTests = testCount - passingTests - failingTests;
    
    projects.push({
      id: `project-${i + 1}`,
      name,
      slug: faker.helpers.slugify(name).toLowerCase(),
      description: faker.company.catchPhrase(),
      teamId: faker.helpers.arrayElement(teams).id,
      repository: `https://github.com/acme-corp/${faker.helpers.slugify(name)}`,
      framework: faker.helpers.arrayElement(frameworks),
      testCount,
      passingTests,
      failingTests,
      flakyTests,
      coverage: faker.number.int({ min: 40, max: 95 }),
      lastRun: faker.date.recent({ days: 7 }).toISOString(),
      status: faker.helpers.arrayElement(statuses),
      createdAt: faker.date.past({ years: 1 }).toISOString(),
    });
  }
  
  return projects;
}

export function generateMockTests(count: number = 5000, projects: MockProject[], users: MockUser[]): MockTest[] {
  const tests: MockTest[] = [];
  const statuses: MockTest['status'][] = ['passing', 'failing', 'flaky', 'skipped'];
  const priorities: MockTest['priority'][] = ['critical', 'high', 'medium', 'low'];
  const tags = ['smoke', 'regression', 'integration', 'e2e', 'api', 'ui', 'performance', 'security'];
  
  for (let i = 0; i < count; i++) {
    const suite = faker.helpers.arrayElement(['auth', 'checkout', 'user-profile', 'dashboard', 'settings', 'reports']);
    const testName = faker.helpers.arrayElement([
      'should load successfully',
      'should validate form inputs',
      'should submit data correctly',
      'should handle errors gracefully',
      'should display correct data',
      'should navigate properly',
    ]);
    
    tests.push({
      id: `test-${i + 1}`,
      name: `${suite}: ${testName}`,
      projectId: faker.helpers.arrayElement(projects).id,
      suite,
      filePath: `tests/${suite}/${faker.system.fileName()}.spec.ts`,
      status: faker.helpers.arrayElement(statuses),
      duration: faker.number.int({ min: 100, max: 30000 }),
      lastRun: faker.date.recent({ days: 14 }).toISOString(),
      runCount: faker.number.int({ min: 10, max: 500 }),
      passRate: faker.number.float({ min: 0.5, max: 1, fractionDigits: 2 }),
      healingCount: faker.number.int({ min: 0, max: 20 }),
      tags: faker.helpers.arrayElements(tags, { min: 1, max: 4 }),
      priority: faker.helpers.arrayElement(priorities),
      createdBy: faker.helpers.arrayElement(users).id,
      createdAt: faker.date.past({ years: 1 }).toISOString(),
    });
  }
  
  return tests;
}

export function generateMockHealingSuggestions(
  count: number = 500,
  tests: MockTest[],
  projects: MockProject[],
  users: MockUser[]
): MockHealingSuggestion[] {
  const suggestions: MockHealingSuggestion[] = [];
  const strategies: MockHealingSuggestion['strategy'][] = [
    'data-testid-recovery',
    'text-content-matching',
    'css-hierarchy-analysis',
    'ai-powered-analysis',
  ];
  const statuses: MockHealingSuggestion['status'][] = ['pending', 'approved', 'rejected', 'applied'];
  
  for (let i = 0; i < count; i++) {
    const test = faker.helpers.arrayElement(tests);
    const isReviewed = faker.datatype.boolean();
    const status = faker.helpers.arrayElement(statuses);
    
    suggestions.push({
      id: `healing-${i + 1}`,
      testId: test.id,
      testName: test.name,
      projectId: test.projectId,
      selectorType: faker.helpers.arrayElement(['css', 'xpath', 'testid', 'text']),
      oldSelector: `#old-selector-${i}`,
      newSelector: `[data-testid="new-selector-${i}"]`,
      confidence: faker.number.float({ min: 0.6, max: 0.99, fractionDigits: 2 }),
      strategy: faker.helpers.arrayElement(strategies),
      reason: faker.lorem.sentence(),
      domSnapshot: `<div class="container"><button id="old-selector-${i}">Click me</button></div>`,
      status,
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
      reviewedBy: isReviewed ? faker.helpers.arrayElement(users).id : undefined,
      reviewedAt: isReviewed ? faker.date.recent({ days: 15 }).toISOString() : undefined,
    });
  }
  
  return suggestions;
}

export function generateMockPipelines(
  count: number = 30,
  projects: MockProject[],
  users: MockUser[]
): MockPipeline[] {
  const pipelines: MockPipeline[] = [];
  const providers: MockPipeline['provider'][] = ['github', 'gitlab', 'jenkins', 'circleci', 'azure-devops'];
  const statuses: MockPipeline['status'][] = ['success', 'failure', 'running', 'pending'];
  const branches = ['main', 'develop', 'feature/new-ui', 'bugfix/login-issue', 'release/v2.1'];
  
  for (let i = 0; i < count; i++) {
    const testsRun = faker.number.int({ min: 50, max: 500 });
    const testsPassed = faker.number.int({ min: Math.floor(testsRun * 0.7), max: testsRun });
    const testsFailed = testsRun - testsPassed;
    const startedAt = faker.date.recent({ days: 7 });
    const duration = faker.number.int({ min: 60000, max: 1800000 });
    
    pipelines.push({
      id: `pipeline-${i + 1}`,
      name: `Build #${faker.number.int({ min: 1000, max: 9999 })}`,
      projectId: faker.helpers.arrayElement(projects).id,
      provider: faker.helpers.arrayElement(providers),
      branch: faker.helpers.arrayElement(branches),
      status: faker.helpers.arrayElement(statuses),
      duration,
      testsRun,
      testsPassed,
      testsFailed,
      healingsApplied: faker.number.int({ min: 0, max: 15 }),
      triggeredBy: faker.helpers.arrayElement(users).id,
      commitHash: faker.git.commitSha(),
      commitMessage: faker.git.commitMessage(),
      startedAt: startedAt.toISOString(),
      finishedAt: new Date(startedAt.getTime() + duration).toISOString(),
    });
  }
  
  return pipelines;
}

export function generateMockKnowledgeEntries(count: number = 1000, users: MockUser[]): MockKnowledgeEntry[] {
  const entries: MockKnowledgeEntry[] = [];
  const categories: MockKnowledgeEntry['category'][] = [
    'best-practices',
    'troubleshooting',
    'selector-patterns',
    'framework-tips',
    'ci-cd',
  ];
  const tags = [
    'playwright',
    'selectors',
    'debugging',
    'performance',
    'flaky-tests',
    'ci-cd',
    'healing',
    'best-practices',
  ];
  
  for (let i = 0; i < count; i++) {
    entries.push({
      id: `knowledge-${i + 1}`,
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      content: faker.lorem.paragraphs(3),
      category: faker.helpers.arrayElement(categories),
      tags: faker.helpers.arrayElements(tags, { min: 2, max: 5 }),
      views: faker.number.int({ min: 0, max: 1000 }),
      helpful: faker.number.int({ min: 0, max: 200 }),
      notHelpful: faker.number.int({ min: 0, max: 50 }),
      createdBy: faker.helpers.arrayElement(users).id,
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      updatedAt: faker.date.recent({ days: 90 }).toISOString(),
    });
  }
  
  return entries;
}

export function generateMockArcadeMissions(count: number = 50): MockArcadeMission[] {
  const missions: MockArcadeMission[] = [];
  const difficulties: MockArcadeMission['difficulty'][] = ['beginner', 'intermediate', 'advanced', 'expert'];
  const categories: MockArcadeMission['category'][] = [
    'test-writing',
    'healing',
    'optimization',
    'ci-cd',
    'collaboration',
  ];
  
  for (let i = 0; i < count; i++) {
    const difficulty = faker.helpers.arrayElement(difficulties);
    const points = difficulty === 'beginner' ? 100 : difficulty === 'intermediate' ? 250 : difficulty === 'advanced' ? 500 : 1000;
    
    missions.push({
      id: `mission-${i + 1}`,
      title: faker.lorem.sentence({ min: 3, max: 6 }),
      description: faker.lorem.paragraph(),
      difficulty,
      points,
      category: faker.helpers.arrayElement(categories),
      requirements: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => faker.lorem.sentence()),
      completedBy: Array.from({ length: faker.number.int({ min: 0, max: 50 }) }, (_, j) => `user-${j + 1}`),
      totalParticipants: faker.number.int({ min: 10, max: 200 }),
      timeEstimate: `${faker.number.int({ min: 15, max: 120 })} minutes`,
      createdAt: faker.date.past({ years: 1 }).toISOString(),
    });
  }
  
  return missions;
}

export function generateMockROIMetrics(months: number = 12): MockROIMetric[] {
  const metrics: MockROIMetric[] = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  for (let i = 0; i < months; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    
    metrics.push({
      date: date.toISOString().split('T')[0],
      timeSaved: faker.number.int({ min: 80, max: 200 }),
      costSaved: faker.number.int({ min: 5000, max: 25000 }),
      testsAutomated: faker.number.int({ min: 50, max: 150 }),
      manualTestsEliminated: faker.number.int({ min: 30, max: 100 }),
      defectsCaught: faker.number.int({ min: 20, max: 80 }),
      healingsApplied: faker.number.int({ min: 15, max: 60 }),
    });
  }
  
  return metrics;
}

export function generateMockDORAMetrics(days: number = 90): MockDORAMetric[] {
  const metrics: MockDORAMetric[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    metrics.push({
      date: date.toISOString().split('T')[0],
      deploymentFrequency: faker.number.int({ min: 1, max: 10 }),
      leadTimeForChanges: faker.number.int({ min: 30, max: 240 }),
      changeFailureRate: faker.number.float({ min: 0, max: 0.15, fractionDigits: 3 }),
      timeToRestore: faker.number.int({ min: 15, max: 180 }),
    });
  }
  
  return metrics;
}
