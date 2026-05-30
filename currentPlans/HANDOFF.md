# HANDOFF.md

**Last updated:** 2026-05-30
**Branch:** `main` (nothing committed beyond `d76c3ac`)

## Where the project stands

M0 — Foundation is scaffolded and verified. The capture→AI→PlantDex loop (M1)
and later milestones (M2–M5) are **not built yet**. See
`currentPlans/BUILD_MILESTONES.md` for the full sequencing.

Verified green:
- `npm run typecheck` — passes across all 4 workspaces (shared, db, api, mobile)
- `npm run test` — 5/5 scoring tests pass (`packages/shared`)
- `npm run db:generate` — Prisma client generates

External services (Supabase, OpenAI, Mapbox, EAS) are **not provisioned**. Code
is credential-ready; the user wires `.env` and runs migrations/EAS themselves.

## What changed most recently (uncommitted)

Reconciled the design tokens with the **Google Stitch** exports (Material 3),
which are now the authoritative design source over `InitalPlans/design.md`.

- `apps/mobile/src/theme/index.ts` — repointed to the Stitch M3 ramp. Every
  key the app already consumes kept its name (typecheck stays green). Added the
  full surface ramp, `secondary*`, `tertiary`, `outline*`, `inverse*` tokens,
  line-heights, and a `scientificName` type role for M1–M5 screen work.
- `currentPlans/DESIGN_SYSTEM.md` — **new.** Living design source of truth:
  full token ramp, type scale (Plus Jakarta Sans + Inter), spacing/radius,
  and component patterns (hexagon badge, raised Capture tab, reward sheet).

Key token shifts: `primary #2E7D4F → #006c0c`, `bg #FFFFFF → #f5fbee`,
rarity hexes updated, `gold #D4A017 → #D4AF37`.

## Uncommitted git state (as of 2026-05-30)

The entire M0 scaffold is still uncommitted on top of `d76c3ac`:

- Modified: `.gitignore`, `CLAUDE.md`, `currentPlans/OPEN_QUESTIONS.md`
- New: `apps/`, `packages/`, `.env.example`, `package.json`,
  `package-lock.json`, `tsconfig.base.json`, `currentPlans/DESIGN_SYSTEM.md`,
  `currentPlans/HANDOFF.md`

Nothing has been committed yet — the user commits when ready.

## Design reference

- **Authoritative:** Google Stitch HTML/Tailwind exports (13 screens) →
  distilled into `currentPlans/DESIGN_SYSTEM.md`.
- `InitalPlans/design.md` is the **frozen** baseline; do not edit it. Any
  correction lives in `currentPlans/`.
- The 13 screens span M1–M5: Plant Detail, Forum Categories, First Discovery
  Modal, Library, Feed, Identification Result, AI Processing, Forum Thread,
  Camera, Plant Chat, PlantDex, Map, Profile.

## Next steps (decision pending)

The theme tokens (M0) are reconciled. The open question put to the user:

1. **Build M1 first** — the capture → AI → reward loop (camera, AI processing,
   Identification Result + First Discovery modal). Highest-priority milestone.
2. **Polish M0 screens first** — bring the existing auth / profile / tab-shell
   screens up to the Stitch design before moving on.

Constraints still in force:
- Do NOT provision/wire live external services — the user wires credentials.
- Commit ONLY when explicitly asked.
- `InitalPlans/` frozen; `currentPlans/` is the living source of truth.
- Secrets are backend-only, never in the mobile bundle.
