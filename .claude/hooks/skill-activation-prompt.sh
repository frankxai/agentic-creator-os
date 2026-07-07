#!/bin/bash
# skill-activation-prompt.sh
# Portable launcher for skill-activation (sources hook-env for multi-harness paths)
# Updated for new env; delegates to .js (node) or .ts

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/hook-env.sh" 2>/dev/null || true

log_hook_activation "skill-activation" "UserPromptSubmit" 2>/dev/null || true

# Use global hooks directory (portable)
cd "${GLOBAL_HOOKS_DIR:-$HOME/.claude/hooks}"

# Use pre-compiled JS for speed (or tsx for dev)
if [ -f "skill-activation-prompt.js" ]; then
  cat | node skill-activation-prompt.js
else
  cat | npx tsx skill-activation-prompt.ts 2>/dev/null || cat | node skill-activation-prompt.js
fi
