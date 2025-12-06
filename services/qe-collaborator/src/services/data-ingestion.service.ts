import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { KnowledgeDocument } from '../types';

export class DataIngestionService {
  private cicdGovernorUrl: string;
  private roiServiceUrl: string;
  private manualSessionHubUrl: string;

  constructor() {
    this.cicdGovernorUrl = process.env.CICD_GOVERNOR_URL || 'http://localhost:3007';
    this.roiServiceUrl = process.env.ROI_SERVICE_URL || 'http://localhost:3008';
    this.manualSessionHubUrl = process.env.MANUAL_SESSION_HUB_URL || 'http://localhost:3009';
  }

  /**
   * Ingest data from all sources for a tenant
   */
  async ingestTenantData(tenantId: string): Promise<KnowledgeDocument[]> {
    console.log(`Starting data ingestion for tenant ${tenantId}`);

    const documents: KnowledgeDocument[] = [];

    // Ingest from various sources in parallel
    const [ciData, testData, sessionData, telemetryData] = await Promise.all([
      this.ingestCIData(tenantId),
      this.ingestTestData(tenantId),
      this.ingestSessionData(tenantId),
      this.ingestTelemetryData(tenantId)
    ]);

    documents.push(...ciData, ...testData, ...sessionData, ...telemetryData);

    console.log(`Ingested ${documents.length} documents for tenant ${tenantId}`);
    return documents;
  }

  /**
   * Ingest CI/CD pipeline data
   */
  private async ingestCIData(tenantId: string): Promise<KnowledgeDocument[]> {
    try {
      const response = await axios.get(
        `${this.cicdGovernorUrl}/api/v1/pipelines`,
        {
          params: { tenantId },
          timeout: 5000
        }
      );

      const pipelines = response.data.pipelines || [];

      return pipelines.map((pipeline: any) => ({
        id: uuidv4(),
        type: 'telemetry' as const,
        tenantId,
        title: `CI Pipeline: ${pipeline.name}`,
        content: this.formatPipelineData(pipeline),
        metadata: {
          source: 'cicd-governor',
          pipelineId: pipeline.id,
          repo: pipeline.repo,
          branch: pipeline.branch,
          status: pipeline.status,
          url: pipeline.url
        },
        lastUpdated: new Date(pipeline.lastRun || Date.now())
      }));
    } catch (error) {
      console.error('Error ingesting CI data:', error);
      return [];
    }
  }

  /**
   * Ingest test execution data
   */
  private async ingestTestData(tenantId: string): Promise<KnowledgeDocument[]> {
    try {
      // TODO: Call test-generator service for test data
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error ingesting test data:', error);
      return [];
    }
  }

  /**
   * Ingest manual session data
   */
  private async ingestSessionData(tenantId: string): Promise<KnowledgeDocument[]> {
    try {
      const response = await axios.get(
        `${this.manualSessionHubUrl}/api/v1/sessions`,
        {
          params: { tenantId, limit: 100 },
          timeout: 5000
        }
      );

      const sessions = response.data.sessions || [];

      return sessions.map((session: any) => ({
        id: uuidv4(),
        type: 'test' as const,
        tenantId,
        title: `Manual Session: ${session.title}`,
        content: this.formatSessionData(session),
        metadata: {
          source: 'manual-session-hub',
          sessionId: session.id,
          persona: session.persona,
          component: session.component,
          riskLevel: session.riskLevel
        },
        lastUpdated: new Date(session.endTime || session.startTime || Date.now())
      }));
    } catch (error) {
      console.error('Error ingesting session data:', error);
      return [];
    }
  }

  /**
   * Ingest telemetry data from ROI service
   */
  private async ingestTelemetryData(tenantId: string): Promise<KnowledgeDocument[]> {
    try {
      const response = await axios.get(
        `${this.roiServiceUrl}/api/v1/roi/insights`,
        {
          params: { tenantId },
          timeout: 5000
        }
      );

      const insights = response.data;

      return [{
        id: uuidv4(),
        type: 'telemetry' as const,
        tenantId,
        title: 'Quality Metrics and ROI Insights',
        content: this.formatInsightsData(insights),
        metadata: {
          source: 'roi-service',
          ...insights
        },
        lastUpdated: new Date()
      }];
    } catch (error) {
      console.error('Error ingesting telemetry data:', error);
      return [];
    }
  }

  /**
   * Format pipeline data for knowledge base
   */
  private formatPipelineData(pipeline: any): string {
    return `
Pipeline: ${pipeline.name}
Repository: ${pipeline.repo}
Branch: ${pipeline.branch}
Status: ${pipeline.status}
Last Run: ${pipeline.lastRun}

Test Results:
- Total Tests: ${pipeline.testStats?.total || 0}
- Passed: ${pipeline.testStats?.passed || 0}
- Failed: ${pipeline.testStats?.failed || 0}
- Skipped: ${pipeline.testStats?.skipped || 0}

Coverage: ${pipeline.coverage || 'N/A'}%

Recent Failures:
${pipeline.failures?.map((f: any) => `- ${f.test}: ${f.reason}`).join('\n') || 'None'}
    `.trim();
  }

  /**
   * Format session data for knowledge base
   */
  private formatSessionData(session: any): string {
    return `
Session: ${session.title}
Type: ${session.sessionType}
Persona: ${session.persona}
Component: ${session.component}
Risk Level: ${session.riskLevel}

Steps Completed: ${session.stepsCompleted || 0}/${session.testStepsTotal || 0}
Bugs Found: ${session.bugsFound || 0}

Notes:
${session.notes || 'No notes available'}

Key Findings:
${session.findings?.map((f: any) => `- ${f}`).join('\n') || 'None reported'}
    `.trim();
  }

  /**
   * Format insights data for knowledge base
   */
  private formatInsightsData(insights: any): string {
    return `
Quality Metrics Summary:

Test Coverage: ${insights.testCoverage || 'N/A'}%
Automation Coverage: ${insights.automationCoverage || 'N/A'}%
Bug Detection Rate: ${insights.bugDetectionRate || 'N/A'}

CI Health:
- Success Rate: ${insights.ciSuccessRate || 'N/A'}%
- Average Duration: ${insights.avgDuration || 'N/A'}
- Flaky Tests: ${insights.flakyTests || 0}

Recent Quality Trends:
${insights.trends?.map((t: any) => `- ${t.metric}: ${t.direction} ${t.value}`).join('\n') || 'No trend data available'}

Top Risks:
${insights.risks?.map((r: any) => `- ${r.area}: ${r.severity} (${r.description})`).join('\n') || 'No high-risk areas identified'}
    `.trim();
  }

  /**
   * Ingest data on schedule (called by cron job)
   */
  async scheduledIngestion(tenantIds: string[]): Promise<void> {
    console.log(`Starting scheduled ingestion for ${tenantIds.length} tenants`);

    for (const tenantId of tenantIds) {
      try {
        await this.ingestTenantData(tenantId);
      } catch (error) {
        console.error(`Error ingesting data for tenant ${tenantId}:`, error);
      }
    }

    console.log('Scheduled ingestion complete');
  }
}
