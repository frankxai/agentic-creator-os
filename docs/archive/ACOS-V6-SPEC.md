# Agentic Creator OS v6 Specification
**Codename: The Front Door**

*From fragmented commands to a unified operating system*

---

## Executive Summary

ACOS v6 addresses the three biggest gaps identified in v5:

1. **No single entry point** -- Users didn't know whether to use `/acos`, `/starlight-architect`, `/council`, or natural language. v6 creates `/acos` as the intelligent router.
2. **Skills didn't auto-activate** -- Users had to manually invoke `/skill`. v6 adds `skill-rules.json` for keyword-triggered activation.
3. **Best commands weren't in the repo** -- 11 commands lived at FrankX-level only. v6 migrates them all.

**v6 = v5 (Swarm Protocol) + Smart Router + Auto-Activation + New Sources**

---

## What's New in v6

### New Sources Absorbed

| Source | What We Learned | Implementation |
|--------|----------------|----------------|
| [diet103/claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase) | `skill-rules.json` pattern for auto-activation | `.claude/skill-rules.json` |
| [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase) | Hook automation (format, test, enforce) | `.claude/hooks.json` |
| [decider/claude-hooks](https://github.com/decider/claude-hooks) | Clean code enforcement hooks | Brand voice + quality gates |
| [jeremylongshore/claude-code-plugins-plus-skills](https://github.com/jeremylongshore/claude-code-plugins-plus-skills) | 2026 schema validation, 739 skill patterns | Skill template updates |
| [quemsah/awesome-claude-plugins](https://github.com/quemsah/awesome-claude-plugins) | Plugin adoption metrics, n8n indexing | Plugin structure reference |
| [zilliztech/claude-context](https://github.com/zilliztech/claude-context) | Semantic code search MCP | Recommended MCP integration |
| [github/github-mcp-server](https://github.com/github/github-mcp-server) | Official GitHub MCP | Recommended MCP integration |
| [Pimzino/claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow) | Spec-driven development | `/spec` command |
| [claude-flow v3](https://github.com/ruvnet/claude-flow) | Self-learning hooks, 250% efficiency | Context engineering patterns |

### Cumulative Sources (v5 + v6)

| Version | Sources |
|---------|---------|
| v4 | GSD Context Engineering, obra/superpowers |
| v5 | + claude-flow, wshobson/agents, VoltAgent, claude-code-mcp |
| v6 | + diet103, ChrisWiles, decider, jeremylongshore, quemsah, zilliztech, github-mcp, Pimzino, claude-flow v3 |

**Total unique sources**: 14 repositories

---

## Architecture: What Changed

### Before (v5): Fragmented Entry Points

```
User has to know:
  /starlight-intelligence  → Strategic mode
  /council                 → Multi-agent deliberation
  /generate-images         → Image creation
  /factory                 → Content pipeline (NOT in repo)
  /infogenius              → Visual knowledge (NOT in repo)
  /research                → Intelligence ops (NOT in repo)
  "Activate CACOS"         → Natural language activation
  ultrawork                → Magic word for parallel agents
```

### After (v6): Single Front Door

```
/acos → Smart Router
  │
  ├── DETECTS "write blog"    → /article-creator
  ├── DETECTS "make music"    → /create-music
  ├── DETECTS "create images" → /infogenius
  ├── DETECTS "strategy"      → /starlight-architect
  ├── DETECTS "research"      → /research
  ├── DETECTS "build feature" → /spec
  ├── DETECTS "status"        → Dashboard
  └── AMBIGUOUS              → Shows menu with all 25 commands
```

---

## New Components

### 1. `/acos` Smart Router (`.claude/commands/acos.md`)

The single entry point. Parses user intent via keyword matching and routes to the correct command, agent, or workflow. Falls back to an interactive menu when intent is ambiguous.

### 2. Skill Auto-Activation (`.claude/skill-rules.json`)

22 skill activation rules with:
- **Keyword triggers**: Match words in user messages
- **File pattern triggers**: Match files being edited
- **Command triggers**: Activate when specific commands run
- **Priority levels**: High/Medium/Low for load ordering
- **Max concurrent**: 3 skills loaded simultaneously

### 3. Hooks System (`.claude/hooks.json`)

4 hook categories:
- **SessionStart**: Load ACOS context + skill rules
- **PreToolUse**: Brand voice check before writing
- **PostToolUse**: Context quality monitoring
- **Notification**: Skill suggestions

Plus enforcement rules for banned phrases and required patterns.

### 4. Migrated Commands (11 new)

| Command | Purpose |
|---------|---------|
| `/acos` | Smart router (NEW) |
| `/infogenius` | Research-grounded image generation |
| `/factory` | Full publishing pipeline |
| `/research` | Daily intelligence operations |
| `/create-music` | Suno music creation pipeline |
| `/spec` | Spec-driven development |
| `/harvest` | Prompt discovery & collection |
| `/article-creator` | Guided article creation |
| `/starlight-architect` | Enterprise AI system design |
| `/plan-week` | Weekly content planning |
| `/inventory-status` | Content inventory dashboard |
| `/publish` | Content publishing command |

**Total commands**: 25 (14 from v5 + 11 new)

---

## Configuration-First Philosophy

ACOS v6 deliberately chooses **configuration-first** over **code-first**:

| Approach | Example | ACOS Choice |
|----------|---------|-------------|
| Code-first | claude-flow (TypeScript + WASM runtime) | No |
| Configuration-first | Markdown commands + JSON rules + Claude native | **Yes** |

**Why:**
1. **Zero install friction** -- Clone repo, open Claude Code, done
2. **Works everywhere** -- Any Claude Code environment, no npm needed
3. **Leverages Claude's native abilities** -- Skills are just knowledge, not code
4. **Creator-friendly** -- Creators edit markdown, not TypeScript
5. **Portable** -- Works with any Claude Code version

**The tradeoff:** We don't get claude-flow's WASM Agent Booster or SQLite memory backend. We accept this because Claude Code's native Task tool, progressive skill loading, and MCP integrations cover 90% of the use cases without custom runtime code.

---

## Complete Command Reference (v6)

### Creation (8 commands)
| Command | Description |
|---------|-------------|
| `/article-creator` | Guided blog article creation |
| `/create-music` | Suno music production pipeline |
| `/infogenius` | Research-grounded image generation |
| `/generate-images` | Direct image generation |
| `/generate-social` | Platform-optimized social content |
| `/factory` | Full publishing pipeline (research→publish) |
| `/products-creation` | Digital products, courses, templates |
| `/author-team` | Book writing with author team |

### Strategy (5 commands)
| Command | Description |
|---------|-------------|
| `/starlight-architect` | Enterprise AI system design |
| `/council` | Superintelligent multi-agent council |
| `/research` | Daily intelligence operations |
| `/plan-week` | Weekly content planning |
| `/harvest` | Prompt discovery & collection |

### Development (4 commands)
| Command | Description |
|---------|-------------|
| `/spec` | Spec-driven feature development |
| `/nextjs-deploy` | Next.js + Vercel deployment |
| `/ux-design` | UI/UX design workflows |
| `/automation-dev` | MCP servers & automation |

### System (5 commands)
| Command | Description |
|---------|-------------|
| `/acos` | Smart router - single entry point |
| `/planning-with-files` | Manus-style file planning |
| `/inventory-status` | Content inventory dashboard |
| `/mcp-status` | MCP server health |
| `/publish` | Content publishing |

### Quality (3 commands)
| Command | Description |
|---------|-------------|
| `/review-content` | Content quality review |
| `/classify-content` | Content routing & classification |
| `/polish-content` | Polish to publish-ready |

---

## Skill Inventory (v6)

### By Source

| Source | Skills | Examples |
|--------|--------|---------|
| Anthropic Official | 15 | docx, pdf, pptx, xlsx, canvas-design, mcp-builder, skill-creator |
| FrankX Original | 12 | suno-ai-mastery, content-strategy, social-media-strategy, cacos |
| Community (obra, etc.) | 8 | planning-with-files, opus-extended-thinking, claude-sdk |
| Personal Development | 4 | spartan-warrior, gym-training-expert, health-nutrition-expert, greek-philosopher |
| Enterprise | 3 | oci-services-expert, mcp-architecture, security-auditor |

**Total skills**: ~42 (loaded via progressive disclosure)

### Auto-Activation Coverage

| Category | Skills with Auto-Activation | Coverage |
|----------|----------------------------|----------|
| Content | 3 (content-strategy, social-media, excellence-book-writing) | High |
| Technical | 5 (nextjs, mcp, claude-sdk, planning, security) | High |
| Creative | 2 (suno-ai-mastery, framer-expert) | Medium |
| Business | 2 (product-management, oci-services) | Medium |
| Personal | 3 (spartan, gym, health-nutrition) | Low |
| System | 2 (cacos, agentic-orchestration) | High |

---

## Recommended MCP Servers (v6)

| Server | Source | Purpose | Priority |
|--------|--------|---------|----------|
| Playwright | Built-in | Browser automation, testing | Installed |
| Sequential Thinking | Built-in | Complex reasoning chains | Installed |
| Memory (Knowledge Graph) | Built-in | Persistent knowledge | Installed |
| Lyric Genius | Custom | Music prompt engineering | Installed |
| Nano Banana | Custom | Image generation (Gemini) | Installed |
| [GitHub MCP](https://github.com/github/github-mcp-server) | Official | PR/Issue management | Recommended |
| [Claude Context](https://github.com/zilliztech/claude-context) | Community | Semantic code search | Recommended |

---

## Migration Guide: v5 → v6

For existing ACOS users:

1. `git pull` to get all new files
2. `/acos` is now your single entry point
3. Skills auto-activate -- no need for manual `/skill` calls
4. All commands now ship with the repo (no FrankX-level dependency)

No breaking changes. All v5 commands still work.

---

## Metrics Targets (v6)

| Metric | v5 | v6 Target |
|--------|-------|-----------|
| Total Commands | 14 | 25 |
| Total Skills | ~62 | ~80 |
| Auto-Activation Rate | 0% | 70% |
| Commands in Repo | 14 | 25 (100%) |
| GitHub Sources Credited | 5 | 14 |
| Hook Categories | 0 | 4 |

---

*ACOS v6.0 - The Front Door*
*January 2026 | 25 Commands | 40+ Agents | 80+ Skills | Auto-Activation*
