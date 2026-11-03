# ADAH operations

## Current status
No Cloudflare account resources, database, bucket, Access policy or production deployment are configured by this document. No deployment has been performed.

## Manual release gates
1. Review the exact commit and changed-file list.
2. Run static validation and functional/browser checks outside GitHub Actions.
3. Verify preview behavior and accessibility.
4. Confirm Pages automatic production deployment is disabled.
5. Obtain explicit owner approval for production deployment.
6. Deploy using the verified Cloudflare dashboard/manual upload route.
7. Verify public pages, API health, headers, sitemap and service worker.
8. Keep the previous known-good release available for rollback.

## Backups
- D1 Time Travel is useful for short-window recovery but is not a substitute for independent backups.
- Export database contents and settings on a documented schedule.
- Keep object-storage inventory and backup metadata.
- Encrypt exports before storage outside the account.
- Test a restore into a non-production target.
- Never put backup credentials or private exports in the public repository.

## Manual owner actions
Ask the owner only for account authorization, domain ownership verification, MFA/Access enrollment, or a one-time setting that cannot be performed through connected tools. Give exact screen-by-screen steps and explain why the action is needed.
