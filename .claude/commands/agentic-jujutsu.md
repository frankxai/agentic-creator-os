# Agentic Jujutsu - ACOS Self-Learning Engine

The learning backbone of ACOS. Based on ruvnet's agentic-jujutsu (v2.3.6, MIT), customized for ACOS.

## What It Does

Agentic Jujutsu is the self-learning layer that makes ACOS smarter over time:

1. **Trajectory Tracking**: Every session records what operations happened, in what order, and whether they succeeded
2. **Pattern Discovery**: After 3-5 sessions, patterns emerge (e.g., "deployment always follows these 7 steps")
3. **AI Suggestions**: Before starting a task, get recommendations based on past successful workflows
4. **Multi-Agent Memory**: When swarm agents work in parallel, they share patterns without conflicts

## How It's Integrated Into ACOS

You don't need to run anything manually. It's embedded in the hook pipeline:

| Hook                   | What Jujutsu Does                                                   |
| ---------------------- | ------------------------------------------------------------------- |
| **SessionStart**       | Creates trajectory, loads learned patterns, restores learning state |
| **PostToolUse**        | Records each operation to the active trajectory                     |
| **PostToolUseFailure** | Records failures (low-quality patterns) for future avoidance        |
| **Stop**               | Finalizes trajectory, auto-scores success, extracts new patterns    |

## Status Check

```bash
# View trajectory stats (how many sessions learned from)
bash .claude-flow/hooks/learning-hooks.sh stats

# View discovered patterns
cat .claude/trajectories/patterns.json | python3 -m json.tool

# View learning metrics
cat .claude-flow/metrics/learning-status.json | python3 -m json.tool
```

## Current Learning State

When invoked, read and display:

- `.claude/trajectories/` - count completed trajectories
- `.claude/trajectories/patterns.json` - show discovered patterns
- `.claude-flow/metrics/learning-status.json` - show learning metrics

## Manual Operations (Advanced)

Most users never need these. The hooks handle everything automatically.

```bash
# Store a pattern manually
bash .claude-flow/hooks/learning-hooks.sh store "strategy" "domain" "quality_score"

# Search learned patterns
bash .claude-flow/hooks/learning-hooks.sh search "keyword"

# Broadcast a pattern to swarm agents
bash .claude-flow/hooks/swarm-hooks.sh broadcast-pattern "strategy" "domain" "quality"
```

## Origin

Created by **Reuven Cohen (ruvnet)** as part of the agentic-flow ecosystem.

- NPM: `agentic-jujutsu` v2.3.6
- GitHub: `ruvnet/agentic-flow/packages/agentic-jujutsu`
- License: MIT
- Also available as Rust crate on crates.io

Customized and integrated into ACOS by FrankX as the learning backbone for trajectory-based workflow optimization across all sessions.

## Architecture

```
Session 1: Build blog post
  -> Trajectory recorded: [Read, Edit, Write, Bash, Task] -> Success: 0.85
  -> Pattern extracted: "content-creation sequence"

Session 2: Build another blog post
  -> Trajectory hints loaded from Session 1
  -> System suggests optimal operation order
  -> Success: 0.92 (improved!)

Session N: System knows your workflows
  -> High-confidence suggestions
  -> Auto-routes to best agent for each step
  -> Failure patterns avoided automatically
```

The system gets smarter with every session. No configuration needed.
