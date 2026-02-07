#!/bin/bash
# ACOS Learning Hooks - Adapted from Claude Flow V3
# Pattern storage, search, and session consolidation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
LEARNING_DIR="$PROJECT_ROOT/.claude-flow/learning"
METRICS_DIR="$PROJECT_ROOT/.claude-flow/metrics"
TRAJECTORIES_DIR="$PROJECT_ROOT/.claude/trajectories"

mkdir -p "$LEARNING_DIR" "$METRICS_DIR" "$TRAJECTORIES_DIR"

generate_session_id() {
  echo "session_$(date +%Y%m%d_%H%M%S)_$$"
}

# =============================================================================
# Session Start
# =============================================================================
session_start() {
  local session_id="${1:-$(generate_session_id)}"

  # Count existing trajectories
  local traj_count=$(ls "$TRAJECTORIES_DIR"/*.json 2>/dev/null | grep -v '_active\|_operations\|patterns' | wc -l)
  local patterns_count=0
  if [ -f "$TRAJECTORIES_DIR/patterns.json" ]; then
    patterns_count=$(cat "$TRAJECTORIES_DIR/patterns.json" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
  fi

  # Calculate avg success
  local avg_success="0"
  if [ "$traj_count" -gt 0 ]; then
    avg_success=$(cat "$TRAJECTORIES_DIR"/*.json 2>/dev/null | grep -o '"successScore":[0-9.]*' | awk -F: '{s+=$2;c++} END{if(c>0) printf "%.0f", s/c*100; else print "0"}' 2>/dev/null || echo "0")
  fi

  echo "$session_id" > "$LEARNING_DIR/current-session-id"

  cat > "$METRICS_DIR/learning-status.json" << EOF
{
  "sessionId": "$session_id",
  "initialized": true,
  "trajectories": $traj_count,
  "patterns": $patterns_count,
  "avgSuccess": "$avg_success%",
  "timestamp": "$(date -Iseconds)"
}
EOF

  echo "Learning initialized: $traj_count trajectories, $patterns_count patterns, ${avg_success}% avg success"
  exit 0
}

# =============================================================================
# Session End
# =============================================================================
session_end() {
  local session_id=""
  if [ -f "$LEARNING_DIR/current-session-id" ]; then
    session_id=$(cat "$LEARNING_DIR/current-session-id")
  fi

  # Count final stats
  local traj_count=$(ls "$TRAJECTORIES_DIR"/*.json 2>/dev/null | grep -v '_active\|_operations\|patterns' | wc -l)

  cat > "$METRICS_DIR/learning-final-stats.json" << EOF
{
  "sessionId": "$session_id",
  "totalTrajectories": $traj_count,
  "finalizedAt": "$(date -Iseconds)"
}
EOF

  rm -f "$LEARNING_DIR/current-session-id"
  echo "Learning session ended: $traj_count total trajectories"
  exit 0
}

# =============================================================================
# Store Pattern
# =============================================================================
store_pattern() {
  local strategy="$1"
  local domain="${2:-general}"
  local quality="${3:-0.7}"

  [ -z "$strategy" ] && exit 1

  local pattern_file="$LEARNING_DIR/pattern_$(date +%s).json"
  cat > "$pattern_file" << EOF
{
  "strategy": "$strategy",
  "domain": "$domain",
  "quality": $quality,
  "timestamp": "$(date -Iseconds)"
}
EOF

  echo "Pattern stored: $domain ($quality quality)"
  exit 0
}

# =============================================================================
# Search Patterns
# =============================================================================
search_patterns() {
  local query="$1"
  local k="${2:-3}"

  [ -z "$query" ] && exit 1

  local count=0
  echo "{"
  echo "  \"query\": \"$query\","
  echo "  \"results\": ["

  for pattern_file in $(ls -t "$LEARNING_DIR"/pattern_*.json 2>/dev/null | head -n "$k"); do
    if [ -f "$pattern_file" ] && grep -qi "$query" "$pattern_file" 2>/dev/null; then
      [ $count -gt 0 ] && echo ","
      cat "$pattern_file"
      count=$((count + 1))
    fi
  done

  echo "  ],"
  echo "  \"count\": $count"
  echo "}"
  exit 0
}

# =============================================================================
# Stats
# =============================================================================
get_stats() {
  local traj_count=$(ls "$TRAJECTORIES_DIR"/*.json 2>/dev/null | grep -v '_active\|_operations\|patterns' | wc -l)
  local pattern_count=$(ls "$LEARNING_DIR"/pattern_*.json 2>/dev/null | wc -l)

  cat << EOF
{
  "trajectories": $traj_count,
  "storedPatterns": $pattern_count,
  "learningDir": "$LEARNING_DIR",
  "timestamp": "$(date -Iseconds)"
}
EOF
  exit 0
}

# =============================================================================
# Main
# =============================================================================
case "${1:-help}" in
  "session-start"|"start") session_start "$2" ;;
  "session-end"|"end") session_end ;;
  "store") store_pattern "$2" "$3" "$4" ;;
  "search") search_patterns "$2" "$3" ;;
  "stats") get_stats ;;
  "help"|"-h"|"--help")
    echo "ACOS Learning Hooks"
    echo "Usage: learning-hooks.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  session-start [id]  Initialize learning"
    echo "  session-end         Consolidate session"
    echo "  store <strategy>    Store pattern"
    echo "  search <query> [k]  Search patterns"
    echo "  stats               Get statistics"
    ;;
  *) echo "Unknown: $1" >&2; exit 1 ;;
esac
