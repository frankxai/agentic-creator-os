---
name: acos-meta
description: "ACOS self-description and configuration skill. Documents how ACOS works, how to extend it, how to add new skills/commands/agents, and how to debug the hook system. Use when building new ACOS capabilities, understanding the system architecture, or onboarding to ACOS for the first time."
---

# ACOS Meta

ACOS describes itself using the same primitives it uses to build everything else. This skill is ACOS about ACOS.

## System Architecture

```
acos-intelligence-system/
├── .claude-plugin/
│   └── plugin.json              ← Plugin manifest (v11.0.0)
├── .mcp.json                    ← MCP server registry
├── CONNECTORS.md                ← Connector category map
├── skills/                      ← Domain expertise (subdirs, progressive disclosure)
│   ├── [skill-name]/
│   │   ├── SKILL.md             ← Lean main file (<3K words)
│   │   └── references/          ← Deep content, fetched on demand
├── commands/                    ← Slash commands (one .md per command)
├── hooks/                       ← Lifecycle automation (SessionStart, Stop, etc.)
├── docs/                        ← Strategy documents
└── README.md                    ← Entry point
```

## The 3 Design Principles (Drawn from knowledge-work-plugins)

### 1. Progressive Disclosure
SKILL.md contains the mental model and workflow skeleton. Details live in `references/`. Claude loads the lean summary and fetches references only when needed. This keeps context efficient without sacrificing depth.

### 2. Connector Agnosticism
Skills reference `~~categories`, not vendor names. The `.mcp.json` maps categories to specific tools. Swap tools without touching skill content.

### 3. Commands as Workflows
Commands are fully-specified workflows in markdown — trigger, input gathering, decision logic, output structure, follow-up options. No code. Claude interprets and executes.

## How ACOS Auto-Routing Works

The `/acos` command is the entry point. It routes based on keyword detection:

```
User request
    |
    ├── AI architecture keywords    → Technical Architect agent
    ├── Content/writing keywords    → Content Engine
    ├── Music keywords              → Music Producer
    ├── Visual/image keywords       → Visual Creation Council
    ├── Deploy/build keywords       → DevOps Pipeline
    ├── Research keywords           → Deep Research swarm
    └── Complex/multi-file          → Full swarm (5+ agents)
```

The hook system (`hooks/skill-activation-prompt.sh`) enhances routing with pattern matching before Claude processes the request.

## Adding a New Skill

1. Create `skills/[skill-name]/SKILL.md`
2. Add YAML frontmatter: `name`, `description` (include trigger phrases)
3. Write lean main content (<3K words) covering: overview, core concepts, workflow, key principles
4. Create `skills/[skill-name]/references/` for detailed content
5. Register in `skills/skill-rules.json` if using activation matching
6. Test: mention trigger phrases and verify activation in session

**SKILL.md frontmatter template:**
```yaml
---
name: skill-name
description: "One-sentence description. Include trigger phrases like: what actions activate this skill, what topics it covers."
---
```

## Adding a New Command

1. Create `commands/[command-name].md`
2. Use the standard command structure:
   - YAML frontmatter: `description`, `argument-hint` (optional)
   - `> See CONNECTORS.md` reference
   - `## Workflow` with numbered steps
   - Input gathering, tool use, output format, follow-up options
3. No code logic — pure markdown workflow
4. Test: run `/[command-name]` and verify execution

**Command frontmatter template:**
```yaml
---
description: What this command does in one sentence
argument-hint: "<optional argument description>"
---
```

## Adding a New Agent

1. Create `.claude/agents/[agent-name].md`
2. Define: role, capabilities, tools, escalation path
3. Reference from orchestration commands or swarm topology
4. Test via Task tool: `Task(subagent_type="[agent-name]", prompt="...")`

## Debugging the Hook System

ACOS has 15 hooks across 6 lifecycle events. When hooks behave unexpectedly:

1. Check audit trail: `cat .claude-flow/audit.jsonl | tail -20`
2. Check circuit breaker state: `cat .claude-flow/circuit-breaker.json`
3. View learning metrics: `cat .claude-flow/metrics/learning-status.json`
4. Run monitor: `npm run monitor` (real-time hook dashboard)

**Hook event map:**
```
SessionStart    → session-start.js + starlight-bridge + todo-continuation restore
UserPromptSubmit → skill-activation-prompt.sh
PreToolUse      → quality-gate + circuit-breaker
PostToolUse     → post-tool-track.js + audit-trail
Stop            → stop-finalize.js + todo-continuation save + learning-hooks
PreCompact      → context preservation
```

## Intelligence Score System

ACOS tracks its own intelligence score across sessions:

| Component | Weight | Measured by |
|-----------|--------|-------------|
| Skill activation accuracy | 25% | Trajectory success rates |
| Pattern extraction quality | 25% | n-gram count in patterns.json |
| Memory utilization | 20% | Context recovery on session start |
| Hook reliability | 15% | Zero circuit breaker breaks |
| Self-modify safety | 15% | Score delta tracking |

View with `/acos-score`.

## ACOS × knowledge-work-plugins

ACOS v11 integrates patterns from the [knowledge-work-plugins](https://github.com/frankxai/knowledge-work-plugins) ecosystem:

| Pattern | Source | Applied in ACOS |
|---------|--------|----------------|
| Progressive disclosure | knowledge-work-plugins | All new skills use SKILL.md + references/ |
| Plugin manifest | knowledge-work-plugins | `.claude-plugin/plugin.json` |
| Connector agnosticism | knowledge-work-plugins | `CONNECTORS.md` with `~~category` placeholders |
| Command workflow format | knowledge-work-plugins | Standardized command structure with input gathering |
| Two-tier memory | productivity plugin | creator-productivity skill |
| Brand voice framework | marketing plugin | brand-voice skill |

ACOS contributes back to knowledge-work-plugins:
- `creator/` plugin — creator-specific domain (content, visual, music)
- Pattern: quality gates in visual and content creation
- Pattern: music prompt engineering pipeline

See `references/v11-architecture-decisions.md` for the full integration rationale.
