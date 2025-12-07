// Export all mock data
export * from './faker-utils';
export * from './users';
export * from './teams';
export * from './projects';
export * from './healing';
export * from './pipelines';
export * from './roi';
export * from './dora';

// Re-export main mock instances for convenience
export { mockUsers } from './users';
export { mockTeams } from './teams';
export { mockProjects, totalTestCount } from './projects';
export { mockHealingItems } from './healing';
export { mockPipelines } from './pipelines';
export { mockROIMetrics } from './roi';
export { mockDORAMetrics } from './dora';

// Mock data store interface
export interface MockDataStore {
  users: ReturnType<typeof import('./users').generateMockUsers>;
  teams: ReturnType<typeof import('./teams').generateMockTeams>;
  projects: ReturnType<typeof import('./projects').generateMockProjects>;
  healingItems: ReturnType<typeof import('./healing').generateMockHealingItems>;
  pipelines: ReturnType<typeof import('./pipelines').generateMockPipelines>;
  roiMetrics: ReturnType<typeof import('./roi').generateMockROIMetrics>;
  doraMetrics: ReturnType<typeof import('./dora').generateMockDORAMetrics>;
}

// Initialize mock data store
export function initializeMockDataStore(): MockDataStore {
  const { mockTeams } = require('./teams');
  const teamIds = mockTeams.map((t: { id: string }) => t.id);
  
  return {
    users: require('./users').generateMockUsers(teamIds),
    teams: mockTeams,
    projects: require('./projects').generateMockProjects(teamIds),
    healingItems: require('./healing').generateMockHealingItems(500),
    pipelines: require('./pipelines').generateMockPipelines(30),
    roiMetrics: require('./roi').generateMockROIMetrics(),
    doraMetrics: require('./dora').generateMockDORAMetrics(),
  };
}

export const mockDataStore = initializeMockDataStore();
