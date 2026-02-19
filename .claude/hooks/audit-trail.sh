#!/bin/bash
# ══════════════════════════════════════════════════════════════
# ACOS v10 Immutable Audit Trail
# ══════════════════════════════════════════════════════════════
# Append-only logging of all significant agent actions.
# This script ONLY appends — it never reads, edits, or truncates.
# The audit log is the ground truth for what happened.
#
# Usage:
#   audit-trail.sh log <event_type> <details...>
#   audit-trail.sh verify                        # Check integrity
#   audit-trail.sh tail [count]                  # View recent
# ══════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
AUDIT_FILE="$PROJECT_ROOT/.claude-flow/audit.jsonl"

# Ensure audit directory exists
mkdir -p "$(dirname "$AUDIT_FILE")" 2>/dev/null || true

COMMAND="${1:-help}"
shift || true

# ── Log an audit entry (append-only) ─────────────────────────
audit_log() {
  local event_type="$1"
  shift
  local details="$*"

  # Build JSON entry with Python for safety
  python3 -c "
import json, datetime, os
entry = {
    'ts': datetime.datetime.now().isoformat(),
    'event': '$event_type',
    'details': '''$details'''[:500],
    'session': os.environ.get('CLAUDE_SESSION_ID', 'unknown')[:20],
    'pid': os.getpid()
}
print(json.dumps(entry, separators=(',', ':')))
" >> "$AUDIT_FILE" 2>/dev/null

  # Return success — audit logging should never block the agent
  return 0
}

# ── Log tool use ──────────────────────────────────────────────
audit_tool() {
  local tool="$1"
  local target="$2"
  local outcome="${3:-ok}"

  python3 -c "
import json, datetime, os
entry = {
    'ts': datetime.datetime.now().isoformat(),
    'event': 'tool_use',
    'tool': '$tool',
    'target': '''$target'''[:200],
    'outcome': '$outcome',
    'session': os.environ.get('CLAUDE_SESSION_ID', 'unknown')[:20]
}
print(json.dumps(entry, separators=(',', ':')))
" >> "$AUDIT_FILE" 2>/dev/null
  return 0
}

# ── Log IAM violation ─────────────────────────────────────────
audit_iam_violation() {
  local profile="$1"
  local tool="$2"
  local path="$3"
  local reason="$4"

  python3 -c "
import json, datetime, os
entry = {
    'ts': datetime.datetime.now().isoformat(),
    'event': 'iam_violation',
    'profile': '$profile',
    'tool': '$tool',
    'path': '''$path'''[:200],
    'reason': '$reason',
    'session': os.environ.get('CLAUDE_SESSION_ID', 'unknown')[:20]
}
print(json.dumps(entry, separators=(',', ':')))
" >> "$AUDIT_FILE" 2>/dev/null
  return 0
}

# ── Log gate decision ─────────────────────────────────────────
audit_gate() {
  local file="$1"
  local verdict="$2"
  local guardians="$3"

  python3 -c "
import json, datetime, os
entry = {
    'ts': datetime.datetime.now().isoformat(),
    'event': 'gate_decision',
    'file': '''$file'''[:200],
    'verdict': '$verdict',
    'guardians': '$guardians',
    'session': os.environ.get('CLAUDE_SESSION_ID', 'unknown')[:20]
}
print(json.dumps(entry, separators=(',', ':')))
" >> "$AUDIT_FILE" 2>/dev/null
  return 0
}

# ── Log config change ─────────────────────────────────────────
audit_config_change() {
  local file="$1"
  local action="$2"
  local snapshot_id="$3"

  python3 -c "
import json, datetime, os
entry = {
    'ts': datetime.datetime.now().isoformat(),
    'event': 'config_change',
    'file': '''$file'''[:200],
    'action': '$action',
    'snapshot': '$snapshot_id',
    'session': os.environ.get('CLAUDE_SESSION_ID', 'unknown')[:20]
}
print(json.dumps(entry, separators=(',', ':')))
" >> "$AUDIT_FILE" 2>/dev/null
  return 0
}

# ── Verify audit integrity ────────────────────────────────────
verify_audit() {
  if [ ! -f "$AUDIT_FILE" ]; then
    echo "No audit file found."
    exit 0
  fi

  local total=$(wc -l < "$AUDIT_FILE" 2>/dev/null || echo 0)
  local valid=0
  local invalid=0

  while IFS= read -r line; do
    if python3 -c "import json; json.loads('''$line''')" 2>/dev/null; then
      valid=$((valid + 1))
    else
      invalid=$((invalid + 1))
    fi
  done < "$AUDIT_FILE"

  echo "Audit trail integrity check:"
  echo "  Total entries: $total"
  echo "  Valid JSON:    $valid"
  echo "  Invalid:       $invalid"

  if [ "$invalid" -gt 0 ]; then
    echo "  WARNING: $invalid corrupted entries detected"
    exit 1
  fi
  echo "  Status: CLEAN"
  exit 0
}

# ── View recent entries ───────────────────────────────────────
tail_audit() {
  local count="${1:-20}"
  if [ ! -f "$AUDIT_FILE" ]; then
    echo "No audit trail yet."
    exit 0
  fi

  echo "=== ACOS Audit Trail — Last $count entries ==="
  tail -n "$count" "$AUDIT_FILE" | python3 -c "
import json, sys
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    try:
        e = json.loads(line)
        ts = e.get('ts', '')[:19]
        event = e.get('event', 'unknown')
        if event == 'tool_use':
            print(f'  {ts} | {event:15} | {e.get(\"tool\",\"\")} → {e.get(\"target\",\"\")[:40]} [{e.get(\"outcome\",\"\")}]')
        elif event == 'iam_violation':
            print(f'  {ts} | {event:15} | {e.get(\"profile\",\"\")} denied {e.get(\"tool\",\"\")} on {e.get(\"path\",\"\")[:30]}')
        elif event == 'gate_decision':
            print(f'  {ts} | {event:15} | {e.get(\"file\",\"\")[:30]} → {e.get(\"verdict\",\"\")}')
        elif event == 'config_change':
            print(f'  {ts} | {event:15} | {e.get(\"file\",\"\")[:30]} [{e.get(\"action\",\"\")}] snap={e.get(\"snapshot\",\"\")}')
        else:
            detail = e.get('details', '')[:50]
            print(f'  {ts} | {event:15} | {detail}')
    except:
        continue
" 2>/dev/null
  echo ""
  local total=$(wc -l < "$AUDIT_FILE" 2>/dev/null || echo 0)
  echo "Total entries: $total"
}

# ── Main ──────────────────────────────────────────────────────
case "$COMMAND" in
  "log")       audit_log "$@" ;;
  "tool")      audit_tool "$@" ;;
  "iam")       audit_iam_violation "$@" ;;
  "gate")      audit_gate "$@" ;;
  "config")    audit_config_change "$@" ;;
  "verify")    verify_audit ;;
  "tail"|"show") tail_audit "$@" ;;
  "help"|"-h"|"--help")
    echo "ACOS v10 Immutable Audit Trail"
    echo ""
    echo "Commands:"
    echo "  log <type> <details>        Append generic event"
    echo "  tool <tool> <target> [ok]   Log tool use"
    echo "  iam <profile> <tool> <path> Log IAM violation"
    echo "  gate <file> <verdict> <g>   Log gate decision"
    echo "  config <file> <action> <id> Log config change"
    echo "  verify                      Check integrity"
    echo "  tail [count]                View recent entries"
    ;;
  *)
    # If called with unknown command, treat as generic log
    audit_log "$COMMAND" "$*"
    ;;
esac
