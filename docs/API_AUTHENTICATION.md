# LaunchPix API authentication and billing

## Customer API keys (public `/api/v1/*`)

Create keys in the API dashboard (`/dashboard/api/keys`). Keys look like:

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

## Local development

1. Apply migration `0007_customer_api_keys.sql`
2. Create a key with server-side helper `createCustomerApiKey({ userId })` (dashboard UI coming soon)
3. Call public routes with the returned token once