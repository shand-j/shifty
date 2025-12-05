import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { DatabaseManager } from '@shifty/database';
import {
  IntegrationType,
  IntegrationStatus,
  BaseIntegrationConfig,
  GitIntegrationConfig,
  CICDIntegrationConfig,
  MonitoringIntegrationConfig,
  JiraIntegrationConfig,
  SlackIntegrationConfig,
  IntegrationEvent,
  WebhookDelivery,
} from '@shifty/shared';

export class IntegrationsService {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  // ==================== Integration Management ====================

  /**
   * Create a new integration
   */
  async createIntegration(
    tenantId: string,
    type: IntegrationType,
    name: string,
    config: Record<string, unknown>
  ): Promise<BaseIntegrationConfig> {
    const integrationId = uuidv4();

    // Validate credentials
    const isValid = await this.validateCredentials(type, config);
    const status: IntegrationStatus = isValid ? 'connected' : 'pending_setup';

    const integration: BaseIntegrationConfig = {
      id: integrationId,
      tenantId,
      type,
      name,
      status,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO integrations (
        id, tenant_id, type, name, status, enabled, config,
        webhook_url, webhook_secret, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        integrationId, tenantId, type, name, status, true,
        JSON.stringify(config), null, null, integration.createdAt, integration.updatedAt,
      ]
    );

    console.log(`🔌 Created integration: ${type} (${integrationId})`);
    return integration;
  }

