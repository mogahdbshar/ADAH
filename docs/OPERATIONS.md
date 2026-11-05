# ADAH operations

## Verified deployment state
- Cloudflare Pages project: `adah`.
- Repository: `mogahdbshar/ADAH`; production branch: `main`.
- Automatic deployments from `main` are enabled.
- Production D1 binding `DB` points to `adah-staging`; Preview also has the same binding for verification.
- Production API health and Arabic/English catalogue endpoints were checked after deployment.
- Cloudflare Access is not enabled for this account yet. Admin API routes reject anonymous requests. No administrator has been enrolled.
- GitHub Actions are not used.

## Administration activation gate
1. Enable Cloudflare Access in the account's Zero Trust dashboard.
2. Create an owner-only self-hosted Access application protecting `/admin.html` and `/api/admin/*` on `adah.pages.dev`.
3. Require MFA and configure the exact owner identity in the allow policy.
4. Set Pages runtime variables `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, and `ADMIN_EMAIL_ALLOWLIST`.
5. Confirm the `DB` target and take an independent backup before using the one-time administrator bootstrap.
6. Verify admin session, role restrictions, audit log and content revision history.

## Release safety
Merging to `main` triggers automatic production deployment. Review the exact diff and verify Preview first. Do not run GitHub Actions.

## Backups
D1 Time Travel is useful for short-window recovery but is not an independent backup. Export the database before major schema/content changes, encrypt exports outside the public repository, and test restoration into a non-production target.

## Owner-only actions
Ask the owner only for Access enablement, owner identity/MFA enrollment, domain verification, or account settings that cannot be completed through connected tools. Never request passwords, MFA codes or API tokens in chat.
