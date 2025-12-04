import { v4 as uuidv4 } from 'uuid';
import { DatabaseManager } from '@shifty/database';
import {
  GpuInstance,
  GpuInstanceConfig,
  GpuInstanceStatus,
  GpuProvisioningRequest,
  GpuProvisioningResult,
  GpuCostSummary,
} from '@shifty/shared';
import { VastaiService } from './vastai.service';

export class GpuProvisionerService {
  private dbManager: DatabaseManager;
  private vastaiService: VastaiService;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
    this.vastaiService = new VastaiService({
      apiKey: process.env.VASTAI_API_KEY || '',
    });
  }

  /**
   * Provision a new GPU instance for a tenant
   */
  async provisionInstance(request: GpuProvisioningRequest): Promise<GpuProvisioningResult> {
    const instanceId = uuidv4();
    console.log(`🖥️ Provisioning GPU instance for tenant ${request.tenantId}`);

    try {
      // 1. Search for available offers
      const offers = await this.vastaiService.searchOffers(request.config);
      
      if (offers.length === 0) {
        throw new Error('No available GPU offers matching requirements');
      }

      // 2. Select best offer (first one as they're sorted by score)
      const selectedOffer = offers[0];
      console.log(`📦 Selected offer: ${selectedOffer.gpu_name} @ $${selectedOffer.dph_total}/hr`);

      // 3. Create instance record in database
      const instance: GpuInstance = {
        id: instanceId,
        tenantId: request.tenantId,
        vastaiInstanceId: '', // Will be updated after provisioning
        config: request.config,
        status: 'provisioning',
        costAccrued: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.createInstanceRecord(instance);

      // 4. Provision the instance on vast.ai
      const vastaiInstance = await this.vastaiService.provisionInstance(
        selectedOffer.id,
        request.tenantId,
        request.modelCheckpoint
      );

      // 5. Update instance record with vast.ai details
      instance.vastaiInstanceId = String(vastaiInstance.id);
      instance.ipAddress = vastaiInstance.public_ipaddr;
      instance.sshPort = vastaiInstance.ssh_port;
      instance.status = 'running';
      instance.modelEndpoint = `http://${vastaiInstance.public_ipaddr}:8080`;
      instance.updatedAt = new Date();

      await this.updateInstanceRecord(instance);

      // 6. Generate API key for this instance
      const apiKey = this.generateInstanceApiKey(instanceId, request.tenantId);

      console.log(`✅ GPU instance provisioned: ${instanceId}`);

      return {
        instance,
        connectionDetails: {
          endpoint: instance.modelEndpoint || '',
          sshHost: vastaiInstance.ssh_host,
          sshPort: vastaiInstance.ssh_port,
          apiKey,
        },
        estimatedCostPerHour: selectedOffer.dph_total,
      };
    } catch (error) {
      console.error(`❌ Failed to provision GPU instance: ${error}`);
      
      // Update status to error
      await this.updateInstanceStatus(instanceId, 'error');
      throw error;
    }
  }

  /**
   * Get instance status
   */
  async getInstanceStatus(instanceId: string): Promise<GpuInstance | null> {
    const query = 'SELECT * FROM gpu_instances WHERE id = $1';
    const result = await this.dbManager.query(query, [instanceId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformInstanceRow(result.rows[0]);
  }

  /**
   * Get all instances for a tenant
   */
  async getTenantInstances(tenantId: string): Promise<GpuInstance[]> {
    const query = 'SELECT * FROM gpu_instances WHERE tenant_id = $1 ORDER BY created_at DESC';
    const result = await this.dbManager.query(query, [tenantId]);
    return result.rows.map(row => this.transformInstanceRow(row));
  }

  /**
   * Terminate an instance
   */
  async terminateInstance(instanceId: string): Promise<void> {
    console.log(`🛑 Terminating GPU instance: ${instanceId}`);

    const instance = await this.getInstanceStatus(instanceId);
    if (!instance) {
      throw new Error(`Instance not found: ${instanceId}`);
    }

    try {
      // Update status to stopping
      await this.updateInstanceStatus(instanceId, 'stopping');

      // Terminate on vast.ai
      if (instance.vastaiInstanceId) {
        await this.vastaiService.terminateInstance(parseInt(instance.vastaiInstanceId, 10));
      }

      // Update status to terminated
      await this.updateInstanceStatus(instanceId, 'terminated');

      console.log(`✅ GPU instance terminated: ${instanceId}`);
    } catch (error) {
      console.error(`❌ Failed to terminate instance: ${error}`);
      await this.updateInstanceStatus(instanceId, 'error');
      throw error;
    }
  }

  /**
   * Get cost summary for a tenant
   */
  async getCostSummary(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<GpuCostSummary> {
    const query = `
      SELECT 
        i.id,
        i.config->>'instanceType' as instance_type,
        EXTRACT(EPOCH FROM (
          LEAST(i.terminated_at, $3) - GREATEST(i.created_at, $2)
        )) / 3600 as hours_used,
        i.cost_accrued
      FROM gpu_instances i
      WHERE i.tenant_id = $1
        AND i.created_at <= $3
        AND (i.terminated_at IS NULL OR i.terminated_at >= $2)
    `;

    const result = await this.dbManager.query(query, [tenantId, periodStart, periodEnd]);

    const instanceBreakdown = result.rows.map(row => ({
      instanceId: row.id,
      instanceType: row.instance_type,
      hoursUsed: Math.max(0, parseFloat(row.hours_used) || 0),
      cost: parseFloat(row.cost_accrued) || 0,
    }));

    const totalCost = instanceBreakdown.reduce((sum, i) => sum + i.cost, 0);

    return {
      tenantId,
      periodStart,
      periodEnd,
      totalCost,
      instanceBreakdown,
    };
  }

  /**
   * Update cost tracking for all running instances
   */
  async updateCostTracking(): Promise<void> {
    try {
      const costs = await this.vastaiService.getCurrentCosts();
      
      for (const { id, cost } of costs.instances) {
        await this.dbManager.query(
          'UPDATE gpu_instances SET cost_accrued = $1, updated_at = NOW() WHERE vastai_instance_id = $2',
          [cost, String(id)]
        );
      }
    } catch (error) {
      console.error('Failed to update cost tracking:', error);
    }
  }

  /**
   * Health check for instance
   */
  async healthCheck(instanceId: string): Promise<{ healthy: boolean; details: string }> {
    const instance = await this.getInstanceStatus(instanceId);
    
    if (!instance) {
      return { healthy: false, details: 'Instance not found' };
    }

    if (instance.status !== 'running') {
      return { healthy: false, details: `Instance status: ${instance.status}` };
    }

    // Check if model endpoint is responding
    if (instance.modelEndpoint) {
      try {
        const axios = (await import('axios')).default;
        const response = await axios.get(`${instance.modelEndpoint}/health`, {
          timeout: 5000,
        });
        return { healthy: true, details: 'Model endpoint healthy' };
      } catch (error) {
        return { healthy: false, details: 'Model endpoint not responding' };
      }
    }

    return { healthy: true, details: 'Instance running' };
  }

  // Private methods
  private async createInstanceRecord(instance: GpuInstance): Promise<void> {
    const query = `
      INSERT INTO gpu_instances (
        id, tenant_id, vastai_instance_id, config, status,
        ip_address, ssh_port, model_endpoint, cost_accrued,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    await this.dbManager.query(query, [
      instance.id,
      instance.tenantId,
      instance.vastaiInstanceId,
      JSON.stringify(instance.config),
      instance.status,
      instance.ipAddress || null,
      instance.sshPort || null,
      instance.modelEndpoint || null,
      instance.costAccrued,
      instance.createdAt,
      instance.updatedAt,
    ]);
  }

  private async updateInstanceRecord(instance: GpuInstance): Promise<void> {
    const query = `
      UPDATE gpu_instances SET
        vastai_instance_id = $2,
        status = $3,
        ip_address = $4,
        ssh_port = $5,
        model_endpoint = $6,
        cost_accrued = $7,
        updated_at = $8,
        terminated_at = $9
      WHERE id = $1
    `;

    await this.dbManager.query(query, [
      instance.id,
      instance.vastaiInstanceId,
      instance.status,
      instance.ipAddress || null,
      instance.sshPort || null,
      instance.modelEndpoint || null,
      instance.costAccrued,
      instance.updatedAt,
      instance.terminatedAt || null,
    ]);
  }

  private async updateInstanceStatus(
    instanceId: string,
    status: GpuInstanceStatus
  ): Promise<void> {
    const query = `
      UPDATE gpu_instances SET status = $2, updated_at = NOW()
      ${status === 'terminated' ? ', terminated_at = NOW()' : ''}
      WHERE id = $1
    `;
    await this.dbManager.query(query, [instanceId, status]);
  }

  private generateInstanceApiKey(instanceId: string, tenantId: string): string {
    // In production, use proper key generation with crypto
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  private transformInstanceRow(row: any): GpuInstance {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      vastaiInstanceId: row.vastai_instance_id,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      status: row.status,
      ipAddress: row.ip_address,
      sshPort: row.ssh_port,
      modelEndpoint: row.model_endpoint,
      costAccrued: parseFloat(row.cost_accrued) || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      terminatedAt: row.terminated_at,
    };
  }
}
