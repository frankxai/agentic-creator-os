# agentic-creator-os — Agent Instructions

Read `CLAUDE.md` first — it defines ACOS v12: design principles, the CREATOR.md
identity contract, hook doctrine, and engineering rules. `GROK.md` is a thin
pointer for Grok Build; deeper files win over shallower ones.

## Repo Role

The reusable, MIT-licensed Agentic Creator OS core: skills, commands, agents,
telemetry hooks, and MCP servers for creator production work. Personal/instance
content lives only under `instances/<name>/`. Premium/pro layers live outside
this repo.

## Work Pattern

1. Read `CLAUDE.md` and the specific skill/command docs before editing.
2. Prefer improving existing commands/skills/hooks over inventing parallel
   surfaces.
3. Counts and inventories are generated: run `node scripts/generate-stats.mjs`
   after adding/removing assets; CI fails on stale STATS.md, empty skills,
   phantom skill-rule targets, and leaked private content.
4. Keep output practical; show evidence (diffs, test output), avoid abstract
   claims.
5. Do not touch unrelated dirty/untracked files.

## Commands

```bash
npm run build:all              # build MCP servers
node scripts/generate-stats.mjs        # refresh STATS.md
node scripts/generate-stats.mjs --check  # CI gate locally
```

There is no test script yet; if you add tests, add the script deliberately and
document the runner.

## Safety

- Never weaken telemetry hooks or CI gates without an explicit operator decision.
- Hooks stay fast, Node-based, telemetry-only (no quality gates, no network).
- Treat ACOS as a shared substrate: backward compatibility matters; if changing
  public behavior, update docs and versioning intentionally.
- Never commit personal-machine paths, employer references, session telemetry,
  or internal pricing/strategy — the CI leak gate enforces this.
