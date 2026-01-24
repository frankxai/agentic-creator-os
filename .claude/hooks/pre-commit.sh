#!/bin/bash
# Pre-commit hook for automated quality checks
# This runs automatically before commits

set -e

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    exit 0
fi

# Get the list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
    exit 0
fi

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

echo "✅ Pre-commit checks complete"
exit 0
