# Phase 4 manual verification plan

## Before any Cloudflare resource is created
- [ ] Confirm the current Cloudflare account and Pages project.
- [ ] Confirm the deployed domain and whether production auto-deploy is disabled.
- [ ] Review current free-plan limits for Pages Functions, D1, Access and scheduled Workers.
- [ ] Confirm the project has a non-production environment or create one only after explicit owner authorization.

## D1 migration
- [ ] Apply 0001 then 0002 to a disposable D1 database.
- [ ] Verify all tables, indexes, foreign keys and CHECK constraints.
- [ ] Confirm raw session/CSRF tokens are never stored.
- [ ] Test expired and revoked sessions and ensure they cannot authenticate.
- [ ] Test duplicate content revision numbers and invalid JSON snapshots are rejected.
- [ ] Test rate-limit bucket expiry and bounded counters.

## API and authentication
- [ ] Missing identity assertion fails closed.
- [ ] Client-supplied roles/emails cannot grant admin access.
- [ ] Inactive admins and users without the required role are denied.
- [ ] State-changing requests require valid Origin and CSRF validation.
- [ ] Session cookies are Secure, HttpOnly and SameSite.
- [ ] Rate limits apply to login and public write endpoints.
- [ ] Public API returns published content only.
- [ ] Public error responses do not disclose stack traces or secrets.

## Operations
- [ ] Audit records contain actor, action, entity and request ID, but no secrets.
- [ ] Backup export and restore are tested on non-production.
- [ ] Rollback is tested before production release.
- [ ] No GitHub Actions or production deployment are used as part of these checks.
