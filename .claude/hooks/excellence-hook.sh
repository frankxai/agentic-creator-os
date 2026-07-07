#!/bin/bash
# excellence-hook.sh
# Minimal excellence wiring (god 99). Sources hook-env.
# For any hook activation, remind/apply Frank DNA + gates.
# Use gstack for UI QA if relevant (delegates to skill).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/hook-env.sh" 2>/dev/null || true

HOOK_NAME="${1:-hook}"
EVENT="${2:-event}"

echo "[excellence] ${HOOK_NAME}@${EVENT} harness=${HARNESS} project=${PROJECT_NAME} | Embody Frank DNA. Read CLAUDE.md/AGENTS.md. Gate via verification/santa/qa/cso. gstack for UI."

# Non-blocking: if gstack skill available in context, it can be suggested by excellence-review
# Actual UI verification would invoke via subagent or terminal: gstack ...

exit 0
