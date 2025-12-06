/**
 * @shifty/sdk-observability
 * 
 * Production instrumentation utilities for Shifty AI-Powered Testing Platform
 * Provides OpenTelemetry configuration, Prometheus metrics, and default resource attributes.
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  trace,
  SpanKind,
  SpanStatusCode,
  context,
  propagation,
  Tracer,
  Span,
  Attributes,
} from '@opentelemetry/api';
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

// ============================================================
// CONFIGURATION
// ============================================================

export interface ShiftyObservabilityConfig {
  /** Service name */
  serviceName: string;
  /** Service version */
  serviceVersion: string;
  /** Deployment environment */
  environment: 'development' | 'staging' | 'production';
  /** Tenant ID for multi-tenant isolation */
  tenantId?: string;
  /** OTLP collector endpoint for traces */
  otlpTraceEndpoint?: string;
  /** OTLP collector endpoint for metrics */
  otlpMetricEndpoint?: string;
  /** Enable auto-instrumentation */
  enableAutoInstrumentation?: boolean;
  /** Sampling rate for traces (0-1) */
  samplingRate?: number;
  /** Enable Prometheus metrics */
  enablePrometheus?: boolean;
  /** Custom resource attributes */
  resourceAttributes?: Record<string, string>;
}

// ============================================================
// DEFAULT RESOURCE ATTRIBUTES
// ============================================================

export function createResource(config: ShiftyObservabilityConfig): Resource {
  return new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment,
    'x-tenant-id': config.tenantId || 'default',
    'shifty.platform': 'true',
    ...config.resourceAttributes,
  });
}

// ============================================================
// OPENTELEMETRY SDK SETUP
// ============================================================

let sdk: NodeSDK | null = null;
let meterProvider: MeterProvider | null = null;

export function initializeObservability(config: ShiftyObservabilityConfig): void {
  const resource = createResource(config);

  // Determine environment-appropriate defaults
  const isProduction = process.env.NODE_ENV === 'production';
  const defaultTraceEndpoint = isProduction 
    ? 'https://otel-collector.shifty.ai/v1/traces'
    : 'http://localhost:4318/v1/traces';
  const defaultMetricEndpoint = isProduction
    ? 'https://otel-collector.shifty.ai/v1/metrics'
    : 'http://localhost:4318/v1/metrics';

  // Set up trace exporter
  const traceExporter = new OTLPTraceExporter({
    url: config.otlpTraceEndpoint || process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || defaultTraceEndpoint,
  });

  // Set up metric exporter
  const metricExporter = new OTLPMetricExporter({
    url: config.otlpMetricEndpoint || process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || defaultMetricEndpoint,
  });

  // Set up metric reader
  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 15000, // 15 seconds
  });

  // Set up meter provider
  meterProvider = new MeterProvider({
    resource,
  });

  // Add reader to meter provider
  meterProvider.addMetricReader(metricReader);

  // Initialize SDK
  sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: config.enableAutoInstrumentation !== false
      ? [getNodeAutoInstrumentations()]
      : [],
  });

  sdk.start();

  console.log(`🔭 Observability initialized for ${config.serviceName}`);
}

export async function shutdownObservability(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    console.log('Observability shutdown complete');
  }
}

// ============================================================
// PROMETHEUS METRICS
// ============================================================

// Create a dedicated registry
export const metricsRegistry = new Registry();

// Initialize default metrics
collectDefaultMetrics({ register: metricsRegistry });

// Quality Session Metrics
export const qualitySessionsActive = new Gauge({
  name: 'quality_sessions_active',
  help: 'Number of active quality/manual testing sessions',
  labelNames: ['persona', 'repo', 'tenant_id'],
  registers: [metricsRegistry],
});

// Test Generation Metrics
export const testsGeneratedTotal = new Counter({
  name: 'tests_generated_total',
  help: 'Total number of AI-generated tests',
  labelNames: ['repo', 'framework', 'model', 'tenant_id'],
  registers: [metricsRegistry],
});

// Selector Healing Metrics
export const testsHealedTotal = new Counter({
  name: 'tests_healed_total',
  help: 'Total number of healed selectors',
  labelNames: ['repo', 'strategy', 'browser', 'tenant_id', 'success'],
  registers: [metricsRegistry],
});

// CI Pipeline Metrics
export const ciPipelineDuration = new Histogram({
  name: 'ci_pipeline_duration_seconds',
  help: 'CI pipeline execution duration in seconds',
  labelNames: ['provider', 'stage', 'repo', 'tenant_id'],
  buckets: [10, 30, 60, 120, 300, 600, 1200, 1800, 3600],
  registers: [metricsRegistry],
});

// ROI Metrics
export const roiTimeSaved = new Counter({
  name: 'roi_time_saved_seconds',
  help: 'Cumulative time saved by automation in seconds',
  labelNames: ['team', 'persona', 'activity', 'tenant_id'],
  registers: [metricsRegistry],
});

