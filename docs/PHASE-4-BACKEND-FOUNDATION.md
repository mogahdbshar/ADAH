# Phase 4: backend and administration foundation

Status: repository preparation only. No Cloudflare account resource has been created or connected.

## Confirmed repository state
- The public site remains a static Cloudflare Pages project.
- `migrations/0001_initial.sql` defines the first D1 content model but has not been applied to a live database.
- GitHub Actions are not used.
- No Pages Functions API, D1 binding, R2 bucket, Access application, authentication provider or admin session service is currently configured.

## Phase 4 sequence
1. Verify the owner's Cloudflare account, current Pages project, domain binding and plan limits.
2. Verify that Pages production auto-deploy is disabled before source-only pushes.
3. Provision a non-production D1 database only after account access and free-tier limits are confirmed.
4. Apply migrations in order to the non-production database and verify constraints/indexes.
5. Select an authentication perimeter compatible with the owner's account and domain. Cloudflare Access may be an outer layer, but application authorization remains mandatory.
6. Implement server-verified admin sessions, role checks, CSRF protection, rate limits and audit logging in Pages Functions/Workers.
7. Implement read-only public content APIs first. Add write routes only after authentication and authorization tests pass.
8. Build the admin interface against the protected API, not browser-only role flags or localStorage.
9. Test backup/restore, rollback, abuse controls and privacy behavior before any production connection.
10. Obtain explicit owner approval before production deployment.

## Security design requirements
- Store only hashes of opaque session and CSRF tokens. Never persist raw bearer tokens.
- Session cookies must be Secure, HttpOnly and SameSite with bounded expiry.
- Validate request Origin/Host and CSRF tokens on state-changing routes.
- Resolve the admin identity from a trusted server-verified identity assertion, never from a client-provided email or role.
- Check active user and role on every privileged operation.
- Record privileged actions in audit logs without secrets or submitted private content.
- Rate-limit login and public write endpoints with privacy-minimizing keys.
- Fail closed if identity, D1 binding, session validation or role lookup is unavailable.

## Migration notes
- `0002_admin_security_foundation.sql` is additive and assumes `0001_initial.sql` has already been applied.
- It adds hashed admin sessions, content revision snapshots, rate-limit buckets and coarse login events.
- The migration has not been applied to D1. SQL compatibility must be checked against the actual D1 runtime before use.
- Session cleanup requires a future scheduled Worker; no cron has been configured.

## Owner-only setup gate
The next external step requires the owner to sign in to Cloudflare and confirm the current Pages project and account plan. Do not request passwords, API tokens or MFA codes in chat. Use a supported, least-privilege connection if available; otherwise provide exact dashboard steps at that stage.
