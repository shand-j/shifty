import { z } from 'zod';

// ============================================================
// PERFORMANCE TESTING TYPES
// ============================================================

export const PerformanceTestTypeSchema = z.enum([
  'load',
  'stress',
  'soak',
  'spike',
  'scalability',
  'baseline',
]);

export type PerformanceTestType = z.infer<typeof PerformanceTestTypeSchema>;

export const PerformanceMetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  threshold: z.number().optional(),
  passed: z.boolean().optional(),
});

export type PerformanceMetric = z.infer<typeof PerformanceMetricSchema>;

export const PerformanceTestConfigSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  testType: PerformanceTestTypeSchema,
  targetUrl: z.string().url(),
  
  // Load configuration
  virtualUsers: z.number().min(1).max(10000),
  rampUpSeconds: z.number().min(0),
  durationSeconds: z.number().min(1),
  
  // Thresholds
  thresholds: z.object({
    maxResponseTimeMs: z.number(),
    maxP95ResponseTimeMs: z.number(),
    maxP99ResponseTimeMs: z.number(),
    maxErrorRate: z.number().min(0).max(100),
    minThroughputRps: z.number().min(0),
  }),
  
  // Scenarios
  scenarios: z.array(z.object({
    name: z.string(),
    weight: z.number().min(0).max(100),
    steps: z.array(z.object({
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
      path: z.string(),
      headers: z.record(z.string()).optional(),
      body: z.string().optional(),
      thinkTimeMs: z.number().optional(),
    })),
  })),
  
  // Schedule
  schedule: z.object({
    enabled: z.boolean().default(false),
    cron: z.string().optional(),
    timezone: z.string().default('UTC'),
  }).optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PerformanceTestConfig = z.infer<typeof PerformanceTestConfigSchema>;

export const PerformanceTestRunSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  configId: z.string().uuid(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  
  // Results
  results: z.object({
    startTime: z.date(),
    endTime: z.date().optional(),
    duration: z.number().optional(),
    
    // Request metrics
    totalRequests: z.number(),
    successfulRequests: z.number(),
    failedRequests: z.number(),
    errorRate: z.number(),
    
    // Response time metrics
    avgResponseTimeMs: z.number(),
    minResponseTimeMs: z.number(),
    maxResponseTimeMs: z.number(),
    p50ResponseTimeMs: z.number(),
    p90ResponseTimeMs: z.number(),
    p95ResponseTimeMs: z.number(),
    p99ResponseTimeMs: z.number(),
    
    // Throughput metrics
    requestsPerSecond: z.number(),
    bytesPerSecond: z.number(),
    
    // Virtual user metrics
    maxVirtualUsers: z.number(),
    avgVirtualUsers: z.number(),
  }).optional(),
  
  // Threshold results
  thresholdResults: z.array(z.object({
    name: z.string(),
    passed: z.boolean(),
    actual: z.number(),
    threshold: z.number(),
  })).optional(),
  
  // Overall pass/fail
  passed: z.boolean().optional(),
  failureReason: z.string().optional(),
  
  // Artifacts
  reportUrl: z.string().url().optional(),
  metricsUrl: z.string().url().optional(),
  
  createdAt: z.date(),
  completedAt: z.date().optional(),
});

export type PerformanceTestRun = z.infer<typeof PerformanceTestRunSchema>;

// ============================================================
// SECURITY TESTING TYPES
// ============================================================

export const SecurityScanTypeSchema = z.enum([
  'dast',     // Dynamic Application Security Testing
  'sast',     // Static Application Security Testing
  'sca',      // Software Composition Analysis
  'secret',   // Secret/Credential Scanning
  'api',      // API Security Testing
  'pentest',  // Penetration Testing
]);

export type SecurityScanType = z.infer<typeof SecurityScanTypeSchema>;

export const VulnerabilitySeveritySchema = z.enum([
  'critical',
  'high',
  'medium',
  'low',
  'informational',
]);

export type VulnerabilitySeverity = z.infer<typeof VulnerabilitySeveritySchema>;

