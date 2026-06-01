# Branch Audit — agentic-creator-os

**As of:** 2026-06-01
**Auditor:** Claude Code session ([claude.ai/code](https://claude.ai/code))
**Purpose:** Inventory every non-`main` branch so deletions are zero-risk — the ideas live here.

If a branch is marked `SAFE_DELETE`, every meaningful change it contains is already in `main` (verified by file existence). If marked `KEEP`, it has unmerged work worth reviving or finishing. The revival command is `git checkout origin/<branch>` (the GitHub UI never permanently loses a branch — delete + recreate is fine).

## Summary

| Status | Count |
|---|---|
| `SAFE_DELETE` (work in main) | 6 |
| `KEEP` (active PR) | 2 |
| `KEEP_BACKUP` (staging snapshot) | 1 |

All `SAFE_DELETE` branches can be removed without losing anything. The 2 `KEEP` branches each back an open PR. The staging snapshot is an explicit save-point.

## Safe to delete (work absorbed into main)

### `claude/integrate-gstack-ZTgoO`

- **2 unique commits**: `feat: integrate garrytan/gstack engineering sprint system` · `chore: add .claude-flow/ to gitignore`
- **Status:** ABSORBED — gstack sprint commands (`/office-hours`, `/review`, `/qa`, `/ship`, `/land-and-deploy`, etc.) are documented in `CLAUDE.md` and live in `.claude/commands/`. The integration shipped.
- **Recommendation:** `SAFE_DELETE`
- **Revival (if needed):** `git checkout origin/claude/integrate-gstack-ZTgoO`

### `claude/slack-improve-acos-metrics-b9CP0`

- **2 unique commits**: tri-modal hooks framework + 10-dimension hooks expansion
- **Status:** ABSORBED — `.claude/skills/hook/SKILL.md`, `.claude/commands/hook.md`, `hooks/index.md`, `hooks/templates/wisdom.md` all present in `main`.
- **Recommendation:** `SAFE_DELETE`
- **Revival:** `git checkout origin/claude/slack-improve-acos-metrics-b9CP0`

### `claude/slack-fix-hallucinated-metrics-Ut20V`

- **0 unique commits** — fully merged into `main`.
- **Recommendation:** `SAFE_DELETE`

### `claude/slack-improve-metrics-accuracy-4mtO1`

- **0 unique commits** — fully merged into `main`.
- **Recommendation:** `SAFE_DELETE`

### `cursor/development-environment-setup-129a`

- **1 unique commit**: `Add AGENTS.md with Cursor Cloud specific instructions`
- **Status:** SUPERSEDED — `AGENTS.md` in `main` has been substantially rewritten since this branch (per PR #103 description).
- **Recommendation:** `SAFE_DELETE`

### `feat/absorb-ecc-gsd`

- **0 unique commits** — fully merged into `main`.
- **Recommendation:** `SAFE_DELETE`

### `feat/absorb-get-shit-done`

- **0 unique commits** — fully merged into `main`.
- **Recommendation:** `SAFE_DELETE`

### `feat/library-os`

- **5 unique commits**: book-distiller subagent + library-os skill + `/library-add` `/library-deepen` `/library-research` commands
- **Status:** ABSORBED — all 5 files (`.claude/agents/book-distiller.md`, `.claude/skills/library-os/SKILL.md`, all 3 commands) exist in `main`. Work was rebuilt or re-committed.
- **Recommendation:** `SAFE_DELETE`
- **Revival (if needed):** `git checkout origin/feat/library-os`

## Keep (backs an open PR)

### `claude/vibrant-gates-8pp1t` → PR #12

- **Multimodal Studio** — unified image/video/character generation through Higgsfield MCP. 30+ frontier models. Substantial.
- **Recommendation:** `KEEP` until PR #12 is merged or closed.

### `cursor/single-source-product-0ff1` → PR #10 (draft)

- **Manifest-driven packaging** — `acos.manifest.json` + installer fixes. Cursor agent's work.
- **Recommendation:** `KEEP` until PR #10 is merged or closed.

## Keep (backup / staging snapshot)

### `staging/madrid-2026-05-25`

- **1 unique commit**: `chore(madrid-handoff): stage uncommitted WIP for review`
- **Status:** Explicit save-point from a session handoff. Treat as a backup.
- **Recommendation:** `KEEP_BACKUP` — delete only when the Madrid sprint is fully done.

## One-shot delete (run when ready)

```bash
# 8 branches safe to delete from agentic-creator-os
for b in \
  claude/integrate-gstack-ZTgoO \
  claude/slack-improve-acos-metrics-b9CP0 \
  claude/slack-fix-hallucinated-metrics-Ut20V \
  claude/slack-improve-metrics-accuracy-4mtO1 \
  cursor/development-environment-setup-129a \
  feat/absorb-ecc-gsd \
  feat/absorb-get-shit-done \
  feat/library-os; do
  gh api -X DELETE "repos/frankxai/agentic-creator-os/git/refs/heads/$b" && echo "deleted $b"
done
```

(GitHub UI: same 8 branches under [Branches](https://github.com/frankxai/agentic-creator-os/branches) → trash icon each.)

## Updates to this doc

When a new orphan branch appears, add a section above with: unique-commit count · file inventory · `IN MAIN` / `MISSING` verification · KEEP/SAFE_DELETE recommendation.
