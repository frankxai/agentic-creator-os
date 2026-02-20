# ACOS v10 Quick Start

Get up and running in under 5 minutes.

---

## Prerequisites

- Git
- Node.js 18+ (only needed for MCP servers)

---

## Install

### Claude Code (Full Feature Set)

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
./install.sh

# Open any project with Claude Code
claude
/acos
```

### Cursor

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
./install.sh --platform=cursor
```

Generates `.cursorrules` with skills and agent definitions embedded.

### Windsurf

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
./install.sh --platform=windsurf
```

Generates `.windsurfrules` with skills and agent definitions embedded.

### Gemini Code Assist

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
./install.sh --platform=gemini
```

Generates `GEMINI.md` context file.

### Any AI Coding Agent

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
./install.sh --platform=generic
```

Generates `CONTEXT.md`. Point your agent at it as system prompt or project instructions.

---

## First Commands (Claude Code)

```bash
/acos                    # Smart router — shows all commands
/article-creator         # Write a blog post
/create-music            # Produce a track with Suno
/spec                    # Spec-driven feature development
/starlight-architect     # Enterprise AI system design
/infogenius              # Research-grounded image generation
```

On non-Claude platforms, just describe the task. Skills activate from context.

---

## What's Included

| Component | Count | Description |
|-----------|-------|-------------|
| Commands | 35+ | Slash commands via `/acos` smart router |
| Skills | 75+ | Auto-activating domain knowledge modules |
| Agents | 38 | Specialized AI personas |
| Workflows | 11 | YAML pipeline definitions |
| Departments | 5 | Agent team configurations |
| MCP Servers | 7 | Optional tool integrations |

---

## How Auto-Activation Works

Skills load automatically based on `skill-rules.json` — 22 pattern rules:

```
You: "write a blog post about AI agents"
  -> Detects: "blog", "write"
  -> Auto-loads: content-strategy skill
  -> Routes to: /article-creator
```

No manual invocation needed. The system matches your intent to the right skills.

---

## v10 Safety Systems

| System | What It Does |
|--------|-------------|
| **Circuit Breaker** | Tracks failures per file. 3 = warn, 5 = restrict, 8 = block |
| **Agent IAM** | 6 profiles with per-tool, per-directory scoping |
| **Self-Modify Gate** | Snapshots config before changes, auto-reverts if score drops |
| **Audit Trail** | Append-only JSONL logging of all actions |

---

## Platform Feature Parity

| Feature | Claude Code | Cursor | Windsurf | Gemini | Generic |
|---------|:-----------:|:------:|:--------:|:------:|:-------:|
| Skills | Full | Embedded | Embedded | Embedded | Embedded |
| Commands | Slash commands | Context-guided | Context-guided | Context-guided | Context-guided |
| Agents | Full | Embedded | Embedded | Embedded | Embedded |
| Hooks | Native | -- | -- | -- | -- |
| Auto-activation | skill-rules.json | -- | -- | -- | -- |
| Agent IAM | Native | -- | -- | -- | -- |

Claude Code gets the richest integration. Other platforms get skills and agents embedded in their context files.

---

## Troubleshooting

**Commands not found?** Copy to user level:
```bash
cp .claude/commands/*.md ~/.claude/commands/
```

**MCP servers?** These are optional. See `mcp-servers/README.md`.

**Need help?** [Open an issue](https://github.com/frankxai/agentic-creator-os/issues)

---

*ACOS v10.1 — The Operating System for AI-Powered Creators*
