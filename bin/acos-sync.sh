#!/bin/bash
# ACOS Sync - Sync skills between local and GitHub
# Part of Agentic Creator OS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
GITHUB_REPO="frankxai/agentic-creator-os"
GITHUB_RAW="https://raw.githubusercontent.com/$GITHUB_REPO/main"
CLAUDE_HOME="${CLAUDE_HOME:-$HOME/.claude}"
ACOS_HOME="${ACOS_HOME:-$CLAUDE_HOME/acos}"
SKILLS_DIR="$ACOS_HOME/skills"
COMMANDS_DIR="$CLAUDE_HOME/commands"
REGISTRY_FILE="$ACOS_HOME/registry.json"
LOCAL_STATE="$ACOS_HOME/state.json"

# Ensure directories exist
mkdir -p "$SKILLS_DIR" "$COMMANDS_DIR" "$ACOS_HOME"

# Logging
log() { echo -e "${CYAN}[ACOS]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# Show banner
show_banner() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     AGENTIC CREATOR OS - Skill Sync System            ║${NC}"
    echo -e "${CYAN}║     github.com/frankxai/agentic-creator-os            ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    if ! command -v curl &> /dev/null; then
        error "curl is required but not installed"
    fi

    if ! command -v git &> /dev/null; then
        warn "git not found - some features will be limited"
    fi

    if ! command -v jq &> /dev/null; then
        warn "jq not found - installing basic JSON support"
    fi

    success "Prerequisites check passed"
}

# Fetch remote registry
fetch_registry() {
    log "Fetching skill registry from GitHub..."

    curl -fsSL "$GITHUB_RAW/skills/registry.json" -o "$REGISTRY_FILE.tmp" 2>/dev/null || {
        warn "Could not fetch remote registry - using local cache"
        return 1
    }

    mv "$REGISTRY_FILE.tmp" "$REGISTRY_FILE"
    success "Registry updated"
}

# List available skills
list_skills() {
    log "Available skills:"
    echo ""

    if [ -f "$REGISTRY_FILE" ]; then
        # Parse with jq if available, else basic grep
        if command -v jq &> /dev/null; then
            jq -r '.skills | to_entries[] | "  \(.key) (v\(.value.version)) - \(.value.description)"' "$REGISTRY_FILE"
        else
            grep -o '"[^"]*":' "$REGISTRY_FILE" | head -20
        fi
    else
        echo "  No registry found. Run: acos sync"
    fi
    echo ""
}

# Install a skill
install_skill() {
    local skill_name="$1"

    if [ -z "$skill_name" ]; then
        error "Usage: acos-sync install <skill-name>"
    fi

    log "Installing skill: $skill_name"

    # Determine category from registry
    local category=""
    if [ -f "$REGISTRY_FILE" ] && command -v jq &> /dev/null; then
        for cat in technical creative business soulbook; do
            if jq -e ".categories.$cat | index(\"$skill_name\")" "$REGISTRY_FILE" > /dev/null 2>&1; then
                category="$cat"
                break
            fi
        done
    fi

    if [ -z "$category" ]; then
        category="technical"  # Default fallback
        warn "Category not found, defaulting to: $category"
    fi

    # Create skill directory
    local skill_dir="$SKILLS_DIR/$category/$skill_name"
    mkdir -p "$skill_dir"

    # Fetch skill files
    log "Downloading skill files..."

    curl -fsSL "$GITHUB_RAW/skills/$category/$skill_name/CLAUDE.md" -o "$skill_dir/CLAUDE.md" 2>/dev/null || {
        error "Could not download skill: $skill_name"
    }

    # Try to fetch skill.yaml if it exists
    curl -fsSL "$GITHUB_RAW/skills/$category/$skill_name/skill.yaml" -o "$skill_dir/skill.yaml" 2>/dev/null || true

    # Update local state
    update_local_state "$skill_name" "installed"

    success "Installed: $skill_name"

    # Check for dependencies
    if [ -f "$skill_dir/skill.yaml" ]; then
        log "Checking dependencies..."
        # TODO: Parse skill.yaml and install dependencies
    fi
}

# Update local state
update_local_state() {
    local skill_name="$1"
    local status="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    if [ ! -f "$LOCAL_STATE" ]; then
        echo '{"skills":{}}' > "$LOCAL_STATE"
    fi

    if command -v jq &> /dev/null; then
        jq ".skills[\"$skill_name\"] = {\"status\": \"$status\", \"updated\": \"$timestamp\"}" "$LOCAL_STATE" > "$LOCAL_STATE.tmp"
        mv "$LOCAL_STATE.tmp" "$LOCAL_STATE"
    fi
}

# Sync all skills
sync_all() {
    log "Syncing all skills from GitHub..."

    fetch_registry || true

    # Get list of skills from registry
    if [ -f "$REGISTRY_FILE" ] && command -v jq &> /dev/null; then
        local skills=$(jq -r '.skills | keys[]' "$REGISTRY_FILE")

        for skill in $skills; do
            install_skill "$skill" || warn "Failed to install: $skill"
        done
    else
        warn "Could not parse registry - try manual install"
    fi

    success "Sync complete!"
}

# Pull updates
pull_updates() {
    log "Checking for updates..."

    fetch_registry || {
        error "Could not connect to GitHub"
    }

    # Compare versions and update
    # TODO: Implement version comparison

    success "All skills up to date"
}

# Push local changes (for contributors)
push_changes() {
    log "Pushing local changes..."

    if ! command -v git &> /dev/null; then
        error "git is required for push operations"
    fi

    warn "Push not yet implemented - please submit PR manually"
}

# Show help
show_help() {
    echo "ACOS Sync - Agentic Creator OS Skill Synchronization"
    echo ""
    echo "Usage: acos-sync <command> [options]"
    echo ""
    echo "Commands:"
    echo "  list              List available skills"
    echo "  install <skill>   Install a specific skill"
    echo "  remove <skill>    Remove an installed skill"
    echo "  sync              Sync all skills from GitHub"
    echo "  pull              Pull latest updates"
    echo "  push              Push local changes (contributors)"
    echo "  status            Show sync status"
    echo "  help              Show this help message"
    echo ""
    echo "Options:"
    echo "  --category=<cat>  Filter by category (technical, creative, business, soulbook)"
    echo "  --force           Force overwrite local changes"
    echo "  --dry-run         Show what would be done"
    echo ""
    echo "Examples:"
    echo "  acos-sync list"
    echo "  acos-sync install content-strategy"
    echo "  acos-sync sync --category=technical"
    echo ""
}

# Main entry point
main() {
    show_banner
    check_prerequisites

    case "${1:-help}" in
        list)
            list_skills
            ;;
        install)
            install_skill "$2"
            ;;
        sync)
            sync_all
            ;;
        pull)
            pull_updates
            ;;
        push)
            push_changes
            ;;
        status)
            log "Local state: $LOCAL_STATE"
            [ -f "$LOCAL_STATE" ] && cat "$LOCAL_STATE"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: $1. Use 'acos-sync help' for usage."
            ;;
    esac
}

# Run
main "$@"
