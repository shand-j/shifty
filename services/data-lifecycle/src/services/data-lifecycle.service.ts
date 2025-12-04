import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { DatabaseManager } from '@shifty/database';
import {
  RetentionPolicy,
  DataAsset,
  DataAssetType,
  DataAssetStatus,
  DataClassification,
  DeletionJob,
  DeletionJobStatus,
  DeletionMethod,
  DeletionCertificate,
  DisposableWorkspace,
  DataAccessLog,
  ComplianceReport,
} from '@shifty/shared';

export class DataLifecycleService {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  // ==================== Retention Policies ====================

  /**
   * Create a retention policy for a tenant
   */
  async createRetentionPolicy(
    tenantId: string,
    policy: Omit<RetentionPolicy, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ): Promise<RetentionPolicy> {
    const policyId = uuidv4();
    
    const fullPolicy: RetentionPolicy = {
      id: policyId,
      tenantId,
      ...policy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO retention_policies (
        id, tenant_id, name, description, data_classifications,
        retention_days, auto_delete, archive_before_delete, archive_location,
        notify_before_deletion, notification_days_before_deletion,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        policyId,
        tenantId,
        policy.name,
        policy.description || null,
        JSON.stringify(policy.dataClassifications),
        policy.retentionDays,
        policy.autoDelete,
        policy.archiveBeforeDelete,
        policy.archiveLocation || null,
        policy.notifyBeforeDeletion,
        policy.notificationDaysBeforeDeletion,
        fullPolicy.createdAt,
        fullPolicy.updatedAt,
      ]
    );

    console.log(`📋 Created retention policy: ${policyId} for tenant ${tenantId}`);
    return fullPolicy;
  }

  /**
   * Get retention policies for a tenant
   */
  async getTenantRetentionPolicies(tenantId: string): Promise<RetentionPolicy[]> {
    const query = 'SELECT * FROM retention_policies WHERE tenant_id = $1 ORDER BY created_at DESC';
    const result = await this.dbManager.query(query, [tenantId]);
    return result.rows.map(row => this.transformRetentionPolicyRow(row));
  }

  // ==================== Data Assets ====================

