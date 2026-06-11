# Talocode LaunchPix

Talocode LaunchPix is an API-first, open-source launch visual engine.
It turns product screenshots into listing frames, promo tiles, and hero banners with deterministic fallback rendering.

## Repository
- Canonical repo: `https://github.com/talocode/launchpix`

## Product direction
- API first: developer endpoints live under `/api/v1/*`.
- Open source core: code is public, but API usage requires `LAUNCHPIX_API_KEY`.
- Credits model: users start with free credits, then buy one-time credit packs.

## Core stack
- Next.js App Router + TypeScript
- Supabase (Postgres, Storage)
- Mistral (planning + image generation)
- Lemon Squeezy (credit-pack checkout + webhook fulfillment)
- Resend (transactional email)

## API authentication
Every `/api/v1/*` request must include:
- `x-launchpix-api-key: <LAUNCHPIX_API_KEY>`
- `x-launchpix-user-id: <owner-user-uuid>`

Supported alternatives:
- `x-api-key`
- `Authorization: Bearer <LAUNCHPIX_API_KEY>`

## Developer API endpoints
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/:projectId/generate`
- `POST /api/v1/projects/:projectId/generate`

## Environment variables
See `.env.example`.

Critical keys:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MISTRAL_API_KEY`
- `MISTRAL_MODEL_TEXT`
- `MISTRAL_MODEL_VISION`
- `MISTRAL_IMAGE_MODEL`
- `MISTRAL_IMAGE_AGENT_ID` (optional)
- `LAUNCHPIX_API_KEY`
- `LEMON_SQUEEZY_*`
- `RESEND_API_KEY`

## Local setup
1. Copy env file: `cp .env.example .env.local`
2. Install: `npm install`
3. Apply DB migrations: `npx supabase db push --linked`
4. Start app: `npm run dev`

Validation:
- `npm run typecheck`
- `npm run build`

## Render deployment
- Render config is in [`render.yaml`](/C:/Users/Hp/Documents/Github/LaunchPix/render.yaml).
- Build command: `npm ci && npm run build`
- Start command: `npm run start`
- Set all required env vars in Render dashboard.

## Legacy note
Previous Netlify-specific deployment notes were removed in favor of Render as the primary target.
