import { z } from 'zod';

// Core Tenant Types
export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  region: z.enum(['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']),
  plan: z.enum(['starter', 'professional', 'enterprise', 'enterprise-plus']),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  databaseUrl: z.string().url(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;

// User & Authentication Types
export const UserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'member', 'viewer']),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
  lastLoginAt: z.date().optional(),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Project Types
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  repositoryUrl: z.string().url().optional(),
  webhookSecret: z.string().optional(),
  aiConfig: z.record(z.any()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof ProjectSchema>;

// Test Suite Types
export const TestSuiteSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['smoke', 'regression', 'e2e', 'accessibility', 'visual']),
  generatedByAi: z.boolean().default(false),
  testCode: z.string(),
  selectors: z.array(z.record(z.any())).default([]),
  metadata: z.record(z.any()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TestSuite = z.infer<typeof TestSuiteSchema>;

// Test Execution Types
export const TestExecutionSchema = z.object({
  id: z.string().uuid(),
  testSuiteId: z.string().uuid(),
  status: z.enum(['queued', 'running', 'passed', 'failed', 'cancelled']),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  results: z.record(z.any()).optional(),
  artifacts: z.array(z.string()).default([]),
  healingEvents: z.array(z.record(z.any())).default([]),
  executionTime: z.number().optional(),
  errorMessage: z.string().optional(),
  createdAt: z.date(),
});

export type TestExecution = z.infer<typeof TestExecutionSchema>;

// AI Types
export const AiModelSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  type: z.enum(['test-generation', 'selector-healing', 'analytics']),
  modelData: z.instanceof(Buffer).optional(),
  trainingMetadata: z.record(z.any()).default({}),
  performanceMetrics: z.record(z.any()).default({}),
  lastTrained: z.date(),
  createdAt: z.date(),
});

export type AiModel = z.infer<typeof AiModelSchema>;

// API Request/Response Types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.date(),
  tenantId: z.string().uuid().optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  tenantId?: string;
};

// Configuration Types
export const DatabaseConfigSchema = z.object({
  host: z.string(),
  port: z.number(),
  database: z.string(),
  username: z.string(),
  password: z.string(),
  ssl: z.boolean().default(true),
  poolSize: z.number().default(10),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

export const AiConfigSchema = z.object({
  provider: z.enum(['ollama', 'anthropic', 'openai']),
  model: z.string(),
  endpoint: z.string().url(),
  apiKey: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().default(2000),
  timeout: z.number().positive().default(30000),
});

export type AiConfig = z.infer<typeof AiConfigSchema>;

// Export Enterprise Types
export * from './enterprise';