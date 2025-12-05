import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { DatabaseManager } from '@shifty/database';
import {
  ReleasePolicy,
  PolicyRule,
  PolicyEvaluation,
  PolicyEvaluationStatus,
  RuleEvaluationResult,
  Deployment,
  DeploymentTarget,
  PipelineConfig,
  ReleaseGate,
  RollbackRequest,
} from '@shifty/shared';

export class CICDGovernorService {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  // ==================== Release Policies ====================

  /**
   * Create a release policy
   */
  async createReleasePolicy(
    tenantId: string,
    policy: Omit<ReleasePolicy, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ): Promise<ReleasePolicy> {
    const policyId = uuidv4();

    const fullPolicy: ReleasePolicy = {
      id: policyId,
      tenantId,
      ...policy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Assign UUIDs to rules if not present
    fullPolicy.rules = fullPolicy.rules.map(rule => ({
      ...rule,
      id: rule.id || uuidv4(),
    }));

    await this.dbManager.query(
      `INSERT INTO release_policies (
        id, tenant_id, name, description, rules, rollback_on_failure,
        notify_on_violation, notification_channels, webhook_urls, enabled,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        policyId, tenantId, policy.name, policy.description || null,
        JSON.stringify(fullPolicy.rules), policy.rollbackOnFailure,
        policy.notifyOnViolation, JSON.stringify(policy.notificationChannels),
        JSON.stringify(policy.webhookUrls), policy.enabled,
        fullPolicy.createdAt, fullPolicy.updatedAt,
      ]
    );

    console.log(`📋 Created release policy: ${policyId}`);
    return fullPolicy;
  }

  /**
   * Get release policy by ID
   */
  async getReleasePolicy(policyId: string): Promise<ReleasePolicy | null> {
    const query = 'SELECT * FROM release_policies WHERE id = $1';
    const result = await this.dbManager.query(query, [policyId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformPolicyRow(result.rows[0]);
  }

  /**
   * Get all policies for a tenant
   */
  async getTenantPolicies(tenantId: string): Promise<ReleasePolicy[]> {
    const query = 'SELECT * FROM release_policies WHERE tenant_id = $1 ORDER BY created_at DESC';
    const result = await this.dbManager.query(query, [tenantId]);
    return result.rows.map(row => this.transformPolicyRow(row));
  }

  /**
   * Update release policy
   */
  async updateReleasePolicy(
    policyId: string,
    updates: Partial<Omit<ReleasePolicy, 'id' | 'tenantId' | 'createdAt'>>
  ): Promise<ReleasePolicy> {
    const existing = await this.getReleasePolicy(policyId);
    if (!existing) {
      throw new Error(`Policy not found: ${policyId}`);
    }

    const updatedPolicy = { ...existing, ...updates, updatedAt: new Date() };
    
    if (updates.rules) {
      updatedPolicy.rules = updates.rules.map(rule => ({
        ...rule,
        id: rule.id || uuidv4(),
      }));
    }

    await this.dbManager.query(
      `UPDATE release_policies SET 
        name = $2, description = $3, rules = $4, rollback_on_failure = $5,
        notify_on_violation = $6, notification_channels = $7, webhook_urls = $8,
        enabled = $9, updated_at = $10
       WHERE id = $1`,
      [
        policyId, updatedPolicy.name, updatedPolicy.description,
        JSON.stringify(updatedPolicy.rules), updatedPolicy.rollbackOnFailure,
        updatedPolicy.notifyOnViolation, JSON.stringify(updatedPolicy.notificationChannels),
        JSON.stringify(updatedPolicy.webhookUrls), updatedPolicy.enabled,
        updatedPolicy.updatedAt,
      ]
    );

    return updatedPolicy;
  }

  // ==================== Policy Evaluation ====================

  /**
   * Evaluate a deployment against a policy
   */
  async evaluatePolicy(
    tenantId: string,
    policyId: string,
    pipelineId: string,
    commitSha: string,
    branch: string,
    metrics: Record<string, number>
  ): Promise<PolicyEvaluation> {
    const evaluationId = uuidv4();
    const policy = await this.getReleasePolicy(policyId);
    
    if (!policy) {
      throw new Error(`Policy not found: ${policyId}`);
    }

    console.log(`🔍 Evaluating policy ${policy.name} for pipeline ${pipelineId}`);

    const evaluation: PolicyEvaluation = {
      id: evaluationId,
      tenantId,
      policyId,
      pipelineId,
      commitSha,
      branch,
      status: 'running',
      ruleResults: [],
      triggeredRollback: false,
      startedAt: new Date(),
      createdAt: new Date(),
    };

    // Evaluate each rule
    let hasBlocker = false;
    let hasWarning = false;

    for (const rule of policy.rules) {
      if (!rule.enabled) continue;

      const result = this.evaluateRule(rule, metrics);
      evaluation.ruleResults.push(result);

      if (result.status === 'failed' && rule.severity === 'blocker') {
        hasBlocker = true;
      } else if (result.status === 'failed' && rule.severity === 'critical') {
        hasBlocker = true;
      } else if (result.status === 'failed') {
        hasWarning = true;
      }
    }

    // Determine overall status
    if (hasBlocker) {
      evaluation.status = 'failed';
    } else if (hasWarning) {
      evaluation.status = 'warning';
    } else {
      evaluation.status = 'passed';
    }

    evaluation.completedAt = new Date();

    // Trigger rollback if needed
    if (evaluation.status === 'failed' && policy.rollbackOnFailure) {
      evaluation.triggeredRollback = true;
      console.log(`⚠️ Policy evaluation failed - rollback triggered`);
    }

    // Save evaluation
    await this.dbManager.query(
      `INSERT INTO policy_evaluations (
        id, tenant_id, policy_id, pipeline_id, commit_sha, branch, status,
        rule_results, triggered_rollback, rollback_details, started_at,
        completed_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        evaluationId, tenantId, policyId, pipelineId, commitSha, branch,
        evaluation.status, JSON.stringify(evaluation.ruleResults),
        evaluation.triggeredRollback, evaluation.rollbackDetails ? JSON.stringify(evaluation.rollbackDetails) : null,
        evaluation.startedAt, evaluation.completedAt, evaluation.createdAt,
      ]
    );

    // Send notifications if enabled
    if (policy.notifyOnViolation && evaluation.status !== 'passed') {
      await this.sendNotifications(policy, evaluation);
    }

    console.log(`✅ Policy evaluation completed: ${evaluation.status}`);
    return evaluation;
  }

  /**
   * Evaluate a single rule
   */
  private evaluateRule(rule: PolicyRule, metrics: Record<string, number>): RuleEvaluationResult {
    const actualValue = metrics[rule.metric];
    
    if (actualValue === undefined) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        status: 'skipped',
        actualValue: 0,
        expectedValue: rule.threshold,
        message: `Metric ${rule.metric} not found`,
      };
    }

