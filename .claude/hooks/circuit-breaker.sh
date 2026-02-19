#!/bin/bash
# ══════════════════════════════════════════════════════════════
# ACOS v10 Confidence Circuit Breaker
# ══════════════════════════════════════════════════════════════
# Tracks failure counts per file. After N failures on the same
# file, outputs a warning to Claude to try a different approach.
#
# Integration points:
# - PostToolUse (on failure): circuit-breaker.sh record <file> <tool>
# - PreToolUse: circuit-breaker.sh check <file>
# - SessionEnd: circuit-breaker.sh reset
#
# Thresholds:
#   3 failures → warn (suggest different approach)
#   5 failures → restrict (recommend skipping file)
#   8 failures → break (block further attempts)
# ══════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
BREAKER_DIR="$PROJECT_ROOT/.claude-flow/circuit-breaker"
AUDIT_SCRIPT="$SCRIPT_DIR/audit-trail.sh"

mkdir -p "$BREAKER_DIR" 2>/dev/null || true

COMMAND="${1:-help}"
shift || true

WARN_THRESHOLD=3
RESTRICT_THRESHOLD=5
BREAK_THRESHOLD=8

# ── Normalize file path to safe filename ──────────────────────
path_to_key() {
  echo "$1" | sed 's/[^a-zA-Z0-9._-]/_/g'
}

# ── Record a failure ──────────────────────────────────────────
record_failure() {
  local file="$1"
  local tool="${2:-unknown}"
  local key=$(path_to_key "$file")
  local counter_file="$BREAKER_DIR/$key"

  # Read current count
  local count=0
  if [ -f "$counter_file" ]; then
    count=$(cat "$counter_file" 2>/dev/null || echo 0)
  fi
  count=$((count + 1))

  # Write new count
  echo "$count" > "$counter_file"

  # Log to audit trail
  [ -x "$AUDIT_SCRIPT" ] && bash "$AUDIT_SCRIPT" log "circuit_breaker_record" "file=$file tool=$tool failures=$count" 2>/dev/null &

  # Output based on threshold
  if [ "$count" -ge "$BREAK_THRESHOLD" ]; then
    echo "[Circuit Breaker] BREAK: $count failures on $(basename "$file"). STOP editing this file and try a completely different approach."
  elif [ "$count" -ge "$RESTRICT_THRESHOLD" ]; then
    echo "[Circuit Breaker] RESTRICT: $count failures on $(basename "$file"). Strongly recommend skipping this file or seeking user input."
  elif [ "$count" -ge "$WARN_THRESHOLD" ]; then
    echo "[Circuit Breaker] WARN: $count failures on $(basename "$file"). Consider a different approach — read the file again, check types, or simplify."
  fi
}

# ── Check file status before edit ─────────────────────────────
check_file() {
  local file="$1"
  local key=$(path_to_key "$file")
  local counter_file="$BREAKER_DIR/$key"

  if [ ! -f "$counter_file" ]; then
    exit 0
  fi

  local count=$(cat "$counter_file" 2>/dev/null || echo 0)

  if [ "$count" -ge "$BREAK_THRESHOLD" ]; then
    echo "[Circuit Breaker] BLOCKED: $(basename "$file") has $count consecutive failures. This file is circuit-broken."
    echo "Recommended: Ask user for guidance or try a completely different approach."
    # When enforcement is on, actually block the edit
    if [ "${ACOS_GATE_ENFORCE:-false}" = "true" ]; then
      exit 2
    fi
  elif [ "$count" -ge "$RESTRICT_THRESHOLD" ]; then
    echo "[Circuit Breaker] WARNING: $(basename "$file") has $count failures. Proceed with caution."
  elif [ "$count" -ge "$WARN_THRESHOLD" ]; then
    echo "[Circuit Breaker] Note: $(basename "$file") has had $count recent failures."
  fi

  exit 0
}

# ── Record a success (resets counter) ─────────────────────────
record_success() {
  local file="$1"
  local key=$(path_to_key "$file")
  local counter_file="$BREAKER_DIR/$key"

  if [ -f "$counter_file" ]; then
    rm -f "$counter_file" 2>/dev/null
  fi
}

# ── Reset all counters (session end) ──────────────────────────
reset_all() {
  local count=$(find "$BREAKER_DIR" -type f 2>/dev/null | wc -l)
  rm -f "$BREAKER_DIR"/* 2>/dev/null || true
  echo "[Circuit Breaker] Reset $count file counters."
}

# ── Status report ─────────────────────────────────────────────
status_report() {
  echo "=== Circuit Breaker Status ==="
  local any=false
  for f in "$BREAKER_DIR"/*; do
    [ -f "$f" ] || continue
    any=true
    local count=$(cat "$f" 2>/dev/null || echo 0)
    local name=$(basename "$f")
    local level="ok"
    [ "$count" -ge "$WARN_THRESHOLD" ] && level="WARN"
    [ "$count" -ge "$RESTRICT_THRESHOLD" ] && level="RESTRICT"
    [ "$count" -ge "$BREAK_THRESHOLD" ] && level="BREAK"
    echo "  $name: $count failures [$level]"
  done
  if [ "$any" = false ]; then
    echo "  All clear — no failure counters active."
  fi
}

# ── Main ──────────────────────────────────────────────────────
case "$COMMAND" in
  "record"|"fail")    record_failure "$@" ;;
  "check")            check_file "$@" ;;
  "success"|"ok")     record_success "$@" ;;
  "reset")            reset_all ;;
  "status")           status_report ;;
  "help"|"-h"|"--help")
    echo "ACOS v10 Confidence Circuit Breaker"
    echo ""
    echo "Commands:"
    echo "  record <file> [tool]  Record a failure on file"
    echo "  check <file>          Check if file is circuit-broken"
    echo "  success <file>        Reset counter on success"
    echo "  reset                 Clear all counters"
    echo "  status                Show all active counters"
    echo ""
    echo "Thresholds: WARN=$WARN_THRESHOLD, RESTRICT=$RESTRICT_THRESHOLD, BREAK=$BREAK_THRESHOLD"
    ;;
  *) echo "Unknown command: $COMMAND" >&2; exit 1 ;;
esac
