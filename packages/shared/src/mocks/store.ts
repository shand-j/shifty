import {
  generateMockArcadeMissions,
  generateMockDORAMetrics,
  generateMockHealingSuggestions,
  generateMockKnowledgeEntries,
  generateMockPipelines,
  generateMockProjects,
  generateMockROIMetrics,
  generateMockTeams,
  generateMockTests,
  generateMockUsers,
  MockArcadeMission,
  MockDORAMetric,
  MockHealingSuggestion,
  MockKnowledgeEntry,
  MockNotification,
  MockPipeline,
  MockProject,
  MockROIMetric,
  MockTeam,
  MockTest,
  MockUser,
} from "./factories";

export class MockDataStore {
  private static instance: MockDataStore;

  public users: MockUser[] = [];
  public teams: MockTeam[] = [];
  public projects: MockProject[] = [];
  public tests: MockTest[] = [];
  public healingSuggestions: MockHealingSuggestion[] = [];
  public pipelines: MockPipeline[] = [];
  public knowledgeEntries: MockKnowledgeEntry[] = [];
  public arcadeMissions: MockArcadeMission[] = [];
  public notifications: Map<string, MockNotification[]> = new Map();
  public roiMetrics: MockROIMetric[] = [];
  public doraMetrics: MockDORAMetric[] = [];

  // Session storage
  public sessions: Map<string, unknown> = new Map();

  private constructor() {
    this.seed();
  }

