import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import axios from 'axios';
import { DatabaseManager } from '@shifty/database';
import {
  ErrorEvent,
  ErrorCluster,
  ErrorSeverity,
  ErrorSource,
  RegressionTest,
  RegressionTestRequest,
  FeedbackLoopRule,
  FeedbackLoopExecution,
  ProductionIncident,
  ImpactAnalysis,
} from '@shifty/shared';

export class ProductionFeedbackService {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  // ==================== Error Ingestion ====================

  /**
   * Ingest an error event from monitoring systems
   */
  async ingestError(
    tenantId: string,
    source: ErrorSource,
    errorData: Omit<ErrorEvent, 'id' | 'tenantId' | 'source' | 'createdAt'>
  ): Promise<ErrorEvent> {
    const eventId = uuidv4();

    const errorEvent: ErrorEvent = {
      id: eventId,
      tenantId,
      source,
      ...errorData,
      createdAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO error_events (
        id, tenant_id, source, external_id, error_type, message, stack_trace,
        severity, environment, service, endpoint, user_id, metadata,
        first_seen, last_seen, occurrence_count, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        eventId, tenantId, source, errorData.externalId, errorData.errorType,
        errorData.message, errorData.stackTrace || null, errorData.severity,
        errorData.environment, errorData.service, errorData.endpoint || null,
        errorData.userId || null, JSON.stringify(errorData.metadata),
        errorData.firstSeen, errorData.lastSeen, errorData.occurrenceCount,
        errorEvent.createdAt,
      ]
    );

    console.log(`📥 Ingested error event: ${eventId} from ${source}`);

    // Cluster the error
    await this.clusterError(errorEvent);

    return errorEvent;
  }

