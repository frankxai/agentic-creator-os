# 07 — Documentation Drift Report
**Audit date:** 2026-05-28
**Scope:** README.md, CLAUDE.md, AGENTS.md, QUICKSTART.md, USAGE_GUIDE.md, CREATOR_NEEDS.md, CONNECTORS.md, docs/

---

## 1. Numerical Claims Verification

| Claim | Source (doc:line) | Actual (filesystem) | Drift severity |
|---|---|---|---|
| **90+ skills** | `package.json:4`, `README.md:7`, `QUICKSTART.md:3,38,80` | 102 subdirectories under `.claude/skills/`; 272 `.md` files inside them | OVERSTATED — "90+" is technically met by dir count (102), but the headline obscures that dirs contain hundreds of asset files (fonts, XSD, Python, TS). Distinct SKILL.md leaf files are likely ~110-120. Low severity: directional claim holds. |
| **65+ commands** | `package.json:4`, `README.md:7`, `QUICKSTART.md:3,38,80` | 164 total `.md` files in `.claude/commands/`; 156 excluding README/CLAUDE/COMPLIANCE meta files | OVERSTATED — actual is 156+ real command files, so "65+" is met, but the true count is 2x the claim. The stat undersells reality. Low severity. |
| **38 agents** | `package.json:4`, `README.md:7,57,287`, `QUICKSTART.md:3,38,82`, `CLAUDE.md:64` | 142 `.md` agent files (excl. README/CLAUDE.md); note several are infrastructure/swarm/meta agents not counted in the claimed taxonomy | SEVERELY UNDERSTATED — actual agent files are 142, nearly 4x the "38" claim. The README's own breakdown table (Writing 8, Strategy 5, Design 4, Production 4, Business 4, Technical 5, Publishing 6, System 3) sums to only 39, leaving ~103 files uncounted. Severity: HIGH — a reader expecting 38 agents finds a far larger, partially undocumented set. |
| **8 plugins** | `package.json:4`, `README.md:479-498,538`, `QUICKSTART.md:55-64` | `.claude-plugin/` contains a single `plugin.json` (not 8 separate plugin dirs). The 8 named plugins (`core`, `content-engine`, `visual-studio`, `music-lab`, `brand-architect`, `product-launcher`, `intelligence`, `design-excellence`) all reference `frankxai/agentic-creator-skills` — a separate repo not present locally. | UNVERIFIABLE LOCALLY — plugins live in the external `agentic-creator-skills` repo. Local plugin manifest (`plugin.json`) records `stats.skills: 10, commands: 0, agents: 0` and explicitly notes "Aspirational targets in docs/ACOS_V11_MASTER_PLAN.md". Plugin count is aspirational, not shipped. Severity: HIGH — the README presents 8 plugins as currently installable without caveat. |
| **5 safety hooks** | `README.md:62,192-198,299-307` | `.claude/hooks/` contains 15 files; `hooks/` (root) contains 11 files. The "5 systems" matches the conceptual model (Circuit Breaker, Audit Trail, Self-Modify Gate, Agent IAM, Quality Gate) but the actual hook file count is 15 (`.claude/hooks/`) not "5 hooks". | LOW — the "5" refers to named systems, not file count. Accurate at the conceptual level. |
| **22 auto-activation rules** | `README.md:283`, `CLAUDE.md:132` | `skill-rules.json` `activation_rules` array contains **24** entries | MINOR DRIFT — docs say 22, actual is 24. Severity: Low. |
| **35+ commands** | `README.md:233,254`, `CLAUDE.md:62,81` | 156 real command `.md` files | Severely understated — "35+" is technically true as a floor, but internal docs also used "35+" consistently while real count is 4x that. Severity: Low (floor claim, not false). |
| **75+ skills** | `README.md:59,264,459,462` | 102 skill subdirectories | TRUE — "75+" met. Underclaims actual. |
| **USAGE_GUIDE version: 5.0.0** | `USAGE_GUIDE.md:2,317` (header + footer) | package.json is `11.0.0` | STALE DOCUMENT — USAGE_GUIDE.md appears to be v5-era content never updated. Claims "70 Skills, 10 Agents, 8 Workflows". Severity: HIGH — public-facing guide is 6 major versions behind. |
| **CLAUDE.md version: v10.1** | `CLAUDE.md:220` (footer) | package.json is `11.0.0` | STALE FOOTER — CLAUDE.md footer says "ACOS v10.1" but the current version is v11.0.0. Severity: MEDIUM. |
| **README directory tree: `package.json` note says "v10.1.0"** | `README.md:441` | package.json actual version is `11.0.0` | STALE INLINE COMMENT — the directory tree ASCII art at line 441 contains `# v10.1.0` next to `package.json`. Severity: LOW. |
| **6 IAM profiles** | `CLAUDE.md:147` | `agent-iam.json` exists but count not verified here | UNCONFIRMED — claim not rejected, but not independently verified. |
| **QUICKSTART: 15 hooks** | `QUICKSTART.md:41,83` | `.claude/hooks/` has exactly 15 files | VERIFIED — matches exactly. |

