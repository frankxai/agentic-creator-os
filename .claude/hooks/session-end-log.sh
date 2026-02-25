#!/bin/bash
# Auto-log session to global AI sessions file
# Triggered at end of significant Claude Code sessions

GLOBAL_LOG="/mnt/c/Users/Frank/docs/AI_GLOBAL_SESSIONS.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
PROJECT="FrankX"

# Get the session summary from environment or stdin
SESSION_SUMMARY="${1:-Unspecified session work}"

# Append to global log
cat >> "$GLOBAL_LOG" << EOF

---

## SESSION: ${PROJECT} - Auto-logged Session
**Project**: ${PROJECT}
**Date**: ${TIMESTAMP}
**Agent**: Claude Code (Hook)

### Summary
${SESSION_SUMMARY}

### Auto-logged by
Session end hook at ${TIMESTAMP}

EOF

echo "Session logged to ${GLOBAL_LOG}"
