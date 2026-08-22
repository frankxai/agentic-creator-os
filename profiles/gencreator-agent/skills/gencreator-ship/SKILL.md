---
name: gencreator-ship
description: "Turn creator work into a reviewable ship packet. Use when they say ship, publish, launch, or hand off."
version: 0.1.0
author: GenCreator
license: MIT
metadata:
  hermes:
    tags: [gencreator, ship, review, proof]
---

# GenCreator Ship

Use when the user wants to ship, not brainstorm.

## Steps

1. Name the artifact (post, page, pack, video stills, email, template).
2. Collect the actual files. Do not review from memory.
3. Run a tight gate:
   - claim check (no unsourced numbers)
   - voice check (sentence case, no slop)
   - proof (preview, screenshot, or command output)
   - approval (publish / spend / external send stays human)
4. Write a ship packet:

```text
Artifact:
Audience:
Files:
Proof:
Risks:
Human gate:
Next public action:
```

5. Stop at draft unless they explicitly ask to send.

## Guardrails

- No social sends from this skill.
- No fake analytics.
- If visual, require an inspected export path, not a description of an image.
