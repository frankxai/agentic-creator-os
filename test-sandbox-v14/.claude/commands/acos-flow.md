# ACOS Flow - System Status & Learning Dashboard

Show the full ACOS + Claude Flow system status, learning metrics, and active infrastructure.

## Dashboard

Run these checks and display results:

### 1. Trajectory Learning

Read `.claude/trajectories/` directory:

- Count completed trajectory files (exclude \_active.json, \_operations.jsonl, patterns.json)
- Read patterns.json for discovered patterns
- Calculate average success score across all trajectories
- Show most recent trajectory type and score

### 2. Learning Status

Read `.claude-flow/metrics/learning-status.json` if it exists.

### 3. Hook Pipeline Status

Read `.claude/settings.json` and count:

- Total hook events configured
- Total individual hooks
- Which events have matchers vs global hooks

### 4. Swarm Status

Read `.claude-flow/swarm/agents.json` for registered agents.
Check `.claude-flow/swarm/messages/` for pending messages.
Check `.claude-flow/swarm/handoffs/` for pending handoffs.

### 5. Skills & Commands

- Count global skills at `~/.agents/skills/` or `/mnt/c/Users/Frank/.agents/skills/`
- Count skill profiles at `.claude/skills/profiles/`
- Count claude-flow commands at `.claude/commands/claude-flow-*/`
- Count FrankX commands at `.claude/commands/frankx-ai-*`

### 6. Checkpoint Status

List recent checkpoints from `.claude/checkpoints/`

Display as a comprehensive dashboard:

```
══════════════════════════════════════════════════════
  ACOS FLOW DASHBOARD
══════════════════════════════════════════════════════

LEARNING
  Trajectories: [N] completed
  Avg Success:  [N%]
  Patterns:     [N] discovered
  Last Session: [type] at [score]%

HOOKS (7 events, [N] hooks)
  SessionStart:        [N] hooks
  UserPromptSubmit:    [N] hooks
  PreToolUse:          [N] matchers
  PostToolUse:         [N] matchers
  PostToolUseFailure:  [N] matchers
  Stop:                [N] hooks
  PreCompact:          [N] matchers

SKILLS & COMMANDS
  Global Skills:     [N]
  Skill Profiles:    [N]
  Flow Commands:     [N]
  FrankX Commands:   [N]

SWARM
  Registered Agents: [N]
  Pending Messages:  [N]
  Pending Handoffs:  [N]

CHECKPOINTS
  Recent: [list last 3]
══════════════════════════════════════════════════════
```
