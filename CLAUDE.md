# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repo is a **monorepo (npm workspaces)**, scaffolded through **M0 — Foundation**
(see `currentPlans/BUILD_MILESTONES.md`). The capture→AI→PlantDex loop (M1) and later
milestones are not built yet.

Layout (per `currentPlans/REPO_STRUCTURE.md`):
- `packages/shared` — enums, API types, and the `SCORING` config (single source of truth)
- `packages/db` — Prisma schema (from `DATA_MODEL.md`) + client singleton + seed placeholder
- `apps/api` — Next.js backend; JWT auth boundary + `/api/v1/profile*` routes + health check
- `apps/mobile` — Expo / expo-router app; theme tokens, bottom-tab shell, auth (13+ gate)

### Commands

```bash
npm install                 # install all workspaces (run once)
npm run db:generate         # generate the Prisma client (after schema changes)
npm run typecheck           # tsc --noEmit across every workspace
npm run test                # unit tests (scoring formulas pinned in packages/shared)
npm run build:shared        # compile packages/shared to dist (api/mobile depend on it)
npm run api:dev             # run the backend (needs .env — copy from .env.example)
npm run mobile:start        # start Expo (needs a custom EAS dev build for Mapbox in M2)
npm run db:migrate          # first migration — needs a live Supabase DB in .env
```

External services (Supabase, OpenAI, Mapbox, EAS) are **not provisioned**. Copy
`.env.example` → `.env`, fill real values, then run `db:migrate`. Code is written to be
credential-ready; nothing live is wired.

## Planning-doc workflow (important)

Plans live in two folders with strict roles:

- `InitalPlans/` — **frozen baseline. Do not edit.** Historical snapshot of the original idea, spec, design, and features. (Note the on-disk spelling: `InitalPlans`, missing the second "i".)
- `currentPlans/` — **living source of truth. Edit here.** When a baseline doc needs revising, copy it from `InitalPlans/` into `currentPlans/` and maintain the copy there.

If something in `InitalPlans/` is now wrong or outdated, capture the correction in `currentPlans/` — never modify the baseline. See `currentPlans/README.md` for the full rule.

Document set (in `InitalPlans/`):
- `InitialIdea.md` — vision, core loop, future ecological applications
- `features.md` — MVP feature breakdown
- `SPEC.md` — product features, data models, tech stack, MVP completion criteria
- `design.md` — visual direction and screen-level UI specs