export const VulnerabilitySchema = z.object({
  id: z.string().uuid(),
  scanId: z.string().uuid(),
  type: z.string(),
  severity: VulnerabilitySeveritySchema,
  title: z.string(),
  description: z.string(),
  
  // Location
  location: z.object({
    file: z.string().optional(),
    line: z.number().optional(),
    url: z.string().optional(),
    endpoint: z.string().optional(),
    parameter: z.string().optional(),
  }),
  
  // CWE/CVE references
  cweId: z.string().optional(),
  cveId: z.string().optional(),
  cvssScore: z.number().min(0).max(10).optional(),
  
  // Remediation
  remediation: z.string().optional(),
  references: z.array(z.string().url()).default([]),
  
  // Status
  status: z.enum(['open', 'confirmed', 'false_positive', 'fixed', 'accepted']).default('open'),
  assignedTo: z.string().uuid().optional(),
  
  // Evidence
  evidence: z.object({
    request: z.string().optional(),
    response: z.string().optional(),
    screenshot: z.string().url().optional(),
  }).optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Vulnerability = z.infer<typeof VulnerabilitySchema>;

export const SecurityScanConfigSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  scanType: SecurityScanTypeSchema,
  
  // Target configuration
  target: z.object({
    url: z.string().url().optional(),
    repository: z.string().optional(),
    branch: z.string().optional(),
    paths: z.array(z.string()).optional(),
    excludePaths: z.array(z.string()).optional(),
  }),
  
  // Authentication
  authentication: z.object({
    type: z.enum(['none', 'basic', 'bearer', 'oauth', 'cookie']),
    credentials: z.record(z.string()).optional(),
  }).optional(),
  
  // Scan settings
  settings: z.object({
    maxDepth: z.number().optional(),
    maxDuration: z.number().optional(),
    includedChecks: z.array(z.string()).optional(),
    excludedChecks: z.array(z.string()).optional(),
    passiveOnly: z.boolean().default(false),
  }),
  
  // Thresholds
  thresholds: z.object({
    maxCritical: z.number().default(0),
    maxHigh: z.number().default(0),
    maxMedium: z.number().optional(),
    maxLow: z.number().optional(),
  }),
  
  // Schedule
  schedule: z.object({
    enabled: z.boolean().default(false),
    cron: z.string().optional(),
  }).optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SecurityScanConfig = z.infer<typeof SecurityScanConfigSchema>;

export const SecurityScanRunSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  configId: z.string().uuid(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  
  // Results summary
  summary: z.object({
    totalVulnerabilities: z.number(),
    criticalCount: z.number(),
    highCount: z.number(),
    mediumCount: z.number(),
    lowCount: z.number(),
    infoCount: z.number(),
    
    // Coverage
    urlsCrawled: z.number().optional(),
    filesScanned: z.number().optional(),
    dependenciesScanned: z.number().optional(),
  }).optional(),
  
  // Threshold results
  passed: z.boolean().optional(),
  failureReason: z.string().optional(),
  
  // Artifacts
  reportUrl: z.string().url().optional(),
  
  startTime: z.date(),
  endTime: z.date().optional(),
  createdAt: z.date(),
});

export type SecurityScanRun = z.infer<typeof SecurityScanRunSchema>;

// ============================================================
// ACCESSIBILITY TESTING TYPES
// ============================================================

export const AccessibilityStandardSchema = z.enum([
  'WCAG2A',
  'WCAG2AA',
  'WCAG2AAA',
  'WCAG21A',
  'WCAG21AA',
  'WCAG21AAA',
  'WCAG22AA',
  'Section508',
]);

export type AccessibilityStandard = z.infer<typeof AccessibilityStandardSchema>;

export const AccessibilityImpactSchema = z.enum([
  'critical',
  'serious',
  'moderate',
  'minor',
]);

export type AccessibilityImpact = z.infer<typeof AccessibilityImpactSchema>;

export const AccessibilityIssueSchema = z.object({
  id: z.string().uuid(),
  scanId: z.string().uuid(),
  ruleId: z.string(),
  impact: AccessibilityImpactSchema,
  
  // Issue details
  description: z.string(),
  help: z.string(),
  helpUrl: z.string().url(),
  
  // WCAG references
  wcagTags: z.array(z.string()),
  wcagCriteria: z.array(z.string()),
  
  // Location
  target: z.string(), // CSS selector
  html: z.string(),
  url: z.string().url(),
  
  // Fix suggestions
  fixSuggestions: z.array(z.object({
    message: z.string(),
    data: z.record(z.unknown()).optional(),
  })).default([]),
  
  // Status
  status: z.enum(['open', 'fixed', 'false_positive', 'accepted']).default('open'),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AccessibilityIssue = z.infer<typeof AccessibilityIssueSchema>;

export const AccessibilityScanConfigSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  
  // Target
  targetUrls: z.array(z.string().url()),
  standard: AccessibilityStandardSchema,
  
  // Browser configuration
  viewport: z.object({
    width: z.number().default(1280),
    height: z.number().default(720),
  }).optional(),
  
  // Scan settings
  settings: z.object({
    maxPages: z.number().default(100),
    includedRules: z.array(z.string()).optional(),
    excludedRules: z.array(z.string()).optional(),
    excludeSelectors: z.array(z.string()).optional(),
    waitForTimeout: z.number().default(5000),
  }),
  
  // Thresholds
  thresholds: z.object({
    maxCritical: z.number().default(0),
    maxSerious: z.number().default(0),
    maxModerate: z.number().optional(),
    maxMinor: z.number().optional(),
  }),
  
  // Schedule
  schedule: z.object({
    enabled: z.boolean().default(false),
    cron: z.string().optional(),
  }).optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AccessibilityScanConfig = z.infer<typeof AccessibilityScanConfigSchema>;

export const AccessibilityScanRunSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  configId: z.string().uuid(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  
  // Results summary
  summary: z.object({
    totalIssues: z.number(),
    criticalCount: z.number(),
    seriousCount: z.number(),
    moderateCount: z.number(),
    minorCount: z.number(),
    
    // Coverage
    pagesScanned: z.number(),
    elementsAnalyzed: z.number(),
    passedChecks: z.number(),
    failedChecks: z.number(),
    
    // Score
    accessibilityScore: z.number().min(0).max(100),
  }).optional(),
  
  // Threshold results
  passed: z.boolean().optional(),
  failureReason: z.string().optional(),
  
  // Artifacts
  reportUrl: z.string().url().optional(),
  
  startTime: z.date(),
  endTime: z.date().optional(),
  createdAt: z.date(),
});

export type AccessibilityScanRun = z.infer<typeof AccessibilityScanRunSchema>;
