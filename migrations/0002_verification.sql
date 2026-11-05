-- ADAH D1 preflight and post-migration verification.
-- Read-only checks. Run against a disposable/staging D1 database after applying
-- 0001_initial.sql followed by 0002_admin_security_foundation.sql.
-- Expected: each schema query returns the named object; integrity_check returns "ok".
-- The final query should return zero rows on a fresh database.

PRAGMA foreign_key_check;
PRAGMA integrity_check;

SELECT name, type
FROM sqlite_master
WHERE type IN ('table','index')
  AND name IN (
    'admin_users',
    'roles',
    'admin_user_roles',
    'admin_sessions',
    'content_revisions',
    'rate_limit_buckets',
    'admin_login_events',
    'audit_logs',
    'idx_admin_sessions_user_expiry',
    'idx_admin_sessions_expiry',
    'idx_content_revisions_entity',
    'idx_rate_limit_expiry',
    'idx_admin_login_events_created'
  )
ORDER BY type, name;

-- Constraint probes. Each statement is intentionally isolated and should fail
-- with a CHECK/UNIQUE/FOREIGN KEY constraint error. Use a disposable database.
-- 1) Invalid session hash length:
-- INSERT INTO admin_sessions
--   (id, admin_user_id, session_token_hash, csrf_token_hash, expires_at)
-- VALUES ('probe', 'missing-admin', 'short', 'x', '2099-01-01T00:00:00Z');
--
-- 2) Invalid revision type/number/JSON:
-- INSERT INTO content_revisions
--   (id, entity_type, entity_id, revision_number, snapshot_json)
-- VALUES ('probe', 'unknown', 'x', 0, '{bad json');
--
-- 3) Negative rate counter:
-- INSERT INTO rate_limit_buckets
--   (bucket_key_hash, window_started_at, request_count, expires_at)
-- VALUES ('probe', 1, -1, 2);
--
-- 4) Invalid login outcome:
-- INSERT INTO admin_login_events (id, subject_hash, outcome)
-- VALUES ('probe', 'hash', 'allowed');

-- Verify no test/probe rows remain after disposable constraint tests.
SELECT 'admin_sessions' AS table_name, COUNT(*) AS probe_rows
FROM admin_sessions WHERE id = 'probe'
UNION ALL
SELECT 'content_revisions', COUNT(*)
FROM content_revisions WHERE id = 'probe'
UNION ALL
SELECT 'rate_limit_buckets', COUNT(*)
FROM rate_limit_buckets WHERE bucket_key_hash = 'probe'
UNION ALL
SELECT 'admin_login_events', COUNT(*)
FROM admin_login_events WHERE id = 'probe';
