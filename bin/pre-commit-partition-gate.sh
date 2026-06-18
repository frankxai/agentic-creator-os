#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ACOS Context Partition Gate — Git Pre-commit Hook
# ═══════════════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
NC='\033[0m'

# Scan staged changes for forbidden terms
STAGED_FILES=$(git diff --cached --name-only)

for file in $STAGED_FILES; do
    # 1. Block any files in personal directory
    if [[ "$file" == .personal/* ]]; then
        echo -e "${RED}[Security Violation]${NC} Attempted to commit personal file: $file"
        exit 1
    fi
    
    # 2. Scan for tag 'personal-creative' or 'grok-personal' in source files
    if grep -qE "share:\s*\"?(personal-creative|grok-personal)\"?" "$file" 2>/dev/null; then
        echo -e "${RED}[Security Violation]${NC} Tagged personal content found in: $file"
        exit 1
    fi
    
    # 3. Prevent secret/key leakage
    if grep -qE "(XAI_API_KEY|ANTHROPIC_API_KEY|OPENAI_API_KEY|VERCEL_TOKEN|aws_secret)" "$file" 2>/dev/null; then
        echo -e "${RED}[Security Violation]${NC} API key or secret pattern detected in: $file"
        exit 1
    fi

    # 4. Scan markdown/TS/JS/TSX/JSX files for AI-slop vocabulary (delve, unleash, tapestry, etc.)
    if [[ "$file" =~ \.(md|ts|js|tsx|jsx)$ ]]; then
        if grep -qiE "(delve|unleash|tapestry|unlock the power of|it's worth noting|certainly|absolutely|revolutionary|game-changing)" "$file" 2>/dev/null; then
            echo -e "${RED}[Quality Violation]${NC} Banned AI-slop vocabulary detected in: $file"
            echo -e "Avoid: delve, unleash, tapestry, unlock the power of, it's worth noting, certainly, absolutely, revolutionary, game-changing."
            exit 1
        fi
    fi
done

exit 0