---

## 2. Path / File Reference Claims

| Claimed path | Doc:line | Exists? | Notes |
|---|---|---|---|
| `docs/infographics/acos-hero-omega.png` | `README.md:9` | YES | Present |
| `docs/infographics/acos-architecture.png` | `README.md:37` | YES | Present |
| `docs/infographics/acos-smart-router.png` | `README.md:317` | YES | Present |
| `docs/infographics/acos-self-learning.png` | `README.md:353` | YES | Present |
| `.claude/hooks/circuit-breaker.sh` | `README.md:415` | YES | Present |
| `.claude/hooks/audit-trail.sh` | `README.md:416` | YES | Present |
| `.claude/hooks/self-modify-gate.sh` | `README.md:417` | YES | Present |
| `.claude/hooks/quality-gate.sh` | `README.md:418` | NO | File is `quality-gate.js` in root `hooks/`, not `.claude/hooks/`. Severity: MEDIUM — wrong location and wrong extension in directory tree. |
| `.claude/agent-iam.json` | `README.md:419` | YES | Present |
| `.claude/skill-rules.json` | `README.md:420` | YES | Present |
| `.claude/hooks.json` | `README.md:421` | YES | Present |
| `adapters/cursor/` | `README.md:424` | NO | `adapters/` only contains `opencode/` subdirectory. Cursor, Windsurf, Gemini, and generic adapter subdirs are absent. Severity: HIGH — four of five listed adapter dirs do not exist. |
| `adapters/windsurf/` | `README.md:425` | NO | Same — absent |
| `adapters/gemini/` | `README.md:426` | NO | Same — absent |
| `adapters/generic/` | `README.md:427` | NO | Same — absent |
| `departments/content/` | `README.md:429` | YES | Present |
| `departments/design/` | `README.md:430` | YES | Present |
| `departments/dev/` | `README.md:431` | YES | Present |
| `departments/marketing/` | `README.md:432` | YES | Present |
| `departments/business/` | `README.md:433` | YES | Present |
| `.claude/FRANK_DNA.md` | `CLAUDE.md:23` | YES | Present |
| `ARCHITECTURE.md` | `USAGE_GUIDE.md:311` | NO | File does not exist at repo root. Severity: LOW (USAGE_GUIDE is stale v5 doc). |
| `CHANGELOG.md` | `USAGE_GUIDE.md:312` | NO | Absent. Same severity. |
| `PRO_STATUS_DASHBOARD.md` | `USAGE_GUIDE.md:313` | NO | Absent. |
| `SKILL_TREE.md` | `USAGE_GUIDE.md:314` | NO | Absent. All four USAGE_GUIDE resource links are dead. |
| `install.sh --minimal` | `CREATOR_NEEDS.md:84` | UNVERIFIED | `install.sh` help output does not show `--minimal`. Likely aspirational. |

---

## 3. Command Name Claims

All 27 commands explicitly named in `CLAUDE.md` lines 83-129 were checked against `.claude/commands/`:

**All 27 verified present** — `/acos`, `/article-creator`, `/create-music`, `/infogenius`, `/generate-images`, `/generate-social`, `/factory`, `/products-creation`, `/author-team`, `/hook`, `/starlight-architect`, `/starlight-intelligence`, `/council`, `/research`, `/plan-week`, `/harvest`, `/spec`, `/nextjs-deploy`, `/ux-design`, `/automation-dev`, `/planning-with-files`, `/inventory-status`, `/mcp-status`, `/publish`, `/review-content`, `/classify-content`, `/polish-content`.

**QUICKSTART.md commands with problems (lines 47-50):**

| Command | QUICKSTART claims | Exists? |
|---|---|---|
| `/acos` | "Check ACOS status" | YES — `acos.md` |
| `/ultrawork` | "Launch multi-agent swarm mode" | NO — file is `ultraworld.md`, not `ultrawork.md`. Severity: HIGH — broken command reference. |
| `/design-gods` | "Design system audit and build" | NO — no `design-gods.md`. Closest is `vis-audit.md` or `vis-scan.md`. Severity: HIGH. |
| `/deepresearch` | "Deep research with web + codebase" | YES — `deepresearch.md` |

