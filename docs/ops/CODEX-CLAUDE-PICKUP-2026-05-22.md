# Codex → Claude Pickup — ACOS — 2026-05-22

## What Was Fixed

- `install.sh` is restored and back to v11 multi-platform behavior.
- `.gitattributes` now forces LF line endings for shell scripts.
- `npm run harness:check` now passes again.
- OpenCode install no longer copies the stale root `opencode.json`; it generates a config from the actual `PROJECT_DIR`.
- Root `opencode.json` no longer points at `C:/Users/Frank/FrankX/FrankX.AI - Vercel Website/...`.
- MCP build loop no longer prints `Built: <name>` after a failed build.
- Harness now guards OpenCode routing, `--platform=all`, LF policy, and stale FrankX absolute paths.

## Verification

- Ran: `npm run verify` — passed.
- Ran: `bash -lc "./install.sh --help | grep -E 'platform=(codex|antigravity|opencode|all)'"` — all expected platform options are present.
- Attempted a full `--platform=all` temp-dir smoke; WSL timed out before returning output, so do not count that as passed.

## Next Best Work

1. Add a Node test that runs installer output generation into temp dirs for `codex`, `gemini`, `antigravity`, `opencode`, and `all`.
2. Parse generated OpenCode JSON and assert MCP command paths contain the current repo path, not stale absolute paths.
3. Decide whether non-Claude adapter docs should say “summary context” or whether installer should embed selected skill/agent bodies with token-budget controls.
4. Keep `npm run verify` as the merge gate; it passed after this repair.

## Collision Note

The ACOS working tree was already dirty. I changed only installer/harness/config/handoff surfaces and did not revert build artifacts or unrelated docs.