  /**
   * Get integration by ID
   */
  async getIntegration(integrationId: string): Promise<BaseIntegrationConfig | null> {
    const query = 'SELECT * FROM integrations WHERE id = $1';
    const result = await this.dbManager.query(query, [integrationId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformIntegrationRow(result.rows[0]);
  }

  /**
   * Get tenant integrations
   */
  async getTenantIntegrations(
    tenantId: string,
    type?: IntegrationType
  ): Promise<BaseIntegrationConfig[]> {
    let query = 'SELECT * FROM integrations WHERE tenant_id = $1';
    const values: any[] = [tenantId];

    if (type) {
      values.push(type);
      query += ` AND type = $${values.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.dbManager.query(query, values);
    return result.rows.map(row => this.transformIntegrationRow(row));
  }

  /**
   * Update integration status
   */
  async updateIntegrationStatus(
    integrationId: string,
    status: IntegrationStatus,
    error?: string
  ): Promise<void> {
    await this.dbManager.query(
      `UPDATE integrations SET status = $2, last_error = $3, updated_at = NOW() WHERE id = $1`,
      [integrationId, status, error || null]
    );
  }

  /**
   * Delete integration
   */
  async deleteIntegration(integrationId: string): Promise<void> {
    await this.dbManager.query('DELETE FROM integrations WHERE id = $1', [integrationId]);
    console.log(`🗑️ Deleted integration: ${integrationId}`);
  }

  /**
   * Validate credentials
   */
  private async validateCredentials(
    type: IntegrationType,
    config: Record<string, unknown>
  ): Promise<boolean> {
    try {
      switch (type) {
        case 'github':
          return await this.validateGitHubCredentials(config);
        case 'gitlab':
          return await this.validateGitLabCredentials(config);
        case 'jira':
          return await this.validateJiraCredentials(config);
        case 'slack':
          return await this.validateSlackCredentials(config);
        case 'sentry':
          return await this.validateSentryCredentials(config);
        case 'datadog':
          return await this.validateDatadogCredentials(config);
        default:
          return true;
      }
    } catch (error) {
      console.error(`Failed to validate ${type} credentials:`, error);
      return false;
    }
  }

  // ==================== GitHub Integration ====================

  private async validateGitHubCredentials(config: Record<string, unknown>): Promise<boolean> {
    const accessToken = config.accessToken as string;
    const baseUrl = (config.baseUrl as string) || 'https://api.github.com';

    const response = await axios.get(`${baseUrl}/user`, {
      headers: { Authorization: `token ${accessToken}` },
      timeout: 10000,
    });

    return response.status === 200;
  }

  /**
   * Get GitHub repositories
   */
  async getGitHubRepositories(integrationId: string): Promise<any[]> {
    const integration = await this.getIntegrationWithConfig(integrationId);
    if (!integration || integration.type !== 'github') {
      throw new Error('Invalid GitHub integration');
    }

    const config = integration.config as GitIntegrationConfig['config'];
    const baseUrl = config.baseUrl || 'https://api.github.com';

    const response = await axios.get(`${baseUrl}/user/repos`, {
      headers: { Authorization: `token ${config.accessToken}` },
      params: { per_page: 100 },
    });

    return response.data;
  }

  /**
   * Create GitHub webhook
   */
  async createGitHubWebhook(
    integrationId: string,
    repoOwner: string,
    repoName: string,
    events: string[]
  ): Promise<string> {
    const integration = await this.getIntegrationWithConfig(integrationId);
    if (!integration || integration.type !== 'github') {
      throw new Error('Invalid GitHub integration');
    }

    const config = integration.config as GitIntegrationConfig['config'];
    const baseUrl = config.baseUrl || 'https://api.github.com';
    const webhookSecret = uuidv4();
    const webhookUrl = `${process.env.WEBHOOK_BASE_URL}/api/v1/webhooks/github/${integrationId}`;

    const response = await axios.post(
      `${baseUrl}/repos/${repoOwner}/${repoName}/hooks`,
      {
        name: 'web',
        active: true,
        events,
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: webhookSecret,
        },
      },
      { headers: { Authorization: `token ${config.accessToken}` } }
    );

    // Save webhook secret
    await this.dbManager.query(
      `UPDATE integrations SET webhook_url = $2, webhook_secret = $3, updated_at = NOW() WHERE id = $1`,
      [integrationId, webhookUrl, webhookSecret]
    );

    return response.data.id;
  }

  // ==================== GitLab Integration ====================

  private async validateGitLabCredentials(config: Record<string, unknown>): Promise<boolean> {
    const accessToken = config.accessToken as string;
    const baseUrl = (config.baseUrl as string) || 'https://gitlab.com/api/v4';

    const response = await axios.get(`${baseUrl}/user`, {
      headers: { 'PRIVATE-TOKEN': accessToken },
      timeout: 10000,
    });

    return response.status === 200;
  }

  // ==================== Jira Integration ====================

  private async validateJiraCredentials(config: Record<string, unknown>): Promise<boolean> {
    const baseUrl = config.baseUrl as string;
    const email = config.email as string;
    const apiToken = config.apiToken as string;

    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');

    const response = await axios.get(`${baseUrl}/rest/api/3/myself`, {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 10000,
    });

    return response.status === 200;
  }

  /**
   * Create Jira ticket
   */
  async createJiraTicket(
    integrationId: string,
    summary: string,
    description: string,
    issueType?: string,
    priority?: string,
    labels?: string[]
  ): Promise<{ ticketId: string; ticketUrl: string }> {
    const integration = await this.getIntegrationWithConfig(integrationId);
    if (!integration || integration.type !== 'jira') {
      throw new Error('Invalid Jira integration');
    }

    const config = integration.config as JiraIntegrationConfig['config'];
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

    const response = await axios.post(
      `${config.baseUrl}/rest/api/3/issue`,
      {
        fields: {
          project: { key: config.projectKey },
          summary,
          description: {
            type: 'doc',
            version: 1,
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: description }],
            }],
          },
          issuetype: { name: issueType || config.defaultIssueType },
          priority: { name: priority || config.defaultPriority },
          labels: labels || [],
        },
      },
      { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' } }
    );

    const ticketId = response.data.key;
    const ticketUrl = `${config.baseUrl}/browse/${ticketId}`;

    console.log(`📝 Created Jira ticket: ${ticketId}`);
    return { ticketId, ticketUrl };
  }

  // ==================== Slack Integration ====================

  private async validateSlackCredentials(config: Record<string, unknown>): Promise<boolean> {
    const botToken = config.botToken as string;

    const response = await axios.get('https://slack.com/api/auth.test', {
      headers: { Authorization: `Bearer ${botToken}` },
    });

    return response.data.ok === true;
  }

  /**
   * Send Slack message
   */
  async sendSlackMessage(
    integrationId: string,
    channel: string,
    message: string,
    blocks?: any[]
  ): Promise<void> {
    const integration = await this.getIntegrationWithConfig(integrationId);
    if (!integration || integration.type !== 'slack') {
      throw new Error('Invalid Slack integration');
    }

    const config = integration.config as SlackIntegrationConfig['config'];

    await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel,
        text: message,
        blocks,
      },
      { headers: { Authorization: `Bearer ${config.botToken}` } }
    );

    console.log(`📨 Sent Slack message to ${channel}`);
  }

  /**
   * Send error alert to Slack
   */
  async sendErrorAlert(
    integrationId: string,
    errorData: {
      clusterId: string;
      errorType: string;
      severity: string;
      count: number;
      service: string;
    }
  ): Promise<void> {
    const integration = await this.getIntegrationWithConfig(integrationId);
    if (!integration || integration.type !== 'slack') {
      throw new Error('Invalid Slack integration');
    }

    const config = integration.config as SlackIntegrationConfig['config'];
    const severityColors: Record<string, string> = {
      critical: '#ff0000',
      high: '#ff6600',
      medium: '#ffcc00',
      low: '#00cc00',
    };

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 ${errorData.severity.toUpperCase()} Error Alert`,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Error Type:*\n${errorData.errorType}` },
          { type: 'mrkdwn', text: `*Service:*\n${errorData.service}` },
          { type: 'mrkdwn', text: `*Occurrence Count:*\n${errorData.count}` },
          { type: 'mrkdwn', text: `*Cluster ID:*\n${errorData.clusterId}` },
        ],
      },
    ];

    await this.sendSlackMessage(integrationId, config.defaultChannel, '', blocks);
  }

  // ==================== Sentry Integration ====================

  private async validateSentryCredentials(config: Record<string, unknown>): Promise<boolean> {
    const apiKey = config.apiKey as string;

    const response = await axios.get('https://sentry.io/api/0/projects/', {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 10000,
    });

    return response.status === 200;
  }

  // ==================== Datadog Integration ====================

  private async validateDatadogCredentials(config: Record<string, unknown>): Promise<boolean> {
    const apiKey = config.apiKey as string;
    const appKey = config.apiSecret as string;

    const response = await axios.get('https://api.datadoghq.com/api/v1/validate', {
      headers: {
        'DD-API-KEY': apiKey,
        'DD-APPLICATION-KEY': appKey,
      },
      timeout: 10000,
    });

    return response.status === 200;
  }

  // ==================== Webhook Handling ====================

  /**
   * Process incoming webhook
   */
  async processWebhook(
    integrationId: string,
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<IntegrationEvent> {
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    const eventId = uuidv4();

    const event: IntegrationEvent = {
      id: eventId,
      tenantId: integration.tenantId,
      integrationId,
      type: eventType,
      source: integration.type,
      payload,
      processed: false,
      createdAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO integration_events (
        id, tenant_id, integration_id, type, source, payload, processed, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        eventId, integration.tenantId, integrationId, eventType,
        integration.type, JSON.stringify(payload), false, event.createdAt,
      ]
    );

    // Process event asynchronously
    this.handleEvent(event).catch(err => {
      console.error(`Failed to handle event ${eventId}:`, err);
    });

    return event;
  }

  /**
   * Handle integration event
   */
  private async handleEvent(event: IntegrationEvent): Promise<void> {
    console.log(`📥 Processing ${event.source} event: ${event.type}`);

    try {
      switch (event.source) {
        case 'github':
          await this.handleGitHubEvent(event);
          break;
        case 'gitlab':
          await this.handleGitLabEvent(event);
          break;
        case 'sentry':
          await this.handleSentryEvent(event);
          break;
        default:
          console.log(`No handler for source: ${event.source}`);
      }

      // Mark as processed
      await this.dbManager.query(
        `UPDATE integration_events SET processed = true, processed_at = NOW() WHERE id = $1`,
        [event.id]
      );
    } catch (error: any) {
      await this.dbManager.query(
        `UPDATE integration_events SET error = $2 WHERE id = $1`,
        [event.id, error.message]
      );
      throw error;
    }
  }

  private async handleGitHubEvent(event: IntegrationEvent): Promise<void> {
    const payload = event.payload as any;

    switch (event.type) {
      case 'push':
        console.log(`GitHub push to ${payload.ref} by ${payload.pusher?.name}`);
        // Trigger CI/CD pipeline
        break;
      case 'pull_request':
        console.log(`GitHub PR ${payload.action}: ${payload.pull_request?.title}`);
        break;
      case 'workflow_run':
        if (payload.action === 'completed' && payload.workflow_run?.conclusion === 'failure') {
          console.log(`GitHub workflow failed: ${payload.workflow_run?.name}`);
          // Trigger alerts
        }
        break;
    }
  }

  private async handleGitLabEvent(event: IntegrationEvent): Promise<void> {
    // Similar to GitHub handling
    console.log(`GitLab event: ${event.type}`);
  }

  private async handleSentryEvent(event: IntegrationEvent): Promise<void> {
    const payload = event.payload as any;

    // Forward to production-feedback service
    await axios.post(
      `${process.env.PRODUCTION_FEEDBACK_URL}/api/v1/webhooks/sentry`,
      payload,
      { headers: { 'X-Tenant-Id': event.tenantId } }
    );
  }

  // ==================== Notifications ====================

  /**
   * Send notification across configured channels
   */
  async sendNotification(
    tenantId: string,
    notificationType: string,
    data: Record<string, unknown>
  ): Promise<void> {
    // Get all enabled notification integrations for tenant
    const integrations = await this.getTenantIntegrations(tenantId);

    for (const integration of integrations) {
      if (!integration.enabled) continue;

      try {
        switch (integration.type) {
          case 'slack':
            await this.sendSlackNotification(integration.id, notificationType, data);
            break;
          case 'pagerduty':
            if (notificationType === 'critical_error') {
              await this.triggerPagerDutyAlert(integration.id, data);
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to send notification via ${integration.type}:`, error);
      }
    }
  }

