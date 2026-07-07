#!/bin/bash
# quality-gate.sh
# Shim for ACOS quality-gate.js (ported for portability)
# Sources hook-env; passes stdin json through to node impl.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/hook-env.sh" 2>/dev/null || true

log_hook_activation "quality-gate" "${HARNESS}" 2>/dev/null || true

if [ -f "$SCRIPT_DIR/quality-gate.js" ]; then
  cat | node "$SCRIPT_DIR/quality-gate.js"
else
  cat  # pass-through if no impl
fi
