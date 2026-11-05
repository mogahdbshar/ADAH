# ADAH staging database status

Updated: 2026-11-06

The owner-created Cloudflare D1 database `adah-staging` is connected to the Pages Functions binding `DB`.

## Applied schema
- `0001_initial.sql`: core content and administration schema.
- `0002_admin_security_foundation.sql`: hashed admin sessions, content revisions, rate-limit buckets and login events.
- `0003_seed_public_catalog.sql`: bilingual categories, the existing 13 tools and the five existing informational pages.

The project-owned migration ledger is `adah_schema_migrations`. The three migration identifiers are recorded there. These migrations were applied directly through the authenticated Cloudflare D1 connection, not through Wrangler. Do not assume Wrangler's internal migration history is synchronized.

## Verified after seeding
- 8 published categories.
- 13 published tools.
- 39 Arabic and 39 English translation records.
- 5 published informational page records.
- SQLite `quick_check` returned `ok`.
- `foreign_key_check` returned no violations.

## Safety boundaries
- This is staging data, not the live production content database.
- The `DB` binding exists on the Pages project. Do not enable visitor-facing writes or administrative operations against it.
- No administrator identity has been enrolled.
- No session, login, role-management or content-write API exists yet.
- Do not expose any administration route until trusted identity verification, authorization, CSRF protection, rate limiting and audit logging are implemented and reviewed.
- No D1 production database has been provisioned.
- No GitHub Actions were run.
- No changes were merged into `main`, and no production deployment was triggered.
