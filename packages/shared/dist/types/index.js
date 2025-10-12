"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiConfigSchema = exports.DatabaseConfigSchema = exports.ApiResponseSchema = exports.AiModelSchema = exports.TestExecutionSchema = exports.TestSuiteSchema = exports.ProjectSchema = exports.UserSchema = exports.TenantSchema = void 0;
const zod_1 = require("zod");
// Core Tenant Types
exports.TenantSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    region: zod_1.z.enum(['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']),
    plan: zod_1.z.enum(['starter', 'professional', 'enterprise', 'enterprise-plus']),
    status: zod_1.z.enum(['active', 'inactive', 'suspended']).default('active'),
    databaseUrl: zod_1.z.string().url(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// User & Authentication Types
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(1),
    role: zod_1.z.enum(['admin', 'member', 'viewer']),
    permissions: zod_1.z.array(zod_1.z.string()),
    isActive: zod_1.z.boolean(),
    lastLoginAt: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
});
// Project Types
exports.ProjectSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    repositoryUrl: zod_1.z.string().url().optional(),
    webhookSecret: zod_1.z.string().optional(),
    aiConfig: zod_1.z.record(zod_1.z.any()).default({}),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Test Suite Types
exports.TestSuiteSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    projectId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    type: zod_1.z.enum(['smoke', 'regression', 'e2e', 'accessibility', 'visual']),
    generatedByAi: zod_1.z.boolean().default(false),
    testCode: zod_1.z.string(),
    selectors: zod_1.z.array(zod_1.z.record(zod_1.z.any())).default([]),
    metadata: zod_1.z.record(zod_1.z.any()).default({}),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Test Execution Types
exports.TestExecutionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    testSuiteId: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['queued', 'running', 'passed', 'failed', 'cancelled']),
    startedAt: zod_1.z.date().optional(),
    completedAt: zod_1.z.date().optional(),
    results: zod_1.z.record(zod_1.z.any()).optional(),
    artifacts: zod_1.z.array(zod_1.z.string()).default([]),
    healingEvents: zod_1.z.array(zod_1.z.record(zod_1.z.any())).default([]),
    executionTime: zod_1.z.number().optional(),
    errorMessage: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
});
// AI Types
exports.AiModelSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['test-generation', 'selector-healing', 'analytics']),
    modelData: zod_1.z.instanceof(Buffer).optional(),
    trainingMetadata: zod_1.z.record(zod_1.z.any()).default({}),
    performanceMetrics: zod_1.z.record(zod_1.z.any()).default({}),
    lastTrained: zod_1.z.date(),
    createdAt: zod_1.z.date(),
});
// API Request/Response Types
exports.ApiResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional(),
    timestamp: zod_1.z.date(),
    tenantId: zod_1.z.string().uuid().optional(),
});
// Configuration Types
exports.DatabaseConfigSchema = zod_1.z.object({
    host: zod_1.z.string(),
    port: zod_1.z.number(),
    database: zod_1.z.string(),
    username: zod_1.z.string(),
    password: zod_1.z.string(),
    ssl: zod_1.z.boolean().default(true),
    poolSize: zod_1.z.number().default(10),
});
exports.AiConfigSchema = zod_1.z.object({
    provider: zod_1.z.enum(['ollama', 'anthropic', 'openai']),
    model: zod_1.z.string(),
    endpoint: zod_1.z.string().url(),
    apiKey: zod_1.z.string().optional(),
    temperature: zod_1.z.number().min(0).max(2).default(0.7),
    maxTokens: zod_1.z.number().positive().default(2000),
    timeout: zod_1.z.number().positive().default(30000),
});
//# sourceMappingURL=index.js.map