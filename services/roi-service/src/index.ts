import Fastify from 'fastify';
import { DatabaseManager } from '@shifty/database';
import { ROIService } from './services/roi.service';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
});

class ROIServiceApp {
  private dbManager: DatabaseManager;
  private roiService: ROIService;

  constructor() {
    this.dbManager = new DatabaseManager();
    this.roiService = new ROIService(this.dbManager);
  }

  async start() {
    try {
      await this.dbManager.initialize();
      await this.registerPlugins();
      await this.registerRoutes();

      const port = parseInt(process.env.PORT || '3013', 10);
      await fastify.listen({ port, host: '0.0.0.0' });
      
      console.log(`📊 ROI Service running on port ${port}`);
    } catch (error) {
      console.error('Failed to start ROI Service:', error);
      process.exit(1);
    }
  }

  private async registerPlugins() {
    await fastify.register(import('@fastify/cors'), {
      origin: true,
      credentials: true
    });

    await fastify.register(import('@fastify/rate-limit'), {
      max: 1000,
      timeWindow: '1 minute'
    });
  }

  private async registerRoutes() {
    // Health check
    fastify.get('/health', async () => ({
      status: 'healthy',
      service: 'roi-service',
      timestamp: new Date().toISOString()
    }));

    // ==================== ROI Insights (Main Dashboard Endpoint) ====================

    fastify.get('/api/v1/roi/insights', async (request, reply) => {
      try {
        const { tenantId, teamId, timeframe, startDate, endDate } = request.query as {
          tenantId: string;
          teamId?: string;
          timeframe?: string;
          startDate?: string;
          endDate?: string;
        };

        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const periodStart = startDate ? new Date(startDate) : undefined;
        const periodEnd = endDate ? new Date(endDate) : undefined;

        const roi = await this.roiService.calculateROI(tenantId, teamId, periodStart, periodEnd);
        const operationalMetrics = await this.roiService.getOperationalMetrics(tenantId, periodStart, periodEnd);

        return {
          success: true,
          data: {
            roi,
            operationalMetrics,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== DORA Metrics ====================

    fastify.get('/api/v1/roi/dora', async (request, reply) => {
      try {
        const { tenantId, teamId, timeframe, startDate, endDate } = request.query as {
          tenantId: string;
          teamId?: string;
          timeframe?: string;
          startDate?: string;
          endDate?: string;
        };

        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const periodStart = startDate ? new Date(startDate) : undefined;
        const periodEnd = endDate ? new Date(endDate) : undefined;

        const metrics = await this.roiService.calculateDORAMetrics(
          tenantId,
          teamId,
          (timeframe as any) || 'monthly',
          periodStart,
          periodEnd
        );

        return { success: true, data: metrics };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== SPACE Metrics ====================

    fastify.get('/api/v1/roi/space', async (request, reply) => {
      try {
        const { tenantId, teamId, timeframe, startDate, endDate } = request.query as {
          tenantId: string;
          teamId?: string;
          timeframe?: string;
          startDate?: string;
          endDate?: string;
        };

        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const periodStart = startDate ? new Date(startDate) : undefined;
        const periodEnd = endDate ? new Date(endDate) : undefined;

        const metrics = await this.roiService.calculateSPACEMetrics(
          tenantId,
          teamId,
          (timeframe as any) || 'monthly',
          periodStart,
          periodEnd
        );

        return { success: true, data: metrics };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== Incidents Prevented ====================

    fastify.get('/api/v1/roi/incidents', async (request, reply) => {
      try {
        const { tenantId, teamId, startDate, endDate, limit } = request.query as {
          tenantId: string;
          teamId?: string;
          startDate?: string;
          endDate?: string;
          limit?: string;
        };

        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const periodStart = startDate ? new Date(startDate) : undefined;
        const periodEnd = endDate ? new Date(endDate) : undefined;

        const incidents = await this.roiService.getIncidentPreventions(
          tenantId,
          periodStart,
          periodEnd,
          parseInt(limit || '50')
        );

        // Calculate summary
        const summary = {
          total: incidents.length,
          bySeverity: {
            critical: incidents.filter(i => i.severity === 'critical').length,
            high: incidents.filter(i => i.severity === 'high').length,
            medium: incidents.filter(i => i.severity === 'medium').length,
            low: incidents.filter(i => i.severity === 'low').length,
          },
          totalCostAvoided: incidents.reduce((sum, i) => sum + (i.estimatedCostAvoided || 0), 0),
          bySource: incidents.reduce((acc, i) => {
            acc[i.detectionSource] = (acc[i.detectionSource] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        };

        return { success: true, data: { incidents, summary } };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    fastify.post('/api/v1/roi/incidents', async (request, reply) => {
      try {
        const body = request.body as {
          tenantId: string;
          detectionSource: string;
          severity: string;
          description: string;
          potentialImpact: string;
          estimatedCostAvoided?: number;
          testId?: string;
          pipelineId?: string;
          errorClusterId?: string;
        };

        const incident = await this.roiService.recordIncidentPrevention(body.tenantId, {
          detectionSource: body.detectionSource as any,
          severity: body.severity as any,
          description: body.description,
          potentialImpact: body.potentialImpact,
          estimatedCostAvoided: body.estimatedCostAvoided,
          testId: body.testId,
          pipelineId: body.pipelineId,
          errorClusterId: body.errorClusterId,
          preventedAt: new Date(),
        });

        return reply.code(201).send({ success: true, data: incident });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Operational Cost ====================

    fastify.get('/api/v1/roi/operational-cost', async (request, reply) => {
      try {
        const { tenantId, teamId, startDate, endDate } = request.query as {
          tenantId: string;
          teamId?: string;
          startDate?: string;
          endDate?: string;
        };

        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const periodStart = startDate ? new Date(startDate) : undefined;
        const periodEnd = endDate ? new Date(endDate) : undefined;

        const roi = await this.roiService.calculateROI(tenantId, teamId, periodStart, periodEnd);

        return {
          success: true,
          data: {
            timeSavings: roi.timeSavings,
            costAnalysis: roi.costAnalysis,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== ROI Reports ====================

    fastify.post('/api/v1/roi/reports', async (request, reply) => {
      try {
        const body = request.body as {
          tenantId: string;
          teamId?: string;
          reportType?: string;
          startDate?: string;
          endDate?: string;
        };

        const periodStart = body.startDate ? new Date(body.startDate) : undefined;
        const periodEnd = body.endDate ? new Date(body.endDate) : undefined;

        const report = await this.roiService.generateROIReport(
          body.tenantId,
          body.teamId,
          (body.reportType as any) || 'detailed',
          periodStart,
          periodEnd
        );

        return reply.code(201).send({ success: true, data: report });
      } catch (error: any) {
        return reply.code(400).send({ success: false, error: error.message });
      }
    });

    // ==================== Telemetry Completeness ====================

    fastify.get('/api/v1/roi/telemetry-completeness', async (request, reply) => {
      try {
        const { tenantId, signal, threshold } = request.query as {
          tenantId: string;
          signal?: string;
          threshold?: string;
        };

        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        if (signal) {
          const completeness = await this.roiService.checkTelemetryCompleteness(
            tenantId,
            signal as 'traces' | 'metrics' | 'logs',
            parseFloat(threshold || '0.95')
          );
          return { success: true, data: completeness };
        }

        // Check all signals
        const [traces, metrics, logs] = await Promise.all([
          this.roiService.checkTelemetryCompleteness(tenantId, 'traces'),
          this.roiService.checkTelemetryCompleteness(tenantId, 'metrics'),
          this.roiService.checkTelemetryCompleteness(tenantId, 'logs'),
        ]);

        const overallComplete = traces.meetsThreshold && metrics.meetsThreshold && logs.meetsThreshold;

        return {
          success: true,
          data: {
            traces,
            metrics,
            logs,
            overallComplete,
            canReportROI: overallComplete,
          }
        };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== Operational Metrics ====================

    fastify.get('/api/v1/roi/operational-metrics', async (request, reply) => {
      try {
        const { tenantId, startDate, endDate } = request.query as {
          tenantId: string;
          startDate?: string;
          endDate?: string;
        };

        if (!tenantId) {
          return reply.code(400).send({ success: false, error: 'tenantId required' });
        }

        const periodStart = startDate ? new Date(startDate) : undefined;
        const periodEnd = endDate ? new Date(endDate) : undefined;

        const metrics = await this.roiService.getOperationalMetrics(tenantId, periodStart, periodEnd);

        return { success: true, data: metrics };
      } catch (error: any) {
        return reply.code(500).send({ success: false, error: error.message });
      }
    });

    // ==================== PromQL Queries (for Prometheus integration) ====================

    fastify.get('/api/v1/roi/promql', async (request, reply) => {
      // Return predefined PromQL queries for ROI metrics
      const queries = [
        {
          id: 'quality_sessions_active',
          name: 'Active Quality Sessions',
          description: 'Number of active manual testing sessions by persona',
          query: 'quality_sessions_active{persona=~"$persona", repo=~"$repo"}',
          metricType: 'gauge',
          unit: 'sessions',
        },
        {
          id: 'tests_generated_total',
          name: 'Tests Generated',
          description: 'Total number of AI-generated tests',
          query: 'sum(rate(tests_generated_total{repo=~"$repo"}[5m])) by (framework)',
          metricType: 'counter',
          unit: 'tests',
        },
        {
          id: 'tests_healed_total',
          name: 'Tests Healed',
          description: 'Total number of healed selectors',
          query: 'sum(rate(tests_healed_total{repo=~"$repo"}[5m])) by (strategy)',
          metricType: 'counter',
          unit: 'selectors',
        },
        {
          id: 'ci_pipeline_duration',
          name: 'Pipeline Duration',
          description: 'CI pipeline execution time distribution',
          query: 'histogram_quantile(0.95, sum(rate(ci_pipeline_duration_seconds_bucket[5m])) by (le, stage))',
          metricType: 'histogram',
          unit: 'seconds',
        },
        {
          id: 'roi_time_saved',
          name: 'Time Saved',
          description: 'Cumulative time saved by automation',
          query: 'sum(roi_time_saved_seconds{team=~"$team"}) by (activity)',
          metricType: 'counter',
          unit: 'seconds',
        },
        {
          id: 'incidents_prevented',
          name: 'Incidents Prevented',
          description: 'Number of production incidents prevented',
          query: 'sum(incidents_prevented_total{team=~"$team"}) by (severity)',
          metricType: 'counter',
          unit: 'incidents',
        },
        {
          id: 'telemetry_completeness',
          name: 'Telemetry Completeness',
          description: 'Ratio of spans with all required attributes',
          query: 'telemetry_completeness_ratio{tenant_id=~"$tenant", signal=~"$signal"}',
          metricType: 'gauge',
          unit: 'ratio',
          thresholds: { warning: 0.9, critical: 0.95 },
        },
        {
          id: 'healing_success_rate',
          name: 'Healing Success Rate',
          description: 'Percentage of successful selector healings',
          query: 'sum(tests_healed_total{success="true"}) / sum(tests_healed_total) * 100',
          metricType: 'gauge',
          unit: 'percent',
          thresholds: { warning: 70, critical: 50 },
        },
      ];

      return { success: true, data: queries };
    });
  }

  async stop() {
    await this.dbManager.close();
    await fastify.close();
    console.log('ROI Service stopped');
  }
}

const app = new ROIServiceApp();
app.start();

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

export default ROIServiceApp;
