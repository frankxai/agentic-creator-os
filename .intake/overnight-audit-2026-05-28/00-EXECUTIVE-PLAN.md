# ACOS Audit — Executive Plan (First Run)

**Repo:** `agentic-creator-os` · `main` @ `2044b37` (single-commit visible)
**Date:** 2026-05-28
**Mode:** Audit-only. Zero edits, zero commits.
**Auditors:** 7 parallel agents (Cartography, Departments+Agents, Skills, MCP Servers, Commands+Hooks, Security+Hygiene, Doc Drift)
**Repo self-description (package.json v11.0.0):** "The Operating System for AI-Powered Creators — 90+ skills, 65+ commands, 38 agents, 8 plugins. Works with Claude Code, Cursor, Windsurf, Gemini."

---

## Headline verdict

ACOS is **larger than it advertises and more fractured than it admits.** The skills system has been migrated mid-flight and has two parallel trees that don't reference each other. The 38-agent number is repeated everywhere except the plugin manifest itself, which honestly labels it "aspirational" — actual count is **142 agent files / 137 distinct names**. The 8-plugin number is **literally zero plugins shipped locally** (they live in a separate repo not present). USAGE_GUIDE.md is **6 major versions stale.** Two of the MCP servers are broken at runtime, one has no build dir despite being the canonical agent-eval server, and the project-level `.mcp.json` doesn't reference any of the 7 in-tree servers — they're not wired up.

Security: no live secrets. But **two real injection vectors**, plus 5 hooks that crash on first run, plus CI that can't succeed on a fresh clone.

The good news: the architecture intent is sound, content per-skill is mostly real (not stubs), and the surface code is clean. This is a **post-creative-burst repo** — built fast, ahead of its own documentation, needing a discipline pass.

---

## CRITICAL — same-day-able

### C1. Hook injection vector
**Evidence:** `.claude/settings.json` hooks interpolate `$TOOL_INPUT_command`, `$PROMPT`, etc. directly inside double-quoted shell strings. `$(…)` and backticks still expand. A prompt-injected Claude tool call could execute arbitrary shell on your machine.
**Action:** Either single-quote the interpolations, escape via a wrapper script, or convert to argv pipes.
**Effort:** 30 min.

### C2. False `readOnlyHint` on dangerous MCP tools
**Evidence:** Database MCP `query` tool annotated `readOnlyHint: true` but accepts arbitrary SQL with no enforcement. Same false annotation on browser MCP `evaluate`.
**Action:** Either enforce read-only at the SQL/JS layer or drop the lying annotation.
**Effort:** 30 min.

### C3. 5 hooks crash on first run
**Evidence:** `hooks/` contains 5 files that `require('../lib/...')` but `hooks/lib/` doesn't exist. They throw immediately.
**Action:** Either create `hooks/lib/` with the expected modules, or restore from wherever those were authored. Or remove the hooks if not needed.
**Effort:** 30-60 min depending on what was supposed to be there.

### C4. CI cannot succeed on fresh clone
**Evidence:** CI runs `npm ci`, but `package-lock.json` is gitignored. Fresh clone has nothing to ci against.
**Action:** Either commit `package-lock.json` (remove from .gitignore) or change CI to `npm install`.
**Effort:** 5 min decision + 5 min change.

### C5. `browser/screenshot` MCP tool broken at runtime
**Evidence:** `require("fs/promises")` inside ESM module throws when `path` arg provided.
**Action:** Convert to `import { writeFile } from 'node:fs/promises'`.
**Effort:** 5 min.

### C6. `filesystem/write_file` MCP tool cannot create new files
**Evidence:** `validatePath` calls `fs.realpath` which throws for non-existent paths. Tool advertised as write but only works on existing files.
**Action:** Drop the realpath check or branch on ENOENT.
**Effort:** 10 min.

### C7. Auto-activation rules point at 5 zero-byte SKILL.md stubs
**Evidence:** `nextjs-react-expert`, `oracle-database-expert`, `product-management-expert`, `social-media-strategy`, `video-production-workflow` are wired into `skill-rules.json` but their SKILL.md files are empty. **Silent no-op when triggered.**
**Action:** Either fill the stubs or remove from rules.
**Effort:** 20 min to remove; hours to fill.

---

## HIGH — this week

### H1. The 38-agent claim is 4× the truth
**Evidence:** package.json + README + QUICKSTART claim 38. Plugin manifest (`.claude-plugin/plugin.json`) declares `agents: 0` and internally labels 38 as **"aspirational."** Filesystem: 5 dept-lead `agent.md` + 144 files in `.claude/agents/` (137 distinct names).
**Action:** Pick one. If 38 is the goal, document the gap. If 142 is the truth, update the README. If somewhere between, clarify which count is canonical.

### H2. The 8-plugin claim is 0 plugins shipped
**Evidence:** README:479-498 presents plugins as installable. `plugin.json` stats: `skills:10, commands:0, agents:0`. The plugins repo lives elsewhere and isn't included.
**Action:** Either bundle the plugins or rewrite the section to say "8 plugins available via the marketplace repo at <URL>".

