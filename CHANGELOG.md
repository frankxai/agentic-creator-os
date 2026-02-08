# Changelog

All notable changes to Agentic Creator OS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [6.0.2] - 2026-02-02

### Complete Banned Phrase Cleanup & Documentation Fixes

This release completes the cleanup of banned phrases and fixes documentation gaps.

### Changed

**Banned Phrase Cleanup (CLAUDE.md Compliance)**
- Replaced all remaining instances of "soul-aligned" → "purpose-driven"
- Replaced "consciousness" → "awareness", "intentional", or "purpose"
- Replaced "awakening" → "discovery", "building", or "present"
- Updated agent descriptions to use grounded, functional language

**Agent Naming**
- Renamed `conscious-fiction-writer.md` → `deep-fiction-writer.md`
- "Consciousness Fiction Master" → "Deep Fiction Master"
- Updated all references in author-team.md

**Documentation**
- Added `/starlight-intelligence` to CLAUDE.md command table (was missing)
- Updated command count: 25 → 26
- Updated ARCHITECTURE.md: v3.0.0 → v6.0.1, skills 62 → 80+
- Added honest note about metrics being design targets

**Configuration**
- Removed duplicate skill-rules files (was 4, now 1)
- Replaced hardcoded Windows paths with environment variable placeholders
- Paths like `/mnt/c/Users/Frank/...` → `$FRANKX_DIR` etc.

### Removed
- `.claude/skill-rules-v2.json` (duplicate)
- `.claude/skills/skill-rules.json` (duplicate)
- `skills/skill-rules.json` (duplicate)

---

## [6.0.1] - 2026-02-02

### Metrics Accuracy & Agent Naming Fix

This release addresses documentation accuracy issues identified in the v6.0 release.

### Changed

**Agent Naming (More Functional)**
- `Technical Translator` → `Code Architect` — Maps clearly to dev/systems domain
- `Frequency Alchemist` → `Sonic Engineer` — Functional music/audio role name

**Removed Hallucinated Metrics**
- Removed arbitrary percentage weights (30%, 25%, 25%, 20%) from agent descriptions
- These were placeholder values with no measurement system behind them
- Replaced with domain-based descriptions (what agents actually do)

**Cleaned Up Language**
- Removed "consciousness" language that violated CLAUDE.md banned phrases
- "Music + Consciousness" → "Music + Audio Production"
- "consciousness technology" → "audio engineering"
- "500+ AI songs" → "300+ AI songs" (actual verified count)
- "losing your soul" → "losing your authentic voice" (grounded language)

### Note on System Status

ACOS is at the **architecture and design phase**. The agent hierarchy, orchestration patterns, and MCP foundation are defined conceptually. Real-time dashboards and live telemetry are not yet implemented. Documentation now clearly separates what's designed from what's measured.

---

## [6.0.0] - 2026-01-25

### The Front Door Release

v6 addresses the three biggest gaps in v5: no single entry point, no auto-activation, and 11 commands missing from the repo. **v6 = v5 (Swarm Protocol) + Smart Router + Auto-Activation + 9 New Sources**

### Added

**Smart Router**
- `/acos` command — single entry point that parses intent and routes to the best subsystem
- Route table covering Creation (8), Strategy (5), Development (4), System (5), Quality (3) commands
- Multi-command orchestration for cross-domain requests
- Interactive menu when intent is ambiguous

**Skill Auto-Activation (`skill-rules.json`)**
- 22 activation rules with keyword, file pattern, and command triggers
- Priority ordering (High/Medium/Low) with max 3 concurrent skills
- Always-active skills (cacos, planning-with-files)
- Auto-load brand skill on every session

**Hooks System (`hooks.json`)**
- SessionStart: ACOS context loader + skill-rules loader
- PreToolUse: Brand voice check on Write/Edit operations
- PostToolUse: Context quality monitoring on Task operations
- Notification: Skill suggestions based on activity
- Enforcement rules: banned phrases, required patterns for blog/social/code
- Context engineering config: quality curve, per-agent budgets, anti-drift checkpoints

**Migrated Commands (11 commands now in repo)**
- `/infogenius` — Research-grounded image generation
- `/factory` — Full publishing pipeline (research → publish)
- `/research` — Daily intelligence operations
- `/create-music` — Suno music creation pipeline
- `/spec` — Spec-driven development
- `/harvest` — Prompt discovery & collection
- `/article-creator` — Guided article creation
- `/starlight-architect` — Enterprise AI system design
- `/plan-week` — Weekly content planning
- `/inventory-status` — Content inventory dashboard
- `/publish` — Content publishing with quality gates

**Documentation**
- `ACOS-V6-SPEC.md` — Full v6 specification
- 10 infographic PNGs in `docs/infographics/`
- Updated CREDITS.md with 14 total sources

### New Sources Absorbed

