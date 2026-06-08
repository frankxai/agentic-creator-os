# ACOS Agent Registry

Quick reference for all agents in Agentic Creator OS. Use this to find the right agent for your task.

**Total Agents:** 133 (129 with valid frontmatter, 115 unique after deduplication)
**Total Skills:** 285
**Total Commands:** 165

---

## Quick Lookup by Task

| I need to... | Use Agent |
|--------------|-----------|
| Plan a feature | `planner`, `goal-planner` |
| Write code | `coder`, `sparc-coder` |
| Review code | `reviewer`, `code-analyzer` |
| Research a topic | `researcher`, `autoresearcher` |
| Test code | `tester` |
| Write content | `frankx-content-creation`, `content-polisher` |
| Write a book | `master-story-architect`, genre-specific writers |
| Manage PRs | `pr-manager`, `swarm-pr` |
| Track issues | `issue-tracker`, `swarm-issue` |
| Coordinate swarms | `queen-coordinator`, `collective-intelligence-coordinator` |
| Optimize performance | `performance-optimizer`, `benchmark-suite` |
| Design UI/UX | `ux-design-development`, `performance-guardian` |
| Deploy to Vercel | `nextjs-vercel-deployment` |
| Create music | `frequency-music-production` |
| Generate images | `nano-banana-image-generation` |

---

## Core Agents

Fundamental agents for SPARC methodology.

| Agent | Purpose | Priority |
|-------|---------|----------|
| `planner` | Strategic planning, task decomposition | high |
| `coder` | Code implementation, TDD | high |
| `reviewer` | Code review, quality assessment | high |
| `researcher` | Information gathering, analysis | high |
| `tester` | Test creation, validation | high |

**Location:** `.claude/agents/core/`

---

## Content & Writing Agents

Agents for content creation and publishing.

| Agent | Purpose |
|-------|---------|
| `frankx-content-creation` | FrankX brand content |
| `content-polisher` | Polish content to publish-ready |
| `social-content-generator` | Platform-optimized social media |
| `master-story-architect` | Chief orchestrator for book projects |
| `developmental-editor` | Story structure, pacing |
| `line-editor-voice-alchemist` | Prose polishing, voice consistency |
| `character-psychologist` | Deep character development |
| `world-architect` | World-building for fiction |
| `continuity-guardian` | Series consistency, canon keeper |
| `publishing-strategist` | Market positioning, launch planning |
| `sensitivity-reader` | Cultural respect, representation |

### Genre-Specific Writers

| Agent | Genre |
|-------|-------|
| `fantasy-book-writer` | Epic fantasy, sci-fi |
| `deep-fiction-writer` | Purpose-driven fiction |
| `business-book-writer` | Business parables, self-help |
| `creator-book-writer` | Creator economy, AI-human collaboration |
| `golden-age-visionary` | Inspirational manifestos |

**Location:** `.claude/agents/` (root level)

---

## GitHub Integration Agents

Agents for GitHub workflows and automation.

| Agent | Purpose |
|-------|---------|
| `pr-manager` | PR lifecycle, review coordination |
| `issue-tracker` | Issue management, progress monitoring |
| `code-review-swarm` | Multi-agent code reviews |
| `github-modes` | Workflow orchestration |
| `multi-repo-swarm` | Cross-repository automation |
| `release-manager` | Version management, deployment |
| `release-swarm` | Multi-platform releases |
| `repo-architect` | Repository structure optimization |
| `swarm-issue` | Issue-based swarm coordination |
| `swarm-pr` | PR swarm management |
| `sync-coordinator` | Multi-repo synchronization |
| `workflow-automation` | CI/CD pipeline creation |
| `project-board-sync` | GitHub Projects integration |

**Location:** `.claude/agents/github/`

---

## Hive-Mind & Swarm Agents

Agents for distributed coordination.

| Agent | Purpose |
|-------|---------|
| `queen-coordinator` | Hierarchical hive orchestration |
| `collective-intelligence-coordinator` | Distributed cognitive processes |
| `swarm-memory-manager` | Distributed memory management |
| `scout-explorer` | Information reconnaissance |
| `worker-specialist` | Task execution |

**Location:** `.claude/agents/hive-mind/`

---

## Consensus Agents

Agents for distributed consensus protocols.

| Agent | Purpose |
|-------|---------|
| `byzantine-coordinator` | Byzantine fault-tolerant consensus |
| `raft-manager` | Raft algorithm, leader election |
| `quorum-manager` | Dynamic quorum adjustment |
| `gossip-coordinator` | Gossip-based protocols |
| `crdt-synchronizer` | Conflict-free replicated data types |
| `security-manager` | Consensus security mechanisms |
| `performance-benchmarker` | Consensus benchmarking |

**Location:** `.claude/agents/consensus/`

---

## Optimization Agents

Agents for performance and resource optimization.

| Agent | Purpose |
|-------|---------|
| `topology-optimizer` | Swarm topology reconfiguration |
| `load-balancer` | Task distribution, work-stealing |
| `resource-allocator` | Adaptive resource allocation |
| `benchmark-suite` | Performance benchmarking |
| `performance-monitor` | Real-time metrics, anomaly detection |

**Location:** `.claude/agents/optimization/`

---

## Sublinear Agents

Agents using sublinear algorithms for large-scale operations.

