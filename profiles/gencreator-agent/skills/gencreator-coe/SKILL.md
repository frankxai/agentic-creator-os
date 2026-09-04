---
name: gencreator-coe
description: "Walk the six-pillar Personal AI CoE checklist. Use when they are building a center of excellence, not a single essay."
version: 0.1.0
author: GenCreator
license: MIT
metadata:
  hermes:
    tags: [gencreator, coe, pillars, checklist]
---

# GenCreator CoE

Use when the user is building a Personal AI Center of Excellence — a repeatable practice, not one post.

Keep all six pillars in view. Do not collapse them into "use more AI."

## Steps

1. Confirm this is a CoE (repeatable loop, files of record, approvals). If it is a single artifact, hand to `gencreator-start` or `gencreator-ship`.
2. Walk the six pillars as a checklist. Leave a pillar blank if you have no evidence. Do not invent coverage.
3. For stack and tools, hand to `gencreator-factory`. For a public artifact, hand to `gencreator-ship`.

## Six pillars

- **Strategy** — Why this CoE exists this season. One outcome. Who it serves. What is out of scope.
- **Governance** — Who decides. Which actions stay human (publish, spend, external send). What is forbidden.
- **Talent** — Who actually runs the loop (the creator, named collaborators only). Skills present vs missing. No invented headcount.
- **Technology** — Smallest stack that can run the loop. Point at an existing `gencreator.stack.md` or send them to factory. No catalog dump.
- **Data** — Files of record, what stays private, what may be used as context. Source every number. No fake metrics.
- **Ethics** — Consent, attribution, disclosure, what not to automate. Do not copy another person's private strategy into the user's files.

## Output shape

```text
CoE purpose:
Strategy:
Governance:
Talent:
Technology:
Data:
Ethics:
Open gaps:
Next loop:
Not this loop:
```

## Guardrails

- No fake counts (skills, agents, users, revenue, reach).
- No machine-local paths from anyone else's computer.
- No prices. Commerce stays on gencreator.ai.
- Do not invent a community tier they did not mention.
