-- Initialize Shifty Platform Database
-- Multi-tenant SaaS platform for AI-powered testing

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create platform tables
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'starter',
  status VARCHAR(50) DEFAULT 'active',
  region VARCHAR(50) DEFAULT 'us-east-1',
  database_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'member',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  name VARCHAR(100),
  permissions JSONB DEFAULT '{}',
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create test generation requests table
CREATE TABLE IF NOT EXISTS test_generation_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  requirements TEXT NOT NULL,
  test_type VARCHAR(50) DEFAULT 'e2e',
  status VARCHAR(50) DEFAULT 'pending',
  generated_code TEXT,
  validation_result JSONB,
  execution_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create healing attempts table
CREATE TABLE IF NOT EXISTS healing_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  original_selector TEXT NOT NULL,
  healed_selector TEXT,
  success BOOLEAN DEFAULT FALSE,
  strategy VARCHAR(100),
  confidence DECIMAL(5,2),
  execution_time INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add seed user for development/testing
-- Frontend tests expect test@shifty.com to exist
-- Password: password123 (bcrypt hashed: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7n5cWz.jSq)
-- Note: ON CONFLICT DO NOTHING prevents errors if user already exists
INSERT INTO users (id, tenant_id, email, password, first_name, last_name, role)
VALUES (
  '06313bcd-0995-4e3a-8f15-df7eb47fe7ef',  -- Fixed UUID for consistency across environments
  (SELECT id FROM tenants LIMIT 1),
  'test@shifty.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7n5cWz.jSq',
  'Test',
  'User',
  'owner'
) ON CONFLICT (email) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_test_generation_requests_tenant_id ON test_generation_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_test_generation_requests_status ON test_generation_requests(status);
CREATE INDEX IF NOT EXISTS idx_healing_attempts_tenant_id ON healing_attempts(tenant_id);

-- Migration 015 (test orchestration) is automatically executed via docker-entrypoint-initdb.d/002-test-orchestration.sql
-- This migration creates tables required for test orchestration:
--   - test_runs, test_shards, test_results, test_history
--   - healing_events, healing_prs, test_flakiness, test_artifacts

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Insert default system tenant for platform operations
INSERT INTO tenants (id, name, slug, plan, status) 
VALUES ('00000000-0000-0000-0000-000000000000', 'System', 'system', 'system', 'active')
ON CONFLICT (id) DO NOTHING;