# Always on

Work keeps moving when nobody is at the keyboard by running on three clocks.
Each clock has a cost class and a ceiling on what it may do.

| Clock | Runs on | Cost | May do | May never do |
| --- | --- | --- | --- | --- |
| 1 Per event | CI on pull requests and pushes | free minutes | Check, test, score, block a bad merge | Write to the default branch |
| 2 Scheduled, deterministic | CI cron, local schedulers (no model) | near zero | Measure, write receipts, fail the run with the reason in its summary | Call a model, change code |
| 3 Scheduled, agentic | Cloud routines on a cron (minimum one hour), headless agents | plan usage per run | Branch, change, test, open a pull request with evidence | Merge, deploy, publish, spend, touch secrets |

## Clock 1 and 2 in this repo

`.github/workflows/agent-os.yml` runs on pull requests that touch the Agent OS
and daily at 05:30 UTC: compiled agents fresh, org import fresh, graph valid,
tests green, and the quality ratchet (`estate-audit --min-score`). The scorecard
is written to the run summary.

Local scheduled observer: run the estate audit weekly with a memory guard and
append one receipt line per run, so the next session sees the trend.

## Clock 3: agentic routines

A routine is a self-contained prompt that runs in a fresh cloud session with its
own checkout. It starts with zero context, so the prompt carries everything:

1. **Goal and scope:** one repository, one kind of fix.
2. **Measure first:** run the estate audit on the repository and pick the five lowest-scoring loaded artifacts.
3. **Change:** fix those files to the agent and skill specs; touch nothing else.
4. **Verify:** re-run the audit; the average must rise and no loaded artifact may disappear.
5. **Ship:** open a pull request with the before and after scores; never merge.
6. **Stop:** if the tools or scripts it needs are missing, open no pull request and report why.

Create routines disabled, review the first manual run, then enable. Routines
are paid in plan usage; enabling one is an owner decision.

## Durable execution

Long-running agent workflows that must survive restarts belong on one durable
backbone with one owner per workflow. Do not stitch durability out of cron jobs
and chat sessions.

## Status from receipts

```bash
node scripts/always-on-status.mjs --mesh <mesh.json> [--json] [--no-gh]
```

Reads the `alwaysOn` block of the mesh registry: CI runs, the last pulse
receipt, scheduler jobs, the routine registry, other machines' heartbeats, and
recent dispatch receipts. Anything without a receipt is reported as not running;
a disabled routine is reported as disabled, not as healthy.

## Upstream watch

`scripts/upstream-watch.mjs` checks the frontier repositories listed in
`agent-os/upstreams.json` (what we take from each, and what change should prompt
a review) and reports which moved since the last review. It runs in the daily CI
clock and writes to the run summary; it never blocks and never edits.

## Receipts

Every clock writes a receipt a later session can read without the transcript:
a CI run summary, a receipt line in a local log, a pull request, or a memory
entry. If a clock leaves no receipt, treat it as not having run.
