# ADAH API

All endpoints are Cloudflare Pages Functions and use the `DB` D1 binding.

## Public read endpoints

- `GET /api/health`: minimal D1 readiness check.
- `GET /api/catalog?lang=ar|en&limit=50&offset=0`: published categories and tools only. Arabic is the default; limit is capped at 100.

## Protected administration endpoints

Every route below requires a valid Cloudflare Access JWT, exact owner email allowlisting, an active matching `admin_users.external_subject` record and an assigned role. Missing configuration denies access.

- `GET /api/admin/session`: verified administrator identity and roles.
- `POST /api/admin/bootstrap`: one-time first-admin enrollment, only while the administrator table is empty.
- `GET /api/admin/overview`: content and moderation counts.
- `GET /api/admin/content`: tools, categories, pages and translations.
- `PATCH /api/admin/content`: bounded status, category, ordering and translation edits. Each edit records a revision snapshot and audit event.
- `GET /api/admin/moderation`: pending ratings and active reports.
- `PATCH /api/admin/moderation`: approve/reject ratings and progress/resolve/dismiss reports.

No password login, browser-trusted roles, arbitrary SQL endpoint, public content-write route or file upload exists.

## Security properties

- Access JWT signatures are verified using RS256 and the team's published public keys.
- Issuer, audience, expiration, subject and exact email allowlist are checked.
- Admin membership and role are resolved from D1 on every request.
- Mutations require same-origin JSON requests.
- Errors are generic and responses are not cached.
- Content revisions and audit records are stored server-side.

See `ADMIN-ACCESS-SETUP.md` before administrator enrollment. The current production Pages binding points to `adah-staging`; confirm the intended database and backup plan before enabling administration.
