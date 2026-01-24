#!/bin/bash
set -e

# Use global hooks directory
cd "$HOME/.claude/hooks"
cat | npx tsx skill-activation-prompt.ts
