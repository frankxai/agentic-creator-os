# ACOS v6 Quick Start Guide

Get up and running with Agentic Creator OS in under 5 minutes.

---

## Prerequisites

- [Claude Code](https://claude.ai/claude-code) installed
- Git
- Node.js 18+ (for MCP servers)

---

## Installation

### Option 1: Full Install (Recommended)

```bash
# Clone the repo
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os

# Run installer
./install.sh

# Open Claude Code
claude
```

### Option 2: Manual Setup

```bash
# Clone the repo
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os

# Copy commands to user level
cp .claude/commands/*.md ~/.claude/commands/

# Open Claude Code in the repo
claude
```

---

## First Commands to Try

Once installed, open Claude Code and try:

```bash
# The single entry point - shows all available commands
/acos

# Write a blog post
/article-creator

# Generate research-grounded images
/infogenius

# Build a feature with spec-driven development
/spec

# Enterprise AI system design
/starlight-architect
```

---

## What's Included

| Component | Count | Description |
|-----------|-------|-------------|
| Commands | 26 | Creator commands accessible via `/command` |
| Skills | 81 | Auto-activated domain knowledge |
| Agents | 40 | Specialized AI personas |
| Workflows | 37 | YAML pipeline definitions |
| MCP Servers | 7 | External tool integrations |
| Templates | 40 | Content creation templates |

---

## Key Commands by Category

### Creation
| Command | Purpose |
|---------|---------|
| `/article-creator` | Guided blog article creation |
| `/create-music` | Suno music production |
| `/infogenius` | Research-grounded image generation |
| `/factory` | Full publishing pipeline |

### Strategy
| Command | Purpose |
|---------|---------|
| `/starlight-architect` | Enterprise AI system design |
| `/research` | Daily intelligence operations |
| `/plan-week` | Weekly content planning |

### Development
| Command | Purpose |
|---------|---------|
| `/spec` | Spec-driven feature development |
| `/publish` | Deploy content with quality gates |

---

## How It Works

### Smart Routing with /acos

`/acos` parses your intent and routes to the right command:

```
You: /acos write a blog post about AI agents
  → Routes to /article-creator
  → Auto-loads content-strategy skill
  → Guided article creation workflow
```

### Skill Auto-Activation

Skills load automatically based on YAML frontmatter triggers:

```yaml
# In SKILL.md
---
name: content-strategy
triggers: [blog, article, content, post, newsletter]
---
```

When you mention "blog" or "article", the content-strategy skill activates.

### Magic Words

| Word | Effect |
|------|--------|
| `ultrawork` | Fire all relevant agents in parallel |
| `ultracode` | Fire coding specialists in parallel |

---

## Project Structure

```
agentic-creator-os/
├── .claude/
│   ├── commands/        # 26 slash commands
│   ├── skills/          # 81 skill definitions
│   ├── agents/          # 40 agent definitions
│   ├── hooks.json       # Lifecycle hooks (reference)
│   └── skill-rules.json # Auto-activation rules (reference)
├── workflows/           # 37 YAML workflow pipelines
├── departments/         # 5 team configurations
├── templates/           # 40 content templates
├── mcp-servers/         # 7 MCP server implementations
├── install.sh           # Installation script
└── ACOS-V6-SPEC.md      # Full v6 specification
```

---

## Troubleshooting

### Commands not working?

Commands must be at user level (`~/.claude/commands/`) to work:

```bash
# Check if commands are installed
ls ~/.claude/commands/

# If empty, copy from repo
cp .claude/commands/*.md ~/.claude/commands/
```

### Skills not loading?

Skills auto-activate via YAML frontmatter. Check the skill file:

```bash
cat .claude/skills/content-strategy/SKILL.md | head -10
```

### MCP servers not connecting?

Build and configure MCP servers:

```bash
# Build all servers
./build-servers.sh

# Add to your Claude Code MCP config
# (Location varies by IDE)
```

---

## Next Steps

1. **Explore commands**: Run `/acos` to see all options
2. **Read the spec**: `cat ACOS-V6-SPEC.md`
3. **Check architecture**: `cat ARCHITECTURE.md`
4. **View skill tree**: `cat SKILL_TREE.md`

---

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/frankxai/agentic-creator-os/issues)
- **Docs**: See `ARCHITECTURE.md`, `ACOS-V6-SPEC.md`
- **Credits**: See `CREDITS.md` for inspiration sources

---

*ACOS v6.0 - The Operating System for Golden Age Creators*
