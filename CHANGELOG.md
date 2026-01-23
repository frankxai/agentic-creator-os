# Changelog

All notable changes to Agentic Creator OS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **Luminor Oracle** (30%) - Strategy and foresight
- **Creation Engine** (25%) - Content and products
- **Technical Translator** (25%) - AI education
- **Frequency Alchemist** (20%) - Music and consciousness

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

### v5.1.0 (Planned)
- [ ] Automated model routing (Haiku→Sonnet→Opus)
- [ ] Anti-drift configuration enforcement
- [ ] Swarm orchestration automation

### v6.0.0 (Planned)
- [ ] 100+ specialized subagents
- [ ] Visual skill marketplace
- [ ] Cross-model support (GPT-4, Gemini)
- [ ] Analytics dashboard

---

**Full documentation**: [ARCHITECTURE.md](./ARCHITECTURE.md)
**Usage guide**: [USAGE_GUIDE.md](./USAGE_GUIDE.md)
**Status dashboard**: [PRO_STATUS_DASHBOARD.md](./PRO_STATUS_DASHBOARD.md)
