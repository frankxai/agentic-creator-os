# agentic-creator-os â€” Agent Instructions

Read `CLAUDE.md` first (and `GROK.md` if present). They define ACOS v11+, Frank DNA, safety hooks, commands, skills, agent standards, and Grok Build (xAI) harness integration via grok-harness-adapter (see new .claude/skills/grok-harness/ + adapters/grok/). 5-fleet + SIP partition (grok-personal .grok-only seeds only).

## Repo Role

`agentic-creator-os` is the reusable Agentic Creator OS substrate: commands, skills, workflow patterns, agent behavior standards, and safety primitives used by FrankX and sibling creative systems.

## Work Pattern

1. Read `CLAUDE.md` (and `GROK.md`/`AGENTS.md` for Grok) + any referenced `.claude/` / `.grok/` or skill docs before edits. Deeper wins.
2. Preserve the Frank DNA and safety-first ACOS behavior. Apply repo-mastery + excellence (gstack/santa/verification) gates on Grok/ACOS changes. Read rules first (CLAUDE > AGENTS > GROK > deeper).
3. Prefer improving existing commands/skills/hooks over inventing parallel surfaces. Extend adapters/grok/ + install.sh for Grok Build harness (keep seeds in sync between .ts and .sh). Add to .claude/skills/grok-harness/ for Claude-side awareness.
4. Keep output practical and implementation-oriented; avoid abstract claims without examples. Show evidence (gstack screenshots, diffs, metrics).
5. Do not touch unrelated dirty/untracked files. Scope with freeze/gstack-guard when needed.

## Commands

```bash
npm run build:all
npm run install:all
```

The registry currently lists `pnpm test`, but `package.json` does not define a test script. If adding tests, add the script deliberately and document the runner.

## Safety

- Never weaken safety hooks, circuit breakers, audit trails, or self-modify gates without an explicit operator decision.
- Treat ACOS as a shared substrate. Backward compatibility matters.
- If changing public package behavior, update docs and versioning intentionally.

## Known Doc Drift (verify before quoting counts/version)

Version and skill/command/agent counts disagree across sources as of 2026-07-17 — do not copy any single number into new docs, marketing, or code without re-checking:

- `package.json` version: `15.0.0`. `README.md` badge: `14.0.0`. `CLAUDE.md` title: `v10`, footer: `v10.1`. `AGENTS.md` (this file, historically): `v11+`.
- `README.md` tagline (line ~7): "90+ skills, 65+ commands, 38 agents". `README.md` architecture table (line ~59): "75+ skills, 35+ commands, 38 agents". `package.json` description: "90+ skills, 65+ commands, 38 agents, 8 plugins".
- `node scripts/build-catalog.mjs` (generated, 2026-07-17 run): `{"agent":147,"skill":26,"command":50,"workflow":10,"iam-profile":6}`.
- Raw filesystem count (2026-07-17): `.claude/skills/` 112 subdirs, `.claude/commands/*.md` 84 files, `.claude/agents/*.md` 68 files — none of which match the catalog output either, likely because the catalog dedupes/filters templates and deprecated entries differently than a flat `find`.

This is tracked estate-wide as the "4-way count anarchy" problem (a generated-constants fix was designed but not yet applied). Do not hand-fix individual numbers in isolation — that just adds a fifth source of truth. If you need an authoritative count, regenerate via `node scripts/build-catalog.mjs` and treat its output as current-best, then flag any doc it contradicts rather than silently overwriting.

## Design Taste Kernel

For any site, app, landing page, dashboard, visual identity, brand, motion, media, social, or frontend task, apply the shared Design Taste Kernel before handoff:
- C:\\Users\\frank\\starlight\\repos\\DESIGN_TASTE.md
- C:\\Users\\frank\\starlight\\repos\\WEB_EXPERIENCE_STANDARD.md
- C:\\Users\\frank\\starlight\\repos\\MOTION_TASTE_RUBRIC.md
- C:\\Users\\frank\\starlight\\repos\\MULTI_AGENT_DESIGN_COUNCIL.md
- C:\\Users\\frank\\starlight\\repos\\VISUAL_QA_GATE.md
When motion, scroll, generated media, GIF/video, or premium polish matters, route through the Motion Design Studio plugin/skills and verify the result visually.
## Frontend-Ultimate System (World-Class Frontend + Skill Provider)

The ultimate frontend development agent, design skill hub, and complete end-to-end team for every site across the 93 repos (Arcanea visual, GenCreator OS/CoE, FrankX authority, Starlight substrate, _visual-qa, etc.).

