import { z } from 'zod';
export declare const TenantSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    region: z.ZodEnum<["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"]>;
    plan: z.ZodEnum<["starter", "professional", "enterprise", "enterprise-plus"]>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "suspended"]>>;
    databaseUrl: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    slug: string;
    region: "us-east-1" | "us-west-2" | "eu-west-1" | "ap-southeast-1";
    status: "active" | "inactive" | "suspended";
    plan: "starter" | "professional" | "enterprise" | "enterprise-plus";
    databaseUrl: string;
    createdAt: Date;
    updatedAt: Date;
}, {
    id: string;
    name: string;
    slug: string;
    region: "us-east-1" | "us-west-2" | "eu-west-1" | "ap-southeast-1";
    plan: "starter" | "professional" | "enterprise" | "enterprise-plus";
    databaseUrl: string;
    createdAt: Date;
    updatedAt: Date;
    status?: "active" | "inactive" | "suspended" | undefined;
}>;
export type Tenant = z.infer<typeof TenantSchema>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<["admin", "member", "viewer"]>;
    permissions: z.ZodArray<z.ZodString, "many">;
    isActive: z.ZodBoolean;
    lastLoginAt: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    tenantId: string;
    email: string;
    role: "admin" | "member" | "viewer";
    permissions: string[];
    isActive: boolean;
    lastLoginAt?: Date | undefined;
}, {
    id: string;
    name: string;
    createdAt: Date;
    tenantId: string;
    email: string;
    role: "admin" | "member" | "viewer";
    permissions: string[];
    isActive: boolean;
    lastLoginAt?: Date | undefined;
}>;
export type User = z.infer<typeof UserSchema>;
export declare const ProjectSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    repositoryUrl: z.ZodOptional<z.ZodString>;
    webhookSecret: z.ZodOptional<z.ZodString>;
    aiConfig: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    tenantId: string;
    aiConfig: Record<string, any>;
    description?: string | undefined;
    repositoryUrl?: string | undefined;
    webhookSecret?: string | undefined;
}, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    tenantId: string;
    description?: string | undefined;
    repositoryUrl?: string | undefined;
    webhookSecret?: string | undefined;
    aiConfig?: Record<string, any> | undefined;
}>;
export type Project = z.infer<typeof ProjectSchema>;
export declare const TestSuiteSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["smoke", "regression", "e2e", "accessibility", "visual"]>;
    generatedByAi: z.ZodDefault<z.ZodBoolean>;
    testCode: z.ZodString;
    selectors: z.ZodDefault<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    type: "smoke" | "regression" | "e2e" | "accessibility" | "visual";
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    generatedByAi: boolean;
    testCode: string;
    selectors: Record<string, any>[];
    metadata: Record<string, any>;
}, {
    id: string;
    name: string;
    type: "smoke" | "regression" | "e2e" | "accessibility" | "visual";
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    testCode: string;
    generatedByAi?: boolean | undefined;
    selectors?: Record<string, any>[] | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export type TestSuite = z.infer<typeof TestSuiteSchema>;
export declare const TestExecutionSchema: z.ZodObject<{
    id: z.ZodString;
    testSuiteId: z.ZodString;
    status: z.ZodEnum<["queued", "running", "passed", "failed", "cancelled"]>;
    startedAt: z.ZodOptional<z.ZodDate>;
    completedAt: z.ZodOptional<z.ZodDate>;
    results: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    artifacts: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    healingEvents: z.ZodDefault<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">>;
    executionTime: z.ZodOptional<z.ZodNumber>;
    errorMessage: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "queued" | "running" | "passed" | "failed" | "cancelled";
    createdAt: Date;
    testSuiteId: string;
    artifacts: string[];
    healingEvents: Record<string, any>[];
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
    results?: Record<string, any> | undefined;
    executionTime?: number | undefined;
    errorMessage?: string | undefined;
}, {
    id: string;
    status: "queued" | "running" | "passed" | "failed" | "cancelled";
    createdAt: Date;
    testSuiteId: string;
    startedAt?: Date | undefined;
    completedAt?: Date | undefined;
    results?: Record<string, any> | undefined;
    artifacts?: string[] | undefined;
    healingEvents?: Record<string, any>[] | undefined;
    executionTime?: number | undefined;
    errorMessage?: string | undefined;
}>;
export type TestExecution = z.infer<typeof TestExecutionSchema>;
export declare const AiModelSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    type: z.ZodEnum<["test-generation", "selector-healing", "analytics"]>;
    modelData: z.ZodOptional<z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>>;
    trainingMetadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    performanceMetrics: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    lastTrained: z.ZodDate;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "test-generation" | "selector-healing" | "analytics";
    createdAt: Date;
    tenantId: string;
    trainingMetadata: Record<string, any>;
    performanceMetrics: Record<string, any>;
    lastTrained: Date;
    modelData?: Buffer<ArrayBufferLike> | undefined;
}, {
    id: string;
    type: "test-generation" | "selector-healing" | "analytics";
    createdAt: Date;
    tenantId: string;
    lastTrained: Date;
    modelData?: Buffer<ArrayBufferLike> | undefined;
    trainingMetadata?: Record<string, any> | undefined;
    performanceMetrics?: Record<string, any> | undefined;
}>;
export type AiModel = z.infer<typeof AiModelSchema>;
export declare const ApiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodDate;
    tenantId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    timestamp: Date;
    tenantId?: string | undefined;
    data?: any;
    error?: string | undefined;
}, {
    success: boolean;
    timestamp: Date;
    tenantId?: string | undefined;
    data?: any;
    error?: string | undefined;
}>;
export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: Date;
    tenantId?: string;
};
export declare const DatabaseConfigSchema: z.ZodObject<{
    host: z.ZodString;
    port: z.ZodNumber;
    database: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    ssl: z.ZodDefault<z.ZodBoolean>;
    poolSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
    poolSize: number;
}, {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean | undefined;
    poolSize?: number | undefined;
}>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export declare const AiConfigSchema: z.ZodObject<{
    provider: z.ZodEnum<["ollama", "anthropic", "openai"]>;
    model: z.ZodString;
    endpoint: z.ZodString;
    apiKey: z.ZodOptional<z.ZodString>;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    timeout: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    provider: "ollama" | "anthropic" | "openai";
    model: string;
    endpoint: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
    apiKey?: string | undefined;
}, {
    provider: "ollama" | "anthropic" | "openai";
    model: string;
    endpoint: string;
    apiKey?: string | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    timeout?: number | undefined;
}>;
export type AiConfig = z.infer<typeof AiConfigSchema>;
//# sourceMappingURL=index.d.ts.map