# LaunchPix

LaunchPix is a Mistral-assisted asset generator for product launches.
It turns raw screenshots into polished listing visuals, promo tiles, and hero banners.

## Design system
- `DESIGN.md` is the canonical design brain for the product UI.
- `docs/design-md/google-designmd-spec.md` is a local copy of the Google DESIGN.md specification.
- `docs/design-md/README.md` explains how to use both files in this repo.

## Tech stack
- Next.js App Router + TypeScript
- Tailwind CSS + reusable UI primitives
- Supabase (Auth, Postgres, Storage)
- Mistral structured planning and image generation
- Deterministic SVG -> PNG fallback rendering (`@resvg/resvg-js`)
- Lemon Squeezy credit-pack billing and webhook fulfillment

## Core product flow
1. Sign in
2. Create project and upload screenshots
3. Generate structured asset plan via Mistral
4. Generate image assets through a Mistral image-generation agent
5. Preview/download assets while credits remain

## Pricing model implemented
- Every account starts with 300 credits.
- Existing accounts are raised to at least 300 credits by `0004_credit_balance_model.sql`.
- Billing is credit based, not subscription based.
- Users buy one-time Lemon Squeezy credit packs after exhausting their included credits.

## Required environment variables
See `.env.example`.
Minimum required:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `MISTRAL_API_KEY`
- `MISTRAL_MODEL_VISION`
- `MISTRAL_MODEL_TEXT`
- `MISTRAL_IMAGE_MODEL`
- `MISTRAL_IMAGE_AGENT_ID` (optional)
- `LEMON_SQUEEZY_API_KEY`
- `LEMON_SQUEEZY_STORE_ID`
- `LEMON_SQUEEZY_WEBHOOK_SECRET`
- `LEMON_SQUEEZY_STARTER_CREDITS_VARIANT_ID`
- `LEMON_SQUEEZY_CREATOR_CREDITS_VARIANT_ID`
- `LEMON_SQUEEZY_STUDIO_CREDITS_VARIANT_ID`

Optional for Supabase CLI workflows:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`

## Local setup
1. Copy env:
   - `cp .env.example .env.local`
2. Install dependencies:
   - `npm install`
4. Apply database migrations using one of these options:
   - Supabase CLI: `npx supabase db push --linked`
   - or run the SQL files in `supabase/migrations/` in order
5. Start dev server:
   - `npm run dev`

Recommended validation commands:
- `npm run typecheck`
- `npm run build`

## Supabase notes
- Enable email auth.
- Ensure storage buckets exist:
  - `project-uploads-raw`
  - `project-uploads-normalized`
  - `launchpix-assets`
- Apply RLS policies from migrations.
- If you use the Supabase CLI, link the project first with `npx supabase link`.

## Mistral notes
- Mistral is used for structured product/copy/layout planning.
- Final image assets are generated through a Mistral Agent with the built-in `image_generation` tool.
- Planning default model: `mistral-small-2506` (configurable via env).
- Image generation default model: `mistral-medium-latest` (configurable via `MISTRAL_IMAGE_MODEL`).
- `MISTRAL_IMAGE_AGENT_ID` can point to a pre-created image-generation agent. If it is omitted, LaunchPix creates an agent at runtime.
- If Mistral image generation fails, LaunchPix falls back to deterministic SVG -> PNG rendering so generation does not hard-fail.

## Lemon Squeezy notes
- Checkout init: `POST /api/billing/checkout`
- Verification: purchases are fulfilled by webhook after Lemon Squeezy confirms the order
- Webhook: `POST /api/billing/webhook`
- Configure Lemon Squeezy webhook URL to point to `/api/billing/webhook`.
- Select the `order_created` event for credit fulfillment.
- Create three Lemon Squeezy variants and map them to the variant ID env vars in `.env.example`.

## Commands
- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run video:studio`
- `npm run video:render`
- `npm run video:render:chrome` on Windows if Remotion cannot download Chrome Headless Shell

## Demo video
- The Remotion demo composition lives in `remotion/`.
- Rendered output is written to `output/launchpix-demo.mp4`.
- The video explains the core LaunchPix story: project brief, screenshot uploads, Mistral planning, image generation, fallback rendering, exports, credits, and billing.

## Deployment notes
- Set all env vars in hosting provider.
- `NEXT_PUBLIC_APP_URL` must be set in the hosting provider's production environment to your live domain; `.env.local` is only used locally.
- Use HTTPS and production callback URLs for Lemon Squeezy.
- Auth confirmation and billing redirects are built from `NEXT_PUBLIC_APP_URL`, so production must not point this to localhost.
- Keep `package-lock.json` committed so CI and hosting builds install the same dependency tree.
- Confirm webhook signature secret matches deployment env.

## Netlify notes
- Build command: `npm run build`
- Install command: `npm install` or `npm ci`
- The app relies on `@resvg/resvg-js` during server rendering, so the current `next.config.ts` must be preserved in deployments.

## Known MVP constraints
- Rate limiting is lightweight (in-memory).
- Credit packs are one-time purchases; subscription renewal automation is intentionally not used.
- Visual templates are production-capable baseline and can be expanded further.
