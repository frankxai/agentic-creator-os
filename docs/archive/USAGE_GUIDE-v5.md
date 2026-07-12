# Agentic Creator OS - Usage Guide

**Complete guide to using ACOS v5 for content creation, development, and creative workflows.**

---

## Quick Start

### 1. Launch ACOS

```bash
/acos
```

This displays the system status and available modules.

### 2. Use a Skill

Skills auto-activate based on keywords, or invoke directly:

```bash
# By keyword (auto-activation)
"Help me write tests for this component"
→ Auto-loads: test-driven-development + react-nextjs-patterns

# Direct invocation
/frontend-design
/3d-design
/suno-ai-mastery
```

### 3. Activate an Agent

```
"Activate Code Architect mode for system design"
"Engage Sonic Engineer for music creation"
"Engage Creation Engine for content development"
"Consult Visionary for strategic guidance"
```

---

## System Architecture

```
╔═════════════════════════════════════════════════════════════════════════════╗
║                         AGENTIC CREATOR OS v5.0                              ║
║                    "The Operating System for Golden Age Creators"            ║
╠═════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌───────────────────────────────────────────────────────────────────────┐  ║
║  │                      STARLIGHT ORCHESTRATOR                            │  ║
║  │                   Meta-Intelligence Coordinator                         │  ║
║  │         Weighted Synthesis • Agent Routing • Context Preservation       │  ║
║  └───────────────────────────────────────────────────────────────────────┘  ║
║                                    │                                         ║
║       ┌────────────────────────────┼────────────────────────────┐           ║
║       │                            │                            │           ║
║       ▼                            ▼                            ▼           ║
║  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐      ║
║  │   SKILLS     │          │   AGENTS     │          │  WORKFLOWS   │      ║
║  │   LAYER      │◄────────►│   LAYER      │◄────────►│   LAYER      │      ║
║  │              │          │              │          │              │      ║
║  │  70 Skills   │          │  10 Agents   │          │  8 Pipelines │      ║
║  │  6 Categories│          │  5 Depts     │          │  4 Patterns  │      ║
║  └──────────────┘          └──────────────┘          └──────────────┘      ║
║       │                            │                            │           ║
║       └────────────────────────────┼────────────────────────────┘           ║
║                                    │                                         ║
║                                    ▼                                         ║
║  ┌───────────────────────────────────────────────────────────────────────┐  ║
║  │                         MCP SERVERS LAYER                              │  ║
║  │     Browser • Creator • Database • Email • Evaluator • Website         │  ║
║  └───────────────────────────────────────────────────────────────────────┘  ║
║                                                                              ║
╚═════════════════════════════════════════════════════════════════════════════╝
```

---

## Available Skills (70)

### Technical (26 skills)
| Skill | Triggers | Purpose |
|-------|----------|---------|
| `test-driven-development` | "write tests", "TDD" | Test-first development |
| `systematic-debugging` | "debug", "fix bug" | Methodical debugging |
| `react-nextjs-patterns` | "React", "Next.js" | Modern React patterns |
| `api-design` | "API", "endpoint" | REST/GraphQL design |
| `ci-cd-pipeline` | "CI/CD", "GitHub Actions" | Automation pipelines |
| `docker-containers` | "Docker", "container" | Containerization |
| `monitoring-observability` | "logging", "metrics" | Observability stack |
| `security-hardening` | "security", "OWASP" | Security best practices |
| `database-migrations` | "migration", "schema" | DB schema changes |
| `async-python` | "asyncio", "async Python" | Python concurrency |

### Creative (9 skills)
| Skill | Triggers | Purpose |
|-------|----------|---------|
| `frontend-design` | "build UI", "design page" | Production-grade interfaces |
| `3d-design` | "3D", "Three.js", "Spline" | 3D web experiences |
| `suno-ai-mastery` | "Suno", "AI music" | AI music production |
| `frankx-brand` | "FrankX style", "brand" | Brand guidelines |
| `content-strategy` | "content plan", "editorial" | Content planning |

### Personal (4 skills)
| Skill | Triggers | Purpose |
|-------|----------|---------|
| `spartan-warrior` | "discipline", "Spartan" | Mental toughness |
| `gym-training-expert` | "workout", "training" | Exercise programming |
| `health-nutrition-expert` | "nutrition", "diet" | Evidence-based nutrition |

---

## Available Commands

### Core Commands
| Command | Purpose |
|---------|---------|
| `/acos` | Launch ACOS system overview |
| `/factory` | Full publishing pipeline |
| `/research` | Deep research workflow |
| `/deploy` | Production deployment |
| `/publish` | Content publishing |

### Design Commands
| Command | Purpose |
|---------|---------|
| `/frontend-design` | Build production UIs |
| `/3d-design` | Create 3D experiences |
| `/ui-ux-pro-max` | UI/UX design intelligence |

