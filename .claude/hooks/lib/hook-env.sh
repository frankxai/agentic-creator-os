#!/bin/bash
# lib/hook-env.sh
# Portable hook environment for multi-harness compatibility.
# Harnesses: claude, codex, gemini, agy, grok
# Provides: HARNESS detection, portable PROJECT_ROOT, *_DIR vars, path helpers,
# generic logging, project naming, and stubs for new events (PreCompact, Notification).
#
# Usage: source "$(dirname "$0")/lib/hook-env.sh"
# Then: use $HARNESS, $PROJECT_ROOT, log_to_sessions etc.
#
# God 99: portable, no hardcodes, excellence wired (calls excellence hook if present).
# Use gstack for any UI verification (via excellence skills if UI changes).

# --- Harness Detection (portable, env + dir + cmd heuristics) ---
detect_harness() {
  # Priority: explicit env from harness runtime
  if [ -n "${CLAUDE_PROJECT_DIR:-}" ] || [ -n "${CLAUDE_SESSION_ID:-}" ] || [ -n "${CLAUDECODE:-}" ] || [ -n "${ANTHROPIC_API_KEY:-}" ]; then
    echo "claude"
    return
  fi
  if [ -n "${CODEX_SESSION:-}" ] || [ -n "${CODEX_PROJECT_DIR:-}" ] || command -v codex >/dev/null 2>&1; then
    echo "codex"
    return
  fi
  if [ -n "${GEMINI_CLI:-}" ] || [ -n "${GEMINI_API_KEY:-}" ] || [ -d "${HOME}/.gemini" ] || command -v gemini >/dev/null 2>&1; then
    echo "gemini"
    return
  fi
  if [ -n "${AGY_SESSION:-}" ] || [ -n "${ANTIGRAVITY_SESSION:-}" ] || [ -d "${HOME}/.antigravity" ] || [ -d "${HOME}/.agy" ]; then
    echo "agy"
    return
  fi
  if [ -n "${GROK_SESSION:-}" ] || [ -n "${GROK_CLI:-}" ] || [ -d "${HOME}/.grok" ] || [ -n "${XAI_API_KEY:-}" ] || command -v grok >/dev/null 2>&1; then
    echo "grok"
    return
  fi
  # Fallback from argv if shell invoked with context (rare for hooks)
  if echo "$0 $*" | grep -qiE 'grok|xai'; then echo "grok"; return; fi
  if echo "$0 $*" | grep -qiE 'codex'; then echo "codex"; return; fi
  echo "unknown"
}

HARNESS="$(detect_harness)"
export HARNESS

# --- Portable Paths (cross-OS, WSL friendly, overrideable) ---
# Resolve real user home (handles sudo / wsl)
resolve_home() {
  if [ -n "${REAL_HOME:-}" ]; then
    echo "$REAL_HOME"
  else
    echo "${HOME}"
  fi
}
HOME_DIR="$(resolve_home)"

# Windows docs dir auto-detect for WSL (portable sessions log)
detect_docs_dir() {
  local docs="${AI_GLOBAL_SESSIONS:-}"
  if [ -n "$docs" ]; then
    echo "$docs"
    return
  fi
  if [ -d "/mnt/c/Users" ]; then
    local winuser
    winuser=$(cmd.exe /c "echo %USERNAME%" 2>/dev/null | tr -d '\r\n' || echo "Frank")
    echo "/mnt/c/Users/${winuser}/docs/AI_GLOBAL_SESSIONS.md"
  else
    echo "${HOME_DIR}/docs/AI_GLOBAL_SESSIONS.md"
  fi
}

AI_SESSIONS_LOG="$(detect_docs_dir)"
export AI_SESSIONS_LOG

# Project root: prefer harness env, git, cwd
detect_project_root() {
  local root="${CLAUDE_PROJECT_DIR:-}"
  [ -z "$root" ] && root="${CODEX_PROJECT_DIR:-}"
  [ -z "$root" ] && root="${GROK_PROJECT_DIR:-}"
  [ -z "$root" ] && root="${AGY_PROJECT_DIR:-}"
  if [ -z "$root" ] && command -v git >/dev/null 2>&1; then
    root=$(git rev-parse --show-toplevel 2>/dev/null || true)
  fi
  [ -z "$root" ] && root="$(pwd)"
  echo "$root"
}

PROJECT_ROOT="$(detect_project_root)"
export PROJECT_ROOT

