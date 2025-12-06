-- Security Testing Tables
-- Version: 012
-- Description: Tables for security scans, vulnerabilities, and findings

-- Security Scan Configurations
CREATE TABLE IF NOT EXISTS security_scan_configs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    scan_type VARCHAR(30) NOT NULL,
    target JSONB NOT NULL,
    authentication JSONB DEFAULT '{}',
    settings JSONB NOT NULL,
    thresholds JSONB NOT NULL,
    schedule JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sec_configs_tenant ON security_scan_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sec_configs_type ON security_scan_configs(scan_type);

-- Security Scan Runs
CREATE TABLE IF NOT EXISTS security_scan_runs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    config_id UUID NOT NULL REFERENCES security_scan_configs(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    summary JSONB,
    passed BOOLEAN,
    failure_reason TEXT,
    report_url TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sec_runs_tenant ON security_scan_runs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sec_runs_config ON security_scan_runs(config_id);
CREATE INDEX IF NOT EXISTS idx_sec_runs_status ON security_scan_runs(status);

-- Vulnerabilities
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id UUID PRIMARY KEY,
    scan_id UUID NOT NULL REFERENCES security_scan_runs(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location JSONB NOT NULL,
    cwe_id VARCHAR(20),
    cve_id VARCHAR(30),
    cvss_score DECIMAL(3,1),
    remediation TEXT,
    references JSONB DEFAULT '[]',
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    assigned_to UUID,
    evidence JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vulns_scan ON vulnerabilities(scan_id);
CREATE INDEX IF NOT EXISTS idx_vulns_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_vulns_status ON vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_vulns_type ON vulnerabilities(type);
CREATE INDEX IF NOT EXISTS idx_vulns_cve ON vulnerabilities(cve_id);
