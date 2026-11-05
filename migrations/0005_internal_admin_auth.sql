-- Internal administrator password credentials.
ALTER TABLE admin_users ADD COLUMN password_salt TEXT;
ALTER TABLE admin_users ADD COLUMN password_hash TEXT;
ALTER TABLE admin_users ADD COLUMN password_iterations INTEGER;
CREATE INDEX IF NOT EXISTS idx_admin_users_email_active ON admin_users(email, is_active);
