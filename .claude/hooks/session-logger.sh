#!/bin/bash
# Claude Code Session Logger
# Auto-captures session context to global AI sessions log
# Works for Claude Code - can be adapted for other agents

GLOBAL_LOG="/mnt/c/Users/Frank/docs/AI_GLOBAL_SESSIONS.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

# Detect which project based on current directory
CWD=$(pwd)
if [[ "$CWD" == *"FrankX"* ]]; then
    PROJECT="FrankX"
elif [[ "$CWD" == *"Arcanea"* ]]; then
    PROJECT="Arcanea"
else
    PROJECT=$(basename "$CWD")
fi

# Get session context from environment
SESSION_HOOK_TYPE="${CLAUDE_HOOK_TYPE:-manual}"
SESSION_INPUT="${CLAUDE_PROMPT:-No prompt captured}"

# Create session entry
cat >> "$GLOBAL_LOG" << EOF

---

## SESSION: ${PROJECT} - ${SESSION_HOOK_TYPE}
**Project**: ${PROJECT}
**Date**: ${TIMESTAMP}
**Agent**: Claude Code
**Hook**: ${SESSION_HOOK_TYPE}

### User Prompt
${SESSION_INPUT}

### Auto-logged
This entry was automatically captured by the session-logger hook.

EOF

# Return success message for Claude Code
echo "Session captured to global log"
