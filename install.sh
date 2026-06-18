#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ACOS Bootstrap Installer (First-Principles Edition) — v13.0.0
# ═══════════════════════════════════════════════════════════════════════════════
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting Agentic Creator OS Bootstrap..."

if ! command -v node &>/dev/null; then
    echo "Error: Node.js is required for installation."
    exit 1
fi

# Run the JS setup engine
node "$PROJECT_DIR/scripts/setup.mjs" "$@"

echo "Installation complete."
