-- Performance Testing Tables
-- Version: 011
-- Description: Tables for performance test configurations, runs, and results

-- Performance Test Configurations
CREATE TABLE IF NOT EXISTS performance_test_configs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    test_type VARCHAR(30) NOT NULL,
    target_url TEXT NOT NULL,
    virtual_users INTEGER NOT NULL,
    ramp_up_seconds INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    thresholds JSONB NOT NULL,
    scenarios JSONB NOT NULL DEFAULT '[]',
    schedule JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perf_configs_tenant ON performance_test_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_perf_configs_type ON performance_test_configs(test_type);

-- Performance Test Runs
CREATE TABLE IF NOT EXISTS performance_test_runs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    config_id UUID NOT NULL REFERENCES performance_test_configs(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    results JSONB,
    threshold_results JSONB,
    passed BOOLEAN,
    failure_reason TEXT,
    report_url TEXT,
    metrics_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_perf_runs_tenant ON performance_test_runs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_perf_runs_config ON performance_test_runs(config_id);
CREATE INDEX IF NOT EXISTS idx_perf_runs_status ON performance_test_runs(status);
CREATE INDEX IF NOT EXISTS idx_perf_runs_created ON performance_test_runs(created_at);
