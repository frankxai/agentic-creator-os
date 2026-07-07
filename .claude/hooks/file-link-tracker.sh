#!/bin/bash
# file-link-tracker.sh
# Portable File Link Tracker — PostToolUse (and equiv for other harnesses)
# Sources hook-env for agnostic paths/harness. No WSL/FrankX hardcodes in logic.
# Appends every created/edited file path to ~/LINKS_TODAY.md (or portable equiv)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/hook-env.sh" 2>/dev/null || true

# Support stdin json or env (claude sets TOOL_* via some wrappers; also read json)
INPUT_JSON=""
if [ -t 0 ]; then
  : # no stdin
else
  INPUT_JSON=$(cat 2>/dev/null || true)
fi

FILE_PATH="${TOOL_INPUT_file_path:-}"
TOOL="${TOOL_NAME:-unknown}"

# If json input, parse key fields portably (simple grep/awk for no jq dep)
if [ -n "$INPUT_JSON" ] && [ -z "$FILE_PATH" ]; then
  FILE_PATH=$(echo "$INPUT_JSON" | grep -o '"file_path":"[^"]*"' | head -1 | cut -d'"' -f4 || true)
  [ -z "$FILE_PATH" ] && FILE_PATH=$(echo "$INPUT_JSON" | grep -o '"path":"[^"]*"' | head -1 | cut -d'"' -f4 || true)
fi
if [ -n "$INPUT_JSON" ] && [ "$TOOL" = "unknown" ]; then
  TOOL=$(echo "$INPUT_JSON" | grep -o '"tool_name":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "PostToolUse")
fi

TIMESTAMP=$(date +"%H:%M")
TODAY=$(date +"%Y-%m-%d")
LOG="${HOME}/LINKS_TODAY.md"  # portable, user can symlink or override

# Only track actual file paths
[[ -z "$FILE_PATH" ]] && exit 0
[[ "$FILE_PATH" == "null" ]] && exit 0

# Initialize log if new day (portable date)
if [[ -f "$LOG" ]]; then
  LAST_DATE=$(head -3 "$LOG" 2>/dev/null | grep "^# " | head -1 | awk '{print $2}')
  if [[ "$LAST_DATE" != "$TODAY" ]]; then
    ARCHIVE="${HOME}/LINKS_$(date -d yesterday +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d 2>/dev/null || echo prev).md"
    mv "$LOG" "$ARCHIVE" 2>/dev/null || true
  fi
fi

# Create header if file doesn't exist
if [[ ! -f "$LOG" ]]; then
  cat > "$LOG" << EOF
# Files Created/Modified — $TODAY

> Run: \`cat ~/LINKS_TODAY.md\` or \`glow ~/LINKS_TODAY.md\`
> Harness: ${HARNESS:-unknown} | Project: ${PROJECT_NAME:-?}
> Cross-machine sync as needed.

EOF
fi

# Detect type
EXT="${FILE_PATH##*.}"
case "$EXT" in
  md|mdx)   ICON="📝" ;;
  ts|tsx|js|jsx) ICON="💻" ;;
  png|jpg|jpeg|webp) ICON="🖼️" ;;
  sh|bash)  ICON="⚙️" ;;
  json)     ICON="📦" ;;
  *)        ICON="📄" ;;
esac

# GitHub URL via git remote (portable, no personal hardcodes)
GITHUB_URL=""
if command -v git >/dev/null 2>&1 && git -C "$(dirname "$FILE_PATH")" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  REMOTE=$(git -C "$(dirname "$FILE_PATH")" remote get-url origin 2>/dev/null || true)
  BRANCH=$(git -C "$(dirname "$FILE_PATH")" rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)
  if [[ "$REMOTE" == *github.com* ]]; then
    REPO=$(echo "$REMOTE" | sed -E 's#.*github.com[:/]([^/]+/[^/.]+).*#\1#')
    REL=$(git -C "$(dirname "$FILE_PATH")" ls-files --full-name -- "$(basename "$FILE_PATH")" 2>/dev/null || basename "$FILE_PATH")
    GITHUB_URL="https://github.com/$REPO/blob/$BRANCH/$REL"
  fi
fi

# Append entry
if [[ -n "$GITHUB_URL" ]]; then
  echo "- $ICON \`$TIMESTAMP\` [$TOOL] [$FILE_PATH]($GITHUB_URL)" >> "$LOG"
else
  echo "- $ICON \`$TIMESTAMP\` [$TOOL] \`$FILE_PATH\`" >> "$LOG"
fi

# Auto-open review-worthy (WSL only, portable)
if command -v wslpath >/dev/null 2>&1; then
  WIN_PATH=$(wslpath -w "$FILE_PATH" 2>/dev/null || true)
  if [[ -n "$WIN_PATH" ]]; then
    case "$EXT" in
      md|mdx)
        cmd.exe /c start "" "$WIN_PATH" 2>/dev/null &
        ;;
      png|jpg|jpeg|webp)
        cmd.exe /c start "" "$WIN_PATH" 2>/dev/null &
        ;;
    esac
  fi
fi

log_hook_activation "file-link-tracker" "PostToolUse" 2>/dev/null || true

exit 0
