#!/bin/bash
# ACOS CLI - install the packaged runtime and keep legacy skill sync available
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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INSTALLER="$PACKAGE_ROOT/install.sh"
MANIFEST_FILE="$PACKAGE_ROOT/acos.manifest.json"
CLAUDE_HOME="${CLAUDE_HOME:-$HOME/.claude}"
ACOS_HOME="${ACOS_HOME:-$CLAUDE_HOME/acos}"
SKILLS_DIR="$ACOS_HOME/legacy-skills"
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
    echo -e "${CYAN}║     AGENTIC CREATOR OS - Product CLI                  ║${NC}"
    echo -e "${CYAN}║     github.com/frankxai/agentic-creator-os            ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
}

json_field() {
    local field="$1"
    [ -f "$MANIFEST_FILE" ] || return 1
    command -v node &> /dev/null || return 1
    node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
let value = data;
for (const key of process.argv[2].split('.')) value = value?.[key];
if (value === undefined || value === null) process.exit(1);
process.stdout.write(String(value));
" "$MANIFEST_FILE" "$field"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    if [ "${1:-}" = "legacy-sync" ] && ! command -v curl &> /dev/null; then
        error "curl is required for legacy sync commands"
    fi

    if ! command -v git &> /dev/null; then
        warn "git not found - some features will be limited"
    fi

    if ! command -v jq &> /dev/null; then
        warn "jq not found - installing basic JSON support"
    fi

    success "Prerequisites check passed"
}

# Install packaged ACOS runtime
install_product() {
    if [ ! -x "$INSTALLER" ]; then
        error "Installer not found or not executable: $INSTALLER"
    fi
    "$INSTALLER" "$@"
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

    if [ -f "$MANIFEST_FILE" ] && command -v node &> /dev/null; then
        node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
for (const skill of manifest.inventory.skills) console.log('  ' + skill);
" "$MANIFEST_FILE"
    elif [ -f "$REGISTRY_FILE" ]; then
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

    warn "Legacy sync installs registry skills into $SKILLS_DIR. Use 'acos install' for the packaged .claude runtime."
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
    warn "Legacy sync uses the old registry. Use 'acos install' for the packaged .claude runtime."
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
    echo "ACOS - Agentic Creator OS product CLI"
    echo ""
    echo "Usage: acos <command> [options]"
    echo ""
    echo "Commands:"
    echo "  install [options] Install the packaged .claude runtime"
    echo "  status            Show installed/runtime status"
    echo "  list [skills]     List packaged skills"
    echo "  sync              Legacy: sync registry skills from GitHub"
    echo "  pull              Legacy: pull registry metadata"
    echo "  push              Legacy: contributor placeholder"
    echo "  help              Show this help message"
    echo ""
    echo "Installer options are passed through to install.sh:"
    echo "  --platform=claude|cursor|windsurf|gemini|generic|all"
    echo "  --full | --minimal | --skills-only | --hooks-only | --mcp-only"
    echo ""
    echo "Examples:"
    echo "  acos install --platform=claude"
    echo "  acos install --platform=cursor --target=."
    echo "  acos status"
    echo "  acos list skills"
    echo ""
}

# Main entry point
main() {
    show_banner
    local command="${1:-help}"

    case "$command" in
        install)
            shift
            check_prerequisites
            install_product "$@"
            ;;
        list)
            check_prerequisites
            list_skills
            ;;
        install-skill)
            check_prerequisites legacy-sync
            install_skill "$2"
            ;;
        sync)
            check_prerequisites legacy-sync
            sync_all
            ;;
        pull)
            check_prerequisites legacy-sync
            pull_updates
            ;;
        push)
            check_prerequisites
            push_changes
            ;;
        status)
            check_prerequisites
            log "Package root: $PACKAGE_ROOT"
            if [ -f "$MANIFEST_FILE" ]; then
                echo "Version: $(json_field version 2>/dev/null || echo unknown)"
                echo "Runtime: $(json_field source.runtime 2>/dev/null || echo .claude)"
                echo "Skills: $(json_field stats.skills 2>/dev/null || echo unknown)"
                echo "Commands: $(json_field stats.commands 2>/dev/null || echo unknown)"
                echo "Agents: $(json_field stats.agents 2>/dev/null || echo unknown)"
                echo "Hook scripts: $(json_field stats.hookScripts 2>/dev/null || echo unknown)"
                echo "Activation rules: $(json_field stats.activationRules 2>/dev/null || echo unknown)"
            else
                warn "No manifest found at $MANIFEST_FILE"
            fi
            echo "Install state: $LOCAL_STATE"
            [ -f "$LOCAL_STATE" ] && sed -n '1,80p' "$LOCAL_STATE"
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
