# agentic-creator-os — Agent Instructions

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
npm run agents:compile   # agent-os specs → .claude/agents/general-*.md (+ frankx instance)
npm run agents:check     # CI-style: compiled agents fresh, graph obeys the ontology
npm run estate:audit -- --repos <dir>   # score every skill/agent/command an operator can load
```

## Agent OS

Generals (CEO, CTO, CMO, CFO, COO, CPO, CAIO, CHRO, CCO) and instance Domain Queens are compiled from
`agent-os/` — the Expertise Kernel plus one role module each. Edit the spec,
module, or kernel, then run `npm run agents:compile`; never hand-edit
`.claude/agents/general-*.md`. Standards (ontology, agent, skill, soul, memory,
loop, commands, mesh, always-on) live in `docs/agent-os/`. Domain Queens come from
`node scripts/org-import.mjs --org instances/frankx/agent-os/org/domain-queens.json --instance frankx`.

The registry currently lists `pnpm test`, but `package.json` does not define a test script. If adding tests, add the script deliberately and document the runner.

## Safety

- Never weaken safety hooks, circuit breakers, audit trails, or self-modify gates without an explicit operator decision.
- Treat ACOS as a shared substrate. Backward compatibility matters.
- If changing public package behavior, update docs and versioning intentionally.

