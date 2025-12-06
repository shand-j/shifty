-- ROI Service Tables
-- Version: 010
-- Description: Tables for DORA/SPACE metrics, ROI calculations, and telemetry completeness

-- DORA Metrics
CREATE TABLE IF NOT EXISTS dora_metrics (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    team_id UUID,
    timeframe VARCHAR(50) NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    deployment_frequency JSONB NOT NULL,
    lead_time_for_changes JSONB NOT NULL,
    mean_time_to_recovery JSONB NOT NULL,
    change_failure_rate JSONB NOT NULL,
    overall_level VARCHAR(20) NOT NULL,
    calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dora_metrics_tenant ON dora_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dora_metrics_team ON dora_metrics(team_id);
CREATE INDEX IF NOT EXISTS idx_dora_metrics_period ON dora_metrics(period_start, period_end);

-- SPACE Metrics
CREATE TABLE IF NOT EXISTS space_metrics (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    team_id UUID,
    timeframe VARCHAR(50) NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    satisfaction JSONB NOT NULL,
    performance JSONB NOT NULL,
    activity JSONB NOT NULL,
    communication JSONB NOT NULL,
    efficiency JSONB NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL,
    calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_space_metrics_tenant ON space_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_space_metrics_team ON space_metrics(team_id);

-- ROI Calculations
CREATE TABLE IF NOT EXISTS roi_calculations (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    team_id UUID,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    time_savings JSONB NOT NULL,
    quality_impact JSONB NOT NULL,
    velocity_gains JSONB NOT NULL,
    cost_analysis JSONB NOT NULL,
    trends JSONB NOT NULL,
    calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roi_calculations_tenant ON roi_calculations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_period ON roi_calculations(period_start, period_end);

-- Telemetry Completeness
CREATE TABLE IF NOT EXISTS telemetry_completeness (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    signal VARCHAR(20) NOT NULL,
    completeness_ratio DECIMAL(5,4) NOT NULL,
    missing_attributes JSONB NOT NULL DEFAULT '[]',
    samples_analyzed INTEGER NOT NULL DEFAULT 0,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    meets_threshold BOOLEAN NOT NULL,
    threshold DECIMAL(5,4) NOT NULL,
    calculated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_completeness_tenant ON telemetry_completeness(tenant_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_completeness_signal ON telemetry_completeness(signal);

-- Incident Preventions
CREATE TABLE IF NOT EXISTS incident_preventions (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    detection_source VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    potential_impact TEXT NOT NULL,
    estimated_cost_avoided DECIMAL(12,2),
    test_id UUID,
    pipeline_id UUID,
    error_cluster_id UUID,
    prevented_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_preventions_tenant ON incident_preventions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_incident_preventions_source ON incident_preventions(detection_source);
CREATE INDEX IF NOT EXISTS idx_incident_preventions_severity ON incident_preventions(severity);

-- ROI Reports
CREATE TABLE IF NOT EXISTS roi_reports (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    dora_metrics JSONB,
    space_metrics JSONB,
    roi_calculation JSONB NOT NULL,
    operational_metrics JSONB NOT NULL,
    telemetry_completeness JSONB NOT NULL,
    recommendations JSONB NOT NULL DEFAULT '[]',
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    generated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_roi_reports_tenant ON roi_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_roi_reports_type ON roi_reports(report_type);

-- Quality Sessions
CREATE TABLE IF NOT EXISTS quality_sessions (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    persona VARCHAR(20) NOT NULL,
    session_type VARCHAR(30) NOT NULL,
    repo VARCHAR(255),
    branch VARCHAR(255),
    component VARCHAR(255),
    risk_level VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    start_ts TIMESTAMP NOT NULL,
    end_ts TIMESTAMP,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    charter TEXT,
    notes TEXT,
    bugs_found INTEGER DEFAULT 0,
    issues_logged JSONB DEFAULT '[]',
    test_steps_completed INTEGER DEFAULT 0,
    test_steps_total INTEGER,
    automation_coverage DECIMAL(5,2),
    automation_gaps JSONB DEFAULT '[]',
    recordings JSONB DEFAULT '[]',
    screenshots JSONB DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quality_sessions_tenant ON quality_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quality_sessions_user ON quality_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quality_sessions_status ON quality_sessions(status);
CREATE INDEX IF NOT EXISTS idx_quality_sessions_persona ON quality_sessions(persona);

-- Manual Test Steps
CREATE TABLE IF NOT EXISTS manual_test_steps (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES quality_sessions(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    sequence INTEGER NOT NULL,
    action TEXT NOT NULL,
    expected_result TEXT,
    actual_result TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    attachments JSONB DEFAULT '[]',
    jira_issue_id VARCHAR(50),
    confidence DECIMAL(3,2) DEFAULT 1.0,
    notes TEXT,
    comments JSONB DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manual_test_steps_session ON manual_test_steps(session_id);
CREATE INDEX IF NOT EXISTS idx_manual_test_steps_tenant ON manual_test_steps(tenant_id);

-- Persona Dashboards
CREATE TABLE IF NOT EXISTS persona_dashboards (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    persona VARCHAR(20) NOT NULL,
    widgets JSONB NOT NULL DEFAULT '[]',
    default_timeframe VARCHAR(20) NOT NULL DEFAULT 'monthly',
    refresh_interval INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, persona)
);

CREATE INDEX IF NOT EXISTS idx_persona_dashboards_tenant ON persona_dashboards(tenant_id);
