-- Manual Session Hub Tables
-- Version: 014
-- Description: Tables for session recordings, exploratory charters, and collaboration

-- Session Recordings
CREATE TABLE IF NOT EXISTS session_recordings (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES quality_sessions(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    stream_url TEXT,
    storage_url TEXT,
    browser_info JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'recording',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_recordings_session ON session_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_session_recordings_tenant ON session_recordings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_session_recordings_status ON session_recordings(status);

-- Exploratory Charters (James Bach style)
CREATE TABLE IF NOT EXISTS exploratory_charters (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES quality_sessions(id) ON DELETE CASCADE,
    explore TEXT NOT NULL,
    with_resources TEXT NOT NULL,
    to_discover TEXT NOT NULL,
    time_box INTEGER NOT NULL,
    notes JSONB DEFAULT '[]',
    debrief JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exploratory_charters_session ON exploratory_charters(session_id);

-- Session Collaborators (for real-time collaboration)
CREATE TABLE IF NOT EXISTS session_collaborators (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES quality_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'collaborator',
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_session_collaborators_session ON session_collaborators(session_id);
CREATE INDEX IF NOT EXISTS idx_session_collaborators_user ON session_collaborators(user_id);

-- Session Events (for activity tracking and collaboration)
CREATE TABLE IF NOT EXISTS session_events (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES quality_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_events_session ON session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_type ON session_events(event_type);
CREATE INDEX IF NOT EXISTS idx_session_events_timestamp ON session_events(timestamp);

-- Test Plan Templates (for scripted testing)
CREATE TABLE IF NOT EXISTS test_plan_templates (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    session_type VARCHAR(30) NOT NULL,
    steps JSONB NOT NULL DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_plan_templates_tenant ON test_plan_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_test_plan_templates_type ON test_plan_templates(session_type);

-- Session Screenshots
CREATE TABLE IF NOT EXISTS session_screenshots (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES quality_sessions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES manual_test_steps(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL,
    storage_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    annotated BOOLEAN DEFAULT FALSE,
    annotations JSONB DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_screenshots_session ON session_screenshots(session_id);
CREATE INDEX IF NOT EXISTS idx_session_screenshots_step ON session_screenshots(step_id);
