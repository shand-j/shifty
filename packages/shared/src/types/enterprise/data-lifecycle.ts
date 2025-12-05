import { z } from 'zod';

// Data Classification Levels
export const DataClassificationSchema = z.enum([
  'public',
  'internal',
  'confidential',
  'restricted',
  'pii',         // Personally Identifiable Information
  'phi',         // Protected Health Information
]);

export type DataClassification = z.infer<typeof DataClassificationSchema>;

// Retention Policy
export const RetentionPolicySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  dataClassifications: z.array(DataClassificationSchema),
  retentionDays: z.number().min(1).max(3650), // 1 day to 10 years
  autoDelete: z.boolean().default(true),
  archiveBeforeDelete: z.boolean().default(false),
  archiveLocation: z.string().optional(),
  notifyBeforeDeletion: z.boolean().default(true),
  notificationDaysBeforeDeletion: z.number().min(1).max(30).default(7),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RetentionPolicy = z.infer<typeof RetentionPolicySchema>;

// Data Asset Types
export const DataAssetTypeSchema = z.enum([
  'dataset',
  'model_weights',
  'model_checkpoint',
  'training_logs',
  'evaluation_results',
  'inference_logs',
  'user_feedback',
  'generated_tests',
  'healing_history',
  'analytics_data',
]);

export type DataAssetType = z.infer<typeof DataAssetTypeSchema>;

// Data Asset Status
export const DataAssetStatusSchema = z.enum([
  'active',
  'pending_deletion',
  'deletion_in_progress',
  'deleted',
  'archived',
  'retention_hold',
]);

export type DataAssetStatus = z.infer<typeof DataAssetStatusSchema>;

// Data Asset
export const DataAssetSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  type: DataAssetTypeSchema,
  name: z.string().min(1).max(255),
  classification: DataClassificationSchema,
  status: DataAssetStatusSchema,
  storageLocation: z.string(), // S3 path, database table, etc.
  sizeBytes: z.number(),
  checksum: z.string(), // SHA-256 hash
  retentionPolicyId: z.string().uuid().optional(),
  expiresAt: z.date().optional(),
  metadata: z.record(z.unknown()).default({}),
  tags: z.array(z.string()).default([]),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
});

export type DataAsset = z.infer<typeof DataAssetSchema>;

// Deletion Method
export const DeletionMethodSchema = z.enum([
  'standard',           // Standard file deletion
  'secure_overwrite',   // Multiple pass overwrite
  'cryptographic_erase',// Destroy encryption keys
  'dod_5220',          // DoD 5220.22-M standard
  'nist_800_88',       // NIST 800-88 guidelines
]);

export type DeletionMethod = z.infer<typeof DeletionMethodSchema>;

// Deletion Job Status
export const DeletionJobStatusSchema = z.enum([
  'pending',
  'in_progress',
  'verifying',
  'completed',
  'failed',
  'partially_completed',
]);

export type DeletionJobStatus = z.infer<typeof DeletionJobStatusSchema>;

// Deletion Job
export const DeletionJobSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  assetIds: z.array(z.string().uuid()),
  method: DeletionMethodSchema,
  status: DeletionJobStatusSchema,
  reason: z.string(),
  requestedBy: z.string().uuid(),
  approvedBy: z.string().uuid().optional(),
  verificationProof: z.object({
    method: z.string(),
    timestamp: z.date(),
    checksum: z.string(), // Hash of deletion logs
    certificateId: z.string().optional(),
  }).optional(),
  deletionLog: z.array(z.object({
    assetId: z.string().uuid(),
    timestamp: z.date(),
    status: z.enum(['success', 'failed', 'skipped']),
    details: z.string().optional(),
    verificationHash: z.string().optional(),
  })).default([]),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DeletionJob = z.infer<typeof DeletionJobSchema>;

// Deletion Certificate
export const DeletionCertificateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  deletionJobId: z.string().uuid(),
  assetSummary: z.array(z.object({
    assetId: z.string().uuid(),
    assetType: DataAssetTypeSchema,
    assetName: z.string(),
    classification: DataClassificationSchema,
    sizeBytes: z.number(),
  })),
  deletionMethod: DeletionMethodSchema,
  verificationDetails: z.object({
    verifiedBy: z.enum(['automated', 'manual', 'third_party']),
    verificationDate: z.date(),
    verificationMethod: z.string(),
    auditTrailHash: z.string(),
  }),
  complianceStandards: z.array(z.string()), // e.g., ['GDPR', 'SOC2', 'HIPAA']
  issuedAt: z.date(),
  expiresAt: z.date().optional(),
  signatureHash: z.string(), // Cryptographic signature
});

export type DeletionCertificate = z.infer<typeof DeletionCertificateSchema>;

// Workspace for Training/Inference
export const DisposableWorkspaceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  type: z.enum(['training', 'inference', 'evaluation']),
  gpuInstanceId: z.string().uuid().optional(),
  status: z.enum(['creating', 'active', 'destroying', 'destroyed', 'error']),
  storageLocation: z.string(),
  sizeAllocatedBytes: z.number(),
  sizeUsedBytes: z.number(),
  dataAssets: z.array(z.string().uuid()), // Assets loaded into workspace
  autoDestroyAfterMinutes: z.number().min(5).max(1440).default(60), // Default 1 hour
  destroyOnCompletion: z.boolean().default(true),
  secureWipeOnDestroy: z.boolean().default(true),
  createdAt: z.date(),
  expiresAt: z.date(),
  destroyedAt: z.date().optional(),
});

export type DisposableWorkspace = z.infer<typeof DisposableWorkspaceSchema>;

// Data Access Log Entry
export const DataAccessLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  assetId: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.enum(['view', 'download', 'modify', 'delete', 'share', 'export']),
  ipAddress: z.string().ip(),
  userAgent: z.string().optional(),
  success: z.boolean(),
  failureReason: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
  timestamp: z.date(),
});

export type DataAccessLog = z.infer<typeof DataAccessLogSchema>;

// Compliance Report
export const ComplianceReportSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  reportType: z.enum(['data_inventory', 'retention_compliance', 'deletion_audit', 'access_audit']),
  periodStart: z.date(),
  periodEnd: z.date(),
  summary: z.object({
    totalAssets: z.number(),
    assetsByClassification: z.record(z.number()),
    assetsByType: z.record(z.number()),
    deletionsProcessed: z.number(),
    retentionViolations: z.number(),
    accessEvents: z.number(),
  }),
  details: z.record(z.unknown()),
  generatedAt: z.date(),
  generatedBy: z.string().uuid(),
});

export type ComplianceReport = z.infer<typeof ComplianceReportSchema>;
