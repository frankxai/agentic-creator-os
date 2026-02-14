<p align="center">
  <img src="https://github.com/frankxai/agentic-creator-os/releases/download/v8.0-assets/01-acos-hero.png" alt="Agentic Creator OS" width="100%">
</p>

<p align="center">
  <strong>The operating system for generative creators</strong>
</p>

<p align="center">
  <a href="#architecture"><img src="https://img.shields.io/badge/Pillars-7_Foundational-7fffd4?style=flat-square&labelColor=0d1117" alt="Pillars"></a>
  <a href="#commands"><img src="https://img.shields.io/badge/Commands-130+-ffd700?style=flat-square&labelColor=0d1117" alt="Commands"></a>
  <a href="#agents"><img src="https://img.shields.io/badge/Agents-40+-9966ff?style=flat-square&labelColor=0d1117" alt="Agents"></a>
  <a href="#skills"><img src="https://img.shields.io/badge/Skills-630+-78a6ff?style=flat-square&labelColor=0d1117" alt="Skills"></a>
  <a href="#orchestration"><img src="https://img.shields.io/badge/Orchestration-Swarm_Enabled-ff6b6b?style=flat-square&labelColor=0d1117" alt="Orchestration"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-white?style=flat-square&labelColor=0d1117" alt="MIT"></a>
</p>

---

## The Problem

AI tools are powerful individually. But creators don't work in single-task mode. They research, write, design, code, publish, and market — often in a single session. Each task requires different context, different expertise, different quality standards.

The current state: jump between tools, re-explain context, lose thread, repeat.

## The ACOS Approach

One command. One entry point. The system routes to the right agent, loads the right skills, applies the right quality gates, and remembers what it learned for next time.

```bash
/acos
```