  private async sendSlackNotification(
    integrationId: string,
    type: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const integration = await this.getIntegrationWithConfig(integrationId);
    if (!integration) return;

    const config = integration.config as SlackIntegrationConfig['config'];
    const channel = config.defaultChannel;

    let message = '';
    switch (type) {
      case 'error_alert':
        message = `🚨 Error Alert: ${data.errorType} in ${data.service}`;
        break;
      case 'deployment_completed':
        message = `✅ Deployment to ${data.target} completed`;
        break;
      case 'deployment_failed':
        message = `❌ Deployment to ${data.target} failed`;
        break;
      default:
        message = `📢 ${type}: ${JSON.stringify(data)}`;
    }

    await this.sendSlackMessage(integrationId, channel, message);
  }

  private async triggerPagerDutyAlert(
    integrationId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const integration = await this.getIntegrationWithConfig(integrationId);
    if (!integration) return;

    const config = integration.config as any;

    await axios.post(
      'https://events.pagerduty.com/v2/enqueue',
      {
        routing_key: config.routingKey,
        event_action: 'trigger',
        payload: {
          summary: `Critical Error: ${data.errorType}`,
          severity: 'critical',
          source: data.service || 'shifty',
          custom_details: data,
        },
      }
    );

    console.log(`📟 Triggered PagerDuty alert`);
  }

  // ==================== Helper Methods ====================

  private async getIntegrationWithConfig(integrationId: string): Promise<any> {
    const query = 'SELECT * FROM integrations WHERE id = $1';
    const result = await this.dbManager.query(query, [integrationId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...this.transformIntegrationRow(row),
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
    };
  }

  private transformIntegrationRow(row: any): BaseIntegrationConfig {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      type: row.type,
      name: row.name,
      status: row.status,
      enabled: row.enabled,
      lastSyncAt: row.last_sync_at,
      lastError: row.last_error,
      webhookUrl: row.webhook_url,
      webhookSecret: row.webhook_secret,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
