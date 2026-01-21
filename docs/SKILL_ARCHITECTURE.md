# Agentic Creator OS - Global Skill Architecture

## Vision

Transform isolated Claude Code skills into a **globally distributed, GitHub-synced, MCP-powered skill ecosystem** that any creator can install, customize, and contribute to.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AGENTIC CREATOR OS ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │  GitHub Repos   │    │  Local Install  │    │  Claude Code    │     │
│  │  (Source)       │───▶│  (~/.claude/)   │───▶│  (Runtime)      │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│         │                       │                      │               │
│         │                       │                      │               │
│  ┌──────▼──────────────────────▼──────────────────────▼─────────┐     │
│  │                     SKILL REGISTRY                            │     │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │     │
│  │  │Technical│  │Creative │  │Business │  │ Soulbook│         │     │
│  │  │Skills   │  │Skills   │  │Skills   │  │ Skills  │         │     │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                              │                                         │
│  ┌───────────────────────────▼─────────────────────────────────┐      │
│  │                     MCP SERVER LAYER                         │      │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │      │
│  │  │filesys │ │database│ │browser │ │website │ │ email  │    │      │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## GitHub Repository Structure

### Primary Repo: `frankxai/agentic-creator-os`

```
agentic-creator-os/
├── skills/                          # Skill library
│   ├── registry.json                # Master index
│   ├── technical/
│   │   ├── mcp-architecture/
│   │   │   ├── skill.yaml           # Metadata + triggers
│   │   │   ├── CLAUDE.md            # Skill content
│   │   │   └── examples/
│   │   ├── claude-sdk/
│   │   ├── langgraph-patterns/
│   │   └── ...
│   ├── creative/
│   │   ├── content-strategy/
│   │   ├── suno-mastery/
│   │   └── ...
│   ├── business/
│   └── soulbook/
│
├── commands/                        # Slash commands
│   ├── factory.md
│   ├── publish.md
│   ├── content-strategy.md
│   └── ...
│
├── mcp-servers/                     # MCP server implementations
│   ├── filesystem-mcp/
│   ├── database-mcp/
│   ├── browser-mcp/
│   ├── website-mcp/
│   ├── email-mcp/
│   └── creator-mcp/
│
├── departments/                     # AI department configs
│   ├── content.yaml
│   ├── dev.yaml
│   ├── design.yaml
│   ├── marketing.yaml
│   └── business.yaml
│
├── workflows/                       # Automation templates
│   ├── blog-publishing.yaml
│   ├── client-onboarding.yaml
│   └── weekly-ops.yaml
│
├── bin/                            # CLI tools
│   ├── acos                        # Main CLI
│   ├── acos-install                # Installer
│   ├── acos-sync                   # GitHub sync
│   └── acos-update                 # Updater
│
├── install.sh                      # Quick install script
├── package.json                    # NPM package config
├── CHANGELOG.md
├── LICENSE (MIT)
└── README.md
```

---

## Skill Definition Standard

### skill.yaml (Metadata)

```yaml
name: content-strategy
version: 1.2.0
description: Strategic content planning with calendar management
author: FrankX
license: MIT

# Dependencies
requires:
  skills:
    - frankx-brand@^1.0.0
    - seo-optimization@^1.0.0
  mcp:
    - filesystem-mcp
    - database-mcp

# Auto-activation triggers
triggers:
  keywords:
    - content strategy
    - content plan
    - editorial calendar
    - content pillar
  files:
    - "**/CONTENT_STRATEGY.md"
    - "**/CONTENT_CALENDAR.md"
    - "**/content-calendar/*.json"
  commands:
    - /content-strategy
    - /content-calendar

# MCP tool bindings
tools:
  filesystem:
    - read
    - write
    - glob
  database:
    - query
    - insert

# Exports (for other skills to import)
exports:
  - content_pillars
  - calendar_schema
  - publishing_workflow
```

### CLAUDE.md (Skill Content)

```markdown
# Content Strategy Skill

## Purpose
[Description]

## Capabilities
[What it can do]

## Commands
[Available commands]

## Integration
[How it connects to other skills/MCP]

## Examples
[Usage examples]
```

---

## CLI Tool: `acos` (Agentic Creator OS)

### Installation

```bash
# Quick install (recommended)
curl -fsSL https://raw.githubusercontent.com/frankxai/agentic-creator-os/main/install.sh | bash

# Or via npm
npm install -g @frankx/agentic-creator-os
```

### Commands

```bash
# Install/update the system
acos install                    # Full install
acos update                     # Update to latest
acos sync                       # Sync with GitHub

# Skill management
acos skill list                 # List installed skills
acos skill install <name>       # Install a skill
acos skill remove <name>        # Remove a skill
acos skill search <query>       # Search registry

# MCP server management
acos mcp list                   # List MCP servers
acos mcp start <server>         # Start a server
acos mcp status                 # Check server status

# Department management
acos dept list                  # List departments
acos dept activate <name>       # Activate department

# Diagnostics
acos doctor                     # Check system health
acos config                     # Show configuration
```

---

