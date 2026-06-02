# Trajectory Memory Substrate

Every workflow run learns from prior runs. The lock-in mechanism that turns "schema-validated cron" into "workflow system that compounds." Pattern from Karpathy AutoResearch (`results.tsv` ratchet loop) + IBM Research (arxiv 2603.10600 — trajectory-informed memory generation).

## How it works

1. **Recall at start.** First phase of every workflow runs `workflow-trajectory.mjs recall --workflow <name>` to fetch the last 3 successful runs' outcomes + lessons learned. This injects into the workflow's system context — "what worked last time, what failed."

2. **Record at end.** Last phase of every workflow runs `workflow-trajectory.mjs record --workflow <name> --runId X --outcome success --tokens N --findings N --lessonsLearned "..."` to persist the run.

3. **Compound over time.** After 5 runs, the workflow has empirical context about what works. After 20 runs, it's measurably better than its cold-start equivalent.

## Trajectory record schema

```json
{
  "workflow": "newsletter-friday",
  "runId": "wf_abc123def",
  "completedAt": "2026-06-02T07:13:42.000Z",
  "outcome": "success" | "failed" | "warned" | "partial",
  "summary": "Issue 4 shipped — 5 spotlights, AI Architect essay, 220 words",
  "tokens": 187432,
  "agentCount": 4,
  "durationMs": 295000,
  "findings": null,
  "notes": "research-pulse-daily queue had 7 ship-worthy items — used 5",
  "lessonsLearned": [
    "When research-pulse queue >5 items, agents can split spotlights into 2 sections",
    "Friday morning runs that hit cache compression saved 35% tokens vs. cold"
  ]
}
```

## CLI operations

| Command | Purpose |
|---|---|
| `pnpm traj:recall -- --workflow X [--limit 3]` | Get last N runs of workflow X — returns JSON for prompt injection |
| `pnpm traj:record -- --workflow X --runId Y --outcome success [...]` | Persist a run record |
| `pnpm traj:stats` | Table of run counts + success rates across all workflows |

## Workflow integration pattern

Inside a workflow:

```js
phase('Recall')
const priorRuns = await agent(
  `Run: node scripts/workflow-trajectory.mjs recall --workflow newsletter-friday --limit 3\n` +
  `Return the JSON output. We use the summary + lessonsLearned to inform this run.`,
  { phase: 'Recall', schema: RECALL_SCHEMA, model: 'haiku' }
)

log(`Prior runs context: ${priorRuns.summary}`)

// ... main work happens, with priorRuns.lessonsLearned in the system prompt of synth phase ...

phase('Record')
await agent(
  `Run: node scripts/workflow-trajectory.mjs record --workflow newsletter-friday ` +
  `--runId ${runId} --outcome success --tokens <observed> --findings <count> ` +
  `--summary "${escaped(summary)}" --lessonsLearned "lesson1|lesson2"`,
  { phase: 'Record', model: 'haiku' }
)
```

## Where it lives

- `scripts/workflow-trajectory.mjs` — CLI (recall/record/stats)
- `data/workflow-trajectories.jsonl` — append-only log (gitignored)
- `docs/ops/TRAJECTORY-MEMORY.md` — this doc
- Package scripts: `traj:recall`, `traj:record`, `traj:stats`

## Why this matters commercially

From the 2026-06-02 evidence briefing:

> "Each workflow run is amnesic. The IBM Research pattern (extract actionable learnings from traces → persistent memory → agents avoid repeated failure modes) is exactly what `hook-learn` hints at but doesn't yet do for workflows."

> "Without it: buyers churn month 2 because the product doesn't get smarter. With it: every run compounds — the lock-in mechanism."

## Future work

- `scripts/workflow-trajectory.mjs distill` — periodically compress old runs into longer-term patterns (avoid linear file growth)
- ReasoningBank/AgentDB integration — vector-search across trajectories for semantic recall
- Auto-pruning policy (e.g. keep 30 most recent + monthly snapshots)
- Cross-workflow learning ("research-fanout learned X — relevant to newsletter-friday context")
