#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# AGENTIC CREATOR OS — Multi-Platform Installer
# Works with: Claude Code, Cursor, Windsurf, Gemini Code Assist, any AI agent
# github.com/frankxai/agentic-creator-os
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
GITHUB_REPO="frankxai/agentic-creator-os"

# Detect installation paths
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST_FILE="$PROJECT_DIR/acos.manifest.json"
PACKAGE_FILE="$PROJECT_DIR/package.json"

read_json_field() {
    local file="$1"
    local field="$2"
    [ -f "$file" ] || return 1
    command -v node &>/dev/null || return 1
    node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
let value = data;
for (const key of process.argv[2].split('.')) value = value?.[key];
if (value === undefined || value === null) process.exit(1);
process.stdout.write(String(value));
" "$file" "$field"
}

manifest_stat() {
    read_json_field "$MANIFEST_FILE" "stats.$1" 2>/dev/null || true
}

VERSION="$(read_json_field "$PACKAGE_FILE" "version" 2>/dev/null || read_json_field "$MANIFEST_FILE" "version" 2>/dev/null || echo "11.0.0")"

# Logging
log()     { echo -e "${CYAN}[ACOS]${NC} $1"; }
success() { echo -e "${GREEN}  [+]${NC} $1"; }
warn()    { echo -e "${YELLOW}  [!]${NC} $1"; }
error()   { echo -e "${RED}  [x]${NC} $1"; exit 1; }
step()    { echo -e "${MAGENTA}  [>]${NC} $1"; }

