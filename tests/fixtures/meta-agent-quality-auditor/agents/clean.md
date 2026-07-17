---
name: fixture-clean-agent
description: Fixture agent for the meta-agent-quality-auditor smoke test. Auto-invokes when a test says "run the clean fixture" — exists only to exercise a passing 9/9 audit path.
tools: Read, Write
model: sonnet
---

## 1. Purpose

A minimal, deliberately compliant agent definition used only as the "known-good"
fixture for meta-agent-quality-auditor's own smoke eval. Not a real agent.

## 2. Triggers

**Verbal cues (auto-invoke):**
- "run the clean fixture"

## 3. Inputs

**Read-only:**
- This file itself

## 4. Process

```
1. Read the target file with Read.
2. Write a one-line result with Write.
```

Memory: `node lib/acos/memory.mjs recall "fixture-clean-agent run" 1` at start,
`node lib/acos/memory.mjs remember '{"agent":"fixture-clean-agent"}'` at end.

## 5. Outputs

A one-line confirmation string.

## 6. Integration

**Upstream:** the smoke test only.
**Downstream:** none.

## 7. Smoke eval

Existence of this fixture's own smoke file is the only check that applies to it.

## 8. Anti-patterns

- Does NOT do anything outside this smoke-test context
- Never ships as a real agent
- Refuses to be invoked by any real trigger
- Doesn't declare tools it does not reference above

## 9. Model choice

Sonnet: arbitrary choice for a fixture with no real reasoning requirement.

## 10. Voice check

- No Arcanean mythology.
- No spiritual or guru-speak language.
