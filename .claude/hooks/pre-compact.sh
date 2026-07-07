#!/bin/bash
# pre-compact.sh
# Stub for PreCompact hook event (portable, multi-harness)
# Sources hook-env; extend with ACOS suggest-compact logic if desired.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/hook-env.sh" 2>/dev/null || true

INPUT=$(cat 2>/dev/null || true)

log_hook_activation "pre-compact" "PreCompact" 2>/dev/null || true

# Delegate to handler in env (or ACOS pre-compact.js if present)
if [ -f "$SCRIPT_DIR/pre-compact.js" ]; then
  # pass through for node impl (gsd etc)
  echo "$INPUT" | node "$SCRIPT_DIR/pre-compact.js" || echo "$INPUT"
else
  handle_precompact "$INPUT"
fi
