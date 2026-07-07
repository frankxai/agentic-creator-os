#!/bin/bash
# mcp-health-check.sh
# Shim for ACOS mcp-health-check.js (ported)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/hook-env.sh" 2>/dev/null || true
log_hook_activation "mcp-health-check" "${HARNESS}" 2>/dev/null || true
if [ -f "$SCRIPT_DIR/mcp-health-check.js" ]; then cat | node "$SCRIPT_DIR/mcp-health-check.js"; else cat; fi
