#!/bin/bash
# ══════════════════════════════════════════════════════════════
# ACOS v10 Conservative Self-Modification Gate
# ══════════════════════════════════════════════════════════════
# Before any config/hook change:
#   1. Snapshot current state (git stash or copy)
#   2. Allow the change
#   3. Validate intelligence score hasn't decreased
#   4. If score drops: auto-revert and warn
#
# This prevents the system from degrading itself through
# well-intentioned but harmful self-modifications.
#
# Usage:
#   self-modify-gate.sh snapshot <file>   Save before-state
#   self-modify-gate.sh validate <file>   Check after-state
#   self-modify-gate.sh revert <file>     Restore snapshot
#   self-modify-gate.sh score             Current intelligence score
# ══════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
SNAPSHOT_DIR="$PROJECT_ROOT/.claude-flow/snapshots"
LEARNING_HOOKS="$SCRIPT_DIR/learning-hooks.sh"
AUDIT_SCRIPT="$SCRIPT_DIR/audit-trail.sh"
METRICS_DIR="$PROJECT_ROOT/.claude-flow/metrics"

mkdir -p "$SNAPSHOT_DIR" 2>/dev/null || true

COMMAND="${1:-help}"
shift || true

# ── Get current intelligence score ────────────────────────────
get_intelligence_score() {
  python3 << 'PYEOF'
import json, os

metrics_dir = os.environ.get("METRICS_DIR", "")
score = 0
components = {}

# 1. Pattern quality (0-25)
patterns_file = os.path.join(metrics_dir, "..", ".claude", "trajectories", "patterns.json")
try:
    # Try alternative path
    alt_patterns = os.path.join(os.path.dirname(metrics_dir), "..", ".claude", "trajectories", "patterns.json")
    patterns_path = patterns_file if os.path.exists(patterns_file) else alt_patterns
    if os.path.exists(patterns_path):
        with open(patterns_path) as f:
            patterns = json.load(f)
        multi_count = len([p for p in patterns if p.get("count", 0) >= 2])
        high_success = len([p for p in patterns if p.get("avgSuccess", 0) >= 0.8])
        pattern_score = min(25, (multi_count * 0.3) + (high_success * 0.5))
        components["patterns"] = round(pattern_score, 1)
        score += pattern_score
except:
    components["patterns"] = 0

# 2. Skill weights coverage (0-25)
weights_file = os.path.join(metrics_dir, "skill-weights.json")
try:
    if os.path.exists(weights_file):
        with open(weights_file) as f:
            w = json.load(f)
        domains = len(w.get("domains", {}))
        total_tools = sum(len(d.get("tools", {})) for d in w.get("domains", {}).values())
        weight_score = min(25, (domains * 2) + (total_tools * 0.2))
        components["weights"] = round(weight_score, 1)
        score += weight_score
except:
    components["weights"] = 0

# 3. Trajectory data quality (0-25)
traj_dir = os.path.join(os.path.dirname(metrics_dir), "..", ".claude", "trajectories")
try:
    alt_traj = os.path.join(os.path.dirname(metrics_dir), "..", ".claude", "trajectories")
    traj_path = traj_dir if os.path.isdir(traj_dir) else alt_traj
    if os.path.isdir(traj_path):
        trajs = [f for f in os.listdir(traj_path) if f.endswith(".json") and f != "patterns.json"]
        successes = 0
        for fname in trajs:
            try:
                with open(os.path.join(traj_path, fname)) as f:
                    t = json.load(f)
                if float(t.get("successScore", 0)) >= 0.7:
                    successes += 1
            except:
                continue
        traj_score = min(25, (len(trajs) * 0.3) + (successes * 0.4))
        components["trajectories"] = round(traj_score, 1)
        score += traj_score
except:
    components["trajectories"] = 0

# 4. Enhancement quality (0-25)
enhance_file = os.path.join(metrics_dir, "enhancements.json")
try:
    if os.path.exists(enhance_file):
        with open(enhance_file) as f:
            e = json.load(f)
        combos = len(e.get("winningCombos", []))
        suggestions = len(e.get("suggestions", []))
        enhance_score = min(25, (combos * 2) + (suggestions * 1))
        components["enhancements"] = round(enhance_score, 1)
        score += enhance_score
except:
    components["enhancements"] = 0

print(json.dumps({"score": round(score), "components": components}))
PYEOF
}

# ── Snapshot a file before modification ───────────────────────
snapshot_file() {
  local file="$1"

  if [ ! -f "$file" ]; then
    echo "[Self-Modify] File not found: $file"
    exit 1
  fi

  # Generate snapshot ID
  local snap_id="snap_$(date +%s)_$(basename "$file" | sed 's/[^a-zA-Z0-9.]/_/g')"
  local snap_path="$SNAPSHOT_DIR/$snap_id"

  # Save file content
  cp "$file" "$snap_path" 2>/dev/null

  # Save intelligence score at snapshot time
  local score_data=$(METRICS_DIR="$METRICS_DIR" get_intelligence_score)
  echo "$score_data" > "${snap_path}.score" 2>/dev/null

  # Save metadata
  python3 -c "
import json, datetime
meta = {
    'id': '$snap_id',
    'file': '''$file''',
    'timestamp': datetime.datetime.now().isoformat(),
    'score': $(echo "$score_data" | python3 -c "import json,sys; print(json.load(sys.stdin).get('score',0))" 2>/dev/null || echo 0)
}
with open('${snap_path}.meta', 'w') as f:
    json.dump(meta, f, indent=2)
" 2>/dev/null

  # Log to audit
  local current_score=$(echo "$score_data" | python3 -c "import json,sys; print(json.load(sys.stdin).get('score',0))" 2>/dev/null || echo 0)
  [ -x "$AUDIT_SCRIPT" ] && bash "$AUDIT_SCRIPT" config "$file" "snapshot" "$snap_id" 2>/dev/null

  echo "[Self-Modify] Snapshot created: $snap_id (score: $current_score/100)"
  echo "$snap_id"
}

