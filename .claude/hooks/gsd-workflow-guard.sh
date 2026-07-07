#!/bin/bash
# gsd-workflow-guard.sh
# Shim for ACOS gsd-workflow-guard.js (ported)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/hook-env.sh" 2>/dev/null || true
log_hook_activation "gsd-workflow-guard" "${HARNESS}" 2>/dev/null || true
if [ -f "$SCRIPT_DIR/gsd-workflow-guard.js" ]; then cat | node "$SCRIPT_DIR/gsd-workflow-guard.js"; else cat; fi