### H3. USAGE_GUIDE.md is 6 major versions stale
**Evidence:** USAGE_GUIDE.md:2,317 says v5.0.0. package.json says 11.0.0.
**Action:** Either rewrite or delete with a redirect to current docs.

### H4. The MCP server system is split
**Evidence:**
- `mcp-servers/` has 7 in-tree servers (browser, creator, database, email, evaluator, filesystem, website)
- Project-level `.mcp.json` references **only** `claude-flow` — zero of the 7 in-tree servers
- `opencode.json` references two servers via **stale absolute paths** pointing to `C:/Users/Frank/FrankX/FrankX.AI - Vercel Website/...` (old repo location, no longer exists)
- `evaluator` (the only server docs say is for agent use) has **no build dir** — cannot run without local `tsc`

**Action:** Decide which servers are "real," wire them into `.mcp.json`, fix the stale paths, fix evaluator's build.

### H5. Two parallel skill trees
**Evidence:** `skills/` (npm-shipped, 17 registry entries / 19 dirs / mostly orphans) vs `.claude/skills/` (the one CLAUDE.md and `skill-rules.json` actually use, 102 dirs / 97 SKILL.md). They don't reference each other. The "90+ skills" claim only holds on the `.claude/skills/` tree.
**Action:** Pick a canonical tree, migrate, deprecate the other.

### H6. Two parallel hook systems
**Evidence:** `.claude/hooks/` (ACOS-native) + root `hooks/` (gstack-derived). Overlapping concerns, no reconciliation. Three different impls of `skill-activation-prompt` (`.js`, `.sh`, `.ts`). The `.sh` cd's to a global `$HOME/.claude/hooks` path.
**Action:** Same as H5 — pick one, migrate.

### H7. Safety theater on hooks
**Evidence:** 15 hook files including `circuit-breaker.sh`, `self-modify-gate.sh`, `audit-trail.sh`. **`hooks.json` wires only 6, and the named safety scripts aren't among them.** CLAUDE.md says "v10 Safety Hooks ON" — overstated. Only `context-budget-tracker` and `skill-activation-prompt` fire.
**Action:** Either wire the safety hooks or stop claiming they're on.

### H8. 4 advertised platform adapters don't exist
**Evidence:** README:424-427 lists `adapters/cursor/`, `adapters/windsurf/`, `adapters/gemini/`, `adapters/generic/`. **Only `adapters/opencode/` exists.**
**Action:** Either ship the four adapters or rewrite README to claim Claude-Code-only.

### H9. Workflows don't actually compose commands
**Evidence:** `workflows/*.yaml` (38 files) and `.claude/commands/*.md` are independent systems. `/factory` doesn't invoke `workflows/content/blog-creation.yaml`. Workflows describe agent roles in prose, not file references.
**Action:** Either wire the composition or rename workflows to "playbooks" (documentation only).

---

## MEDIUM — month

| # | Finding | Source |
|---|---|---|
| M1 | 5 tracked SQLite DB files (`.claude/memory.db`, `.swarm/memory.db` etc., 155 KB each) | Security |
| M2 | `mcp-servers/*/build/` artifacts gitignored AND tracked — gitignore silently inert | Security |
| M3 | `pnpm-lock.yaml` (untracked) has zero resolved deps — useless stub | Security |
| M4 | MCP filesystem server defaults to `process.cwd()` if env unset — silent full read/write on tree | Security |
| M5 | Email MCP template substitution into HTML lacks escaping — XSS-in-email vector | Security |
| M6 | Evaluator MCP uses low-level `Server` + `setRequestHandler` (vs `McpServer.registerTool` for others); has `z.enum()` embedded in plain JSON schema (line 257 — runtime bug) | MCP |
| M7 | Article CRUD duplicated: `creator` (Map, ephemeral) + `database` (SQLite, persistent), no coordination | MCP |
| M8 | Zero `bin` entries across the 7 MCP servers — can't be invoked via npx | MCP |
| M9 | Zero tests anywhere across the 7 MCP servers | MCP |
| M10 | 23 ghost sub-agents: every dept's skill.yaml + agent.md registers a 4-5 person team (`crm-agent`, `finance-agent`, `writer`, `editor`, etc.) — zero matching files | Departments |
| M11 | ~135 orphan agents in `.claude/agents/` — entire consensus/hive-mind/swarm/sparc/github/optimization/sublinear/frankx-*/meta-*/prompt-* families don't reference their dept | Departments |
| M12 | Frank DNA mandated by CLAUDE.md but only 3 of ~137 `.claude/agents/` files reference it; zero of the 5 dept leads | Departments |
| M13 | 4 overlap zones with no router: social graphics (3 depts), SEO/blog (2 depts), newsletter (2 depts), landing pages (2 depts) | Departments |
| M14 | `skills/registry.json` 11 of 17 entries are phantom (no SKILL.md) — `life-symphony`, `golden-path`, `daily-ops`, `publishing-factory`, `claude-sdk`, `frankx-brand`, `suno-mastery`, etc. | Skills |
| M15 | Auto-activation covers only 24 of 97 skills (25%) — other 73 are dead unless slash command known | Skills |
| M16 | `skill-rules-v11.json` exists but has 0 path entries — half-migrated | Skills |
| M17 | 3 competing skill taxonomies — 5 dept YAML names, 4 registry categories, 7 skill-rules categories — none aligned | Skills |
| M18 | 14 duplicate skill pairs (bundled Anthropic skills at both `.claude/skills/anthropic/X/` and `.claude/skills/X/`) | Skills |
| M19 | 8 duplicate command pairs (`publish` vs `publish-content`, `research` vs `deepresearch`, `sparc/code` vs `sparc/coder`, etc.) | Commands |
| M20 | gstack commands documented but missing (`/office-hours`, `/ship`, `/qa`, `/review`, `/browse`, `/codex`, `/canary`) | Commands |
| M21 | QUICKSTART's "Try These First" promotes `/ultrawork` (file is `ultraworld.md`) and `/design-gods` (no file) | Doc Drift |
| M22 | README:418 path `.claude/hooks/quality-gate.sh` is wrong (actually `hooks/quality-gate.js`) | Doc Drift |
| M23 | USAGE_GUIDE.md:311-314 has 4 dead doc links | Doc Drift |
| M24 | 2 format-orphan agent files: `.claude/agents/seo_specialist.md` + `strategist.md` lack YAML frontmatter — can't be invoked as sub-agents | Departments |
| M25 | Misplaced files: `analysis/COMMAND_COMPLIANCE_REPORT.md` in commands tree; `commands/hooks/` contains 8 hook-lifecycle docs that look like slash commands | Commands |

