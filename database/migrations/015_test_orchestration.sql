-- Test Orchestration & Autonomous Healing
-- Database schema for Currents-style test orchestration with AI healing

-- Test runs table (orchestrated test executions)
CREATE TABLE IF NOT EXISTS test_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID,
  branch VARCHAR(255),
  commit_sha VARCHAR(40),
  status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed, cancelled
  total_tests INTEGER DEFAULT 0,
  passed_tests INTEGER DEFAULT 0,
  failed_tests INTEGER DEFAULT 0,
  skipped_tests INTEGER DEFAULT 0,
  flaky_tests INTEGER DEFAULT 0,
  duration_ms INTEGER,
  worker_count INTEGER DEFAULT 1,
  shard_strategy VARCHAR(50) DEFAULT 'duration-aware', -- duration-aware, round-robin, manual
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Test results table (individual test execution results)
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  test_file VARCHAR(500) NOT NULL,
  test_name VARCHAR(500) NOT NULL,
  test_title TEXT,
  shard_index INTEGER,
  worker_id VARCHAR(100),
  status VARCHAR(50) NOT NULL, -- passed, failed, skipped, flaky
  duration_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  final_status VARCHAR(50), -- final status after retries
  error_message TEXT,
  error_stack TEXT,
  trace_url TEXT,
  screenshot_url TEXT,
  video_url TEXT,
  healing_attempted BOOLEAN DEFAULT FALSE,
  healing_succeeded BOOLEAN DEFAULT FALSE,
  healing_confidence DECIMAL(5,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test history table (aggregated test performance over time)
CREATE TABLE IF NOT EXISTS test_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID,
  test_file VARCHAR(500) NOT NULL,
  test_name VARCHAR(500) NOT NULL,
  total_runs INTEGER DEFAULT 0,
  passed_runs INTEGER DEFAULT 0,
  failed_runs INTEGER DEFAULT 0,
  flaky_runs INTEGER DEFAULT 0,
  p50_duration_ms INTEGER,
  p95_duration_ms INTEGER,
  p99_duration_ms INTEGER,
  avg_duration_ms INTEGER,
  flakiness_rate DECIMAL(5,2) DEFAULT 0.00,
  last_run_at TIMESTAMP,
  last_passed_at TIMESTAMP,
  last_failed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, project_id, test_file, test_name)
);

-- Healing events table (autonomous healing during test execution)
CREATE TABLE IF NOT EXISTS healing_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  result_id UUID REFERENCES test_results(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  test_file VARCHAR(500) NOT NULL,
  test_name VARCHAR(500) NOT NULL,
  original_selector TEXT NOT NULL,
  healed_selector TEXT,
  strategy VARCHAR(100),
  confidence DECIMAL(5,2),
  success BOOLEAN DEFAULT FALSE,
  execution_time_ms INTEGER,
  retry_number INTEGER DEFAULT 1,
  error_message TEXT,
  page_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Healing PRs table (automated pull requests for healed selectors)
CREATE TABLE IF NOT EXISTS healing_prs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID,
  repository VARCHAR(500),
  branch_name VARCHAR(255),
  pr_number INTEGER,
  pr_url TEXT,
  pr_status VARCHAR(50), -- open, merged, closed
  healing_count INTEGER DEFAULT 0,
  avg_confidence DECIMAL(5,2),
  healing_event_ids JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  merged_at TIMESTAMP,
  closed_at TIMESTAMP
);

-- Test flakiness tracking (for flakiness detection service)
CREATE TABLE IF NOT EXISTS test_flakiness (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID,
  test_file VARCHAR(500) NOT NULL,
  test_name VARCHAR(500) NOT NULL,
  flakiness_rate DECIMAL(5,2) DEFAULT 0.00,
  flaky_runs INTEGER DEFAULT 0,
  total_runs INTEGER DEFAULT 0,
  last_flaky_at TIMESTAMP,
  detection_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, project_id, test_file, test_name, detection_date)
);

-- Test shards table (for tracking shard assignments)
CREATE TABLE IF NOT EXISTS test_shards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  shard_index INTEGER NOT NULL,
  worker_id VARCHAR(100),
  test_files JSONB DEFAULT '[]',
  estimated_duration_ms INTEGER,
  actual_duration_ms INTEGER,
  status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artifact storage tracking
CREATE TABLE IF NOT EXISTS test_artifacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
  result_id UUID REFERENCES test_results(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  artifact_type VARCHAR(50) NOT NULL, -- trace, screenshot, video, log
  storage_key TEXT NOT NULL,
  url TEXT,
  size_bytes BIGINT,
  retention_days INTEGER DEFAULT 30,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_runs_tenant_id ON test_runs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_project_id ON test_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
CREATE INDEX IF NOT EXISTS idx_test_runs_branch ON test_runs(branch);
CREATE INDEX IF NOT EXISTS idx_test_runs_created_at ON test_runs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_test_results_run_id ON test_results(run_id);
CREATE INDEX IF NOT EXISTS idx_test_results_tenant_id ON test_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(status);
CREATE INDEX IF NOT EXISTS idx_test_results_test_file ON test_results(test_file);

CREATE INDEX IF NOT EXISTS idx_test_history_tenant_id ON test_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_test_history_project_id ON test_history(project_id);
CREATE INDEX IF NOT EXISTS idx_test_history_flakiness_rate ON test_history(flakiness_rate DESC);
CREATE INDEX IF NOT EXISTS idx_test_history_last_run_at ON test_history(last_run_at DESC);

CREATE INDEX IF NOT EXISTS idx_healing_events_run_id ON healing_events(run_id);
CREATE INDEX IF NOT EXISTS idx_healing_events_result_id ON healing_events(result_id);
CREATE INDEX IF NOT EXISTS idx_healing_events_tenant_id ON healing_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_healing_events_confidence ON healing_events(confidence DESC);

CREATE INDEX IF NOT EXISTS idx_healing_prs_run_id ON healing_prs(run_id);
CREATE INDEX IF NOT EXISTS idx_healing_prs_tenant_id ON healing_prs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_healing_prs_pr_status ON healing_prs(pr_status);

CREATE INDEX IF NOT EXISTS idx_test_flakiness_tenant_id ON test_flakiness(tenant_id);
CREATE INDEX IF NOT EXISTS idx_test_flakiness_project_id ON test_flakiness(project_id);
CREATE INDEX IF NOT EXISTS idx_test_flakiness_rate ON test_flakiness(flakiness_rate DESC);

CREATE INDEX IF NOT EXISTS idx_test_shards_run_id ON test_shards(run_id);
CREATE INDEX IF NOT EXISTS idx_test_shards_status ON test_shards(status);

CREATE INDEX IF NOT EXISTS idx_test_artifacts_run_id ON test_artifacts(run_id);
CREATE INDEX IF NOT EXISTS idx_test_artifacts_result_id ON test_artifacts(result_id);
CREATE INDEX IF NOT EXISTS idx_test_artifacts_tenant_id ON test_artifacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_test_artifacts_expires_at ON test_artifacts(expires_at);