# Harness-specific global dirs (with claude compat fallback for skills)
case "$HARNESS" in
  claude)
    GLOBAL_HOOKS_DIR="${HOME_DIR}/.claude/hooks"
    GLOBAL_SKILLS_DIR="${HOME_DIR}/.claude/skills"
    GLOBAL_AGENTS_DIR="${HOME_DIR}/.claude/agents"
    ;;
  grok)
    GLOBAL_HOOKS_DIR="${HOME_DIR}/.grok/hooks"
    GLOBAL_SKILLS_DIR="${HOME_DIR}/.grok/skills:${HOME_DIR}/.claude/skills"  # compat
    GLOBAL_AGENTS_DIR="${HOME_DIR}/.grok/agents:${HOME_DIR}/.claude/agents"
    # Grok JSON hooks support (SessionStart/PreToolUse excellence gates are .json)
    GROK_JSON_HOOKS=1
    export GROK_JSON_HOOKS
    ;;
  codex)
    GLOBAL_HOOKS_DIR="${HOME_DIR}/.codex/hooks"
    GLOBAL_SKILLS_DIR="${HOME_DIR}/.codex/skills:${HOME_DIR}/.claude/skills"
    GLOBAL_AGENTS_DIR="${HOME_DIR}/.codex/agents"
    ;;
  gemini)
    GLOBAL_HOOKS_DIR="${HOME_DIR}/.gemini/hooks"
    GLOBAL_SKILLS_DIR="${HOME_DIR}/.gemini/skills:${HOME_DIR}/.claude/skills"
    GLOBAL_AGENTS_DIR="${HOME_DIR}/.gemini/agents"
    ;;
  agy)
    GLOBAL_HOOKS_DIR="${HOME_DIR}/.antigravity/hooks:${HOME_DIR}/.agy/hooks"
    GLOBAL_SKILLS_DIR="${HOME_DIR}/.antigravity/skills:${HOME_DIR}/.claude/skills"
    GLOBAL_AGENTS_DIR="${HOME_DIR}/.antigravity/agents"
    ;;
  *)
    GLOBAL_HOOKS_DIR="${HOME_DIR}/.claude/hooks"
    GLOBAL_SKILLS_DIR="${HOME_DIR}/.claude/skills"
    GLOBAL_AGENTS_DIR="${HOME_DIR}/.claude/agents"
    ;;
esac
export GLOBAL_HOOKS_DIR GLOBAL_SKILLS_DIR GLOBAL_AGENTS_DIR

# Local project dirs (relative to PROJECT_ROOT)
PROJECT_HOOKS_DIR="${PROJECT_ROOT}/.claude/hooks"
PROJECT_SKILLS_DIR="${PROJECT_ROOT}/.claude/skills"
export PROJECT_HOOKS_DIR PROJECT_SKILLS_DIR

# --- Generic Project Name (agnostic, no frankx hardcodes) ---
get_project_name() {
  local name
  name="$(basename "$PROJECT_ROOT")"
  # Optional light mapping for known (can be extended)
  case "$name" in
    FrankX|frankx) name="FrankX" ;;
    agentic-creator-os|ACOS) name="ACOS" ;;
    arcanea*) name="Arcanea" ;;
  esac
  echo "$name"
}

PROJECT_NAME="$(get_project_name)"
export PROJECT_NAME

# --- Logging / Excellence Wiring ---
log_hook_activation() {
  local hook_name="${1:-unknown}"
  local event="${2:-${CLAUDE_HOOK_EVENT:-UserPromptSubmit}}"
  local ts
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  # append to sessions if exists
  if [ -n "$AI_SESSIONS_LOG" ] && [ -f "$AI_SESSIONS_LOG" ]; then
    echo "- [${ts}] hook:${hook_name} harness:${HARNESS} event:${event} project:${PROJECT_NAME}" >> "$AI_SESSIONS_LOG" 2>/dev/null || true
  fi
  # wire excellence if present (call excellence hook or skill non-blocking)
  local exc_sh="${GLOBAL_HOOKS_DIR}/excellence-hook.sh"
  if [ -x "$exc_sh" ]; then
    "$exc_sh" "$hook_name" "$event" >/dev/null 2>&1 &
  fi
}

# Generic session log append (used by session-logger etc)
append_session_log() {
  local content="$1"
  if [ -n "$AI_SESSIONS_LOG" ]; then
    mkdir -p "$(dirname "$AI_SESSIONS_LOG")" 2>/dev/null || true
    echo "$content" >> "$AI_SESSIONS_LOG" 2>/dev/null || true
  fi
}

# --- New Event Stubs (PreCompact / Notification) ---
# These can be sourced or the stub files can call them.
handle_precompact() {
  local input="${1:-}"
  log_hook_activation "pre-compact" "PreCompact"
  # Default: allow compact, optionally inject summary hint via stdout json if needed
  # For claude-like: echo '{"hookSpecificOutput":{"hookEventName":"PreCompact","additionalContext":"..."}}'
  echo "$input"
}

handle_notification() {
  local input="${1:-}"
  log_hook_activation "notification" "Notification"
  echo "$input"
}

# --- Hook Input Helpers (stdin json friendly) ---
read_hook_input() {
  # Read all stdin safely (with size guard)
  local max=1048576
  local raw=""
  local chunk
  while IFS= read -r -n 4096 chunk; do
    raw+="$chunk"
    if [ ${#raw} -gt $max ]; then break; fi
  done
  echo "$raw"
}

# --- Init: log that env loaded (for debug) ---
# comment to reduce noise: log_hook_activation "hook-env" "env-loaded"

# End of hook-env.sh (portable excellence base)
