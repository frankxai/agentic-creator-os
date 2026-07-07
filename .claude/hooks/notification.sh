#!/bin/bash
# notification.sh
# Stub for Notification hook event (portable, multi-harness)
# Sources hook-env. Implement per-harness notifications (e.g. desktop, slack via excellence).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/hook-env.sh" 2>/dev/null || true

INPUT=$(cat 2>/dev/null || true)

log_hook_activation "notification" "Notification" 2>/dev/null || true

handle_notification "$INPUT"
