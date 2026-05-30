# HANDOFF.md

**Last updated:** 2026-05-30
**Branch:** `main` (latest commit pushed to origin)

## Where the project stands

M0 + M1 are complete in code. **M2 — Map & geolocation is now wired** as well:
- **Backend** — `GET /api/v1/observations?bbox=` returns privacy-filtered discovery
  pins (own + PUBLIC + accepted-FRIENDS), with rare/sensitive plant coordinates
  fuzzed server-side (`geo.ts`, ~500m snap-to-grid; resolves OPEN_QUESTIONS #8 for
  M2). Covered by vitest (geo, marker serializer, bbox validation).
- **Mobile** — capture now grabs best-effort GPS (`expo-location`) and threads
  lat/long into `POST /observations`; the Map tab is a real `@rnmapbox/maps` map
  (rarity markers, user-location dot, marker preview sheet, location-denied
  fallback) fed by the bbox endpoint, replacing the mock grid.

Earlier: M1 — `POST /observations` identify→score→PlantDex pipeline + swappable
`PlantIdentifier`, `GET /plantdex/me`, and the live capture→upload→result→PlantDex
flow.

**Project is now curated for a custom dev build (Xcode).** `@rnmapbox/maps` cannot
run in Expo Go, so the app needs a dev build to launch — see the new
**`currentPlans/DEV_BUILD.md`** for the full local-iOS (recommended on this Mac:
Xcode 26.3 + CocoaPods already present) and EAS-cloud paths. Added `expo-dev-client`,
`apps/mobile/eas.json`, and `prebuild`/`prebuild:ios` npm scripts.

**Still UI-only / mock-backed:** the PlantDex detail screen (`plant/[id]`, reached
from both the result screen and the map sheet), plus some M3/M4 screens (forum
thread, plant chat). M3–M5 remain. See `currentPlans/BUILD_MILESTONES.md`.

The backend pipeline runs today against a **deterministic stub identifier** (no
credentials needed); the OpenAI vision adapter activates automatically when
`OPENAI_API_KEY` is set. Library matching still benefits from a seeded Library
(`LIBRARY_SEED.md`) — unseeded, the stub auto-creates `OPENAI`-sourced Plant rows.

Verified green (latest):
- `npm run build:shared` + `npm run typecheck` — pass across all 4 workspaces
- `npm run test` — 27 tests pass (scoring, stub identifier, observation pipeline,
  geo fuzzing, marker serializer, bbox validation)

**NOT runtime-verified:** the Mapbox map and the live GPS→bbox round-trip. Mapbox
needs the dev build (won't run in Expo Go), and no Mapbox tokens, Supabase Storage
bucket (`observations`), or OpenAI key are provisioned. Code compiles and the
backend is covered by tests via the stub, but capture→upload→unlock and the map
have not been exercised against live services.

External services (Supabase, OpenAI, Mapbox, EAS) are **not provisioned**. Code is
credential-ready; the user wires `.env` (see `.env.example` + `DEV_BUILD.md`) and
runs migrations/dev build themselves.

## What changed most recently (this commit — M1 loop wired end-to-end)

Completed the M1 discovery loop on top of the backend pipeline from `91896ff`:

- `apps/api/src/app/api/v1/plantdex/me/route.ts` — `GET /plantdex/me` returning
  `{ entries: PlantDexEntry[], stats }`, scoped to the authenticated user; each
  entry embeds its resolved `Plant` so the grid renders in one fetch.
- Shared `PlantDexEntry` / `PlantDexResponse` types + `serializePlantDexEntry`.
- vitest suite (`apps/api/vitest.config.ts` + 2 test files, 10 tests): stub
  identifier determinism/shape, and the scoring branches (auto-create threshold,
  first-discovery, duplicate decay + cap, quota boundary).
- Mobile capture flow, now live instead of mock:
  - `capture.tsx` — `expo-camera` viewfinder + permission gate + shutter.
  - `src/lib/storage.ts` — uploads the photo to Supabase Storage under
    `<userId>/<uuid>.jpg` (the prefix the API enforces).
  - `src/lib/captureStore.ts` — passes the photo URI / `ObservationResult`
    between the capture→processing→result screens.
  - `processing.tsx` — uploads then `POST /observations`, with a failure/retry
    state replacing the old fixed timer.
  - `result.tsx` — renders the real `ObservationResult` with distinct MATCHED /
    UNCERTAIN / quota-reached views.
  - `plantdex.tsx` — fetches `/plantdex/me` on focus with loading/empty/error
    states.
- Added the `expo-camera` dependency.

## Git state

M0 (`05f37d6`), the M1 UI shell (`7ef20be`), the backend spine (`91896ff`), and
this loop-wiring commit are on `origin/main`. All work has gone straight to
`main` (no feature branches).

## Next steps

The M1 loop is wired in code but not runtime-verified. Likely next work:

1. **Provision services + smoke-test the loop** (user-owned) — create the
   Supabase Storage bucket `observations` (+ RLS so a user writes only under
   their own `<userId>/` prefix), set `OPENAI_API_KEY`, and run a custom EAS dev
   build (expo-camera + Mapbox both need it, R1). Then walk capture→unlock.
2. **PlantDex detail screen** (`plant/[id]`) — still mock-backed; needs a
   `GET /library/:plantId` (or `/plantdex` entry) read. It's the screen the
   result screen's "View PlantDex Entry" routes to.
3. **Seed the Library** (`LIBRARY_SEED.md`) — blocked on the OPEN_QUESTIONS
   seed-scope decision + a live DB; the stub auto-creates rows meanwhile.
4. **Coordinate handling** — capture currently sends no lat/long; wire
   `expo-location` and decide the fuzzing strategy (OPEN_QUESTIONS #6) before
   exposing observation coordinates on the map (M2).

Constraints still in force:
- Do NOT provision/wire live external services — the user wires credentials.
- Commit ONLY when explicitly asked.
- `InitalPlans/` frozen; `currentPlans/` is the living source of truth.
- Secrets are backend-only, never in the mobile bundle.
