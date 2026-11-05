-- ADAH Phase 6: predefined least-privilege administration roles.
-- Additive and safe to re-run.
INSERT OR IGNORE INTO roles (id, name, description) VALUES
  ('role-admin', 'admin', 'Full administration access'),
  ('role-editor', 'editor', 'Manage published and draft content'),
  ('role-moderator', 'moderator', 'Review ratings and reports'),
  ('role-viewer', 'viewer', 'Read-only administration access');
