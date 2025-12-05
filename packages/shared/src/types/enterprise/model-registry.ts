import { z } from 'zod';

// Model Source Types
export const ModelSourceSchema = z.enum([
  'huggingface',    // Hugging Face Hub models
  'ollama',         // Ollama-hosted models
  'custom',         // Custom fine-tuned checkpoints
  's3',             // S3-stored model weights
]);

export type ModelSource = z.infer<typeof ModelSourceSchema>;

// Model Status
export const ModelStatusSchema = z.enum([
  'pending',
  'downloading',
  'validating',
  'ready',
  'deploying',
  'deployed',
  'failed',
  'archived',
]);

export type ModelStatus = z.infer<typeof ModelStatusSchema>;

// Model Configuration
export const ModelConfigSchema = z.object({
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(32768).default(2048),
  topP: z.number().min(0).max(1).default(0.9),
  topK: z.number().min(1).max(100).default(40),
  repetitionPenalty: z.number().min(0).max(2).default(1.1),
  contextWindow: z.number().min(512).max(128000).default(4096),
});

export type ModelConfig = z.infer<typeof ModelConfigSchema>;

// Tenant Model
export const TenantModelSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  source: ModelSourceSchema,
  sourceId: z.string(), // HF model ID, Ollama model name, or S3 path
  version: z.string(),
  status: ModelStatusSchema,
  config: ModelConfigSchema,
  deployedInstanceId: z.string().uuid().optional(), // GPU instance ID
  checkpointPath: z.string().optional(), // Local path to model weights
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
  deployedAt: z.date().optional(),
});

export type TenantModel = z.infer<typeof TenantModelSchema>;

// Model Registration Request
export const ModelRegistrationRequestSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  source: ModelSourceSchema,
  sourceId: z.string(),
  version: z.string().optional(),
  config: ModelConfigSchema.optional(),
  autoDeployOnReady: z.boolean().default(false),
  targetInstanceId: z.string().uuid().optional(),
});

export type ModelRegistrationRequest = z.infer<typeof ModelRegistrationRequestSchema>;

// Training Job Configuration
export const TrainingJobConfigSchema = z.object({
  baseModelId: z.string().uuid(),
  datasetId: z.string().uuid(),
  hyperparameters: z.object({
    learningRate: z.number().min(1e-7).max(1e-1).default(2e-5),
    batchSize: z.number().min(1).max(128).default(4),
    epochs: z.number().min(1).max(100).default(3),
    warmupSteps: z.number().min(0).default(100),
    gradientAccumulationSteps: z.number().min(1).max(32).default(1),
    loraRank: z.number().min(4).max(128).optional(),
    loraAlpha: z.number().min(8).max(256).optional(),
  }),
  evaluationStrategy: z.enum(['steps', 'epoch']).default('epoch'),
  saveStrategy: z.enum(['steps', 'epoch', 'best']).default('best'),
  maxGpuMemory: z.number().optional(), // GB
});

export type TrainingJobConfig = z.infer<typeof TrainingJobConfigSchema>;

// Training Job Status
export const TrainingJobStatusSchema = z.enum([
  'queued',
  'provisioning',
  'preparing_data',
  'training',
  'evaluating',
  'saving',
  'completed',
  'failed',
  'cancelled',
]);

export type TrainingJobStatus = z.infer<typeof TrainingJobStatusSchema>;

// Training Job
export const TrainingJobSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  config: TrainingJobConfigSchema,
  status: TrainingJobStatusSchema,
  gpuInstanceId: z.string().uuid().optional(),
  progress: z.object({
    currentEpoch: z.number(),
    totalEpochs: z.number(),
    currentStep: z.number(),
    totalSteps: z.number(),
    trainingLoss: z.number().optional(),
    validationLoss: z.number().optional(),
    metrics: z.record(z.number()).default({}),
  }).optional(),
  outputModelId: z.string().uuid().optional(),
  logs: z.array(z.object({
    timestamp: z.date(),
    level: z.enum(['info', 'warning', 'error']),
    message: z.string(),
  })).default([]),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TrainingJob = z.infer<typeof TrainingJobSchema>;

// Model Evaluation Result
export const ModelEvaluationResultSchema = z.object({
  id: z.string().uuid(),
  modelId: z.string().uuid(),
  tenantId: z.string().uuid(),
  evaluationType: z.enum(['automated', 'human', 'benchmark']),
  metrics: z.object({
    accuracy: z.number().optional(),
    precision: z.number().optional(),
    recall: z.number().optional(),
    f1Score: z.number().optional(),
    bleuScore: z.number().optional(),
    rougeScore: z.number().optional(),
    perplexity: z.number().optional(),
    customMetrics: z.record(z.number()).default({}),
  }),
  testDatasetId: z.string().uuid().optional(),
  sampleResults: z.array(z.object({
    input: z.string(),
    expectedOutput: z.string(),
    actualOutput: z.string(),
    score: z.number(),
  })).default([]),
  approved: z.boolean().optional(),
  approvedBy: z.string().uuid().optional(),
  createdAt: z.date(),
});

export type ModelEvaluationResult = z.infer<typeof ModelEvaluationResultSchema>;

// Model Deployment Configuration
export const ModelDeploymentConfigSchema = z.object({
  modelId: z.string().uuid(),
  instanceId: z.string().uuid(),
  replicas: z.number().min(1).max(10).default(1),
  autoscaling: z.object({
    enabled: z.boolean().default(false),
    minReplicas: z.number().min(1).default(1),
    maxReplicas: z.number().min(1).default(3),
    targetConcurrency: z.number().min(1).default(10),
  }).optional(),
  healthCheck: z.object({
    enabled: z.boolean().default(true),
    intervalSeconds: z.number().min(10).default(30),
    timeoutSeconds: z.number().min(1).default(5),
    unhealthyThreshold: z.number().min(1).default(3),
  }).optional(),
});

export type ModelDeploymentConfig = z.infer<typeof ModelDeploymentConfigSchema>;