# ── Banner ────────────────────────────────────────────────────────────────────
show_banner() {
    echo ""
    echo -e "${CYAN}${BOLD}"
    echo "    ╔═══════════════════════════════════════════════════╗"
    echo "    ║                                                   ║"
    echo "    ║     █████╗  ██████╗ ██████╗ ███████╗              ║"
    echo "    ║    ██╔══██╗██╔════╝██╔═══██╗██╔════╝              ║"
    echo "    ║    ███████║██║     ██║   ██║███████╗              ║"
    echo "    ║    ██╔══██║██║     ██║   ██║╚════██║              ║"
    echo "    ║    ██║  ██║╚██████╗╚██████╔╝███████║              ║"
    echo "    ║    ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝              ║"
    echo "    ║                                                   ║"
    echo "    ║    v${VERSION} — Autonomous Intelligence              ║"
    echo "    ║    Multi-Platform AI Agent Operating System        ║"
    echo "    ║                                                   ║"
    echo "    ╚═══════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# ── Help ──────────────────────────────────────────────────────────────────────
show_help() {
    echo "Usage: ./install.sh [OPTIONS]"
    echo ""
    echo "Platform Options:"
    echo "  --platform=claude     Claude Code (full features: commands, skills, agents, hooks)"
    echo "  --platform=cursor     Cursor (generates .cursorrules with embedded skills)"
    echo "  --platform=windsurf   Windsurf (generates .windsurfrules)"
    echo "  --platform=gemini     Gemini Code Assist (generates GEMINI.md)"
    echo "  --platform=generic    Any AI agent (generates CONTEXT.md)"
    echo "  --platform=all        Install for all detected platforms"
    echo ""
    echo "Install Modes:"
    echo "  --full                Full installation (all skills + MCP servers)"
    echo "  --minimal             Core skills only"
    echo "  --skills-only         Skills without commands/agents"
    echo "  --hooks-only          v10 safety hooks only (Claude Code)"
    echo "  --mcp-only            MCP servers only"
    echo ""
    echo "Other:"
    echo "  --target=DIR          Install to specific project directory"
    echo "  --sync                Sync from GitHub"
    echo "  --help                Show this help"
    echo ""
    echo "Examples:"
    echo "  ./install.sh                           # Auto-detect platform"
    echo "  ./install.sh --platform=cursor         # Cursor-specific install"
    echo "  ./install.sh --platform=claude --full   # Claude Code with MCP servers"
    echo "  ./install.sh --platform=all            # All platforms"
    echo ""
}

# ── Platform Detection ────────────────────────────────────────────────────────
detect_platforms() {
    local platforms=""

    # Claude Code
    if command -v claude &>/dev/null || [ -d "$HOME/.claude" ]; then
        platforms="claude"
    fi

    # Cursor
    if [ -d "$HOME/.cursor" ] || command -v cursor &>/dev/null; then
        [ -n "$platforms" ] && platforms="$platforms,"
        platforms="${platforms}cursor"
    fi

    # Windsurf / Codeium
    if [ -d "$HOME/.codeium" ] || command -v windsurf &>/dev/null; then
        [ -n "$platforms" ] && platforms="$platforms,"
        platforms="${platforms}windsurf"
    fi

    # Gemini
    if [ -d "$HOME/.gemini" ] || command -v gemini &>/dev/null; then
        [ -n "$platforms" ] && platforms="$platforms,"
        platforms="${platforms}gemini"
    fi

    # Fallback
    if [ -z "$platforms" ]; then
        platforms="generic"
    fi

    echo "$platforms"
}

# ── Prerequisites ─────────────────────────────────────────────────────────────
check_prerequisites() {
    log "Checking prerequisites..."

    if ! command -v node &>/dev/null; then
        warn "Node.js not found — MCP servers won't build (skills still work)"
    fi

    success "Ready to install"
}

# ── Claude Code Install ──────────────────────────────────────────────────────
install_claude_code() {
    local mode="${1:-standard}"
    local claude_home="${CLAUDE_HOME:-$HOME/.claude}"
    local install_skills=true
    local install_commands=true
    local install_agents=true
    local install_hooks=true
    local install_rules=true
    local install_iam=true
    local skill_filter="all"

    log "Installing for Claude Code..."

    mkdir -p "$claude_home/skills" "$claude_home/commands" "$claude_home/agents" "$claude_home/acos"

    local source_root="$(cd "$PROJECT_DIR" && pwd -P)"
    local claude_root="$(cd "$claude_home" && pwd -P)"
    if [ "${ACOS_ALLOW_SELF_TARGET:-}" != "1" ]; then
        case "$source_root/" in
            "$claude_root/skills/"*|"$claude_root/commands/"*|"$claude_root/agents/"*)
                error "Refusing to install from inside $claude_root runtime directories. Move ACOS elsewhere or set ACOS_ALLOW_SELF_TARGET=1."
                ;;
        esac
    fi

    case "$mode" in
        skills)
            install_commands=false
            install_agents=false
            install_hooks=false
            install_iam=false
            ;;
        hooks)
            install_skills=false
            install_commands=false
            install_agents=false
            install_rules=false
            ;;
        minimal)
            install_commands=false
            install_agents=false
            install_hooks=false
            install_iam=false
            skill_filter="minimal"
            ;;
    esac

    # Skills
    if [ "$install_skills" = true ] && [ -d "$PROJECT_DIR/.claude/skills" ]; then
        local skill_count=0
        local minimal_skills="acos-meta planning-with-files safety-guard verification-loop verification-quality model-routing memory-guardian"
        for skill_dir in "$PROJECT_DIR/.claude/skills"/*/; do
            [ -d "$skill_dir" ] || continue
            local name=$(basename "$skill_dir")
            [ "$name" = "CLAUDE.md" ] && continue
            if [ "$skill_filter" = "minimal" ] && [[ " $minimal_skills " != *" $name "* ]]; then
                continue
            fi
            mkdir -p "$claude_home/skills/$name"
            cp -R "$skill_dir"/. "$claude_home/skills/$name/" 2>/dev/null || true
            skill_count=$((skill_count + 1))
        done
        success "Installed $skill_count skills"
    fi

    # Skill rules (auto-activation)
    if [ "$install_rules" = true ] && [ -f "$PROJECT_DIR/.claude/skill-rules.json" ]; then
        cp "$PROJECT_DIR/.claude/skill-rules.json" "$claude_home/skill-rules.json"
        local rule_count="$(manifest_stat activationRules)"
        success "Installed ${rule_count:-auto-activation} rules"
    fi

    # Commands (slash commands — Claude Code only)
    if [ "$install_commands" = true ] && [ -d "$PROJECT_DIR/.claude/commands" ]; then
        local cmd_count=0
        while IFS= read -r -d '' cmd; do
            [ -f "$cmd" ] || continue
            local rel_cmd="${cmd#$PROJECT_DIR/.claude/commands/}"
            mkdir -p "$claude_home/commands/$(dirname "$rel_cmd")"
            cp "$cmd" "$claude_home/commands/$rel_cmd"
            cmd_count=$((cmd_count + 1))
        done < <(find "$PROJECT_DIR/.claude/commands" -type f -name "*.md" -print0)
        success "Installed $cmd_count slash commands"
    fi

    # Agents
    if [ "$install_agents" = true ] && [ -d "$PROJECT_DIR/.claude/agents" ]; then
        local agent_count=0
        for agent in "$PROJECT_DIR/.claude/agents"/*.md "$PROJECT_DIR/.claude/agents"/*.json; do
            [ -f "$agent" ] || continue
            cp "$agent" "$claude_home/agents/"
            agent_count=$((agent_count + 1))
        done
        success "Installed $agent_count agents"
    fi

    # v10 Safety Hooks
    if [ "$install_hooks" = true ] && [ -d "$PROJECT_DIR/.claude/hooks" ]; then
        mkdir -p "$claude_home/acos/hooks"
        for hook in "$PROJECT_DIR/.claude/hooks"/*.sh; do
            [ -f "$hook" ] || continue
            cp "$hook" "$claude_home/acos/hooks/"
            chmod +x "$claude_home/acos/hooks/$(basename "$hook")"
        done
        success "Installed v10 safety hooks (circuit-breaker, audit-trail, self-modify-gate)"
    fi

    # Hooks config
    if [ "$install_hooks" = true ] && [ -f "$PROJECT_DIR/.claude/hooks.json" ]; then
        cp "$PROJECT_DIR/.claude/hooks.json" "$claude_home/acos/hooks.json"
        success "Installed hook lifecycle config"
    fi

    # Hook helpers
    if [ "$install_hooks" = true ] && [ -d "$PROJECT_DIR/.claude/helpers" ]; then
        mkdir -p "$claude_home/acos/helpers"
        cp -R "$PROJECT_DIR/.claude/helpers"/. "$claude_home/acos/helpers/"
        success "Installed hook helper scripts"
    fi

    # Agent IAM
    if [ "$install_iam" = true ] && [ -f "$PROJECT_DIR/.claude/agent-iam.json" ]; then
        cp "$PROJECT_DIR/.claude/agent-iam.json" "$claude_home/acos/agent-iam.json"
        local iam_count="$(manifest_stat iamProfiles)"
        success "Installed Agent IAM (${iam_count:-configured} profiles)"
    fi

    # State file
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    cat > "$claude_home/acos/state.json" << STATEEOF
{
  "version": "$VERSION",
  "platform": "claude-code",
  "installedAt": "$timestamp",
  "mode": "$mode",
  "features": {
    "commands": $install_commands,
    "skills": $install_skills,
    "agents": $install_agents,
    "hooks": $install_hooks,
    "autoActivation": $install_rules,
    "agentIAM": $install_iam,
    "circuitBreaker": $install_hooks,
    "auditTrail": $install_hooks,
    "selfModifyGate": $install_hooks
  }
}
STATEEOF

    success "Claude Code installation complete"
}

# ── Generate Context File (for non-Claude platforms) ──────────────────────────
generate_context_file() {
    local platform="$1"
    local target_dir="${2:-.}"
    local output_file=""

    case "$platform" in
        cursor)    output_file="$target_dir/.cursorrules" ;;
        windsurf)  output_file="$target_dir/.windsurfrules" ;;
        gemini)    output_file="$target_dir/GEMINI.md" ;;
        generic)   output_file="$target_dir/CONTEXT.md" ;;
        *)         output_file="$target_dir/ACOS-CONTEXT.md" ;;
    esac

    log "Generating context file for $platform..."

    # Build the context file
    {
        echo "# Agentic Creator OS v${VERSION}"
        echo ""
        echo "You have the Agentic Creator OS installed. This gives you access to specialized"
        echo "skills, agent personas, and workflows for content creation, development, strategy,"
        echo "music production, and more."
        echo ""
        echo "## How to Use"
        echo ""
        echo "Just describe what you want to do. ACOS skills activate automatically based on context."
        echo ""
        echo "Examples:"
        echo '- "Write a blog post about AI agents" → content-strategy + SEO skills activate'
        echo '- "Build a React component" → react-patterns + TDD skills activate'
        echo '- "Help me deploy to Vercel" → vercel-deployment + nextjs skills activate'
        echo '- "Create a music track" → suno-ai-mastery skills activate'
        echo ""
        echo "## Available Workflows"
        echo ""
        echo "| Workflow | Description |"
        echo "|----------|-------------|"
        echo "| Article Creation | Research → outline → write → SEO → publish |"
        echo "| Music Production | Genre selection → prompt → Suno generation → refinement |"
        echo "| Feature Development | Spec → plan → implement → test → deploy |"
        echo "| Content Distribution | Blog → social posts → newsletter → scheduling |"
        echo "| Research Pipeline | Topic → sources → synthesis → report |"
        echo "| Strategic Planning | Assessment → council → recommendations → action items |"
        echo ""
        echo "## Agent Personas"
        echo ""
        echo "When a task requires specialized expertise, adopt the relevant persona:"
        echo ""

        # Embed top agent descriptions
        for agent_file in "$PROJECT_DIR/.claude/agents"/*.md; do
            [ -f "$agent_file" ] || continue
            local name=$(basename "$agent_file" .md)
            # Skip CLAUDE.md and AGENT_PROTOCOL.md
            [[ "$name" == "CLAUDE" || "$name" == "AGENT_PROTOCOL" ]] && continue
            local title=$(head -5 "$agent_file" | grep -m1 "^#" | sed 's/^#\+\s*//' 2>/dev/null || echo "$name")
            echo "- **$title** ($name)"
        done

        echo ""
        echo "## Skill Categories"
        echo ""
        echo "| Category | Skills |"
        echo "|----------|--------|"

        # List skill categories
        local categories=()
        for skill_dir in "$PROJECT_DIR/.claude/skills"/*/; do
            [ -d "$skill_dir" ] || continue
            local sname=$(basename "$skill_dir")
            [ "$sname" = "CLAUDE.md" ] && continue
            echo "| $sname | See SKILL.md in skills/$sname/ |"
        done

        echo ""
        echo "## Decision Framework"
        echo ""
        echo "Before any structural change:"
        echo "1. What specific problem are we solving?"
        echo "2. What's the simplest solution?"
        echo "3. What could go wrong?"
        echo "4. Is this reversible?"
        echo ""
        echo "## Brand Voice"
        echo ""
        echo "- Direct, technical, warm"
        echo "- Lead with results, not claims"
        echo "- No spiritual/guru language"
        echo "- Show don't tell"
        echo ""
        echo "---"
        echo "*ACOS v${VERSION} — Autonomous Intelligence*"

    } > "$output_file"

    success "Generated: $output_file ($(wc -l < "$output_file") lines)"
}

# ── Install for specific platform ─────────────────────────────────────────────
install_platform() {
    local platform="$1"
    local mode="${2:-standard}"
    local target="${3:-.}"

    case "$platform" in
        claude|claude-code)
            install_claude_code "$mode"
            ;;
        cursor)
            generate_context_file "cursor" "$target"
            success "Cursor: Open your project and .cursorrules will be loaded automatically"
            ;;
        windsurf)
            generate_context_file "windsurf" "$target"
            success "Windsurf: Open your project and .windsurfrules will be loaded automatically"
            ;;
        gemini)
            generate_context_file "gemini" "$target"
            success "Gemini: GEMINI.md will be read as project context"
            ;;
        generic)
            generate_context_file "generic" "$target"
            success "Generic: Point your AI agent at CONTEXT.md as system instructions"
            ;;
        *)
            warn "Unknown platform: $platform. Using generic install."
            generate_context_file "generic" "$target"
            ;;
    esac
}

# ── Build MCP Servers ─────────────────────────────────────────────────────────
build_mcp_servers() {
    log "Building MCP servers..."

    if [ ! -d "$PROJECT_DIR/mcp-servers" ]; then
        warn "No mcp-servers directory found"
        return
    fi

    for server_dir in "$PROJECT_DIR/mcp-servers"/*/; do
        [ -d "$server_dir" ] && [ -f "$server_dir/package.json" ] || continue
        local name=$(basename "$server_dir")
        step "Building $name..."
        (cd "$server_dir" && npm install --quiet 2>/dev/null && npm run build --quiet 2>/dev/null) || warn "Build failed for $name"
        success "Built: $name"
    done
}

