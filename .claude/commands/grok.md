---
description: "Grok Build harness operations for ACOS — install seeds, verify integration, delegate, run excellence in Grok TUI"
argument-hint: "[install|verify|delegate|status|test]"
---

# /grok — Grok Build + ACOS Harness

Grok Build (xAI) full harness support for ACOS via grok-harness-adapter.

## Workflow

1. Detect intent (install seeds, verify current .grok/, status, delegate task, test adapter).
2. For install in target project:
   - Run `./install.sh --platform=grok --target <dir>` (from ACOS root or copy installer).
   - Or node -e 'require("./adapters/grok").installGrokPlatform(target)'
3. Verify:
   - ls .grok/skills/  (should have harness-integration, excellence-review, repo-mastery, multi-harness-orchestrator)
   - ls .grok/hooks/ (2 json + sh)
   - cat GROK.md | head
   - cat .grok/acos-state.json
4. In Grok session:
   - grok
   - /hooks-trust
   - /skills grok-harness   (or harness-integration)
   - Use repo-mastery, gstack, etc.
5. Multi-harness: use multi-harness-orchestrator skill or "delegate to claude for plan review" — output exact `claude -p "..."` with injected CLAUDE.md + SHARING + SIP + gates.
6. Always apply excellence gates (repo-mastery first, then santa/verification/gstack).

## Examples

- "grok install for this project" → run install --platform=grok here
- "verify grok harness" → inspect .grok/ + GROK.md + state; run adapter tests if present
- "grok status in ACOS" → summarize adapter + seeds + compat layer + SIP notes
- "use grok for the TUI parts, delegate planning to claude" → emit delegation cmd + context

See:
- adapters/grok/index.ts (full API + seeds generator)
- install.sh (install_grok)
- .claude/skills/grok-harness/SKILL.md (this integration)
- CLAUDE.md (Grok section)
- adapters/README.md (parity)

**SIP**: Built on SIP v1.1.1. 5-fleet (Claude + Grok + AGY + ...). grok-personal .grok-only seeds for the 4 excellence seeds (per SHARING.md + SIP §5). God 99 gates on all outputs. Small reversible.