| Agent | Purpose |
|-------|---------|
| `pagerank-analyzer` | Graph analysis, network optimization |
| `matrix-optimizer` | Matrix analysis, condition numbers |
| `performance-optimizer` | System performance, bottleneck identification |
| `trading-predictor` | Financial trading, temporal advantage |
| `consensus-coordinator` | Fast agreement protocols |

**Location:** `.claude/agents/sublinear/`

---

## Goal-Oriented Agents

Agents using GOAP (Goal-Oriented Action Planning).

| Agent | Purpose |
|-------|---------|
| `goal-planner` | Dynamic planning, adaptive replanning |
| `code-goal-planner` | Code-centric goal planning |

**Location:** `.claude/agents/goal/`

---

## Prompt Engineering Agents

Agents for prompt design and optimization.

| Agent | Purpose |
|-------|---------|
| `prompt-conductor` | Top-level prompt hub orchestrator |
| `prompt-architect` | Design prompts from blank |
| `prompt-claude-specialist` | Claude/Anthropic prompt patterns |
| `prompt-gemini-specialist` | Gemini prompt patterns |
| `prompt-oss-specialist` | Open-source model prompts |
| `prompt-harvester` | Import patterns from external sources |
| `prompt-librarian` | Manage prompt library corpus |
| `prompt-red-team` | Adversarial prompt auditing |
| `prompt-psyche-cartographer` | IFS-based introspection |
| `prompt-psychometrist` | Psychometric instruments |

**Location:** `.claude/agents/` (root level)

---

## Meta Agents

System-level agents for ACOS operations.

| Agent | Purpose |
|-------|---------|
| `meta-acos-router` | Top-level intent routing |
| `meta-memory-guardian` | RAM zone classification |
| `meta-safety-guard` | Pre-flight gate for destructive ops |
| `meta-verification-loop` | Pre-completion verification |
| `meta-agentic-jujutsu` | Pattern recall from trajectories |
| `meta-sync-repos` | Config synchronization |
| `meta-handover` | Session handover docs |
| `meta-eod` | End-of-day wrap-up |
| `meta-agent-quality-auditor` | Agent file quality scoring |

**Location:** `.claude/agents/` (root level)

---

## Specialized Agents

Domain-specific agents.

| Agent | Purpose | Domain |
|-------|---------|--------|
| `nextjs-vercel-deployment` | Next.js + Vercel deployment | Web Dev |
| `ux-design-development` | UI/UX design | Design |
| `performance-guardian` | Core Web Vitals, Lighthouse | Performance |
| `accessibility-auditor` | WCAG 2.2, screen readers | Accessibility |
| `frankx-website-builder` | Personal hub creation | Web Dev |
| `frequency-music-production` | AI music with Suno | Music |
| `nano-banana-image-generation` | Image generation | Visual |
| `template-design` | Template creation | Products |
| `coaching-program-design` | Coaching programs | Business |
| `book-distiller` | Book quotes/summaries | Reading |
| `research-daily-ops` | Daily research operations | Research |
| `research-guardian` | Research quality gate | Research |
| `autoresearcher` | Hypothesis-driven research | Research |
| `integrity-guard` | Brand + claim verification | Quality |
| `visual-brand-guidelines` | Visual brand gate | Brand |
| `starlight-orchestrator` | Multi-agent coordination | System |
| `luminor-strategic-guidance` | Strategic AI guidance | Strategy |
| `weekly-recap` | Weekly progress reports | Reporting |

---

## Analysis Agents

Agents for code and system analysis.

| Agent | Purpose |
|-------|---------|
| `code-analyzer` | Code quality analysis |
| `analyze-code-quality` | Comprehensive code reviews |
| `discussion-based-planning` | Understanding before implementation |

**Location:** `.claude/agents/analysis/`

---

## Development Agents

Agents for specific development tasks.

| Agent | Purpose |
|-------|---------|
| `dev-backend-api` | Backend API development |
| `spec-mobile-react-native` | React Native mobile |
| `ops-cicd-github` | GitHub Actions CI/CD |
| `docs-api-openapi` | OpenAPI documentation |
| `data-ml-model` | ML model development |

**Location:** `.claude/agents/development/`, `.claude/agents/devops/`, `.claude/agents/documentation/`, `.claude/agents/data/`

---

## Payments Agents

Agents for autonomous commerce.

| Agent | Purpose |
|-------|---------|
| `agentic-payments` | Multi-agent payment authorization |

**Location:** `.claude/agents/payments/`

---

## Adding New Agents

See [AGENT_CONTRIBUTION_GUIDE.md](AGENT_CONTRIBUTION_GUIDE.md) for:

- Agent file template
- YAML frontmatter requirements
- Frank DNA alignment checklist
- Testing procedures

---

## Agent Templates

Pre-built templates for common agent patterns:

| Template | Purpose |
|----------|---------|
| `automation-smart-agent.md` | Intelligent spawning |
| `coordinator-swarm-init.md` | Swarm initialization |
| `github-pr-manager.md` | PR lifecycle |
| `implementer-sparc-coder.md` | Code implementation |
| `memory-coordinator.md` | Memory management |
| `orchestrator-task.md` | Task orchestration |
| `performance-analyzer.md` | Performance analysis |
| `sparc-coordinator.md` | SPARC methodology |

**Location:** `.claude/agents/templates/`

---

*Last updated: 2026-06-08*
