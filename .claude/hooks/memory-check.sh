#!/bin/bash
# ACOS Memory Guardian — SessionStart hook
# Reports WSL memory status, warns if pressure is high

MEM_TOTAL=$(free -m | awk '/^Mem:/{print $2}')
MEM_USED=$(free -m | awk '/^Mem:/{print $3}')
MEM_AVAIL=$(free -m | awk '/^Mem:/{print $7}')
SWAP_TOTAL=$(free -m | awk '/^Swap:/{print $2}')
SWAP_USED=$(free -m | awk '/^Swap:/{print $3}')

# Calculate usage percentage
MEM_PCT=$((MEM_USED * 100 / MEM_TOTAL))

# Count running claude processes (approximate CC instances)
CC_COUNT=$(pgrep -f "claude" 2>/dev/null | wc -l)

# Build status line
STATUS="WSL Memory: ${MEM_USED}MB/${MEM_TOTAL}MB (${MEM_PCT}%)"

if [ "$SWAP_USED" -gt 0 ]; then
  STATUS="$STATUS | Swap: ${SWAP_USED}MB/${SWAP_TOTAL}MB"
fi

if [ "$CC_COUNT" -gt 2 ]; then
  STATUS="$STATUS | ~${CC_COUNT} claude processes detected"
fi

# Warn thresholds
if [ "$MEM_PCT" -ge 90 ]; then
  echo "CRITICAL: $STATUS — Memory critically low. Do NOT spawn additional agents or Task subprocesses. Close unused instances first."
elif [ "$MEM_PCT" -ge 75 ]; then
  echo "WARNING: $STATUS — Memory pressure high. Limit parallel Task agents to 2 max. Avoid heavy builds."
else
  echo "$STATUS — Healthy. Safe to use parallel agents."
fi
