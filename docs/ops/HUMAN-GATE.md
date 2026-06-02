# Human Gate Substrate

The first workflow system with native human-in-the-loop gates. No other vendor (Anthropic CCR, Codex Automations, Vercel Workflows, Gemini Enterprise, GitHub Actions, Trigger.dev, Inngest) ships `await human.approve(context)` with zero-token suspend + checkpoint resume. FrankX does, as a convention.

## How it works

A workflow that needs human approval ends with a `humanGate` phase:

1. Workflow generates its draft/output normally
2. Automated gate (e.g. `@integrity-guard`) checks quality criteria
3. If automated gate passes/warns: workflow creates a gate record and exits with `pendingApproval: true`
4. Operator reviews preview at the path in `previewPath` and runs `pnpm gates:approve <gateId>` (or `:reject`)
5. Next workflow invocation (manual or next scheduled run): checks gate state; if approved, performs the gated action (send newsletter, apply hub edit, etc.)

The gate state lives in `data/workflow-gates.jsonl` (gitignored — operational state, not source).

## Gate record schema

```json
{
  "gateId": "gate_a1b2c3d4",
  "runId": "wf_abc123def",
  "workflow": "newsletter-friday",
  "step": "send-newsletter",
  "title": "Newsletter Issue 2 ready to send",
  "summary": "5 spotlight signals + essay on multi-agent orchestration",
  "previewPath": "content/newsletters/issues/issue-2.mdx",
  "approvalUrl": "/admin/workflow-gates/gate_a1b2c3d4",
  "status": "pending" | "approved" | "rejected",
  "createdAt": "2026-06-02T01:23:00.000Z",
  "decidedAt": null,
  "decidedBy": null,
  "decision": null,
  "notes": null
}
```

## CLI operations

| Command | Purpose |
|---|---|
| `pnpm gates:list` | All gates |
| `pnpm gates:list -- --pending` | Only pending gates (operator review queue) |
| `pnpm gates:approve <gateId> [--notes "..."]` | Approve — next workflow run proceeds |
| `pnpm gates:reject <gateId> [--notes "..."]` | Reject — workflow does NOT proceed |
| `node scripts/workflow-gates.mjs check <runId> <step>` | Workflow-internal check (called via Bash agent inside workflow) |
| `node scripts/workflow-gates.mjs create --runId X --workflow Y --step Z --title "..." [--previewPath path]` | Workflow-internal create |

## Workflow integration pattern

Inside a workflow that needs a humanGate:

```js
phase('Human Gate')
// Check if this run already has an approval decision
const gateState = await agent(
  `Check workflow gate. Run: node scripts/workflow-gates.mjs check ${runId} send-newsletter\n` +
  `If found and status=approved: return {approved: true, gateId, decision: 'approved'}\n` +
  `If found and status=rejected: return {approved: false, decision: 'rejected', notes}\n` +
  `If not found: run \`node scripts/workflow-gates.mjs create --runId ${runId} --workflow newsletter-friday ` +
  `--step send-newsletter --title "Newsletter Issue ${issue} ready" --summary "${summary}" ` +
  `--previewPath content/newsletters/issues/issue-${issue}.mdx --createdAt ${now}\` and return {approved: false, decision: 'pending', gateId}`,
  { phase: 'Human Gate', schema: GATE_STATE_SCHEMA, model: 'haiku' }
)

if (!gateState.approved) {
  log(`Human gate ${gateState.decision}: ${gateState.gateId}. Re-run after operator decision.`)
  return { ...partialResult, awaitingHumanGate: true, gateId: gateState.gateId, decision: gateState.decision }
}

// Approved — proceed with the gated action
phase('Send')
// ... actual ship action only runs after approval
```

## Where it lives

- `scripts/workflow-gates.mjs` — CLI (list/check/create/approve/reject)
- `data/workflow-gates.jsonl` — gate state (gitignored)
- `docs/ops/HUMAN-GATE.md` — this doc
- Package scripts: `gates:list`, `gates:approve`, `gates:reject`

## Why this matters commercially

Universal missing primitive across hosted-agent vendors. From the 2026-06-02 evidence briefing (33 citations):

> "The pattern everyone wants and nobody has shipped: platform-native `await human.approve(context)` that suspends mid-run with zero token consumption, surfaces a rich approval card, and resumes from exact checkpoint."

Marketing line: **"The first workflow system with native HITL gates."** Defensibility for the €1000 tier.

## Future work (Phase 2)

- `/admin/workflow-gates` Next.js page — visual approval card with diff preview, one-click approve/reject
- Slack/email notification on gate creation
- Auto-expire gates after N days (cleanup pending decisions)
- Gate templates (predefined gate titles/schemas per workflow)
- Resume from arbitrary phase (currently workflow re-runs all earlier phases on next invocation; needs typed WorkflowState for true checkpoint resume)
