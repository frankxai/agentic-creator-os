# ACOS Quick Start

Get the Agentic Creator OS auto-activating in under 2 minutes.
Exact asset counts: [STATS.md](STATS.md) (generated from source).

## Install

**Claude Code plugin (recommended):**

```
/plugin marketplace add frankxai/agentic-creator-os
/plugin install agentic-creator-os@frankx
```

**Cross-harness skills** (Codex, Cursor, Gemini CLI, Copilot, …):

```bash
npx skills add frankxai/creator-skills
```

**Full install** (generates context files per platform):

```bash
git clone https://github.com/frankxai/agentic-creator-os.git ~/.acos
cd ~/.acos && ./install.sh            # claude code
./install.sh --platform=cursor        # or windsurf / gemini / grok
```

## First 5 Minutes

1. Fill in [CREATOR.md](CREATOR.md) — your voice, mission, quality bar.
   Agents refuse to invent identity details without it.
2. Try the router and a flagship workflow:

```
/acos              # discover commands + system status
/studio            # multimodal image/video/character production
/article-creator   # guided blog article with SEO
/create-music      # Suno music production pipeline
/deepresearch      # deep research with web + codebase analysis
```

3. Watch auto-activation work:

```
You type: "write a blog post about AI agents"
ACOS detects:  content + blog keywords (UserPromptSubmit hook)
Auto-loads:    content-strategy skill
Routes to:     /article-creator
```

## Optional: Multimodal Connector

```bash
claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp
```

Any MCP filling `~~image generation` / `~~video generation` works — see
[CONNECTORS.md](CONNECTORS.md).

## Links

- [README](README.md) · [Architecture](docs/ARCHITECTURE.md) · [Roadmap](docs/ROADMAP.md)
- [creator-skills](https://github.com/frankxai/creator-skills) — skills.sh onramp
- [frankx.ai/acos](https://frankx.ai/acos) — pro layer
