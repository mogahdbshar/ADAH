# ADAH staging database status

Updated: 2026-11-06

Cloudflare D1 database `adah-staging` is connected to Pages Functions using binding `DB`.

## Verified staging data
- 8 published categories.
- 13 published tools.
- 39 Arabic and 39 English translation records.
- 5 published informational pages.
- Migration ledger: `0001_initial.sql`, `0002_admin_security_foundation.sql`, and `0003_seed_public_catalog.sql`.
- SQLite `PRAGMA quick_check`: `ok`.
- SQLite `PRAGMA foreign_key_check`: no violations.

## API boundary
The read-only API endpoints in `functions/api/` use this staging binding. No admin login, session, write, upload or publishing endpoints are implemented. No administrator has been enrolled. Do not expose write or administration features until trusted identity, authorization, CSRF, rate limits and audit logging have been implemented and reviewed.

Migrations were applied through the authenticated Cloudflare D1 API and recorded in the project-owned `adah_schema_migrations` ledger. Wrangler's internal migration history is not assumed to be synchronized.

No GitHub Actions were run. Production database and production content remain separate and untouched.
