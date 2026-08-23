# GenCreator Agent

Hermes profile for the Operating System for AI-native creators. Stages, Factory, six-pillar CoE, and ship loops — on official Hermes Desktop.

This folder is a **profile distribution**. It is not a Hermes fork.

## Install

1. Install [Hermes Desktop](https://hermes-agent.nousresearch.com/).
2. Clone this repository (or use a local checkout):

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
hermes profile install ./agentic-creator-os/profiles/gencreator-agent --alias
```

Hermes install expects `distribution.yaml` at the distribution root, so the path is this folder, not the ACOS repo root.

3. Launch:

```bash
gencreator-agent chat
```

Update from a newer clone:

```bash
hermes profile update gencreator-agent
```

## What you get

| Piece | Role |
|---|---|
| `PERSONA.md` | Public companion identity (copy to `SOUL.md` after approval) |
| `skills/gencreator-start` | Orient, pick a stage, start a loop |
| `skills/gencreator-factory` | Configure a creator stack |
| `skills/gencreator-coe` | Six-pillar Personal AI CoE checklist |
| `skills/gencreator-ship` | Turn work into a reviewable ship packet |
| `skins/gencreator.yaml` | GenCreator look |

Commerce, community, and entitlements stay on [gencreator.ai](https://gencreator.ai). The existing [Agent Pack](https://gencreator.ai/products/agent-pack) is the harness-agnostic install surface; this profile is the Hermes-native one.

Independent of Nous Research.
