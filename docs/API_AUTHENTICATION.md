# LaunchPix API authentication and billing

## Customer API keys (public `/api/v1/*`)

### Create a key in the dashboard

1. Sign in to LaunchPix.
2. Open **API dashboard → API Keys** (`/dashboard/api/keys`).
3. Click **Create key**, name it (e.g. `Production server`), and submit.
4. Copy the full key immediately — it is shown **once** and cannot be viewed again.
5. Revoke compromised keys from the same page.

Keys look like:

```
lp_live_<random>
lp_test_<random>
```

Send on every public API request:

```http
x-launchpix-api-key: lp_live_...
```

or

```http
Authorization: Bearer lp_live_...
```

### What the key does

- Authenticates the customer account (maps to `user_id` in `api_keys`)
- Scopes projects to that account automatically
- Records `api_key_authenticated` in `usage_events` on successful auth
- Attaches `apiKeyId` to generation credit ledger events

### Missing or invalid key

Returns **401** with a generic error. Raw keys are never logged.

### Wrong project

Returns **404** when the project does not belong to the API key owner.

## Generation billing

| Step | Credits |
|------|---------|
| `POST /api/v1/projects/{id}/generate` (sync or async) | **1 credit reserved** at POST time |
| Worker `processQueuedGeneration` | **No charge** — uses billing state only for plan limits |
| Terminal failure | Refund attempted once via `generation_credit_refunded` |

Ledger events:

- `generation_credit_consumed` — includes `generationId`, `projectId`, `apiKeyId`
- `generation_credit_refunded` — includes `generationId` and failure reason

## Internal worker secret (never customer keys)

See [ASYNC_GENERATION.md](./ASYNC_GENERATION.md) for cron setup.

```http
x-launchpix-worker-secret: <LAUNCHPIX_WORKER_SECRET>
```

`LAUNCHPIX_API_KEY` (legacy platform env var) is **not** used for public customer routes.

## Example: trigger generation with a customer key

```bash
curl -X POST "https://launchpix-app.onrender.com/api/v1/projects/{projectId}/generate" \
  -H "Authorization: Bearer lp_live_xxx" \
  -H "Content-Type: application/json"
```

Sync mode returns **201** with `{ "generationId", "status": "completed" }`. Async mode (when enabled) returns **202** with a poll URL.

## Local development

1. Apply migration `0007_customer_api_keys.sql`
2. Create a key from `/dashboard/api/keys` or with `createCustomerApiKey({ userId })`
3. Call public routes with the returned token once