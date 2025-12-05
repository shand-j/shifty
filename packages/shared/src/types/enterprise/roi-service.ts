import { z } from 'zod';

// ============================================================
// ROI SERVICE TYPES
// ============================================================

// Time periods for metrics
export const MetricTimeframeSchema = z.enum([
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'custom',
]);

export type MetricTimeframe = z.infer<typeof MetricTimeframeSchema>;

// DORA Metrics
export const DORAMetricsSchema = z.object({
  tenantId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  timeframe: MetricTimeframeSchema,
  periodStart: z.date(),
  periodEnd: z.date(),
  
  // Deployment Frequency - How often code is deployed to production
  deploymentFrequency: z.object({
    count: z.number(),
    averagePerDay: z.number(),
    trend: z.enum(['improving', 'stable', 'declining']),
    benchmark: z.enum(['elite', 'high', 'medium', 'low']),
  }),
  
  // Lead Time for Changes - Time from commit to production
  leadTimeForChanges: z.object({
    median: z.number(), // minutes
    p50: z.number(),
    p90: z.number(),
    p95: z.number(),
    trend: z.enum(['improving', 'stable', 'declining']),
    benchmark: z.enum(['elite', 'high', 'medium', 'low']),
  }),
  
  // Mean Time to Recovery - Time to restore service after incident
  meanTimeToRecovery: z.object({
    median: z.number(), // minutes
    p50: z.number(),
    p90: z.number(),
    incidents: z.number(),
    trend: z.enum(['improving', 'stable', 'declining']),
    benchmark: z.enum(['elite', 'high', 'medium', 'low']),
  }),
  
  // Change Failure Rate - Percentage of deployments causing failures
  changeFailureRate: z.object({
    rate: z.number(), // percentage
    failedDeployments: z.number(),
    totalDeployments: z.number(),
    trend: z.enum(['improving', 'stable', 'declining']),
    benchmark: z.enum(['elite', 'high', 'medium', 'low']),
  }),
  
  // Overall DORA level
  overallLevel: z.enum(['elite', 'high', 'medium', 'low']),
  calculatedAt: z.date(),
});

export type DORAMetrics = z.infer<typeof DORAMetricsSchema>;

// SPACE Metrics (Developer Experience Framework)
export const SPACEMetricsSchema = z.object({
  tenantId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  timeframe: MetricTimeframeSchema,
  periodStart: z.date(),
  periodEnd: z.date(),
  
  // Satisfaction & Well-being
  satisfaction: z.object({
    developerSatisfactionScore: z.number().min(0).max(10), // Survey score
    burnoutRisk: z.enum(['low', 'moderate', 'high']),
    workLifeBalance: z.number().min(0).max(10),
    toolingSatisfaction: z.number().min(0).max(10),
  }),
  
  // Performance
  performance: z.object({
    codeReviewCycleTime: z.number(), // hours
    prMergeRate: z.number(), // percentage
    codeQualityScore: z.number().min(0).max(100),
    testPassRate: z.number().min(0).max(100),
  }),
  
  // Activity
  activity: z.object({
    commitsPerDeveloperPerDay: z.number(),
    prsOpenedPerDeveloperPerWeek: z.number(),
    codeReviewsPerDeveloperPerWeek: z.number(),
    meetingsHoursPerWeek: z.number(),
  }),
  
  // Communication & Collaboration
  communication: z.object({
    prCommentResponseTime: z.number(), // hours
    crossTeamCollaborationScore: z.number().min(0).max(10),
    documentationCompleteness: z.number().min(0).max(100),
    knowledgeSharingIndex: z.number().min(0).max(10),
  }),
  
  // Efficiency & Flow
  efficiency: z.object({
    focusTimePercentage: z.number().min(0).max(100),
    contextSwitches: z.number(),
    cycleTimeP50: z.number(), // hours
    wipLimit: z.number(),
    flowEfficiency: z.number().min(0).max(100),
  }),
  
  overallScore: z.number().min(0).max(100),
  calculatedAt: z.date(),
});

export type SPACEMetrics = z.infer<typeof SPACEMetricsSchema>;

