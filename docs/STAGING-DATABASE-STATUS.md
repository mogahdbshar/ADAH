# ADAH database status

Updated: 2026-11-06

Cloudflare D1 database `adah-staging` is connected through the Pages binding `DB`. The Cloudflare Pages project currently exposes that binding in its production environment.

## Applied schema and data
- `0001_initial.sql`: core schema.
- `0002_admin_security_foundation.sql`: admin sessions, revisions, rate-limit buckets and login events.
- `0003_seed_public_catalog.sql`: bilingual catalogue seed, applied directly to D1.
- `0004_admin_roles.sql`: least-privilege admin, editor, moderator and viewer roles.

Verified records: 8 published categories, 13 published tools, 39 Arabic translations, 39 English translations and 5 published pages. SQLite `quick_check` returned `ok`; `foreign_key_check` returned no violations.

The project-owned ledger is `adah_schema_migrations`. These migrations were applied through the authenticated Cloudflare D1 API, not Wrangler. Wrangler's internal migration history is not assumed to be synchronized.

## Administration status
The four role records exist, but no administrator has been enrolled. The new API validates Cloudflare Access JWT signatures, issuer, audience, expiry, subject and exact email allowlist, then checks active D1 membership and role. Access application policy and runtime variables remain owner configuration tasks. Admin routes deny access when configuration is missing.

## Important deployment boundary
Automatic Pages deployment from `main` is enabled. The production Pages binding currently points to the database named `adah-staging`. Confirm that this is the intended database before enabling administrator enrollment or live content editing.

No GitHub Actions were run during this phase.