  public static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }

  public seed() {
    console.log("[MockDataStore] Seeding enterprise mock data...");

    // Generate base data
    this.users = generateMockUsers(200);
    this.teams = generateMockTeams(50);
    this.projects = generateMockProjects(100, this.teams);
    this.tests = generateMockTests(5000, this.projects, this.users);
    this.healingSuggestions = generateMockHealingSuggestions(
      500,
      this.tests,
      this.projects,
      this.users
    );
    this.pipelines = generateMockPipelines(30, this.projects, this.users);
    this.knowledgeEntries = generateMockKnowledgeEntries(1000, this.users);
    this.arcadeMissions = generateMockArcadeMissions(50);
    this.roiMetrics = generateMockROIMetrics(12);
    this.doraMetrics = generateMockDORAMetrics(90);

    // Generate notifications for each user
    this.users.forEach((user) => {
      this.notifications.set(user.id, this.generateUserNotifications(user));
    });

    console.log("[MockDataStore] Seeded:", {
      users: this.users.length,
      teams: this.teams.length,
      projects: this.projects.length,
      tests: this.tests.length,
      healingSuggestions: this.healingSuggestions.length,
      pipelines: this.pipelines.length,
      knowledgeEntries: this.knowledgeEntries.length,
      arcadeMissions: this.arcadeMissions.length,
    });
  }

  private generateUserNotifications(user: MockUser): MockNotification[] {
    const notifications: MockNotification[] = [];
    const types: MockNotification["type"][] = [
      "ci_failure",
      "healing_required",
      "roi_alert",
      "team_mention",
      "mission_complete",
      "system_update",
    ];

    for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      let title = "";
      let message = "";
      let link: string | undefined;

      switch (type) {
        case "ci_failure":
          title = "Pipeline Failed";
          message = "Build failed on main branch";
          link = `/pipelines/${Math.floor(Math.random() * 30) + 1}`;
          break;
        case "healing_required":
          title = "Selector Healing Required";
          message = `${Math.floor(Math.random() * 5) + 1} selectors need review`;
          link = "/healing";
          break;
        case "roi_alert":
          title = "ROI Milestone";
          message = `You saved ${Math.floor(Math.random() * 100) + 20} hours this month!`;
          link = "/insights/roi";
          break;
        case "team_mention":
          title = "Team Mention";
          message = "You were mentioned in a test review";
          break;
        case "mission_complete":
          title = "Mission Complete";
          message = "Congratulations! You earned 250 points";
          link = "/arcade";
          break;
        case "system_update":
          title = "System Update";
          message = "New features are now available";
          break;
      }

      notifications.push({
        id: `notif-${user.id}-${i + 1}`,
        type,
        title,
        message,
        read: Math.random() > 0.5,
        userId: user.id,
        link,
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    return notifications;
  }

  public reset() {
    console.log("[MockDataStore] Resetting data...");
    this.users = [];
    this.teams = [];
    this.projects = [];
    this.tests = [];
    this.healingSuggestions = [];
    this.pipelines = [];
    this.knowledgeEntries = [];
    this.arcadeMissions = [];
    this.notifications.clear();
    this.roiMetrics = [];
    this.doraMetrics = [];
    this.sessions.clear();
    this.seed();
  }

  // Query helpers
  public getUserByEmail(email: string): MockUser | undefined {
    return this.users.find((u) => u.email === email);
  }

  public getUserById(id: string): MockUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getTeamById(id: string): MockTeam | undefined {
    return this.teams.find((t) => t.id === id);
  }

  public getProjectById(id: string): MockProject | undefined {
    return this.projects.find((p) => p.id === id);
  }

  public getProjectsByTeam(teamId: string): MockProject[] {
    return this.projects.filter((p) => p.teamId === teamId);
  }

  public getTestById(id: string): MockTest | undefined {
    return this.tests.find((t) => t.id === id);
  }

  public getTestsByProject(projectId: string): MockTest[] {
    return this.tests.filter((t) => t.projectId === projectId);
  }

  public getHealingSuggestionById(
    id: string
  ): MockHealingSuggestion | undefined {
    return this.healingSuggestions.find((h) => h.id === id);
  }

  public getHealingSuggestionsByProject(
    projectId: string
  ): MockHealingSuggestion[] {
    return this.healingSuggestions.filter((h) => h.projectId === projectId);
  }

  public getPendingHealingSuggestions(): MockHealingSuggestion[] {
    return this.healingSuggestions.filter((h) => h.status === "pending");
  }

  public getPipelineById(id: string): MockPipeline | undefined {
    return this.pipelines.find((p) => p.id === id);
  }

  public getPipelinesByProject(projectId: string): MockPipeline[] {
    return this.pipelines.filter((p) => p.projectId === projectId);
  }

  public getKnowledgeEntryById(id: string): MockKnowledgeEntry | undefined {
    return this.knowledgeEntries.find((k) => k.id === id);
  }

  public getArcadeMissionById(id: string): MockArcadeMission | undefined {
    return this.arcadeMissions.find((m) => m.id === id);
  }

  public getUserNotifications(userId: string): MockNotification[] {
    return this.notifications.get(userId) || [];
  }

  public markNotificationRead(userId: string, notificationId: string) {
    const userNotifs = this.notifications.get(userId);
    if (userNotifs) {
      const notif = userNotifs.find((n) => n.id === notificationId);
      if (notif) {
        notif.read = true;
      }
    }
  }

  // Update operations
  public approveHealing(healingId: string, userId: string) {
    const healing = this.getHealingSuggestionById(healingId);
    if (healing) {
      healing.status = "approved";
      healing.reviewedBy = userId;
      healing.reviewedAt = new Date().toISOString();
    }
  }

  public rejectHealing(healingId: string, userId: string) {
    const healing = this.getHealingSuggestionById(healingId);
    if (healing) {
      healing.status = "rejected";
      healing.reviewedBy = userId;
      healing.reviewedAt = new Date().toISOString();
    }
  }

  public createProject(data: Partial<MockProject>): MockProject {
    const newProject: MockProject = {
      id: `project-${this.projects.length + 1}`,
      name: data.name || "New Project",
      slug: data.slug || "new-project",
      description: data.description || "",
      teamId: data.teamId || this.teams[0]?.id || "team-1",
      repository: data.repository || "https://github.com/acme-corp/new-project",
      framework: data.framework || "playwright",
      testCount: 0,
      passingTests: 0,
      failingTests: 0,
      flakyTests: 0,
      coverage: 0,
      lastRun: new Date().toISOString(),
      status: "active",
      createdAt: new Date().toISOString(),
    };

    this.projects.push(newProject);
    return newProject;
  }

  public createSession(data: unknown): unknown {
    const id = `session-${this.sessions.size + 1}`;
    const session = {
      id,
      ...(typeof data === "object" && data !== null ? data : {}),
      createdAt: new Date().toISOString(),
    };
    this.sessions.set(id, session);
    return session;
  }

  // Export/Import for demo data management
  public export(): string {
    return JSON.stringify(
      {
        users: this.users,
        teams: this.teams,
        projects: this.projects,
        tests: this.tests,
        healingSuggestions: this.healingSuggestions,
        pipelines: this.pipelines,
        knowledgeEntries: this.knowledgeEntries,
        arcadeMissions: this.arcadeMissions,
        notifications: Array.from(this.notifications.entries()),
        roiMetrics: this.roiMetrics,
        doraMetrics: this.doraMetrics,
      },
      null,
      2
    );
  }

  public import(data: string) {
    try {
      const parsed = JSON.parse(data);
      this.users = parsed.users || [];
      this.teams = parsed.teams || [];
      this.projects = parsed.projects || [];
      this.tests = parsed.tests || [];
      this.healingSuggestions = parsed.healingSuggestions || [];
      this.pipelines = parsed.pipelines || [];
      this.knowledgeEntries = parsed.knowledgeEntries || [];
      this.arcadeMissions = parsed.arcadeMissions || [];
      this.notifications = new Map(parsed.notifications || []);
      this.roiMetrics = parsed.roiMetrics || [];
      this.doraMetrics = parsed.doraMetrics || [];
      console.log("[MockDataStore] Imported data successfully");
    } catch (error) {
      console.error("[MockDataStore] Failed to import data:", error);
      throw error;
    }
  }
}

export function getMockDataStore(): MockDataStore {
  return MockDataStore.getInstance();
}