| Source | Pattern Learned |
|--------|-----------------|
| [diet103/claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase) | `skill-rules.json` auto-activation |
| [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase) | Hook automation patterns |
| [decider/claude-hooks](https://github.com/decider/claude-hooks) | Clean code enforcement hooks |
| [jeremylongshore/claude-code-plugins-plus-skills](https://github.com/jeremylongshore/claude-code-plugins-plus-skills) | 2026 schema validation, 739 skill patterns |
| [quemsah/awesome-claude-plugins](https://github.com/quemsah/awesome-claude-plugins) | Plugin adoption metrics |
| [zilliztech/claude-context](https://github.com/zilliztech/claude-context) | Semantic code search MCP |
| [github/github-mcp-server](https://github.com/github/github-mcp-server) | Official GitHub MCP |
| [Pimzino/claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow) | Spec-driven development |
| [claude-flow v3](https://github.com/ruvnet/claude-flow) | Context engineering, self-learning hooks |

### Changed

- Version bumped from 5.0.0 to 6.0.0
- README.md updated with v6 architecture, `/acos` entry point, command table
- Total commands: 14 → 25
- Total skills: 62 → 80+
- Total credited sources: 5 → 14
- Configuration-first philosophy: markdown + JSON, no npm install needed

---

## [5.0.0] - 2026-01-23

### 🚀 Major Release: Swarm Creator Protocol

This release synthesizes patterns from 5 leading Claude Code repositories into a unified creator-focused operating system.

### Added

**Skills Library Complete (70 skills)**
- `ci-cd-pipeline` - GitHub Actions CI/CD patterns
- `api-design` - REST/GraphQL API design patterns
- `docker-containers` - Containerization best practices
- `monitoring-observability` - Logging, metrics, tracing
- `security-hardening` - OWASP, auth, secure headers
- `database-migrations` - Prisma/Drizzle migration patterns
- `async-python` - asyncio, aiohttp patterns
- `documentation-generation` - TSDoc, OpenAPI, READMEs

**New MCP Features**
- Agent memory system (`store_memory`, `recall_memory` tools)
- Turso cloud database support via libsql
- Universal Node.js compatibility (18, 20, 22, 24+)

**New Commands**
- `/acos` - Quick launcher for all ACOS features
- `/3d-design` - Two-mode 3D design (Creator + Developer)

**Enhanced Skills**
- `/frontend-design` - Now includes icon integration (Lucide, Heroicons, Phosphor)

**Architecture Specs**
- `ACOS-V4-SPEC.md` - GSD Context Engineering
- `ACOS-V5-SPEC.md` - Swarm Creator Protocol

### Changed

- **database-mcp**: Migrated from `better-sqlite3` to `@libsql/client`
  - No more native compilation issues
  - Works on any Node.js version 18+
  - Optional Turso cloud support
- Updated all status dashboards to 100% completion

### Fixed

- Node.js v24 compatibility for database MCP server
- Progressive disclosure now at 100% coverage

### Integration Sources

| Source | Patterns Absorbed |
|--------|-------------------|
| [claude-flow](https://github.com/ruvnet/claude-flow) | Swarm orchestration, 3-tier routing |
| [wshobson/agents](https://github.com/wshobson/agents) | 72 plugins, 129 skills pattern |
| [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | Ecosystem mapping |
| [VoltAgent](https://github.com/VoltAgent/awesome-claude-code-subagents) | 100+ subagent patterns |
| [claude-code-mcp](https://github.com/steipete/claude-code-mcp) | Agent-in-agent recursion |

---

## [4.0.0] - 2026-01-20 (Spec Only)

### Added

- GSD Context Engineering specification
- Hub Generator for creator instances
- `HUB.md`, `STATE.md`, `VOICE.md` pattern

---

## [3.0.0] - 2026-01-15

### 🎉 Production Release

### Added

- 62 skills across 6 categories
- 9 specialist agents with weighted synthesis
- 8 orchestrated workflows
- 6 MCP servers (browser, creator, database, email, evaluator, website)
- Progressive disclosure architecture (<500 lines per skill)
- Department structure (content, design, dev, marketing, business)

### Agent System

- **Starlight Orchestrator** - Meta-intelligence coordinator
- **Visionary** - Strategy and foresight
- **Creation Engine** - Content and products
- **Code Architect** - Dev and systems
- **Sonic Engineer** - Music and audio

---

## [2.0.0] - 2026-01-08

### Added

- Initial skill library (40 skills)
- Basic agent hierarchy
- First MCP server implementations
- Template system

---

## [1.0.0] - 2025-12-15

### Added

- Project inception
- Core architecture design
- Initial README and CLAUDE.md
- Basic skill structure

---

## Roadmap

### v6.1.0 (Planned)
- [ ] Automated model routing (Haiku→Sonnet→Opus)
- [ ] Full hooks integration with Claude Code native hooks API
- [ ] Anti-drift enforcement automation
- [ ] MCP server health monitoring

### v7.0.0 (Planned)
- [ ] 100+ specialized subagents
- [ ] Visual skill marketplace
- [ ] Cross-model support (GPT-4, Gemini)
- [ ] Analytics dashboard
- [ ] Community hub generator

---

**Full documentation**: [ARCHITECTURE.md](./ARCHITECTURE.md)
**Usage guide**: [USAGE_GUIDE.md](./USAGE_GUIDE.md)
**Status dashboard**: [PRO_STATUS_DASHBOARD.md](./PRO_STATUS_DASHBOARD.md)