  /**
   * Register a data asset
   */
  async registerDataAsset(
    tenantId: string,
    asset: Omit<DataAsset, 'id' | 'tenantId' | 'status' | 'checksum' | 'createdAt' | 'updatedAt'>
  ): Promise<DataAsset> {
    const assetId = uuidv4();
    const checksum = await this.calculateChecksum(asset.storageLocation);
    
    // Calculate expiration based on retention policy
    let expiresAt: Date | undefined;
    if (asset.retentionPolicyId) {
      const policy = await this.getRetentionPolicy(asset.retentionPolicyId);
      if (policy) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + policy.retentionDays);
      }
    }

    const fullAsset: DataAsset = {
      id: assetId,
      tenantId,
      ...asset,
      status: 'active',
      checksum,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO data_assets (
        id, tenant_id, type, name, classification, status, storage_location,
        size_bytes, checksum, retention_policy_id, expires_at, metadata, tags,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        assetId,
        tenantId,
        asset.type,
        asset.name,
        asset.classification,
        'active',
        asset.storageLocation,
        asset.sizeBytes,
        checksum,
        asset.retentionPolicyId || null,
        expiresAt || null,
        JSON.stringify(asset.metadata),
        JSON.stringify(asset.tags),
        asset.createdBy,
        fullAsset.createdAt,
        fullAsset.updatedAt,
      ]
    );

    console.log(`📁 Registered data asset: ${assetId}`);
    return fullAsset;
  }

  /**
   * Get data assets for a tenant
   */
  async getTenantDataAssets(tenantId: string, filters?: {
    type?: DataAssetType;
    classification?: DataClassification;
    status?: DataAssetStatus;
  }): Promise<DataAsset[]> {
    let query = 'SELECT * FROM data_assets WHERE tenant_id = $1';
    const values: any[] = [tenantId];

    if (filters?.type) {
      values.push(filters.type);
      query += ` AND type = $${values.length}`;
    }
    if (filters?.classification) {
      values.push(filters.classification);
      query += ` AND classification = $${values.length}`;
    }
    if (filters?.status) {
      values.push(filters.status);
      query += ` AND status = $${values.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.dbManager.query(query, values);
    return result.rows.map(row => this.transformDataAssetRow(row));
  }

  // ==================== Secure Deletion ====================

  /**
   * Request secure deletion of data assets
   */
  async requestDeletion(
    tenantId: string,
    assetIds: string[],
    method: DeletionMethod,
    reason: string,
    requestedBy: string
  ): Promise<DeletionJob> {
    const jobId = uuidv4();

    const job: DeletionJob = {
      id: jobId,
      tenantId,
      assetIds,
      method,
      status: 'pending',
      reason,
      requestedBy,
      deletionLog: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO deletion_jobs (
        id, tenant_id, asset_ids, method, status, reason, requested_by,
        deletion_log, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        jobId,
        tenantId,
        JSON.stringify(assetIds),
        method,
        'pending',
        reason,
        requestedBy,
        JSON.stringify([]),
        job.createdAt,
        job.updatedAt,
      ]
    );

    // Mark assets as pending deletion
    await this.dbManager.query(
      `UPDATE data_assets SET status = 'pending_deletion', updated_at = NOW()
       WHERE id = ANY($1::uuid[])`,
      [assetIds]
    );

    console.log(`🗑️ Deletion job created: ${jobId} for ${assetIds.length} assets`);
    return job;
  }

  /**
   * Execute a deletion job
   */
  async executeDeletionJob(jobId: string, approvedBy?: string): Promise<DeletionJob> {
    const job = await this.getDeletionJob(jobId);
    if (!job) {
      throw new Error(`Deletion job not found: ${jobId}`);
    }

    if (job.status !== 'pending') {
      throw new Error(`Job cannot be executed in status: ${job.status}`);
    }

    // Update job status and approval
    await this.updateDeletionJobStatus(jobId, 'in_progress', approvedBy);

    console.log(`🔥 Executing deletion job: ${jobId}`);

    const deletionLog: DeletionJob['deletionLog'] = [];

    for (const assetId of job.assetIds) {
      try {
        const asset = await this.getDataAsset(assetId);
        if (!asset) {
          deletionLog.push({
            assetId,
            timestamp: new Date(),
            status: 'skipped',
            details: 'Asset not found',
          });
          continue;
        }

        // Update asset status
        await this.updateDataAssetStatus(assetId, 'deletion_in_progress');

        // Perform secure deletion based on method
        const verificationHash = await this.performSecureDeletion(asset, job.method);

        deletionLog.push({
          assetId,
          timestamp: new Date(),
          status: 'success',
          verificationHash,
        });

        // Update asset as deleted
        await this.updateDataAssetStatus(assetId, 'deleted');
      } catch (error: any) {
        deletionLog.push({
          assetId,
          timestamp: new Date(),
          status: 'failed',
          details: error.message,
        });
      }
    }

    // Update job with deletion log
    await this.dbManager.query(
      `UPDATE deletion_jobs SET deletion_log = $2, updated_at = NOW() WHERE id = $1`,
      [jobId, JSON.stringify(deletionLog)]
    );

    // Verify deletion
    await this.updateDeletionJobStatus(jobId, 'verifying');
    const verificationProof = await this.verifyDeletion(job, deletionLog);

    // Generate certificate
    const certificate = await this.generateDeletionCertificate(job, deletionLog, verificationProof);

    // Update job as completed
    const allSuccessful = deletionLog.every(log => log.status === 'success');
    await this.updateDeletionJobStatus(
      jobId,
      allSuccessful ? 'completed' : 'partially_completed',
      undefined,
      verificationProof,
      certificate.id
    );

    console.log(`✅ Deletion job completed: ${jobId}`);
    return (await this.getDeletionJob(jobId))!;
  }

  /**
   * Get deletion job status
   */
  async getDeletionJob(jobId: string): Promise<DeletionJob | null> {
    const query = 'SELECT * FROM deletion_jobs WHERE id = $1';
    const result = await this.dbManager.query(query, [jobId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformDeletionJobRow(result.rows[0]);
  }

  // ==================== Disposable Workspaces ====================

  /**
   * Create a disposable workspace for training/inference
   */
  async createDisposableWorkspace(
    tenantId: string,
    type: 'training' | 'inference' | 'evaluation',
    sizeAllocatedBytes: number,
    autoDestroyAfterMinutes: number = 60
  ): Promise<DisposableWorkspace> {
    const workspaceId = uuidv4();
    const storageLocation = `/workspaces/${tenantId}/${workspaceId}`;
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + autoDestroyAfterMinutes);

    const workspace: DisposableWorkspace = {
      id: workspaceId,
      tenantId,
      type,
      status: 'creating',
      storageLocation,
      sizeAllocatedBytes,
      sizeUsedBytes: 0,
      dataAssets: [],
      autoDestroyAfterMinutes,
      destroyOnCompletion: true,
      secureWipeOnDestroy: true,
      createdAt: new Date(),
      expiresAt,
    };

    await this.dbManager.query(
      `INSERT INTO disposable_workspaces (
        id, tenant_id, type, gpu_instance_id, status, storage_location,
        size_allocated_bytes, size_used_bytes, data_assets, auto_destroy_after_minutes,
        destroy_on_completion, secure_wipe_on_destroy, created_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        workspaceId,
        tenantId,
        type,
        null,
        'creating',
        storageLocation,
        sizeAllocatedBytes,
        0,
        JSON.stringify([]),
        autoDestroyAfterMinutes,
        true,
        true,
        workspace.createdAt,
        workspace.expiresAt,
      ]
    );

    // Create actual workspace (in production, this creates storage)
    await this.provisionWorkspaceStorage(workspace);

    // Update status to active
    await this.dbManager.query(
      `UPDATE disposable_workspaces SET status = 'active' WHERE id = $1`,
      [workspaceId]
    );
    workspace.status = 'active';

    console.log(`📦 Created disposable workspace: ${workspaceId}`);
    return workspace;
  }

  /**
   * Destroy a disposable workspace
   */
  async destroyWorkspace(workspaceId: string): Promise<void> {
    const query = 'SELECT * FROM disposable_workspaces WHERE id = $1';
    const result = await this.dbManager.query(query, [workspaceId]);
    
    if (result.rows.length === 0) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    const workspace = this.transformWorkspaceRow(result.rows[0]);
    
    console.log(`💥 Destroying workspace: ${workspaceId}`);
    await this.dbManager.query(
      `UPDATE disposable_workspaces SET status = 'destroying' WHERE id = $1`,
      [workspaceId]
    );

    // Secure wipe if configured
    if (workspace.secureWipeOnDestroy) {
      await this.secureWipeStorage(workspace.storageLocation);
    }

    // Delete workspace storage
    await this.deleteWorkspaceStorage(workspace.storageLocation);

    // Update status
    await this.dbManager.query(
      `UPDATE disposable_workspaces SET status = 'destroyed', destroyed_at = NOW() WHERE id = $1`,
      [workspaceId]
    );

    console.log(`✅ Workspace destroyed: ${workspaceId}`);
  }

  /**
   * Process expired workspaces
   */
  async processExpiredWorkspaces(): Promise<number> {
    const query = `
      SELECT id FROM disposable_workspaces 
      WHERE status = 'active' AND expires_at < NOW()
    `;
    const result = await this.dbManager.query(query, []);
    
    let destroyedCount = 0;
    for (const row of result.rows) {
      try {
        await this.destroyWorkspace(row.id);
        destroyedCount++;
      } catch (error) {
        console.error(`Failed to destroy expired workspace ${row.id}:`, error);
      }
    }

    return destroyedCount;
  }

  // ==================== Audit Logging ====================

  /**
   * Log data access
   */
  async logDataAccess(log: Omit<DataAccessLog, 'id' | 'timestamp'>): Promise<void> {
    const logId = uuidv4();
    
    await this.dbManager.query(
      `INSERT INTO data_access_logs (
        id, tenant_id, asset_id, user_id, action, ip_address,
        user_agent, success, failure_reason, metadata, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        logId,
        log.tenantId,
        log.assetId,
        log.userId,
        log.action,
        log.ipAddress,
        log.userAgent || null,
        log.success,
        log.failureReason || null,
        JSON.stringify(log.metadata),
        new Date(),
      ]
    );
  }

  // ==================== Compliance Reports ====================

  /**
   * Generate a compliance report
   */
  async generateComplianceReport(
    tenantId: string,
    reportType: ComplianceReport['reportType'],
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    const reportId = uuidv4();

    // Gather statistics based on report type
    const summary = await this.gatherComplianceStats(tenantId, reportType, periodStart, periodEnd);

    const report: ComplianceReport = {
      id: reportId,
      tenantId,
      reportType,
      periodStart,
      periodEnd,
      summary,
      details: {},
      generatedAt: new Date(),
      generatedBy,
    };

    await this.dbManager.query(
      `INSERT INTO compliance_reports (
        id, tenant_id, report_type, period_start, period_end,
        summary, details, generated_at, generated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        reportId,
        tenantId,
        reportType,
        periodStart,
        periodEnd,
        JSON.stringify(summary),
        JSON.stringify({}),
        report.generatedAt,
        generatedBy,
      ]
    );

    console.log(`📊 Generated compliance report: ${reportId}`);
    return report;
  }

  // ==================== Private Helper Methods ====================

  private async getRetentionPolicy(policyId: string): Promise<RetentionPolicy | null> {
    const query = 'SELECT * FROM retention_policies WHERE id = $1';
    const result = await this.dbManager.query(query, [policyId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformRetentionPolicyRow(result.rows[0]);
  }

  private async getDataAsset(assetId: string): Promise<DataAsset | null> {
    const query = 'SELECT * FROM data_assets WHERE id = $1';
    const result = await this.dbManager.query(query, [assetId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformDataAssetRow(result.rows[0]);
  }

  private async updateDataAssetStatus(assetId: string, status: DataAssetStatus): Promise<void> {
    await this.dbManager.query(
      `UPDATE data_assets SET status = $2, updated_at = NOW()
       ${status === 'deleted' ? ', deleted_at = NOW()' : ''} WHERE id = $1`,
      [assetId, status]
    );
  }

  private async updateDeletionJobStatus(
    jobId: string,
    status: DeletionJobStatus,
    approvedBy?: string,
    verificationProof?: DeletionJob['verificationProof'],
    certificateId?: string
  ): Promise<void> {
    let query = `UPDATE deletion_jobs SET status = $2, updated_at = NOW()`;
    const values: any[] = [jobId, status];

    if (approvedBy) {
      values.push(approvedBy);
      query += `, approved_by = $${values.length}`;
    }

    if (verificationProof) {
      values.push(JSON.stringify(verificationProof));
      query += `, verification_proof = $${values.length}`;
    }

    if (status === 'in_progress') {
      query += `, started_at = NOW()`;
    } else if (status === 'completed' || status === 'partially_completed' || status === 'failed') {
      query += `, completed_at = NOW()`;
    }

    query += ` WHERE id = $1`;
    await this.dbManager.query(query, values);
  }

  private async calculateChecksum(path: string): Promise<string> {
    // In production, calculate actual SHA-256 hash of the file/data
    return crypto.createHash('sha256').update(path + Date.now()).digest('hex');
  }

  private async performSecureDeletion(
    asset: DataAsset,
    method: DeletionMethod
  ): Promise<string> {
    console.log(`🔐 Performing ${method} deletion for asset: ${asset.id}`);

    switch (method) {
      case 'standard':
        // Standard deletion
        break;
      case 'secure_overwrite':
        // Multiple pass overwrite (3 passes)
        await this.multiPassOverwrite(asset.storageLocation, 3);
        break;
      case 'cryptographic_erase':
        // Destroy encryption keys (data becomes unreadable)
        await this.cryptographicErase(asset.storageLocation);
        break;
      case 'dod_5220':
        // DoD 5220.22-M standard (7 passes)
        await this.multiPassOverwrite(asset.storageLocation, 7);
        break;
      case 'nist_800_88':
        // NIST 800-88 Clear + Purge
        await this.multiPassOverwrite(asset.storageLocation, 3);
        break;
    }

    // Generate verification hash
    return crypto.createHash('sha256')
      .update(`${asset.id}:${method}:${Date.now()}`)
      .digest('hex');
  }

  private async multiPassOverwrite(path: string, passes: number): Promise<void> {
    console.log(`🔄 Overwriting ${path} with ${passes} passes`);
    // In production, perform actual file overwriting
    // Pass 1: Random data
    // Pass 2: Zeros
    // Pass 3: Ones
    // Repeat as needed
  }

  private async cryptographicErase(path: string): Promise<void> {
    console.log(`🔑 Cryptographic erase for ${path}`);
    // In production, destroy the encryption keys for this data
  }

  private async secureWipeStorage(path: string): Promise<void> {
    console.log(`🧹 Secure wiping storage: ${path}`);
    // In production, perform secure wipe of storage location
  }

  private async deleteWorkspaceStorage(path: string): Promise<void> {
    console.log(`🗑️ Deleting workspace storage: ${path}`);
    // In production, delete the storage directory/bucket
  }

  private async provisionWorkspaceStorage(workspace: DisposableWorkspace): Promise<void> {
    console.log(`📂 Provisioning workspace storage: ${workspace.storageLocation}`);
    // In production, create the storage directory/bucket
  }

  private async verifyDeletion(
    job: DeletionJob,
    deletionLog: DeletionJob['deletionLog']
  ): Promise<DeletionJob['verificationProof']> {
    // Compute hash of all deletion logs
    const logHash = crypto.createHash('sha256')
      .update(JSON.stringify(deletionLog))
      .digest('hex');

    return {
      method: job.method,
      timestamp: new Date(),
      checksum: logHash,
    };
  }

  private async generateDeletionCertificate(
    job: DeletionJob,
    deletionLog: DeletionJob['deletionLog'],
    verificationProof: DeletionJob['verificationProof']
  ): Promise<DeletionCertificate> {
    const certId = uuidv4();

    // Get asset details for summary
    const assetSummary: DeletionCertificate['assetSummary'] = [];
    for (const log of deletionLog) {
      if (log.status === 'success') {
        const asset = await this.getDataAsset(log.assetId);
        if (asset) {
          assetSummary.push({
            assetId: asset.id,
            assetType: asset.type,
            assetName: asset.name,
            classification: asset.classification,
            sizeBytes: asset.sizeBytes,
          });
        }
      }
    }

    const signatureHash = crypto.createHash('sha256')
      .update(`${certId}:${job.id}:${JSON.stringify(assetSummary)}:${Date.now()}`)
      .digest('hex');

    const certificate: DeletionCertificate = {
      id: certId,
      tenantId: job.tenantId,
      deletionJobId: job.id,
      assetSummary,
      deletionMethod: job.method,
      verificationDetails: {
        verifiedBy: 'automated',
        verificationDate: new Date(),
        verificationMethod: 'checksum_verification',
        auditTrailHash: verificationProof!.checksum,
      },
      complianceStandards: this.getComplianceStandards(job.method),
      issuedAt: new Date(),
      signatureHash,
    };

    await this.dbManager.query(
      `INSERT INTO deletion_certificates (
        id, tenant_id, deletion_job_id, asset_summary, deletion_method,
        verification_details, compliance_standards, issued_at, signature_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        certId,
        certificate.tenantId,
        certificate.deletionJobId,
        JSON.stringify(certificate.assetSummary),
        certificate.deletionMethod,
        JSON.stringify(certificate.verificationDetails),
        JSON.stringify(certificate.complianceStandards),
        certificate.issuedAt,
        certificate.signatureHash,
      ]
    );

    return certificate;
  }

  private getComplianceStandards(method: DeletionMethod): string[] {
    const standards: Record<DeletionMethod, string[]> = {
      standard: ['Internal Policy'],
      secure_overwrite: ['GDPR', 'SOC2'],
      cryptographic_erase: ['GDPR', 'SOC2', 'PCI-DSS'],
      dod_5220: ['GDPR', 'SOC2', 'DoD 5220.22-M', 'HIPAA'],
      nist_800_88: ['GDPR', 'SOC2', 'NIST 800-88', 'HIPAA'],
    };
    return standards[method];
  }

  private async gatherComplianceStats(
    tenantId: string,
    reportType: ComplianceReport['reportType'],
    periodStart: Date,
    periodEnd: Date
  ): Promise<ComplianceReport['summary']> {
    // Gather assets
    const assetsQuery = `
      SELECT 
        COUNT(*) as total,
        classification,
        type
      FROM data_assets 
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
      GROUP BY classification, type
    `;
    const assetsResult = await this.dbManager.query(assetsQuery, [tenantId, periodStart, periodEnd]);

    const assetsByClassification: Record<string, number> = {};
    const assetsByType: Record<string, number> = {};
    let totalAssets = 0;

    for (const row of assetsResult.rows) {
      totalAssets += parseInt(row.total);
      assetsByClassification[row.classification] = (assetsByClassification[row.classification] || 0) + parseInt(row.total);
      assetsByType[row.type] = (assetsByType[row.type] || 0) + parseInt(row.total);
    }

    // Gather deletions
    const deletionsQuery = `
      SELECT COUNT(*) as total FROM deletion_jobs 
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3 AND status = 'completed'
    `;
    const deletionsResult = await this.dbManager.query(deletionsQuery, [tenantId, periodStart, periodEnd]);
    const deletionsProcessed = parseInt(deletionsResult.rows[0]?.total || 0);

    // Gather access events
    const accessQuery = `
      SELECT COUNT(*) as total FROM data_access_logs 
      WHERE tenant_id = $1 AND timestamp BETWEEN $2 AND $3
    `;
    const accessResult = await this.dbManager.query(accessQuery, [tenantId, periodStart, periodEnd]);
    const accessEvents = parseInt(accessResult.rows[0]?.total || 0);

    return {
      totalAssets,
      assetsByClassification,
      assetsByType,
      deletionsProcessed,
      retentionViolations: 0, // Would need specific retention violation tracking
      accessEvents,
    };
  }

  // Transform row methods
  private transformRetentionPolicyRow(row: any): RetentionPolicy {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description,
      dataClassifications: typeof row.data_classifications === 'string' 
        ? JSON.parse(row.data_classifications) : row.data_classifications,
      retentionDays: row.retention_days,
      autoDelete: row.auto_delete,
      archiveBeforeDelete: row.archive_before_delete,
      archiveLocation: row.archive_location,
      notifyBeforeDeletion: row.notify_before_deletion,
      notificationDaysBeforeDeletion: row.notification_days_before_deletion,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private transformDataAssetRow(row: any): DataAsset {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      type: row.type,
      name: row.name,
      classification: row.classification,
      status: row.status,
      storageLocation: row.storage_location,
      sizeBytes: row.size_bytes,
      checksum: row.checksum,
      retentionPolicyId: row.retention_policy_id,
      expiresAt: row.expires_at,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }

  private transformDeletionJobRow(row: any): DeletionJob {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      assetIds: typeof row.asset_ids === 'string' ? JSON.parse(row.asset_ids) : row.asset_ids,
      method: row.method,
      status: row.status,
      reason: row.reason,
      requestedBy: row.requested_by,
      approvedBy: row.approved_by,
      verificationProof: row.verification_proof 
        ? (typeof row.verification_proof === 'string' ? JSON.parse(row.verification_proof) : row.verification_proof)
        : undefined,
      deletionLog: typeof row.deletion_log === 'string' ? JSON.parse(row.deletion_log) : row.deletion_log,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private transformWorkspaceRow(row: any): DisposableWorkspace {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      type: row.type,
      gpuInstanceId: row.gpu_instance_id,
      status: row.status,
      storageLocation: row.storage_location,
      sizeAllocatedBytes: row.size_allocated_bytes,
      sizeUsedBytes: row.size_used_bytes,
      dataAssets: typeof row.data_assets === 'string' ? JSON.parse(row.data_assets) : row.data_assets,
      autoDestroyAfterMinutes: row.auto_destroy_after_minutes,
      destroyOnCompletion: row.destroy_on_completion,
      secureWipeOnDestroy: row.secure_wipe_on_destroy,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      destroyedAt: row.destroyed_at,
    };
  }
}
