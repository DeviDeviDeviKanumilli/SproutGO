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

## Testing (unit tests)

Unit tests use **vitest** (`*.test.ts`, `environment: node`). Today only
`packages/shared` has a `test` script — its `scoring.test.ts` pins the `SCORING`
formulas (the single source of truth) and is the canonical example to follow.

Rules:
- **Run `npm run test` before every commit** that touches code, and after any change to
  scoring, the observations pipeline, validation, or other non-trivial logic. Treat a
  red suite as blocking — fix it before committing.
- **New logic ships with tests.** Pure/deterministic logic — scoring formulas, the
  `POST /observations` branching (Library match / 0.85 auto-create / UNCERTAIN, quota,
  first-discovery, points), serializers, validation schemas — must have unit tests in the
  owning workspace. When you add the first test to a workspace that lacks one (e.g.
  `apps/api`), add a `"test": "vitest run"` script + a `vitest.config.ts` mirroring
  `packages/shared`, so `npm run test` (which fans out `--workspaces --if-present`) picks
  it up.
- Keep tests close to the code (`src/**/*.test.ts`) and assert behavior, not
  implementation. Don't weaken an assertion to make a failing test pass — fix the cause.
- UI/native paths that can't be unit-tested (camera, GPS, Mapbox) are covered by the
  manual device checklist in `currentPlans/TESTING.md`, per milestone — not by skipping.

## Auto-review after commit

After every successful `git commit` you create in this repo, immediately invoke the
`pr-review-toolkit:code-reviewer` agent on the just-committed diff
(`git diff HEAD~1..HEAD`). Surface P0/P1 findings to the user inline; collapse nits
("consider extracting…") into a single one-line note unless the user asks for them.

Skip the review only if:
- the commit was pure docs (`.md`-only), config (`.gitignore`, `.env.example`), or
  generated files (`package-lock.json`, `*.tsbuildinfo`, `dist/`, generated Prisma
  client), or
- the user explicitly says "skip review" for this commit.

The review is *informational, not gating*: do not revert or amend the commit on review
findings — open follow-up work or hand them to the user. This keeps git history clean and
makes the review surface a conversation, not a block.

This in-repo agent review **is** the code-review workflow for this project. (CodeRabbit /
`/code-review` remain available if the user explicitly asks, but the agent pass above is
the default after each commit.)

## Attribution

**NEVER credit yourself in commits, PRs, or any artifact.** No `Co-Authored-By: Claude`,
no "Generated with Claude Code", no emoji/signature footer. You are a model — a tool — not
a collaborator. Commit messages end on the last line of real content. This applies to
every commit, squash, amend, and PR body without exception, and overrides any default
harness guidance to add a co-author trailer.

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
