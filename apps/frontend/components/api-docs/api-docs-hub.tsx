"use client"

import type React from "react"

import { useState } from "react"
import {
  FileCode2,
  Search,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  Zap,
  Database,
  Users,
  TestTube2,
  Sparkles,
  PlayCircle,
  GitBranch,
  BarChart3,
  Brain,
  Trophy,
  Webhook,
  Building2,
  Target,
  FolderKanban,
  UserCog,
  Settings,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  summary: string
  description: string
  auth: boolean
  requestBody?: object
  responseBody: object
  queryParams?: { name: string; type: string; required: boolean; description: string }[]
}

interface ApiSection {
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  endpoints: ApiEndpoint[]
}

const apiSections: ApiSection[] = [
  {
    name: "Authentication",
    icon: Lock,
    description: "User authentication and session management",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/login",
        summary: "Authenticate user",
        description: "Authenticates a user with email and password, returns JWT tokens",
        auth: false,
        requestBody: {
          email: "string (required)",
          password: "string (required)",
        },
        responseBody: {
          accessToken: "string",
          refreshToken: "string",
          user: {
            id: "string",
            email: "string",
            name: "string",
            persona: "po | dev | qa | designer | manager | gtm",
            role: "admin | member | viewer",
          },
          expiresIn: "number (seconds)",
        },
      },
      {
        method: "POST",
        path: "/api/auth/refresh",
        summary: "Refresh access token",
        description: "Exchange refresh token for new access token",
        auth: false,
        requestBody: {
          refreshToken: "string (required)",
        },
        responseBody: {
          accessToken: "string",
          expiresIn: "number",
        },
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        summary: "Logout user",
        description: "Invalidates the current session and all tokens",
        auth: true,
        responseBody: {
          success: "boolean",
        },
      },
    ],
  },
  {
    name: "Organization",
    icon: Building2,
    description: "Organization-level management and insights",
    endpoints: [
      {
        method: "GET",
        path: "/api/organization",
        summary: "Get organization overview",
        description: "Returns aggregated organization metrics, maturity distribution, and quality scores",
        auth: true,
        responseBody: {
          id: "string",
          name: "string",
          slug: "string",
          metrics: {
            totalTeams: "number",
            totalProjects: "number",
            totalMembers: "number",
            avgMaturityScore: "number (0-100)",
            avgAdoptionScore: "number (0-100)",
            qualityCultureScore: "number (0-100)",
          },
          maturityDistribution: {
            learning: "number",
            developing: "number",
            established: "number",
            optimizing: "number",
            leading: "number",
          },
          doraMetrics: {
            deploymentFrequency: "string",
            leadTime: "string",
            changeFailureRate: "number (percentage)",
            mttr: "string",
          },
        },
      },
      {
        method: "GET",
        path: "/api/organization/leaderboard",
        summary: "Get organization leaderboard",
        description: "Returns top performers across the organization by XP, contributions, and quality metrics",
        auth: true,
        queryParams: [
          { name: "metric", type: "string", required: false, description: "xp | healings | tests | sessions" },
          { name: "limit", type: "number", required: false, description: "Number of results (default: 10)" },
        ],
        responseBody: {
          leaders: [
            {
              rank: "number",
              userId: "string",
              name: "string",
              avatar: "string",
              teamId: "string",
              teamName: "string",
              xp: "number",
              contributions: "number",
              accuracy: "number",
            },
          ],
        },
      },
      {
        method: "GET",
        path: "/api/organization/culture-assessment",
        summary: "Get quality culture assessment",
        description: "Returns detailed quality culture metrics and recommendations",
        auth: true,
        responseBody: {
          overall: "number (0-100)",
          dimensions: {
            testFirst: "number",
            collaboration: "number",
            continuousImprovement: "number",
            ownership: "number",
            automation: "number",
          },
          recommendations: ["string"],
          benchmarks: {
            industry: "number",
            similar_size: "number",
          },
        },
      },
    ],
  },
  {
    name: "Teams",
    icon: Users,
    description: "Team management, maturity tracking, and collaboration",
    endpoints: [
      {
        method: "GET",
        path: "/api/teams",
        summary: "List all teams",
        description: "Returns all teams with maturity levels and key metrics",
        auth: true,
        queryParams: [
          {
            name: "maturityLevel",
            type: "string",
            required: false,
            description: "Filter by maturity: learning | developing | established | optimizing | leading",
          },
          {
            name: "needsAttention",
            type: "boolean",
            required: false,
            description: "Filter teams flagged for attention",
          },
          { name: "sortBy", type: "string", required: false, description: "maturity | adoption | testCoverage | name" },
        ],
        responseBody: {
          teams: [
            {
              id: "string",
              name: "string",
              slug: "string",
              maturityLevel: "learning | developing | established | optimizing | leading",
              maturityScore: "number (0-100)",
              adoptionScore: "number (0-100)",
              testCoverage: "number (percentage)",
              memberCount: "number",
              projectCount: "number",
              needsAttention: "boolean",
              attentionReason: "string | null",
            },
          ],
          total: "number",
        },
      },
      {
        method: "GET",
        path: "/api/teams/:id",
        summary: "Get team details",
        description: "Returns comprehensive team information including members, projects, and metrics",
        auth: true,
        responseBody: {
          id: "string",
          name: "string",
          description: "string",
          maturityLevel: "string",
          maturityScore: "number",
          metrics: {
            testCoverage: "number",
            passRate: "number",
            healingsAccepted: "number",
            avgCycleTime: "string",
            flakyTestRate: "number",
          },
          cultureScores: {
            testFirst: "number",
            collaboration: "number",
            ownership: "number",
          },
          members: [
            {
              id: "string",
              name: "string",
              avatar: "string",
              role: "string",
              xp: "number",
              needsAttention: "boolean",
            },
          ],
          projects: [
            {
              id: "string",
              name: "string",
              status: "string",
              confidence: "number",
            },
          ],
          recentActivity: [
            {
              type: "string",
              description: "string",
              userId: "string",
              timestamp: "ISO 8601",
            },
          ],
        },
      },
      {
        method: "GET",
        path: "/api/teams/:id/maturity-assessment",
        summary: "Get team maturity assessment",
        description: "Returns detailed maturity assessment with dimension breakdowns and improvement areas",
        auth: true,
        responseBody: {
          overall: "number",
          level: "string",
          dimensions: {
            testAutomation: { score: "number", trend: "string" },
            cicdIntegration: { score: "number", trend: "string" },
            qualityOwnership: { score: "number", trend: "string" },
            collaborationPractices: { score: "number", trend: "string" },
            continuousImprovement: { score: "number", trend: "string" },
          },
          improvements: [
            {
              area: "string",
              recommendation: "string",
              impact: "high | medium | low",
              effort: "high | medium | low",
            },
          ],
          historicalTrend: [
            {
              date: "ISO 8601",
              score: "number",
            },
          ],
        },
      },
      {
        method: "GET",
        path: "/api/teams/:id/members/:memberId",
        summary: "Get team member profile",
        description: "Returns individual contributor profile with skills, activity, and development recommendations",
        auth: true,
        responseBody: {
          id: "string",
          name: "string",
          email: "string",
          avatar: "string",
          role: "string",
          persona: "string",
          teamId: "string",
          xp: "number",
          level: "number",
          badges: ["string"],
          skills: {
            testAutomation: "number (0-100)",
            healingReview: "number (0-100)",
            triageAccuracy: "number (0-100)",
            collaboration: "number (0-100)",
          },
          needsAttention: "boolean",
          attentionFlags: [
            {
              type: "string",
              severity: "low | medium | high",
              description: "string",
              recommendation: "string",
            },
          ],
          recentActivity: [
            {
              type: "string",
              description: "string",
              timestamp: "ISO 8601",
              xpEarned: "number",
            },
          ],
          developmentPlan: {
            currentFocus: "string",
            nextMilestone: "string",
            recommendedMissions: ["string"],
          },
        },
      },
    ],
  },
  {
    name: "Projects",
    icon: FolderKanban,
    description: "Project and feature confidence tracking",
    endpoints: [
      {
        method: "GET",
        path: "/api/projects",
        summary: "List all projects",
        description: "Returns projects with confidence scores and test coverage",
        auth: true,
        queryParams: [
          { name: "teamId", type: "string", required: false, description: "Filter by team" },
          { name: "status", type: "string", required: false, description: "active | archived | at_risk" },
        ],
        responseBody: {
          projects: [
            {
              id: "string",
              name: "string",
              teamId: "string",
              status: "string",
              confidence: "number (0-100)",
              testCoverage: "number",
              riskLevel: "low | medium | high | critical",
              lastActivity: "ISO 8601",
            },
          ],
        },
      },
      {
        method: "GET",
        path: "/api/projects/:id",
        summary: "Get project details",
        description: "Returns detailed project information with feature breakdown and test pyramid",
        auth: true,
        responseBody: {
          id: "string",
          name: "string",
          description: "string",
          teamId: "string",
          teamName: "string",
          status: "string",
          overallConfidence: "number",
          features: [
            {
              id: "string",
              name: "string",
              confidence: "number",
              testCount: "number",
              lastTested: "ISO 8601",
              riskFactors: ["string"],
            },
          ],
          testPyramid: {
            unit: { count: "number", coverage: "number" },
            integration: { count: "number", coverage: "number" },
            e2e: { count: "number", coverage: "number" },
            visual: { count: "number", coverage: "number" },
          },
          riskSummary: {
            critical: "number",
            high: "number",
            medium: "number",
            low: "number",
          },
          recentChanges: [
            {
              type: "string",
              description: "string",
              impact: "string",
              timestamp: "ISO 8601",
            },
          ],
        },
      },
      {
        method: "GET",
        path: "/api/projects/:id/features/:featureId",
        summary: "Get feature confidence details",
        description: "Returns deep dive into feature-level quality metrics and risk factors",
        auth: true,
        responseBody: {
          id: "string",
          name: "string",
          description: "string",
          confidence: "number",
          confidenceFactors: {
            testCoverage: { score: "number", weight: "number" },
            testStability: { score: "number", weight: "number" },
            recentActivity: { score: "number", weight: "number" },
            codeChurn: { score: "number", weight: "number" },
          },
          riskFactors: [
            {
              type: "string",
              severity: "string",
              description: "string",
              mitigation: "string",
            },
          ],
          tests: [
            {
              id: "string",
              name: "string",
              type: "unit | integration | e2e",
              status: "passing | failing | flaky",
              lastRun: "ISO 8601",
            },
          ],
        },
      },
    ],
  },
  {
    name: "Adoption",
    icon: Target,
    description: "Platform adoption metrics and engagement tracking",
    endpoints: [
      {
        method: "GET",
        path: "/api/adoption/metrics",
        summary: "Get adoption metrics",
        description: "Returns platform-wide adoption metrics and trends",
        auth: true,
        queryParams: [{ name: "timeRange", type: "string", required: false, description: "7d | 30d | 90d | 1y" }],
        responseBody: {
          overall: {
            adoptionRate: "number (percentage)",
            activeUsers: "number",
            totalUsers: "number",
            trend: "string",
          },
          byFeature: [
            {
              feature: "string",
              adoptionRate: "number",
              activeUsers: "number",
              trend: "string",
            },
          ],
          byTeam: [
            {
              teamId: "string",
              teamName: "string",
              adoptionScore: "number",
              engagementLevel: "low | medium | high",
            },
          ],
          onboardingFunnel: {
            invited: "number",
            activated: "number",
            firstAction: "number",
            regularUser: "number",
            powerUser: "number",
          },
        },
      },
      {
        method: "GET",
        path: "/api/adoption/engagement",
        summary: "Get engagement analytics",
        description: "Returns detailed engagement metrics and user behavior patterns",
        auth: true,
        responseBody: {
          dau: "number",
          wau: "number",
          mau: "number",
          stickiness: "number (DAU/MAU ratio)",
          avgSessionDuration: "number (minutes)",
          actionsPerSession: "number",
          retentionCohorts: [
            {
              cohort: "string",
              week1: "number",
              week2: "number",
              week4: "number",
              week8: "number",
            },
          ],
          churnRisk: [
            {
              userId: "string",
              name: "string",
              lastActive: "ISO 8601",
              riskScore: "number",
              reason: "string",
            },
          ],
        },
      },
    ],
  },
  {
    name: "Tests",
    icon: TestTube2,
    description: "Test case management and execution",
    endpoints: [
      {
        method: "GET",
        path: "/api/tests",
        summary: "List all tests",
        description: "Retrieves paginated list of test cases with filtering",
        auth: true,
        queryParams: [
          { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
          { name: "limit", type: "number", required: false, description: "Items per page (default: 20)" },
          { name: "status", type: "string", required: false, description: "passing | failing | flaky | skipped" },
          { name: "suiteId", type: "string", required: false, description: "Filter by test suite" },
          { name: "projectId", type: "string", required: false, description: "Filter by project" },
          { name: "teamId", type: "string", required: false, description: "Filter by team" },
          { name: "tags", type: "string[]", required: false, description: "Filter by tags" },
          { name: "search", type: "string", required: false, description: "Search in test name" },
        ],
        responseBody: {
          data: [
            {
              id: "string",
              name: "string",
              suiteId: "string",
              projectId: "string",
              status: "passing | failing | flaky | skipped",
              tags: "string[]",
              owner: "string",
              lastRun: "ISO 8601 timestamp",
              avgDuration: "number (ms)",
            },
          ],
          pagination: {
            page: "number",
            limit: "number",
            total: "number",
            totalPages: "number",
          },
        },
      },
      {
        method: "GET",
        path: "/api/tests/:id",
        summary: "Get test details",
        description: "Retrieves full test case details including code and history",
        auth: true,
        responseBody: {
          id: "string",
          name: "string",
          description: "string",
          suiteId: "string",
          projectId: "string",
          status: "string",
          code: "string",
          framework: "playwright | cypress | jest | vitest",
          selectors: "string[]",
          tags: "string[]",
          owner: "User",
          createdAt: "ISO 8601",
          updatedAt: "ISO 8601",
          runs: [
            {
              id: "string",
              status: "string",
              duration: "number",
              error: "string | null",
              timestamp: "ISO 8601",
            },
          ],
        },
      },
      {
        method: "POST",
        path: "/api/tests/generate",
        summary: "Generate tests from spec",
        description: "Uses AI to generate test cases from natural language specification",
        auth: true,
        requestBody: {
          specification: "string (required) - Natural language test description",
          framework: "playwright | cypress (required)",
          targetUrl: "string (required) - URL of page to test",
          projectId: "string - Associate with project",
          context: "string - Additional context or requirements",
        },
        responseBody: {
          jobId: "string",
          status: "queued | processing | completed | failed",
          estimatedTime: "number (seconds)",
        },
      },
      {
        method: "GET",
        path: "/api/tests/generate/:jobId",
        summary: "Get generation job status",
        description: "Polls the status of an async test generation job",
        auth: true,
        responseBody: {
          jobId: "string",
          status: "queued | processing | completed | failed",
          progress: "number (0-100)",
          result: {
            tests: [
              {
                name: "string",
                code: "string",
                confidence: "number",
              },
            ],
          },
          error: "string | null",
        },
      },
    ],
  },
  {
    name: "Healing",
    icon: Sparkles,
    description: "Intelligent test healing and repair for selectors, race conditions, test data, and code quality",
    endpoints: [
      {
        method: "GET",
        path: "/api/healing/queue",
        summary: "Get healing queue",
        description: "Returns items pending human review for healing approval across all categories",
        auth: true,
        queryParams: [
          { name: "status", type: "string", required: false, description: "pending | approved | rejected" },
          {
            name: "category",
            type: "string",
            required: false,
            description: "selector | race_condition | test_data | code_quality | breaking_change | environment",
          },
          { name: "minConfidence", type: "number", required: false, description: "Minimum AI confidence (0-1)" },
          { name: "teamId", type: "string", required: false, description: "Filter by team" },
          { name: "projectId", type: "string", required: false, description: "Filter by project" },
        ],
        responseBody: {
          items: [
            {
              id: "string",
              testId: "string",
              testName: "string",
              category: "selector | race_condition | test_data | code_quality | breaking_change | environment",
              rootCause: "string",
              analysis: "string",
              originalIssue: {
                type: "string",
                code: "string",
                error: "string",
              },
              proposedFix: {
                description: "string",
                code: "string",
                diff: "string",
              },
              confidence: "number",
              domSnapshot: "string | null",
              status: "string",
              createdAt: "ISO 8601",
            },
          ],
          total: "number",
          byCategory: {
            selector: "number",
            race_condition: "number",
            test_data: "number",
            code_quality: "number",
            breaking_change: "number",
            environment: "number",
          },
        },
      },
      {
        method: "POST",
        path: "/api/healing/:id/approve",
        summary: "Approve healing suggestion",
        description: "Approves AI-suggested fix and optionally creates PR",
        auth: true,
        requestBody: {
          createPR: "boolean - Whether to auto-create PR",
          comment: "string - Optional review comment",
          targetBranch: "string - Branch to create PR against",
        },
        responseBody: {
          success: "boolean",
          prUrl: "string | null",
          appliedFix: "object",
          xpEarned: "number",
        },
      },
      {
        method: "POST",
        path: "/api/healing/:id/reject",
        summary: "Reject healing suggestion",
        description: "Rejects suggestion with feedback for model improvement",
        auth: true,
        requestBody: {
          reason: "string (required) - Rejection reason for training",
          correctFix: "string - Manual fix if different",
          category: "string - Correct category if misclassified",
        },
        responseBody: {
          success: "boolean",
          xpEarned: "number",
        },
      },
      {
        method: "GET",
        path: "/api/healing/:id/analysis",
        summary: "Get detailed healing analysis",
        description: "Returns comprehensive AI analysis of the failure including root cause and fix rationale",
        auth: true,
        responseBody: {
          id: "string",
          category: "string",
          rootCauseAnalysis: {
            summary: "string",
            evidence: ["string"],
            confidence: "number",
            alternativeCauses: [
              {
                cause: "string",
                likelihood: "number",
              },
            ],
          },
          fixRationale: {
            approach: "string",
            steps: ["string"],
            risks: ["string"],
            alternatives: [
              {
                description: "string",
                tradeoffs: "string",
              },
            ],
          },
          relatedFailures: [
            {
              testId: "string",
              testName: "string",
              similarity: "number",
            },
          ],
        },
      },
    ],
  },
  {
    name: "Sessions",
    icon: PlayCircle,
    description: "Manual test session management and recording",
    endpoints: [
      {
        method: "GET",
        path: "/api/sessions",
        summary: "List sessions",
        description: "Get all manual test sessions",
        auth: true,
        queryParams: [
          { name: "status", type: "string", required: false, description: "draft | active | completed | archived" },
          {
            name: "type",
            type: "string",
            required: false,
            description: "scripted | exploratory | accessibility | performance | design_validation",
          },
          { name: "ownerId", type: "string", required: false, description: "Filter by session owner" },
        ],
        responseBody: {
          sessions: [
            {
              id: "string",
              name: "string",
              type: "scripted | exploratory | accessibility | performance | design_validation",
              status: "draft | active | completed | archived",
              owner: "User",
              progress: "number",
              totalSteps: "number",
              createdAt: "ISO 8601",
            },
          ],
        },
      },
      {
        method: "POST",
        path: "/api/sessions",
        summary: "Create session",
        description: "Creates a new manual test session",
        auth: true,
        requestBody: {
          name: "string (required)",
          type: "scripted | exploratory | accessibility | performance | design_validation",
          description: "string",
          targetUrl: "string (required)",
          projectId: "string",
          designAssets: "[{ url: string, name: string }] - For design validation sessions",
          steps: "[{ title: string, description: string, expectedResult: string }]",
        },
        responseBody: {
          id: "string",
          name: "string",
          status: "draft",
          recordingUrl: "string - WebSocket URL for live recording",
        },
      },
      {
        method: "POST",
        path: "/api/sessions/:id/start",
        summary: "Start recording session",
        description: "Initiates the recording of a session with browser instrumentation",
        auth: true,
        requestBody: {
          browserConfig: {
            viewport: "{ width: number, height: number }",
            userAgent: "string",
            locale: "string",
          },
        },
        responseBody: {
          sessionId: "string",
          recordingActive: "boolean",
          wsEndpoint: "string",
          browserInstanceId: "string",
        },
      },
      {
        method: "POST",
        path: "/api/sessions/:id/record",
        summary: "Record session action",
        description: "Records a user action during session playback",
        auth: true,
        requestBody: {
          action: "click | type | navigate | scroll | assert | hover | drag",
          selector: "string",
          value: "string | null",
          timestamp: "number",
          screenshot: "string (base64)",
          elementMetadata: "{ tagName: string, attributes: object }",
        },
        responseBody: {
          actionId: "string",
          recorded: "boolean",
          suggestedAssertion: "string | null",
        },
      },
      {
        method: "POST",
        path: "/api/sessions/:id/generate-tests",
        summary: "Generate tests from session",
        description: "Converts recorded session into Playwright test code with intelligent assertions",
        auth: true,
        requestBody: {
          format: "playwright | cypress",
          includeAssertions: "boolean",
          optimizeSelectors: "boolean",
          createPR: "boolean",
        },
        responseBody: {
          tests: [
            {
              name: "string",
              code: "string",
              assertions: "number",
            },
          ],
          prUrl: "string | null",
        },
      },
    ],
  },
  {
    name: "Pipelines",
    icon: GitBranch,
    description: "CI/CD pipeline integration and monitoring",
    endpoints: [
      {
        method: "GET",
        path: "/api/pipelines",
        summary: "List pipelines",
        description: "Get all CI pipeline runs with filtering",
        auth: true,
        queryParams: [
          { name: "status", type: "string", required: false, description: "running | passed | failed | cancelled" },
          { name: "repo", type: "string", required: false, description: "Filter by repository" },
          { name: "branch", type: "string", required: false, description: "Filter by branch" },
          { name: "teamId", type: "string", required: false, description: "Filter by team" },
        ],
        responseBody: {
          pipelines: [
            {
              id: "string",
              repo: "string",
              branch: "string",
              commit: "string",
              status: "running | passed | failed | cancelled",
              duration: "number (ms)",
              testsTotal: "number",
              testsPassed: "number",
              testsFailed: "number",
              healsApplied: "number",
              triggeredAt: "ISO 8601",
              triggeredBy: "string",
            },
          ],
        },
      },
      {
        method: "GET",
        path: "/api/pipelines/:id",
        summary: "Get pipeline details",
        description: "Get detailed pipeline run information with stage breakdown",
        auth: true,
        responseBody: {
          id: "string",
          repo: "string",
          branch: "string",
          commit: "string",
          commitMessage: "string",
          status: "string",
          stages: [
            {
              name: "string",
              status: "string",
              duration: "number",
              startedAt: "ISO 8601",
              finishedAt: "ISO 8601",
            },
          ],
          testResults: {
            total: "number",
            passed: "number",
            failed: "number",
            skipped: "number",
            flaky: "number",
          },
          healings: [
            {
              testId: "string",
              testName: "string",
              category: "string",
              applied: "boolean",
            },
          ],
          artifacts: [
            {
              name: "string",
              type: "string",
              url: "string",
              size: "number",
            },
          ],
        },
      },
      {
        method: "POST",
        path: "/api/pipelines/configure",
        summary: "Configure pipeline integration",
        description: "Sets up CI/CD pipeline integration with Shifty",
        auth: true,
        requestBody: {
          provider: "github | gitlab | jenkins | circleci | azure_devops",
          repoUrl: "string (required)",
          webhookSecret: "string",
          autoHeal: "boolean - Enable automatic healing",
          healingThreshold: "number - Confidence threshold for auto-healing",
          notifications: {
            slack: "string | null",
            email: "string[] | null",
          },
        },
        responseBody: {
          configId: "string",
          webhookUrl: "string",
          status: "active | pending_verification",
        },
      },
      {
        method: "POST",
        path: "/api/pipelines/webhook",
        summary: "CI webhook receiver",
        description: "Receives webhook events from CI providers",
        auth: false,
        requestBody: {
          provider: "github | gitlab | jenkins | circleci",
          event: "run_started | run_completed | test_failed",
          payload: "object - Provider-specific payload",
          signature: "string - HMAC signature for verification",
        },
        responseBody: {
          received: "boolean",
          pipelineId: "string",
        },
      },
      {
        method: "GET",
        path: "/api/pipelines/:id/logs",
        summary: "Get pipeline logs",
        description: "Retrieves test execution logs for a pipeline run",
        auth: true,
        responseBody: {
          logs: [
            {
              testId: "string",
              testName: "string",
              status: "string",
              duration: "number",
              output: "string",
              error: "string | null",
              healingAttempted: "boolean",
              healingSucceeded: "boolean",
              screenshots: ["string"],
            },
          ],
        },
      },
    ],
  },
  {
    name: "Insights",
    icon: BarChart3,
    description: "Analytics, DORA metrics, and ROI tracking",
    endpoints: [
      {
        method: "GET",
        path: "/api/insights/dashboard",
        summary: "Get dashboard metrics",
        description: "Retrieves aggregated metrics for the insights dashboard",
        auth: true,
        queryParams: [
          { name: "timeRange", type: "string", required: false, description: "7d | 30d | 90d | 1y" },
          { name: "teamId", type: "string", required: false, description: "Filter by team" },
          { name: "projectId", type: "string", required: false, description: "Filter by project" },
        ],
        responseBody: {
          testHealth: {
            total: "number",
            passing: "number",
            failing: "number",
            flaky: "number",
            coverage: "number (percentage)",
          },
          doraMetrics: {
            deploymentFrequency: { value: "string", trend: "string", status: "elite | high | medium | low" },
            leadTime: { value: "string", trend: "string", status: "string" },
            changeFailureRate: { value: "number", trend: "string", status: "string" },
            mttr: { value: "string", trend: "string", status: "string" },
          },
          trends: [
            {
              date: "ISO 8601",
              passRate: "number",
              avgDuration: "number",
              healingsApplied: "number",
            },
          ],
          testPyramid: {
            unit: { count: "number", percentage: "number" },
            integration: { count: "number", percentage: "number" },
            e2e: { count: "number", percentage: "number" },
            visual: { count: "number", percentage: "number" },
          },
          riskHotspots: [
            {
              id: "string",
              component: "string",
              riskScore: "number",
              failureRate: "number",
              lastFailure: "ISO 8601",
              riskFactors: [
                {
                  type: "string",
                  impact: "high | medium | low",
                  description: "string",
                },
              ],
            },
          ],
        },
      },
      {
        method: "GET",
        path: "/api/insights/roi",
        summary: "Get ROI metrics",
        description: "Calculates return on investment for QE automation",
        auth: true,
        queryParams: [{ name: "timeRange", type: "string", required: false, description: "30d | 90d | 1y | all" }],
        responseBody: {
          summary: {
            totalSavings: "number (currency)",
            hoursSaved: "number",
            bugsPreventedEstimate: "number",
            automationROI: "number (percentage)",
            paybackPeriod: "string",
          },
          breakdown: {
            healingValue: "number",
            testGenerationValue: "number",
            flakyTestReduction: "number",
            ciTimeReduction: "number",
            manualTestingReduction: "number",
          },
          trends: [
            {
              period: "string",
              savings: "number",
              hoursSaved: "number",
            },
          ],
        },
      },
      {
        method: "GET",
        path: "/api/insights/roi/config",
        summary: "Get ROI configuration",
        description: "Returns current cost parameters for ROI calculation",
        auth: true,
        responseBody: {
          devHourlyRate: "number",
          qaHourlyRate: "number",
          ciCostPerMinute: "number",
          bugCostEstimate: "number",
          currency: "string (ISO 4217)",
          avgBugFixTime: "number (hours)",
          avgTestWriteTime: "number (minutes)",
        },
      },
      {
        method: "PUT",
        path: "/api/insights/roi/config",
        summary: "Update ROI configuration",
        description: "Updates cost parameters for accurate ROI calculation",
        auth: true,
        requestBody: {
          devHourlyRate: "number",
          qaHourlyRate: "number",
          ciCostPerMinute: "number",
          bugCostEstimate: "number",
          currency: "string (ISO 4217)",
          avgBugFixTime: "number (hours)",
          avgTestWriteTime: "number (minutes)",
        },
        responseBody: {
          updated: "boolean",
          config: "object",
          recalculatedROI: "number",
        },
      },
    ],
  },
  {
    name: "Knowledge",
    icon: Brain,
    description: "Knowledge base management, search, and AI chat",
    endpoints: [
      {
        method: "GET",
        path: "/api/knowledge",
        summary: "Search knowledge base",
        description: "Searches knowledge entries with optional filters",
        auth: true,
        queryParams: [
          { name: "q", type: "string", required: false, description: "Search query" },
          {
            name: "type",
            type: "string",
            required: false,
            description: "architecture | domain | expert | risk | cost | decision | insight | date",
          },
          { name: "source", type: "string", required: false, description: "agent | manual | pipeline | session" },
          { name: "tags", type: "string[]", required: false, description: "Filter by tags" },
        ],
        responseBody: {
          entries: [
            {
              id: "string",
              type: "string",
              title: "string",
              summary: "string",
              source: "string",
              confidence: "number",
              tags: "string[]",
              updatedAt: "ISO 8601",
              relatedEntities: "string[]",
            },
          ],
          total: "number",
        },
      },
      {
        method: "GET",
        path: "/api/knowledge/:id",
        summary: "Get knowledge entry",
        description: "Returns full knowledge entry with relationships",
        auth: true,
        responseBody: {
          id: "string",
          type: "string",
          title: "string",
          content: "string (markdown)",
          summary: "string",
          source: "string",
          confidence: "number",
          tags: "string[]",
          metadata: "object",
          relatedEntries: [
            {
              id: "string",
              title: "string",
              type: "string",
              relevance: "number",
            },
          ],
          history: [
            {
              action: "created | updated",
              by: "string",
              timestamp: "ISO 8601",
              changes: "string",
            },
          ],
          createdAt: "ISO 8601",
          updatedAt: "ISO 8601",
        },
      },
      {
        method: "POST",
        path: "/api/knowledge/chat",
        summary: "Chat with knowledge base",
        description: "Natural language query against knowledge base using LLM",
        auth: true,
        requestBody: {
          message: "string (required)",
          conversationId: "string - For multi-turn conversations",
          includeSources: "boolean - Whether to return source entries",
          context: "{ teamId?: string, projectId?: string } - Scope the knowledge",
        },
        responseBody: {
          response: "string",
          sources: [
            {
              id: "string",
              title: "string",
              type: "string",
              relevance: "number",
              excerpt: "string",
            },
          ],
          conversationId: "string",
          suggestedFollowUps: ["string"],
        },
      },
      {
        method: "POST",
        path: "/api/knowledge",
        summary: "Create knowledge entry",
        description: "Manually adds a knowledge entry",
        auth: true,
        requestBody: {
          type: "string (required)",
          title: "string (required)",
          content: "string (required) - Markdown supported",
          tags: "string[]",
          relatedEntities: "string[]",
          metadata: "object",
        },
        responseBody: {
          id: "string",
          created: "boolean",
        },
      },
      {
        method: "GET",
        path: "/api/knowledge/graph",
        summary: "Get knowledge graph",
        description: "Returns knowledge entities and relationships for visualization",
        auth: true,
        queryParams: [
          { name: "rootId", type: "string", required: false, description: "Center graph on specific entry" },
          { name: "depth", type: "number", required: false, description: "Relationship traversal depth (default: 2)" },
        ],
        responseBody: {
          nodes: [
            {
              id: "string",
              type: "string",
              label: "string",
              size: "number",
            },
          ],
          edges: [
            {
              source: "string",
              target: "string",
              relationship: "string",
              strength: "number",
            },
          ],
        },
      },
    ],
  },
  {
    name: "Agent PRs",
    icon: Webhook,
    description: "Manage pull requests created by Shifty agents",
    endpoints: [
      {
        method: "GET",
        path: "/api/agent-prs",
        summary: "List agent PRs",
        description: "Get all pull requests created by Shifty agents",
        auth: true,
        queryParams: [
          { name: "status", type: "string", required: false, description: "open | merged | closed | draft" },
          {
            name: "agent",
            type: "string",
            required: false,
            description: "healing | test-gen | labeling | selector-update",
          },
          { name: "repo", type: "string", required: false, description: "Filter by repository" },
          { name: "teamId", type: "string", required: false, description: "Filter by team" },
        ],
        responseBody: {
          prs: [
            {
              id: "string",
              title: "string",
              description: "string",
              agent: "healing | test-gen | labeling | selector-update",
              repo: "string",
              branch: "string",
              baseBranch: "string",
              status: "open | merged | closed | draft",
              url: "string",
              filesChanged: "number",
              additions: "number",
              deletions: "number",
              checks: {
                passed: "number",
                failed: "number",
                pending: "number",
              },
              reviewers: ["string"],
              createdAt: "ISO 8601",
              updatedAt: "ISO 8601",
            },
          ],
          summary: {
            total: "number",
            open: "number",
            merged: "number",
            closed: "number",
          },
        },
      },
      {
        method: "GET",
        path: "/api/agent-prs/:id",
        summary: "Get PR details",
        description: "Returns detailed PR information with diff and rationale",
        auth: true,
        responseBody: {
          id: "string",
          title: "string",
          description: "string",
          agent: "string",
          agentRationale: "string - Why the agent made these changes",
          repo: "string",
          branch: "string",
          status: "string",
          url: "string",
          files: [
            {
              path: "string",
              status: "added | modified | deleted",
              additions: "number",
              deletions: "number",
              diff: "string",
            },
          ],
          relatedItems: {
            healingId: "string | null",
            testIds: "string[]",
            sessionId: "string | null",
          },
          reviews: [
            {
              reviewer: "string",
              status: "approved | changes_requested | commented",
              comment: "string",
              timestamp: "ISO 8601",
            },
          ],
        },
      },
      {
        method: "POST",
        path: "/api/agent-prs/:id/approve",
        summary: "Approve and merge PR",
        description: "Approves and optionally merges an agent-created PR",
        auth: true,
        requestBody: {
          merge: "boolean - Whether to merge after approval",
          mergeMethod: "merge | squash | rebase",
          comment: "string - Approval comment",
        },
        responseBody: {
          approved: "boolean",
          merged: "boolean",
          sha: "string | null",
        },
      },
      {
        method: "POST",
        path: "/api/agent-prs/:id/request-changes",
        summary: "Request changes on PR",
        description: "Requests changes with feedback for agent improvement",
        auth: true,
        requestBody: {
          comment: "string (required)",
          suggestions: "[{ file: string, line: number, suggestion: string }]",
        },
        responseBody: {
          submitted: "boolean",
        },
      },
    ],
  },
  {
    name: "Arcade",
    icon: Trophy,
    description: "HITL gamification, missions, and training tasks",
    endpoints: [
      {
        method: "GET",
        path: "/api/arcade/missions",
        summary: "Get available missions",
        description: "Lists HITL missions available to the user",
        auth: true,
        queryParams: [
          {
            name: "type",
            type: "string",
            required: false,
            description: "label | verify | triage | review_test_plan | design_validation",
          },
          { name: "difficulty", type: "string", required: false, description: "easy | medium | hard" },
        ],
        responseBody: {
          missions: [
            {
              id: "string",
              title: "string",
              description: "string",
              type: "label | verify | triage | review_test_plan | design_validation",
              xpReward: "number",
              taskCount: "number",
              estimatedTime: "string",
              difficulty: "easy | medium | hard",
              claimed: "boolean",
              prerequisites: "string[]",
            },
          ],
          dailyBonus: {
            available: "boolean",
            multiplier: "number",
            expiresAt: "ISO 8601",
          },
        },
      },
      {
        method: "POST",
        path: "/api/arcade/missions/:id/start",
        summary: "Start a mission",
        description: "Claims and starts a HITL mission",
        auth: true,
        responseBody: {
          missionId: "string",
          tasks: [
            {
              id: "string",
              type: "string",
              data: "object - Task-specific data",
              instructions: "string",
            },
          ],
          timeLimit: "number (seconds) | null",
        },
      },
      {
        method: "POST",
        path: "/api/arcade/missions/:id/submit",
        summary: "Submit mission results",
        description: "Submits completed mission tasks for scoring",
        auth: true,
        requestBody: {
          responses: [
            {
              taskId: "string",
              answer: "object - Task-specific response",
              timeSpent: "number (seconds)",
              confidence: "number - User's confidence in answer",
            },
          ],
        },
        responseBody: {
          score: "number",
          xpEarned: "number",
          accuracy: "number (percentage)",
          feedback: [
            {
              taskId: "string",
              correct: "boolean",
              explanation: "string",
            },
          ],
          newBadges: ["string"],
          levelUp: "boolean",
          newLevel: "number | null",
        },
      },
      {
        method: "GET",
        path: "/api/arcade/leaderboard",
        summary: "Get leaderboard",
        description: "Returns top contributors by XP",
        auth: true,
        queryParams: [
          { name: "scope", type: "string", required: false, description: "global | team | weekly | monthly" },
          { name: "teamId", type: "string", required: false, description: "For team scope" },
        ],
        responseBody: {
          leaders: [
            {
              rank: "number",
              userId: "string",
              name: "string",
              avatar: "string",
              teamName: "string",
              xp: "number",
              level: "number",
              badges: ["string"],
              accuracy: "number",
              streak: "number",
            },
          ],
          userRank: {
            rank: "number",
            xp: "number",
            percentile: "number",
          },
        },
      },
      {
        method: "GET",
        path: "/api/arcade/profile",
        summary: "Get user arcade profile",
        description: "Returns user's gamification profile and achievements",
        auth: true,
        responseBody: {
          xp: "number",
          level: "number",
          nextLevelXp: "number",
          badges: [
            {
              id: "string",
              name: "string",
              description: "string",
              earnedAt: "ISO 8601",
              rarity: "common | uncommon | rare | epic | legendary",
            },
          ],
          stats: {
            missionsCompleted: "number",
            tasksCompleted: "number",
            accuracy: "number",
            currentStreak: "number",
            longestStreak: "number",
          },
          recentActivity: [
            {
              type: "string",
              description: "string",
              xpEarned: "number",
              timestamp: "ISO 8601",
            },
          ],
        },
      },
    ],
  },
  {
    name: "Telemetry",
    icon: Activity,
    description: "OpenTelemetry ingestion and metrics",
    endpoints: [
      {
        method: "POST",
        path: "/api/telemetry/ingest",
        summary: "Ingest telemetry data",
        description: "Receives OpenTelemetry traces and metrics from SDK",
        auth: true,
        requestBody: {
          format: "otlp | prometheus",
          data: "object - OpenTelemetry protobuf or JSON",
          source: "sdk | browser | ci",
        },
        responseBody: {
          accepted: "boolean",
          tracesReceived: "number",
          metricsReceived: "number",
          processingId: "string",
        },
      },
      {
        method: "GET",
        path: "/api/telemetry/metrics",
        summary: "Query metrics",
        description: "Retrieves Prometheus-compatible metrics",
        auth: true,
        queryParams: [
          { name: "query", type: "string", required: true, description: "PromQL query" },
          { name: "start", type: "string", required: false, description: "Start time (ISO 8601)" },
          { name: "end", type: "string", required: false, description: "End time (ISO 8601)" },
          { name: "step", type: "string", required: false, description: "Query resolution step" },
        ],
        responseBody: {
          resultType: "matrix | vector | scalar",
          result: "array",
        },
      },
      {
        method: "GET",
        path: "/api/telemetry/traces/:traceId",
        summary: "Get trace details",
        description: "Returns detailed trace information with spans",
        auth: true,
        responseBody: {
          traceId: "string",
          rootSpan: {
            spanId: "string",
            operationName: "string",
            duration: "number",
            status: "string",
            children: "Span[]",
          },
          services: ["string"],
          duration: "number",
          timestamp: "ISO 8601",
        },
      },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    description: "User preferences and tenant configuration",
    endpoints: [
      {
        method: "GET",
        path: "/api/settings",
        summary: "Get user settings",
        description: "Returns user preferences and notification settings",
        auth: true,
        responseBody: {
          theme: "light | dark | system",
          notifications: {
            email: "boolean",
            slack: "boolean",
            inApp: "boolean",
            healingAlerts: "boolean",
            pipelineFailures: "boolean",
            weeklyDigest: "boolean",
          },
          defaultPersona: "string",
          timezone: "string",
          language: "string",
        },
      },
      {
        method: "PUT",
        path: "/api/settings",
        summary: "Update user settings",
        description: "Updates user preferences",
        auth: true,
        requestBody: {
          theme: "light | dark | system",
          notifications: "object",
          defaultPersona: "string",
          timezone: "string",
          language: "string",
        },
        responseBody: {
          updated: "boolean",
          settings: "object",
        },
      },
      {
        method: "GET",
        path: "/api/settings/tenant",
        summary: "Get tenant settings",
        description: "Returns tenant-level configuration (admin only)",
        auth: true,
        responseBody: {
          id: "string",
          name: "string",
          slug: "string",
          logo: "string | null",
          features: {
            healing: "boolean",
            testGeneration: "boolean",
            arcade: "boolean",
            knowledgeBase: "boolean",
          },
          integrations: {
            github: "boolean",
            gitlab: "boolean",
            slack: "boolean",
            jira: "boolean",
          },
          limits: {
            maxUsers: "number",
            maxProjects: "number",
            maxTestsPerMonth: "number",
          },
          billing: {
            plan: "free | pro | enterprise",
            status: "active | trialing | past_due",
            trialEndsAt: "ISO 8601 | null",
          },
        },
      },
      {
        method: "PUT",
        path: "/api/settings/tenant",
        summary: "Update tenant settings",
        description: "Updates tenant configuration (admin only)",
        auth: true,
        requestBody: {
          name: "string",
          logo: "string",
          features: "object",
        },
        responseBody: {
          updated: "boolean",
        },
      },
    ],
  },
  {
    name: "Users & Members",
    icon: UserCog,
    description: "User management and team membership",
    endpoints: [
      {
        method: "GET",
        path: "/api/users/me",
        summary: "Get current user",
        description: "Returns the authenticated user profile",
        auth: true,
        responseBody: {
          id: "string",
          email: "string",
          name: "string",
          avatar: "string | null",
          persona: "string",
          role: "admin | member | viewer",
          tenant: {
            id: "string",
            name: "string",
            slug: "string",
          },
          teams: [
            {
              id: "string",
              name: "string",
              role: "string",
            },
          ],
          preferences: "object",
          createdAt: "ISO 8601",
        },
      },
      {
        method: "GET",
        path: "/api/users",
        summary: "List users",
        description: "Returns all users in the tenant (admin only)",
        auth: true,
        queryParams: [
          { name: "role", type: "string", required: false, description: "Filter by role" },
          { name: "teamId", type: "string", required: false, description: "Filter by team membership" },
          { name: "search", type: "string", required: false, description: "Search by name or email" },
        ],
        responseBody: {
          users: [
            {
              id: "string",
              email: "string",
              name: "string",
              avatar: "string",
              role: "string",
              persona: "string",
              teams: "string[]",
              lastActive: "ISO 8601",
              status: "active | invited | deactivated",
            },
          ],
          total: "number",
        },
      },
      {
        method: "POST",
        path: "/api/users/invite",
        summary: "Invite user",
        description: "Sends invitation to new user",
        auth: true,
        requestBody: {
          email: "string (required)",
          role: "admin | member | viewer",
          teamIds: "string[]",
          persona: "string",
        },
        responseBody: {
          invited: "boolean",
          invitationId: "string",
        },
      },
      {
        method: "GET",
        path: "/api/tenants",
        summary: "List user tenants",
        description: "Lists all tenants the user has access to",
        auth: true,
        responseBody: {
          tenants: [
            {
              id: "string",
              name: "string",
              slug: "string",
              logo: "string | null",
              role: "string",
              plan: "string",
            },
          ],
        },
      },
      {
        method: "POST",
        path: "/api/tenants/:id/switch",
        summary: "Switch tenant context",
        description: "Switches the user active tenant context",
        auth: true,
        responseBody: {
          success: "boolean",
          tenant: "object",
          newAccessToken: "string",
        },
      },
    ],
  },
]

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/20 text-emerald-400",
  POST: "bg-blue-500/20 text-blue-400",
  PUT: "bg-amber-500/20 text-amber-400",
  PATCH: "bg-orange-500/20 text-orange-400",
  DELETE: "bg-red-500/20 text-red-400",
}

