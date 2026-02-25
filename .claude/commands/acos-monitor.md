# /acos-monitor - Real-Time ACOS Activity Dashboard

Monitor live ACOS activity: hook activations, trajectory learning, and audit events.

## Usage

```bash
# One-time snapshot
node scripts/acos-activity-monitor.mjs

# Watch mode (refreshes every 5 seconds)
node scripts/acos-activity-monitor.mjs --watch
```

## What It Shows

1. **Hook Activations** - Which hooks triggered in last 60 minutes
2. **Learning Trajectories** - Active learning sessions and success rates
3. **Audit Log** - IAM violations, config changes, gate decisions

## Data Sources

- Hook activity: `~/.claude/projects/-mnt-c-Users-Frank-FrankX/logs/hook-activity.jsonl`
- Trajectories: `.claude/trajectories/*.json`
- Audit log: `.claude-flow/audit.jsonl`

## Integration

To enable hook logging, existing hooks need to call the activation logger:

```bash
# Add to any hook script
bash .claude/hooks/activation-logger.sh "hook-name" "event-type"
```

## npm Script

Add to package.json:

```json
{
  "scripts": {
    "acos:monitor": "node scripts/acos-activity-monitor.mjs --watch"
  }
}
```

Then run with: `npm run acos:monitor`
