-- Enterprise Features Migration
-- Adds support for GPU provisioning, model registry, data lifecycle, and HITL arcade

-- ==================== GPU Provisioner Tables ====================

CREATE TABLE IF NOT EXISTS gpu_instances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  vastai_instance_id VARCHAR(100),
  config JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  ip_address INET,
  ssh_port INTEGER,
  model_endpoint TEXT,
  cost_accrued DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  terminated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gpu_instances_tenant_id ON gpu_instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gpu_instances_status ON gpu_instances(status);
CREATE INDEX IF NOT EXISTS idx_gpu_instances_vastai_id ON gpu_instances(vastai_instance_id);

-- ==================== Model Registry Tables ====================

CREATE TABLE IF NOT EXISTS tenant_models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  source VARCHAR(50) NOT NULL, -- huggingface, ollama, custom, s3
  source_id TEXT NOT NULL,
  version VARCHAR(50) DEFAULT '1.0.0',
  status VARCHAR(50) DEFAULT 'pending',
  config JSONB NOT NULL,
  deployed_instance_id UUID REFERENCES gpu_instances(id) ON DELETE SET NULL,
  checkpoint_path TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deployed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenant_models_tenant_id ON tenant_models(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_models_status ON tenant_models(status);
CREATE INDEX IF NOT EXISTS idx_tenant_models_source ON tenant_models(source);

CREATE TABLE IF NOT EXISTS training_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  config JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'queued',
  gpu_instance_id UUID REFERENCES gpu_instances(id) ON DELETE SET NULL,
  progress JSONB DEFAULT '{}',
  output_model_id UUID REFERENCES tenant_models(id) ON DELETE SET NULL,
  logs JSONB DEFAULT '[]',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_training_jobs_tenant_id ON training_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON training_jobs(status);

CREATE TABLE IF NOT EXISTS model_evaluations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  model_id UUID REFERENCES tenant_models(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  evaluation_type VARCHAR(50) NOT NULL, -- automated, human, benchmark
  metrics JSONB NOT NULL,
  test_dataset_id UUID,
  sample_results JSONB DEFAULT '[]',
  approved BOOLEAN,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_model_evaluations_model_id ON model_evaluations(model_id);
CREATE INDEX IF NOT EXISTS idx_model_evaluations_tenant_id ON model_evaluations(tenant_id);

-- ==================== Data Lifecycle Tables ====================

CREATE TABLE IF NOT EXISTS retention_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  data_classifications JSONB NOT NULL,
  retention_days INTEGER NOT NULL,
  auto_delete BOOLEAN DEFAULT TRUE,
  archive_before_delete BOOLEAN DEFAULT FALSE,
  archive_location TEXT,
  notify_before_deletion BOOLEAN DEFAULT TRUE,
  notification_days_before_deletion INTEGER DEFAULT 7,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_retention_policies_tenant_id ON retention_policies(tenant_id);

CREATE TABLE IF NOT EXISTS data_assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL, -- dataset, model_weights, etc.
  name VARCHAR(255) NOT NULL,
  classification VARCHAR(50) NOT NULL, -- public, internal, confidential, etc.
  status VARCHAR(50) DEFAULT 'active',
  storage_location TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  checksum VARCHAR(64) NOT NULL,
  retention_policy_id UUID REFERENCES retention_policies(id) ON DELETE SET NULL,
  expires_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_assets_tenant_id ON data_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_data_assets_type ON data_assets(type);
CREATE INDEX IF NOT EXISTS idx_data_assets_classification ON data_assets(classification);
CREATE INDEX IF NOT EXISTS idx_data_assets_status ON data_assets(status);
CREATE INDEX IF NOT EXISTS idx_data_assets_expires_at ON data_assets(expires_at);

CREATE TABLE IF NOT EXISTS deletion_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  asset_ids JSONB NOT NULL,
  method VARCHAR(50) NOT NULL, -- standard, secure_overwrite, cryptographic_erase, etc.
  status VARCHAR(50) DEFAULT 'pending',
  reason TEXT NOT NULL,
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verification_proof JSONB,
  deletion_log JSONB DEFAULT '[]',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deletion_jobs_tenant_id ON deletion_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deletion_jobs_status ON deletion_jobs(status);

CREATE TABLE IF NOT EXISTS deletion_certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  deletion_job_id UUID REFERENCES deletion_jobs(id) ON DELETE CASCADE NOT NULL,
  asset_summary JSONB NOT NULL,
  deletion_method VARCHAR(50) NOT NULL,
  verification_details JSONB NOT NULL,
  compliance_standards JSONB NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  signature_hash VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deletion_certificates_tenant_id ON deletion_certificates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deletion_certificates_job_id ON deletion_certificates(deletion_job_id);

CREATE TABLE IF NOT EXISTS disposable_workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL, -- training, inference, evaluation
  gpu_instance_id UUID REFERENCES gpu_instances(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'creating',
  storage_location TEXT NOT NULL,
  size_allocated_bytes BIGINT NOT NULL,
  size_used_bytes BIGINT DEFAULT 0,
  data_assets JSONB DEFAULT '[]',
  auto_destroy_after_minutes INTEGER DEFAULT 60,
  destroy_on_completion BOOLEAN DEFAULT TRUE,
  secure_wipe_on_destroy BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  destroyed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_disposable_workspaces_tenant_id ON disposable_workspaces(tenant_id);
CREATE INDEX IF NOT EXISTS idx_disposable_workspaces_status ON disposable_workspaces(status);
CREATE INDEX IF NOT EXISTS idx_disposable_workspaces_expires_at ON disposable_workspaces(expires_at);

CREATE TABLE IF NOT EXISTS data_access_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES data_assets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  action VARCHAR(50) NOT NULL, -- view, download, modify, delete, share, export
  ip_address INET NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_access_logs_tenant_id ON data_access_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_asset_id ON data_access_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_timestamp ON data_access_logs(timestamp);

CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  summary JSONB NOT NULL,
  details JSONB DEFAULT '{}',
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  generated_by UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_tenant_id ON compliance_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON compliance_reports(report_type);

-- ==================== HITL Arcade Tables ====================

CREATE TABLE IF NOT EXISTS arcade_profiles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 100,
  coins INTEGER DEFAULT 100,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_missions_completed INTEGER DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  accuracy DECIMAL(5,4) DEFAULT 0,
  expertise_areas JSONB DEFAULT '[]',
  badges JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_arcade_profiles_tenant_id ON arcade_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_arcade_profiles_level ON arcade_profiles(level);
CREATE INDEX IF NOT EXISTS idx_arcade_profiles_xp ON arcade_profiles(total_xp_earned);

CREATE TABLE IF NOT EXISTS arcade_missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL, -- label_test_output, validate_selector, etc.
  difficulty VARCHAR(20) NOT NULL, -- beginner, intermediate, advanced, expert
  status VARCHAR(20) DEFAULT 'available',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,
  coin_reward INTEGER DEFAULT 0,
  time_estimate_minutes INTEGER NOT NULL,
  expires_at TIMESTAMP,
  required_skill_level INTEGER DEFAULT 1,
  payload JSONB NOT NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP,
  result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_arcade_missions_tenant_id ON arcade_missions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_arcade_missions_status ON arcade_missions(status);
CREATE INDEX IF NOT EXISTS idx_arcade_missions_type ON arcade_missions(type);
CREATE INDEX IF NOT EXISTS idx_arcade_missions_assigned_to ON arcade_missions(assigned_to);

CREATE TABLE IF NOT EXISTS mission_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  mission_id UUID REFERENCES arcade_missions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  type VARCHAR(50) NOT NULL,
  input JSONB NOT NULL,
  output JSONB NOT NULL,
  user_response JSONB NOT NULL,
  agreement_score DECIMAL(5,4),
  used_for_training BOOLEAN DEFAULT FALSE,
  dataset_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mission_feedback_tenant_id ON mission_feedback(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mission_feedback_mission_id ON mission_feedback(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_feedback_used_for_training ON mission_feedback(used_for_training);

CREATE TABLE IF NOT EXISTS hitl_datasets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  mission_type VARCHAR(50) NOT NULL,
  sample_count INTEGER DEFAULT 0,
  quality_score DECIMAL(5,4),
  status VARCHAR(50) DEFAULT 'collecting',
  min_agreement_threshold DECIMAL(5,4) DEFAULT 0.8,
  reviews_per_sample INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hitl_datasets_tenant_id ON hitl_datasets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hitl_datasets_status ON hitl_datasets(status);

-- Add foreign key for dataset_id in mission_feedback
ALTER TABLE mission_feedback 
  ADD CONSTRAINT fk_mission_feedback_dataset 
  FOREIGN KEY (dataset_id) REFERENCES hitl_datasets(id) ON DELETE SET NULL;

-- ==================== Comments for Documentation ====================

COMMENT ON TABLE gpu_instances IS 'Tracks vast.ai GPU instances provisioned for each tenant';
COMMENT ON TABLE tenant_models IS 'Registry of AI models (HuggingFace, Ollama, custom) per tenant';
COMMENT ON TABLE training_jobs IS 'Training job records with progress tracking';
COMMENT ON TABLE model_evaluations IS 'Model evaluation results and approval status';
COMMENT ON TABLE retention_policies IS 'Data retention policies per tenant';
COMMENT ON TABLE data_assets IS 'Tracked data assets with lifecycle management';
COMMENT ON TABLE deletion_jobs IS 'Secure deletion job tracking with verification';
COMMENT ON TABLE deletion_certificates IS 'Cryptographic certificates for data destruction compliance';
COMMENT ON TABLE disposable_workspaces IS 'Temporary workspaces that auto-destroy after use';
COMMENT ON TABLE data_access_logs IS 'Audit trail for data access events';
COMMENT ON TABLE arcade_profiles IS 'Gamified user profiles for HITL validation';
COMMENT ON TABLE arcade_missions IS 'Missions/tasks for human validators';
COMMENT ON TABLE mission_feedback IS 'User feedback that feeds into training datasets';
COMMENT ON TABLE hitl_datasets IS 'Curated datasets from HITL feedback';
