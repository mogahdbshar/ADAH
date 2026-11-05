# Administrator access configuration

Administration is deny-by-default. The API does not implement password login and never trusts identity or roles supplied by browser code.

## Cloudflare Access
Create a self-hosted Access application for the ADAH hostname and protect `/api/admin/*`. Restrict the allow policy to the owner's exact identity and require MFA. Protect any custom hostname separately. The API expects Cloudflare's `CF-Access-Jwt-Assertion` header.

## Pages runtime variables
Configure these runtime variables in the Pages project:
- `ACCESS_TEAM_DOMAIN`: team hostname, without protocol.
- `ACCESS_AUD`: exact audience tag of the Access application.
- `ADMIN_EMAIL_ALLOWLIST`: comma-separated exact owner email addresses.

If any setting is missing, administration requests are denied. Never commit secrets or tokens.

## Initial administrator
The one-time bootstrap endpoint is available only to a verified Access identity whose email is in the allowlist. It creates the first admin only while the admin table is empty. It cannot be used to add further users. Verify the resulting identity through `GET /api/admin/session`.

## Roles
- admin: full administration.
- editor: content read and update.
- moderator: report and rating moderation.
- viewer: read-only overview and content.

All content updates create revision snapshots and audit events. Mutating requests require same-origin JSON requests.

## Database caution
The current Pages production binding points to `adah-staging`. Do not enroll an administrator or use admin write features until the owner has confirmed whether that database is intended to become the live content database, and an independent backup and production migration plan exist.
