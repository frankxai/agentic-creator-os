#!/bin/bash
# ACOS Checkpoint Manager - Adapted from Claude Flow V3
# Git checkpoint creation and rollback

set -e

PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
CHECKPOINT_DIR="$PROJECT_ROOT/.claude/checkpoints"
LOGS_DIR="$PROJECT_ROOT/.claude-flow/logs"

mkdir -p "$CHECKPOINT_DIR" "$LOGS_DIR"

list_checkpoints() {
  echo "Available Checkpoints:"
  local tags=$(cd "$PROJECT_ROOT" && git tag -l 'checkpoint-*' -l 'session-end-*' --sort=-creatordate 2>/dev/null | head -20)
  if [ -n "$tags" ]; then
    echo "$tags"
  else
    echo "No checkpoint tags found"
  fi

  echo ""
  echo "Local checkpoints:"
  ls -lt "$CHECKPOINT_DIR"/*.json 2>/dev/null | head -10 || echo "None"
}

create_checkpoint() {
  local message="${1:-Checkpoint}"
  local checkpoint_id="checkpoint-$(date +%Y%m%d-%H%M%S)"

  # Save checkpoint metadata
  cat > "$CHECKPOINT_DIR/$checkpoint_id.json" << EOF
{
  "id": "$checkpoint_id",
  "message": "$(echo "$message" | head -c 200)",
  "commit": "$(cd "$PROJECT_ROOT" && git rev-parse HEAD 2>/dev/null || echo "none")",
  "branch": "$(cd "$PROJECT_ROOT" && git branch --show-current 2>/dev/null || echo "unknown")",
  "timestamp": "$(date -Iseconds)",
  "filesChanged": $(cd "$PROJECT_ROOT" && git diff --name-only 2>/dev/null | wc -l)
}
EOF

  echo "Checkpoint created: $checkpoint_id"
  echo "$checkpoint_id"
}

agent_checkpoint() {
  local message="${1:-Agent checkpoint}"
  create_checkpoint "$message"
  echo "$(date -Iseconds) checkpoint: $message" >> "$LOGS_DIR/checkpoints.log" 2>/dev/null || true
}

session_end_checkpoint() {
  local message="${1:-Session end}"
  local checkpoint_id=$(create_checkpoint "$message")

  # Log session summary
  cat >> "$LOGS_DIR/sessions.log" << EOF
$(date -Iseconds) | session-end | $checkpoint_id | $message
EOF
}

show_checkpoint() {
  local id="$1"
  local file="$CHECKPOINT_DIR/$id.json"
  if [ -f "$file" ]; then
    cat "$file"
  else
    echo "Checkpoint not found: $id"
    exit 1
  fi
}

case "${1:-help}" in
  "list") list_checkpoints ;;
  "create") create_checkpoint "${2:-Manual checkpoint}" ;;
  "agent-checkpoint") agent_checkpoint "${2:-Agent checkpoint}" ;;
  "session-end") session_end_checkpoint "${2:-Session end}" ;;
  "show") show_checkpoint "${2:-}" ;;
  "help"|"-h"|"--help")
    echo "ACOS Checkpoint Manager"
    echo "Commands: list, create [msg], agent-checkpoint [msg], session-end [msg], show <id>"
    ;;
  *) echo "Unknown: $1" >&2; exit 1 ;;
esac
