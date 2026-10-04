# Loop spec

A loop is recurring work with an owner and a receipt. If it has no receipt, it
did not run.

## Anatomy

| Field | Meaning |
| --- | --- |
| `id` | kebab-case, prefixed with the brand or role (`acme-weekly-content`) |
| `trigger` | schedule, event (pull request, deploy, inbox item), or request |
| `cadence` | daily, weekly, monthly, quarterly, or per-event |
| `owner` | one agent id; a General or a brand specialist |
| `inputs` | what it reads (sources, queues, metrics) |
| `steps` | sense → decide → act → verify → learn |
| `gate` | human gates it stops at (`publish`, `money`, `merge`, `deploy`, `secrets`, `delete`) |
| `eval` | how quality is checked (eval case, check script, spot sample) |
| `receipt` | where the evidence lands (log line, issue comment, report file) |
| `escalation` | who hears about a miss, and when |

## Steps

1. **Sense:** collect the inputs; measure, do not assume.
2. **Decide:** choose the action within the owner's mandate.
3. **Act:** do it, or prepare it and stop at the gate.
4. **Verify:** run the check; a failed check is reported, not hidden.
5. **Learn:** write one memory entry if something new was learned; otherwise nothing.

## Classes

| Class | Example | Default gate |
| --- | --- | --- |
| Pulse | weekly cash, visibility, quality | none (read-only) |
| Production | content draft → approve → publish | publish |
| Maintenance | dependency bumps, stale pull requests, dead skills | merge |
| Learning | quarterly kernel review | substrate review |

## Rules

- A loop runs where its receipt is visible to the next session on any machine.
- Machine capacity first: a loop that needs a new parallel session waits when the machine is constrained.
- Hooks stay telemetry-only; loops run as commands, scheduled tasks, or CI, never as blocking hooks.
- Two misses in a row escalate to the loop's owner and the COO.
