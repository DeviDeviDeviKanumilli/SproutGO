# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repo is **pre-implementation**. There is no application code, build system, or test suite yet — only planning documents. Do not invent build/lint/test commands; none exist until the project is scaffolded. When you scaffold the app, update this file with the real commands.

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