export const incidentsPrevented = new Counter({
  name: 'incidents_prevented_total',
  help: 'Number of production incidents prevented',
  labelNames: ['team', 'severity', 'tenant_id'],
  registers: [metricsRegistry],
});

// Telemetry Completeness
export const telemetryCompleteness = new Gauge({
  name: 'telemetry_completeness_ratio',
  help: 'Ratio of spans with all required attributes (0-1)',
  labelNames: ['tenant_id', 'signal'],
  registers: [metricsRegistry],
});

// Manual Testing Metrics
export const manualTestStepsExecuted = new Counter({
  name: 'manual_test_steps_executed_total',
  help: 'Total manual test steps executed',
  labelNames: ['tenant_id', 'session_type', 'status'],
  registers: [metricsRegistry],
});

// HITL Arcade Metrics
export const hitlMissionsCompleted = new Counter({
  name: 'hitl_missions_completed_total',
  help: 'Total HITL missions completed',
  labelNames: ['tenant_id', 'mission_type', 'difficulty'],
  registers: [metricsRegistry],
});

// API Latency Metrics
export const apiLatency = new Histogram({
  name: 'api_request_duration_seconds',
  help: 'API request duration in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry],
});

// Error Rate Metrics
export const errorRate = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['service', 'error_type', 'severity', 'tenant_id'],
  registers: [metricsRegistry],
});

// ============================================================
// SPAN CREATORS
// ============================================================

export function getTracer(name: string = '@shifty/sdk-observability'): Tracer {
  return trace.getTracer(name, '1.0.0');
}

export interface SpanOptions {
  name: string;
  kind?: SpanKind;
  attributes?: Attributes;
  tenantId?: string;
  persona?: string;
}

export function startSpan(options: SpanOptions): Span {
  const tracer = getTracer();
  return tracer.startSpan(options.name, {
    kind: options.kind || SpanKind.INTERNAL,
    attributes: {
      'x-tenant-id': options.tenantId,
      persona: options.persona,
      ...options.attributes,
    },
  });
}

// ============================================================
// QUALITY SESSION TRACING
// ============================================================

export interface QualitySessionSpanAttrs {
  sessionId: string;
  tenantId: string;
  persona: string;
  sessionType: string;
  repo?: string;
  branch?: string;
  component?: string;
  riskLevel?: string;
}

export function startQualitySessionSpan(attrs: QualitySessionSpanAttrs): Span {
  const tracer = getTracer();
  const span = tracer.startSpan('quality.session', {
    kind: SpanKind.INTERNAL,
    attributes: {
      'session_id': attrs.sessionId,
      'tenant_id': attrs.tenantId,
      'persona': attrs.persona,
      'session_type': attrs.sessionType,
      'repo': attrs.repo || '',
      'branch': attrs.branch || '',
      'component': attrs.component || '',
      'risk_level': attrs.riskLevel || 'medium',
    },
  });

  // Increment active sessions gauge
  qualitySessionsActive.inc({
    persona: attrs.persona,
    repo: attrs.repo || 'unknown',
    tenant_id: attrs.tenantId,
  });

  return span;
}

export function endQualitySessionSpan(
  span: Span,
  attrs: QualitySessionSpanAttrs,
  success: boolean = true
): void {
  span.setStatus({
    code: success ? SpanStatusCode.OK : SpanStatusCode.ERROR,
  });
  span.end();

  // Decrement active sessions gauge
  qualitySessionsActive.dec({
    persona: attrs.persona,
    repo: attrs.repo || 'unknown',
    tenant_id: attrs.tenantId,
  });
}

// ============================================================
// CI PIPELINE TRACING
// ============================================================

export interface CIPipelineSpanAttrs {
  pipelineId: string;
  provider: string;
  repo: string;
  branch: string;
  stage: string;
  commitSha?: string;
  tenantId: string;
}

export function startCIPipelineSpan(attrs: CIPipelineSpanAttrs): Span {
  const tracer = getTracer();
  return tracer.startSpan('ci.pipeline', {
    kind: SpanKind.INTERNAL,
    attributes: {
      'pipeline_id': attrs.pipelineId,
      'provider': attrs.provider,
      'repo': attrs.repo,
      'branch': attrs.branch,
      'stage': attrs.stage,
      'commit_sha': attrs.commitSha || '',
      'tenant_id': attrs.tenantId,
    },
  });
}

export function endCIPipelineSpan(
  span: Span,
  attrs: CIPipelineSpanAttrs,
  result: {
    status: 'success' | 'failure' | 'cancelled';
    durationMs: number;
    testsTotal?: number;
    testsFailed?: number;
  }
): void {
  span.setAttributes({
    'status': result.status,
    'duration_ms': result.durationMs,
    'tests_total': result.testsTotal || 0,
    'tests_failed': result.testsFailed || 0,
  });

  span.setStatus({
    code: result.status === 'success' ? SpanStatusCode.OK : SpanStatusCode.ERROR,
  });

  span.end();

  // Record histogram metric
  ciPipelineDuration.observe(
    {
      provider: attrs.provider,
      stage: attrs.stage,
      repo: attrs.repo,
      tenant_id: attrs.tenantId,
    },
    result.durationMs / 1000
  );
}

