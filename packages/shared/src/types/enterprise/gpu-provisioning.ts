import { z } from 'zod';

// Vast.ai GPU Instance Configuration
export const GpuInstanceConfigSchema = z.object({
  instanceType: z.enum(['RTX_3090', 'RTX_4090', 'A100_40GB', 'A100_80GB', 'H100']),
  gpuCount: z.number().min(1).max(8),
  diskSize: z.number().min(50).max(2000), // GB
  region: z.enum(['us-east', 'us-west', 'eu-west', 'asia-east']),
  maxBudgetPerHour: z.number().min(0.1).max(100), // USD
});

export type GpuInstanceConfig = z.infer<typeof GpuInstanceConfigSchema>;

// GPU Instance Status
export const GpuInstanceStatusSchema = z.enum([
  'pending',
  'provisioning',
  'running',
  'stopping',
  'stopped',
  'terminated',
  'error'
]);

export type GpuInstanceStatus = z.infer<typeof GpuInstanceStatusSchema>;

// GPU Instance
export const GpuInstanceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  vastaiInstanceId: z.string(),
  config: GpuInstanceConfigSchema,
  status: GpuInstanceStatusSchema,
  ipAddress: z.string().ip().optional(),
  sshPort: z.number().optional(),
  modelEndpoint: z.string().url().optional(),
  costAccrued: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  terminatedAt: z.date().optional(),
});

export type GpuInstance = z.infer<typeof GpuInstanceSchema>;

// Vast.ai API Response Types
export interface VastaiOffer {
  id: number;
  gpu_name: string;
  num_gpus: number;
  gpu_ram: number;
  cpu_ram: number;
  disk_space: number;
  dph_total: number; // dollars per hour
  inet_up: number;
  inet_down: number;
  geolocation: string;
  reliability: number;
  verified: boolean;
}

export interface VastaiInstance {
  id: number;
  machine_id: number;
  actual_status: string;
  ssh_host: string;
  ssh_port: number;
  jupyter_token?: string;
  public_ipaddr?: string;
  cur_state: string;
}

// Provisioning Request
export const GpuProvisioningRequestSchema = z.object({
  tenantId: z.string().uuid(),
  config: GpuInstanceConfigSchema,
  modelCheckpoint: z.string().optional(), // Hugging Face model ID or custom checkpoint path
  autoScaling: z.object({
    enabled: z.boolean(),
    minInstances: z.number().min(0).max(10),
    maxInstances: z.number().min(1).max(10),
    targetUtilization: z.number().min(0.1).max(1),
  }).optional(),
});

export type GpuProvisioningRequest = z.infer<typeof GpuProvisioningRequestSchema>;

// Provisioning Result
export interface GpuProvisioningResult {
  instance: GpuInstance;
  connectionDetails: {
    endpoint: string;
    sshHost?: string;
    sshPort?: number;
    apiKey: string;
  };
  estimatedCostPerHour: number;
}

// Cost Tracking
export interface GpuCostSummary {
  tenantId: string;
  periodStart: Date;
  periodEnd: Date;
  totalCost: number;
  instanceBreakdown: Array<{
    instanceId: string;
    instanceType: string;
    hoursUsed: number;
    cost: number;
  }>;
  budgetRemaining?: number;
}
