import {
  generateId,
  generateCompanyName,
  randomInt,
  randomChoice,
  randomDate,
  generateSlug
} from './faker-utils';

export type MaturityLevel = 1 | 2 | 3 | 4 | 5;

export interface MockTeam {
  id: string;
  name: string;
  slug: string;
  managerId: string;
  memberIds: string[];
  projectIds: string[];
  maturityLevel: MaturityLevel;
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
  };
  createdAt: string;
}

const departments = [
  'Engineering', 'Product', 'QA', 'Platform', 'Infrastructure', 'Security',
  'Data', 'Mobile', 'Web', 'Backend', 'Frontend', 'DevOps', 'Site Reliability'
];

function generateMockTeam(index: number): MockTeam {
  const dept = index < departments.length ? departments[index] : randomChoice(departments);
  const name = `${dept} Team ${index > departments.length ? index - departments.length + 1 : ''}`.trim();
  const maturityLevel = randomChoice([1, 2, 3, 4, 5] as MaturityLevel[]);
  
  return {
    id: generateId('team'),
    name,
    slug: generateSlug(name),
    managerId: generateId('user'),
    memberIds: [], // Will be populated later
    projectIds: [], // Will be populated later
    maturityLevel,
    adoptionScore: randomInt(30, 100),
    qualityCulture: {
      overall: randomInt(50, 100),
      dimensions: {
        shiftLeftMindset: randomInt(40, 100),
        testOwnership: randomInt(50, 100),
        collaborationCulture: randomInt(60, 100),
        continuousImprovement: randomInt(50, 95),
        automationFirst: randomInt(45, 100),
        dataInformed: randomInt(40, 90),
      },
    },
    createdAt: randomDate(730, 180).toISOString(),
  };
}

// Generate 50+ teams
export function generateMockTeams(count = 50): MockTeam[] {
  const teams: MockTeam[] = [];
  for (let i = 0; i < count; i++) {
    teams.push(generateMockTeam(i));
  }
  return teams;
}

export const mockTeams = generateMockTeams();
