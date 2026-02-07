#!/bin/bash
# ACOS Swarm Communication Hooks - Adapted from Claude Flow V3
# Agent messaging, pattern broadcasting, consensus, task handoffs

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
SWARM_DIR="$PROJECT_ROOT/.claude-flow/swarm"
MESSAGES_DIR="$SWARM_DIR/messages"
PATTERNS_DIR="$SWARM_DIR/patterns"
CONSENSUS_DIR="$SWARM_DIR/consensus"
HANDOFFS_DIR="$SWARM_DIR/handoffs"
AGENTS_FILE="$SWARM_DIR/agents.json"
STATS_FILE="$SWARM_DIR/stats.json"

AGENT_ID="${AGENTIC_FLOW_AGENT_ID:-agent_$(date +%s)_$$}"
AGENT_NAME="${AGENTIC_FLOW_AGENT_NAME:-claude-code}"

mkdir -p "$MESSAGES_DIR" "$PATTERNS_DIR" "$CONSENSUS_DIR" "$HANDOFFS_DIR"

init_stats() {
  if [ ! -f "$STATS_FILE" ]; then
    cat > "$STATS_FILE" << EOF
{
  "messagesSent": 0,
  "messagesReceived": 0,
  "patternsBroadcast": 0,
  "consensusInitiated": 0,
  "handoffsInitiated": 0,
  "lastUpdated": "$(date -Iseconds)"
}
EOF
  fi
}

register_agent() {
  init_stats
  local timestamp=$(date +%s)
  if [ ! -f "$AGENTS_FILE" ]; then
    echo '{"agents":[]}' > "$AGENTS_FILE"
  fi
  if command -v jq &>/dev/null; then
    local exists=$(jq -r ".agents[] | select(.id == \"$AGENT_ID\") | .id" "$AGENTS_FILE" 2>/dev/null || echo "")
    if [ -z "$exists" ]; then
      jq ".agents += [{\"id\":\"$AGENT_ID\",\"name\":\"$AGENT_NAME\",\"status\":\"active\",\"lastSeen\":$timestamp}]" "$AGENTS_FILE" > "$AGENTS_FILE.tmp" && mv "$AGENTS_FILE.tmp" "$AGENTS_FILE"
    fi
  fi
}

# Agent messaging
send_message() {
  local to="${1:-*}"
  local content="${2:-}"
  local msg_type="${3:-context}"
  local msg_id="msg_$(date +%s)_$$"
  local msg_file="$MESSAGES_DIR/$msg_id.json"
  cat > "$msg_file" << EOF
{
  "id": "$msg_id",
  "from": "$AGENT_ID",
  "fromName": "$AGENT_NAME",
  "to": "$to",
  "type": "$msg_type",
  "content": "$(echo "$content" | head -c 500)",
  "timestamp": $(date +%s),
  "read": false
}
EOF
  echo "$msg_id"
  exit 0
}

get_messages() {
  local limit="${1:-10}"
  register_agent
  local count=0
  for msg_file in $(ls -t "$MESSAGES_DIR"/*.json 2>/dev/null | head -n "$limit"); do
    if [ -f "$msg_file" ]; then
      count=$((count + 1))
    fi
  done
  echo "{\"count\": $count}"
  exit 0
}

# Pattern broadcasting
broadcast_pattern() {
  local strategy="${1:-}"
  local domain="${2:-general}"
  local quality="${3:-0.7}"
  local bc_id="bc_$(date +%s)_$$"
  local bc_file="$PATTERNS_DIR/$bc_id.json"
  cat > "$bc_file" << EOF
{
  "id": "$bc_id",
  "sourceAgent": "$AGENT_ID",
  "pattern": {"strategy": "$(echo "$strategy" | head -c 500)", "domain": "$domain", "quality": $quality},
  "broadcastTime": $(date +%s)
}
EOF
  # Also store in learning
  if [ -f "$SCRIPT_DIR/learning-hooks.sh" ]; then
    bash "$SCRIPT_DIR/learning-hooks.sh" store "$strategy" "$domain" "$quality" 2>/dev/null || true
  fi
  echo "{\"broadcastId\":\"$bc_id\"}"
  exit 0
}

# Task handoff
initiate_handoff() {
  local to_agent="$1"
  local description="${2:-}"
  local ho_id="ho_$(date +%s)_$$"
  local ho_file="$HANDOFFS_DIR/$ho_id.json"
  cat > "$ho_file" << EOF
{
  "id": "$ho_id",
  "fromAgent": "$AGENT_ID",
  "fromAgentName": "$AGENT_NAME",
  "toAgent": "$to_agent",
  "description": "$(echo "$description" | head -c 500)",
  "status": "pending",
  "timestamp": $(date +%s)
}
EOF
  echo "{\"handoffId\":\"$ho_id\",\"status\":\"pending\"}"
  exit 0
}

# Swarm status for hooks
get_agents() {
  register_agent
  if [ -f "$AGENTS_FILE" ]; then
    cat "$AGENTS_FILE"
  else
    echo '{"agents":[]}'
  fi
  exit 0
}

get_stats() {
  init_stats
  cat "$STATS_FILE"
  exit 0
}

# Pre-task swarm context (for hook integration)
pre_task_swarm_context() {
  register_agent
  local handoff_count=$(ls "$HANDOFFS_DIR"/*.json 2>/dev/null | wc -l)
  local msg_count=$(ls "$MESSAGES_DIR"/*.json 2>/dev/null | wc -l)
  if [ "$handoff_count" -gt 0 ] || [ "$msg_count" -gt 0 ]; then
    echo "Swarm: $handoff_count pending handoffs, $msg_count messages"
  fi
  exit 0
}

post_task_swarm_update() {
  local task="${1:-}"
  local success="${2:-true}"
  if [ "$success" = "true" ] && [ -n "$task" ]; then
    send_message "*" "Completed: $(echo "$task" | head -c 100)" "result" >/dev/null 2>&1 || true
  fi
  exit 0
}

case "${1:-help}" in
  "send") send_message "${2:-*}" "${3:-}" "${4:-context}" ;;
  "messages") get_messages "${2:-10}" ;;
  "broadcast") send_message "*" "${2:-}" "context" ;;
  "broadcast-pattern") broadcast_pattern "${2:-}" "${3:-general}" "${4:-0.7}" ;;
  "handoff") initiate_handoff "${2:-}" "${3:-}" ;;
  "agents") get_agents ;;
  "stats") get_stats ;;
  "pre-task") pre_task_swarm_context ;;
  "post-task") post_task_swarm_update "${2:-}" "${3:-true}" ;;
  "help"|"-h"|"--help")
    echo "ACOS Swarm Hooks - Agent communication and coordination"
    echo "Commands: send, messages, broadcast, broadcast-pattern, handoff, agents, stats, pre-task, post-task"
    ;;
  *) echo "Unknown: $1" >&2; exit 1 ;;
esac
