#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ACOS TUI Dashboard & Statusline — v13.0.0
# First-Principles: Zero external deps, raw ANSI escape codes, ultra-low latency (<10ms)
# ═══════════════════════════════════════════════════════════════════════════════

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

ACOS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_FILE="$HOME/.claude/acos/state.json"

detect_harness() {
    if [ -n "$GROK_SESSION" ] || [ -n "$GROK_CLI" ]; then
        echo "Grok"
    elif [ -n "$CLAUDE_CODE" ]; then
        echo "Claude"
    elif [ -n "$GEMINI_CLI" ]; then
        echo "Gemini"
    elif [ -d "$ACOS_DIR/.antigravity" ] && [ -n "$AGY_SESSION" ]; then
        echo "Antigravity"
    else
        echo "Core/Generic"
    fi
}

get_cb_status() {
    if [ -f "$STATE_FILE" ] && command -v jq &>/dev/null; then
        local cb=$(jq -r '.features.circuitBreaker' "$STATE_FILE" 2>/dev/null)
        if [ "$cb" = "true" ]; then echo "OK"; else echo "OFF"; fi
    else
        echo "OK"
    fi
}

get_iam_profile() {
    if [ -f "$STATE_FILE" ] && command -v jq &>/dev/null; then
        jq -r '.features.agentIAM' "$STATE_FILE" 2>/dev/null || echo "default"
    else
        echo "developer"
    fi
}

audit_partition() {
    local leaks=0
    if command -v git &>/dev/null && [ -d "$ACOS_DIR/.git" ]; then
        # Audit staged and untracked files for personal tags or leaked keys
        leaks=$(git status --porcelain | grep -icE "personal|secret|key" || true)
    fi
    if [ "$leaks" -eq 0 ]; then
        echo -e "${GREEN}SECURE${NC}"
    else
        echo -e "${RED}WARN (${leaks} untracked)${NC}"
    fi
}

show_statusline() {
    local harness=$(detect_harness)
    local cb=$(get_cb_status)
    local iam=$(get_iam_profile)
    local part=$(audit_partition)
    echo -e "${CYAN}[ACOS]${NC} Harness:${BOLD}${harness}${NC} | CB:${GREEN}${cb}${NC} | IAM:${YELLOW}${iam}${NC} | Part:${part}"
}

show_dashboard() {
    clear
    echo -e "${CYAN}${BOLD}"
    echo "  ╔═════════════════════════════════════════════════════════════════════╗"
    echo "  ║                  AGENTIC CREATOR OS — DASHBOARD                     ║"
    echo "  ╚═════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    echo -e "  ${BOLD}SYSTEM STATUS:${NC}"
    echo -e "    Active Harness: $(detect_harness)"
    echo -e "    Uptime:         $(uptime | awk -F'up ' '{print $2}' | awk -F',' '{print $1}' 2>/dev/null || echo 'N/A')"
    echo -e "    CPU Usage:      $(uptime | awk -F'load average:' '{print $2}' | xargs 2>/dev/null || echo 'N/A')"
    echo ""

    echo -e "  ${BOLD}ACOS RUNTIME:${NC}"
    echo -e "    Loaded Skills:  $(find "$ACOS_DIR/.claude/skills" -maxdepth 1 -mindepth 1 -type d | wc -l 2>/dev/null || echo 0) skills"
    echo -e "    Active Agents:  $(find "$ACOS_DIR/.claude/agents" -name "*.md" | wc -l 2>/dev/null || echo 0) profiles"
    echo -e "    CB Circuit:     [$(get_cb_status)]"
    echo ""

    echo -e "  ${BOLD}SECURITY & PARTITIONS:${NC}"
    echo -ne "    Status:         "
    audit_partition
    echo -e "    Core Path:      $ACOS_DIR"
    echo -e "    Personal Dir:   $ACOS_DIR/.personal/ (Gitignored)"
    echo ""

    echo -e "  ${BOLD}ACTIVE WORKFLOWS & ROUTERS:${NC}"
    echo -e "    ${CYAN}/acos${NC}              Smart router"
    echo -e "    ${CYAN}/studio${NC}            Multimodal asset engine"
    echo -e "    ${CYAN}/article-creator${NC}   Guided publishing"
    echo ""
}

case "$1" in
    --statusline)
        show_statusline
        ;;
    --dash|*)
        show_dashboard
        ;;
esac
