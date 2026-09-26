# Episode 6 lab: The Seal (hooks, breaker, human gate)

All configuration, no model code. Add to the project's `.claude/settings.json`.

## 1. The Ward: a PreToolUse hook that counts failures per file

`.claude/hooks/seal.sh`:

```bash
#!/usr/bin/env bash
# Reads the tool call from stdin, counts prior failures for the target file, denies at 5.
input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0
ledger=".claude/seal-ledger.json"
[ -f "$ledger" ] || echo '{}' > "$ledger"
count=$(jq -r --arg f "$file" '.[$f] // 0' "$ledger")
if [ "$count" -ge 5 ]; then
  echo "Seal is red for $file ($count failures this session). Edits restricted; reads still pass." >&2
  exit 2   # exit 2 = block the tool call
fi
[ "$count" -ge 3 ] && echo "Seal amber for $file ($count failures)." >&2
exit 0
```

`.claude/hooks/seal-post.sh` (PostToolUse): increment the ledger when the tool result reports an error.

```bash
#!/usr/bin/env bash
input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path // empty')
err=$(echo "$input" | jq -r '.tool_response.error // empty')
[ -z "$file" ] || [ -z "$err" ] && exit 0
ledger=".claude/seal-ledger.json"
tmp=$(mktemp); jq --arg f "$file" '.[$f] = ((.[$f] // 0) + 1)' "$ledger" > "$tmp" && mv "$tmp" "$ledger"
```

## 2. Wire the hooks and the human gate

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "bash .claude/hooks/seal.sh" }] }
    ],
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "bash .claude/hooks/seal-post.sh" }] }
    ]
  },
  "permissions": {
    "ask": ["Bash(git push:*)", "Bash(rm -rf:*)"]
  }
}
```

## Expected

- Failures 1 and 2: silent. Failure 3: the amber message appears. Failure 5: the edit is denied with the red message; `Read` still works.
- `git push` prompts for approval every time: the Founder's Stamp.
- Delete `.claude/seal-ledger.json` to end the session and reset the Seal.

Checkpoint: which exit code blocks the tool, and which hook writes the ledger?
