#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# AGENTIC CREATOR OS - Installation Script
# Build Your Own Jarvis | github.com/frankxai/agentic-creator-os
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
VERSION="1.0.0"
GITHUB_REPO="frankxai/agentic-creator-os"
GITHUB_RAW="https://raw.githubusercontent.com/$GITHUB_REPO/main"

# Detect installation paths
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_HOME="${CLAUDE_HOME:-$HOME/.claude}"
ACOS_HOME="${ACOS_HOME:-$CLAUDE_HOME/acos}"
SKILLS_DIR="$ACOS_HOME/skills"
COMMANDS_DIR="$CLAUDE_HOME/commands"
AGENTS_DIR="$CLAUDE_HOME/agents"

# Logging functions
log() { echo -e "${CYAN}[ACOS]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
step() { echo -e "${MAGENTA}[→]${NC} $1"; }

# Banner
show_banner() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                                   ║${NC}"
    echo -e "${CYAN}║     █████╗  ██████╗ ██████╗ ███████╗                              ║${NC}"
    echo -e "${CYAN}║    ██╔══██╗██╔════╝██╔═══██╗██╔════╝                              ║${NC}"
    echo -e "${CYAN}║    ███████║██║     ██║   ██║███████╗                              ║${NC}"
    echo -e "${CYAN}║    ██╔══██║██║     ██║   ██║╚════██║                              ║${NC}"
    echo -e "${CYAN}║    ██║  ██║╚██████╗╚██████╔╝███████║                              ║${NC}"
    echo -e "${CYAN}║    ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝                              ║${NC}"
    echo -e "${CYAN}║                                                                   ║${NC}"
    echo -e "${CYAN}║    AGENTIC CREATOR OS v${VERSION}                                       ║${NC}"
    echo -e "${CYAN}║    Build Your Own Jarvis                                          ║${NC}"
    echo -e "${CYAN}║    github.com/frankxai/agentic-creator-os                         ║${NC}"
    echo -e "${CYAN}║                                                                   ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Usage help
show_help() {
    echo "Usage: ./install.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --full          Full installation with all skills and MCP servers"
    echo "  --minimal       Minimal installation (core skills only)"
    echo "  --skills-only   Install skills without MCP servers"
    echo "  --mcp-only      Install MCP servers only"
    echo "  --sync          Sync with latest GitHub version"
    echo "  --category=CAT  Install specific category (technical, creative, business, soulbook)"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./install.sh                    # Standard installation"
    echo "  ./install.sh --full             # Full installation with MCP"
    echo "  ./install.sh --category=creative # Install creative skills only"
    echo "  ./install.sh --sync             # Sync from GitHub"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    local missing=""

    # Check for Node.js
    if ! command -v node &> /dev/null; then
        missing="$missing node"
    fi

    # Check for npm
    if ! command -v npm &> /dev/null; then
        missing="$missing npm"
    fi

    # Check for curl (optional, for sync)
    if ! command -v curl &> /dev/null; then
        warn "curl not found - GitHub sync will be limited"
    fi

    # Check for jq (optional, for JSON processing)
    if ! command -v jq &> /dev/null; then
        warn "jq not found - some features will be limited"
    fi

    if [ -n "$missing" ]; then
        error "Missing required tools:$missing. Please install them first."
    fi

    success "Prerequisites check passed"
}

# Create directory structure
create_directories() {
    log "Creating directory structure..."

    mkdir -p "$ACOS_HOME"
    mkdir -p "$SKILLS_DIR/technical"
    mkdir -p "$SKILLS_DIR/creative"
    mkdir -p "$SKILLS_DIR/business"
    mkdir -p "$SKILLS_DIR/soulbook"
    mkdir -p "$COMMANDS_DIR"
    mkdir -p "$AGENTS_DIR"

    success "Directories created"
}

# Install skills from local project
install_skills() {
    local category="${1:-all}"

    log "Installing skills..."

    cd "$PROJECT_DIR"

    # Install skill YAML files
    for skill in skills/*.yaml; do
        if [ -f "$skill" ]; then
            skill_name=$(basename "$skill" .yaml)
            cp "$skill" "$SKILLS_DIR/${skill_name}.yaml"
            success "Installed skill: $skill_name"
        fi
    done

    # Install skill rules
    if [ -f "skills/skill-rules.json" ]; then
        cp "skills/skill-rules.json" "$SKILLS_DIR/skill-rules.json"
        success "Installed skill rules"
    fi

    # Install registry
    if [ -f "skills/registry.json" ]; then
        cp "skills/registry.json" "$ACOS_HOME/registry.json"
        success "Installed skill registry"
    fi

    # Install categorized skills (from nested directories if they exist)
    for cat_dir in skills/*/; do
        if [ -d "$cat_dir" ]; then
            cat_name=$(basename "$cat_dir")
            if [[ "$category" == "all" ]] || [[ "$category" == "$cat_name" ]]; then
                for skill_dir in "$cat_dir"*/; do
                    if [ -d "$skill_dir" ] && [ -f "$skill_dir/CLAUDE.md" ]; then
                        skill_name=$(basename "$skill_dir")
                        mkdir -p "$SKILLS_DIR/$cat_name/$skill_name"
                        cp -r "$skill_dir"* "$SKILLS_DIR/$cat_name/$skill_name/" 2>/dev/null || true
                        success "Installed: $cat_name/$skill_name"
                    fi
                done
            fi
        fi
    done
}

# Install commands (slash commands)
install_commands() {
    log "Installing commands..."

    cd "$PROJECT_DIR"

    # Check for commands directory
    if [ -d "commands" ]; then
        for cmd in commands/*.md; do
            if [ -f "$cmd" ]; then
                cmd_name=$(basename "$cmd" .md)
                cp "$cmd" "$COMMANDS_DIR/${cmd_name}.md"
                success "Installed command: /$cmd_name"
            fi
        done
    fi

    # Also check for workflow commands
    if [ -d "workflows" ]; then
        for workflow in workflows/*.yaml workflows/*.md; do
            if [ -f "$workflow" ]; then
                workflow_name=$(basename "$workflow")
                cp "$workflow" "$COMMANDS_DIR/${workflow_name}"
                success "Installed workflow: $workflow_name"
            fi
        done
    fi
}

# Install department agents
install_agents() {
    log "Installing department agents..."

    cd "$PROJECT_DIR"

    for dept in departments/*/; do
        if [ -d "$dept" ]; then
            dept_name=$(basename "$dept")

            # Copy agent markdown
            if [ -f "${dept}agent.md" ]; then
                cp "${dept}agent.md" "$AGENTS_DIR/${dept_name}-department.md"
                success "Installed agent: $dept_name"
            fi

            # Copy department config
            if [ -f "${dept}config.yaml" ]; then
                cp "${dept}config.yaml" "$AGENTS_DIR/${dept_name}-config.yaml"
            fi
        fi
    done
}

# Build MCP servers
build_mcp_servers() {
    log "Building MCP servers..."

    cd "$PROJECT_DIR"

    if [ -d "mcp-servers" ]; then
        for server_dir in mcp-servers/*/; do
            if [ -d "$server_dir" ] && [ -f "$server_dir/package.json" ]; then
                server_name=$(basename "$server_dir")
                step "Building $server_name..."

                cd "$server_dir"

                # Install dependencies
                npm install --quiet 2>/dev/null || warn "npm install failed for $server_name"

                # Build if build script exists
                if grep -q '"build"' package.json 2>/dev/null; then
                    npm run build --quiet 2>/dev/null || warn "Build failed for $server_name"
                fi

                cd "$PROJECT_DIR"
                success "Built: $server_name"
            fi
        done
    else
        warn "No mcp-servers directory found"
    fi
}

# Generate MCP configuration
generate_mcp_config() {
    log "Generating MCP configuration..."

    local config_file="$ACOS_HOME/mcp-config.json"

    cat > "$config_file" << EOF
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": ["$PROJECT_DIR/mcp-servers/filesystem/build/index.js"],
      "env": {
        "FILESYSTEM_ALLOWED_DIRS": "$HOME"
      }
    },
    "database": {
      "command": "node",
      "args": ["$PROJECT_DIR/mcp-servers/database/build/index.js"],
      "env": {
        "DB_PATH": "$ACOS_HOME/acos.db"
      }
    },
    "browser": {
      "command": "node",
      "args": ["$PROJECT_DIR/mcp-servers/browser/build/index.js"]
    }
  }
}
EOF

    success "MCP configuration generated: $config_file"
}

# Create state file
create_state() {
    log "Creating state file..."

    local state_file="$ACOS_HOME/state.json"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    cat > "$state_file" << EOF
{
  "version": "$VERSION",
  "installedAt": "$timestamp",
  "lastSync": null,
  "skills": {},
  "config": {
    "autoUpdate": false,
    "channel": "stable"
  }
}
EOF

    success "State file created"
}

# Install CLI tools
install_cli() {
    log "Installing CLI tools..."

    cd "$PROJECT_DIR"

    # Make bin scripts executable
    if [ -d "bin" ]; then
        chmod +x bin/* 2>/dev/null || true

        # Create symlinks in ACOS_HOME
        for script in bin/*; do
            if [ -f "$script" ]; then
                script_name=$(basename "$script")
                ln -sf "$PROJECT_DIR/$script" "$ACOS_HOME/$script_name" 2>/dev/null || true
            fi
        done

        success "CLI tools installed"

        echo ""
        log "To use ACOS CLI globally, add to your shell profile:"
        echo -e "  ${YELLOW}export PATH=\"\$PATH:$ACOS_HOME\"${NC}"
    fi
}

# Sync from GitHub
sync_from_github() {
    log "Syncing from GitHub..."

    if ! command -v curl &> /dev/null; then
        error "curl is required for GitHub sync"
    fi

    # Fetch latest registry
    curl -fsSL "$GITHUB_RAW/skills/registry.json" -o "$ACOS_HOME/registry.json.tmp" 2>/dev/null || {
        error "Could not fetch registry from GitHub"
    }

    mv "$ACOS_HOME/registry.json.tmp" "$ACOS_HOME/registry.json"
    success "Registry synced from GitHub"

    # Update state
    if command -v jq &> /dev/null; then
        local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        jq ".lastSync = \"$timestamp\"" "$ACOS_HOME/state.json" > "$ACOS_HOME/state.json.tmp"
        mv "$ACOS_HOME/state.json.tmp" "$ACOS_HOME/state.json"
    fi
}

# Show installation summary
show_summary() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}                    Installation Complete!                          ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Installation Directory:${NC} $ACOS_HOME"
    echo -e "  ${CYAN}Skills Directory:${NC}       $SKILLS_DIR"
    echo -e "  ${CYAN}Commands Directory:${NC}     $COMMANDS_DIR"
    echo -e "  ${CYAN}Agents Directory:${NC}       $AGENTS_DIR"
    echo ""
    echo -e "  ${YELLOW}Next Steps:${NC}"
    echo "  1. Add ACOS to your PATH (see above)"
    echo "  2. Configure MCP servers in Claude Code settings"
    echo "  3. Restart Claude Code to load skills"
    echo ""
    echo -e "  ${YELLOW}Quick Commands:${NC}"
    echo "  acos-sync list          # List available skills"
    echo "  acos-sync install <skill>   # Install a skill"
    echo "  acos-sync sync          # Sync from GitHub"
    echo ""
    echo -e "  ${CYAN}Documentation:${NC} https://github.com/$GITHUB_REPO"
    echo ""
}

# Main installation
main() {
    local mode="standard"
    local category="all"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --full)
                mode="full"
                shift
                ;;
            --minimal)
                mode="minimal"
                shift
                ;;
            --skills-only)
                mode="skills"
                shift
                ;;
            --mcp-only)
                mode="mcp"
                shift
                ;;
            --sync)
                mode="sync"
                shift
                ;;
            --category=*)
                category="${1#*=}"
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                warn "Unknown option: $1"
                shift
                ;;
        esac
    done

    show_banner
    check_prerequisites
    create_directories

    case $mode in
        "full")
            install_skills "$category"
            install_commands
            install_agents
            build_mcp_servers
            generate_mcp_config
            install_cli
            create_state
            ;;
        "minimal")
            install_skills "technical"
            install_commands
            create_state
            ;;
        "skills")
            install_skills "$category"
            install_commands
            create_state
            ;;
        "mcp")
            build_mcp_servers
            generate_mcp_config
            ;;
        "sync")
            sync_from_github
            ;;
        *)
            install_skills "$category"
            install_commands
            install_agents
            install_cli
            create_state
            ;;
    esac

    show_summary
}

# Run
main "$@"
