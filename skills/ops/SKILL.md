---
name: Ops Cadence
description: Run the weekly FrankX operations loop — triage the inquiry inbox, advance the CRM pipeline, sweep open PRs across repos, and surface the content plan. Use for "/ops", "run the ops loop", "weekly ops", "triage inquiries", "what needs my attention", or any business-operations check-in.
version: 0.1.0
triggers:
  - "/ops"
  - "run the ops loop"
  - "weekly ops"
  - "triage inquiries"
  - "what needs my attention"
  - "ops check-in"
inputs:
  required: []
  optional: [mode, since]
outputs:
  - A prioritized ops readout (inbox · pipeline · PRs · content)
  - Optional: drafted replies, advanced Notion stages, PR actions
dependencies: [frankx-brand]
mcp: [notion, github, slack]
---

# Ops Cadence

The execution layer of the FrankX Operations System. One command surfaces
everything that needs Frank's attention across the business and drives each
item one step forward. Pairs with the capture/acknowledge/track layers built
into frankx.ai (`/api/intake` → Notion "Inquiries" CRM). See
`docs/ops/OPERATIONS_SYSTEM.md` in the website repo for the full architecture.

## When to run

- **Weekly** (Monday) — the full loop, as a planning ritual.
- **On demand** — "what needs my attention?" before a focus block.
- **After a launch** — when inbound spikes and the pipeline needs triage.

## The loop

Four passes, each ending in a concrete action — not just a report.

### 1. Inbox — triage new inquiries

Source: Notion **Inquiries (CRM)** database (or `/admin/intake` if Notion isn't
wired yet). Pull every row at stage `New`.

For each:
- Classify urgency (commercial intent + named company + specific ask = hot).
- Draft a reply in Frank's voice (technical-authority register — see
  `VOICE_ROUTER.md`). Lead with the answer, propose the next step (call / scope / no-fit).
- Advance the Notion `Stage`: `New → Triaged`.

Output: a ranked list — hot leads first, each with a ready-to-send draft.

### 2. Pipeline — advance the CRM

Pull rows at `Triaged`, `Call booked`, `Proposal`.

For each, name the single next action and who owns it:
- `Triaged` with no reply sent → send the draft.
- `Call booked` with date passed → log outcome, move to `Proposal` or `Lost`.
- `Proposal` aging > 7 days → nudge or mark `Lost`.

Flag anything stuck > 14 days. Stale pipeline is the silent killer.

### 3. PRs — sweep open work

Across `frankxai/frankx.ai-vercel-website` and `frankxai/agentic-creator-os`:
- List open PRs with CI status + review state.
- Green + reviewed → flag for merge.
- Red CI → diagnose (one line) + propose the fix.
- Stale draft (> 7 days, no activity) → decide: finish, or close and capture the idea in `BRANCH_AUDIT.md`.

Output: a merge queue and a fix queue.

### 4. Content — surface the plan

- What shipped since last loop (blog, builds, social)?
- What's queued / half-built (draft PRs, `content/builds/*` at `status: wip`)?
- One recommended next piece, tied to a real build (feed the `/build-log` flywheel).

## Modes

| Mode | Scope |
|---|---|
| `full` (default) | All four passes. |
| `inbox` | Just triage new inquiries + draft replies. |
| `pipeline` | Just advance CRM stages. |
| `prs` | Just the PR sweep. |

## Output shape

```
## Ops Readout — <date>

### 🔥 Hot (act today)
- <Name, Company> · <intent> — <one-line ask> → [draft ready]

### 📥 Inbox (N new)
...

### 📊 Pipeline (N active)
- Stuck > 14d: ...
- Next actions: ...

### 🔀 PRs
- Merge queue: ...
- Fix queue: ...

### ✍️ Content
- Shipped: ... | Queued: ... | Recommend next: ...
```

## Guardrails

- **Never auto-send** a reply or advance a `Won`/`Lost` stage without Frank's
  confirmation. Draft and propose; Frank approves.
- **Voice:** technical authority. Lead with the answer, link the artifact, let
  the work speak. No hype, no guru language.
- **Honesty:** if the pipeline is empty or PRs are all clean, say so plainly.
  An ops loop that invents busywork is worse than none.
