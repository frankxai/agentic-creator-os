# ACOS Claude Flow Capabilities Reference

> FrankX Project - AI Architect & Creator Platform
> Generated: 2026-02-07

## Overview

ACOS integrates Claude Flow V3 orchestration into the FrankX creator platform:

- **Swarm Coordination** with hierarchical topology (anti-drift)
- **Self-Learning Hooks** with trajectory tracking and pattern discovery
- **Agent Messaging** for multi-agent coordination
- **Checkpoint Management** for safe rollbacks
- **Intelligent Routing** with complexity detection

### Configuration

| Setting        | Value                             |
| -------------- | --------------------------------- |
| Topology       | hierarchical                      |
| Max Agents     | 8                                 |
| Strategy       | specialized                       |
| Memory Backend | hybrid                            |
| Learning       | Enabled (trajectories + patterns) |

---

## Swarm Orchestration

### Anti-Drift Configuration (Default)

```bash
# Initialize swarm for complex tasks
npx claude-flow@v3alpha swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

### When to Auto-Invoke Swarm

- Multiple files (3+) affected
- New feature implementation
- Cross-module refactoring
- API changes with tests
- Performance optimization

### Skip Swarm For

- Single file edits
- Simple bug fixes
- Documentation updates
- Configuration changes

---

## Available Agents

### Core Development

`coder`, `reviewer`, `tester`, `planner`, `researcher`

### Specialized

`security-architect`, `memory-specialist`, `performance-engineer`

### FrankX-Specific

`frontend-designer`, `content-engine`, `seo-intelligence`, `music-producer`, `devops-engineer`

### Swarm Coordination

`hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`

### GitHub

`pr-manager`, `code-review-swarm`, `issue-tracker`

---

## Hook Pipeline

### Session Lifecycle

| Event              | Hooks                                                 | Purpose               |
| ------------------ | ----------------------------------------------------- | --------------------- |
| SessionStart       | trajectory init, learning restore, agent registration | Context setup         |
| UserPromptSubmit   | skill activation, routing, complexity detection       | Task classification   |
| PreToolUse         | pre-edit guidance, pre-command security, task routing | Safety + intelligence |
| PostToolUse        | operation tracking, pattern storage, auto-checkpoint  | Learning              |
| PostToolUseFailure | failure learning, retry analysis                      | Error recovery        |
| Stop               | trajectory finalization, pattern export, metrics      | Session close         |
| PreCompact         | pattern preservation, context guidance                | Context retention     |

### Helper Scripts

| Script                  | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `guidance-hooks.sh`     | Security-sensitive file detection, routing |
| `learning-hooks.sh`     | Pattern storage, search, consolidation     |
| `swarm-hooks.sh`        | Agent messaging, consensus, task handoffs  |
| `checkpoint-manager.sh` | Git checkpoint creation and rollback       |

---

## Commands

### Swarm

- `/claude-flow-swarm` - Initialize and manage swarms
- Spawn, monitor, status, strategies

### Memory

- `/claude-flow-memory` - Memory operations
- Store, search, persist, neural integration

### Agents

- Agent spawning, capabilities, coordination
- Type detection and routing

### Monitoring

- Agent metrics, real-time view, status

### Hooks

- Pre/post edit, pre/post task, session lifecycle

### Workflows

- Create, execute, export workflow templates

---

## Learning System

### Trajectory Tracking

- Auto-creates trajectory on session start
- Tracks all tool operations (async, non-blocking)
- Auto-scores on session end (heuristic-based)
- Extracts operation sequence patterns

### Pattern Discovery

- Sequences with >70% success rate stored
- Similar past work surfaced via trajectory hints
- Cross-session learning improves over time

### Metrics

```bash
# View dashboard
node .claude/dashboard/view-dashboard.js all

# Check learning stats
node .claude/dashboard/view-dashboard.js learning
```

---

## Integration Ecosystem

### ACOS Skills (630+)

Globally installed at `~/.agents/skills/`, activated via skill profiles.

### Arcanea Gates (10)

Progressive skill development mapped to gate progression.

### Agentic Jujutsu

Self-learning version control with ReasoningBank integration.

### MCP Servers

- `claude-flow` - Orchestration coordination
- `nanobanana` - Image generation
- `playwright` - Browser automation
- `memory` - Persistent knowledge graph
- `sequential-thinking` - Reasoning chains

---

_Excellence in execution. Let the work speak._
