#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
work="$(mktemp -d)"
export HOME="$work/home"
export CLAUDE_HOME="$work/claude-home"
mkdir -p "$HOME" "$work/project"
before="$(find "$work" -type f | wc -l)"

set +e
out="$(bash "$root/install.sh" --dry-run --platform=claude --target="$work/project" 2>&1)"
rc=$?
set -e

test "$rc" -eq 0
printf '%s\n' "$out" | grep -q "Dry run"
printf '%s\n' "$out" | grep -q "Nothing will be written"
after="$(find "$work" -type f | wc -l)"
test "$before" -eq "$after"

bash "$root/install.sh" --platform=claude --target="$work/project" >/dev/null
test -d "$CLAUDE_HOME/skills" || test -d "$CLAUDE_HOME/acos"
test ! -e "$work/project/.cursorrules"

echo "install-dry-run: ok"
rm -rf "$work"