# ── Summary ───────────────────────────────────────────────────────────────────
show_summary() {
    local platforms="$1"

    echo ""
    echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}${BOLD}  ACOS v${VERSION} — Installation Complete${NC}"
    echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Platforms:${NC}  $platforms"
    echo -e "  ${CYAN}Source:${NC}     $PROJECT_DIR"
    echo ""

    if [[ "$platforms" == *"claude"* ]]; then
        echo -e "  ${YELLOW}Claude Code:${NC}"
        echo "    1. Open your project: claude"
        echo "    2. Type: /acos"
        echo "    3. Or just describe what you want"
        echo ""
    fi

    if [[ "$platforms" == *"cursor"* ]]; then
        echo -e "  ${YELLOW}Cursor:${NC}"
        echo "    1. Copy .cursorrules to your project root"
        echo "    2. Open project in Cursor"
        echo "    3. Skills activate automatically from context"
        echo ""
    fi

    if [[ "$platforms" == *"windsurf"* ]]; then
        echo -e "  ${YELLOW}Windsurf:${NC}"
        echo "    1. Copy .windsurfrules to your project root"
        echo "    2. Open project in Windsurf"
        echo "    3. Skills activate from context"
        echo ""
    fi

    if [[ "$platforms" == *"gemini"* ]]; then
        echo -e "  ${YELLOW}Gemini Code Assist:${NC}"
        echo "    1. Copy GEMINI.md to your project root"
        echo "    2. Gemini reads it as project context"
        echo ""
    fi

    echo -e "  ${CYAN}Documentation:${NC} https://github.com/$GITHUB_REPO"
    echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
    local platform=""
    local mode="standard"
    local target_dir="."

    while [[ $# -gt 0 ]]; do
        case $1 in
            --platform=*)  platform="${1#*=}"; shift ;;
            --target=*)    target_dir="${1#*=}"; shift ;;
            --full)        mode="full"; shift ;;
            --minimal)     mode="minimal"; shift ;;
            --skills-only) mode="skills"; shift ;;
            --hooks-only)  mode="hooks"; shift ;;
            --mcp-only)    mode="mcp"; shift ;;
            --sync)        mode="sync"; shift ;;
            --help|-h)     show_help; exit 0 ;;
            *)             warn "Unknown option: $1"; shift ;;
        esac
    done

    show_banner
    check_prerequisites

    # Auto-detect if no platform specified
    if [ -z "$platform" ]; then
        platform=$(detect_platforms)
        log "Detected platform(s): $platform"
    fi

    # Handle special modes
    case "$mode" in
        "mcp")
            build_mcp_servers
            echo ""
            success "MCP servers built."
            exit 0
            ;;
        "sync")
            log "Syncing from GitHub..."
            if command -v git &>/dev/null; then
                (cd "$PROJECT_DIR" && git pull --rebase origin main 2>/dev/null) || warn "Git sync failed"
                success "Synced from GitHub"
            else
                error "git is required for sync"
            fi
            exit 0
            ;;
    esac

    # Install for each platform
    IFS=',' read -ra PLATFORMS <<< "$platform"
    for p in "${PLATFORMS[@]}"; do
        p=$(echo "$p" | xargs) # trim whitespace
        if [ "$p" = "all" ]; then
            local detected=$(detect_platforms)
            IFS=',' read -ra ALL_PLATFORMS <<< "$detected"
            for ap in "${ALL_PLATFORMS[@]}"; do
                install_platform "$(echo "$ap" | xargs)" "$mode" "$target_dir"
            done
        else
            install_platform "$p" "$mode" "$target_dir"
        fi
    done

    # Build MCP servers if full mode
    if [ "$mode" = "full" ]; then
        build_mcp_servers
    fi

    show_summary "$platform"
}

main "$@"