    let passed = false;
    switch (rule.operator) {
      case 'gt':
        passed = actualValue > rule.threshold;
        break;
      case 'gte':
        passed = actualValue >= rule.threshold;
        break;
      case 'lt':
        passed = actualValue < rule.threshold;
        break;
      case 'lte':
        passed = actualValue <= rule.threshold;
        break;
      case 'eq':
        passed = actualValue === rule.threshold;
        break;
      case 'neq':
        passed = actualValue !== rule.threshold;
        break;
      case 'between':
        passed = actualValue >= rule.threshold && actualValue <= (rule.thresholdMax || rule.threshold);
        break;
    }

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      status: passed ? 'passed' : 'failed',
      actualValue,
      expectedValue: rule.threshold,
      message: passed ? undefined : `${rule.metric}: ${actualValue} ${rule.operator} ${rule.threshold} = false`,
    };
  }

  // ==================== Deployments ====================

  /**
   * Create a deployment
   */
  async createDeployment(
    tenantId: string,
    target: DeploymentTarget,
    version: string,
    commitSha: string,
    branch: string,
    createdBy: string
  ): Promise<Deployment> {
    const deploymentId = uuidv4();

    const deployment: Deployment = {
      id: deploymentId,
      tenantId,
      target,
      version,
      commitSha,
      branch,
      status: 'pending',
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO deployments (
        id, tenant_id, target, version, commit_sha, branch, status,
        policy_evaluation_id, metrics, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        deploymentId, tenantId, target, version, commitSha, branch, 'pending',
        null, null, createdBy, deployment.createdAt, deployment.updatedAt,
      ]
    );

    console.log(`🚀 Created deployment: ${deploymentId} to ${target}`);
    return deployment;
  }

  /**
   * Update deployment status
   */
  async updateDeploymentStatus(
    deploymentId: string,
    status: Deployment['status'],
    policyEvaluationId?: string
  ): Promise<void> {
    await this.dbManager.query(
      `UPDATE deployments SET status = $2, policy_evaluation_id = $3, updated_at = NOW()
       WHERE id = $1`,
      [deploymentId, status, policyEvaluationId || null]
    );
  }

  /**
   * Get deployment by ID
   */
  async getDeployment(deploymentId: string): Promise<Deployment | null> {
    const query = 'SELECT * FROM deployments WHERE id = $1';
    const result = await this.dbManager.query(query, [deploymentId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformDeploymentRow(result.rows[0]);
  }

  /**
   * Get tenant deployments
   */
  async getTenantDeployments(
    tenantId: string,
    target?: DeploymentTarget,
    limit: number = 20
  ): Promise<Deployment[]> {
    let query = 'SELECT * FROM deployments WHERE tenant_id = $1';
    const values: any[] = [tenantId];

    if (target) {
      values.push(target);
      query += ` AND target = $${values.length}`;
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (values.length + 1);
    values.push(limit);

    const result = await this.dbManager.query(query, values);
    return result.rows.map(row => this.transformDeploymentRow(row));
  }

  // ==================== Rollback ====================

  /**
   * Initiate rollback
   */
  async initiateRollback(request: RollbackRequest): Promise<Deployment> {
    const currentDeployment = await this.getDeployment(request.deploymentId);
    if (!currentDeployment) {
      throw new Error(`Deployment not found: ${request.deploymentId}`);
    }

    console.log(`🔄 Initiating rollback for deployment ${request.deploymentId}`);

    // Update current deployment status
    await this.updateDeploymentStatus(request.deploymentId, 'rolling_back');

    // Create new deployment for rollback
    const rollbackDeployment = await this.createDeployment(
      currentDeployment.tenantId,
      currentDeployment.target,
      request.targetVersion,
      request.targetVersion, // Use version as commit SHA for rollback
      currentDeployment.branch,
      request.requestedBy
    );

    // Mark as deployed (simulating immediate rollback)
    await this.updateDeploymentStatus(rollbackDeployment.id, 'deployed');
    await this.updateDeploymentStatus(request.deploymentId, 'rolled_back');

    console.log(`✅ Rollback completed to version ${request.targetVersion}`);
    return rollbackDeployment;
  }

  // ==================== Release Gates ====================

  /**
   * Create a release gate
   */
  async createReleaseGate(
    tenantId: string,
    pipelineId: string,
    stage: DeploymentTarget,
    approvers: string[],
    expiresInMinutes?: number
  ): Promise<ReleaseGate> {
    const gateId = uuidv4();
    
    const gate: ReleaseGate = {
      id: gateId,
      tenantId,
      pipelineId,
      stage,
      status: 'open',
      approvalRequired: true,
      approvers,
      expiresAt: expiresInMinutes 
        ? new Date(Date.now() + expiresInMinutes * 60 * 1000) 
        : undefined,
      createdAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO release_gates (
        id, tenant_id, pipeline_id, stage, status, approval_required,
        approvers, expires_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        gateId, tenantId, pipelineId, stage, 'open', true,
        JSON.stringify(approvers), gate.expiresAt || null, gate.createdAt,
      ]
    );

    console.log(`🚧 Created release gate: ${gateId} for stage ${stage}`);
    return gate;
  }

  /**
   * Approve release gate
   */
  async approveReleaseGate(gateId: string, approvedBy: string): Promise<ReleaseGate> {
    const gate = await this.getReleaseGate(gateId);
    if (!gate) {
      throw new Error(`Release gate not found: ${gateId}`);
    }

    if (gate.status !== 'open') {
      throw new Error(`Gate cannot be approved in status: ${gate.status}`);
    }

    if (!gate.approvers.includes(approvedBy)) {
      throw new Error(`User ${approvedBy} is not an authorized approver`);
    }

    await this.dbManager.query(
      `UPDATE release_gates SET status = 'approved', approved_by = $2, resolved_at = NOW()
       WHERE id = $1`,
      [gateId, approvedBy]
    );

    gate.status = 'approved';
    gate.approvedBy = approvedBy;
    gate.resolvedAt = new Date();

    console.log(`✅ Release gate ${gateId} approved by ${approvedBy}`);
    return gate;
  }

  /**
   * Reject release gate
   */
  async rejectReleaseGate(gateId: string, rejectedBy: string): Promise<ReleaseGate> {
    const gate = await this.getReleaseGate(gateId);
    if (!gate) {
      throw new Error(`Release gate not found: ${gateId}`);
    }

    await this.dbManager.query(
      `UPDATE release_gates SET status = 'rejected', rejected_by = $2, resolved_at = NOW()
       WHERE id = $1`,
      [gateId, rejectedBy]
    );

    gate.status = 'rejected';
    gate.rejectedBy = rejectedBy;
    gate.resolvedAt = new Date();

    console.log(`❌ Release gate ${gateId} rejected by ${rejectedBy}`);
    return gate;
  }

  /**
   * Get release gate
   */
  async getReleaseGate(gateId: string): Promise<ReleaseGate | null> {
    const query = 'SELECT * FROM release_gates WHERE id = $1';
    const result = await this.dbManager.query(query, [gateId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformGateRow(result.rows[0]);
  }

  // ==================== Notifications ====================

  /**
   * Send notifications for policy violations
   */
  private async sendNotifications(
    policy: ReleasePolicy,
    evaluation: PolicyEvaluation
  ): Promise<void> {
    const failedRules = evaluation.ruleResults.filter(r => r.status === 'failed');
    
    const message = {
      policyName: policy.name,
      status: evaluation.status,
      pipelineId: evaluation.pipelineId,
      commitSha: evaluation.commitSha,
      branch: evaluation.branch,
      failedRules: failedRules.map(r => ({
        name: r.ruleName,
        actual: r.actualValue,
        expected: r.expectedValue,
        message: r.message,
      })),
      triggeredRollback: evaluation.triggeredRollback,
    };

    // Send to webhook URLs
    for (const webhookUrl of policy.webhookUrls) {
      try {
        await axios.post(webhookUrl, message, { timeout: 5000 });
      } catch (error) {
        console.error(`Failed to send webhook to ${webhookUrl}:`, error);
      }
    }

    // Additional notification channels would be implemented here
    // (Slack, email, etc. via integration service)
    console.log(`📧 Sent notifications for policy violation`);
  }

  // ==================== Transform Methods ====================

  private transformPolicyRow(row: any): ReleasePolicy {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description,
      rules: typeof row.rules === 'string' ? JSON.parse(row.rules) : row.rules,
      rollbackOnFailure: row.rollback_on_failure,
      notifyOnViolation: row.notify_on_violation,
      notificationChannels: typeof row.notification_channels === 'string' 
        ? JSON.parse(row.notification_channels) : row.notification_channels,
      webhookUrls: typeof row.webhook_urls === 'string' 
        ? JSON.parse(row.webhook_urls) : row.webhook_urls,
      enabled: row.enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private transformDeploymentRow(row: any): Deployment {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      target: row.target,
      version: row.version,
      commitSha: row.commit_sha,
      branch: row.branch,
      status: row.status,
      policyEvaluationId: row.policy_evaluation_id,
      metrics: row.metrics ? (typeof row.metrics === 'string' ? JSON.parse(row.metrics) : row.metrics) : undefined,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private transformGateRow(row: any): ReleaseGate {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      pipelineId: row.pipeline_id,
      stage: row.stage,
      status: row.status,
      approvalRequired: row.approval_required,
      approvers: typeof row.approvers === 'string' ? JSON.parse(row.approvers) : row.approvers,
      approvedBy: row.approved_by,
      rejectedBy: row.rejected_by,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
    };
  }
}
