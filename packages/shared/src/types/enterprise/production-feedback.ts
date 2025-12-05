import { z } from 'zod';

// Error Source
export const ErrorSourceSchema = z.enum([
  'sentry',
  'datadog',
  'new_relic',
  'application_logs',
  'custom_webhook',
]);

export type ErrorSource = z.infer<typeof ErrorSourceSchema>;

// Error Severity
export const ErrorSeveritySchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
  'info',
]);

export type ErrorSeverity = z.infer<typeof ErrorSeveritySchema>;

// Error Event
export const ErrorEventSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  source: ErrorSourceSchema,
  externalId: z.string(), // ID from source system
  errorType: z.string(), // e.g., "NullPointerException", "TypeError"
  message: z.string(),
  stackTrace: z.string().optional(),
  severity: ErrorSeveritySchema,
  environment: z.string(), // e.g., "production", "staging"
  service: z.string(),
  endpoint: z.string().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
  firstSeen: z.date(),
  lastSeen: z.date(),
  occurrenceCount: z.number().default(1),
  createdAt: z.date(),
});

export type ErrorEvent = z.infer<typeof ErrorEventSchema>;

// Error Cluster
export const ErrorClusterSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  fingerprint: z.string(), // Unique identifier for grouping similar errors
  errorType: z.string(),
  primaryMessage: z.string(),
  severity: ErrorSeveritySchema,
  status: z.enum(['new', 'acknowledged', 'investigating', 'resolved', 'ignored']),
  affectedServices: z.array(z.string()),
  affectedEndpoints: z.array(z.string()),
  errorCount: z.number(),
  impactedUsers: z.number().optional(),
  firstOccurrence: z.date(),
  lastOccurrence: z.date(),
  resolvedAt: z.date().optional(),
  assignedTo: z.string().uuid().optional(),
  regressionTestId: z.string().uuid().optional(), // Generated test to catch this error
  jiraTicketId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ErrorCluster = z.infer<typeof ErrorClusterSchema>;

// Regression Test Generation Request
export const RegressionTestRequestSchema = z.object({
  tenantId: z.string().uuid(),
  errorClusterId: z.string().uuid(),
  framework: z.enum(['playwright', 'cypress', 'jest', 'mocha', 'pytest']).default('playwright'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  targetEndpoints: z.array(z.string()).default([]),
  includeStackTrace: z.boolean().default(true),
  generateMultipleScenarios: z.boolean().default(true),
});

export type RegressionTestRequest = z.infer<typeof RegressionTestRequestSchema>;

// Generated Regression Test
export const RegressionTestSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  errorClusterId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  framework: z.string(),
  testCode: z.string(),
  scenarios: z.array(z.object({
    name: z.string(),
    steps: z.array(z.string()),
    assertions: z.array(z.string()),
  })).default([]),
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected', 'deployed']),
  validationResult: z.object({
    passed: z.boolean(),
    executionTime: z.number(),
    failureMessage: z.string().optional(),
  }).optional(),
  approvedBy: z.string().uuid().optional(),
  deployedToPipeline: z.boolean().default(false),
  pipelineId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RegressionTest = z.infer<typeof RegressionTestSchema>;

// Feedback Loop Action
export const FeedbackLoopActionSchema = z.enum([
  'create_jira_ticket',
  'generate_regression_test',
  'update_pipeline_policy',
  'notify_team',
  'trigger_investigation',
  'auto_rollback',
]);

export type FeedbackLoopAction = z.infer<typeof FeedbackLoopActionSchema>;

// Feedback Loop Rule
export const FeedbackLoopRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  trigger: z.object({
    errorSeverity: z.array(ErrorSeveritySchema).optional(),
    errorCountThreshold: z.number().optional(),
    timeWindowMinutes: z.number().optional(),
    services: z.array(z.string()).optional(),
    environments: z.array(z.string()).optional(),
  }),
  actions: z.array(FeedbackLoopActionSchema),
  actionConfig: z.record(z.unknown()).default({}),
  enabled: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FeedbackLoopRule = z.infer<typeof FeedbackLoopRuleSchema>;

// Feedback Loop Execution
export const FeedbackLoopExecutionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  ruleId: z.string().uuid(),
  errorClusterId: z.string().uuid(),
  triggeredActions: z.array(z.object({
    action: FeedbackLoopActionSchema,
    status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
    result: z.record(z.unknown()).optional(),
    startedAt: z.date().optional(),
    completedAt: z.date().optional(),
    error: z.string().optional(),
  })),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'partial']),
  createdAt: z.date(),
  completedAt: z.date().optional(),
});

export type FeedbackLoopExecution = z.infer<typeof FeedbackLoopExecutionSchema>;

// Production Incident
export const ProductionIncidentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  severity: ErrorSeveritySchema,
  status: z.enum(['open', 'investigating', 'mitigating', 'resolved', 'postmortem']),
  errorClusters: z.array(z.string().uuid()),
  affectedServices: z.array(z.string()),
  startTime: z.date(),
  resolvedTime: z.date().optional(),
  assignedTeam: z.string().optional(),
  jiraTicketId: z.string().optional(),
  slackChannelId: z.string().optional(),
  timeline: z.array(z.object({
    timestamp: z.date(),
    action: z.string(),
    actor: z.string(),
    details: z.string().optional(),
  })).default([]),
  regressionTests: z.array(z.string().uuid()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductionIncident = z.infer<typeof ProductionIncidentSchema>;

// Service Health Metric
export const ServiceHealthMetricSchema = z.object({
  tenantId: z.string().uuid(),
  service: z.string(),
  timestamp: z.date(),
  latencyP50: z.number(),
  latencyP95: z.number(),
  latencyP99: z.number(),
  errorRate: z.number(),
  requestCount: z.number(),
  successRate: z.number(),
  cpuUsage: z.number().optional(),
  memoryUsage: z.number().optional(),
});

export type ServiceHealthMetric = z.infer<typeof ServiceHealthMetricSchema>;

// Impact Analysis
export const ImpactAnalysisSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  errorClusterId: z.string().uuid(),
  impactScore: z.number().min(0).max(100), // 0-100
  businessImpact: z.enum(['critical', 'high', 'medium', 'low', 'minimal']),
  estimatedUsersAffected: z.number(),
  estimatedRevenueImpact: z.number().optional(),
  affectedFeatures: z.array(z.string()),
  recommendations: z.array(z.object({
    priority: z.number(),
    action: z.string(),
    reasoning: z.string(),
  })),
  createdAt: z.date(),
});

export type ImpactAnalysis = z.infer<typeof ImpactAnalysisSchema>;