**gstack commands** listed in `CLAUDE.md` lines 163-195 (`/browse`, `/office-hours`, `/review`, `/qa`, `/ship`, etc.) are gstack-ecosystem commands, not ACOS-native. These are not present in `.claude/commands/`. This is documented as intentional gstack integration but may confuse readers who think these ship with ACOS.

---

## 4. Public-vs-Internal Exposure

| Item | Document | Issue |
|---|---|---|
| **FRANK DNA / personal brand identity** | `CLAUDE.md:8-54` — full DNA spec inherited by all agents, referencing `Frank = Systems Architect × Composer × Gamer × Builder × GenCreator` | This is deeply personal internal configuration (Frank's personal brand, mission, voice) in a file that ships publicly via `package.json "files"` array. Not a security risk but may be inappropriate for a general-purpose OS package. |
| **`plugin.json` stat note** | `.claude-plugin/plugin.json:57-62` — explicitly states "Aspirational targets in docs/ACOS_V11_MASTER_PLAN.md (90+ skills / 65+ commands / 38 agents). Manifest reflects current shipped state, not aspiration." | This honest internal caveat contradicts the public README marketing claims. The discrepancy is documented internally but invisible to users reading only the README. |
| **gstack sprint system** | `CLAUDE.md:155-198` — describes Garry Tan's gstack engineering system as if it's part of ACOS | Includes attribution to Garry Tan but mixes a third-party sprint system into ACOS project instructions without a clear boundary. Could mislead contributors about ACOS scope. |
| **`USAGE_GUIDE.md` v5 content** | Entire file | A public-facing guide describing v5.0.0 (70 skills, 10 agents) is 6 major versions stale. Users reading it will configure a system that no longer matches the guide. Severity: HIGH for user experience. |
| **`frankxai/arcanea` repo link** | `README.md:540` | Listed as a related project ("AI-native creative platform built with ACOS") — not verified as public or functional at audit time. |

---

## 5. External URLs to Verify

These URLs appear in README.md and should be verified for liveness and accuracy:

| URL | Context |
|---|---|
| `https://frankx.ai/products/agentic-creator-os` | `package.json:11` — homepage field |
| `https://frankx.ai/acos` | `README.md:557` — footer link (different path from homepage) |
| `https://frankx.ai` | `README.md:558` — author site |
| `https://github.com/frankxai/agentic-creator-skills` | `README.md:479,538` — plugin marketplace (separate repo; verify it exists and the 8 plugins are published) |
| `https://github.com/frankxai/Starlight-Intelligence-System` | `README.md:448,539` — listed as powering ACOS |
| `https://github.com/frankxai/arcanea` | `README.md:540` — listed as built with ACOS |
| `https://github.com/ruvnet/claude-flow` | `README.md:523` — credits |
| `https://github.com/wshobson/agents` | `README.md:524` — credits; also cited in `CREATOR_NEEDS.md:207` as having "108 agent patterns" |
| `https://github.com/obra/superpowers` | `README.md:525` — credits |
| `https://github.com/diet103/claude-code-infrastructure-showcase` | `README.md:526` — credits |
| `https://github.com/ruvnet/agentic-jujutsu` | `README.md:530` — credits |
| `https://modelcontextprotocol.io/` | `README.md:532` — MCP homepage |
| `https://claude.ai/claude-code` | `README.md:532` — Claude Code homepage |

---

## Summary of Critical Findings

1. **Agent count (38 claimed, 142 actual)** — The most significant factual error. The taxonomy table in the README accounts for only ~39 agents; the remaining ~103 are real shipped files with no documentation. Immediate fix: audit which agents are meant to be user-facing and update the count, or document the full set.

2. **Plugins (8 claimed, 0 shipped locally)** — The plugin system is aspirational and lives in a separate repo. `plugin.json` explicitly flags this internally but README presents plugins as currently installable. Add a clear "requires separate install from `agentic-creator-skills`" callout.

3. **`/ultrawork` and `/design-gods` (QUICKSTART.md)** — Two of the four "Try These First" commands are either renamed (`ultrawork` → `ultraworld`) or nonexistent (`design-gods`). Highest impact on new user experience.

4. **Adapter directories (4 of 5 missing)** — README directory tree lists `adapters/cursor/`, `adapters/windsurf/`, `adapters/gemini/`, `adapters/generic/` but only `adapters/opencode/` exists. The install.sh flags exist and work, but the file-based adapters described in the tree do not.

5. **USAGE_GUIDE.md is v5 content in a v11 package** — The guide header reads "ACOS v5" and the footer reads "Version: 5.0.0 | Skills: 70 | Agents: 10". It should be either updated or retired.

6. **CLAUDE.md footer says v10.1** — Minor version tag in the footer, 2 major versions behind.
