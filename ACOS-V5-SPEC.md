# Agentic Creator OS v5 Specification
**Codename: Swarm Creator Protocol**

*Synthesizing the best patterns from the Claude Code ecosystem for creators*

---

## Executive Summary

ACOS v5 integrates patterns from 5 leading Claude Code repositories:

| Source | Absorbed Patterns |
|--------|-------------------|
| [claude-flow](https://github.com/ruvnet/claude-flow) | Swarm orchestration, 3-tier model routing, anti-drift, AgentDB |
| [wshobson/agents](https://github.com/wshobson/agents) | 72 plugins, 129 skills, progressive disclosure, marketplace |
| [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | Ecosystem mapping, claudekit patterns |
| [awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | 100+ specialized subagents, category organization |
| [claude-code-mcp](https://github.com/steipete/claude-code-mcp) | Agent-in-agent pattern, MCP server recursion |

**Result**: A creator-focused AI operating system with enterprise-grade orchestration.

---

## Part 1: Architecture Overview

```
ACOS v5 = v4 (GSD Context Engineering)
        + claude-flow (Swarm Orchestration)
        + wshobson/agents (Plugin Marketplace)
        + VoltAgent (100+ Subagents)
        + claude-code-mcp (Recursive Agents)
```

### Core Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ACOS v5 ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 5: CREATOR HUB                      │   │
│  │  HUB.md | STATE.md | VOICE.md | Daily Workflows              │   │
│  │  (From v4 - GSD Context Engineering)                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 4: SWARM ORCHESTRATION              │   │
│  │  Hierarchical | Mesh | Queen-led Hive Mind                   │   │
│  │  Anti-Drift Config | One-Message Parallelism                 │   │
│  │  (From claude-flow)                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 3: MODEL ROUTING                    │   │
│  │  Agent Booster (WASM) → Haiku → Sonnet → Opus               │   │
│  │  Intelligent 3-Tier Cost Optimization                        │   │
│  │  (From claude-flow ADR-026)                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 2: PLUGIN MARKETPLACE               │   │
│  │  72 Plugins | 129 Skills | Progressive Disclosure            │   │
│  │  npm Distribution | Minimal Token Usage                      │   │
│  │  (From wshobson/agents)                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 1: AGENT LIBRARY                    │   │
│  │  100+ Specialized Subagents | 9 Categories                   │   │
│  │  Creator-Focused: Music, Content, Products, Brand            │   │
│  │  (From VoltAgent + FrankX Original)                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    LAYER 0: MCP FOUNDATION                   │   │
│  │  Claude Code SDK | Agent-in-Agent Pattern                    │   │
│  │  MCP Protocol | Memory Backend (AgentDB)                     │   │
│  │  (From claude-code-mcp + Anthropic SDK)                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 2: Swarm Orchestration (From claude-flow)

### 2.1 Topology Options

| Topology | Use Case | Anti-Drift Level |
|----------|----------|------------------|
| **hierarchical** | Complex features, multi-step tasks | Highest |
| **mesh** | Simple tasks, parallel work | Medium |
| **hive-mind** | Consensus decisions, distributed reasoning | High |

### 2.2 Anti-Drift Configuration (Default for Creators)

```javascript
// ACOS v5 default swarm config
{
  topology: "hierarchical",   // Single coordinator enforces alignment
  maxAgents: 8,               // Smaller team = less drift surface
  strategy: "specialized",    // Clear roles reduce ambiguity
  consensus: "raft"           // Leader maintains authoritative state
}
```

### 2.3 Agent Routing by Task Type

| Task Type | Agents | Topology |
|-----------|--------|----------|
| Content Creation | coordinator, researcher, writer, editor | hierarchical |
| Music Production | coordinator, prompt-engineer, mixer, reviewer | hierarchical |
| Product Launch | coordinator, copywriter, designer, developer | hierarchical |
| Research | researcher, analyst, synthesizer | mesh |
| Bug Fix | debugger, coder, tester | mesh |

### 2.4 One-Message Parallelism Rule

**CRITICAL**: All related operations MUST be in ONE message for parallelism.

```javascript
// ✅ CORRECT - All in one message
Message 1:
  - TodoWrite([...all todos...])
  - Task("Research", ...)
  - Task("Architect", ...)
  - Task("Coder", ...)

// ❌ WRONG - Sequential messages
Message 1: TodoWrite([todo1])
Message 2: Task("Research", ...)
Message 3: Task("Architect", ...)
```

---

## Part 3: Model Routing (From claude-flow ADR-026)

### 3.1 Three-Tier Strategy

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster (WASM) | <1ms | $0 | Simple transforms (var→const, add types) |
| **2** | Haiku 4.5 | ~500ms | $0.0002 | Simple tasks, low complexity (<30%) |
| **3** | Sonnet/Opus 4.5 | 2-5s | $0.003-0.015 | Complex reasoning, architecture (>30%) |

### 3.2 Creator-Optimized Routing

| Task | Model | Reasoning |
|------|-------|-----------|
| Social post draft | Haiku | Simple, fast iteration |
| Blog article | Sonnet | Balanced depth/speed |
| Product strategy | Opus | Complex multi-factor reasoning |
| Voice calibration | Opus | Nuanced pattern recognition |
| Image prompts | Haiku | Quick generation |
| Music prompts | Sonnet | Creative balance |
| Code refactor | Agent Booster + Sonnet | Transform + review |

### 3.3 Model Recommendation Hooks

When hooks output these tags, use the recommended model:

```
[AGENT_BOOSTER_AVAILABLE] → Skip LLM, use Edit tool directly
[TASK_MODEL_RECOMMENDATION] Use model="haiku" → Use Haiku
[TASK_MODEL_RECOMMENDATION] Use model="sonnet" → Use Sonnet
[TASK_MODEL_RECOMMENDATION] Use model="opus" → Use Opus
```

---

## Part 4: Plugin Marketplace (From wshobson/agents)

### 4.1 ACOS Plugin Architecture

```
@frankx/acos-plugin-{name}
├── CLAUDE.md          # Agent configuration
├── skills/            # Progressive disclosure skills
├── commands/          # Slash commands
├── agents/            # Specialized agents
└── package.json       # npm metadata
```

### 4.2 Creator Plugin Categories

| Category | Plugins | Agents |
|----------|---------|--------|
| **Content** | blog-writer, social-manager, newsletter-pro | 6 |
| **Music** | suno-master, audio-mixer, frequency-engineer | 4 |
| **Products** | course-builder, ebook-creator, landing-page | 5 |
| **Brand** | voice-architect, visual-designer, copy-master | 4 |
| **Growth** | seo-optimizer, email-marketer, analytics-pro | 5 |
| **Business** | pricing-strategist, launch-manager, sales-pro | 4 |
| **Technical** | code-reviewer, debugger, deployer | 4 |
| **Research** | topic-researcher, competitor-analyst, trend-scout | 4 |
| **Orchestration** | swarm-coordinator, task-manager, memory-keeper | 3 |

### 4.3 Installation Flow

```bash
# Add ACOS marketplace
/plugin marketplace add frankxai/agentic-creator-os

# Install creator plugins
/plugin install @frankx/acos-content      # Blog, social, newsletter
/plugin install @frankx/acos-music        # Suno, audio, frequency
/plugin install @frankx/acos-products     # Courses, ebooks, landing pages
/plugin install @frankx/acos-brand        # Voice, visual, copy
```

### 4.4 Progressive Disclosure Skills

Skills load knowledge only when activated (token efficiency):

```bash
# Content skills (5)
/skill seo-optimization        # SEO patterns and checklist
/skill voice-matching          # Match creator's voice
/skill hook-writing            # Compelling openings
/skill cta-design              # Conversion-focused CTAs
/skill content-repurposing     # Multi-platform adaptation

# Music skills (4)
/skill suno-prompting          # Advanced Suno techniques
/skill frequency-mapping       # Hz → emotion mapping
/skill song-structure          # Verse/chorus/bridge patterns
/skill genre-blending          # Cross-genre techniques
```

---

## Part 5: Agent Library (From VoltAgent + FrankX)

### 5.1 Creator-Focused Agent Categories

```
acos-agents/
├── 01-content-creation/
│   ├── blog-writer.md
│   ├── newsletter-composer.md
│   ├── social-content-creator.md
│   ├── copywriter.md
│   ├── editor.md
│   └── headline-master.md
│
├── 02-music-production/
│   ├── suno-prompt-architect.md
│   ├── frequency-alchemist.md
│   ├── lyrics-writer.md
│   ├── audio-mixer.md
│   └── music-distributor.md
│
├── 03-product-development/
│   ├── course-architect.md
│   ├── ebook-designer.md
│   ├── landing-page-builder.md
│   ├── pricing-strategist.md
│   └── launch-coordinator.md
│
├── 04-brand-voice/
│   ├── voice-calibrator.md
│   ├── brand-guardian.md
│   ├── visual-director.md
│   └── tone-matcher.md
│
├── 05-growth-marketing/
│   ├── seo-intelligence-scout.md
│   ├── email-sequence-builder.md
│   ├── funnel-architect.md
│   └── analytics-interpreter.md
│
├── 06-research-strategy/
│   ├── topic-researcher.md
│   ├── competitor-analyst.md
│   ├── trend-forecaster.md
│   └── audience-profiler.md
│
├── 07-technical-ops/
│   ├── code-reviewer.md
│   ├── deployer.md
│   ├── debugger.md
│   └── performance-optimizer.md
│
├── 08-orchestration/
│   ├── swarm-coordinator.md
│   ├── task-orchestrator.md
│   ├── memory-manager.md
│   └── context-guardian.md
│
└── 09-meta/
    ├── agent-installer.md
    ├── skill-router.md
    └── model-selector.md
```

### 5.2 Agent Definition Template

```markdown
# [Agent Name]

## Identity
- **Role**: [Specific function]
- **Model**: [haiku|sonnet|opus] or auto-route
- **Category**: [category from above]

## Expertise
[What this agent knows deeply]

## Activation
- Keyword triggers: [words that activate this agent]
- Task patterns: [types of tasks this handles]

## Tools
- Primary: [main tools used]
- Secondary: [supporting tools]

## Collaboration
- Works with: [other agents]
- Hands off to: [agents for next steps]

## Anti-Drift Guardrails
- Stay focused on: [specific scope]
- Do NOT: [out-of-scope actions]
- Checkpoint after: [verification points]

## Output Format
[Expected output structure]
```

---

## Part 6: MCP Foundation (From claude-code-mcp)

### 6.1 Agent-in-Agent Pattern

ACOS v5 can run Claude Code as an MCP server, enabling:
- Recursive agent spawning
- Autonomous execution with `--dangerously-skip-permissions`
- Cross-tool interoperability (Cursor, Windsurf, Claude Desktop)

### 6.2 MCP Configuration

```json
{
  "acos-server": {
    "command": "npx",
    "args": [
      "-y",
      "@frankx/agentic-creator-os@latest",
      "serve"
    ],
    "env": {
      "ACOS_MODE": "mcp-server",
      "ACOS_MODEL_ROUTING": "auto"
    }
  }
}
```

### 6.3 Memory Backend (AgentDB)

From claude-flow's AgentDB integration:

| Feature | Benefit |
|---------|---------|
| Vector search | 150x-12,500x faster retrieval |
| HNSW indexing | Sub-millisecond similarity search |
| Hybrid storage | SQLite + vector for structured + semantic |
| Namespace isolation | Each creator's memory isolated |

---

## Part 7: Creator Hub Generator v5

### 7.1 Enhanced Wizard Flow

```bash
# Initialize hub with swarm support
/acos:init-hub --version=5

# Wizard steps:
# 1. Identity Discovery (same as v4)
# 2. Workflow Mapping (same as v4)
# 3. Tool Integration (same as v4)
# 4. Voice Calibration (same as v4)
# 5. NEW: Swarm Configuration
# 6. NEW: Plugin Selection
# 7. NEW: Model Tier Preferences
```

### 7.2 Generated Hub Structure (v5)

```
.creator-hub/
├── HUB.md                    # Creator identity
├── STATE.md                  # Living memory (<100 lines)
├── VOICE.md                  # Voice patterns
├── SWARM.md                  # NEW: Swarm configuration
├── skills/                   # Auto-selected skills
├── agents/                   # NEW: Custom agent overrides
├── plugins/                  # NEW: Installed plugin configs
├── workflows/
│   ├── daily-ops.md
│   ├── swarm-content.md      # NEW: Multi-agent content workflow
│   └── swarm-launch.md       # NEW: Multi-agent launch workflow
├── templates/
└── outputs/
```

### 7.3 SWARM.md Configuration

```markdown
# Creator Swarm Configuration

## Default Topology
topology: hierarchical
maxAgents: 8
strategy: specialized
consensus: raft

## Agent Roster
| Role | Agent | Model Tier |
|------|-------|------------|
| Coordinator | swarm-coordinator | sonnet |
| Research | topic-researcher | haiku |
| Writing | blog-writer | sonnet |
| Editing | editor | haiku |
| SEO | seo-intelligence-scout | haiku |
| Voice Check | voice-calibrator | opus |

## Task Routing
| Task Type | Agents | Notes |
|-----------|--------|-------|
| Blog post | coordinator, researcher, writer, editor, seo | Full swarm |
| Social post | writer, editor | Quick 2-agent |
| Newsletter | writer, editor, email-builder | Email-optimized |
| Product launch | Full roster + launch-coordinator | All hands |

## Anti-Drift Rules
- Checkpoint after each major phase
- Voice check every 500 words
- SEO check before publish
- Coordinator reviews all outputs
```

---

## Part 8: npm Distribution

### 8.1 Package Structure

```
@frankx/agentic-creator-os/
├── bin/
│   └── acos.js              # CLI entry point
├── src/
│   ├── cli/                 # CLI commands
│   ├── hub-generator/       # Hub initialization
│   ├── swarm/               # Swarm orchestration
│   ├── plugins/             # Plugin management
│   ├── agents/              # Agent library
│   └── mcp/                 # MCP server mode
├── templates/
│   ├── HUB.md
│   ├── STATE.md
│   ├── VOICE.md
│   └── SWARM.md
├── package.json
└── README.md
```

### 8.2 CLI Commands

```bash
# Installation
npx @frankx/agentic-creator-os init    # Initialize hub
npx @frankx/agentic-creator-os serve   # Run as MCP server

# Or global install
npm install -g @frankx/agentic-creator-os
acos init                              # Initialize hub
acos swarm start                       # Start swarm mode
acos plugin install <name>             # Install plugin
acos agent spawn <type>                # Spawn specific agent
```

### 8.3 Versioning Strategy

| Tier | Version | Features |
|------|---------|----------|
| **Free** | `@frankx/acos-core` | Hub generator, 10 agents, basic skills |
| **Pro** | `@frankx/acos-pro` | Full agent library, swarm, all skills |
| **Enterprise** | `@frankx/acos-enterprise` | White-label, custom agents, SLA |

---

## Part 9: SEO & Discovery Strategy

### 9.1 Target Keywords

| Keyword | Monthly Volume | Difficulty |
|---------|---------------|------------|
| Claude Code tutorial 2026 | 8,100 | Medium |
| AI agent for content creators | 4,400 | Low |
| Personal AI operating system | 2,900 | Low |
| MCP server for creators | 1,200 | Low |
| Claude Code plugins | 6,600 | Medium |
| AI workflow automation | 12,000 | High |

### 9.2 Content Strategy

| Content Type | Target Keyword | Platform |
|--------------|---------------|----------|
| Getting Started Guide | Claude Code tutorial | frankx.ai/docs |
| Plugin Directory | Claude Code plugins | frankx.ai/plugins |
| Agent Showcase | AI agent for creators | frankx.ai/agents |
| Workflow Gallery | AI workflow automation | frankx.ai/workflows |
| npm README | Personal AI OS | npmjs.com |

### 9.3 Distribution Channels

1. **npm Registry** (primary) - `npx create-agentic-creator-os`
2. **Claude Plugin Marketplace** - First-mover advantage
3. **ProductHunt** - Creator audience
4. **GitHub** - Developer discovery
5. **frankx.ai** - SEO + conversion

---

## Part 10: Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
- [ ] Set up npm package structure
- [ ] Implement CLI with `commander.js`
- [ ] Port v4 hub-generator to npm
- [ ] Add basic swarm commands

### Phase 2: Swarm Integration (Week 2)
- [ ] Implement hierarchical topology
- [ ] Add model routing logic
- [ ] Create anti-drift hooks
- [ ] Build one-message parallelism

### Phase 3: Plugin System (Week 3)
- [ ] Create plugin loader
- [ ] Implement progressive disclosure
- [ ] Build marketplace integration
- [ ] Package first 10 plugins

### Phase 4: Agent Library (Week 4)
- [ ] Port 40 creator-focused agents
- [ ] Implement agent-in-agent pattern
- [ ] Add AgentDB memory backend
- [ ] Create agent installer

### Phase 5: Launch (Week 5)
- [ ] Documentation site
- [ ] ProductHunt launch
- [ ] Plugin marketplace submission
- [ ] SEO content publishing

---

## Appendix: Forked Repositories

| Repo | Fork URL | Purpose |
|------|----------|---------|
| claude-flow | github.com/frankxai/claude-flow | Swarm patterns |
| agents | github.com/frankxai/agents | Plugin architecture |
| awesome-claude-code | github.com/frankxai/awesome-claude-code | Ecosystem map |
| awesome-claude-code-subagents | github.com/frankxai/awesome-claude-code-subagents | Agent library |
| claude-code-mcp | github.com/frankxai/claude-code-mcp | MCP server |

---

*ACOS v5 - Swarm Creator Protocol*
*Synthesizing the best of Claude Code ecosystem for creators*
*Version 5.0.0-alpha | January 2026*
