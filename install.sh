#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# AGENTIC CREATOR OS v10 — Multi-Platform Installer
# Works with: Claude Code, Cursor, Windsurf, Gemini Code Assist, any AI agent
# github.com/frankxai/agentic-creator-os
# SIP: Built on SIP v1.1.1 (starlightintelligence.org/protocol) — grok-personal / personal-creative partition per repo doctrine
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
VERSION="12.0.0"
GITHUB_REPO="frankxai/agentic-creator-os"

# Detect installation paths
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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
    echo "  --platform=grok       Grok Build / Grok CLI (xAI TUI) full harness: generates GROK.md + .grok/skills/ seeds (exact 4 grok-personal excellence per SHARING/SIP: repo-mastery/multi-harness-orchestrator/excellence-review/harness-integration) + 2 excellence json hooks as .grok/hooks/ ONLY; core via .claude junctions. Source of truth: adapters/grok/index.ts + getGrokSeeds()."
    echo "  --platform=antigravity (or agy)  Antigravity/AGY (proposes .antigravity/ seeds + harness parity like SIS; delegates via multi-orchestrator + .claude junctions for now; full scaffold on demand; matches 5-fleet: claude/codex/gemini/agy/grok)"
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
    echo "  ./install.sh --platform=grok           # Grok Build full harness (GROK.md + .grok/ seeds from adapter)"
    echo "  ./install.sh --platform=antigravity    # AGY scaffold (5-fleet parity + grok-personal; creates .antigravity/ + harnesses/antigravity/ minimal, reversible; see ACOS adapters parity 2026-06-02)"
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

    # Grok CLI (xAI) — full harness support via .grok/ + AGENTS.md compat + Claude bridge
    if command -v grok &>/dev/null || [ -d "$HOME/.grok" ]; then
        [ -n "$platforms" ] && platforms="$platforms,"
        platforms="${platforms}grok"
    fi

    # Antigravity/AGY (Google) — 96-mind swarm + junctions; 5-fleet parity w/ agy/grok upgrades
    if command -v agy &>/dev/null || command -v antigravity &>/dev/null || [ -d "$HOME/.antigravity" ] || [ -d "$HOME/.agy" ]; then
        [ -n "$platforms" ] && platforms="$platforms,"
        platforms="${platforms}antigravity"
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

    log "Installing for Claude Code..."

    mkdir -p "$claude_home/skills" "$claude_home/commands" "$claude_home/agents" "$claude_home/acos"

    # Skills
    if [ -d "$PROJECT_DIR/.claude/skills" ]; then
        local skill_count=0
        for skill_dir in "$PROJECT_DIR/.claude/skills"/*/; do
            [ -d "$skill_dir" ] || continue
            local name=$(basename "$skill_dir")
            [ "$name" = "CLAUDE.md" ] && continue
            mkdir -p "$claude_home/skills/$name"
            cp -r "$skill_dir"* "$claude_home/skills/$name/" 2>/dev/null || true
            skill_count=$((skill_count + 1))
        done
        success "Installed $skill_count skills"
    fi

    # Skill rules (auto-activation)
    if [ -f "$PROJECT_DIR/.claude/skill-rules.json" ]; then
        cp "$PROJECT_DIR/.claude/skill-rules.json" "$claude_home/skill-rules.json"
        success "Installed 22 auto-activation rules"
    fi

    # Commands (slash commands — Claude Code only)
    if [ -d "$PROJECT_DIR/.claude/commands" ]; then
        local cmd_count=0
        for cmd in "$PROJECT_DIR/.claude/commands"/*.md; do
            [ -f "$cmd" ] || continue
            cp "$cmd" "$claude_home/commands/"
            cmd_count=$((cmd_count + 1))
        done
        success "Installed $cmd_count slash commands"
    fi

    # Agents
    if [ -d "$PROJECT_DIR/.claude/agents" ]; then
        local agent_count=0
        for agent in "$PROJECT_DIR/.claude/agents"/*.md "$PROJECT_DIR/.claude/agents"/*.json; do
            [ -f "$agent" ] || continue
            cp "$agent" "$claude_home/agents/"
            agent_count=$((agent_count + 1))
        done
        success "Installed $agent_count agents"
    fi

    # v10 Safety Hooks
    if [ -d "$PROJECT_DIR/.claude/hooks" ]; then
        mkdir -p "$claude_home/acos/hooks"
        for hook in "$PROJECT_DIR/.claude/hooks"/*.sh; do
            [ -f "$hook" ] || continue
            cp "$hook" "$claude_home/acos/hooks/"
            chmod +x "$claude_home/acos/hooks/$(basename "$hook")"
        done
        success "Installed v10 safety hooks (circuit-breaker, audit-trail, self-modify-gate)"
    fi

    # Hooks config
    if [ -f "$PROJECT_DIR/.claude/hooks.json" ]; then
        cp "$PROJECT_DIR/.claude/hooks.json" "$claude_home/acos/hooks.json"
        success "Installed hook lifecycle config"
    fi

    # Agent IAM
    if [ -f "$PROJECT_DIR/.claude/agent-iam.json" ]; then
        cp "$PROJECT_DIR/.claude/agent-iam.json" "$claude_home/acos/agent-iam.json"
        success "Installed Agent IAM (6 profiles)"
    fi

    # State file
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    cat > "$claude_home/acos/state.json" << STATEEOF
{
  "version": "$VERSION",
  "platform": "claude-code",
  "installedAt": "$timestamp",
  "features": {
    "commands": true,
    "skills": true,
    "agents": true,
    "hooks": true,
    "autoActivation": true,
    "agentIAM": true,
    "circuitBreaker": true,
    "auditTrail": true,
    "selfModifyGate": true
  }
}
STATEEOF

    success "Claude Code installation complete"
}

# ── Grok Full Harness Install (GROK.md + .grok/ seeds from grok-harness-adapter) ─
install_grok() {
    local mode="${1:-standard}"
    local target="${2:-.}"
    local grok_home="${GROK_HOME:-$HOME/.grok}"

    log "Installing full Grok Build harness support for ACOS (grok-harness-adapter)..."
    log "Grok personal excellence seeds ONLY in .grok/ (per repo doctrine). Core shared via .claude junctions/ACOS/SIS. Never leak grok-personal to ACOS core."
    log "5-fleet parity (Claude+Codex+Gemini+Antigravity/agy+Grok) + explicit grok-personal filter + gstack/SIP — upgraded to SIS orchestrator harness level for ACOS + beyond (claude-code-config, frankx visual sites)."

    # Project-level .grok/ seeds (highest priority per Grok spec; grok-personal seeds only per SHARING)
    mkdir -p "$target/.grok/skills" "$target/.grok/agents" "$target/.grok/hooks"

    # Seed 1: harness-integration (grok-personal - auto hooks, multi-harness delegation, excellence on load; .grok native only)
    mkdir -p "$target/.grok/skills/harness-integration"
    cat > "$target/.grok/skills/harness-integration/SKILL.md" << 'GROKSEED1'
---
name: harness-integration
description: ACOS Grok bridge. SessionStart loads repo-mastery + excellence gates. PreToolUse enforces rules read + suggests harness (claude for plans). Uses gstack for QA, verification-loop/santa-method. Full .claude/ compat + native .grok/. Delegate via terminal when needed. Trigger: setup, harness, grok, excellence.
---

# Grok Harness Integration (ACOS v12+)

## Principles
- CREATOR.md identity contract in every response. excellence standards via gates.
- Shared catalog (~/.claude/skills + ~/.grok/skills + project .grok/) source of truth.
- On start: echo excellence status, read GROK.md/CLAUDE.md/AGENTS.md (deeper wins).
- Gates before edit: rules check, repo-mastery, plan-reviews, gstack qa (if web), santa/verification.
- Subagent swarm + delegate: output exact claude/agy/gemini commands with injected rules for complex tasks.

## Excellence Path (always)
repo-mastery → plan-*-review → verification-loop + santa-method → gstack (qa/browse/design/benchmark) → cso if needed → ship with evidence.

Composes with all ACOS skills (gstack 20+, content, dev, security). Use /skills in Grok TUI or natural language.
GROKSEED1
    success "Seeded .grok/skills/harness-integration"

    # Seed 2: excellence-review
    mkdir -p "$target/.grok/skills/excellence-review"
    cat > "$target/.grok/skills/excellence-review/SKILL.md" << 'GROKSEED2'
---
name: excellence-review
description: Mandatory excellence gates for Grok+ACOS. verification-loop, santa-method, gstack-qa, plan-reviews, repo-mastery, cso, rules-distill. Never ship without evidence (gstack screenshots, metrics). Use on any build/suggest/lead task.
---

# Excellence Review Skill — Grok Harness

## excellence standards Mandate
1. repo-mastery (read all rules files first, map cross-repo)
2. CEO/Eng/Design plan reviews (subagent or delegate to claude)
3. Adversarial: verification-loop + santa-method (2 independent pass required)
4. gstack: qa (tiers quick/standard/exhaustive), browse, design-review, benchmark, canary
5. Security: cso / security-auditor + supply chain
6. Polish: rules-distill, skill-comply, document-release

Output format: report + before/after + artifacts. Iterate atomically.

Tools: gstack (headless browser ~100ms), terminal (tests), subagents.
GROKSEED2
    success "Seeded .grok/skills/excellence-review (gstack + santa + verification)"

    # Seed 3: repo-mastery
    mkdir -p "$target/.grok/skills/repo-mastery"
    cat > "$target/.grok/skills/repo-mastery/SKILL.md" << 'GROKSEED3'
---
name: repo-mastery
description: Master ACOS, FrankX, Starlight-Intelligence-System, arcanea, claude-code-config and full starlight/repos ecosystem. Architecture, skills/hooks/MCP map, harness integration points. Read CLAUDE.md/AGENTS.md/GROK.md first. Use MCPs (github, fs-starlight), gstack, subagents, grep, terminal. Excellence gates required. Trigger: repo, ACOS, ecosystem, mastery, cross-repo.
---

# Repo Mastery (Grok Edition)

Steps:
1. Inventory + read rules (CLAUDE/AGENTS/GROK.md priority)
2. Parallel subagents for ACOS core, SIP, products, mcp-servers, skills catalog
3. Cross-ref with remote (gh/MCP) + local FS
4. Map .grok + .claude compat, skills 100+, hooks, agents
5. Apply gates (excellence-review) before any recs
6. Structured output: components, critical paths, opportunities. No unrequested MDs.

Embody CREATOR.md identity contract. Lead with builds.
GROKSEED3
    success "Seeded .grok/skills/repo-mastery"

    # Seed 4: multi-harness-orchestrator (grok-personal - auto detect + exact shell delegation with injected .claude + repo rules + DNA + core/personal filter; .grok native only per SHARING)
    mkdir -p "$target/.grok/skills/multi-harness-orchestrator"
    cat > "$target/.grok/skills/multi-harness-orchestrator/SKILL.md" << 'GROKSEED4'
---
name: multi-harness-orchestrator
description: Automatically detect tasks suited for delegation to other agent harnesses (Claude Code as canonical, agy/antigravity, gemini, cursor, etc.). Leverage shared .claude catalog (skills, commands, agents, hooks, junctions for agy). Embody CREATOR.md identity contract. Output exact delegation commands (e.g. claude -p "injected rules + task" --cwd ...). Auto-utilize by shelling harness CLIs with full context from rules/catalog. Combine with repo-mastery for ecosystem tasks. Suggest/lead by choosing best harness or running in parallel. Grok .grok personal excellence seeds only (core to others).
---
GROKSEED4
    success "Seeded .grok/skills/multi-harness-orchestrator (grok-personal)"

    # Seed 5: excellence json hooks (grok-personal - .grok/hooks/ for SessionStart/PreToolUse DNA/rules/catalog/MCP/delegation/gates; stay .grok only)
    mkdir -p "$target/.grok/hooks"
    cat > "$target/.grok/hooks/session-start-excellence.json" << 'GROKHOOK1'
{
  "hooks": {
    "SessionStart": [
      {
        "command": "echo 'ACOS excellence mode active. Read CLAUDE.md/AGENTS.md/AGENTS.md/SIP.md first (deeper wins). Shared .claude catalog active. MCPs (github/fs-starlight/git) ready. Use multi-harness-orchestrator + repo-mastery + excellence-review + harness-integration. Gates: verification-loop/santa-method/qa/cso/plan-reviews/gstack before ship. Grok .grok personal excellence seeds (excellence gates) opt-in only.'"
      }
    ]
  }
}
GROKHOOK1
    success "Seeded .grok/hooks/session-start-excellence.json (grok-personal)"

    cat > "$target/.grok/hooks/pretooluse-excellence.json" << 'GROKHOOK2'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit|Bash",
        "command": "echo 'Excellence gate: rules first? DNA? multi-orchestrator? repo-mastery context? harnesses via terminal? gstack/santa if web? Review before proceed. Grok .grok personal excellence seeds only.'"
      }
    ]
  }
}
GROKHOOK2
    success "Seeded .grok/hooks/pretooluse-excellence.json (grok-personal)"

    # Note: core seeds (e.g. gstack base patterns) come from ACOS .claude/skills junctions; grok-personal seeds only as above. Use /sip-share-audit before cross moves. Update AGENTS.md tags. SIP attest required.

    # Seed hooks (executable, trust via /hooks-trust in Grok)
    cat > "$target/.grok/hooks/session-start-excellence.sh" << GROKHOOK1
#!/usr/bin/env bash
# ACOS Grok: excellence + repo-mastery auto on SessionStart
echo "🧬 ACOS Grok Excellence v${VERSION:-10+} — repo-mastery + harness-integration + gstack gates + santa/verification loaded. Read GROK.md / CLAUDE.md first. excellence standards."
# Can call grok /skills harness-integration etc.
GROKHOOK1
    chmod +x "$target/.grok/hooks/session-start-excellence.sh" 2>/dev/null || true
    success "Seeded .grok/hooks/session-start-excellence.sh"

    cat > "$target/.grok/hooks/pre-tool-gate.sh" << 'GROKHOOK2'
#!/usr/bin/env bash
# ACOS Grok PreToolUse gate: rules + excellence reminder
echo "⚡ Gate: Read rules (GROK.md/CLAUDE.md)? Excellence (repo-mastery → verification/santa/gstack) engaged for this action?"
GROKHOOK2
    chmod +x "$target/.grok/hooks/pre-tool-gate.sh" 2>/dev/null || true
    success "Seeded .grok/hooks/pre-tool-gate.sh (user must /hooks-trust)"

    # Generate primary GROK.md (project context + full briefing)
    generate_context_file "grok" "$target"

    # Also ensure AGENTS.md alias for Grok scan (if not present, symlink or copy note)
    if [ ! -f "$target/AGENTS.md" ] && [ ! -L "$target/AGENTS.md" ]; then
        # Grok scans AGENTS.md explicitly; create a pointer
        cat > "$target/AGENTS.md" << 'AGENTSEOF'
# See GROK.md and CLAUDE.md for full ACOS + Grok harness instructions.
# Grok reads this + deeper rules files. Prefer editing GROK.md for Grok-specific.
# (Run ./install.sh --platform=grok to (re)generate GROK.md + .grok/ grok-personal seeds.)
AGENTSEOF
        success "Created AGENTS.md pointer (Grok scans it natively)"
    fi

    # Optional: also seed minimal agents/ for subagent personas
    cat > "$target/.grok/agents/acos-excellence.md" << 'GROKAGENT'
---
name: ACOS Excellence Reviewer
role: Applies excellence standards using repo-mastery, santa-method, verification-loop, gstack QA, plan reviews
---
You are the ACOS excellence subagent. Never allow shipping without full gate evidence.
GROKAGENT
    success "Seeded .grok/agents/acos-excellence.md (subagent ready)"

    # State for Grok
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    cat > "$target/.grok/acos-state.json" << STATEEOF
{
  "version": "${VERSION:-10.1.0}",
  "platform": "grok",
  "adapter": "grok-harness-adapter",
  "installedAt": "$timestamp",
  "features": {
    "grokNative": true,
    "skills": true,
    "agentsSubagents": true,
    "hooks": true,
    "claudeCompat": true,
    "excellenceGates": true,
    "gstackQA": true,
    "repoMastery": true,
    "multiHarness": true
  },
  "seeds": ["harness-integration", "excellence-review", "repo-mastery", "multi-harness-orchestrator"],
  "note": "Run 'grok' in this dir; trust hooks with /hooks-trust; skills auto or /skills <name>"
}
STATEEOF
    success "Grok ACOS state written to .grok/acos-state.json"

    # Also copy core ACOS skills into project .grok/skills if --full (namespace to avoid collision)
    if [ "$mode" = "full" ] && [ -d "$PROJECT_DIR/.claude/skills" ]; then
        step "Full mode: seeding ACOS skills into .grok/skills/acos-* (project local)"
        local gskill_count=0
        for skill_dir in "$PROJECT_DIR/.claude/skills"/*/; do
            [ -d "$skill_dir" ] || continue
            local sname=$(basename "$skill_dir")
            [ "$sname" = "CLAUDE.md" ] && continue
            mkdir -p "$target/.grok/skills/acos-$sname"
            cp -r "$skill_dir"* "$target/.grok/skills/acos-$sname/" 2>/dev/null || true
            gskill_count=$((gskill_count + 1))
        done
        success "Full: mirrored $gskill_count ACOS skills as acos-* in .grok/skills/"
    fi

    success "Grok full harness install complete. Open with: grok   (then /hooks-trust; /skills harness-integration)"
    echo "  [verify] .grok/seeds: $(ls $target/.grok/skills/ 2>/dev/null | tr '\n' ' '); hooks: $(ls $target/.grok/hooks/ 2>/dev/null | tr '\n' ' '); GROK.md + AGENTS.md + .grok/acos-state.json present. grok-personal 4+2 only. No .claude leak."
}

