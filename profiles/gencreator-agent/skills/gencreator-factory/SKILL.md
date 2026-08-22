---
name: gencreator-factory
description: "Configure a creator stack: models, tools, files, and approval rules. Use when they ask what to use or how to set up."
version: 0.1.0
author: GenCreator
license: MIT
metadata:
  hermes:
    tags: [gencreator, factory, stack, tools]
---

# GenCreator Factory

Use when the user needs a working stack, not a tool catalog dump.

## Steps

1. List what they already have (Hermes, Claude, Codex, Grok, editors, hosts).
2. Pick the **smallest** stack that can finish their current loop.
3. Write a stack card into the project (create `gencreator.stack.md` if none exists):
   - purpose
   - models by job (draft / reason / image / code)
   - files of record
   - approval gates
   - weekly cadence
4. Map jobs to the six pillars only if they are building a CoE, not a single essay.
5. Point them at gencreator.ai product surfaces for commerce. Do not invent prices.

## Output shape

```text
Purpose:
Keep:
Add:
Drop:
Approvals:
Cadence:
Stack file:
```

## Guardrails

- Prefer tools they already pay for.
- One image pipeline, one writing model, one ship path.
- No "ultimate stack" lists.
