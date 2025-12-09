// Centralized mock data store for the entire platform
import {
  generateMockBadges,
  generateMockLeaderboard,
  generateMockMissions,
  MockBadge,
  MockLeaderboardEntry,
  MockMission,
} from "./arcade";
import { generateMockHealingItems, MockHealingItem } from "./healing";
import { generateMockKnowledge, MockKnowledgeEntry } from "./knowledge";
import { generateMockNotifications, MockNotification } from "./notifications";
import { generateMockPipelines, MockPipeline } from "./pipelines";
import { generateMockProjects, MockProject } from "./projects";
import {
  generateMockDORAMetrics,
  generateMockROIInsights,
  MockDORAMetrics,
  MockROIInsights,
} from "./roi";
import {
  assignProjectsToTeams,
  assignUsersToTeams,
  generateMockTeams,
  MockTeam,
} from "./teams";
import { generateMockUsers, MockUser } from "./users";

export interface MockDataStore {
  users: MockUser[];
  teams: MockTeam[];
  projects: MockProject[];
  healingItems: MockHealingItem[];
  pipelines: MockPipeline[];
  knowledge: MockKnowledgeEntry[];
  missions: MockMission[];
  leaderboard: MockLeaderboardEntry[];
  badges: MockBadge[];
  roiInsights: MockROIInsights;
  doraMetrics: MockDORAMetrics;
  notifications: MockNotification[];
  initialized: boolean;
}

class MockDataManager {
  private store: MockDataStore | null = null;

  /**
   * Initialize the mock data store with enterprise-scale data
   */
  initialize(): MockDataStore {
    if (this.store?.initialized) {
      return this.store;
    }

    console.log("[MockData] Initializing enterprise mock data...");

    // Generate teams first (50 teams)
    const teams = generateMockTeams(50);
    const teamIds = teams.map((t) => t.id);

    // Generate users (200 users across teams)
    const users = generateMockUsers(200, teamIds);
    const userIds = users.map((u) => u.id);

    // Assign users to teams
    assignUsersToTeams(teams, userIds);

    // Generate projects (100 projects across teams)
    const projects = generateMockProjects(100, teamIds);
    const projectIds = projects.map((p) => p.id);
    const projectRepos = projects.map((p) => p.repo);

    // Assign projects to teams
    assignProjectsToTeams(teams, projectIds);

    // Generate healing items (500 items across projects)
    const healingItems = generateMockHealingItems(500, projectIds);

    // Generate pipelines (200 pipeline runs)
    const pipelines = generateMockPipelines(200, projectRepos);

    // Generate knowledge base (1000 entries)
    const knowledge = generateMockKnowledge(1000);

    // Generate arcade data
    const missions = generateMockMissions(50);
    const userNames = users.map((u) => u.name);
    const teamNames = teams.map((t) => t.name);
    const leaderboard = generateMockLeaderboard(userIds, userNames, teamNames);
    const badges = generateMockBadges();

    // Generate ROI and DORA metrics
    const roiInsights = generateMockROIInsights();
    const doraMetrics = generateMockDORAMetrics();

    // Generate notifications (50 per user, we'll generate for demo user)
    const notifications = generateMockNotifications(50, "user-1");

    this.store = {
      users,
      teams,
      projects,
      healingItems,
      pipelines,
      knowledge,
      missions,
      leaderboard,
      badges,
      roiInsights,
      doraMetrics,
      notifications,
      initialized: true,
    };

    console.log("[MockData] Initialized with:", {
      users: users.length,
      teams: teams.length,
      projects: projects.length,
      healingItems: healingItems.length,
      pipelines: pipelines.length,
      knowledge: knowledge.length,
      missions: missions.length,
    });

    return this.store;
  }

  /**
   * Get the current mock data store
   */
  getStore(): MockDataStore {
    if (!this.store) {
      return this.initialize();
    }
    return this.store;
  }

  /**
   * Reset the mock data store
   */
  reset(): void {
    this.store = null;
  }

  /**
   * Update a user in the store
   */
  updateUser(userId: string, updates: Partial<MockUser>): MockUser | null {
    const store = this.getStore();
    const userIndex = store.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return null;

    store.users[userIndex] = { ...store.users[userIndex], ...updates };
    return store.users[userIndex];
  }

  /**
   * Add a notification
   */
  addNotification(notification: MockNotification): void {
    const store = this.getStore();
    store.notifications.unshift(notification);
  }

  /**
   * Mark notification as read
   */
  markNotificationRead(notificationId: string): void {
    const store = this.getStore();
    const notification = store.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Approve healing item
   */
  approveHealingItem(healingId: string, reviewedBy: string): void {
    const store = this.getStore();
    const item = store.healingItems.find((h) => h.id === healingId);
    if (item) {
      item.status = "approved";
      item.reviewedBy = reviewedBy;
      item.reviewedAt = new Date().toISOString();
    }
  }

  /**
   * Reject healing item
   */
  rejectHealingItem(healingId: string, reviewedBy: string): void {
    const store = this.getStore();
    const item = store.healingItems.find((h) => h.id === healingId);
    if (item) {
      item.status = "rejected";
      item.reviewedBy = reviewedBy;
      item.reviewedAt = new Date().toISOString();
    }
  }

  /**
   * Claim a mission
   */
  claimMission(missionId: string, userId: string): void {
    const store = this.getStore();
    const mission = store.missions.find((m) => m.id === missionId);
    if (mission && !mission.claimed) {
      mission.claimed = true;
      mission.claimedBy = userId;
    }
  }

  /**
   * Complete a mission
   */
  completeMission(missionId: string, userId: string): void {
    const store = this.getStore();
    const mission = store.missions.find((m) => m.id === missionId);
    if (mission) {
      mission.completedBy = mission.completedBy || [];
      mission.completedBy.push(userId);
      mission.completedAt = new Date().toISOString();
    }
  }
}

// Export singleton instance
export const mockDataManager = new MockDataManager();

// Export types
export type {
  MockBadge,
  MockDORAMetrics,
  MockHealingItem,
  MockKnowledgeEntry,
  MockLeaderboardEntry,
  MockMission,
  MockNotification,
  MockPipeline,
  MockProject,
  MockROIInsights,
  MockTeam,
  MockUser,
};

// Export individual generators for testing
export {
  generateMockBadges,
  generateMockDORAMetrics,
  generateMockHealingItems,
  generateMockKnowledge,
  generateMockLeaderboard,
  generateMockMissions,
  generateMockNotifications,
  generateMockPipelines,
  generateMockProjects,
  generateMockROIInsights,
  generateMockTeams,
  generateMockUsers,
};
