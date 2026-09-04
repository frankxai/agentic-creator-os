# GenCreator Agent

Hermes profile for the Operating System for AI-native creators. Stages, Factory, six-pillar CoE, and ship loops — on official Hermes Desktop.

This folder is a **profile distribution**. It is not a Hermes fork.

**Do not tell strangers to install this until `SOUL.md` exists.** Without it, Hermes falls back to the built-in Nous identity. Copy `PERSONA.md` → `SOUL.md` after Frank approves that write.

## Install (from the ACOS repo root)

1. Install [Hermes Desktop](https://hermes-agent.nousresearch.com/).
2. Clone and install the **folder**, not the repo URL:

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
hermes profile install ./profiles/gencreator-agent --alias
```

Do not run `hermes profile install github.com/frankxai/agentic-creator-os`. There is no `distribution.yaml` at the git root.

3. Launch: `gencreator-agent chat`

Update: `git pull` in the clone, then re-run the folder install. `hermes profile update` against the ACOS repo URL will fail.

## What you get

| Piece | Role |
|---|---|
| `PERSONA.md` | Source identity (promote to `SOUL.md` before public install) |
| `skills/gencreator-start` | Orient, pick a stage, start a loop |
| `skills/gencreator-factory` | Configure a creator stack |
| `skills/gencreator-coe` | Six-pillar Personal AI CoE checklist |
| `skills/gencreator-ship` | Turn work into a reviewable ship packet |
| `skins/gencreator.yaml` | GenCreator look |

Commerce stays on [gencreator.ai](https://gencreator.ai). The [Agent Pack](https://gencreator.ai/products/agent-pack) is the harness-agnostic install surface.

Independent of Nous Research.