  /**
   * Cluster similar errors together
   */
  private async clusterError(event: ErrorEvent): Promise<void> {
    // Generate fingerprint for error clustering
    const fingerprint = this.generateErrorFingerprint(event);

    // Check if cluster exists
    const existingCluster = await this.getClusterByFingerprint(event.tenantId, fingerprint);

    if (existingCluster) {
      // Update existing cluster
      await this.dbManager.query(
        `UPDATE error_clusters SET 
          error_count = error_count + $2,
          last_occurrence = $3,
          updated_at = NOW()
         WHERE id = $1`,
        [existingCluster.id, event.occurrenceCount, event.lastSeen]
      );

      // Check if we need to trigger feedback loop
      await this.checkFeedbackLoopTriggers(event.tenantId, existingCluster);
    } else {
      // Create new cluster
      const clusterId = uuidv4();
      
      await this.dbManager.query(
        `INSERT INTO error_clusters (
          id, tenant_id, name, fingerprint, error_type, primary_message,
          severity, status, affected_services, affected_endpoints, error_count,
          first_occurrence, last_occurrence, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          clusterId, event.tenantId, `${event.errorType}: ${event.message.slice(0, 50)}`,
          fingerprint, event.errorType, event.message, event.severity, 'new',
          JSON.stringify([event.service]), JSON.stringify(event.endpoint ? [event.endpoint] : []),
          event.occurrenceCount, event.firstSeen, event.lastSeen, new Date(), new Date(),
        ]
      );

      console.log(`📊 Created new error cluster: ${clusterId}`);
    }
  }

  /**
   * Generate fingerprint for error clustering
   */
  private generateErrorFingerprint(event: ErrorEvent): string {
    // Create fingerprint based on error type, message pattern, and service
    const components = [
      event.errorType,
      event.service,
      this.normalizeErrorMessage(event.message),
    ];
    
    return crypto.createHash('sha256')
      .update(components.join(':'))
      .digest('hex')
      .slice(0, 32);
  }

  /**
   * Normalize error message for better clustering
   */
  private normalizeErrorMessage(message: string): string {
    // Remove variable parts like IDs, timestamps, etc.
    return message
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID')
      .replace(/\d{13,}/g, 'TIMESTAMP')
      .replace(/\d+/g, 'N')
      .slice(0, 200);
  }

  /**
   * Get cluster by fingerprint
   */
  private async getClusterByFingerprint(
    tenantId: string,
    fingerprint: string
  ): Promise<ErrorCluster | null> {
    const query = 'SELECT * FROM error_clusters WHERE tenant_id = $1 AND fingerprint = $2';
    const result = await this.dbManager.query(query, [tenantId, fingerprint]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformClusterRow(result.rows[0]);
  }

  // ==================== Error Clusters ====================

  /**
   * Get error cluster by ID
   */
  async getCluster(clusterId: string): Promise<ErrorCluster | null> {
    const query = 'SELECT * FROM error_clusters WHERE id = $1';
    const result = await this.dbManager.query(query, [clusterId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformClusterRow(result.rows[0]);
  }

  /**
   * Get tenant error clusters
   */
  async getTenantClusters(
    tenantId: string,
    status?: string,
    severity?: ErrorSeverity,
    limit: number = 50
  ): Promise<ErrorCluster[]> {
    let query = 'SELECT * FROM error_clusters WHERE tenant_id = $1';
    const values: any[] = [tenantId];

    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }

    if (severity) {
      values.push(severity);
      query += ` AND severity = $${values.length}`;
    }

    query += ' ORDER BY last_occurrence DESC LIMIT $' + (values.length + 1);
    values.push(limit);

    const result = await this.dbManager.query(query, values);
    return result.rows.map(row => this.transformClusterRow(row));
  }

  /**
   * Update cluster status
   */
  async updateClusterStatus(clusterId: string, status: ErrorCluster['status']): Promise<void> {
    await this.dbManager.query(
      `UPDATE error_clusters SET status = $2, updated_at = NOW()
       ${status === 'resolved' ? ', resolved_at = NOW()' : ''} WHERE id = $1`,
      [clusterId, status]
    );
  }

  // ==================== Regression Test Generation ====================

  /**
   * Generate regression test for error cluster
   */
  async generateRegressionTest(request: RegressionTestRequest): Promise<RegressionTest> {
    const testId = uuidv4();
    const cluster = await this.getCluster(request.errorClusterId);
    
    if (!cluster) {
      throw new Error(`Error cluster not found: ${request.errorClusterId}`);
    }

    console.log(`🧪 Generating regression test for cluster: ${cluster.name}`);

    // Generate test code using AI (calls test-generator service)
    const testCode = await this.generateTestCode(cluster, request);

    const test: RegressionTest = {
      id: testId,
      tenantId: request.tenantId,
      errorClusterId: request.errorClusterId,
      name: `Regression: ${cluster.errorType}`,
      description: `Auto-generated test to catch: ${cluster.primaryMessage}`,
      framework: request.framework,
      testCode,
      scenarios: this.extractScenarios(cluster, testCode),
      status: 'draft',
      deployedToPipeline: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO regression_tests (
        id, tenant_id, error_cluster_id, name, description, framework,
        test_code, scenarios, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        testId, request.tenantId, request.errorClusterId, test.name,
        test.description, request.framework, testCode, JSON.stringify(test.scenarios),
        'draft', test.createdAt, test.updatedAt,
      ]
    );

    // Update cluster with regression test ID
    await this.dbManager.query(
      'UPDATE error_clusters SET regression_test_id = $2, updated_at = NOW() WHERE id = $1',
      [request.errorClusterId, testId]
    );

    console.log(`✅ Generated regression test: ${testId}`);
    return test;
  }

  /**
   * Generate test code using AI
   */
  private async generateTestCode(
    cluster: ErrorCluster,
    request: RegressionTestRequest
  ): Promise<string> {
    try {
      // Call the tenant's AI model via test-generator service
      const response = await axios.post(
        `${process.env.TEST_GENERATOR_URL}/api/v1/generate`,
        {
          tenantId: request.tenantId,
          context: {
            errorType: cluster.errorType,
            errorMessage: cluster.primaryMessage,
            affectedServices: cluster.affectedServices,
            affectedEndpoints: cluster.affectedEndpoints,
          },
          framework: request.framework,
          type: 'regression',
        },
        { timeout: 60000 }
      );

      return response.data.testCode || this.getDefaultTestTemplate(cluster, request);
    } catch (error) {
      console.error('Failed to generate test code via AI:', error);
      return this.getDefaultTestTemplate(cluster, request);
    }
  }

  /**
   * Get default test template
   */
  private getDefaultTestTemplate(cluster: ErrorCluster, request: RegressionTestRequest): string {
    const templates: Record<string, string> = {
      playwright: `
import { test, expect } from '@playwright/test';

test.describe('Regression: ${cluster.errorType}', () => {
  test('should not reproduce error: ${cluster.primaryMessage.slice(0, 50)}', async ({ page }) => {
    // Navigate to affected endpoint
    ${cluster.affectedEndpoints[0] ? `await page.goto('${cluster.affectedEndpoints[0]}');` : '// TODO: Add navigation'}
    
    // Perform actions that triggered the error
    // TODO: Add test steps based on error context
    
    // Verify error does not occur
    await expect(page.locator('body')).not.toContainText('${cluster.errorType}');
    
    // Check for successful page load
    await expect(page).toHaveTitle(/.*/);
  });
});
`,
      jest: `
describe('Regression: ${cluster.errorType}', () => {
  it('should not reproduce error: ${cluster.primaryMessage.slice(0, 50)}', async () => {
    // Setup
    const service = '${cluster.affectedServices[0] || 'service'}';
    
    // Execute action that triggered error
    // TODO: Add test implementation
    
    // Verify no error
    expect(() => {
      // Add assertion
    }).not.toThrow();
  });
});
`,
      cypress: `
describe('Regression: ${cluster.errorType}', () => {
  it('should not reproduce error: ${cluster.primaryMessage.slice(0, 50)}', () => {
    // Visit affected endpoint
    ${cluster.affectedEndpoints[0] ? `cy.visit('${cluster.affectedEndpoints[0]}');` : '// cy.visit(...)'}
    
    // Perform actions that triggered the error
    // TODO: Add test steps
    
    // Verify error does not occur
    cy.get('body').should('not.contain', '${cluster.errorType}');
  });
});
`,
    };

    return templates[request.framework] || templates.jest;
  }

  /**
   * Extract test scenarios from generated code
   */
  private extractScenarios(
    cluster: ErrorCluster,
    testCode: string
  ): RegressionTest['scenarios'] {
    return [{
      name: `Prevent ${cluster.errorType}`,
      steps: [
        'Navigate to affected endpoint',
        'Perform triggering action',
        'Verify error does not occur',
      ],
      assertions: [
        `No ${cluster.errorType} should be thrown`,
        'Page should load successfully',
      ],
    }];
  }

  /**
   * Get regression test by ID
   */
  async getRegressionTest(testId: string): Promise<RegressionTest | null> {
    const query = 'SELECT * FROM regression_tests WHERE id = $1';
    const result = await this.dbManager.query(query, [testId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformTestRow(result.rows[0]);
  }

  /**
   * Approve and deploy regression test
   */
  async approveRegressionTest(testId: string, approvedBy: string): Promise<void> {
    await this.dbManager.query(
      `UPDATE regression_tests SET status = 'approved', approved_by = $2, updated_at = NOW()
       WHERE id = $1`,
      [testId, approvedBy]
    );

    console.log(`✅ Regression test ${testId} approved`);
  }

  // ==================== Feedback Loop Rules ====================

  /**
   * Create feedback loop rule
   */
  async createFeedbackLoopRule(
    tenantId: string,
    rule: Omit<FeedbackLoopRule, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ): Promise<FeedbackLoopRule> {
    const ruleId = uuidv4();

    const fullRule: FeedbackLoopRule = {
      id: ruleId,
      tenantId,
      ...rule,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO feedback_loop_rules (
        id, tenant_id, name, description, trigger, actions, action_config,
        enabled, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        ruleId, tenantId, rule.name, rule.description || null,
        JSON.stringify(rule.trigger), JSON.stringify(rule.actions),
        JSON.stringify(rule.actionConfig), rule.enabled,
        fullRule.createdAt, fullRule.updatedAt,
      ]
    );

    console.log(`📋 Created feedback loop rule: ${ruleId}`);
    return fullRule;
  }

  /**
   * Check and trigger feedback loop rules
   */
  private async checkFeedbackLoopTriggers(
    tenantId: string,
    cluster: ErrorCluster
  ): Promise<void> {
    // Get active rules for tenant
    const query = 'SELECT * FROM feedback_loop_rules WHERE tenant_id = $1 AND enabled = true';
    const result = await this.dbManager.query(query, [tenantId]);

    for (const row of result.rows) {
      const rule = this.transformRuleRow(row);
      
      if (this.shouldTriggerRule(rule, cluster)) {
        await this.executeFeedbackLoop(rule, cluster);
      }
    }
  }

  /**
   * Check if rule should be triggered
   */
  private shouldTriggerRule(rule: FeedbackLoopRule, cluster: ErrorCluster): boolean {
    const trigger = rule.trigger;

    // Check severity
    if (trigger.errorSeverity && !trigger.errorSeverity.includes(cluster.severity)) {
      return false;
    }

    // Check error count threshold
    if (trigger.errorCountThreshold && cluster.errorCount < trigger.errorCountThreshold) {
      return false;
    }

    // Check services
    if (trigger.services && !trigger.services.some(s => cluster.affectedServices.includes(s))) {
      return false;
    }

    return true;
  }

  /**
   * Execute feedback loop actions
   */
  private async executeFeedbackLoop(
    rule: FeedbackLoopRule,
    cluster: ErrorCluster
  ): Promise<void> {
    const executionId = uuidv4();
    
    console.log(`🔄 Executing feedback loop: ${rule.name} for cluster ${cluster.id}`);

    const execution: FeedbackLoopExecution = {
      id: executionId,
      tenantId: rule.tenantId,
      ruleId: rule.id,
      errorClusterId: cluster.id,
      triggeredActions: rule.actions.map(action => ({
        action,
        status: 'pending',
      })),
      status: 'running',
      createdAt: new Date(),
    };

    // Save execution record
    await this.dbManager.query(
      `INSERT INTO feedback_loop_executions (
        id, tenant_id, rule_id, error_cluster_id, triggered_actions, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        executionId, rule.tenantId, rule.id, cluster.id,
        JSON.stringify(execution.triggeredActions), 'running', execution.createdAt,
      ]
    );

    // Execute each action
    for (let i = 0; i < rule.actions.length; i++) {
      const action = rule.actions[i];
      execution.triggeredActions[i].startedAt = new Date();
      execution.triggeredActions[i].status = 'in_progress';

      try {
        const result = await this.executeAction(action, rule, cluster);
        execution.triggeredActions[i].status = 'completed';
        execution.triggeredActions[i].result = result;
        execution.triggeredActions[i].completedAt = new Date();
      } catch (error: any) {
        execution.triggeredActions[i].status = 'failed';
        execution.triggeredActions[i].error = error.message;
        execution.triggeredActions[i].completedAt = new Date();
      }
    }

    // Determine overall status
    const hasFailures = execution.triggeredActions.some(a => a.status === 'failed');
    const allCompleted = execution.triggeredActions.every(a => a.status === 'completed');
    execution.status = allCompleted ? 'completed' : hasFailures ? 'partial' : 'failed';
    execution.completedAt = new Date();

    // Update execution record
    await this.dbManager.query(
      `UPDATE feedback_loop_executions SET 
        triggered_actions = $2, status = $3, completed_at = $4
       WHERE id = $1`,
      [executionId, JSON.stringify(execution.triggeredActions), execution.status, execution.completedAt]
    );

    console.log(`✅ Feedback loop execution ${execution.status}: ${executionId}`);
  }

  /**
   * Execute a single feedback loop action
   */
  private async executeAction(
    action: string,
    rule: FeedbackLoopRule,
    cluster: ErrorCluster
  ): Promise<Record<string, unknown>> {
    switch (action) {
      case 'generate_regression_test':
        const test = await this.generateRegressionTest({
          tenantId: rule.tenantId,
          errorClusterId: cluster.id,
          framework: (rule.actionConfig.testFramework as any) || 'playwright',
          priority: 'high',
          targetEndpoints: cluster.affectedEndpoints,
          includeStackTrace: true,
          generateMultipleScenarios: true,
        });
        return { testId: test.id };

      case 'create_jira_ticket':
        // Call integrations service
        const ticketResult = await axios.post(
          `${process.env.INTEGRATIONS_URL}/api/v1/jira/tickets`,
          {
            tenantId: rule.tenantId,
            summary: `[Auto] ${cluster.errorType}: ${cluster.primaryMessage.slice(0, 100)}`,
            description: `
Error Cluster: ${cluster.id}
Severity: ${cluster.severity}
Error Count: ${cluster.errorCount}
Affected Services: ${cluster.affectedServices.join(', ')}
First Seen: ${cluster.firstOccurrence}
Last Seen: ${cluster.lastOccurrence}
            `,
            priority: cluster.severity === 'critical' ? 'Highest' : 'High',
            labels: ['auto-generated', 'regression'],
          },
          { timeout: 30000 }
        );
        return { ticketId: ticketResult.data.ticketId };

      case 'notify_team':
        // Send notification via integrations service
        await axios.post(
          `${process.env.INTEGRATIONS_URL}/api/v1/notifications`,
          {
            tenantId: rule.tenantId,
            type: 'error_alert',
            data: {
              clusterId: cluster.id,
              errorType: cluster.errorType,
              severity: cluster.severity,
              count: cluster.errorCount,
            },
          },
          { timeout: 10000 }
        );
        return { notified: true };

      default:
        console.log(`Unknown action: ${action}`);
        return { skipped: true };
    }
  }

  // ==================== Impact Analysis ====================

  /**
   * Analyze impact of error cluster
   */
  async analyzeImpact(clusterId: string): Promise<ImpactAnalysis> {
    const cluster = await this.getCluster(clusterId);
    if (!cluster) {
      throw new Error(`Cluster not found: ${clusterId}`);
    }

    const analysisId = uuidv4();

    // Calculate impact score (0-100)
    let impactScore = 0;
    
    // Severity weight
    const severityWeights: Record<ErrorSeverity, number> = {
      critical: 40, high: 30, medium: 20, low: 10, info: 5,
    };
    impactScore += severityWeights[cluster.severity];

    // Error frequency weight (capped at 30)
    impactScore += Math.min(30, cluster.errorCount / 10);

    // Service breadth weight
    impactScore += Math.min(20, cluster.affectedServices.length * 5);

    // Duration weight (if ongoing)
    const durationHours = (Date.now() - cluster.firstOccurrence.getTime()) / (1000 * 60 * 60);
    impactScore += Math.min(10, durationHours);

    impactScore = Math.min(100, Math.round(impactScore));

    // Determine business impact
    let businessImpact: ImpactAnalysis['businessImpact'];
    if (impactScore >= 80) businessImpact = 'critical';
    else if (impactScore >= 60) businessImpact = 'high';
    else if (impactScore >= 40) businessImpact = 'medium';
    else if (impactScore >= 20) businessImpact = 'low';
    else businessImpact = 'minimal';

    const analysis: ImpactAnalysis = {
      id: analysisId,
      tenantId: cluster.tenantId,
      errorClusterId: clusterId,
      impactScore,
      businessImpact,
      estimatedUsersAffected: cluster.impactedUsers || Math.round(cluster.errorCount * 0.7),
      affectedFeatures: cluster.affectedServices,
      recommendations: this.generateRecommendations(cluster, impactScore),
      createdAt: new Date(),
    };

    // Save analysis
    await this.dbManager.query(
      `INSERT INTO impact_analyses (
        id, tenant_id, error_cluster_id, impact_score, business_impact,
        estimated_users_affected, affected_features, recommendations, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        analysisId, cluster.tenantId, clusterId, impactScore, businessImpact,
        analysis.estimatedUsersAffected, JSON.stringify(analysis.affectedFeatures),
        JSON.stringify(analysis.recommendations), analysis.createdAt,
      ]
    );

    return analysis;
  }

  /**
   * Generate recommendations based on error analysis
   */
  private generateRecommendations(
    cluster: ErrorCluster,
    impactScore: number
  ): ImpactAnalysis['recommendations'] {
    const recommendations: ImpactAnalysis['recommendations'] = [];

    if (impactScore >= 70) {
      recommendations.push({
        priority: 1,
        action: 'Immediate investigation required',
        reasoning: 'High impact score indicates significant user/business impact',
      });
    }

    if (cluster.errorCount > 100) {
      recommendations.push({
        priority: 2,
        action: 'Generate regression tests',
        reasoning: 'High occurrence count suggests reproducible issue',
      });
    }

    if (cluster.affectedServices.length > 2) {
      recommendations.push({
        priority: 3,
        action: 'Review service dependencies',
        reasoning: 'Multiple services affected may indicate cascading failure',
      });
    }

    if (!cluster.regressionTestId) {
      recommendations.push({
        priority: 4,
        action: 'Create automated test coverage',
        reasoning: 'No regression test exists to prevent recurrence',
      });
    }

    return recommendations;
  }

  // ==================== Transform Methods ====================

  private transformClusterRow(row: any): ErrorCluster {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description,
      fingerprint: row.fingerprint,
      errorType: row.error_type,
      primaryMessage: row.primary_message,
      severity: row.severity,
      status: row.status,
      affectedServices: typeof row.affected_services === 'string' 
        ? JSON.parse(row.affected_services) : row.affected_services,
      affectedEndpoints: typeof row.affected_endpoints === 'string'
        ? JSON.parse(row.affected_endpoints) : row.affected_endpoints,
      errorCount: row.error_count,
      impactedUsers: row.impacted_users,
      firstOccurrence: row.first_occurrence,
      lastOccurrence: row.last_occurrence,
      resolvedAt: row.resolved_at,
      assignedTo: row.assigned_to,
      regressionTestId: row.regression_test_id,
      jiraTicketId: row.jira_ticket_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private transformTestRow(row: any): RegressionTest {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      errorClusterId: row.error_cluster_id,
      name: row.name,
      description: row.description,
      framework: row.framework,
      testCode: row.test_code,
      scenarios: typeof row.scenarios === 'string' ? JSON.parse(row.scenarios) : row.scenarios,
      status: row.status,
      validationResult: row.validation_result 
        ? (typeof row.validation_result === 'string' ? JSON.parse(row.validation_result) : row.validation_result)
        : undefined,
      approvedBy: row.approved_by,
      deployedToPipeline: row.deployed_to_pipeline,
      pipelineId: row.pipeline_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private transformRuleRow(row: any): FeedbackLoopRule {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description,
      trigger: typeof row.trigger === 'string' ? JSON.parse(row.trigger) : row.trigger,
      actions: typeof row.actions === 'string' ? JSON.parse(row.actions) : row.actions,
      actionConfig: typeof row.action_config === 'string' ? JSON.parse(row.action_config) : row.action_config,
      enabled: row.enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
