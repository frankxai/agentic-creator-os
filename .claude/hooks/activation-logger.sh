#!/bin/bash
# ACOS Activation Logger - Real-time hook activity tracking
# Logs all hook activations to a rolling activity file

HOOK_NAME="$1"
EVENT_TYPE="${2:-unknown}"
LOG_DIR="$HOME/.claude/projects/-mnt-c-Users-Frank-FrankX/logs"
LOG_FILE="$LOG_DIR/hook-activity.jsonl"
MAX_LINES=10000  # Rolling log limit

mkdir -p "$LOG_DIR"

# Create activation record
cat <<EOF >> "$LOG_FILE"
{"timestamp":"$(date -u +%Y-%m-%dT%H:%M:%SZ)","hook":"$HOOK_NAME","event":"$EVENT_TYPE","pwd":"$PWD","session":"$$"}
EOF

# Roll log if too large
if [ -f "$LOG_FILE" ]; then
  LINE_COUNT=$(wc -l < "$LOG_FILE")
  if [ "$LINE_COUNT" -gt "$MAX_LINES" ]; then
    tail -n "$MAX_LINES" "$LOG_FILE" > "${LOG_FILE}.tmp"
    mv "${LOG_FILE}.tmp" "$LOG_FILE"
  fi
fi

# Echo visible confirmation (appears in Claude Code output)
echo "[ACOS] Hook activated: $HOOK_NAME ($EVENT_TYPE)" >&2
