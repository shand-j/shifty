import { z } from 'zod';

// Integration Types
export const IntegrationTypeSchema = z.enum([
  'github',
  'gitlab',
  'bitbucket',
  'jenkins',
  'github_actions',
  'circleci',
  'sentry',
  'datadog',
  'new_relic',
  'jira',
  'slack',
  'pagerduty',
]);

export type IntegrationType = z.infer<typeof IntegrationTypeSchema>;

// Integration Status
export const IntegrationStatusSchema = z.enum([
  'pending_setup',
  'connected',
  'disconnected',
  'error',
  'rate_limited',
]);

export type IntegrationStatus = z.infer<typeof IntegrationStatusSchema>;

// Base Integration Config
export const BaseIntegrationConfigSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  type: IntegrationTypeSchema,
  name: z.string().min(1).max(255),
  status: IntegrationStatusSchema,
  enabled: z.boolean().default(true),
  lastSyncAt: z.date().optional(),
  lastError: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  webhookSecret: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BaseIntegrationConfig = z.infer<typeof BaseIntegrationConfigSchema>;

// GitHub/GitLab Integration
export const GitIntegrationConfigSchema = BaseIntegrationConfigSchema.extend({
  type: z.enum(['github', 'gitlab', 'bitbucket']),
  config: z.object({
    accessToken: z.string(),
    organization: z.string().optional(),
    repositories: z.array(z.string()).default([]),
    baseUrl: z.string().url().optional(), // For self-hosted
    enableWebhooks: z.boolean().default(true),
    webhookEvents: z.array(z.enum([
      'push',
      'pull_request',
      'pull_request_review',
      'issues',
      'issue_comment',
      'workflow_run',
      'check_run',
      'deployment',
    ])).default(['push', 'pull_request']),
  }),
});

export type GitIntegrationConfig = z.infer<typeof GitIntegrationConfigSchema>;

// CI/CD Integration (Jenkins, GitHub Actions, CircleCI)
export const CICDIntegrationConfigSchema = BaseIntegrationConfigSchema.extend({
  type: z.enum(['jenkins', 'github_actions', 'circleci']),
  config: z.object({
    baseUrl: z.string().url().optional(),
    apiToken: z.string().optional(),
    username: z.string().optional(),
    projectKey: z.string().optional(),
    enableNotifications: z.boolean().default(true),
    triggerOnEvents: z.array(z.enum([
      'build_started',
      'build_completed',
      'build_failed',
      'deployment_started',
      'deployment_completed',
      'deployment_failed',
    ])).default(['build_failed', 'deployment_failed']),
  }),
});

export type CICDIntegrationConfig = z.infer<typeof CICDIntegrationConfigSchema>;

// Monitoring Integration (Sentry, Datadog, New Relic)
export const MonitoringIntegrationConfigSchema = BaseIntegrationConfigSchema.extend({
  type: z.enum(['sentry', 'datadog', 'new_relic']),
  config: z.object({
    apiKey: z.string(),
    apiSecret: z.string().optional(),
    organizationSlug: z.string().optional(),
    projectSlug: z.string().optional(),
    environment: z.string().optional(),
    enableErrorIngestion: z.boolean().default(true),
    enableMetricsIngestion: z.boolean().default(true),
    errorFilterRules: z.array(z.object({
      field: z.string(),
      operator: z.enum(['eq', 'neq', 'contains', 'not_contains', 'matches']),
      value: z.string(),
    })).default([]),
    minSeverity: z.enum(['critical', 'high', 'medium', 'low', 'info']).default('medium'),
  }),
});

export type MonitoringIntegrationConfig = z.infer<typeof MonitoringIntegrationConfigSchema>;

