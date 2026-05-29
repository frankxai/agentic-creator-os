# Commands + Hooks Audit — agentic-creator-os

Scope: `.claude/commands/`, `.claude/hooks/`, `hooks/`, `workflows/`. Read-only. Cross-referenced against `package.json` claim of **65+ commands** and `CLAUDE.md` claim of **35+ commands**.

---

## 1. Counts: actual vs claimed

| Source | Claim | Reality |
|---|---|---|
| `package.json` description | "65+ commands" | **156 user-invocable `.md` files** (164 total minus 8 README/CLAUDE meta) |
| `CLAUDE.md` heading | "35+ Commands" | Top-level only: **74 `.md` files** (75 minus root `CLAUDE.md`) |
| `CLAUDE.md` table enumeration | 27 specific commands listed | 24 of 27 verified present; gstack commands (`/office-hours`, `/ship`, `/qa`, `/browse`, etc.) **not in `.claude/commands/`** — they live in a separate gstack install |

**Top-level `.md` (commands/*.md):** 74
**Sub-directory `.md`:** 82 across 8 sub-dirs (`analysis/`, `automation/`, `claude-flow-agents/`, `github/`, `gsd/`, `hooks/`, `monitoring/`, `optimization/`, `sparc/`)
**Total user-callable command files:** ~156

Verdict: package.json undersells (says 65+, actually 156). CLAUDE.md "35+" matches the curated table but ignores the sparc/github/monitoring subtrees. **The 65+ figure is misleading marketing — actual count is 2.4× higher**, but most of those are SPARC/claude-flow surplus, not curated commands.

`.claude/slash-commands/` is a parallel directory with 8 nested entries (linkedin-content, x-content, etc.) — appears to duplicate `workflows/` rather than `.claude/commands/`.

---

## 2. Top-level command organization

74 top-level commands cluster into informal groups:

- **ACOS core (7):** `acos.md`, `acos-agents.md`, `acos-checkpoint.md`, `acos-flow.md`, `acos-memory.md`, `acos-monitor.md`, `acos-swarm.md`
- **FrankX.AI website ops (12):** `frankx-ai-*` series (`agents`, `analytics`, `blog`, `build`, `components`, `content-pipeline`, `daily`, `deploy`, `products`, `prompts`, `seo`, `infogenius`) — these overlap heavily with the global skills
- **Content creation (13):** `article-creator`, `author-team`, `create-music`, `factory`, `generate-images`, `generate-social`, `harvest`, `hub-audit`, `infogenius`, `polish-content`, `products-creation`, `publish`, `publish-content`
- **Planning (6):** `plan-review`, `plan-sync`, `plan-update`, `plan-week`, `planning-with-files`, `newsletter-week`
- **Vis-* probe (4):** `vis-audit`, `vis-report`, `vis-scan`, `vis-search` — appears to be an analyzer set
- **Library (3):** `library-add`, `library-deepen`, `library-research`
- **Mixed singletons (~29):** `superintelligence`, `ultraworld`, `starlight-architect`, `starlight-intelligence`, `council`, `deepresearch`, `research`, `agent-quality`, `agentic-jujutsu`, `automation-dev`, `classify-content`, `content-strategy`, `content-studio`, `hook`, `inventory-status`, `mcp-status`, `move-to-staging`, `new-model`, `nextjs-deploy`, `review-content`, `seo-check`, `spec`, `traffic-week`, `ux-design`, `v0-generate`, `claude-flow-sparc`, `claude-flow-swarm`, `ai-architect-newsletter`, `log`

No taxonomy in the filesystem. CLAUDE.md provides one (Creation/Strategy/Development/System/Quality) but it's not reflected in directory layout. Discoverability suffers.

---

## 3. Sub-dir layout

| Dir | Files | Source | Verdict |
|---|---|---|---|
| `sparc/` | 31 | Looks like a verbatim copy of the claude-flow SPARC modes catalog | Disconnected from ACOS — uses `roo-cli`-style frontmatter (`new_task`, `attempt_completion`), references `npx claude-flow` |
| `github/` | 19 | claude-flow GitHub modes (code-review-swarm, pr-manager, release-swarm, etc.) | Also imported from claude-flow; not ACOS-native |
| `analysis/` | 7 | bottleneck-detect, performance-bottlenecks, performance-report, token-efficiency, token-usage, README, COMMAND_COMPLIANCE_REPORT | **Contains an internal compliance report file as if it were a command** |
| `monitoring/` | 6 | agent-metrics, agents, real-time-view, status, swarm-monitor, README | claude-flow imports |
| `optimization/` | 6 | auto-topology, cache-manage, parallel-execute, parallel-execution (dupe), topology-optimize, README | claude-flow imports |
| `automation/` | 7 | auto-agent, self-healing, session-memory, smart-agents, smart-spawn, workflow-select | claude-flow imports |
| `hooks/` | 8 | overview, post-edit, post-task, pre-edit, pre-task, session-end, setup, README | **Confusingly named: these are docs about hooks, but the path looks like commands that ARE hooks** |
| `gsd/` | 3 | discuss-phase, forensics, health | ACOS-native sprint helpers |
| `claude-flow-agents/` | 1 | agent-spawning only | Almost-empty directory |

**Sub-dir verdict:** `sparc/`, `github/`, `monitoring/`, `optimization/`, `automation/`, `analysis/` are clearly imported from claude-flow. They reference `npx claude-flow` CLI commands that may or may not be installed. They inflate the command count without adding ACOS value.

`claude-flow-agents/` (1 file) should be folded into `automation/` or deleted.

`hooks/` under `commands/` is a footgun — `/hooks/post-edit` looks like a slash command but it's documentation about a hook lifecycle event.

---

## 4. Hook inventory + safety

### `.claude/hooks/` (15 files — runtime hooks)

| File | Lang | Purpose | Wired in `hooks.json`? |
|---|---|---|---|
| `activation-logger.sh` | bash | Log activations | No |
| `audit-trail.sh` | bash | JSONL append log | Indirectly (called by other hooks) |
| `circuit-breaker.sh` | bash | Per-file failure counter | No (not in hooks.json) |
| `context-budget-tracker.ts` | ts | Track token budget | **Yes** (PostToolUse) |
| `memory-check.sh` | bash | Memory health | No |
| `post-tool-track.js` | js | Tool usage telemetry | No |
| `pre-commit.sh` | bash | ESLint + Prettier on staged | Git hook, not Claude hook |
| `self-modify-gate.sh` | bash | Snapshot config + intelligence score | No |
| `session-end-log.sh` | bash | Session end logging | No |
| `session-logger.sh` | bash | Session start logging | No |
| `session-start.js` | js | Session init | No |
| `skill-activation-prompt.{js,sh,ts}` | 3 langs | Suggest skills | **Yes** (UserPromptSubmit, via .ts) |
| `stop-finalize.js` | js | Cleanup | No |

### `hooks.json` wires only 6 hooks (out of 15+)

Wired: SessionStart×3 (all just `echo` banners), UserPromptSubmit×1 (skill-activation-prompt.ts), PreToolUse×2 (just `echo` reminders, no enforcement), PostToolUse×1 (context-budget-tracker.ts), Notification×1.

**Reality: most of the v10 safety theater (circuit breaker, self-modify gate, audit trail) is not wired into Claude Code's hook lifecycle.** They exist as standalone shell scripts callable only by other scripts. CLAUDE.md's claim of "v10 Safety Hooks ON" is overstated — only context-budget-tracker and skill suggestion actually run on hook events.

### `hooks/` at repo root (9 files — different system)

`cost-tracker.js`, `evaluate-session.js`, `gsd-context-monitor.js`, `gsd-statusline.js`, `gsd-workflow-guard.js`, `mcp-health-check.js`, `pre-compact.js`, `quality-gate.js`, `suggest-compact.js` — plus `templates/` (10 hook prompt templates for content) and `examples/`, `prompts/`.

These are **two parallel hook systems** that have not been reconciled. Root `hooks/` looks like a gstack-derived system; `.claude/hooks/` is ACOS-native.

### Hook safety findings

1. **`context-budget-tracker.ts` reads `process.env.TOOL_NAME` and `TOOL_INPUT`** (lines 168-169). Path is then used in fs ops. Low risk because it's only `path.join(process.env.HOME, ...)`, not injection-prone — but the pattern of trusting unsanitized env is worth noting if any hook later interpolates these into shell commands.

2. **`hooks.json` PostToolUse uses `TOOL_NAME=$TOOL_NAME npx tsx context-budget-tracker.ts`** — `$TOOL_NAME` is **unquoted** in a shell context. If a tool name ever contained whitespace or shell metacharacters, this would break / inject. In practice tool names are controlled by Claude Code so risk is low, but the shell quoting is sloppy.

3. **`self-modify-gate.sh` embeds Python heredocs** that interpolate `$file` directly into Python string literals (line 134-144). If a filename contained `'''` or `\n`, the Python would break and could execute unexpected code. Treats filename as trusted; low real-world risk but bad pattern.

4. **`circuit-breaker.sh path_to_key()`** properly sanitizes filenames with `sed 's/[^a-zA-Z0-9._-]/_/g'` before use. Good.

5. **No hook downloads remote content or pipes curl→sh.** No `eval` of untrusted strings found. No secrets read from disk.

6. **`pre-commit.sh`** runs `npm list eslint` (slow on big repos) and uses `xargs` on `$STAGED_FILES` without `-d '\n'` — filenames with spaces would split. Standard git-hook caliber, not Claude-hook.

7. **Three implementations of `skill-activation-prompt`** (`.js`, `.sh`, `.ts`) co-exist. `hooks.json` calls the `.ts`. The `.sh` `cd`s to `$HOME/.claude/hooks` (a global path) rather than the project's `.claude/hooks` — likely a leftover from a different install.

---

## 5. Workflow composition (`workflows/`)

38 YAML files across 13 sub-dirs (business, content, content-calendar, content-strategy, dev, farcaster, linkedin, marketing, meta, mirror, social-media, web3, x).

**Workflows do NOT compose commands.** They are self-contained step-lists with named agent roles ("Researcher", "Writer", "Editor") that are descriptive prose, not references to actual agent files. Zero grep hits for `agent:` keys in spot-checked YAML. Workflows are essentially documentation of a process, not executable orchestrations.

This is the biggest gap: `/factory`, `/article-creator`, `/publish` are command-side workflows; `workflows/*.yaml` is a parallel content-strategy-side workflow system. They don't reference each other.

Workflow duplicates within the directory:
- `social-media/cross-platform.yaml` vs `social-media/cross-platform-distribution.yaml`
- `web3/dao-governance.yaml` vs `web3/dao-governance-content.yaml`
- `web3/defi-education.yaml` vs `web3/defi-education-content.yaml`
- `web3/nft-content.yaml` and `web3/nft-collection-launch.yaml` are near-duplicates

---

## 6. Stubs + duplicates

### Stubs (under 25 lines, often near-empty)

- `planning-with-files.md` (6 lines) — just delegates to a skill, valid pattern but minimum-viable
- `vis-scan.md` (15), `vis-report.md` (22), `vis-audit.md` (23) — thin wrappers
- `gsd/health.md` (22)
- All 9-11 line `README.md` files inside sub-dirs are placeholders
- `analysis/COMMAND_COMPLIANCE_REPORT.md` shouldn't be in commands/ at all (it's a report, not a command)

### Confirmed duplicates / near-duplicates (commands)

| Pair | Diff |
|---|---|
| `sparc/code.md` vs `sparc/coder.md` | Different — `code.md` has frontmatter + tool guidelines; `coder.md` is leaner. Same concept, two files. |
| `sparc/debug.md` vs `sparc/debugger.md` | Same role, two files |
| `sparc/docs-writer.md` vs `sparc/documenter.md` | Same role |
| `sparc/spec-pseudocode.md` vs `sparc/sparc-modes.md` vs `sparc.md` | Three different files documenting the SPARC mode catalog |
| `optimization/parallel-execute.md` vs `optimization/parallel-execution.md` | Different content (one is claude-flow CLI, other is `mcp__claude-flow__task_orchestrate`) — both kept |
| `analysis/bottleneck-detect.md` vs `analysis/performance-bottlenecks.md` | Same subject, two angles |
| `publish.md` vs `publish-content.md` | Both top-level publishing commands |
| `content-strategy.md` vs `content-studio.md` | Overlapping content-strategy commands |
| `research.md` vs `deepresearch.md` | Two research commands |
| `frankx-infogenius.md` vs `infogenius.md` | Two infogenius commands |

### Commands referenced in docs but no file

CLAUDE.md heavily promotes the **gstack** suite (`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/autoplan`, `/review`, `/investigate`, `/design-review`, `/qa`, `/qa-only`, `/cso`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/retro`, `/document-release`, `/browse`, `/setup-browser-cookies`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/codex`, `/setup-deploy`, `/gstack-upgrade`) — **none of these exist in `.claude/commands/`**. They are presented as available but live in a separate gstack install.

---

## 7. Top issues

1. **Count inflation, organization deflation.** Claims of "65+ commands" understate the file count (156) but overstate the curated, working surface area. Roughly half the files are imported claude-flow boilerplate referencing an `npx claude-flow` binary that may not be installed.

2. **gstack commands documented but missing.** CLAUDE.md spends a large section advertising gstack commands as if they're part of this repo. They are not. Either install gstack as a subdir, vendor the commands, or move the section to a separate "external tools" doc.

3. **Two parallel hook systems** (`.claude/hooks/` ACOS-native + `hooks/` gstack-derived) with overlapping concerns (session lifecycle, quality gates, context tracking). Neither is fully wired. `hooks.json` activates only 6 of ~15 ACOS hooks; the root `hooks/` directory has no `hooks.json` registration at all.

4. **Safety theater.** `circuit-breaker.sh`, `self-modify-gate.sh`, `audit-trail.sh` exist but are not invoked by `hooks.json`. CLAUDE.md presents them as "v10 Safety Hooks ON" — they're off unless something else calls them. Wire them or stop advertising them.

5. **Three implementations of `skill-activation-prompt` (.js/.sh/.ts).** The `.sh` references a global `$HOME/.claude/hooks` path that may not exist in this project. Pick one.

6. **Stale or wrong placement.** `analysis/COMMAND_COMPLIANCE_REPORT.md` is a report sitting in the commands tree. `commands/hooks/` is documentation about hooks but its path implies they're invocable commands.

7. **Workflows don't compose commands.** `workflows/*.yaml` and `.claude/commands/*.md` are two independent systems. A user running `/factory` does not invoke `workflows/content/blog-creation.yaml`. Either unify them or document why they're separate. Within workflows alone there are 4+ confirmed near-duplicates (cross-platform, dao-governance, defi-education, nft-*).

8. **Shell-quoting sloppiness in `hooks.json`.** `TOOL_NAME=$TOOL_NAME` is unquoted. Low practical risk but worth fixing if hook authors ever interpolate user-controllable content.

9. **SPARC sub-tree drift.** 31 SPARC files use roo-cli frontmatter (`new_task`, `attempt_completion`) which is not Claude Code syntax. These won't function as Claude Code slash commands; they're imported docs masquerading as commands.

10. **`claude-flow-agents/` directory holds 1 file.** Either populate or delete.

### Prioritized fixes (read-only audit, so these are recommendations)

- High: Delete or move SPARC/github/monitoring/optimization/automation sub-trees out of `.claude/commands/` since they're claude-flow imports, not ACOS commands. This brings the curated count from 156 → ~80, closer to the "65+" claim.
- High: Either install gstack alongside or strip its documentation from CLAUDE.md.
- High: Wire the safety hooks (circuit-breaker, self-modify-gate, audit-trail) into `hooks.json` PreToolUse/PostToolUse — or remove the claims.
- Medium: Consolidate duplicate command pairs (`publish` vs `publish-content`, `research` vs `deepresearch`, `infogenius` vs `frankx-infogenius`, `code` vs `coder`, `debug` vs `debugger`, `docs-writer` vs `documenter`).
- Medium: Reconcile the two hook systems under `hooks/` (root) and `.claude/hooks/`.
- Medium: Either make `workflows/*.yaml` invokable from commands (a `/workflow [name]` dispatcher) or rename the dir to `processes/` to clarify it's documentation.
- Low: Rename `commands/hooks/` → `docs/hooks/` to stop it looking like slash commands.
- Low: Move `COMMAND_COMPLIANCE_REPORT.md` out of commands tree.
