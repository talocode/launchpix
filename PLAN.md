# LaunchPix Plan

This plan reflects the current state of the repo after core MVP implementation, deployment fixes, Supabase setup, and the full UI redesign.

## Current State

- Core app flow exists: auth, project creation, uploads, generation, assets, billing
- Supabase migrations are in place and have been pushed
- Netlify build blockers have been fixed
- Production auth redirect handling has been fixed
- Major UI redesign has been completed across the app
- Landing page has been simplified for clearer conversion focus

## Next Immediate Priority

### 1. Stabilize the full MVP flow

Goal: verify the product works end-to-end in realistic usage and fix any remaining runtime issues.

- Test sign-in and email confirmation in production
- Test project creation and screenshot upload flow
- Test generation flow from brief to asset output
- Test asset editing, rerender, and download flow
- Test billing checkout, verification, and webhook handling
- Fix any runtime, validation, or UX blockers discovered during QA

## Milestones

### 2. Improve generation reliability

Goal: make generation failures rarer, clearer, and easier to recover from.

- Add clearer user-facing error states for failed generation steps
- Improve server-side logging around Mistral planning and render failures
- Add retry-safe handling for partial generation failures
- Ensure generation history and status transitions are always consistent
- Validate behavior when credits are low or exhausted

### 3. Production hardening

Goal: reduce deployment risk and tighten operational readiness.

- Verify all production env vars are documented and correctly used
- Confirm Netlify build and runtime settings are stable
- Confirm Lemon Squeezy checkout and webhook behavior in production
- Verify Supabase storage buckets, RLS, and auth settings in production
- Review fallback behavior for missing external provider responses

### 4. UX polish and consistency

Goal: make the product feel complete and reliable across all screens.

- Review mobile responsiveness across landing, auth, dashboard, and settings
- Tighten loading, empty, success, and error states
- Remove any remaining inconsistent spacing, copy, or visual hierarchy issues
- Improve conversion messaging on pricing and onboarding surfaces
- Review accessibility basics: contrast, focus states, keyboard flow, labels

### 5. Funnel visibility and analytics

Goal: understand where users drop off and what needs improvement.

- Verify key events are tracked for auth, project creation, generation, and billing
- Add missing analytics around failed generation and billing attempts
- Define a simple MVP funnel: visit -> sign in -> project created -> generation started -> export/download
- Use those signals to prioritize the next product fixes

### 6. Post-MVP feature expansion

Goal: expand usefulness after the core loop is fully stable.

- Add more visual template families
- Add saved style presets or reusable project defaults
- Add stronger asset copy editing workflows
- Add richer project history and regeneration controls
- Explore team/workspace support if needed

## Definition of MVP Ready

LaunchPix should be considered MVP-ready when:

- A new user can sign in without redirect issues
- A project can be created and screenshots uploaded reliably
- Generation can complete without recurring application errors
- Asset previews and downloads work correctly by plan type
- Billing upgrades correctly unlock paid access
- The deployed app builds and runs cleanly without manual intervention

## What We Should Work On Next

If we are following this plan strictly, the next thing to work on is:

**Stabilize the full MVP flow with end-to-end QA and fix any bugs found during that pass.**
