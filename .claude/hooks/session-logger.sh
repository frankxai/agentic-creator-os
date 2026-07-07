#!/bin/bash
# session-logger.sh
# Portable/multi-harness session logger (claude/codex/gemini/agy/grok)
# Sources hook-env for portable paths + harness detect. Agnostic.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/hook-env.sh" 2>/dev/null || true

TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

# Use portable from env (or fallback)
GLOBAL_LOG="${AI_SESSIONS_LOG:-$HOME/docs/AI_GLOBAL_SESSIONS.md}"
PROJECT="${PROJECT_NAME:-$(basename "$(pwd)")}"

# Get session context - agnostic to harness envs
SESSION_HOOK_TYPE="${CLAUDE_HOOK_TYPE:-${CODEX_HOOK_TYPE:-${GROK_HOOK_TYPE:-manual}}}"
SESSION_INPUT="${CLAUDE_PROMPT:-${CODEX_PROMPT:-${GROK_PROMPT:-No prompt captured}}}"

# Harness label for log
AGENT_LABEL="${HARNESS:-unknown}"
case "$HARNESS" in
  claude) AGENT_LABEL="Claude Code" ;;
  codex) AGENT_LABEL="Codex CLI" ;;
  gemini) AGENT_LABEL="Gemini CLI" ;;
  agy) AGENT_LABEL="Antigravity/AGY" ;;
  grok) AGENT_LABEL="Grok CLI" ;;
esac

# Create session entry (portable)
cat >> "$GLOBAL_LOG" << EOF

---

## SESSION: ${PROJECT} - ${SESSION_HOOK_TYPE}
**Project**: ${PROJECT}
**Date**: ${TIMESTAMP}
**Agent**: ${AGENT_LABEL} (harness: ${HARNESS})
**Hook**: ${SESSION_HOOK_TYPE}

### User Prompt
${SESSION_INPUT}

### Auto-logged
This entry was automatically captured by the session-logger hook (via hook-env.sh for portability).

EOF

log_hook_activation "session-logger" "${SESSION_HOOK_TYPE}" 2>/dev/null || true

# Return success message
echo "Session captured to global log (harness=${HARNESS})"
