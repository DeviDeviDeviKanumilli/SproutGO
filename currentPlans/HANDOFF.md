# HANDOFF.md

**Last updated:** 2026-05-30
**Branch:** `main` (latest commit pushed to origin)

## Where the project stands

M0 — Foundation is complete. **M1 — the discovery loop is now wired end-to-end**
in code:
- **Backend** (`91896ff`) — `POST /api/v1/observations` identify→score→PlantDex
  pipeline + the swappable `PlantIdentifier` interface.
- **Backend** (this commit) — `GET /api/v1/plantdex/me` (discovered species +
  stats) and the vitest suite covering the pipeline.
- **Mobile** (this commit) — live `expo-camera` capture → Supabase Storage
  upload → `POST /observations` → real result screen → PlantDex grid fetched
  from `/plantdex/me`. The discovery loop no longer runs on mock fixtures.

**Still UI-only / mock-backed:** the PlantDex detail screen (`plant/[id]`,
reached via the result screen's "View PlantDex Entry"), plus some M3/M4 screens
(forum thread, plant chat). M2 (map richness) and the rest of M3–M5 remain. See
`currentPlans/BUILD_MILESTONES.md` for full sequencing.

The backend pipeline runs today against a **deterministic stub identifier** (no
credentials needed); the OpenAI vision adapter activates automatically when
`OPENAI_API_KEY` is set. Library matching still benefits from a seeded Library
(`LIBRARY_SEED.md`) — unseeded, the stub auto-creates `OPENAI`-sourced Plant rows.

Verified green (this commit):
- `npm run typecheck` — passes across all 4 workspaces (shared, db, api, mobile)
- `npm run test` — 15 tests pass (5 shared scoring + 3 stub identifier + 7 pipeline)

**NOT runtime-verified:** the end-to-end mobile loop. `expo-camera` does not run
in Expo Go (needs a custom EAS dev build, R1), and no Supabase Storage bucket
(`observations`) or OpenAI key is provisioned. The mobile code compiles and the
backend is covered by tests via the stub, but capture→upload→unlock has not been
exercised against live services.

External services (Supabase, OpenAI, Mapbox, EAS) are **not provisioned**. Code
is credential-ready; the user wires `.env` and runs migrations/EAS themselves.

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
