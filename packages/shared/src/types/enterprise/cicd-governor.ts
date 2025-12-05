import { z } from 'zod';

// Policy Rule Types
export const PolicyRuleTypeSchema = z.enum([
  'latency',
  'error_rate', 
  'coverage',
  'test_pass_rate',
  'security_scan',
  'performance',
  'custom',
]);

export type PolicyRuleType = z.infer<typeof PolicyRuleTypeSchema>;

// Comparison Operators
export const ComparisonOperatorSchema = z.enum([
  'gt',      // greater than
  'gte',     // greater than or equal
  'lt',      // less than
  'lte',     // less than or equal
  'eq',      // equal
  'neq',     // not equal
  'between', // between range
]);

export type ComparisonOperator = z.infer<typeof ComparisonOperatorSchema>;

// Policy Rule
export const PolicyRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: PolicyRuleTypeSchema,
  metric: z.string(), // e.g., 'p99_latency_ms', 'error_rate_percent', 'line_coverage'
  operator: ComparisonOperatorSchema,
  threshold: z.number(),
  thresholdMax: z.number().optional(), // For 'between' operator
  severity: z.enum(['warning', 'critical', 'blocker']),
  enabled: z.boolean().default(true),
});

export type PolicyRule = z.infer<typeof PolicyRuleSchema>;

// Release Policy
export const ReleasePolicySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  rules: z.array(PolicyRuleSchema),
  rollbackOnFailure: z.boolean().default(true),
  notifyOnViolation: z.boolean().default(true),
  notificationChannels: z.array(z.enum(['email', 'slack', 'webhook', 'jira'])).default([]),
  webhookUrls: z.array(z.string().url()).default([]),
  enabled: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ReleasePolicy = z.infer<typeof ReleasePolicySchema>;

// Policy Evaluation Status
export const PolicyEvaluationStatusSchema = z.enum([
  'pending',
  'running',
  'passed',
  'failed',
  'warning',
  'skipped',
]);

export type PolicyEvaluationStatus = z.infer<typeof PolicyEvaluationStatusSchema>;

// Rule Evaluation Result
export const RuleEvaluationResultSchema = z.object({
  ruleId: z.string().uuid(),
  ruleName: z.string(),
  status: PolicyEvaluationStatusSchema,
  actualValue: z.number(),
  expectedValue: z.number(),
  message: z.string().optional(),
});

export type RuleEvaluationResult = z.infer<typeof RuleEvaluationResultSchema>;

// Policy Evaluation
export const PolicyEvaluationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  policyId: z.string().uuid(),
  pipelineId: z.string(),
  commitSha: z.string(),
  branch: z.string(),
  status: PolicyEvaluationStatusSchema,
  ruleResults: z.array(RuleEvaluationResultSchema),
  triggeredRollback: z.boolean().default(false),
  rollbackDetails: z.object({
    targetVersion: z.string(),
    reason: z.string(),
    initiatedAt: z.date(),
    completedAt: z.date().optional(),
  }).optional(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
});

export type PolicyEvaluation = z.infer<typeof PolicyEvaluationSchema>;

// Deployment Target
export const DeploymentTargetSchema = z.enum([
  'development',
  'staging',
  'canary',
  'production',
]);

export type DeploymentTarget = z.infer<typeof DeploymentTargetSchema>;

// Deployment
export const DeploymentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  target: DeploymentTargetSchema,
  version: z.string(),
  commitSha: z.string(),
  branch: z.string(),
  status: z.enum(['pending', 'deploying', 'deployed', 'rolling_back', 'rolled_back', 'failed']),
  policyEvaluationId: z.string().uuid().optional(),
  metrics: z.object({
    startTime: z.date(),
    endTime: z.date().optional(),
    duration: z.number().optional(),
    healthChecksPassed: z.boolean().optional(),
  }).optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Deployment = z.infer<typeof DeploymentSchema>;

// Canary Config
export const CanaryConfigSchema = z.object({
  enabled: z.boolean().default(false),
  trafficPercent: z.number().min(0).max(100).default(10),
  durationMinutes: z.number().min(5).max(1440).default(30),
  successThreshold: z.number().min(0).max(1).default(0.95),
  autoPromote: z.boolean().default(false),
});

export type CanaryConfig = z.infer<typeof CanaryConfigSchema>;

// Pipeline Configuration
export const PipelineConfigSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  repositoryUrl: z.string().url(),
  branch: z.string().default('main'),
  releasePolicyId: z.string().uuid().optional(),
  canaryConfig: CanaryConfigSchema.optional(),
  stages: z.array(z.object({
    name: z.string(),
    target: DeploymentTargetSchema,
    requiresApproval: z.boolean().default(false),
    approvers: z.array(z.string().uuid()).default([]),
  })),
  enabled: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PipelineConfig = z.infer<typeof PipelineConfigSchema>;

// Rollback Request
export const RollbackRequestSchema = z.object({
  deploymentId: z.string().uuid(),
  targetVersion: z.string(),
  reason: z.string(),
  requestedBy: z.string().uuid(),
  autoTriggered: z.boolean().default(false),
});

export type RollbackRequest = z.infer<typeof RollbackRequestSchema>;

// Release Gate
export const ReleaseGateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  pipelineId: z.string().uuid(),
  stage: DeploymentTargetSchema,
  status: z.enum(['open', 'approved', 'rejected', 'expired']),
  approvalRequired: z.boolean().default(true),
  approvers: z.array(z.string().uuid()),
  approvedBy: z.string().uuid().optional(),
  rejectedBy: z.string().uuid().optional(),
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  resolvedAt: z.date().optional(),
});

export type ReleaseGate = z.infer<typeof ReleaseGateSchema>;

// Policy DSL Example:
// ```
// policy "Production Release" {
//   rule "Latency Gate" {
//     type: latency
//     metric: p99_latency_ms
//     operator: lt
//     threshold: 200
//     severity: blocker
//   }
//   rule "Error Rate Gate" {
//     type: error_rate
//     metric: error_rate_percent
//     operator: lt
//     threshold: 0.1
//     severity: blocker
//   }
//   rule "Coverage Gate" {
//     type: coverage
//     metric: line_coverage
//     operator: gte
//     threshold: 80
//     severity: warning
//   }
//   rollback_on_failure: true
//   notify: [slack, email]
// }
// ```
