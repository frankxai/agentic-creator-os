# agentic-creator-os — Agent Instructions

Read `CLAUDE.md` first. It still carries the v10 safety-system lineage, while package metadata and README identify the current package as ACOS v11. Frank DNA, safety hooks, commands, skills, and agent standards remain load-bearing.

## Repo Role

`agentic-creator-os` is the reusable Agentic Creator OS substrate: commands, skills, workflow patterns, agent behavior standards, and safety primitives used by FrankX and sibling creative systems.

## Work Pattern

1. Read `CLAUDE.md` and any referenced `.claude/` or skill docs before edits.
2. Preserve the Frank DNA and safety-first ACOS behavior.
3. Prefer improving existing commands/skills/hooks over inventing parallel surfaces.
4. Keep output practical and implementation-oriented; avoid abstract claims without examples.
5. Do not touch unrelated dirty/untracked files.

## Commands

```bash
npm run build:all
npm run install:all
```

The harness health command is `npm run verify`; it runs `npm run harness:check` and then builds every MCP workspace. If adding tests, wire them into `verify` deliberately and document the runner.

## Safety

- Never weaken safety hooks, circuit breakers, audit trails, or self-modify gates without an explicit operator decision.
- Treat ACOS as a shared substrate. Backward compatibility matters.
- If changing public package behavior, update docs and versioning intentionally.
