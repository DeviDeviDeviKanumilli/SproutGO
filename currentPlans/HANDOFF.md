# HANDOFF.md

**Last updated:** 2026-05-30
**Branch:** `main` (latest commit pushed to origin)

## Where the project stands

M0 — Foundation is complete. M1 is **in progress**:
- **Mobile UI shell** (`7ef20be`) — presentational, over mock fixtures
  (`apps/mobile/src/lib/mockData.ts`).
- **Backend M1 spine** (this commit) — the real `POST /api/v1/observations`
  identify→score→PlantDex pipeline + the swappable `PlantIdentifier` interface.

**Still not wired:** mobile camera capture + Supabase Storage upload, repointing
the result/PlantDex screens off mock data onto the live endpoint, and the
`GET /plantdex/me` read. Some M3/M4 screens (forum thread, plant chat) exist as
UI only. M2 (map richness) and the rest of M3–M5 remain. See
`currentPlans/BUILD_MILESTONES.md` for full sequencing.

The backend pipeline runs today against a **deterministic stub identifier** (no
credentials needed); the OpenAI vision adapter activates automatically when
`OPENAI_API_KEY` is set. Library matching still benefits from a seeded Library
(`LIBRARY_SEED.md`) — unseeded, the stub auto-creates `OPENAI`-sourced Plant rows.

Verified green (this commit):
- `npm run typecheck` — passes across all 4 workspaces (shared, db, api, mobile)
- `npm run test` — 5/5 scoring tests pass (`packages/shared`)

External services (Supabase, OpenAI, Mapbox, EAS) are **not provisioned**. Code
is credential-ready; the user wires `.env` and runs migrations/EAS themselves.

## What changed most recently (this commit — backend M1 spine)

Built the real `POST /api/v1/observations` pipeline and the swappable
identifier, all credential-ready:

- `apps/api/src/lib/identify/` — `PlantIdentifier` interface, a deterministic
  `StubPlantIdentifier` (no network), an `OpenAIPlantIdentifier` (vision JSON
  mode, Zod-validated, key read lazily), and a `getPlantIdentifier()` factory
  that picks OpenAI when `OPENAI_API_KEY` is set else the stub.
- `apps/api/src/app/api/v1/observations/route.ts` — `POST` pipeline in one
  `prisma.$transaction`: create observation → identify → match/auto-create
  Plant (≥0.85 → `OPENAI` source, else `UNCERTAIN`/no unlock) → daily quota →
  first-discovery vs duplicate points → PlantDexEntry upsert → bump
  `Profile.totalPoints`. Returns `ObservationResult`.
- `validation.ts` (`createObservationSchema`) and `serializers.ts`
  (`serializePlant`, `serializeObservation`). Added the `openai` dependency.

The earlier mobile UI shell (`7ef20be`) remains presentational over mock data.

## Git state

M0 (`05f37d6`), the M1 UI shell (`7ef20be`), and this backend-spine commit are
on `origin/main`. All work has gone straight to `main` (no feature branches).

## Next steps (finish the M1 spine)

The backend pipeline exists; the loop is not yet end-to-end. Remaining:

1. **Mobile camera capture** — replace the simulated `capture.tsx` with
   `expo-camera` (needs the custom EAS dev build, R1) + a Supabase Storage
   upload helper that returns `imagePath` under the `<userId>/` prefix.
2. **Wire the screens** — `processing.tsx` uploads then calls
   `POST /observations`; `result.tsx` renders the real `ObservationResult`
   (MATCHED / UNCERTAIN / `quotaReached`) instead of `mockData`.
3. **`GET /plantdex/me`** — so the unlocked species is actually visible after a
   capture (the M1 demo criterion); repoint `plantdex.tsx` onto it.
4. **Tests** — vitest for the stub identifier + the scoring/branch logic
   (first-discovery, duplicate, UNCERTAIN, quota, auto-create).
5. **Seed the Library** (`LIBRARY_SEED.md`) — blocked on the OPEN_QUESTIONS
   seed-scope decision + a live DB; the stub covers the no-data case meanwhile.
6. **Provision services** (user-owned) — Supabase Storage bucket
   `observations`, OpenAI key, EAS dev build. Code is credential-ready.
- Do NOT provision/wire live external services — the user wires credentials.
- Commit ONLY when explicitly asked.
- `InitalPlans/` frozen; `currentPlans/` is the living source of truth.
- Secrets are backend-only, never in the mobile bundle.