// ROI Calculation
export const ROICalculationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  periodStart: z.date(),
  periodEnd: z.date(),
  
  // Time Savings
  timeSavings: z.object({
    testGenerationHoursSaved: z.number(),
    selectorHealingHoursSaved: z.number(),
    incidentPreventionHoursSaved: z.number(),
    manualTestingHoursReduced: z.number(),
    codeReviewHoursReduced: z.number(),
    totalHoursSaved: z.number(),
    dollarsPerHour: z.number(),
    totalDollarsSaved: z.number(),
  }),
  
  // Quality Impact
  qualityImpact: z.object({
    bugsPreventedInProduction: z.number(),
    incidentsPreventedCount: z.number(),
    averageCostPerIncident: z.number(),
    incidentCostAvoided: z.number(),
    regressionsCaught: z.number(),
    testCoverageIncrease: z.number(), // percentage points
  }),
  
  // Velocity Gains
  velocityGains: z.object({
    deploymentFrequencyIncrease: z.number(), // percentage
    leadTimeReduction: z.number(), // percentage
    cycleTimeReduction: z.number(), // percentage
    velocityIndex: z.number().min(0).max(200), // 100 = baseline
  }),
  
  // Cost Analysis
  costAnalysis: z.object({
    platformCost: z.number(),
    timeSavingsValue: z.number(),
    qualityValue: z.number(),
    velocityValue: z.number(),
    totalValue: z.number(),
    netROI: z.number(),
    roiPercentage: z.number(),
    paybackPeriodMonths: z.number(),
  }),
  
  // Trend Data
  trends: z.object({
    previousPeriodROI: z.number().optional(),
    roiTrend: z.enum(['improving', 'stable', 'declining']),
    projectedAnnualValue: z.number(),
  }),
  
  calculatedAt: z.date(),
});

export type ROICalculation = z.infer<typeof ROICalculationSchema>;

// Telemetry Completeness Tracking
export const TelemetryCompletenessSchema = z.object({
  tenantId: z.string().uuid(),
  signal: z.enum(['traces', 'metrics', 'logs']),
  completenessRatio: z.number().min(0).max(1),
  missingAttributes: z.array(z.string()),
  samplesAnalyzed: z.number(),
  periodStart: z.date(),
  periodEnd: z.date(),
  meetsThreshold: z.boolean(),
  threshold: z.number(),
  calculatedAt: z.date(),
});

export type TelemetryCompleteness = z.infer<typeof TelemetryCompletenessSchema>;

// Quality Session Tracking (for manual testing hub)
export const QualitySessionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  persona: z.enum(['pm', 'designer', 'qa', 'dev', 'manager']),
  sessionType: z.enum(['exploratory', 'scripted', 'regression', 'smoke', 'uat', 'accessibility', 'performance', 'security']),
  repo: z.string().optional(),
  branch: z.string().optional(),
  component: z.string().optional(),
  riskLevel: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['active', 'paused', 'completed', 'abandoned']),
  startTs: z.date(),
  endTs: z.date().optional(),
  
  // Session details
  title: z.string(),
  description: z.string().optional(),
  charter: z.string().optional(), // For exploratory testing
  notes: z.string().optional(),
  
  // Results
  bugsFound: z.number().default(0),
  issuesLogged: z.array(z.string()).default([]), // Jira IDs
  testStepsCompleted: z.number().default(0),
  testStepsTotal: z.number().optional(),
  
  // Automation gap analysis
  automationCoverage: z.number().min(0).max(100).optional(),
  automationGaps: z.array(z.object({
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    estimatedEffort: z.string(),
  })).default([]),
  
  // Attachments
  recordings: z.array(z.string()).default([]), // URLs
  screenshots: z.array(z.string()).default([]),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type QualitySession = z.infer<typeof QualitySessionSchema>;