## Skill Registry (registry.json)

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-21",
  "skills": {
    "content-strategy": {
      "version": "1.2.0",
      "category": "creative",
      "description": "Strategic content planning",
      "downloads": 1250,
      "rating": 4.8,
      "author": "FrankX",
      "dependencies": ["frankx-brand", "seo-optimization"],
      "mcp": ["filesystem-mcp", "database-mcp"]
    },
    "mcp-architecture": {
      "version": "2.0.0",
      "category": "technical",
      "description": "MCP server design patterns",
      "downloads": 3400,
      "rating": 4.9,
      "author": "FrankX",
      "dependencies": [],
      "mcp": []
    }
  },
  "categories": {
    "technical": ["mcp-architecture", "claude-sdk", "langgraph-patterns"],
    "creative": ["content-strategy", "suno-mastery", "frankx-brand"],
    "business": ["oci-services", "product-management"],
    "soulbook": ["7-pillars", "life-symphony", "golden-path"]
  }
}
```

---

## Sync Strategy

### Bidirectional Sync

```
Local Changes                    GitHub
    │                               │
    │  acos sync push              │
    ├──────────────────────────────▶
    │                               │
    │  acos sync pull              │
    ◀──────────────────────────────┤
    │                               │
    │  acos sync (auto)            │
    ◀─────────────────────────────▶│
```

### Conflict Resolution

1. **Local wins**: `acos sync --local`
2. **Remote wins**: `acos sync --remote`
3. **Manual merge**: `acos sync --merge`
4. **Auto (default)**: Remote wins for unmodified, local wins for modified

### Selective Sync

```bash
# Sync specific categories
acos sync --category=technical
acos sync --category=creative

# Sync specific skills
acos sync --skill=content-strategy
acos sync --skill=mcp-architecture

# Exclude patterns
acos sync --exclude="soulbook/*"
```

---

## MCP Integration Pattern

### Skill → MCP Binding

```yaml
# In skill.yaml
tools:
  filesystem:
    - read: "Read project files for context"
    - write: "Save generated content"
    - glob: "Find files matching patterns"

  database:
    - query: "Retrieve content metadata"
    - insert: "Store new content records"

  browser:
    - screenshot: "Capture previews"
    - navigate: "Test deployed pages"
```

### Runtime Execution

```
User: /content-strategy plan:week

1. Skill activates content-strategy
2. Skill requests MCP tools: filesystem:read, database:query
3. MCP servers execute local operations
4. Results flow back to skill
5. Skill generates response using context + MCP data
```

---

## Enhancement Sources

### External Repos to Pull Patterns From

```yaml
sources:
  - repo: anthropics/anthropic-cookbook
    patterns:
      - tool-use
      - multi-turn
      - function-calling

  - repo: langchain-ai/langgraph
    patterns:
      - agent-workflows
      - state-machines
      - multi-agent

  - repo: modelcontextprotocol/servers
    patterns:
      - mcp-best-practices
      - tool-schemas
      - resource-patterns

  - repo: vercel/ai
    patterns:
      - streaming
      - edge-functions
      - ui-components
```

### Auto-Enhancement Pipeline

```bash
# Pull latest patterns from sources
acos enhance --source=anthropic-cookbook --skill=tool-use

# Update skill with new patterns
acos enhance --skill=content-strategy --apply-patterns

# Validate enhanced skill
acos validate --skill=content-strategy
```

---

## Installation Targets

### Global Install (`~/.claude/`)

```
~/.claude/
├── skills/                    # Installed skills
│   ├── content-strategy/
│   ├── mcp-architecture/
│   └── ...
├── commands/                  # Slash commands
├── mcp-servers/              # MCP server binaries
├── config.json               # User configuration
└── registry.local.json       # Local registry state
```

### Project Install (`.claude/`)

```
project/.claude/
├── skills/                   # Project-specific skills
├── commands/                 # Project-specific commands
├── skill-rules.json         # Auto-activation rules
└── config.json              # Project config
```

### Priority: Project > Global > Registry

---

## Versioning & Updates

### Semantic Versioning

- **Major**: Breaking changes to skill interface
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, documentation updates

### Update Channels

```bash
# Stable (default)
acos config set channel stable

# Beta (early features)
acos config set channel beta

# Nightly (bleeding edge)
acos config set channel nightly
```

### Automatic Updates

```bash
# Enable auto-updates
acos config set autoUpdate true

# Check for updates
acos update --check

# Update specific skill
acos skill update content-strategy
```

---

## Contributing

### Add a New Skill

```bash
# Create skill scaffold
acos skill create my-skill --category=technical

# Develop locally
# ... edit skills/technical/my-skill/

# Validate
acos validate --skill=my-skill

# Submit PR
git add skills/technical/my-skill/
git commit -m "feat(skills): add my-skill"
git push origin feature/my-skill
# Create PR on GitHub
```

### Enhance Existing Skill

```bash
# Fork and clone
git clone https://github.com/frankxai/agentic-creator-os.git

# Make improvements
# ... edit skill files

# Test locally
acos skill install ./skills/my-skill --local

# Submit PR with enhancements
```

---

## Next Steps

1. **Create GitHub repo** `frankxai/agentic-creator-os`
2. **Migrate skills** from `.claude-skills/` to new structure
3. **Build CLI tool** (`acos`)
4. **Implement sync system**
5. **Set up CI/CD** for releases
6. **Write documentation**
7. **Launch publicly**

---

*Building the future of AI-powered creator operating systems.*
