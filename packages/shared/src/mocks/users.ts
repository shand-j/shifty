// Enterprise-scale mock user data with personas, skills, and activity
export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  avatar?: string;
  persona: 'po' | 'dev' | 'qa' | 'designer' | 'manager' | 'gtm';
  role: 'admin' | 'member' | 'viewer';
  tenantId: string;
  teamId: string;
  joinedAt: string;
  lastActive: string;
  xp: number;
  level: number;
  streak: number;
  stats: {
    testsWritten: number;
    testsHealed: number;
    sessionsCompleted: number;
    hitlContributions: number;
    prsReviewed: number;
    bugsPrevented: number;
    avgTestQuality: number;
    collaborationScore: number;
  };
  skills: Array<{
    skill: string;
    level: number;
    trend: 'improving' | 'stable' | 'declining';
    lastAssessed: string;
  }>;
  attentionFlags: Array<{
    type: 'struggling' | 'disengaged' | 'overloaded' | 'skill_gap' | 'mentorship_opportunity';
    severity: 'low' | 'medium' | 'high';
    reason: string;
    recommendation: string;
    detectedAt: string;
  }>;
}

const firstNames = [
  'Alex', 'Blake', 'Casey', 'Dana', 'Eden', 'Finn', 'Gray', 'Harper', 'Iris', 'Jules',
  'Kai', 'Logan', 'Morgan', 'Noah', 'Olivia', 'Parker', 'Quinn', 'Riley', 'Sage', 'Taylor',
  'Uma', 'Val', 'Wren', 'Xavi', 'Yuki', 'Zara', 'Avery', 'Brooklyn', 'Cameron', 'Drew',
  'Ellis', 'Finley', 'Haven', 'Indigo', 'Jordan', 'Kennedy', 'Lane', 'Marley', 'Nico', 'Payton'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const personas: Array<'po' | 'dev' | 'qa' | 'designer' | 'manager' | 'gtm'> = ['po', 'dev', 'qa', 'designer', 'manager', 'gtm'];
const roles: Array<'admin' | 'member' | 'viewer'> = ['admin', 'member', 'member', 'member', 'viewer'];

const skills = [
  'JavaScript', 'TypeScript', 'React', 'Playwright', 'Cypress', 'Jest', 'Testing Strategy',
  'CI/CD', 'Docker', 'Kubernetes', 'AWS', 'Accessibility', 'Performance Testing',
  'Security Testing', 'API Testing', 'Mobile Testing', 'Automation', 'Manual Testing',
  'SQL', 'Python', 'Java', 'Ruby', 'Go', 'Node.js', 'GraphQL', 'REST APIs'
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

export function generateMockUsers(count: number = 200, teamIds: string[]): MockUser[] {
  const users: MockUser[] = [];
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Create predefined demo users first
  const demoUsers: Array<{ email: string; firstName: string; lastName: string; persona: MockUser['persona']; role: MockUser['role'] }> = [
    { email: 'dev@shifty.ai', firstName: 'Dev', lastName: 'Developer', persona: 'dev', role: 'member' },
    { email: 'qa@shifty.ai', firstName: 'Quinn', lastName: 'QualityEngineer', persona: 'qa', role: 'member' },
    { email: 'po@shifty.ai', firstName: 'Pat', lastName: 'ProductOwner', persona: 'po', role: 'admin' },
    { email: 'designer@shifty.ai', firstName: 'Dana', lastName: 'Designer', persona: 'designer', role: 'member' },
    { email: 'manager@shifty.ai', firstName: 'Morgan', lastName: 'Manager', persona: 'manager', role: 'admin' },
    { email: 'gtm@shifty.ai', firstName: 'Gabe', lastName: 'GTMSpecialist', persona: 'gtm', role: 'member' },
  ];

  demoUsers.forEach((demo, idx) => {
    const joinedAt = randomDate(oneYearAgo, oneMonthAgo);
    const userSkills = Array.from({ length: randomInt(4, 8) }, () => ({
      skill: randomElement(skills),
      level: randomInt(1, 10),
      trend: randomElement(['improving', 'stable', 'declining'] as const),
      lastAssessed: randomDate(new Date(oneMonthAgo), now),
    }));

    users.push({
      id: `user-${idx + 1}`,
      email: demo.email,
      firstName: demo.firstName,
      lastName: demo.lastName,
      name: `${demo.firstName} ${demo.lastName}`,
      avatar: `/avatars/avatar-${(idx % 20) + 1}.png`,
      persona: demo.persona,
      role: demo.role,
      tenantId: 'tenant-1',
      teamId: teamIds[idx % teamIds.length] || 'team-1',
      joinedAt,
      lastActive: randomDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now),
      xp: randomInt(1000, 50000),
      level: randomInt(1, 25),
      streak: randomInt(0, 90),
      stats: {
        testsWritten: randomInt(10, 500),
        testsHealed: randomInt(5, 200),
        sessionsCompleted: randomInt(20, 300),
        hitlContributions: randomInt(50, 1000),
        prsReviewed: randomInt(10, 250),
        bugsPrevented: randomInt(5, 100),
        avgTestQuality: randomInt(60, 99),
        collaborationScore: randomInt(50, 100),
      },
      skills: userSkills,
      attentionFlags: [],
    });
  });

  // Generate remaining users
  for (let i = demoUsers.length; i < count; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const persona = randomElement(personas);
    const joinedAt = randomDate(oneYearAgo, oneMonthAgo);
    
    const userSkills = Array.from({ length: randomInt(3, 7) }, () => ({
      skill: randomElement(skills),
      level: randomInt(1, 10),
      trend: randomElement(['improving', 'stable', 'declining'] as const),
      lastAssessed: randomDate(new Date(oneMonthAgo), now),
    }));

    const attentionFlags: MockUser['attentionFlags'] = [];
    // 15% of users have attention flags
    if (Math.random() < 0.15) {
      const flagTypes: Array<'struggling' | 'disengaged' | 'overloaded' | 'skill_gap' | 'mentorship_opportunity'> = 
        ['struggling', 'disengaged', 'overloaded', 'skill_gap', 'mentorship_opportunity'];
      const flagType = randomElement(flagTypes);
      
      attentionFlags.push({
        type: flagType,
        severity: randomElement(['low', 'medium', 'high'] as const),
        reason: `Detected ${flagType} pattern based on activity metrics`,
        recommendation: `Consider 1:1 check-in or pairing session`,
        detectedAt: randomDate(new Date(oneMonthAgo), now),
      });
    }

    users.push({
      id: `user-${i + 1}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@acme.com`,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      avatar: `/avatars/avatar-${(i % 20) + 1}.png`,
      persona,
      role: randomElement(roles),
      tenantId: 'tenant-1',
      teamId: teamIds[i % teamIds.length] || 'team-1',
      joinedAt,
      lastActive: randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now),
      xp: randomInt(100, 50000),
      level: randomInt(1, 25),
      streak: randomInt(0, 90),
      stats: {
        testsWritten: randomInt(0, 500),
        testsHealed: randomInt(0, 200),
        sessionsCompleted: randomInt(0, 300),
        hitlContributions: randomInt(0, 1000),
        prsReviewed: randomInt(0, 250),
        bugsPrevented: randomInt(0, 100),
        avgTestQuality: randomInt(40, 99),
        collaborationScore: randomInt(30, 100),
      },
      skills: userSkills,
      attentionFlags,
    });
  }

  return users;
}

// Helper to get users by persona
export function getUsersByPersona(users: MockUser[], persona: MockUser['persona']): MockUser[] {
  return users.filter(u => u.persona === persona);
}

// Helper to get users by team
export function getUsersByTeam(users: MockUser[], teamId: string): MockUser[] {
  return users.filter(u => u.teamId === teamId);
}

// Helper to get user by email (for login)
export function getUserByEmail(users: MockUser[], email: string): MockUser | undefined {
  return users.filter(u => u.email === email);
}
