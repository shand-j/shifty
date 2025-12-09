// Enterprise-scale mock team data with maturity assessments and quality culture
export interface MockTeam {
  id: string;
  name: string;
  slug: string;
  managerId: string;
  tenantId: string;
  members: string[]; // user IDs
  projects: string[]; // project IDs
  createdAt: string;
  maturityLevel: 1 | 2 | 3 | 4 | 5;
  adoptionScore: number;
  qualityCulture: {
    overall: number;
    dimensions: {
      shiftLeftMindset: number;
      testOwnership: number;
      collaborationCulture: number;
      continuousImprovement: number;
      automationFirst: number;
      dataInformed: number;
    };
    trends: Array<{
      dimension: string;
      change: number;
      period: string;
    }>;
  };
  maturityAssessment: {
    level: 1 | 2 | 3 | 4 | 5;
    dimensions: Array<{
      name: string;
      score: number;
      maxScore: number;
      description: string;
      indicators: string[];
    }>;
    recommendations: string[];
    nextLevelRequirements: string[];
    assessedAt: string;
  };
}

const teamNames = [
  'Platform Engineering', 'Frontend Squad', 'Backend Services', 'Mobile Development',
  'Data Engineering', 'DevOps & SRE', 'Security Team', 'Product Analytics',
  'Design System', 'API Gateway', 'Search & Discovery', 'Payments',
  'User Authentication', 'Notification Service', 'Content Management', 'Marketplace',
  'AI/ML Research', 'Infrastructure', 'Quality Engineering', 'Release Engineering',
  'Customer Experience', 'Internal Tools', 'Partner Integrations', 'Growth Team',
  'Experimentation Platform', 'Observability', 'Developer Experience', 'Documentation',
  'Billing & Subscriptions', 'Admin Dashboard', 'Compliance & Governance', 'Support Tools',
  'Real-time Communication', 'File Storage', 'Video Processing', 'Recommendation Engine',
  'Fraud Detection', 'Internationalization', 'Accessibility', 'Performance',
  'Testing Infrastructure', 'Build Systems', 'Deployment Pipeline', 'Monitoring & Alerting',
  'Configuration Management', 'Service Mesh', 'Database Administration', 'Cache Layer',
  'Queue Management', 'Workflow Engine', 'Event Processing', 'Data Warehouse'
];

const maturityDimensionTemplates = [
  {
    name: 'Test Automation Coverage',
    description: 'Automated test coverage across unit, integration, and E2E levels',
    indicators: ['Unit test coverage', 'Integration test suite', 'E2E test scenarios', 'Visual regression tests']
  },
  {
    name: 'CI/CD Maturity',
    description: 'Continuous integration and deployment practices',
    indicators: ['Automated builds', 'Deployment automation', 'Rollback capability', 'Feature flags']
  },
  {
    name: 'Quality Culture',
    description: 'Team mindset and practices around quality',
    indicators: ['Shift-left testing', 'Test ownership', 'Code review rigor', 'Quality metrics tracking']
  },
  {
    name: 'Observability',
    description: 'Monitoring, logging, and telemetry practices',
    indicators: ['Structured logging', 'Distributed tracing', 'Metrics dashboards', 'Alerting']
  },
  {
    name: 'Documentation',
    description: 'Technical documentation quality and coverage',
    indicators: ['API documentation', 'Runbooks', 'Architecture diagrams', 'Onboarding guides']
  }
];

const recommendationTemplates = [
  'Increase unit test coverage to >80%',
  'Implement automated E2E test suite',
  'Add structured logging and tracing',
  'Create comprehensive runbooks',
  'Establish quality metrics dashboard',
  'Implement feature flag system',
  'Add visual regression testing',
  'Improve code review process',
  'Automate deployment pipeline',
  'Create incident response playbooks'
];

function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateMockTeams(count: number = 50): MockTeam[] {
  const teams: MockTeam[] = [];
  const now = new Date();
  const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const teamName = teamNames[i % teamNames.length] + (i >= teamNames.length ? ` ${Math.floor(i / teamNames.length) + 1}` : '');
    const slug = teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const maturityLevel = randomInt(1, 5) as 1 | 2 | 3 | 4 | 5;
    const createdAt = randomDate(twoYearsAgo, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));

    // Generate maturity dimensions
    const dimensions = maturityDimensionTemplates.map(template => ({
      name: template.name,
      score: randomInt(maturityLevel * 15, maturityLevel * 20),
      maxScore: 100,
      description: template.description,
      indicators: template.indicators
    }));

    // Generate recommendations based on maturity level
    const recommendations = maturityLevel < 5 
      ? Array.from({ length: randomInt(2, 5) }, () => randomElement(recommendationTemplates))
      : ['Maintain current excellence', 'Share best practices with other teams'];

    const nextLevelRequirements = maturityLevel < 5 
      ? [
          `Achieve ${(maturityLevel + 1) * 20}% test coverage`,
          'Implement all recommended practices',
          'Demonstrate consistent quality metrics for 3 months'
        ]
      : ['Maintain Level 5 maturity'];

    // Quality culture scores
    const baseCultureScore = maturityLevel * 15 + randomInt(0, 15);
    
    teams.push({
      id: `team-${i + 1}`,
      name: teamName,
      slug,
      managerId: `user-${randomInt(1, 200)}`,
      tenantId: 'tenant-1',
      members: [], // Will be populated by user generation
      projects: [], // Will be populated by project generation
      createdAt,
      maturityLevel,
      adoptionScore: randomInt(maturityLevel * 15, maturityLevel * 20),
      qualityCulture: {
        overall: baseCultureScore,
        dimensions: {
          shiftLeftMindset: randomInt(baseCultureScore - 10, baseCultureScore + 10),
          testOwnership: randomInt(baseCultureScore - 10, baseCultureScore + 10),
          collaborationCulture: randomInt(baseCultureScore - 10, baseCultureScore + 10),
          continuousImprovement: randomInt(baseCultureScore - 10, baseCultureScore + 10),
          automationFirst: randomInt(baseCultureScore - 10, baseCultureScore + 10),
          dataInformed: randomInt(baseCultureScore - 10, baseCultureScore + 10),
        },
        trends: [
          { dimension: 'shiftLeftMindset', change: randomInt(-5, 10), period: '30d' },
          { dimension: 'testOwnership', change: randomInt(-5, 10), period: '30d' },
          { dimension: 'collaborationCulture', change: randomInt(-5, 10), period: '30d' },
        ]
      },
      maturityAssessment: {
        level: maturityLevel,
        dimensions,
        recommendations,
        nextLevelRequirements,
        assessedAt: randomDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), now)
      }
    });
  }

  return teams;
}

// Helper to populate team members
export function assignUsersToTeams(teams: MockTeam[], userIds: string[]): void {
  userIds.forEach(userId => {
    const teamIndex = randomInt(0, teams.length - 1);
    teams[teamIndex].members.push(userId);
  });
}

// Helper to populate team projects
export function assignProjectsToTeams(teams: MockTeam[], projectIds: string[]): void {
  projectIds.forEach(projectId => {
    const teamIndex = randomInt(0, teams.length - 1);
    teams[teamIndex].projects.push(projectId);
  });
}
