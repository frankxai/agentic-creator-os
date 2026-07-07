#!/bin/bash
# pre-commit.sh
# Portable pre-commit hook for automated quality checks (agnostic to harness)
# Sources hook-env; works in claude/codex/gemini/agy/grok sessions.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/hook-env.sh" 2>/dev/null || true

set -e

log_hook_activation "pre-commit" "PreCommit" 2>/dev/null || true

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    exit 0
fi

# Get the list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|sh|md|json)$' || true)

if [ -z "$STAGED_FILES" ]; then
    exit 0
fi

echo "[pre-commit] harness=${HARNESS} project=${PROJECT_NAME}"

# Check for package.json to determine if we should run linters
if [ -f "package.json" ]; then
    # Run ESLint if available
    if command -v npx &> /dev/null && npm list eslint &> /dev/null; then
        echo "🔍 Running ESLint..."
        echo "$STAGED_FILES" | xargs npx eslint --fix --quiet || true
    fi

    # Run Prettier if available
    if command -v npx &> /dev/null && npm list prettier &> /dev/null; then
        echo "✨ Running Prettier..."
        echo "$STAGED_FILES" | xargs npx prettier --write --ignore-unknown || true
    fi

    # Re-stage fixed files
    echo "$STAGED_FILES" | xargs git add || true
fi

# Wire ACOS quality if present (portable path)
if [ -f "${SCRIPT_DIR}/quality-gate.sh" ]; then
  echo "🛡️ Running quality gate (ACOS port)..."
  # non blocking for pre-commit
  echo "$STAGED_FILES" | while read f; do
    [ -f "$f" ] && (echo '{"tool_input":{"file_path":"'"$f"'"}}' | "${SCRIPT_DIR}/quality-gate.sh" || true)
  done
fi

echo "✅ Pre-commit checks complete (harness=${HARNESS})"
exit 0