# ── Antigravity/AGY Scaffold Proposal (5-fleet parity, no file create here; update to full like SIS harnesses/antigravity + .antigravity/ seeds on demand) ─
# Per task: ACOS checks show no harnesses/ dir (SIS has core/orchestrator/harnesses/{claude,codex,gemini,opencode,antigravity,grok}/ + README/system/mcp/allowlist) and no .antigravity/ seeds yet.
# Proposal (minimal reversible, via this stub only; prefer edit install over new files): if --platform=antigravity, print scaffold plan + minimal file contents for user to apply.
# Would create: .antigravity/instructions.md (core+personal), .antigravity/swarm-96-minds-protocol.md (if swarm), .antigravity/mcp-config.json, .antigravity/allowlisted-tools.md, harnesses/antigravity/ (for ACOS-local if needed, like SIS).
# For now delegates via multi-harness-orchestrator (agy junctions ~/.antigravity or ~/.gemini/config/plugins/acos-frankx/ per claude-code-config hooks). Matches SIS 2026-06-02 agy/grok enhancement. excellence standards, small rev.
install_antigravity_propose() {
    local mode="${1:-standard}"
    local target="${2:-.}"
    log "ACOS Antigravity/AGY parity scaffold (5-harness fleet + grok-personal + gstack/SIP to match SIS level)..."
    local antidir="$target/.antigravity"
    local harnessdir="$target/harnesses/antigravity"
    mkdir -p "$antidir" "$harnessdir"

    cat > "$antidir/instructions.md" << 'EOM'
# Antigravity (AGY) instructions — ACOS parity
Sovereign mandate + ACOS catalog + CREATOR.md identity contract + core/personal filter (see repo doctrine).
Core via .claude junctions; grok-personal .grok/agy only for the layer.
Delegate from other harnesses via multi-harness-orchestrator.
Built on SIP v1.1.1. gstack for QA. 2026-06-02 upgrade.
EOM

    cat > "$antidir/mcp-config.json" << 'EOM'
{
  "mcpServers": {
    "starlight": { "command": "npx", "args": ["@modelcontextprotocol/server-filesystem", "$HOME/starlight"] },
    "github": { "command": "npx", "args": ["@modelcontextprotocol/server-github"] }
  }
}
EOM

    cat > "$antidir/allowlisted-tools.md" << 'EOM'
# AGY allowlisted tools (ACOS parity)
- read, write (with excellence gate)
- terminal (restricted)
- mcp (github, fs-starlight)
- subagents + excellence-review hooks
Escalation: /starlight-board for substrate.
EOM

    cat > "$harnessdir/README.md" << 'EOM'
# Antigravity harness (ACOS/SIS parity)
Junctions for ACOS skills. Use with agy CLI.
See ../grok for sibling pattern.
EOM

    cat > "$harnessdir/system-prompt.md" << 'EOM'
You are running under ACOS via Antigravity. Embody CREATOR.md identity contract. Use core catalog + personal-creative where tagged. Grok-personal stays .grok only.
EOM

    success "Minimal .antigravity/ + harnesses/antigravity/ scaffold created (reversible: rm -rf .antigravity harnesses/antigravity if undesired). Review files, commit or discard. Matches SIS level for agy/grok beyond SIS."
    # Note: small reversible; proposal now scaffolded on demand.
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
        grok)      output_file="$target_dir/GROK.md" ;;  # + .grok/ seeds handled in install_grok
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
        grok)
            install_grok "$mode" "$target"
            ;;
        antigravity|agy)
            install_antigravity_propose "$mode" "$target"
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

    if [[ "$platforms" == *"grok"* ]]; then
        echo -e "  ${YELLOW}Grok Build (xAI CLI/TUI):${NC}"
        echo "    1. cd to project with GROK.md + .grok/"
        echo "    2. Run: grok"
        echo "    3. /hooks-trust   (for lifecycle hooks)"
        echo "    4. /skills harness-integration   or describe ACOS tasks"
        echo "    5. Excellence: repo-mastery + gstack + santa/verification auto-suggested (via .grok seeds + .claude compat)"
        echo "    Note: adapter/grok/index.ts + install.sh keep seeds in sync; 4 grok-personal only in .grok/"
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
