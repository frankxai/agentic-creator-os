# Model intelligence — where ACOS gets model evaluation data

ACOS no longer runs its own model arena. The `scripts/model-arena/` fork that
lived here was a frozen copy of the FrankX harness: it never produced a round,
missed the upstream fix that stopped `--simulate` from overwriting the canonical
leaderboard, and duplicated a system that publishes its data anyway.

Consume the published surfaces instead:

| Need | Surface |
|---|---|
| Model facts, pricing, capabilities | `https://frankx.ai/llm-hub.json` |
| Arena rounds + receipts | `https://frankx.ai/research/model-arena` (receipts manifest planned at `receipts.json`) |
| Open receipts + methodology repo | `https://github.com/frankxai/starlight-evals` |

Consumer rules (from the shared-intelligence contract in the FrankX repo):
read at build time and cache, carry the caveats and sources with every number,
**never re-rank** (the sources deliberately publish per-axis pass-rates with
evidence counts, not a global winner), attribute and link back, never write back.