---

## Specialist Agents

### Multi-Agent Synthesis System

When multiple perspectives are needed, specialist agents contribute based on their domain expertise:

| Agent | Domain | Role | Activation |
|-------|--------|------|------------|
| **Visionary** | Strategy, foresight | Long-term planning | "Consult Luminor" |
| **Creation Engine** | Content, products | Publishing pipeline | "Engage Creation Engine" |
| **Code Architect** | Dev, systems | Technical decisions | "Code Architect mode" |
| **Sonic Engineer** | Music, audio | Sound design | "Engage Sonic Engineer" |

**Starlight Orchestrator** synthesizes all perspectives into unified guidance.

### Department Teams

| Department | Lead Agent | Focus |
|------------|------------|-------|
| Content | Writer + Editor | Blog, articles, docs |
| Design | Visual + UX | UI, graphics, brand |
| Dev | Frontend + Backend | Code, architecture |
| Marketing | Growth + Analytics | Distribution, SEO |
| Business | Strategy + Ops | Planning, execution |

---

## MCP Servers

### Available Servers

| Server | Tools | Purpose |
|--------|-------|---------|
| **browser-mcp** | `navigate`, `click`, `type` | Web automation |
| **creator-mcp** | `twitter_post`, `linkedin_post` | Social publishing |
| **database-mcp** | `query`, `create_article`, `store_memory` | Data persistence |
| **email-mcp** | `send_email`, `create_campaign` | Email delivery |
| **evaluator-mcp** | `evaluate_content`, `evaluate_hook` | Quality scoring |
| **website-mcp** | `fetch_page`, `extract_content` | Web scraping |

### Database MCP Tools

```typescript
// Store agent memory
store_memory({
  agent_id: "creation-engine",
  memory_type: "observation",
  content: "User prefers concise content"
});

// Recall memories
recall_memory({
  agent_id: "creation-engine",
  memory_type: "observation",
  limit: 10
});

// Article management
create_article({ title: "...", content: "...", tags: ["ai"] });
list_articles({ status: "draft", limit: 20 });
update_article({ id: 1, status: "published" });
```

---

## Workflow Patterns

### 1. Content Creation Pipeline

```
/factory

Research → Plan → Create → Optimize → Publish
   │         │        │         │         │
   ▼         ▼        ▼         ▼         ▼
 SEO     Outline   Draft    Editor    Deploy
 Scout    Agent    Engine    Agent    Script
```

### 2. Parallel Distribution

```
Content Created
       │
       ├──► LinkedIn Agent ──► Published
       ├──► Twitter Agent ──► Published
       └──► Newsletter Agent ──► Sent
```

### 3. Quality Loop

```
Create → Evaluate → Quality OK? → Done
   ▲                    │
   └────── NO ──────────┘
```

---

## Installation

### For Users

```bash
# Clone the repository
git clone https://github.com/frankxai/agentic-creator-os.git

# Install dependencies
cd agentic-creator-os
npm install

# Run install script
./install.sh
```

### Configure Claude Code

Add to your Claude Code settings:

```json
{
  "mcpServers": {
    "acos-database": {
      "command": "node",
      "args": ["path/to/agentic-creator-os/mcp-servers/database/build/index.js"]
    },
    "acos-evaluator": {
      "command": "node",
      "args": ["path/to/agentic-creator-os/mcp-servers/evaluator/build/index.js"]
    }
  }
}
```

---

## Best Practices

### 1. Start with /acos
Always begin a session with `/acos` to see system status and available modules.

### 2. Let Skills Auto-Activate
Skills detect context automatically. Just describe what you need.

### 3. Use Agents for Complex Decisions
When you need strategic guidance, activate specialist agents.

### 4. Run Workflows for Pipelines
For multi-step processes, use built-in workflows like `/factory`.

### 5. Evaluate Before Publishing
Always run content through the evaluator MCP before publishing.

---

## Troubleshooting

### Skills Not Loading
- Check that skill files exist in `.claude/skills/`
- Verify YAML frontmatter with `triggers`

### MCP Servers Not Responding
- Rebuild: `npm run build` in the MCP server directory
- Check Node.js version (18+ required)

### Agent Confusion
- Be explicit: "Activate [Agent Name] mode"
- Use full agent names, not abbreviations

---

## Resources

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 7-pillar system design |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [PRO_STATUS_DASHBOARD.md](./PRO_STATUS_DASHBOARD.md) | System health |
| [SKILL_TREE.md](./SKILL_TREE.md) | Visual skill map |

---

**Version**: 5.0.0 | **Skills**: 70 | **Agents**: 10 | **Workflows**: 8

*Technology that amplifies creative expression, not replaces it.*
