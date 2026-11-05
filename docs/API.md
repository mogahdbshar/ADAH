# ADAH read-only API foundation

## Routes

### `GET /api/health`
Returns a minimal readiness response after a successful D1 round trip. It does not expose account IDs, database names, SQL errors or runtime details.

### `GET /api/catalog?lang=ar|en&limit=50&offset=0`
Returns only published categories and tools. Language defaults to Arabic unless the request's `Accept-Language` begins with English. `limit` is capped at 100 and invalid values fall back to safe defaults. The endpoint is read-only and returns a short-lived public cache response.

## Runtime
- Cloudflare Pages Functions use the existing `DB` D1 binding.
- No client-provided identity, role or permission is trusted.
- No write endpoint, admin endpoint, upload endpoint or authentication bypass is implemented in this phase.
- API errors are generic and do not reveal SQL, schema or provider details.
- The browser must continue to work if the API is unavailable; the static catalogue remains the fallback until frontend integration is separately reviewed.

## Preview validation
1. Open `/api/health`; expect HTTP 200 and `ok: true`.
2. Open `/api/catalog?lang=ar`; verify Arabic titles and only published entries.
3. Open `/api/catalog?lang=en`; verify English titles.
4. Try `limit=999999`; the response must be capped at 100.
5. Confirm there are no POST/PUT/PATCH/DELETE handlers.
6. Confirm API failures return a generic 503 response without SQL details.

Do not merge this phase to `main` without explicit production-release approval. The Pages project automatically deploys `main`.
