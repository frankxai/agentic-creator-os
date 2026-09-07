# Signal — LinkedIn Authority Engine

The LinkedIn vertical of ACOS, and the flagship pack of **The Studio**. Signal drafts, critiques, repurposes, and stages LinkedIn content in a specific creator's voice — for a personal brand and a company brand — then learns from what performed. It runs the [Excellence Loop](../../docs/architecture/EXCELLENCE_LOOP.md) and **never auto-posts**: a human ships.

## Files

| File | What |
|---|---|
| `SKILL.md` | The operating skill — modes, the two-brand model, the non-negotiables. |
| `personas.md` | The two voice specs (personal + company). Fill the `<placeholder>` fields before first use. |
| `knowledge.md` | The moat — hook taxonomy, format playbooks, the Dream100 method, cadence defaults. |
| `../../.claude/commands/signal.md` | The `/signal <mode>` command surface. |

## Quick start

1. Fill `personas.md` (both brands) and seed your Dream100 in `knowledge.md` §3.
2. `/signal draft topic="<your idea>"` — get a staged draft in your personal voice.
3. `/signal repurpose source=<url>` — turn a great post into a credited reframe (the highest-ROI motion).
4. `/signal critique` before anything ships. A human posts.

## Why it's different

Not "an AI that writes LinkedIn posts." Signal (a) runs an independent voice/claim/hook critique before a draft is shippable, and (b) writes every _shipped_ post's real performance back, so next week's drafts are grounded in what worked — not a blank prompt. That closing loop is the product; see `docs/architecture/L99_BLUEPRINT.md` for the build sequence that makes the compounding claim true.

## Compliance

LinkedIn's terms forbid automated posting and commenting via unofficial means. Signal drafts and stages; a human confirms every post and every Dream100 comment. This is the compliant design — and the simpler one.

Built on SIP.
