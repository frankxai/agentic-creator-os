# Creator Swarm Configuration Template

Template for `.creator-hub/SWARM.md` — multi-agent orchestration settings.

---

## File Template

```markdown
# Creator Swarm Configuration

## Overview

**Creator**: [Name]
**Swarm Style**: [hierarchical | mesh | hive-mind]
**Max Agents**: [6-15 recommended]

---

## Default Topology

| Setting | Value | Reasoning |
|---------|-------|-----------|
| topology | hierarchical | Single coordinator prevents drift |
| maxAgents | 8 | Small team = focused execution |
| strategy | specialized | Clear roles, no overlap |
| consensus | raft | Leader maintains authority |

---

## Model Routing

### Tier Preferences

| Tier | Model | Use For | Cost/1K |
|------|-------|---------|---------|
| 1 | Agent Booster (WASM) | Simple transforms | $0 |
| 2 | Haiku 4.5 | Drafts, simple tasks | $0.0002 |
| 3 | Sonnet 4.5 | Main content work | $0.003 |
| 4 | Opus 4.5 | Strategy, voice work | $0.015 |

### Task → Model Mapping

| Task Type | Model | Notes |
|-----------|-------|-------|
| Social posts | Haiku | Quick, iterative |
| Blog drafts | Sonnet | Balanced quality |
| Product copy | Sonnet | Conversion focus |
| Voice calibration | Opus | Nuance required |
| Code transforms | Agent Booster | Skip LLM entirely |
| Strategy docs | Opus | Complex reasoning |

---

## Agent Roster

### Core Team

| Role | Agent | Model | Responsibility |
|------|-------|-------|----------------|
| Coordinator | swarm-coordinator | sonnet | Orchestration, anti-drift |
| Research | topic-researcher | haiku | Context gathering |
| Writer | blog-writer | sonnet | Content creation |
| Editor | editor | haiku | Polish and clarity |
| Voice | voice-calibrator | opus | Brand consistency |
| SEO | seo-intelligence-scout | haiku | Discoverability |

### Extended Team (On-Demand)

| Role | Agent | When to Activate |
|------|-------|------------------|
| Music | suno-prompt-architect | Music creation tasks |
| Product | landing-page-builder | Launch sequences |
| Email | email-sequence-builder | Nurture campaigns |
| Technical | code-reviewer | Development tasks |

---

## Task Routing

### Content Creation

| Task | Agents | Topology | Notes |
|------|--------|----------|-------|
| Blog post | coordinator, researcher, writer, editor, seo | hierarchical | Full pipeline |
| Social thread | writer, editor | mesh | Quick 2-agent |
| Newsletter | writer, editor, email-builder | hierarchical | Email-optimized |
| Video script | researcher, writer, editor | hierarchical | Research-heavy |

### Product Development

| Task | Agents | Topology | Notes |
|------|--------|----------|-------|
| Course module | researcher, writer, course-architect | hierarchical | Structure first |
| Landing page | copywriter, landing-page-builder | mesh | Parallel work |
| Ebook chapter | researcher, writer, editor | hierarchical | Deep content |

### Music Production

| Task | Agents | Topology | Notes |
|------|--------|----------|-------|
| Song concept | researcher, suno-prompt-architect | mesh | Brainstorm mode |
| Lyrics | lyrics-writer, voice-calibrator | hierarchical | Voice match |
| Full track | coordinator, all music agents | hierarchical | Full production |

---

## Anti-Drift Rules

### Checkpoints

- [ ] After research phase → Coordinator reviews findings
- [ ] After first draft → Voice check against VOICE.md
- [ ] Every 500 words → Alignment verification
- [ ] Before publish → SEO + voice + quality gate

### Guardrails

**Coordinator MUST:**
- Validate each agent output against original goal
- Catch divergence within 2 turns
- Enforce STATE.md updates after each phase

**All Agents MUST:**
- Stay within declared scope
- Reference HUB.md for brand constraints
- Update STATE.md when making decisions
- Stop and checkpoint for architectural changes

### Red Flags (Auto-Pause)

- Agent proposes work outside their specialty
- Output contradicts HUB.md constraints
- No progress after 3 turns
- Memory/context growing past 50%

---

## Memory Configuration

### Namespace Strategy

| Namespace | Content | Retention |
|-----------|---------|-----------|
| `swarm:session` | Current task context | Session only |
| `swarm:decisions` | Key decisions made | 7 days |
| `swarm:outputs` | Generated content | 30 days |
| `creator:hub` | HUB.md content | Permanent |
| `creator:voice` | VOICE.md patterns | Permanent |

### Memory Limits

- Per-agent context: 30% max
- Shared memory: 20% max
- Total session: 70% max (trigger fresh context at 70%)

---

## Swarm Commands

| Command | Description |
|---------|-------------|
| `/swarm start` | Initialize swarm for current task |
| `/swarm status` | Show active agents and progress |
| `/swarm checkpoint` | Force alignment verification |
| `/swarm pause` | Pause all agents for user input |
| `/swarm resume` | Continue from checkpoint |
| `/swarm fresh` | Start new context, preserve STATE.md |

---

## Performance Metrics

### Track Weekly

- Tasks completed via swarm: [N]
- Average agents per task: [N]
- Anti-drift interventions: [N]
- Context resets needed: [N]
- Cost by model tier: [breakdown]

### Optimization Triggers

If drift interventions > 3/week:
- Reduce maxAgents
- Increase checkpoint frequency
- Review agent scope definitions

If costs too high:
- Shift more tasks to Haiku
- Enable Agent Booster for transforms
- Batch similar tasks

---

*Last configured: [YYYY-MM-DD]*
*ACOS Version: 5.0*
```

---

## Purpose

SWARM.md captures your multi-agent orchestration preferences so Claude can:
- Auto-configure swarms for your task types
- Route to optimal models for cost/quality
- Prevent drift with your checkpoint rules
- Track performance for optimization

## When to Update

Update SWARM.md when:
- You discover better agent combinations
- Cost optimization is needed
- Drift patterns emerge
- New task types are added
- Model preferences change

## Relationship to Other Hub Files

| File | Role |
|------|------|
| HUB.md | WHO you are (identity) |
| STATE.md | WHERE you are (current position) |
| VOICE.md | HOW you sound (patterns) |
| SWARM.md | HOW you orchestrate (multi-agent) |

SWARM.md is the "operating manual" for your AI team.

---

*Creator Hub Generator v5 - Part of Agentic Creator OS*
