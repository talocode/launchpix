# Async generation operations

LaunchPix supports two API generation modes. **Sync is the production default.**

## Default: synchronous generation

`POST /api/v1/projects/{projectId}/generate` runs `runGenerationForProject` in-request and returns **201**:

```json
{ "generationId": "...", "status": "completed" }
```

No worker, cron, or feature flag is required.

## Opt-in: asynchronous generation

Set on the web service:

```env
LAUNCHPIX_ASYNC_GENERATION=true
```

The same endpoint returns **202** with a poll URL:

```json
{
  "generationId": "...",
  "status": "queued",
  "poll": "/api/v1/projects/{projectId}/generations/{generationId}"
}
```

Credits are consumed before the generation becomes claimable. A worker must process queued rows or jobs remain stuck.

## Worker secret (required for cron)

Configure a dedicated secret on the web service and cron job:

```env
LAUNCHPIX_WORKER_SECRET=your-long-random-secret
```

Send it on every internal worker request:

```http
x-launchpix-worker-secret: your-long-random-secret
```

Bearer auth is also accepted:

```http
Authorization: Bearer your-long-random-secret
```

The internal endpoint rejects missing or invalid secrets with **401**. If the secret is not configured on the server, the endpoint returns **503**.

`LAUNCHPIX_API_KEY` is **not** accepted for worker processing.

## Internal worker endpoint

```http
POST /api/internal/worker/generations/process
Content-Type: application/json
x-launchpix-worker-secret: <LAUNCHPIX_WORKER_SECRET>
```

### Batch mode (cron default)

Empty body or `{}` processes up to the batch limit of oldest `queued` generations:

```json
{
  "processed": 1,
  "claimed": 1,
  "completed": 1,
  "failed": 0,
  "skipped": 0
}
```

| Field | Meaning |
|-------|---------|
| `processed` | Jobs attempted in this run |
| `claimed` | Rows moved from `queued` → `analyzing` |
| `completed` | Claimed jobs that finished successfully |
| `failed` | Claimed jobs that failed during pipeline execution |
| `skipped` | Jobs not claimable (already taken, terminal, etc.) |

Optional body fields:

```json
{
  "workerId": "render-cron",
  "limit": 5
}
```

`limit` is capped by `LAUNCHPIX_GENERATION_WORKER_BATCH_LIMIT` (default `5`, max `20`).

### Single-job replay (manual)

```json
{
  "generationId": "...",
  "projectId": "...",
  "workerId": "manual-replay"
}
```

### Disabled async guard

If `LAUNCHPIX_ASYNC_GENERATION` is not `true`, the worker returns **503** and does not process jobs.

Manual admin replay is allowed only when:

```env
LAUNCHPIX_GENERATION_WORKER_ALLOW_MANUAL=true
```

and the request includes `"force": true`.

## Cron / scheduled trigger

### Render (recommended for this repo)

`render.yaml` includes a cron service that runs every 5 minutes:

```bash
npm run worker:generations
```

Required env on **both** web and cron services:

- `NEXT_PUBLIC_APP_URL` — public app URL (e.g. `https://talocode-launchpix.onrender.com`)
- `LAUNCHPIX_WORKER_SECRET`
- `LAUNCHPIX_ASYNC_GENERATION=true`
- Supabase + Mistral credentials (worker runs the same pipeline)

Suggested schedule: every **5 minutes** (`*/5 * * * *`). Use every **1 minute** only if queue latency is critical.

### Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/internal/worker/generations/process",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Vercel cron invocations are GET by default. For this project, prefer an external cron runner that executes `npm run worker:generations`, or add a thin GET wrapper in a follow-up if needed.

### Any host with shell cron

```bash
LAUNCHPIX_WORKER_SECRET=... \
NEXT_PUBLIC_APP_URL=https://your-app.example \
npm run worker:generations
```

Exit code is non-zero when the HTTP call fails or when `failed > 0`.

## Inline dev mode (single-node)

For local development without cron:

```env
LAUNCHPIX_ASYNC_GENERATION=true
LAUNCHPIX_GENERATION_WORKER_INLINE=true
```

`POST /generate` still returns 202, then processes the queued job in the same request. Do **not** enable inline mode in production when cron is available.

## Failure and retry behavior

- **Claim conflicts**: If another worker already claimed a job, it is counted as `skipped`. Cron will pick up remaining `queued` rows on the next run.
- **Pipeline failure**: Generation moves to `failed`, credit is refunded when possible, and the job is counted in `failed`.
- **Stuck in progress**: Rows in `analyzing`, `generating_copy`, or `rendering_assets` are not reclaimable. Investigate logs and mark failed manually if needed.
- **Retries**: Re-enqueue is not automatic. Failed generations require a new API request or manual replay with `generationId` + `projectId`.

## Local testing

1. Start the app: `npm run dev`
2. Set env in `.env.local`:

```env
LAUNCHPIX_ASYNC_GENERATION=true
LAUNCHPIX_WORKER_SECRET=dev-worker-secret
SUPABASE_SERVICE_ROLE_KEY=...
MISTRAL_API_KEY=...
```

3. Submit async generation via API (`POST /api/v1/projects/{id}/generate` with API key headers).
4. Run the worker:

```bash
LAUNCHPIX_WORKER_SECRET=dev-worker-secret \
NEXT_PUBLIC_APP_URL=http://localhost:3000 \
npm run worker:generations
```

5. Poll `GET /api/v1/projects/{projectId}/generations/{generationId}` until `phase` is `completed` or `failed`.

## Environment reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `LAUNCHPIX_ASYNC_GENERATION` | off | Enable async 202 acceptance |
| `LAUNCHPIX_WORKER_SECRET` | — | Protect internal worker endpoint |
| `LAUNCHPIX_GENERATION_WORKER_INLINE` | off | Process in-request after 202 (dev) |
| `LAUNCHPIX_GENERATION_WORKER_BATCH_LIMIT` | `5` | Max jobs per cron tick (max 20) |
| `LAUNCHPIX_GENERATION_WORKER_ALLOW_MANUAL` | off | Allow `force: true` when async is off |
| `LAUNCHPIX_GENERATION_WORKER_ID` | `render-cron` | Worker id sent in cron script |
| `LAUNCHPIX_APP_URL` | `NEXT_PUBLIC_APP_URL` | Base URL for cron script |