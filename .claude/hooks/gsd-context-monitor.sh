#!/bin/bash
# gsd-context-monitor.sh
# Shim for ACOS gsd-context-monitor.js (ported)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/hook-env.sh" 2>/dev/null || true
log_hook_activation "gsd-context-monitor" "PostToolUse" 2>/dev/null || true
if [ -f "$SCRIPT_DIR/gsd-context-monitor.js" ]; then cat | node "$SCRIPT_DIR/gsd-context-monitor.js"; else cat; fi
