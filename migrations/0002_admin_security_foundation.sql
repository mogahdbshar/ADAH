-- ADAH Phase 4: server-side administration foundations.
-- Apply only to a newly provisioned D1 database after reviewing 0001_initial.sql.
-- This migration is intentionally additive and stores only hashes for session/CSRF secrets.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL UNIQUE,
  csrf_token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  CHECK (length(session_token_hash) = 64),
  CHECK (length(csrf_token_hash) = 64)
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_expiry
  ON admin_sessions(admin_user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry
  ON admin_sessions(expires_at, revoked_at);

CREATE TABLE IF NOT EXISTS content_revisions (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('tool','page','article','news','service','resource','category','setting')),
  entity_id TEXT NOT NULL,
  revision_number INTEGER NOT NULL CHECK (revision_number > 0),
  snapshot_json TEXT NOT NULL CHECK (json_valid(snapshot_json)),
  change_note TEXT,
  created_by TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, entity_id, revision_number)
);

CREATE INDEX IF NOT EXISTS idx_content_revisions_entity
  ON content_revisions(entity_type, entity_id, revision_number DESC);

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key_hash TEXT PRIMARY KEY,
  window_started_at INTEGER NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_expiry
  ON rate_limit_buckets(expires_at);

CREATE TABLE IF NOT EXISTS admin_login_events (
  id TEXT PRIMARY KEY,
  subject_hash TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('success','denied','expired','revoked')),
  coarse_reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_login_events_created
  ON admin_login_events(created_at);

-- Prevent accidentally retaining expired/revoked session rows forever.
-- Cleanup is scheduled by a future Worker cron only after it is configured and tested.