ACOS is a **Claude Code-native operating system** that turns a single AI conversation into a coordinated workforce of 40+ specialized agents, each backed by domain-specific skills that auto-activate based on context. Built on the [Starlight Intelligence System](https://github.com/frankxai/Starlight-Intelligence-System) framework.

---

## Architecture

<p align="center">
  <img src="https://github.com/frankxai/agentic-creator-os/releases/download/v8.0-assets/02-smart-router.png" alt="Intelligent Command Routing" width="100%">
</p>

### The 7 Pillars

| # | Pillar | Purpose | Scale |
|---|--------|---------|-------|
| 1 | **Skills** | Domain knowledge modules that auto-activate via `skill-rules.json` | 630+ |
| 2 | **Agents** | Specialized AI personas with distinct domains and weighted influence | 40+ |
| 3 | **Commands** | Slash commands with `/acos` as the single intelligent entry point | 130+ |
| 4 | **MCP Servers** | External tool integrations via Model Context Protocol | 6 |
| 5 | **Templates** | Reusable content patterns across 40+ formats | 40+ |
| 6 | **Instances** | Per-project configurations that customize system behavior | Unlimited |
| 7 | **Intelligence** | Cross-cutting capabilities: hooks, self-learning, context engineering | 7 events |

### Intelligent Routing

Every request flows through the `/acos` smart router:

```
User intent → Keyword analysis → Domain classification → Agent selection → Skill activation → Execution
```

The router classifies intent into 8 domains (code, content, music, design, strategy, automation, research, consultation), selects the optimal agent, and auto-activates relevant skills — all before execution begins.

### Skill Auto-Activation

Skills activate based on context, not manual invocation. The `skill-rules.json` maps 22 trigger patterns to skill modules:

```json
{
  "trigger": "*.tsx",
  "skill": "react-patterns",
  "priority": "high"
}
```

When a React file is in scope, React patterns load automatically. When a Supabase query appears, database patterns activate. The system adapts to what you're doing without being told.

---

## Agents

ACOS uses a **3-level agent hierarchy** powered by the Starlight Intelligence System:

```
Level 3: STARLIGHT ORCHESTRATOR
  Meta-intelligence — coordinates across all agents
  Weighted synthesis for complex multi-domain decisions

Level 2: SPECIALIST AGENTS
  40+ domain experts: Creation Engine, Sonic Engineer,
  Code Architect, Visionary, Design Director, etc.

Level 1: SKILLS
  630+ knowledge modules that auto-activate
  and inform agent behavior
```

### Council Mode

For decisions rated complexity 9-10, the Starlight Council convenes — all Tier 1 agents analyze independently, then perspectives are synthesized through weighted consensus:

```bash
/council "Should we migrate from REST to GraphQL for the creator API?"
```

The council runs parallel analysis across architecture, content impact, creative workflow implications, and strategic alignment — then delivers a synthesized recommendation with confidence scores.

### Agent Catalog (Highlights)

| Agent | Domain | Trigger |
|-------|--------|---------|
| **Starlight Orchestrator** | Meta-coordination | Complex multi-domain requests |
| **Creation Engine** | Content & products | `/article-creator`, `/factory` |
| **Sonic Engineer** | Music production | `/create-music` |
| **Code Architect** | Development | Code tasks, architecture |
| **Visionary** | Strategy & foresight | `/council`, strategic planning |
| **Design Director** | Visual design | UI/UX, branding |
| **Research Analyst** | Intelligence gathering | `/research` |
| **InfoGenius** | Visual knowledge | `/infogenius` |

See `.claude/agents/` for the full 40+ agent library.

---

## Orchestration

<p align="center">
  <img src="https://github.com/frankxai/agentic-creator-os/releases/download/v8.0-assets/03-swarm-orchestration.png" alt="Swarm Orchestration Topologies" width="100%">
</p>

### Swarm Topologies

ACOS supports three swarm topologies via [claude-flow](https://github.com/ruvnet/claude-flow) integration:

| Topology | Structure | Use Case |
|----------|-----------|----------|
| **Hierarchical** | Coordinator validates all outputs | Structured development, quality-gated workflows |
| **Mesh** | Peer-to-peer agent coordination | Research, brainstorming, exploration |
| **Star** | Central coordinator with satellites | Testing, validation, parallel analysis |

### Magic Words

Trigger multi-agent swarm execution with shorthand:

| Command | Effect |
|---------|--------|
| `ultrawork` / `ulw` | Fire ALL relevant agents in parallel |
| `ultracode` / `ulc` | Fire coding specialists in parallel |

### Self-Learning (Agentic Jujutsu)

The system learns from every session:

```
Session Start → Create trajectory record
Session Active → Track operations and outcomes
Session End → Extract patterns → Store learnings
Future Sessions → Apply accumulated intelligence
```

After 3-5 sessions, the system recommends optimizations based on observed patterns. Built on [ruvnet/agentic-jujutsu](https://github.com/ruvnet/agentic-jujutsu) (v2.3.6, MIT).

---

## Commands

### Core Commands (26 User-Facing)

| Category | Commands |
|----------|----------|
| **Entry** | `/acos` — smart router to everything |
| **Content** | `/article-creator`, `/factory`, `/publish`, `/review-content` |
| **Music** | `/create-music` |
| **Visual** | `/infogenius`, `/design-team`, `/design-review` |
| **Development** | `/spec`, `/tdd`, `/debug`, `/refactor` |
| **Strategy** | `/council`, `/starlight-intelligence`, `/research` |
| **Operations** | `/inventory-status`, `/plan-week`, `/weekly-recap` |
| **Automation** | `/harvest`, `/classify-content`, `/generate-social` |

### Internal Commands (~100)

Infrastructure commands for swarm coordination, GitHub automation, monitoring, and CI/CD — managed through claude-flow integration.

---

## Skills

630+ skills organized by domain with progressive disclosure — metadata loads first (~100 tokens), full definition loads only when activated (<5K tokens):

| Domain | Skills | Examples |
|--------|--------|---------|
| **Content** | Brand voice, SEO, social media | `frankx-brand`, `content-strategy` |
| **Music** | Suno AI, prompt engineering, production | `suno-ai-mastery`, `suno-prompt-architect` |
| **Development** | React, TypeScript, Supabase, MCP | `react-patterns`, `mcp-architecture` |
| **AI/ML** | Prompt engineering, model routing, agents | `prompt-engineer`, `model-routing` |
| **Design** | UI/UX, accessibility, visual systems | `frontend-design`, `ui-ux-design-expert` |
| **Strategy** | Decision frameworks, orchestration | `agentic-orchestration`, `swarm-advanced` |
| **Memory** | Cross-session persistence, learning | `agentdb-memory-patterns`, `reasoningbank` |

### Creating Skills

```bash
cp templates/SKILL_TEMPLATE.md .claude/skills/[domain]/[name]/SKILL.md
```

Each skill follows a standard structure: YAML frontmatter with triggers, purpose, patterns with code examples, anti-patterns, and related skills. See `templates/SKILL_TEMPLATE.md`.

---

## The Starlight Connection

<p align="center">
  <img src="https://github.com/frankxai/agentic-creator-os/releases/download/v8.0-assets/04-creator-ecosystem.png" alt="The FrankX Ecosystem" width="100%">
</p>

ACOS is the **Claude Code implementation** of the [Starlight Intelligence System](https://github.com/frankxai/Starlight-Intelligence-System) — the universal, platform-agnostic framework for multi-agent orchestration.

```
Starlight Intelligence System (Framework)
├── 5-layer cognitive architecture
├── 7 council agents with emergent leadership
├── 6 orchestration patterns
├── 6 persistent memory vaults
└── Platform adapters for 6 AI tools
     │
     └── ACOS (Claude Code Implementation)
         ├── 130+ commands routed through /acos
         ├── 40+ agents aligned to Starlight council
         ├── 630+ auto-activating skills
         ├── Swarm topologies via claude-flow
         └── Self-learning via Agentic Jujutsu
              │
              └── Powers → Arcanea (Creative Universe)
                  ├── 10 Guardian agents mapped to council
                  ├── AI-native creative platform
                  └── On-chain NFT infrastructure
```

ACOS is where Starlight's intelligence meets Claude Code's execution. The framework provides the architecture; ACOS provides the tools.

---

## Quick Start

### Install

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
./install.sh
```

### Or Manual Setup

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
cp .claude/commands/*.md ~/.claude/commands/
claude
/acos
```

### First Commands

```bash
/acos                  # Smart router — see all 26 commands
/article-creator       # Write a blog post with full pipeline
/create-music          # Produce a track with Suno AI
/infogenius            # Generate research-grounded visuals
/council               # Convene the Starlight Council
/spec                  # Start spec-driven development
```

---

## Project Structure

```
agentic-creator-os/
├── .claude/
│   ├── agents/              # 40+ agent definitions
│   │   ├── starlight-orchestrator.md
│   │   ├── core/            # 5 core agents
│   │   ├── consensus/       # 7 consensus agents
│   │   ├── hive-mind/       # 5 hive-mind agents
│   │   ├── swarm/           # 3 swarm coordinators
│   │   └── templates/       # 9 agent templates
│   ├── commands/            # 130+ slash commands
│   │   ├── acos.md          # THE entry point
│   │   └── ...
│   ├── skills/              # 80+ SKILL.md files (630+ sub-skills)
│   │   ├── skill-rules.json # 22 auto-activation rules
│   │   └── ...
│   └── hooks.json           # 7-event lifecycle hooks
├── departments/             # 5 team structures
│   ├── business/
│   ├── content/
│   ├── design/
│   ├── dev/
│   └── marketing/
├── templates/               # 40+ content templates
├── workflows/               # 37 YAML workflow pipelines
├── mcp-servers/             # 4 MCP server implementations
├── instances/               # Project-specific configs
└── docs/infographics/       # Visual documentation
```

---

## Configuration

### Lifecycle Hooks

7 hook events enforce quality and enable automation:

```json
{
  "hooks": [
    { "event": "SessionStart", "action": "load-context" },
    { "event": "UserPromptSubmit", "action": "classify-intent" },
    { "event": "PreToolUse", "action": "validate-safety" },
    { "event": "PostToolUse", "action": "record-trajectory" },
    { "event": "PostToolUseFailure", "action": "error-recovery" },
    { "event": "Stop", "action": "extract-patterns" },
    { "event": "PreCompact", "action": "preserve-state" }
  ]
}
```

### Instances

Customize ACOS for any project by creating an instance:

```bash
cp -r instances/_template instances/my-project
```

Each instance overrides agent behavior, skill priorities, and workflow parameters for its specific context.

---

## Design Principles

1. **Configuration over Code** — Markdown commands + JSON rules + Claude's native abilities. Zero install friction.
2. **Commands over Prompts** — Reusable workflows beat one-off prompts. Build once, use forever.
3. **Agents over Chat** — Specialized expertise beats general conversation. Domain knowledge compounds.
4. **Files over Memory** — Persistent artifacts beat ephemeral threads. Everything is git-trackable.
5. **Progressive Disclosure** — Load only what you need. ~100 tokens metadata before 5K skill definition.
6. **Open and Forkable** — MIT licensed. Every component replaceable. Clone, customize, own it.

---

## Attribution

ACOS builds on the work of the Claude Code community. Full credits in [CREDITS.md](CREDITS.md).

Key sources:

| Project | Author | Contribution |
|---------|--------|-------------|
| [claude-flow](https://github.com/ruvnet/claude-flow) | @ruvnet | Swarm orchestration, consensus protocols |
| [wshobson/agents](https://github.com/wshobson/agents) | @wshobson | Plugin architecture, 108-agent patterns |
| [obra/superpowers](https://github.com/obra/superpowers) | @obra | Progressive disclosure, token-efficient loading |
| [diet103/showcase](https://github.com/diet103/claude-code-infrastructure-showcase) | @diet103 | `skill-rules.json` auto-activation |
| [ChrisWiles/showcase](https://github.com/ChrisWiles/claude-code-showcase) | @ChrisWiles | Hook automation patterns |

Built on [Claude Code](https://claude.ai/claude-code) by Anthropic and the [Model Context Protocol](https://modelcontextprotocol.io/).

---

## Related Projects

- **[Starlight Intelligence System](https://github.com/frankxai/Starlight-Intelligence-System)** — The universal framework powering ACOS
- **[Arcanea](https://github.com/frankxai/arcanea)** — AI-native creative platform built with ACOS
- **[Arcanea On-Chain](https://github.com/frankxai/arcanea-onchain)** — Blockchain infrastructure for creator IP

---

## License

MIT — Use it, fork it, build your own OS with it.

---

<p align="center">
  <strong>Agentic Creator OS v8.0</strong><br>
  <em>The operating system for the age of generative creation.</em><br><br>
  <a href="https://github.com/frankxai">Built by FrankX</a> | Powered by <a href="https://github.com/frankxai/Starlight-Intelligence-System">Starlight</a>
</p>
