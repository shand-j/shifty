import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  GpuInstance,
  GpuInstanceConfig,
  GpuProvisioningRequest,
  GpuProvisioningResult,
  GpuCostSummary,
  VastaiOffer,
  VastaiInstance,
} from '@shifty/shared';

export interface VastaiCredentials {
  apiKey: string;
}

export class VastaiService {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor(credentials: VastaiCredentials) {
    this.apiKey = credentials.apiKey;
    this.baseUrl = process.env.VASTAI_API_URL || 'https://console.vast.ai/api/v0';
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Search for available GPU offers matching the configuration
   */
  async searchOffers(config: GpuInstanceConfig): Promise<VastaiOffer[]> {
    try {
      const gpuNameFilter = this.mapInstanceTypeToGpuName(config.instanceType);
      
      const response = await this.client.get('/bundles', {
        params: {
          q: JSON.stringify({
            verified: { eq: true },
            external: { eq: false },
            rentable: { eq: true },
            disk_space: { gte: config.diskSize },
            num_gpus: { gte: config.gpuCount },
            gpu_name: { eq: gpuNameFilter },
            dph_total: { lte: config.maxBudgetPerHour },
            inet_down: { gte: 100 }, // Minimum 100 Mbps download
            reliability: { gte: 0.95 }, // Minimum 95% reliability
          }),
          order: 'score-',
          type: 'on-demand',
          api_key: this.apiKey,
        },
      });

      return response.data.offers || [];
    } catch (error) {
      console.error('Failed to search vast.ai offers:', error);
      throw new Error(`Failed to search GPU offers: ${error}`);
    }
  }

  /**
   * Provision a new GPU instance
   */
  async provisionInstance(
    offerId: number,
    tenantId: string,
    modelCheckpoint?: string
  ): Promise<VastaiInstance> {
    try {
      // Build the docker image command for model deployment
      const dockerImage = this.getDockerImage(modelCheckpoint);
      const onStartCmd = this.getOnStartCommand(tenantId, modelCheckpoint);

      const response = await this.client.put(
        `/asks/${offerId}/`,
        {
          client_id: 'me',
          image: dockerImage,
          disk: 50, // GB
          onstart: onStartCmd,
          label: `shifty-tenant-${tenantId}`,
          env: {
            TENANT_ID: tenantId,
            MODEL_CHECKPOINT: modelCheckpoint || '',
            SHIFTY_API_KEY: process.env.SHIFTY_INTERNAL_API_KEY || '',
          },
        },
        {
          params: { api_key: this.apiKey },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to provision vast.ai instance:', error);
      throw new Error(`Failed to provision GPU instance: ${error}`);
    }
  }

  /**
   * Get instance status
   */
  async getInstanceStatus(instanceId: number): Promise<VastaiInstance> {
    try {
      const response = await this.client.get('/instances', {
        params: { api_key: this.apiKey },
      });

      const instance = response.data.instances?.find(
        (i: VastaiInstance) => i.id === instanceId
      );

      if (!instance) {
        throw new Error(`Instance ${instanceId} not found`);
      }

      return instance;
    } catch (error) {
      console.error('Failed to get instance status:', error);
      throw new Error(`Failed to get instance status: ${error}`);
    }
  }

  /**
   * Terminate an instance
   */
  async terminateInstance(instanceId: number): Promise<void> {
    try {
      await this.client.delete(`/instances/${instanceId}/`, {
        params: { api_key: this.apiKey },
      });
    } catch (error) {
      console.error('Failed to terminate vast.ai instance:', error);
      throw new Error(`Failed to terminate instance: ${error}`);
    }
  }

  /**
   * Get current costs for all instances
   */
  async getCurrentCosts(): Promise<{ instances: Array<{ id: number; cost: number }> }> {
    try {
      const response = await this.client.get('/instances', {
        params: { api_key: this.apiKey },
      });

      const instances = response.data.instances || [];
      return {
        instances: instances.map((i: VastaiInstance & { cur_cost?: number }) => ({
          id: i.id,
          cost: i.cur_cost || 0,
        })),
      };
    } catch (error) {
      console.error('Failed to get current costs:', error);
      throw new Error(`Failed to get current costs: ${error}`);
    }
  }

  /**
   * Map our instance type to vast.ai GPU name
   */
  private mapInstanceTypeToGpuName(instanceType: GpuInstanceConfig['instanceType']): string {
    const mapping: Record<GpuInstanceConfig['instanceType'], string> = {
      'RTX_3090': 'RTX 3090',
      'RTX_4090': 'RTX 4090',
      'A100_40GB': 'A100 40GB',
      'A100_80GB': 'A100 80GB',
      'H100': 'H100',
    };
    return mapping[instanceType];
  }

  /**
   * Get docker image based on model checkpoint
   */
  private getDockerImage(modelCheckpoint?: string): string {
    // Use vLLM or text-generation-inference based on model type
    if (modelCheckpoint?.includes('llama') || modelCheckpoint?.includes('mistral')) {
      return 'ghcr.io/huggingface/text-generation-inference:latest';
    }
    return 'vllm/vllm-openai:latest';
  }

  /**
   * Get startup command for the instance
   */
  private getOnStartCommand(tenantId: string, modelCheckpoint?: string): string {
    const model = modelCheckpoint || 'meta-llama/Llama-2-7b-chat-hf';
    return `
      # Setup environment
      export TENANT_ID="${tenantId}"
      
      # Pull and run the model server
      text-generation-launcher --model-id ${model} \\
        --port 8080 \\
        --hostname 0.0.0.0 \\
        --max-batch-prefill-tokens 4096 \\
        --max-input-length 2048 \\
        --max-total-tokens 4096 \\
        --trust-remote-code
    `;
  }
}
