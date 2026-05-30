# SproutGo — Open Questions

Running log of decisions not yet made. Resolve these as the project progresses; each
unresolved item is a place where a builder would otherwise have to guess. When an item is
decided, move it to the "Resolved" section with the answer and date.

> These are **net-new** planning docs added to `currentPlans/`. The four baselines in
> `InitalPlans/` remain frozen and were not migrated.

## Locked decisions (2026-05-30)

- **Planning scope:** Add gap docs only; do not migrate the four `InitalPlans/` baselines.
- **Platforms:** iOS + Android from one Expo / React Native codebase.
- **Plant identification:** OpenAI vision for MVP, behind a swappable `PlantIdentifier`
  interface so a dedicated API (Plant.id / Pl@ntNet) can replace it later.
- **Audience:** 13+ only. No COPPA scope for MVP.

## Open

| # | Question | Why it matters | Affects |
|---|----------|----------------|---------|
| 1 | Seed region scope — NJ only, NE US, or broader? | Smaller region = better AI match accuracy, fewer missing Library entries | `LIBRARY_SEED.md`, `AI_INTEGRATION.md` |
| 2 | Target species count for initial seed (e.g. ~300)? | Sizes the seed job and PlantDex completion math | `LIBRARY_SEED.md`, `POINTS_AND_RARITY.md` |
| 3 | Leaderboard scope — global, friends-only, or both? | Changes data model + query design | `DATA_MODEL.md`, `API_CONTRACT.md` |
| 4 | Daily same-species capture quota — exact number? | Diminishing-returns rule needs a concrete cap | `POINTS_AND_RARITY.md` |
| 5 | Persist plant-chat history in MVP, or session-only? | Adds/removes `ChatMessage` writes | `DATA_MODEL.md`, `AI_INTEGRATION.md` |
| 6 | Monorepo or two repos for mobile + backend? | Day-one structural decision (leaning monorepo) | `REPO_STRUCTURE.md` |
| 7 | How is rarity assigned at seed time vs. recomputed from observation frequency later? | Affects points and the rare-marker UI | `POINTS_AND_RARITY.md`, `LIBRARY_SEED.md` |
| 8 | Coordinate-fuzzing radius for rare/sensitive plants? | Privacy rule needs a concrete distance | `SECURITY_AND_PRIVACY.md` |

## Resolved

_(none yet — move items here from "Open" with the decision and date.)_
