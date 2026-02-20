# Agentic Creator OS v10 — Project Instructions

> The operating system for AI-powered creators. Multi-platform, self-learning, safety-first.

---

## What is ACOS?

**Agentic Creator OS v10** is a skill, agent, and workflow system for AI coding assistants. When loaded, you get:

- **35+ Commands** — Reusable workflows accessible via `/acos` smart router (Claude Code)
- **75+ Skills** — Auto-activate via `skill-rules.json` based on task context
- **38 Specialized Agents** — Writers, editors, designers, strategists, engineers
- **v10 Safety Hooks** — Circuit breaker, audit trail, self-modify gate, agent IAM

## Quick Start

```bash
# Claude Code
/acos                    # Smart router — shows all commands
/article-creator         # Write a blog post
/create-music            # Produce a track with Suno
/spec                    # Spec-driven feature development
/starlight-architect     # Enterprise AI system design
```

On non-Claude platforms, just describe what you want. Skills activate from context.

## Available Commands (35+)

### Creation (8)
| Command | Description |
|---------|-------------|
| `/article-creator` | Guided blog article creation |
| `/create-music` | Suno music production pipeline |
| `/infogenius` | Research-grounded image generation |
| `/generate-images` | Direct image generation |
| `/generate-social` | Platform-optimized social content |
| `/factory` | Full publishing pipeline |
| `/products-creation` | Digital products, courses, templates |
| `/author-team` | Book writing with specialist team |

### Strategy (6)
| Command | Description |
|---------|-------------|
| `/starlight-architect` | Enterprise AI system design |
| `/starlight-intelligence` | Strategic AI orchestration |
| `/council` | Multi-agent decision council |
| `/research` | Intelligence operations |
| `/plan-week` | Weekly content planning |
| `/harvest` | Prompt discovery & collection |

### Development (4)
| Command | Description |
|---------|-------------|
| `/spec` | Spec-driven feature development |
| `/nextjs-deploy` | Next.js + Vercel deployment |
| `/ux-design` | UI/UX design workflows |
| `/automation-dev` | MCP servers & automation |

### System (5)
| Command | Description |
|---------|-------------|
| `/acos` | Smart router — single entry point |
| `/planning-with-files` | File-based planning |
| `/inventory-status` | Content inventory dashboard |
| `/mcp-status` | MCP server health |
| `/publish` | Content publishing with quality gates |

### Quality (3)
| Command | Description |
|---------|-------------|
| `/review-content` | Content quality review |
| `/classify-content` | Content routing & classification |
| `/polish-content` | Polish to publish-ready |

## Auto-Activation

Skills load automatically via `.claude/skill-rules.json` — 22 pattern rules:

```
User: "write a blog post about AI agents"
  → Detects: "blog", "write"
  → Auto-loads: content-strategy skill
  → Routes to: /article-creator
```

## v10 Safety Systems

### Circuit Breaker
Tracks failures per file. 3 → warn, 5 → restrict, 8 → block.

### Agent IAM
6 profiles with per-tool, per-directory scoping. Content writers can't run bash. Security auditors are read-only.

### Self-Modify Gate
Snapshots config before changes. If intelligence score drops >5 points: auto-revert.

### Audit Trail
Append-only JSONL logging of all significant actions.

## Decision Framework

Before ANY structural change:

1. **What specific problem are we solving?**
2. **What's the simplest solution?**
3. **What could go wrong?**
4. **Is this reversible?**

## Brand Voice

- Direct, technical, warm
- Lead with results, not claims
- No spiritual/guru language
- Show don't tell

---

*ACOS v10.1 — Autonomous Intelligence*
*Created by [FrankX](https://github.com/frankxai)*
