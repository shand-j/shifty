-- Accessibility Testing Tables
-- Version: 013
-- Description: Tables for accessibility scans, issues, and WCAG compliance

-- Accessibility Scan Configurations
CREATE TABLE IF NOT EXISTS accessibility_scan_configs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_urls JSONB NOT NULL,
    standard VARCHAR(20) NOT NULL,
    viewport JSONB DEFAULT '{"width": 1280, "height": 720}',
    settings JSONB NOT NULL,
    thresholds JSONB NOT NULL,
    schedule JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_a11y_configs_tenant ON accessibility_scan_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_a11y_configs_standard ON accessibility_scan_configs(standard);

-- Accessibility Scan Runs
CREATE TABLE IF NOT EXISTS accessibility_scan_runs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    config_id UUID NOT NULL REFERENCES accessibility_scan_configs(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    summary JSONB,
    passed BOOLEAN,
    failure_reason TEXT,
    report_url TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_a11y_runs_tenant ON accessibility_scan_runs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_a11y_runs_config ON accessibility_scan_runs(config_id);
CREATE INDEX IF NOT EXISTS idx_a11y_runs_status ON accessibility_scan_runs(status);

-- Accessibility Issues
CREATE TABLE IF NOT EXISTS accessibility_issues (
    id UUID PRIMARY KEY,
    scan_id UUID NOT NULL REFERENCES accessibility_scan_runs(id) ON DELETE CASCADE,
    rule_id VARCHAR(100) NOT NULL,
    impact VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    help TEXT NOT NULL,
    help_url TEXT NOT NULL,
    wcag_tags JSONB NOT NULL DEFAULT '[]',
    wcag_criteria JSONB NOT NULL DEFAULT '[]',
    target TEXT NOT NULL,
    html TEXT NOT NULL,
    url TEXT NOT NULL,
    fix_suggestions JSONB DEFAULT '[]',
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_a11y_issues_scan ON accessibility_issues(scan_id);
CREATE INDEX IF NOT EXISTS idx_a11y_issues_impact ON accessibility_issues(impact);
CREATE INDEX IF NOT EXISTS idx_a11y_issues_status ON accessibility_issues(status);
CREATE INDEX IF NOT EXISTS idx_a11y_issues_rule ON accessibility_issues(rule_id);
