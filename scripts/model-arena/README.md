# Model Arena — multi-provider runner

> Head-to-head evals across the **top frontier models** (not just Claude), on an
> **evolving** task bank, that **learns** from every round. Feeds the
> `model-arena-daily` workflow and, on curation, the public
> `frankx.ai/research/model-arena` page.

## Why this exists (and why the old arena was Claude-only)

The Claude Code Agent/Workflow harness can only spawn **Claude** models via the
`model` override (`fable` / `opus` / `sonnet` / `haiku`). That is the whole
reason the previous `model-arena-daily` workflow compared only Claude tiers — it
was a platform limit, not a choice. To put GPT-5.5, Gemini, Grok, DeepSeek,
Qwen, Kimi, and Mistral in the same ring you need an external gateway.

This runner uses **OpenRouter** — the sanctioned LLM route in `CLAUDE.md`
(`OPENROUTER_API_KEY` + `OPENROUTER_BASE_URL`) — to dispatch the same task to
every model, verify mechanically, and keep a leaderboard.

## Files

| File | Role |
|---|---|
| `roster.json` | Who's in the ring. Registry-id → OpenRouter slug + `arena_active`. Source of truth for **who competes** (the registry stays source of truth for model **facts**). |
| `tasks.json` | The **evolving** task bank. Meaningful capability axes, mostly self-verifying, with per-task `state` + `history` for the learning loop. |
| `run.mjs` | The runner: rotate tasks → dispatch → verify → receipt → leaderboard → learn. |
| `../../data/model-arena/leaderboard.json` | Standings (pass-rate per model, per axis). Written by the runner. |
| `../../data/model-arena/runs/<date>.json` | Per-round receipt (the durable output). |

## Running

```bash
node scripts/model-arena/run.mjs --check       # validate roster + tasks, exit
node scripts/model-arena/run.mjs --plan         # print the round plan, no dispatch
node scripts/model-arena/run.mjs --simulate     # full pipeline with canned responses (no network) — CI/verification
node scripts/model-arena/run.mjs                # live dispatch via OpenRouter (needs OPENROUTER_API_KEY)
#   flags: --tasks N (round size, default 4) · --week N (rotation seed) · --date YYYY-MM-DD
```

Without `OPENROUTER_API_KEY` a live run **degrades** to plan-only (`mode:plan`,
`degraded:true`) instead of failing — so a CCR routine never hard-errors on a
missing key; it reports what it *would* have run.

## The learning loop

1. Each round records `{date, passRate}` into every scored task's `history`.
2. When a task's pass-rate is ≥ `saturation_threshold` (0.95) across
   `saturation_rounds` (2) consecutive rounds, it flips to `state: saturated`
   and the runner emits a **"harden this axis"** learning. Saturated tasks stop
   being dispatched — a saturated task teaches nothing.
3. **New model releases** feed the roster: the `model-arena-daily` workflow
   diffs `data/model-registry.json` (maintained by `/new-model`) against
   `roster.json` and flags any GA model missing from the ring.

That's the two-sided evolution the arena needs: tasks get harder as models
saturate them; the field grows as new models ship.

## Verifiers

`run.mjs` scores objective tasks mechanically — no LLM judge can launder a
constraint violation:

`numeric` · `exact` · `contains` · `not_contains` · `regex` · `word_count`
(count + lowercase + no-punct) · `json_schema` (parse + required keys + tag
count + lowercase + no-prose).

`judge` tasks return `pass:null` from the script and are scored by a **blind,
cross-family** judge (default `openai/gpt-5.5`) in the workflow layer — killing
the Claude-family-bias caveat the public arena has carried. Per arena task-design
rules, judged tasks stay ≤ half the card.

## Maintenance

- **Slugs drift.** `openrouter_slug` is best-effort; verify against
  <https://openrouter.ai/models>. A bad slug is recorded as a per-model dispatch
  error for that round, never a silent fail of the model.
- **Adding a model:** add a row to `roster.json` (or let new-model detection
  flag it), set `arena_active` once it has a hosted endpoint.
- **Adding a task:** append to `tasks.json` with `state:"active"`, a mechanical
  `verifier` where possible, and a `caveat` stating the ground truth.

## Honest caveats (they ship in every receipt)

- n=1 per (task, model, round) — directional, not statistical. Promote a claim
  only after repeated rounds agree.
- This measures **model-via-OpenRouter at temperature 0**, not
  model-in-Claude-Code-harness. The workflow keeps a separate in-harness Claude
  cross-check so both views exist.
- Registry benchmark numbers are vendor-claimed until independently reproduced;
  the arena's own pass-rates are first-party but small-n.

Built on SIP.