---

## LOW

- `docs/infographics/` is 21M of 23M total — 30+ architecture diagrams with v7_* and premium variants (archive candidates)
- `lore.md` (73K) + `cosmology.md` (12K) — narrative/worldbuilding artifacts; intentional but noteworthy
- "Homunculus" meta-agent initialization system — esoteric, worth deciding if it stays
- `drafts/CLAUDE.md` — historical, unused since v10
- `modules/social-media-engine/` — empty placeholder
- `departments/` dept dirs are 2-file scaffolds awaiting content
- Anthropic `template-skill` placeholder at `.claude/skills/anthropic/template-skill/SKILL.md` never customized
- README:7,287,57 all parrot the inaccurate counts
- CLAUDE.md footer v10.1 vs package.json v11.0.0 (1 major behind)
- 22 vs 24 activation rules count inconsistency

---

## What's actually working

Real wins. Don't let the finding count drown these:

- **No live secrets anywhere.** Working tree + git history clean. `.env.example` placeholders properly marked.
- **Surface code health is high.** No `.bak`/`.old` files. No committed build artifacts (well, except the MCP server builds which are simultaneously gitignored — see M2).
- **All `.claude/FRANK_DNA.md`, `.claude/agent-iam.json`, `.claude/skill-rules.json`, `.claude/hooks.json` exist** and the IAM has 6 profiles.
- **MCP servers, when they work, follow a coherent API per server** — naming consistency within each.
- **Per-skill content is mostly real**, not stubs. The 5 zero-byte exceptions in C7 are the outliers, not the norm.
- **`.gitignore` is reasonable** — main gap is the inverted CI/lockfile situation in C4.
- **Plugin manifest (`plugin.json`) is honest** about the aspirational nature of its stats — even if the README isn't.
- **Architecture intent is sound.** The 5-department model + skill registry + hook gates is a defensible architecture. It just hasn't been *finished*.

---

## Recommended Tuesday plan

1. **C1 hook injection fix** (~30 min). This is the only finding with a clear attack vector.
2. **C5 + C6 MCP runtime bugs** (~20 min total). Fast wins for tools you're presumably calling.
3. **C7 5 zero-byte SKILL.md stubs** — decide: fill or remove from rules. ~20 min.
4. **C4 CI lockfile decision** — pick one of `npm ci` / `npm install` and align. ~10 min.
5. **H4 MCP wiring** — decide which servers are real, wire them into `.mcp.json`, fix `opencode.json` stale paths. ~30 min.

Total CRITICAL + lowest-effort HIGH: **~2 hours**. Tuesday morning, before lunch.

After that, the architecture cleanup (H5/H6 dual-tree consolidation, H1 agent-count truth, H2 plugin reality) is multi-day work and benefits from a `/starlight-board`-equivalent decision pass.

---

## Audit fleet metadata

| # | Agent | Tokens | Duration | Tool uses |
|---|---|---|---|---|
| 01 | Cartography (Explore) | 142k | 6m 50s | 35 |
| 02 | Departments + Agents | 76k | 4m 42s | 45 |
| 03 | Skills | 76k | 5m 55s | 58 |
| 04 | MCP Servers (mcp-server-advisor) | 77k | 3m 37s | 40 |
| 05 | Commands + Hooks | 75k | 4m 31s | 43 |
| 06 | Security + Hygiene | 115k | 8m 05s | 79 |
| 07 | Doc Drift (Research Librarian) | 72k | 5m 24s | 40 |

Wall time ~8 minutes parallel.
