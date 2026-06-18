---
name: memory-guardian
description: WSL2 memory safety and scaling guardrails for Claude Code sessions and parallel agents.
---

# Memory Guardian Skill

## Purpose
Monitors WSL2 memory usage and enforces safe scaling limits for Claude Code instances and parallel agents.

## When This Skill Activates
- Before spawning 3+ parallel Task agents
- Before running `npm run build` or other memory-heavy operations
- When SessionStart hook reports WARNING or CRITICAL memory status
- When user mentions running multiple CC instances

## Memory Check Command
```bash
free -m | awk '/^Mem:/{printf "RAM: %dMB/%dMB (%d%%)\n", $3, $2, $3*100/$2} /^Swap:/{if($3>0) printf "Swap: %dMB/%dMB\n", $3, $2}'
```

## Scaling Rules

### Green Zone (< 75% RAM usage)
- Parallel Task agents: up to 4
- Background builds: safe
- No restrictions

### Yellow Zone (75-89% RAM usage)
- Parallel Task agents: max 2
- Prefer sequential over parallel work
- Avoid `npm run build` alongside agents
- Warn user: "Memory pressure is high. Limiting parallel agents to 2."

### Red Zone (>= 90% RAM usage)
- Parallel Task agents: max 1 (or 0 — work sequentially)
- NO background builds
- Suggest user close other CC instances
- Warn user: "Memory critically low. Working sequentially to prevent WSL crash."

## Before Heavy Operations
Always run the memory check before:
1. Spawning 3+ parallel Task subagents
2. Running production builds (`npm run build`)
3. Starting dev server + agents simultaneously

## WSL Configuration Reference
- Host: 16GB RAM
- WSL limit: 12GB (`C:\Users\Frank\.wslconfig`)
- Swap: 12GB
- Per CC instance: ~500MB + ~100-150MB per MCP server
- Safe concurrent CC instances: 4-5
- autoMemoryReclaim: dropcache (aggressive)

## Recovery If Memory Is Critical
```bash
# Check what's using memory
ps aux --sort=-%mem | head -20

# Kill any orphaned node processes from old CC sessions
pkill -f "node.*claude" 2>/dev/null

# Force kernel to drop caches (non-destructive)
echo 1 | sudo tee /proc/sys/vm/drop_caches 2>/dev/null
```

## Integration
- **Hook**: `.claude/hooks/memory-check.sh` runs on SessionStart
- **Statusline**: Memory percentage visible if hook fires warning
- **Self-enforcing**: CC reads this skill and self-limits before scaling