**Core Files (tracked in this repo and starlight structure)**:
- Skill: `~/.hermes/skills/frontend-ultimate/SKILL.md` (aggregates claude-design, popular-web-designs, manim-video, pretext, touchdesigner-mcp, comfyui, p5js, coding-agents, codex, plan, github-repo-management + all official creative packs from Nous Creative Hackathon)
- Codex Prompt: `~/.codex/prompts/frontend-ultimate.md` (Vercel-first verification per this AGENTS.md + taste kernel)
- Playbook: `~/FRONTEND_PLAYBOOK.md` (segmentation, commands, workflows, repo categories)
- Design Taste Kernel files listed above (enhanced by frontend-ultimate)

**Wired into Loops, Hooks & Orchestration**:
- **Profiles**: Use `hermes --profile arcanea| gencreator| frankx| starlight| tooling` with `-s frontend-ultimate,...`
- **Delegation**: `delegate_task` or `codex exec` with context from playbook + this AGENTS.md + .codex/AGENTS.md
- **Kanban/Cron**: Starlight dispatches tasks that load the skill; daily visual/motion sweeps
- **.agent-orchestrator.yaml**: Worker rules reference frontend-ultimate for design/frontend tasks; Codex workers for impl
- **Claude Code hooks / .claude/skills**: Reference the creative packs and frontend-ultimate for design tasks
- **.codex/prompts**: Load frontend-ultimate.md for all frontend work
- **Safety & DNA**: Always read CLAUDE.md first; apply Frank DNA + safety hooks before any frontend change

**Usage for Any Site**:
1. Load in correct profile with the skill.
2. Apply Design Taste Kernel + creative packs (Pretext typography, TouchDesigner real-time visuals, ComfyUI pipelines, p5.js generative, manim motion).
3. Produce artifact → Codex impl with Vercel verification → visual QA gate.
4. Track changes in this repo's AGENTS.md / design.md / ECOSYSTEM.md.

This system is absorbed into the ACOS substrate for persistent, self-improving frontend excellence across all brands and repos.
When motion, scroll, generated media, GIF/video, or premium polish matters, route through the Motion Design Studio plugin/skills and verify the result visually.


<!-- PREMIUM-WEB-OS:START -->
## Premium Intelligence Web OS Adoption

This repo participates in the Starlight Premium Intelligence Web OS.

For any website, app, landing page, dashboard, brand surface, visual asset, motion system, 3D/WebGL scene, generated media, or public-facing UI work:

- Read the estate OS first: `C:\Users\frank\starlight\repos\_intelligence\README.md`.
- Use the activation contract: `C:\Users\frank\starlight\repos\_intelligence\adoption\activation-contract.md`.
- Treat `C:\Users\frank\starlight\repos\_intelligence\` as the source of truth for premium web taste, design, motion, WebGL, copy, assets, and quality gates.
- Use `/pwo` or the `premium-web-os` skill for full builds; use `/mad` for a design council pass.
- Use `/pwo review-pr` before absorbing another agent's PR or branch.
- Use `/pwo absorb-assets` before using external, generated, scientific, audio, video, or 3D assets.
- Use `/pwo motion-score` before shipping cinematic scroll, sound-paired motion, or complex choreography.
- Build static composition first, add Track A local motion second, add Track B GSAP/Lenis scroll only when earned, and add 3D only with fallback and reduced-motion behavior.
- Use VIS through `C:\Users\frank\starlight\repos\visual-intelligence` for asset provenance, curation packets, rights, and publication records.
- Use `C:\Users\frank\starlight\repos\_intelligence\visual-worlds\neural-cosmos.md` for neuroscience, cerebrum, spine, electron, signal, or golden spiral direction.
- Do not copy reference sites or agencies. Deconstruct principles and create original execution.
- Do not ship without responsive, accessibility, performance, reduced-motion, and visual QA checks appropriate to the change.

Repo-local instructions remain authoritative when stricter.
<!-- PREMIUM-WEB-OS:END -->

<!-- STARLIGHT-REPO-CONTRACT:START -->
## Starlight repository contract

Contract: `starlight.repo_profile.v2` · Team: `arcanea-creative-worlds-team` · Priority: `now`
- Work only in assigned paths and preserve unrelated dirty files.
- Read `SYSTEM.md`, `SCHEMA.md`, and `SKILLS.md` before architectural changes.
- Use the smallest 3–5 role team and an independent verifier for release-affecting work.
- Required handoff: artifacts, checks, verifier verdict, risks, approvals, rollback, and next bounded action.
- Human-gated actions: DNS, secrets, billing, spend, migrations, destructive operations, permissions, legal/IP, brand identity, external sends, and high-risk production changes.
<!-- STARLIGHT-REPO-CONTRACT:END -->
