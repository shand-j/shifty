import {
  generateId,
  generateName,
  generateEmail,
  randomInt,
  randomChoice,
  randomBoolean,
  randomDate,
  generateSlug
} from './faker-utils';

export type Persona = 'po' | 'dev' | 'qa' | 'designer' | 'manager' | 'gtm';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  persona: Persona;
  role: 'admin' | 'member' | 'viewer';
  teamId: string;
  xp: number;
  level: number;
  streak: number;
  joinedAt: string;
  lastActive: string;
  skills: Array<{
    skill: string;
    level: number;
    trend: 'improving' | 'stable' | 'declining';
    lastAssessed: string;
  }>;
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
  attentionFlags: Array<{
    type: 'struggling' | 'disengaged' | 'overloaded' | 'skill_gap' | 'mentorship_opportunity';
    severity: 'low' | 'medium' | 'high';
    reason: string;
    recommendation: string;
    detectedAt: string;
  }>;
}

const personas: Persona[] = ['dev', 'qa', 'po', 'designer', 'manager', 'gtm'];
const roles: Array<'admin' | 'member' | 'viewer'> = ['admin', 'member', 'member', 'member', 'viewer'];
const skills = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Testing', 'Automation',
  'CI/CD', 'Docker', 'Kubernetes', 'AWS', 'React', 'Node.js', 'Playwright',
  'Jest', 'API Testing', 'Performance Testing', 'Security Testing', 'Accessibility'
];

function generateMockUser(teamId: string, index: number): MockUser {
  const name = generateName();
  const email = generateEmail(name);
  const persona = randomChoice(personas);
  const role = randomChoice(roles);
  const joinedDate = randomDate(730, 30); // 2 years to 1 month ago
  const lastActive = randomDate(7, 0); // Last week
  
  // Generate XP based on tenure and activity
  const daysSinceJoined = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
  const baseXP = daysSinceJoined * randomInt(10, 50);
  const xp = baseXP + randomInt(0, 5000);
  const level = Math.min(50, Math.floor(xp / 1000) + 1);
  
  // Generate user skills based on persona
  const userSkills = generateUserSkills(persona);
  
  // Generate stats
  const stats = {
    testsWritten: randomInt(0, 500),
    testsHealed: randomInt(0, 100),
    sessionsCompleted: randomInt(0, 50),
    hitlContributions: randomInt(0, 200),
    prsReviewed: randomInt(0, 300),
    bugsPrevented: randomInt(0, 50),
    avgTestQuality: randomInt(60, 100) / 100,
    collaborationScore: randomInt(50, 100) / 100,
  };
  
  // Generate attention flags (10% of users have issues)
  const attentionFlags = randomBoolean(0.1) ? generateAttentionFlags() : [];
  
  return {
    id: generateId('user'),
    name,
    email,
    avatar: `/avatars/avatar-${index % 20}.png`,
    persona,
    role,
    teamId,
    xp,
    level,
    streak: randomInt(0, 90),
    joinedAt: joinedDate.toISOString(),
    lastActive: lastActive.toISOString(),
    skills: userSkills,
    stats,
    attentionFlags,
  };
}

function generateUserSkills(persona: Persona) {
  const personaSkills: Record<Persona, string[]> = {
    dev: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Docker', 'CI/CD'],
    qa: ['Testing', 'Automation', 'Playwright', 'Jest', 'API Testing', 'Performance Testing'],
    po: ['Product Management', 'Roadmapping', 'User Research', 'Analytics'],
    designer: ['UI Design', 'UX Research', 'Figma', 'Accessibility', 'User Testing'],
    manager: ['Team Leadership', 'Project Management', 'Strategy', 'Coaching'],
    gtm: ['Marketing', 'Sales', 'Customer Success', 'Analytics'],
  };
  
  const relevantSkills = personaSkills[persona] || skills.slice(0, 6);
  return relevantSkills.map(skill => ({
    skill,
    level: randomInt(1, 10),
    trend: randomChoice(['improving', 'stable', 'declining'] as const),
    lastAssessed: randomDate(90, 0).toISOString(),
  }));
}

function generateAttentionFlags() {
  const flagTypes: Array<'struggling' | 'disengaged' | 'overloaded' | 'skill_gap' | 'mentorship_opportunity'> = [
    'struggling', 'disengaged', 'overloaded', 'skill_gap', 'mentorship_opportunity'
  ];
  const flagType = randomChoice(flagTypes);
  const severity = randomChoice(['low', 'medium', 'high'] as const);
  
  const flagMessages: Record<typeof flagType, { reason: string; recommendation: string }> = {
    struggling: {
      reason: 'Test quality scores below team average for 3 consecutive weeks',
      recommendation: 'Schedule 1:1 to understand blockers. Consider pairing with senior team member.',
    },
    disengaged: {
      reason: 'Activity decreased by 60% compared to 90-day average',
      recommendation: 'Check in on workload, career goals, and satisfaction. Explore new opportunities.',
    },
    overloaded: {
      reason: 'Assigned to 4+ high-priority projects simultaneously',
      recommendation: 'Redistribute workload. Identify tasks that can be delegated or deprioritized.',
    },
    skill_gap: {
      reason: 'Required skills for upcoming projects not yet developed',
      recommendation: 'Provide training resources. Consider mentorship program or course allowance.',
    },
    mentorship_opportunity: {
      reason: 'Senior contributor with high collaboration scores',
      recommendation: 'Invite to mentor junior team members. Could lead guild or training sessions.',
    },
  };
  
  return [{
    type: flagType,
    severity,
    reason: flagMessages[flagType].reason,
    recommendation: flagMessages[flagType].recommendation,
    detectedAt: randomDate(14, 0).toISOString(),
  }];
}

// Generate 200+ users across multiple teams
export function generateMockUsers(teamIds: string[]): MockUser[] {
  const users: MockUser[] = [];
  const usersPerTeam = Math.ceil(200 / teamIds.length);
  
  teamIds.forEach((teamId, teamIndex) => {
    const teamSize = usersPerTeam + randomInt(-5, 5); // Vary team sizes
    for (let i = 0; i < teamSize; i++) {
      users.push(generateMockUser(teamId, teamIndex * usersPerTeam + i));
    }
  });
  
  // Add specific test users with known credentials
  const testUsers: Partial<MockUser>[] = [
    {
      id: 'user-test-dev',
      name: 'Dev User',
      email: 'dev@shifty.ai',
      persona: 'dev',
      role: 'admin',
    },
    {
      id: 'user-test-qa',
      name: 'QA User',
      email: 'qa@shifty.ai',
      persona: 'qa',
      role: 'admin',
    },
    {
      id: 'user-test-po',
      name: 'Product Owner',
      email: 'po@shifty.ai',
      persona: 'po',
      role: 'admin',
    },
  ];
  
  testUsers.forEach((testUser) => {
    const existingIndex = users.findIndex(u => u.email === testUser.email);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...testUser } as MockUser;
    } else {
      users.unshift(generateMockUser(teamIds[0], 0) as MockUser);
      users[0] = { ...users[0], ...testUser } as MockUser;
    }
  });
  
  return users;
}

export const mockUsers = generateMockUsers(['team-1', 'team-2', 'team-3']);
