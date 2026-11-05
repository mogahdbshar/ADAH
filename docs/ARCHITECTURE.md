# ADAH platform architecture

Status: implementation blueprint, not a claim that external services are connected.

## Current delivery model
- Public site: Cloudflare Pages static assets.
- Browser code: HTML, CSS and JavaScript. Existing stack is retained; no framework migration is introduced.
- Future server-side API: Cloudflare Pages Functions / Workers.
- Database: Cloudflare D1 staging database `adah-staging`, connected to Pages Functions through the `DB` binding. The two initial schema migrations are applied and verified on staging. No API route has been deployed or connected to visitor traffic.
- Future object storage: Cloudflare R2, only when resource uploads are implemented.
- GitHub is source control. GitHub Actions remain unused.
- Cloudflare Pages production auto-deploy is currently enabled for `main`. Feature-branch commits create Preview deployments; merging to `main` can publish to production.
- Production changes require explicit owner approval.

## Boundaries
1. Public pages must never contain credentials, API tokens, database secrets, admin passwords or private diagnostics.
2. Browser storage is limited to non-sensitive preferences, favorites and history. These remain local.
3. Public API routes expose only published content and deliberately public status information.
4. Admin operations require server-side authentication, authorization and audit logging. Hiding an admin link is not access control.
5. File uploads require type/size validation, safe object keys, malware/safety review and access rules before being enabled.
6. Analytics must be privacy-minimizing and must not store raw sensitive input from tools.

## Deployment gates
- Use feature-branch Preview deployments for review; do not merge to `main` without explicit owner approval.
- Do not change the production branch or auto-deploy settings without explicit owner approval.
- D1 production database, secrets, Access policies and R2 buckets are account-level configuration gates. The current `DB` binding points to staging and must not be treated as production data storage.
- Never create a production admin route that accepts an unverified shared password or trusts client-supplied roles.
- No production deployment until the owner explicitly approves it.

## Repository structure target
The current repository is a small static site. Preserve its existing root pages and assets. Add only well-scoped folders:
- `docs/`: architecture, operations, security and content standards.
- `migrations/`: ordered D1 SQL migrations.
- `functions/api/`: Pages Functions API routes, added only with tested bindings and auth.
- `assets/`: curated visual assets where needed.

Do not reorganize the existing site wholesale until the full repository inventory and link checks are complete.
