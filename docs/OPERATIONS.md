# ADAH operations

## Verified deployment architecture
- Cloudflare Pages project: `adah`; production branch: `main`.
- Repository: `mogahdbshar/ADAH`.
- Production domain: `https://adah.pages.dev`.
- Production D1 binding `DB` points to database `adah-staging`; Preview currently points to the same database. The database name does not mean it is isolated from production.
- Automatic Pages deployments from `main` are enabled.
- GitHub Actions are not used and must remain disabled.

## Internal administrator authentication
- The administration page is `/admin.html`; it is not linked from public navigation and is marked `noindex,nofollow`. It may still be opened directly, but it exposes no admin data without a valid server-side session.
- Admin authentication is handled by Pages Functions and D1. Cloudflare Access is not required.
- Passwords are stored only as PBKDF2-HMAC-SHA-256 hashes with per-account random salts and 310,000 iterations.
- Session tokens are random, stored only as SHA-256 hashes in D1, and sent in Secure, HttpOnly, SameSite=Strict cookies. Session lifetime is 12 hours.
- State-changing requests require same-origin validation and a separate CSRF token.
- Login attempts are rate-limited and recorded in `admin_login_events`. Administrative actions continue to use role checks, audit logs and content revisions.
- The one-time initial setup endpoint is closed after the first admin record exists. It also requires the Pages secret `ADMIN_SETUP_SECRET` with at least 32 characters.

## First administrator activation
1. In Cloudflare Dashboard, open Workers & Pages, select the `adah` Pages project, then Settings → Variables and Secrets.
2. Add `ADMIN_SETUP_SECRET` as an encrypted Secret, not a plain-text public variable. Use a newly generated random value of at least 32 characters. Never send it in chat or commit it to GitHub.
3. Deploy the reviewed release and apply `migrations/0005_internal_admin_auth.sql` once to the D1 database currently bound to production. Confirm the database ID before applying it. Do not run the migration twice.
4. Open `https://adah.pages.dev/admin.html`. The one-time setup form appears only while no administrator exists and the secret is configured.
5. Create the first admin with the same private setup secret, an email address and a unique password of at least 14 characters. The setup creates a session automatically.
6. Confirm login, logout, role restrictions, audit logging and content editing. After successful setup, remove the `ADMIN_SETUP_SECRET` Pages secret because the one-time endpoint is permanently closed.
7. Keep Cloudflare Access variables and the old Access application setup unused; this design does not depend on Zero Trust.

## Release safety
Merging to `main` triggers automatic production deployment. Review the exact diff and verify Preview before merging. Preview currently shares the production D1 binding, so do not use Preview to test writes or initial-admin setup. Never run GitHub Actions.

## Backups
D1 Time Travel is useful for short-window recovery but is not an independent backup. Export the database before major schema/content changes, encrypt exports outside the public repository, and test restoration into a non-production target.

## Owner-only actions
The owner must configure the encrypted Pages secret and create the initial admin password privately. Never request passwords, setup secrets, MFA codes or API tokens in chat.
