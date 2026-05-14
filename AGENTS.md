# agentic-creator-os — Agent Instructions

Read `CLAUDE.md` first. It defines ACOS v10, Frank DNA, safety hooks, commands, skills, and agent standards.

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

The registry currently lists `pnpm test`, but `package.json` does not define a test script. If adding tests, add the script deliberately and document the runner.

## Safety

- Never weaken safety hooks, circuit breakers, audit trails, or self-modify gates without an explicit operator decision.
- Treat ACOS as a shared substrate. Backward compatibility matters.
- If changing public package behavior, update docs and versioning intentionally.