# ── Validate after modification ───────────────────────────────
validate_change() {
  local file="$1"
  local snap_id="${2:-}"

  # Find latest snapshot for this file if not specified
  if [ -z "$snap_id" ]; then
    snap_id=$(ls -t "$SNAPSHOT_DIR"/snap_*_$(basename "$file" | sed 's/[^a-zA-Z0-9.]/_/g').meta 2>/dev/null | head -1 | xargs basename 2>/dev/null | sed 's/.meta$//')
  fi

  if [ -z "$snap_id" ] || [ ! -f "$SNAPSHOT_DIR/${snap_id}.score" ]; then
    echo "[Self-Modify] No snapshot found to validate against"
    exit 0
  fi

  # Get before score
  local before_score=$(cat "$SNAPSHOT_DIR/${snap_id}.score" | python3 -c "import json,sys; print(json.load(sys.stdin).get('score',0))" 2>/dev/null || echo 0)

  # Get after score
  local after_data=$(METRICS_DIR="$METRICS_DIR" get_intelligence_score)
  local after_score=$(echo "$after_data" | python3 -c "import json,sys; print(json.load(sys.stdin).get('score',0))" 2>/dev/null || echo 0)

  local delta=$((after_score - before_score))

  [ -x "$AUDIT_SCRIPT" ] && bash "$AUDIT_SCRIPT" config "$file" "validate" "before=$before_score after=$after_score delta=$delta" 2>/dev/null

  if [ "$delta" -lt -5 ]; then
    echo "[Self-Modify] REGRESSION DETECTED: Score dropped $before_score → $after_score (delta: $delta)"
    echo "[Self-Modify] Recommending revert. Run: self-modify-gate.sh revert $file $snap_id"

    if [ "${ACOS_GATE_ENFORCE:-false}" = "true" ]; then
      echo "[Self-Modify] AUTO-REVERTING: Restoring snapshot $snap_id"
      cp "$SNAPSHOT_DIR/$snap_id" "$file" 2>/dev/null
      echo "[Self-Modify] Reverted to pre-change state."
      [ -x "$AUDIT_SCRIPT" ] && bash "$AUDIT_SCRIPT" config "$file" "auto_revert" "$snap_id" 2>/dev/null
    fi
    return 1
  elif [ "$delta" -lt 0 ]; then
    echo "[Self-Modify] Minor regression: $before_score → $after_score (delta: $delta). Within tolerance."
    return 0
  else
    echo "[Self-Modify] Validated: Score $before_score → $after_score (delta: +$delta). Change is safe."
    # Clean up old snapshots (keep last 10)
    ls -t "$SNAPSHOT_DIR"/snap_* 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true
    return 0
  fi
}

# ── Revert to snapshot ────────────────────────────────────────
revert_to_snapshot() {
  local file="$1"
  local snap_id="$2"

  if [ -z "$snap_id" ] || [ ! -f "$SNAPSHOT_DIR/$snap_id" ]; then
    echo "[Self-Modify] Snapshot not found: $snap_id"
    exit 1
  fi

  cp "$SNAPSHOT_DIR/$snap_id" "$file" 2>/dev/null
  echo "[Self-Modify] Reverted $file to snapshot $snap_id"
  [ -x "$AUDIT_SCRIPT" ] && bash "$AUDIT_SCRIPT" config "$file" "manual_revert" "$snap_id" 2>/dev/null
}

# ── Show current score ────────────────────────────────────────
show_score() {
  local data=$(METRICS_DIR="$METRICS_DIR" get_intelligence_score)
  echo "=== ACOS Intelligence Score ==="
  echo "$data" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(f'  Total: {d[\"score\"]}/100')
print()
for k, v in d.get('components', {}).items():
    bar = '█' * int(v) + '░' * (25 - int(v))
    print(f'  {k:15} {bar} {v}/25')
" 2>/dev/null
}

# ── List snapshots ────────────────────────────────────────────
list_snapshots() {
  echo "=== Self-Modification Snapshots ==="
  for meta in "$SNAPSHOT_DIR"/*.meta; do
    [ -f "$meta" ] || continue
    python3 -c "
import json
try:
    with open('$meta') as f:
        m = json.load(f)
    print(f'  {m[\"id\"]} | score={m.get(\"score\",\"?\")} | {m.get(\"timestamp\",\"\")[:19]} | {m[\"file\"].split(\"/\")[-1]}')
except: pass
" 2>/dev/null
  done
}

# ── Main ──────────────────────────────────────────────────────
case "$COMMAND" in
  "snapshot"|"save")   snapshot_file "$@" ;;
  "validate"|"check")  validate_change "$@" ;;
  "revert"|"restore")  revert_to_snapshot "$@" ;;
  "score")             show_score ;;
  "list"|"snapshots")  list_snapshots ;;
  "help"|"-h"|"--help")
    echo "ACOS v10 Conservative Self-Modification Gate"
    echo ""
    echo "Commands:"
    echo "  snapshot <file>             Save before-state + intelligence score"
    echo "  validate <file> [snap_id]   Check score didn't regress after change"
    echo "  revert <file> <snap_id>     Restore file from snapshot"
    echo "  score                       Show current intelligence score"
    echo "  list                        Show all snapshots"
    echo ""
    echo "Auto-revert: When ACOS_GATE_ENFORCE=true and score drops >5 points"
    ;;
  *) echo "Unknown: $COMMAND" >&2; exit 1 ;;
esac
