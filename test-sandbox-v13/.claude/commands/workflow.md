---
description: Meta-command for FrankX Workflow Tier operations — list, run, cost, status, validate, docs
argument-hint: "<list|run|cost|status|validate|docs> [workflow-name] [--args=<json>]"
---

# /workflow

Meta-command for all Workflow Tier operations. One entry point for discovery, invocation, observability, validation. Replaces the need for per-workflow slash commands.

## Subcommands

### `/workflow list` — show the catalog

Shows the 14 workflows with tier, cadence, portability, cost envelope, composition graph.

Run:
```bash
node scripts/workflow-catalog.mjs table
```

Or for the Mermaid composition graph:
```bash
node scripts/workflow-catalog.mjs mermaid
```

### `/workflow run <name> [--args=<json>]` — invoke a workflow

Dispatches a named workflow with optional args. The Workflow tool returns a runId; the workflow runs in the background and you get notified on completion.

Examples:
```
/workflow run repo-onboarding
/workflow run hub-audit-rotation --args='{"hub":"library"}'
/workflow run book-deepen-pipeline --args='{"title":"Thinking in Systems","author":"Donella Meadows"}'
/workflow run model-arena-daily
```

Invocation pattern (Claude executes):
```js
Workflow({ name: '<name>', args: <parsed-json> })
```

**Known limitation:** nested object args may not propagate to the script's `args` global for local Workflow tool calls. If a workflow fails with "requires args.X" despite args being passed, use `scriptPath` invocation after editing the snapshot, OR invoke via CCR cloud routine where args go through the prompt.

### `/workflow cost` — show calibrated cost data

Shows the calibrated `estimatedCost` per workflow with `lastRun` evidence where available.

Run:
```bash
node scripts/workflow-catalog.mjs json | jq '[.[]|{name,cost:.acos.estimatedCost,calibratedRuns:.acos.estimatedCost.calibratedRuns}]'
```

### `/workflow status` — live status of in-flight workflows

Use the built-in `/workflows` slash command (or check the cloud routines dashboard).

Cloud routines: https://claude.ai/code/routines

### `/workflow validate` — run the static validator

Validates all `.claude/workflows/*.js` files: meta block schema, composition graph references, agentType references (recursive scan of project + global agent dirs), portable-composes-portable contract.

Run:
```bash
npm run workflow:validate
```

Exit code 0 = clean. Exit code 1 = issues. Already wired into `merge:gate` — broken workflows can't ship to main.

### `/workflow docs` — regenerate operator surface

Regenerates `docs/ops/WORKFLOWS.md` from the catalog. Includes table + Mermaid composition graph + per-workflow descriptions with invocation snippets.

Run:
```bash
npm run workflow:docs
```

## Adding a new workflow

1. Author `.claude/workflows/<name>.js` per the schema in `.claude/skills/acos-meta/SKILL.md` (Workflow Tier section)
2. `/workflow validate` — must exit 0
3. Smoke test on cheapest scenario
4. Calibrate `meta.acos.estimatedCost` from real run
5. `/workflow docs` to regenerate the operator surface
6. Commit + push

## Scheduling a workflow as a cloud routine

For cadence-driven workflows (daily/weekly/monthly), schedule via the `/schedule` skill which creates Anthropic CCR routines that run in the cloud without your machine.

Reference: `docs/ops/SCHEDULED-ROUTINES.md` for active routines and management URLs.

## Anti-patterns

- ❌ Per-workflow slash commands (`/newsletter-workflow`, `/dependency-workflow`) — drift risk, no value over `/workflow run <name>`.
- ❌ Running heavy workflows (`hub-audit-rotation`, `research-fanout`) without checking the calibrated cost envelope first. `hub-audit-rotation` on a 32-page hub costs ~2.8M tokens.
- ❌ Inventing new workflow scripts when an existing one composes the work. Check `composes` graph first.
- ❌ Skipping `/workflow validate` before push. Wired into `merge:gate` but local pre-push is cheaper than CI failure.
