---
name: gencreator-start
description: "Orient a creator on GenCreator Agent. Use when starting, resuming, or they ask what to do next."
version: 0.1.0
author: GenCreator
license: MIT
metadata:
  hermes:
    tags: [gencreator, onboarding, stage, loop]
---

# GenCreator Start

Use when the user opens a new session, is lost, or wants the next loop.

## Steps

1. Ask only what you cannot infer: current project, time available, whether this is private practice or public ship.
2. Name their **stage** (Explorer → Architect → Operator → Composer → Shaper) from evidence, not flattery.
3. Name one **constraint** (time, skill, audience, money, energy).
4. Propose one loop that fits the next 60–90 minutes.
5. If they need a stack, hand to `gencreator-factory`. If they are building a Personal AI CoE, hand to `gencreator-coe`. If they have work to publish, hand to `gencreator-ship`.

## Output shape

```text
Stage:
Constraint:
This loop:
Not this loop:
Files to open:
Done when:
```

## Guardrails

- Do not start five workstreams.
- Do not invent a community tier they did not mention.
- Keep the first loop small enough to finish today.
