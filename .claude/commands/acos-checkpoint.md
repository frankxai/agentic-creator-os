# ACOS Checkpoint - Save & Restore Points

Create checkpoints before risky operations. Rollback if things go wrong.

## Automatic Checkpoints

These happen WITHOUT any user action:

- **PostToolUse (Task):** After every multi-agent task completes
- **Stop:** Session-end checkpoint with full state

## Manual Commands

### Create Checkpoint

```bash
bash .claude-flow/hooks/checkpoint-manager.sh create "description"
```

### List Checkpoints

```bash
bash .claude-flow/hooks/checkpoint-manager.sh list
```

### Rollback to Checkpoint

```bash
bash .claude-flow/hooks/checkpoint-manager.sh rollback <checkpoint-id>
```

## When to Checkpoint

| Situation                      | Action                  |
| ------------------------------ | ----------------------- |
| Before deploying to production | `create "pre-deploy"`   |
| Before major refactoring       | `create "pre-refactor"` |
| Before deleting files          | `create "pre-cleanup"`  |
| After completing a feature     | Automatic (PostToolUse) |
| End of session                 | Automatic (Stop hook)   |

## Checkpoint Storage

Checkpoints are stored in two places:

- **`.claude/checkpoints/`** - JSON metadata (commit, branch, timestamp, files changed)
- **`.claude-flow/logs/checkpoints.log`** - Chronological log of all checkpoints

## Recovery

If something goes wrong:

1. Run `list` to see available checkpoints
2. Find the checkpoint before the issue
3. Run `rollback <id>` to restore

Rollback uses `git stash` + `git checkout` to safely restore state without losing uncommitted work.
