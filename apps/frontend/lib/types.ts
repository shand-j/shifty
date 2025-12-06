export type Persona = "po" | "dev" | "qa" | "designer" | "manager" | "gtm"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  persona: Persona
  role: "admin" | "member" | "viewer"
}

export interface Tenant {
  id: string
  name: string
  slug: string
  logo?: string
  accentColor?: string
}

export interface Project {
  id: string
  name: string
  tenantId: string
}

export interface TestCase {
  id: string
  name: string
  projectId: string
  suiteId: string
  status: "passing" | "failing" | "flaky" | "skipped"
  tags: string[]
  owner: string
  createdAt: string
  updatedAt: string
  code: string
  framework: "playwright" | "cypress" | "jest" | "vitest"
}

export interface TestSuite {
  id: string
  name: string
  projectId: string
  testCount: number
  passingCount: number
  failingCount: number
  flakyCount: number
}

export interface HealingItem {
  id: string
  testId: string
  testName: string
  originalSelector: string
  healedSelector: string
  confidence: number
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export interface Session {
  id: string
  name: string
  type: "scripted" | "exploratory" | "accessibility" | "performance"
  status: "draft" | "active" | "completed" | "archived"
  owner: User
  progress: number
  totalSteps: number
  createdAt: string
}

export interface Pipeline {
  id: string
  repo: string
  branch: string
  status: "running" | "passed" | "failed" | "cancelled"
  duration: number
  testsTotal: number
  testsPassed: number
  testsFailed: number
  testsSkipped: number
  healsCount: number
  triggeredAt: string
}

export interface Notification {
  id: string
  type: "ci_failure" | "healing_required" | "roi_alert" | "hitl_prompt" | "mention"
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

export interface Mission {
  id: string
  title: string
  type: "label" | "verify" | "triage"
  xpReward: number
  badge?: string
  estimatedTime: string
  claimed: boolean
}

export interface KnowledgeEntry {
  id: string
  type: "architecture" | "domain" | "expert" | "date" | "cost" | "risk" | "decision" | "requirement" | "insight"
  title: string
  content: string
  summary: string
  source: "agent" | "manual" | "pipeline" | "session"
  sourceAgent?: string
  tags: string[]
  relatedEntities: string[]
  confidence: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface KnowledgeCategory {
  id: string
  name: string
  icon: string
  count: number
  description: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: KnowledgeEntry[]
  timestamp: string
}

export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  summary: string
  description: string
  tags: string[]
  requestBody?: ApiSchema
  responseBody: ApiSchema
  queryParams?: ApiParam[]
  pathParams?: ApiParam[]
  headers?: ApiParam[]
  authentication: "required" | "optional" | "none"
  rateLimit?: string
  examples?: ApiExample[]
}

export interface ApiSchema {
  type: string
  properties?: Record<string, ApiSchemaProperty>
  required?: string[]
  example?: unknown
}

export interface ApiSchemaProperty {
  type: string
  description: string
  format?: string
  enum?: string[]
  items?: ApiSchemaProperty
  example?: unknown
}

export interface ApiParam {
  name: string
  type: string
  required: boolean
  description: string
  example?: string
}

export interface ApiExample {
  name: string
  request?: unknown
  response: unknown
}

export interface Team {
  id: string
  name: string
  slug: string
  managerId: string
  members: TeamMember[]
  projects: string[]
  maturityLevel: MaturityLevel
  adoptionScore: number
  qualityCulture: QualityCultureScore
  createdAt: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: "lead" | "senior" | "mid" | "junior"
  persona: Persona
  joinedAt: string
  stats: MemberStats
  attentionFlags: AttentionFlag[]
  skills: SkillAssessment[]
  xp: number
  level: number
  streak: number
}

export interface MemberStats {
  testsWritten: number
  testsHealed: number
  sessionsCompleted: number
  hitlContributions: number
  prsReviewed: number
  bugsPrevented: number
  avgTestQuality: number
  collaborationScore: number
}

export interface AttentionFlag {
  type: "struggling" | "disengaged" | "overloaded" | "skill_gap" | "mentorship_opportunity"
  severity: "low" | "medium" | "high"
  reason: string
  recommendation: string
  detectedAt: string
}

export interface SkillAssessment {
  skill: string
  level: number
  trend: "improving" | "stable" | "declining"
  lastAssessed: string
}

export type MaturityLevel = 1 | 2 | 3 | 4 | 5

export interface MaturityAssessment {
  level: MaturityLevel
  dimensions: MaturityDimension[]
  recommendations: string[]
  nextLevelRequirements: string[]
  assessedAt: string
}

export interface MaturityDimension {
  name: string
  score: number
  maxScore: number
  description: string
  indicators: string[]
}

export interface QualityCultureScore {
  overall: number
  dimensions: {
    shiftLeftMindset: number
    testOwnership: number
    collaborationCulture: number
    continuousImprovement: number
    automationFirst: number
    dataInformed: number
  }
  trends: {
    dimension: string
    change: number
    period: string
  }[]
}

export interface AdoptionMetrics {
  overall: number
  byFeature: FeatureAdoption[]
  byTeam: TeamAdoption[]
  onboardingFunnel: OnboardingStage[]
  engagementTrends: EngagementData[]
  churnRisk: ChurnRiskItem[]
}

export interface FeatureAdoption {
  feature: string
  adoptionRate: number
  activeUsers: number
  totalUsers: number
  trend: number
  lastUsed: string
}

export interface TeamAdoption {
  teamId: string
  teamName: string
  adoptionScore: number
  activeMembers: number
  totalMembers: number
  topFeatures: string[]
  lastActivity: string
}

export interface OnboardingStage {
  stage: string
  count: number
  conversionRate: number
  avgTimeToComplete: string
}

export interface EngagementData {
  date: string
  dau: number
  wau: number
  mau: number
  sessions: number
}

export interface ChurnRiskItem {
  userId: string
  userName: string
  teamName: string
  riskLevel: "low" | "medium" | "high"
  lastActive: string
  daysInactive: number
  reasons: string[]
}

export interface ProjectHealth {
  id: string
  name: string
  teamId: string
  qualityScore: number
  testCoverage: number
  flakyTestRatio: number
  avgCycleTime: number
  riskLevel: "low" | "medium" | "high" | "critical"
  features: FeatureConfidence[]
  recentActivity: ActivityItem[]
}

export interface FeatureConfidence {
  id: string
  name: string
  confidence: number
  testCount: number
  passingTests: number
  failingTests: number
  flakyTests: number
  lastTested: string
  riskFactors: string[]
  coverage: {
    unit: number
    integration: number
    e2e: number
  }
}

export interface ActivityItem {
  id: string
  type: "test_added" | "test_healed" | "pr_merged" | "incident" | "session_completed"
  description: string
  user: string
  timestamp: string
}

export interface LeaderboardEntry {
  rank: number
  previousRank: number
  userId: string
  userName: string
  avatar?: string
  teamName: string
  xp: number
  level: number
  badges: string[]
  streak: number
  weeklyGain: number
}
