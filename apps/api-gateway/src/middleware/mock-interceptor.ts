// Mock interceptor middleware for API Gateway
// Provides enterprise-scale mock data when MOCK_MODE is enabled
import { mockDataManager, MockDataStore } from "@shifty/shared/src/mocks";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

interface MockInterceptorOptions {
  enabled: boolean;
  latencyMin?: number;
  latencyMax?: number;
}

class MockInterceptor {
  private store: MockDataStore;
  private enabled: boolean;
  private latencyMin: number;
  private latencyMax: number;

  constructor(options: MockInterceptorOptions) {
    this.enabled = options.enabled;
    this.latencyMin = options.latencyMin || 50;
    this.latencyMax = options.latencyMax || 300;

    // Initialize mock data store
    this.store = mockDataManager.getStore();
    console.log(
      `[MockInterceptor] Initialized with ${options.enabled ? "MOCK" : "LIVE"} mode`
    );
  }

  /**
   * Simulate realistic network latency
   */
  private async simulateLatency(): Promise<void> {
    const delay =
      Math.floor(Math.random() * (this.latencyMax - this.latencyMin)) +
      this.latencyMin;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Find user by email (for login)
   */
  private findUserByEmail(email: string) {
    return this.store.users.find((u) => u.email === email);
  }

  /**
   * Find user by ID
   */
  private findUserById(userId: string) {
    return this.store.users.find((u) => u.id === userId);
  }

  /**
   * Generate mock JWT token
   */
  private generateMockToken(user: any): string {
    // Simple base64 encoding for mock token
    const payload = {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      iat: Date.now(),
    };
    return `mock.${Buffer.from(JSON.stringify(payload)).toString("base64")}.signature`;
  }

  /**
   * Parse mock JWT token
   */
  private parseMockToken(token: string): any | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3 || parts[0] !== "mock") return null;
      return JSON.parse(Buffer.from(parts[1], "base64").toString());
    } catch {
      return null;
    }
  }

  /**
   * Handle mock authentication
   */
  private async handleAuth(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    const { url, method } = request;

    // POST /api/v1/auth/login
    if (method === "POST" && url === "/api/v1/auth/login") {
      await this.simulateLatency();
      const { email, password } = request.body as any;

      // Check for demo users with password "password123"
      const user = this.findUserByEmail(email);
      if (user && password === "password123") {
        const token = this.generateMockToken(user);
        reply.code(200).send({
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            firstName: user.firstName,
            lastName: user.lastName,
            persona: user.persona,
          },
          token,
          tenant: {
            id: user.tenantId,
            name: "Acme Corp",
            slug: "acme",
            plan: "enterprise",
            status: "active",
          },
        });
        return true;
      }

      reply
        .code(401)
        .send({
          error: "Invalid credentials",
          message: "Email or password is incorrect",
        });
      return true;
    }

    // POST /api/v1/auth/register
    if (method === "POST" && url === "/api/v1/auth/register") {
      await this.simulateLatency();
      const body = request.body as any;

      // Check if user already exists
      if (this.findUserByEmail(body.email)) {
        reply
          .code(409)
          .send({ error: "User exists", message: "Email already registered" });
        return true;
      }

      // Create new mock user
      const newUser = {
        id: `user-${this.store.users.length + 1}`,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        name: `${body.firstName} ${body.lastName}`,
        persona: "dev" as const,
        role: "member" as const,
        tenantId: "tenant-1",
        teamId: "team-1",
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        xp: 0,
        level: 1,
        streak: 0,
        stats: {
          testsWritten: 0,
          testsHealed: 0,
          sessionsCompleted: 0,
          hitlContributions: 0,
          prsReviewed: 0,
          bugsPrevented: 0,
          avgTestQuality: 0,
          collaborationScore: 0,
        },
        skills: [],
        attentionFlags: [],
      };

      this.store.users.push(newUser);
      const token = this.generateMockToken(newUser);

      reply.code(201).send({
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          tenantId: newUser.tenantId,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          persona: newUser.persona,
        },
        token,
        tenant: {
          id: newUser.tenantId,
          name: "Acme Corp",
          slug: "acme",
          plan: "enterprise",
          status: "active",
        },
      });
      return true;
    }

    // POST /api/v1/auth/verify
    if (method === "POST" && url === "/api/v1/auth/verify") {
      await this.simulateLatency();
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        reply
          .code(401)
          .send({ error: "Unauthorized", message: "No token provided" });
        return true;
      }

      const token = authHeader.substring(7);
      const payload = this.parseMockToken(token);
      if (!payload) {
        reply
          .code(401)
          .send({
            error: "Invalid token",
            message: "Token is invalid or expired",
          });
        return true;
      }

      const user = this.findUserById(payload.userId);
      if (!user) {
        reply
          .code(401)
          .send({ error: "User not found", message: "User no longer exists" });
        return true;
      }

      reply.code(200).send({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          firstName: user.firstName,
          lastName: user.lastName,
          persona: user.persona,
        },
      });
      return true;
    }

    return false;
  }

  /**
   * Handle user endpoints
   */
  private async handleUsers(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    const { url, method } = request;

    // GET /api/v1/users/me
    if (method === "GET" && url === "/api/v1/users/me") {
      await this.simulateLatency();
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        reply.code(401).send({ error: "Unauthorized" });
        return true;
      }

      const token = authHeader.substring(7);
      const payload = this.parseMockToken(token);
      const user = payload ? this.findUserById(payload.userId) : null;

      if (!user) {
        reply.code(401).send({ error: "Unauthorized" });
        return true;
      }

      reply.code(200).send({ user });
      return true;
    }

    return false;
  }

  /**
   * Handle tenant endpoints
   */
  private async handleTenants(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    const { url, method } = request;

    if (method === "GET" && url === "/api/v1/tenants") {
      await this.simulateLatency();
      reply.code(200).send({
        success: true,
        data: [
          {
            id: "tenant-1",
            name: "Acme Corp",
            slug: "acme",
            plan: "enterprise",
            status: "active",
          },
        ],
      });
      return true;
    }

    return false;
  }

  /**
   * Handle notifications
   */
  private async handleNotifications(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    const { url, method } = request;

    if (method === "GET" && url === "/api/v1/notifications") {
      await this.simulateLatency();
      reply.code(200).send({ data: this.store.notifications });
      return true;
    }

    if (
      method === "PUT" &&
      url.startsWith("/api/v1/notifications/") &&
      url.endsWith("/read")
    ) {
      await this.simulateLatency();
      const notificationId = url.split("/")[4];
      mockDataManager.markNotificationRead(notificationId);
      reply.code(200).send({ success: true });
      return true;
    }

    return false;
  }

  /**
   * Handle teams
   */
  private async handleTeams(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    const { url, method } = request;

    if (method === "GET" && url === "/api/v1/teams") {
      await this.simulateLatency();
      reply.code(200).send({ data: this.store.teams });
      return true;
    }

    if (method === "GET" && url.match(/^\/api\/v1\/teams\/[^/]+$/)) {
      await this.simulateLatency();
      const teamId = url.split("/")[4];
      const team = this.store.teams.find((t) => t.id === teamId);
      if (!team) {
        reply.code(404).send({ error: "Team not found" });
        return true;
      }
      reply.code(200).send({ data: team });
      return true;
    }

    return false;
  }

  /**
   * Handle projects
   */
  private async handleProjects(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    const { url, method } = request;

    if (method === "GET" && url === "/api/v1/projects") {
      await this.simulateLatency();
      reply.code(200).send({ data: this.store.projects });
      return true;
    }

    if (method === "GET" && url.match(/^\/api\/v1\/projects\/[^/]+$/)) {
      await this.simulateLatency();
      const projectId = url.split("/")[4];
      const project = this.store.projects.find((p) => p.id === projectId);
      if (!project) {
        reply.code(404).send({ error: "Project not found" });
        return true;
      }
      reply.code(200).send({ data: project });
      return true;
    }

    return false;
  }

  /**
   * Handle pipelines
   */
  private async handlePipelines(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    const { url, method } = request;

    if (method === "GET" && url === "/api/v1/pipelines") {
      await this.simulateLatency();
      reply.code(200).send({ data: this.store.pipelines });
      return true;
    }

    return false;
  }

  /**
   * Handle healing endpoints
   */
  private async handleHealing(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    const { url, method } = request;

    if (method === "GET" && url === "/api/v1/healing/strategies") {
      await this.simulateLatency();
      reply.code(200).send({
        strategies: [
          "data-testid-recovery",
          "text-content-matching",
          "css-hierarchy-analysis",
          "ai-powered-analysis",
        ],
      });
      return true;
    }

    if (method === "GET" && url === "/api/v1/healing") {
      await this.simulateLatency();
      reply.code(200).send({ data: this.store.healingItems });
      return true;
    }

    return false;
  }

  /**
   * Handle knowledge endpoints
   */
  private async handleKnowledge(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    const { url, method } = request;

    if (method === "GET" && url.startsWith("/api/v1/knowledge")) {
      await this.simulateLatency();
      reply.code(200).send({ data: this.store.knowledge.slice(0, 50) }); // Paginate
      return true;
    }

    return false;
  }

  /**
   * Handle ROI endpoints
   */
  private async handleROI(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    const { url, method } = request;

    if (method === "GET" && url === "/api/v1/roi/insights") {
      await this.simulateLatency();
      reply.code(200).send({ data: this.store.roiInsights });
      return true;
    }

    if (method === "GET" && url === "/api/v1/roi/dora") {
      await this.simulateLatency();
      reply.code(200).send({ data: this.store.doraMetrics });
      return true;
    }

    return false;
  }

  /**
   * Handle arcade endpoints
   */
  private async handleArcade(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    const { url, method } = request;

    if (method === "GET" && url === "/api/v1/arcade/missions") {
      await this.simulateLatency();
      reply.code(200).send({ data: this.store.missions });
      return true;
    }

    if (method === "GET" && url === "/api/v1/arcade/leaderboard") {
      await this.simulateLatency();
      reply.code(200).send({ data: this.store.leaderboard });
      return true;
    }

    if (
      method === "POST" &&
      url.match(/^\/api\/v1\/arcade\/missions\/[^/]+\/claim$/)
    ) {
      await this.simulateLatency();
      const missionId = url.split("/")[5];
      // Would get user from token in real scenario
      mockDataManager.claimMission(missionId, "user-1");
      reply.code(200).send({ success: true });
      return true;
    }

    return false;
  }

  /**
   * Main intercept method
   */
  async intercept(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    // Try each handler
    if (await this.handleAuth(request, reply)) return true;
    if (await this.handleUsers(request, reply)) return true;
    if (await this.handleTenants(request, reply)) return true;
    if (await this.handleNotifications(request, reply)) return true;
    if (await this.handleTeams(request, reply)) return true;
    if (await this.handleProjects(request, reply)) return true;
    if (await this.handlePipelines(request, reply)) return true;
    if (await this.handleHealing(request, reply)) return true;
    if (await this.handleKnowledge(request, reply)) return true;
    if (await this.handleROI(request, reply)) return true;
    if (await this.handleArcade(request, reply)) return true;

    return false;
  }
}

/**
 * Register mock interceptor with Fastify
 */
export function registerMockInterceptor(
  fastify: FastifyInstance,
  options?: Partial<MockInterceptorOptions>
) {
  const mockMode =
    process.env.MOCK_MODE === "true" || process.env.NODE_ENV === "development";

  const interceptor = new MockInterceptor({
    enabled: options?.enabled !== undefined ? options.enabled : mockMode,
    latencyMin: options?.latencyMin,
    latencyMax: options?.latencyMax,
  });

  fastify.addHook("onRequest", async (request, reply) => {
    const intercepted = await interceptor.intercept(request, reply);
    if (intercepted) {
      // Mark as handled so no proxying occurs
      (request as any).mockIntercepted = true;
    }
  });

  console.log(
    `[MockInterceptor] Registered with mock mode: ${interceptor["enabled"]}`
  );
}
