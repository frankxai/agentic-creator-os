<div align="center">

# Agentic Creator OS

**The Operating System for AI-Powered Creators**

*One install. Any coding agent. 90+ skills, 50+ commands, 39 agents — auto-activating.*

![ACOS v10](docs/infographics/acos-hero.png)

[![Version](https://img.shields.io/badge/version-10.0.0-cyan?style=for-the-badge)](https://github.com/frankxai/agentic-creator-os)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![Platforms](https://img.shields.io/badge/platforms-Claude%20%7C%20Cursor%20%7C%20Windsurf%20%7C%20Gemini-purple?style=for-the-badge)](#multi-platform-install)

</div>

---

## What Is ACOS?

A **production-grade skill and agent system** for AI coding assistants. It ships skills (domain knowledge), commands (reusable workflows), agents (specialized personas), and safety hooks — configured to auto-activate based on what you're working on.

Works with **Claude Code, Cursor, Windsurf, Gemini Code Assist**, and any AI coding agent that reads markdown context files.

```
You: "write a blog post about AI agents"
  → ACOS detects: creation + blog
  → Auto-loads: content-strategy skill
  → Routes to: /article-creator workflow
  → Result: Guided article with SEO, images, social distribution
```

---

## Quick Start

### Claude Code (Full Feature Set)

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
./install.sh

# Open any project with Claude Code
claude
/acos
```

### Cursor / Windsurf

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
./install.sh --platform=cursor    # or --platform=windsurf
```

This generates a `.cursorrules` or `.windsurfrules` file with all skills embedded.

### Gemini Code Assist

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
./install.sh --platform=gemini
```

This generates a `GEMINI.md` context file for Gemini to read on session start.

### Any AI Coding Agent

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
./install.sh --platform=generic
```

Generates a `CONTEXT.md` file. Point your agent at it as a system prompt or project instructions file.

> **See [QUICKSTART.md](QUICKSTART.md) for detailed setup per platform**

---

## v10 — Autonomous Intelligence

v10 introduces **5 safety-first autonomous systems** that make your AI coding agent smarter over time:

### 1. Experience Replay
The agent remembers what worked. Past successful tool sequences are injected as context for similar new tasks.

### 2. Agent IAM (Identity & Access Management)
Per-profile scoping — a content writer can't modify your build config, a music producer can't run shell commands. 6 profiles with tool and directory restrictions.

### 3. Confidence Circuit Breaker
Tracks failures per file. After 3 failures: warn. After 5: restrict. After 8: block. Prevents the agent from brute-forcing broken approaches.

### 4. Conservative Self-Modify Gate
Before changing its own config, ACOS snapshots the current state and measures intelligence score. If the score drops more than 5 points after a change: auto-revert.

### 5. Immutable Audit Trail
Append-only JSONL logging of every tool use, IAM decision, gate verdict, and config change. The ground truth for what happened in a session.

<details>
<summary><strong>v10 Architecture Diagram</strong></summary>

```
                        /acos (Smart Router)
                            |
              +-------------+-------------+
              |             |             |
         Commands (50+)  Skills (90+)  Agents (39)
              |             |             |
              +------+------+------+------+
                     |             |
              +------+------+  +--+--+
              |             |  |     |
          Hooks (v10)   Workflows  MCP Servers
              |
    +---------+---------+---------+
    |         |         |         |
 Circuit   Audit    Self-Mod   Agent
 Breaker   Trail    Gate       IAM
```
</details>

---

## What's Included

### Commands (50+)

| Category | Count | Examples |
|----------|-------|----------|
| **Creation** | 8 | `/article-creator`, `/create-music`, `/infogenius`, `/factory` |
| **Strategy** | 6 | `/starlight-architect`, `/council`, `/research`, `/plan-week` |
| **Development** | 4 | `/spec`, `/nextjs-deploy`, `/ux-design`, `/automation-dev` |
| **System** | 5 | `/acos`, `/inventory-status`, `/mcp-status`, `/publish` |
| **Quality** | 3 | `/review-content`, `/classify-content`, `/polish-content` |

> Commands are Claude Code slash commands. On other platforms, describe the task and ACOS skills guide the agent to the same workflows.

### Skills (90+ Auto-Activating)

Skills are domain knowledge modules that **activate automatically** based on what you're doing. No manual invocation needed.

| Category | Count | Examples |
|----------|-------|----------|
| **Technical** | 25+ | TDD, systematic-debugging, mcp-architecture, react-nextjs-patterns |
| **Creative** | 10+ | frankx-brand, suno-ai-mastery, excellence-book-writing |
| **Content** | 15+ | content-strategy, social-media-strategy, video-production |
| **Oracle/Cloud** | 5+ | oci-services-expert, oracle-database-expert, oracle-ai-architect |
| **Business** | 5+ | product-management, coaching-program, financial-modeling |
| **System** | 15+ | swarm-orchestration, agentic-jujutsu, planning-with-files |
| **Personal** | 5+ | spartan-warrior, gym-training, health-nutrition |

**How Auto-Activation Works:**
```
skill-rules.json → 22 pattern rules
  "tests" + "component" → loads test-driven-development + react-patterns
  "blog" + "write"      → loads content-strategy + seo-content-writer
  "deploy" + "vercel"   → loads vercel-deployment + nextjs-best-practices
```

### Agents (39 Specialized)

| Domain | Agents | Examples |
|--------|--------|----------|
| **Writing** | 8 | Developmental Editor, Line Editor, Content Polisher, Story Architect |
| **Strategy** | 5 | Starlight Orchestrator, Visionary, Oracle AI Architect |
| **Design** | 4 | UI/UX Expert, Website Builder, Frankx Content Creation |
| **Production** | 4 | Music Production, Sonic Engineer, Nano Banana Image Gen |
| **Business** | 4 | Product Launch, Coaching Program, Product Development |
| **Technical** | 5 | Technical Architect, Oracle Database, OpenAI AgentKit |
| **Publishing** | 6 | Master Story Architect, Character Psychologist, Sensitivity Reader |
| **System** | 3 | Skill Expert, Project Discovery, Rapid Content |

### v10 Safety Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| **Circuit Breaker** | PostToolUse (failure) | Track failures per file, escalate at thresholds |
| **Audit Trail** | All tool use | Append-only JSONL logging |
| **Self-Modify Gate** | Config changes | Snapshot + validate intelligence score |
| **Agent IAM** | PreToolUse | Enforce per-profile tool/path scopes |
| **Quality Gate** | PreToolUse (Edit/Write) | Block edits to secrets, warn on production files |

---

## How It Works

### The `/acos` Smart Router

Everything starts with `/acos`. It parses intent and routes to the best subsystem:

```
/acos "write a blog post about AI agents"
  → Detects: creation + blog
  → Routes to: /article-creator
  → Auto-loads: content-strategy skill
  → Result: Guided article creation workflow
```

For multi-domain requests, it chains commands:
```
/acos "Create a blog post about AI music with images and social posts"
  → /research "AI music production"
  → /article-creator (with research context)
  → /infogenius (hero image)
  → /generate-social (distribution)
```

### Orchestration Patterns

| Pattern | Description | Best For |
|---------|-------------|----------|
| **Pipeline** | Sequential: Research → Plan → Create → Optimize → Publish | Blog posts, newsletters |
| **Parallel** | Concurrent agents with synthesis | Code review, multi-analysis |
| **Weighted Synthesis** | Expert voting with percentage weights | Strategic decisions |

### Self-Learning

The system learns from every session:
```
Session Start → Create trajectory record
Session Active → Track operations and outcomes
Session End → Extract patterns → Store learnings
Future Sessions → Apply accumulated intelligence
```

---

## Multi-Platform Install

<a id="multi-platform-install"></a>

The install script detects your platform and configures accordingly:

```bash
./install.sh                      # Auto-detect platforms
./install.sh --platform=claude    # Claude Code only
./install.sh --platform=cursor    # Cursor only
./install.sh --platform=windsurf  # Windsurf only
./install.sh --platform=gemini    # Gemini Code Assist only
./install.sh --platform=generic   # Any agent (CONTEXT.md)
./install.sh --platform=all       # All detected platforms
```

### What Gets Installed Per Platform

| Component | Claude Code | Cursor | Windsurf | Gemini | Generic |
|-----------|:-----------:|:------:|:--------:|:------:|:-------:|
| Skills (knowledge) | ~/.claude/skills/ | .cursorrules | .windsurfrules | GEMINI.md | CONTEXT.md |
| Commands (workflows) | ~/.claude/commands/ | — | — | — | — |
| Agents (personas) | ~/.claude/agents/ | .cursorrules | .windsurfrules | GEMINI.md | CONTEXT.md |
| Hooks (safety) | settings.json | — | — | — | — |
| Auto-activation | skill-rules.json | — | — | — | — |
| MCP servers | Optional | — | — | — | — |

> **Claude Code gets the full feature set** including slash commands, lifecycle hooks, and auto-activation rules. Other platforms get skills and agent definitions embedded in their context files.

---

## Directory Structure

```
agentic-creator-os/
├── .claude/
│   ├── commands/           # 50+ slash commands
│   ├── skills/             # 90+ auto-activating skills
│   ├── agents/             # 39 specialized agents
│   ├── hooks/              # v10 safety hooks
│   │   ├── circuit-breaker.sh
│   │   ├── audit-trail.sh
│   │   ├── self-modify-gate.sh
│   │   └── quality-gate.sh
│   ├── agent-iam.json      # Role-based access control
│   ├── skill-rules.json    # 22 auto-activation rules
│   └── hooks.json          # Hook lifecycle config
│
├── adapters/               # Platform adapters
│   ├── cursor/             # .cursorrules generator
│   ├── windsurf/           # .windsurfrules generator
│   ├── gemini/             # GEMINI.md generator
│   └── generic/            # CONTEXT.md generator
│
├── departments/            # Agent team definitions
│   ├── content/
│   ├── design/
│   ├── dev/
│   ├── marketing/
│   └── business/
│
├── mcp-servers/            # MCP integrations (optional)
├── templates/              # Reusable templates
├── workflows/              # Workflow definitions
├── docs/infographics/      # Visual documentation
├── install.sh              # Multi-platform installer
├── CLAUDE.md               # Claude Code context
└── package.json            # v10.0.0
```

---

## The Starlight Connection

ACOS is the **Claude Code implementation** of the [Starlight Intelligence System](https://github.com/frankxai/Starlight-Intelligence-System) — a universal, platform-agnostic framework for multi-agent orchestration.

```
Starlight Intelligence System (Framework)
├── 5-layer cognitive architecture
├── 7 council agents with emergent leadership
├── 6 orchestration patterns
└── Platform adapters
     └── ACOS (Claude Code + Multi-Platform)
         ├── 50+ commands routed through /acos
         ├── 39 agents aligned to Starlight council
         ├── 90+ auto-activating skills
         ├── v10 safety systems (IAM, circuit breaker, audit)
         └── Self-learning via trajectory patterns
```

---

## Design Principles

1. **Configuration over Code** — Markdown + JSON + AI's native abilities. Zero install friction.
2. **Commands over Prompts** — Reusable workflows beat one-off prompts. Build once, use forever.
3. **Agents over Chat** — Specialized expertise beats general conversation.
4. **Files over Memory** — Persistent artifacts beat ephemeral threads. Everything is git-trackable.
5. **Progressive Disclosure** — Load only what you need. ~100 tokens metadata before 5K skill definition.
6. **Open and Forkable** — MIT licensed. Every component replaceable.

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| **v10.0** | Feb 2026 | Autonomous Intelligence — 5 safety systems, multi-platform, Agent IAM |
| v8.0 | Feb 2026 | Starlight integration, GitHub release assets, swarm orchestration |
| v7.0 | Feb 2026 | Visionary agent, premium infographics, expanded commands |
| v6.0 | Jan 2026 | Smart router (/acos), auto-activation, hooks |
| v5.0 | Jan 2026 | 7-pillar architecture, 62 skills, swarm topologies |
| v4.0 | Jan 2026 | Initial release, 14 commands, basic skills |

---

## Credits & Attribution

ACOS builds on work from the open-source community:

| Project | Author | What We Learned |
|---------|--------|-----------------|
| [claude-flow](https://github.com/ruvnet/claude-flow) | @ruvnet | Swarm orchestration, hierarchical topologies |
| [wshobson/agents](https://github.com/wshobson/agents) | @wshobson | Plugin architecture, modular skills |
| [obra/superpowers](https://github.com/obra/superpowers) | @obra | Progressive disclosure, token-efficient loading |
| [diet103/claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase) | @diet103 | `skill-rules.json` auto-activation pattern |
| [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase) | @ChrisWiles | Hook automation patterns |
| [Pimzino/claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow) | @Pimzino | Spec-driven development |
| [github/github-mcp-server](https://github.com/github/github-mcp-server) | GitHub | Official GitHub MCP server |
| [agentic-jujutsu](https://github.com/ruvnet/agentic-jujutsu) | @ruvnet | Self-learning trajectory patterns |

**Built on:** [Claude Code](https://claude.ai/claude-code) by Anthropic, [Model Context Protocol](https://modelcontextprotocol.io/)

---

## Related Projects

- **[Starlight Intelligence System](https://github.com/frankxai/Starlight-Intelligence-System)** — The universal framework powering ACOS
- **[Arcanea](https://github.com/frankxai/arcanea)** — AI-native creative platform built with ACOS

---

## License

MIT — Use it, fork it, build your own OS with it.

---

<div align="center">

**Agentic Creator OS v10.0** — Autonomous Intelligence

*90+ Skills | 50+ Commands | 39 Agents | Multi-Platform | Self-Learning*

[GitHub](https://github.com/frankxai/agentic-creator-os) | [Website](https://frankx.ai/products/agentic-creator-os) | [Issues](https://github.com/frankxai/agentic-creator-os/issues)

</div>
