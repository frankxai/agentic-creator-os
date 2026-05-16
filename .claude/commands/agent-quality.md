---
description: Run the ACOS agent-quality audit — 9-check rubric over .claude/agents/*.md, produces ranked priority queue
argument-hint: "[agent-name | --json | nothing for full audit]"
---

# /agent-quality — ACOS Agent Quality Audit

Run the deterministic 9-check structural audit over every `.claude/agents/*.md` file. Surfaces which agents need revision first.

This is the **slash-command surface** for the audit. The `@meta-agent-quality-auditor` subagent uses the same script.

## Workflow

### 1. Determine scope

If `$ARGUMENTS` is empty → audit all agents.
If `$ARGUMENTS` is `--json` → output JSON for tooling/CI.
If `$ARGUMENTS` is an agent name (e.g., `meta-acos-router`) → audit just that one.

### 2. Run

```bash
node scripts/agents/audit-agent-quality.mjs $ARGUMENTS
```

Equivalent invocations:
- `npm run agents:quality` — full audit, writes report
- `npm run agents:quality:json` — JSON to stdout (CI-friendly)

### 3. Report

The script writes two artifacts:
- `docs/acos/agent-quality-audit-<date>.md` — human-readable ranked report
- `.frankx/machine/agent-quality-audit-<date>.json` — machine-readable snapshot

Console summary shows:
- Total audited
- Disqualified count (existential gate fail)
- L99-ready count (score 9/9)
- Mean score
- Top 8 priority fixes

### 4. The 9-check rubric (what it scores)

1. **Frontmatter complete** — name/description/tools/model (EXISTENTIAL)
2. **Description with triggers** — ≥50 chars + auto-fire cues
3. **Tools minimality** — every declared tool referenced in Process
4. **Template-v2 sections** — ≥8 of 10 canonical sections
5. **Memory contract** — Process has recall + remember
6. **Anti-patterns** — ≥4 negation bullets in §8
7. **Brand voice clean** — zero AI-slop hits (EXISTENTIAL)
8. **No Arcanean leak** — zero quarantine matches in prose (EXISTENTIAL)
9. **Smoke fixture exists** — tests/fixtures/<ref>/smoke.mjs present

### 5. When to dispatch the agent instead

Use `@meta-agent-quality-auditor` (subagent) instead of `/agent-quality` (slash) when:
- The audit is part of a larger orchestrated flow
- You want the result to come back as a structured JSON for downstream tooling
- You need the audit to run with memory recall (subagent does step 0 memory load)

Use `/agent-quality` (this command) when:
- You're a human running it interactively
- You want the report rendered for reading
- You want CI-style exit code

### 6. Follow-up: what to do with findings

See `experiments/2026-05-15-agent-format-best-practices/recommendations.md` for the ranked patch list:
- R1 — Frontmatter migration sprint (16 agents, ~2h, +0.21 mean)
- R2 — Brand-voice cleanup (6 agents, ~30min, clears 6 disqualifications)
- R3 — Smoke fixture sprint (35 agents, ~6h, biggest L99 lift)