// ============================================================
// SDK EVENT TRACING
// ============================================================

export interface SDKEventSpanAttrs {
  eventType: string;
  tenantId: string;
  sdkVersion: string;
  language?: string;
  framework?: string;
  result?: string;
}

export function emitSDKEvent(attrs: SDKEventSpanAttrs, latencyMs?: number): void {
  const tracer = getTracer();
  const span = tracer.startSpan('sdk.event', {
    kind: SpanKind.INTERNAL,
    attributes: {
      'event_type': attrs.eventType,
      'tenant_id': attrs.tenantId,
      'sdk_version': attrs.sdkVersion,
      'language': attrs.language || 'typescript',
      'framework': attrs.framework || 'unknown',
      'latency_ms': latencyMs || 0,
      'result': attrs.result || 'success',
    },
  });

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

// ============================================================
// MANUAL TEST STEP TRACING
// ============================================================

export interface ManualStepSpanAttrs {
  sessionId: string;
  stepId: string;
  sequence: number;
  actionType: string;
  component?: string;
  jiraIssueId?: string;
  confidence?: number;
  tenantId: string;
}

export function recordManualTestStep(
  attrs: ManualStepSpanAttrs,
  status: 'passed' | 'failed' | 'blocked' | 'skipped'
): void {
  const tracer = getTracer();
  const span = tracer.startSpan('manual.step', {
    kind: SpanKind.INTERNAL,
    attributes: {
      'session_id': attrs.sessionId,
      'step_id': attrs.stepId,
      'sequence': attrs.sequence,
      'action_type': attrs.actionType,
      'component': attrs.component || '',
      'jira_issue_id': attrs.jiraIssueId || '',
      'confidence': attrs.confidence || 1,
      'tenant_id': attrs.tenantId,
      'status': status,
    },
  });

  span.setStatus({
    code: status === 'passed' ? SpanStatusCode.OK : SpanStatusCode.ERROR,
  });
  span.end();

  // Record metric
  manualTestStepsExecuted.inc({
    tenant_id: attrs.tenantId,
    session_type: attrs.actionType,
    status,
  });
}

// ============================================================
// ROI CALCULATION TRACING
// ============================================================

export interface ROICalculationSpanAttrs {
  tenantId: string;
  teamId?: string;
  timeframe: string;
  kpi: string;
  telemetryCompleteness: number;
}

export function recordROICalculation(attrs: ROICalculationSpanAttrs, value: number): void {
  const tracer = getTracer();
  const span = tracer.startSpan('roi.calculation', {
    kind: SpanKind.INTERNAL,
    attributes: {
      'tenant_id': attrs.tenantId,
      'team': attrs.teamId || 'all',
      'timeframe': attrs.timeframe,
      'kpi': attrs.kpi,
      'telemetry_completeness': attrs.telemetryCompleteness,
      'value': value,
    },
  });

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
}

// ============================================================
// METRIC HELPERS
// ============================================================

export function recordTestGenerated(
  tenantId: string,
  repo: string,
  framework: string,
  model: string = 'default'
): void {
  testsGeneratedTotal.inc({
    repo,
    framework,
    model,
    tenant_id: tenantId,
  });
}

export function recordSelectorHealed(
  tenantId: string,
  repo: string,
  strategy: string,
  browser: string,
  success: boolean
): void {
  testsHealedTotal.inc({
    repo,
    strategy,
    browser,
    tenant_id: tenantId,
    success: String(success),
  });
}

export function recordTimeSaved(
  tenantId: string,
  team: string,
  persona: string,
  activity: string,
  seconds: number
): void {
  roiTimeSaved.inc({
    team,
    persona,
    activity,
    tenant_id: tenantId,
  }, seconds);
}

export function recordIncidentPrevented(
  tenantId: string,
  team: string,
  severity: string
): void {
  incidentsPrevented.inc({
    team,
    severity,
    tenant_id: tenantId,
  });
}

export function updateTelemetryCompleteness(
  tenantId: string,
  signal: 'traces' | 'metrics' | 'logs',
  ratio: number
): void {
  telemetryCompleteness.set({
    tenant_id: tenantId,
    signal,
  }, ratio);
}

// ============================================================
// PROMETHEUS HTTP ENDPOINT
// ============================================================

export function getMetricsHandler() {
  return async () => {
    return {
      contentType: metricsRegistry.contentType,
      metrics: await metricsRegistry.metrics(),
    };
  };
}

// ============================================================
// EXPORTS
// ============================================================

export {
  trace,
  context,
  propagation,
  SpanKind,
  SpanStatusCode,
  Tracer,
  Span,
  Attributes,
} from '@opentelemetry/api';
