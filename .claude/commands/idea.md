---
name: idea
description: One message → live. Capture an idea as a durable GitHub issue, route it through the brand registry, reason → build → gate → ship → broadcast → report. Loads the idea-loop skill.
---

# /idea — One Message → Live

**The anti-loss layer + autonomous ship loop.** Drop an idea in any chat; this
command guarantees it is captured durably and driven to a live, gated, reported
artifact — agent-run end to end.

Loads the `idea-loop` skill (`skills/idea-loop/SKILL.md`).
Architecture: `docs/IDEA_LOOP.md` · Routing: `registry/brands.json`.

## Usage

```bash
/idea <the idea, one message is enough>
/idea capture <idea>      # L0 only: issue + routing, loop runs later (GitHub Action)
/idea status              # list open `idea` issues across routed repos
```

## What it does

1. **Capture** — GitHub issue (label `idea`) before anything else. Chats scroll;
   the ledger doesn't.
2. **Route** — brand registry → ICP, voice, experience, repos, domains.
3. **Reason** — problem · ICP fit · wedge · falsifier · experience, logged on the issue.
4. **Build → Gate → Ship** — branch `idea/<slug>`, agentic excellence gates
   (review, design, brand, links, CI) iterated to green, PR, merge, deploy.
5. **Broadcast** — README rework, connected website/domain updates, changelog.
6. **Report** — Ship Report + Leverage Brief: what's live (named plainly), gate
   evidence, and 3–5 adoptable techniques/repos/standards learned this run.

## Guardrails

- Human gates only for: money, key rotation, newsletter/social sends,
  irreversible ops, production force-push, `/papa/`. Everything else ships on green gates.
- Never ship red gates; after 3 fix loops, report the blocker instead.
- Brand voice + ICP from the registry are binding on every artifact.