// Manual Test Step
export const ManualTestStepSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  tenantId: z.string().uuid(),
  sequence: z.number(),
  action: z.string(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
  status: z.enum(['pending', 'passed', 'failed', 'blocked', 'skipped']),
  attachments: z.array(z.string()).default([]),
  jiraIssueId: z.string().optional(),
  confidence: z.number().min(0).max(1).default(1),
  notes: z.string().optional(),
  
  // For collaboration
  comments: z.array(z.object({
    userId: z.string().uuid(),
    text: z.string(),
    timestamp: z.date(),
  })).default([]),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ManualTestStep = z.infer<typeof ManualTestStepSchema>;

// Operational Metrics
export const OperationalMetricsSchema = z.object({
  tenantId: z.string().uuid(),
  periodStart: z.date(),
  periodEnd: z.date(),
  
  // Test Generation
  testsGenerated: z.number(),
  testsApproved: z.number(),
  testsRejected: z.number(),
  averageGenerationTime: z.number(), // seconds
  
  // Selector Healing
  healingAttempts: z.number(),
  healingSuccesses: z.number(),
  healingSuccessRate: z.number(),
  averageHealingTime: z.number(), // milliseconds
  
  // CI/CD
  pipelinesRun: z.number(),
  pipelinesPassed: z.number(),
  pipelinesFailed: z.number(),
  averagePipelineTime: z.number(), // minutes
  
  // Manual Testing
  manualSessionsCompleted: z.number(),
  manualTestStepsExecuted: z.number(),
  bugsFoundManually: z.number(),
  
  // HITL Arcade
  missionsCompleted: z.number(),
  trainingSamplesGenerated: z.number(),
  activeContributors: z.number(),
  
  calculatedAt: z.date(),
});

export type OperationalMetrics = z.infer<typeof OperationalMetricsSchema>;

// Incidents Prevented Tracking
export const IncidentPreventionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  detectionSource: z.enum(['regression_test', 'quality_gate', 'selector_healing', 'production_feedback', 'manual_testing']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  description: z.string(),
  potentialImpact: z.string(),
  estimatedCostAvoided: z.number().optional(),
  testId: z.string().uuid().optional(),
  pipelineId: z.string().uuid().optional(),
  errorClusterId: z.string().uuid().optional(),
  preventedAt: z.date(),
  createdAt: z.date(),
});

export type IncidentPrevention = z.infer<typeof IncidentPreventionSchema>;

// Persona Dashboard Configuration
export const PersonaDashboardSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  persona: z.enum(['pm', 'designer', 'qa', 'dev', 'manager']),
  widgets: z.array(z.object({
    widgetId: z.string(),
    type: z.enum(['metric', 'chart', 'table', 'alert', 'action']),
    position: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }),
    config: z.record(z.unknown()),
    visible: z.boolean().default(true),
  })),
  defaultTimeframe: MetricTimeframeSchema,
  refreshInterval: z.number().default(60), // seconds
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PersonaDashboard = z.infer<typeof PersonaDashboardSchema>;

// ROI Report
export const ROIReportSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  reportType: z.enum(['executive_summary', 'detailed', 'team_breakdown', 'trend_analysis']),
  periodStart: z.date(),
  periodEnd: z.date(),
  doraMetrics: DORAMetricsSchema.optional(),
  spaceMetrics: SPACEMetricsSchema.optional(),
  roiCalculation: ROICalculationSchema,
  operationalMetrics: OperationalMetricsSchema,
  telemetryCompleteness: z.array(TelemetryCompletenessSchema),
  recommendations: z.array(z.object({
    priority: z.number(),
    category: z.string(),
    title: z.string(),
    description: z.string(),
    expectedImpact: z.string(),
    effort: z.enum(['low', 'medium', 'high']),
  })),
  generatedAt: z.date(),
  generatedBy: z.string().uuid().optional(),
});

export type ROIReport = z.infer<typeof ROIReportSchema>;

// Prometheus Query Definition
export const PromQLQuerySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  query: z.string(),
  metricType: z.enum(['gauge', 'counter', 'histogram', 'summary']),
  unit: z.string().optional(),
  thresholds: z.object({
    warning: z.number().optional(),
    critical: z.number().optional(),
  }).optional(),
});

export type PromQLQuery = z.infer<typeof PromQLQuerySchema>;
