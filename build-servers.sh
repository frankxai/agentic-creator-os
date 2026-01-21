#!/bin/bash

# Build script for all MCP servers
# Agentic Creator OS

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "========================================"
echo "Building MCP Servers"
echo "========================================"
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Install workspace dependencies
echo "Installing MCP server dependencies..."
npm run install:all

# Build all servers
echo ""
echo "Building MCP servers..."
npm run build:all

echo ""
echo "========================================"
echo "Build Complete!"
echo "========================================"
echo ""
echo "Built servers:"
for server in mcp-servers/*/; do
    if [ -d "$server" ] && [ -f "${server}package.json" ]; then
        server_name=$(basename "$server")
        if [ -d "${server}build" ]; then
            echo "  ✓ $server_name"
        else
            echo "  ✗ $server_name (build failed)"
        fi
    fi
done
echo ""
echo "MCP servers ready in: mcp-servers/*/build/"