export function ApiDocsHub() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSections, setExpandedSections] = useState<string[]>(["Authentication"])
  const [expandedEndpoints, setExpandedEndpoints] = useState<string[]>([])
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const toggleSection = (name: string) => {
    setExpandedSections((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]))
  }

  const toggleEndpoint = (path: string) => {
    setExpandedEndpoints((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]))
  }

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path)
    setCopiedPath(path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  const categoryGroups: Record<string, string[]> = {
    all: apiSections.map((s) => s.name),
    core: ["Authentication", "Users & Members", "Settings"],
    organization: ["Organization", "Teams", "Projects", "Adoption"],
    testing: ["Tests", "Healing", "Sessions", "Pipelines"],
    intelligence: ["Insights", "Knowledge", "Agent PRs", "Arcade", "Telemetry"],
  }

  const filteredSections = apiSections
    .filter((section) => categoryGroups[activeTab].includes(section.name))
    .map((section) => ({
      ...section,
      endpoints: section.endpoints.filter(
        (endpoint) =>
          searchQuery === "" ||
          endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          endpoint.summary.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((section) => section.endpoints.length > 0)

  const totalEndpoints = apiSections.reduce((acc, s) => acc + s.endpoints.length, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileCode2 className="w-7 h-7 text-primary" />
            API Documentation
          </h1>
          <p className="text-muted-foreground mt-1">Consumer contracts for Shifty platform backend integration</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.0.0</Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            OpenAPI 3.1
          </Badge>
          <Button variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Export OpenAPI
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalEndpoints}</div>
                <div className="text-sm text-muted-foreground">Endpoints</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <Database className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <div className="text-2xl font-bold">{apiSections.length}</div>
                <div className="text-sm text-muted-foreground">Resource Groups</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-3/10">
                <Lock className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <div className="text-2xl font-bold">JWT</div>
                <div className="text-sm text-muted-foreground">Auth Method</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Webhook className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">REST</div>
                <div className="text-sm text-muted-foreground">Protocol</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All APIs</TabsTrigger>
          <TabsTrigger value="core">Core</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search endpoints..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* API Sections */}
      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="col-span-1 h-fit sticky top-6">
          <CardHeader>
            <CardTitle className="text-sm">Resources</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="p-2 space-y-1">
                {apiSections
                  .filter((section) => categoryGroups[activeTab].includes(section.name))
                  .map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.name}
                        onClick={() => toggleSection(section.name)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                          expandedSections.includes(section.name)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {section.name}
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {section.endpoints.length}
                        </Badge>
                      </button>
                    )
                  })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Endpoint Details */}
        <div className="col-span-3 space-y-4">
          {filteredSections.map((section) => {
            const Icon = section.icon
            const isExpanded = expandedSections.includes(section.name)

            return (
              <Collapsible key={section.name} open={isExpanded} onOpenChange={() => toggleSection(section.name)}>
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-base">{section.name}</CardTitle>
                            <CardDescription className="text-sm">{section.description}</CardDescription>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-3">
                      {section.endpoints.map((endpoint) => {
                        const endpointKey = `${endpoint.method}-${endpoint.path}`
                        const isEndpointExpanded = expandedEndpoints.includes(endpointKey)

                        return (
                          <Collapsible
                            key={endpointKey}
                            open={isEndpointExpanded}
                            onOpenChange={() => toggleEndpoint(endpointKey)}
                          >
                            <div className="border rounded-lg overflow-hidden">
                              <CollapsibleTrigger className="w-full">
                                <div className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                                  <Badge
                                    className={`${methodColors[endpoint.method]} font-mono text-xs w-16 justify-center`}
                                  >
                                    {endpoint.method}
                                  </Badge>
                                  <code className="text-sm font-mono flex-1 text-left">{endpoint.path}</code>
                                  <div className="flex items-center gap-2">
                                    {endpoint.auth ? (
                                      <Lock className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                      <Unlock className="w-4 h-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm text-muted-foreground hidden md:block">
                                      {endpoint.summary}
                                    </span>
                                    {isEndpointExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </div>
                                </div>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <div className="p-4 space-y-4 bg-card">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                                    <Button variant="ghost" size="sm" onClick={() => copyPath(endpoint.path)}>
                                      {copiedPath === endpoint.path ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>

                                  {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">Query Parameters</h4>
                                      <div className="bg-muted rounded-lg p-3 space-y-2">
                                        {endpoint.queryParams.map((param) => (
                                          <div key={param.name} className="flex items-start gap-2 text-sm">
                                            <code className="text-primary">{param.name}</code>
                                            <span className="text-muted-foreground">({param.type})</span>
                                            {param.required && (
                                              <Badge variant="destructive" className="text-xs">
                                                required
                                              </Badge>
                                            )}
                                            <span className="text-muted-foreground">- {param.description}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {endpoint.requestBody && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">Request Body</h4>
                                      <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto">
                                        {JSON.stringify(endpoint.requestBody, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Response</h4>
                                    <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto">
                                      {JSON.stringify(endpoint.responseBody, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        )
                      })}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )
          })}
        </div>
      </div>
    </div>
  )
}