// Jira Integration
export const JiraIntegrationConfigSchema = BaseIntegrationConfigSchema.extend({
  type: z.literal('jira'),
  config: z.object({
    baseUrl: z.string().url(),
    email: z.string().email(),
    apiToken: z.string(),
    projectKey: z.string(),
    defaultIssueType: z.string().default('Bug'),
    defaultPriority: z.string().default('Medium'),
    customFields: z.record(z.string()).default({}),
    autoCreateTickets: z.boolean().default(false),
    autoCreateConfig: z.object({
      minSeverity: z.enum(['critical', 'high', 'medium', 'low']).default('high'),
      assignee: z.string().optional(),
      labels: z.array(z.string()).default([]),
      components: z.array(z.string()).default([]),
    }).optional(),
  }),
});

export type JiraIntegrationConfig = z.infer<typeof JiraIntegrationConfigSchema>;

// Slack Integration
export const SlackIntegrationConfigSchema = BaseIntegrationConfigSchema.extend({
  type: z.literal('slack'),
  config: z.object({
    botToken: z.string(),
    signingSecret: z.string().optional(),
    defaultChannel: z.string(),
    notificationChannels: z.array(z.object({
      channelId: z.string(),
      channelName: z.string(),
      notifyOn: z.array(z.enum([
        'error_critical',
        'error_high',
        'deployment_started',
        'deployment_completed',
        'deployment_failed',
        'policy_violation',
        'test_failure',
        'incident_created',
      ])),
    })).default([]),
    enableThreads: z.boolean().default(true),
    mentionOnCritical: z.array(z.string()).default([]), // User IDs to mention
  }),
});

export type SlackIntegrationConfig = z.infer<typeof SlackIntegrationConfigSchema>;

// PagerDuty Integration
export const PagerDutyIntegrationConfigSchema = BaseIntegrationConfigSchema.extend({
  type: z.literal('pagerduty'),
  config: z.object({
    routingKey: z.string(),
    serviceId: z.string().optional(),
    escalationPolicyId: z.string().optional(),
    autoResolve: z.boolean().default(true),
    dedupKey: z.string().optional(),
    triggerOn: z.array(z.enum([
      'critical_error',
      'deployment_failure',
      'sla_breach',
      'incident_created',
    ])).default(['critical_error']),
  }),
});

export type PagerDutyIntegrationConfig = z.infer<typeof PagerDutyIntegrationConfigSchema>;

// Integration Event
export const IntegrationEventSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  integrationId: z.string().uuid(),
  type: z.string(), // e.g., "push", "error", "deployment"
  source: IntegrationTypeSchema,
  payload: z.record(z.unknown()),
  processed: z.boolean().default(false),
  processedAt: z.date().optional(),
  error: z.string().optional(),
  createdAt: z.date(),
});

export type IntegrationEvent = z.infer<typeof IntegrationEventSchema>;

// Webhook Delivery
export const WebhookDeliverySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  integrationId: z.string().uuid(),
  eventType: z.string(),
  payload: z.record(z.unknown()),
  status: z.enum(['pending', 'delivered', 'failed', 'retrying']),
  attempts: z.number().default(0),
  maxAttempts: z.number().default(3),
  lastAttemptAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  responseCode: z.number().optional(),
  error: z.string().optional(),
  createdAt: z.date(),
});

export type WebhookDelivery = z.infer<typeof WebhookDeliverySchema>;

// Integration Sync Status
export const IntegrationSyncStatusSchema = z.object({
  integrationId: z.string().uuid(),
  tenantId: z.string().uuid(),
  lastSyncAt: z.date(),
  lastSuccessfulSyncAt: z.date().optional(),
  syncStatus: z.enum(['idle', 'syncing', 'error']),
  itemsSynced: z.number().default(0),
  errors: z.array(z.object({
    timestamp: z.date(),
    message: z.string(),
    itemId: z.string().optional(),
  })).default([]),
});

export type IntegrationSyncStatus = z.infer<typeof IntegrationSyncStatusSchema>;

// OAuth State (for OAuth integrations)
export const OAuthStateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  integrationType: IntegrationTypeSchema,
  state: z.string(),
  redirectUri: z.string().url(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export type OAuthState = z.infer<typeof OAuthStateSchema>;
