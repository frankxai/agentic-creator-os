# ACOS Architecture (v12)

> The doc other docs link to. If reality and this doc disagree, fix one of them
> in the same PR.

## System Shape

```
agentic-creator-os/                  ← Claude Code PLUGIN root (see .claude-plugin/)
├── .claude-plugin/
│   ├── plugin.json                  ← declares component paths below
│   └── marketplace.json             ← makes the repo installable via /plugin marketplace add
├── .claude/
│   ├── skills/                      ← ~100 skills (SKILL.md + references/)
│   ├── commands/                    ← ~70 markdown workflow commands
│   ├── agents/                      ← ~65 specialist agents
│   ├── hooks/                       ← Node hook scripts (telemetry-only)
│   └── skill-rules.json             ← THE activation rules file (single source)
├── skills/                          ← curated public skill lane (also loaded)
├── hooks/hooks.json                 ← plugin hook wiring (3 hooks)
├── content-hooks/                   ← marketing "attention hooks" KB (NOT lifecycle hooks)
├── mcp-servers/                     ← 8 local MCP server packages (creator, evaluator, …)
├── adapters/                        ← grok / opencode platform adapters
├── instances/                       ← per-creator overlays (frankx = worked example)
├── workflows/                       ← YAML playbooks (docs for agents, no runtime)
├── scripts/generate-stats.mjs       ← generated-truth: STATS.md + CI gates
├── CREATOR.md                       ← creator identity contract (template)
└── CLAUDE.md / AGENTS.md / GROK.md  ← per-harness instructions
```

## The Four Layers

| Layer | Mechanism | Load path |
|---|---|---|
| Skills | Progressive disclosure: lean SKILL.md + `references/` | plugin `skills` paths + auto-activation |
| Commands | Markdown workflows, no hidden code | plugin `commands` path, `/name` |
| Agents | Frontmatter personas with explicit `tools` scoping | plugin `agents` path, Task tool |
| Hooks | 3 Node scripts, telemetry-only | `hooks/hooks.json` via `${CLAUDE_PLUGIN_ROOT}` |

## Auto-Activation Flow

```
UserPromptSubmit
  → .claude/hooks/skill-activation-prompt.js
  → loads .claude/skill-rules.json (activation_rules[]: keywords, file_patterns, commands)
  → normalizes, matches, ranks by priority
  → emits additionalContext naming the skills to load
```

Rules and skills are validated by CI (`generate-stats.mjs --check`): a rule
pointing at a missing skill fails the build, as does an empty SKILL.md.

## Identity Model

`CREATOR.md` (root) is the identity contract every agent inherits: voice,
mission, quality bar, constraints. Core content is identity-neutral;
`instances/<name>/` holds per-creator commands/agents/skills/CREATOR.md.
This is the boundary that makes ACOS adoptable by any creator.

## Connector Model

Skills reference `~~categories` (e.g. `~~image generation`, `~~email`), never
vendors. `CONNECTORS.md` maps each category to a default MCP connector and
alternatives. Swapping vendors touches zero skill content.

## Composition Boundaries (what ACOS does NOT vendor)

- **gstack** — engineering sprint system; optional external install
- **claude-flow** — swarm orchestration; removed in v12, install upstream
- **Anthropic document skills** (docx/pptx/xlsx/pdf) — proprietary license;
  install from Anthropic's own distribution
- Attribution for absorbed *patterns* lives in CREDITS.md

## Truth Enforcement

- `STATS.md` is generated; every doc links it instead of hardcoding counts
- CI: manifest JSON validation, leak gate (private paths / telemetry /
  employer refs / third-party attribution), stats freshness, empty-skill gate
- Version identity: plugin.json + package.json + marketplace.json agree; tags
  and releases must match plugin.json before publishing
