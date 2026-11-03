# ADAH platform architecture

Status: implementation blueprint, not a claim that external services are connected.

## Current delivery model
- Public site: Cloudflare Pages static assets.
- Browser code: HTML, CSS and JavaScript. Existing stack is retained; no framework migration is introduced.
- Future server-side API: Cloudflare Pages Functions / Workers.
- Future database: Cloudflare D1.
- Future object storage: Cloudflare R2, only when resource uploads are implemented.
- GitHub is source control. GitHub Actions remain unused.
- Production deployment is manual and requires owner approval.

## Boundaries
1. Public pages must never contain credentials, API tokens, database secrets, admin passwords or private diagnostics.
2. Browser storage is limited to non-sensitive preferences, favorites and history. These remain local.
3. Public API routes expose only published content and deliberately public status information.
4. Admin operations require server-side authentication, authorization and audit logging. Hiding an admin link is not access control.
5. File uploads require type/size validation, safe object keys, malware/safety review and access rules before being enabled.
6. Analytics must be privacy-minimizing and must not store raw sensitive input from tools.

## Deployment gates
- Static Pages deployment must remain separate from production until preview review.
- Pages auto-deploy must be verified disabled before any Git push intended only as source storage.
- D1 bindings, secrets, Access policies and R2 buckets are account-level manual configuration gates.
- Never create a production admin route that accepts an unverified shared password or trusts client-supplied roles.
- No production deployment until the owner explicitly approves it.

## Repository structure target
The current repository is a small static site. Preserve its existing root pages and assets. Add only well-scoped folders:
- `docs/`: architecture, operations, security and content standards.
- `migrations/`: ordered D1 SQL migrations.
- `functions/api/`: Pages Functions API routes, added only with tested bindings and auth.
- `assets/`: curated visual assets where needed.

Do not reorganize the existing site wholesale until the full repository inventory and link checks are complete.
