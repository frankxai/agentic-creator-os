# Skills System Audit — ACOS

**Repo:** `C:\Users\frank\starlight\repos\agentic-creator-os`
**Date:** 2026-05-28
**Mode:** READ-ONLY

> TL;DR — There are **two parallel skill systems** in this repo that disagree with each other. `package.json` claims "90+ skills"; the top-level `skills/` directory has **19** skill folders backed by **17** entries in `registry.json`. The other tree, `.claude/skills/`, has **97** top-level skill folders with a SKILL.md (102 dirs total, 5 are non-skill collections). Neither tree is referenced by the other, and `skill-rules.json` only auto-activates 24 of them. Five skills in `.claude/skills/` are **zero-byte stubs**, and one (`anthropic/template-skill`) is the literal Anthropic template placeholder.

---

## 0. Reproducible commands used

```bash
# Tree A — top-level skills/ (the one referenced by package.json files[])
cd skills && ls -d */                                       # 9 dirs
find skills -name SKILL.md -o -name skill.yaml -o -name skill.md | wc -l   # 21 files
node -e "const d=require('./skills/registry.json'); \
         console.log(Object.keys(d.skills).length)"          # 17 registry entries

# Tree B — .claude/skills/ (the one referenced by CLAUDE.md and skill-rules.json)
ls .claude/skills | wc -l                                    # 104 entries
ls -d .claude/skills/*/ | wc -l                              # 102 dirs
find .claude/skills -maxdepth 2 \( -name SKILL.md -o -name skill.md \) | wc -l   # 97 skills
find .claude/skills -name SKILL.md -o -name skill.md | wc -l                     # 167 (incl. nested gstack tree)

# How many auto-activate?
grep -c '"skill":' .claude/skill-rules.json                  # 24

# Zero-byte stub detection
find .claude/skills -maxdepth 2 -name SKILL.md -size 0       # 5 stubs
```

The "90+" claim only holds if you count `.claude/skills/` AND the 16 sub-skills inside `.claude/skills/anthropic/` AND don't deduct the 5 zero-byte stubs. The 17-entry `skills/registry.json` does **not** describe the system the rest of the repo actually uses.

---

## 1. Counts: actual vs claimed

| Source | Claim | Actual |
|---|---|---|
| `package.json` description | "90+ skills" | depends on tree counted (see below) |
| Root `CLAUDE.md` v10 | "75+ Skills" | 97 top-level SKILL.md in `.claude/skills/` |
| `skills/registry.json` `skills` object | 17 registered | 17 entries (17 mapped into 4 categories) |
| Top-level `skills/` dir on disk | n/a | 19 distinct skill folders, 21 SKILL.md/skill.yaml files |
| `.claude/skills/` dir on disk | n/a | 102 top-level dirs; 97 with a SKILL.md/skill.md; 5 are config/collection dirs (anthropic, gsd, newsletter, profiles, research) |
| `.claude/skill-rules.json` auto-activation | implicit "all" | 24 skills wired for auto-activation |
| `.claude/skills/skill-rules-v11.json` | "v11" | exists but `path` keys count = 0; appears to be a category index, not activation rules |
| `skills/CLAUDE.md` skill list | 5 YAML departments | 5 YAML files present (business/content/design/dev/marketing) |

**Bottom line:** the "90+" marketing number is roughly defensible *only* if you count `.claude/skills/` (97 with SKILL.md). The top-level `skills/` tree that `package.json` `files[]` ships only has 17–19 skills. These are two unrelated systems sharing a name.

---

## 2. Per-skill table

### Tree A — top-level `skills/` (shipped via `files[]` in package.json)

| Name | Dept (registry category) | File path (relative to repo root) | Bytes | Stub? |
|---|---|---|---:|---|
| blog-writing | (none) | `skills/blog-writing/SKILL.md` | 5,971 | no |
| content-strategy | creative | `skills/content-strategy/SKILL.md` | 14,993 | no |
| creative/content-strategy | (dup) | `skills/creative/content-strategy/SKILL.md` | 1,864 | YES (thin) |
| newsletter | (none) | `skills/newsletter/SKILL.md` | 9,814 | no |
| seo-optimization | (none) | `skills/seo-optimization/SKILL.md` | 9,159 | no |
| social-media | (none) | `skills/social-media/SKILL.md` | 7,584 | no |
| soulbook/7-pillars | soulbook | `skills/soulbook/7-pillars/skill.yaml` (no SKILL.md) | 2,645 yaml + 7,627 CLAUDE.md | no |
| technical/agentic-orchestration | technical | `skills/technical/agentic-orchestration/skill.yaml` (no SKILL.md) | 2,064 yaml + 9,312 CLAUDE.md | no |
| technical/api-design | (none) | `skills/technical/api-design/SKILL.md` | 7,059 | no |
| technical/async-python | (none) | `skills/technical/async-python/SKILL.md` | 7,622 | no |
| technical/ci-cd-pipeline | (none) | `skills/technical/ci-cd-pipeline/SKILL.md` | 5,718 | no |
| technical/creator-intelligence | technical | `skills/technical/creator-intelligence/SKILL.md` | 2,018 + 2,122 yaml + 4,257 CLAUDE.md | borderline (SKILL.md is thin) |
| technical/database-migrations | (none) | `skills/technical/database-migrations/SKILL.md` | 6,199 | no |
| technical/docker-containers | (none) | `skills/technical/docker-containers/SKILL.md` | 5,256 | no |
| technical/documentation-generation | (none) | `skills/technical/documentation-generation/SKILL.md` | 7,039 | no |
| technical/mcp-architecture | technical | `skills/technical/mcp-architecture/skill.yaml` (no SKILL.md) | 1,969 yaml + 5,540 CLAUDE.md | no |
| technical/monitoring-observability | (none) | `skills/technical/monitoring-observability/SKILL.md` | 6,597 | no |
| technical/security-hardening | (none) | `skills/technical/security-hardening/SKILL.md` | 7,263 | no |
| video-script | (none) | `skills/video-script/SKILL.md` | 8,019 | no |

Plus `skills/{business,content,dev,design,marketing}.yaml` (822–1,310 bytes each) which are **department definitions**, not skills.

### Tree B — `.claude/skills/` (the system CLAUDE.md actually documents, 97 entries)

A full per-skill table for 97 skills would blow the word budget. Top-line stats:

- **Zero-byte stubs (definitely broken):** `nextjs-react-expert/SKILL.md`, `oracle-database-expert/SKILL.md`, `product-management-expert/SKILL.md`, `social-media-strategy/SKILL.md`, `video-production-workflow/SKILL.md`. All five are referenced in `.claude/skill-rules.json` as auto-activate-able — so 5 of the 24 auto-activated skills will load empty content.
- **Template placeholder still present:** `.claude/skills/anthropic/template-skill/SKILL.md` is the verbatim Anthropic skill template (140 bytes, "Replace with description of the skill and when Claude should use it.").
- **Tiny skills (<2 KB SKILL.md, likely stubs):** `security-auditor` (1,358), `internal-comms` (1,511), `safety-guard` (1,764), `brand-guidelines` (2,235), `memory-guardian` (2,244), `skill-comply` (2,356), `verification-loop` (2,491), `ai-architecture` (2,595).
- **Largest skills (substantial content, >25 KB):** `hooks-automation` (31,346), `oracle-diagram-generator` (30,674), `github-release-management` (29,643), `gstack` (29,198), `github-project-management` (28,403), `health-nutrition-expert` (26,837), `github-code-review` (26,048), `pptx` (25,551), `sparc-methodology` (25,045).
- **Median SKILL.md size:** ~12 KB (healthy).
- **Bundled Anthropic skills:** 16 sub-skills inside `.claude/skills/anthropic/` (`algorithmic-art`, `artifacts-builder`, `brand-guidelines`, `canvas-design`, `docx`, `frontend-design`, `internal-comms`, `mcp-builder`, `pdf`, `pptx`, `skill-creator`, `slack-gif-creator`, `template-skill`, `theme-factory`, `webapp-testing`, `xlsx`). 15 of these are **also duplicated** at the top level of `.claude/skills/` — see §3.
- **Nested gstack tree:** `.claude/skills/gstack/.agents/skills/` holds ~70 more `gstack-*/SKILL.md` files (counted in the 167 grand total but not in the 97 top-level count).

---

## 3. Registry vs filesystem

### Tree A — `skills/registry.json` cross-check

| Registry name | On disk? | Path expected |
|---|---|---|
| content-strategy | yes | `skills/content-strategy/SKILL.md` + duplicate at `skills/creative/content-strategy/` |
| mcp-architecture | yes | `skills/technical/mcp-architecture/` (no SKILL.md, only skill.yaml + CLAUDE.md) |
| claude-sdk | **NO** | none under `skills/` |
| langgraph-patterns | **NO** | none under `skills/` |
| frankx-brand | **NO** | none under `skills/` (lives in `.claude/skills/frankx-brand/`) |
| suno-mastery | **NO** | none under `skills/` (lives in `.claude/skills/suno-ai-mastery/` — name mismatch) |
| oci-services | **NO** | none under `skills/` (lives in `.claude/skills/oci-services-expert/` — name mismatch) |
| oracle-adk | **NO** | none under `skills/` (lives in `.claude/skills/oracle-adk/`) |
| 7-pillars | yes | `skills/soulbook/7-pillars/skill.yaml` |
| life-symphony | **NO** | nowhere on disk |
| golden-path | **NO** | nowhere on disk |
| workshop-building | **NO** | nowhere on disk |
| security-auditor | **NO** under `skills/` | exists at `.claude/skills/security-auditor/` |
| daily-ops | **NO** | nowhere on disk (closest: `.claude/skills/frankx-daily-execution/`) |
| publishing-factory | **NO** | nowhere on disk |
| creator-intelligence | yes | `skills/technical/creator-intelligence/` |
| agentic-orchestration | yes | `skills/technical/agentic-orchestration/` |

**Ghosts (registry → no file):** 11 of 17 registry entries — `claude-sdk`, `langgraph-patterns`, `frankx-brand`, `suno-mastery`, `oci-services`, `oracle-adk`, `life-symphony`, `golden-path`, `workshop-building`, `daily-ops`, `publishing-factory`. The registry is **65% phantom** with respect to the top-level `skills/` tree it lives in.

**Orphans (disk → not in registry):** every non-registered folder in `skills/` — `blog-writing`, `newsletter`, `seo-optimization`, `social-media`, `video-script`, `technical/api-design`, `technical/async-python`, `technical/ci-cd-pipeline`, `technical/database-migrations`, `technical/docker-containers`, `technical/documentation-generation`, `technical/monitoring-observability`, `technical/security-hardening`. **13 orphans.**

### Tree B — `.claude/skill-rules.json` cross-check (24 auto-activated)

All 24 entries reference paths under `.claude/skills/`. All 24 directories exist, but **5 are zero-byte stubs** (listed in §2). The remaining 73 skills in `.claude/skills/` are present but **not wired into auto-activation** — they only load if invoked explicitly.

### Tree A vs Tree B

- **Zero overlap by path.** Neither tree references the other.
- **Name collisions with diverging content:**
  - `content-strategy` exists in both trees (and also duplicated within Tree A at `skills/creative/content-strategy/`).
  - `mcp-architecture` exists in both (`skills/technical/mcp-architecture/` 1.9 KB yaml vs `.claude/skills/mcp-architecture/SKILL.md` 11 KB) — different content, different authors implied.
  - `agentic-orchestration` exists in both.
  - `security-auditor` registered in Tree A, present in Tree B.
- **Bundled Anthropic skills duplicated:** `.claude/skills/anthropic/{brand-guidelines,canvas-design,docx,frontend-design,internal-comms,mcp-builder,pdf,pptx,skill-creator,slack-gif-creator,theme-factory,webapp-testing,xlsx,algorithmic-art}` all have a sibling at `.claude/skills/<name>/`. Byte-size spot-checks suggest most are identical or near-identical copies (e.g., `brand-guidelines` 2,235 bytes in both; `pdf` 7,068 in both; `pptx` 25,551 in both; `docx` 10,150 in both). The `anthropic/` folder is effectively a vendored upstream that has been re-flattened to the top — **~14 duplicate skill pairs**.

---

## 4. Department-skill mapping check

The `skills/CLAUDE.md` doc claims 5 department YAMLs route to skills/workflows. Reality:

| Department | YAML present? | Lists skills? | Skills mapped to disk? |
|---|---|---|---|
| business.yaml | yes (822 B) | **no skills field — only `agents`, `tools`, `workflows`** | n/a |
| content.yaml | yes (1,310 B) | **no skills field** | n/a |
| design.yaml | yes (846 B) | **no skills field** | n/a |
| dev.yaml | yes (851 B) | **no skills field** | n/a |
| marketing.yaml | yes (903 B) | **no skills field** | n/a |

The department YAMLs only define `agents`, `tools`, `workflows`, `slash_commands`, and `configuration` — **they never reference skill names**. So:

- **No department → skill mapping exists in YAML.** The claim in `skills/CLAUDE.md` that skills live "in" departments is unbacked.
- `skills/registry.json` `categories` provides an alternative mapping into 4 buckets — `technical` (8 skills), `creative` (5), `business` (1), `soulbook` (3) — total 17, all 17 registry entries categorized. But these categories don't match the 5 department YAML names (`technical` ≠ `dev`, `creative` ≠ `content/design`, `soulbook` has no department, `marketing` department has no skills).
- `.claude/skill-rules.json` v8 uses its own 7 categories: `design`, `development`, `content`, `ai`, `music`, `brand`, `meta` — also doesn't match the department YAMLs.

**Three competing taxonomies, none aligned:** department YAMLs (5 names), registry categories (4 names), skill-rules v8 categories (7 names). The 97 skills in `.claude/skills/` are **un-departmented**: there is no single file that says which department any of them belongs to.

---

## 5. Top quality issues

1. **Two parallel skill trees with no cross-reference.** `skills/` (17 registry + 19 dirs) and `.claude/skills/` (97 dirs) are independent. `package.json` ships `skills/` to npm, but `CLAUDE.md` and `.claude/skill-rules.json` only consume `.claude/skills/`. Anyone installing the npm package gets the smaller, mostly-broken tree.
2. **`skills/registry.json` is 65% phantom.** 11 of 17 registered skills (`claude-sdk`, `langgraph-patterns`, `frankx-brand`, `suno-mastery`, `oci-services`, `oracle-adk`, `life-symphony`, `golden-path`, `workshop-building`, `daily-ops`, `publishing-factory`) have no SKILL.md anywhere under `skills/`. Several live under `.claude/skills/` with different names (`oci-services` → `oci-services-expert`; `suno-mastery` → `suno-ai-mastery`).
3. **13 orphans in `skills/` that the registry forgot.** All `technical/{api-design, async-python, ci-cd-pipeline, database-migrations, docker-containers, documentation-generation, monitoring-observability, security-hardening}` and the top-level `blog-writing`, `newsletter`, `seo-optimization`, `social-media`, `video-script`.
4. **5 zero-byte SKILL.md stubs in auto-activation path.** `nextjs-react-expert`, `oracle-database-expert`, `product-management-expert`, `social-media-strategy`, `video-production-workflow` are all referenced in `.claude/skill-rules.json` but contain literally nothing. Triggering them will silently no-op.
5. **Unedited Anthropic template lives in repo.** `.claude/skills/anthropic/template-skill/SKILL.md` is the placeholder ("Replace with description of the skill…"). Will be matched if any heuristic scans `description`.
6. **~14 duplicate skill pairs** between `.claude/skills/<name>/` and `.claude/skills/anthropic/<name>/` (brand-guidelines, canvas-design, docx, pdf, pptx, skill-creator, slack-gif-creator, theme-factory, webapp-testing, xlsx, algorithmic-art, frontend-design, internal-comms, mcp-builder). Byte sizes match — this is vendored-then-flattened, doubling maintenance surface.
7. **Inconsistent skill file naming.** Mix of `SKILL.md`, `skill.md` (worker-benchmarks, worker-integration), `skill.yaml` (Tree A only), and bare `CLAUDE.md`. `safety-guard/SKILL.md` has no YAML frontmatter at all. Tooling that greps for `^---\nname:` will miss several.
8. **No department mapping exists.** All 5 department YAMLs (`business.yaml` etc.) omit a `skills:` field. The skills-to-department relationship documented in `skills/CLAUDE.md` is **not represented anywhere on disk**.
9. **Auto-activation covers only 24/97 skills (25%).** The remaining 73 skills in `.claude/skills/` are dead unless invoked by exact slash command — most users won't know they exist.
10. **Marketing claim mismatch.** `package.json` says "90+ skills"; `CLAUDE.md` says "75+ skills"; `skills/registry.json` lists 17. Pick one.
11. **Naming drift between trees.** `suno-mastery` (registry) vs `suno-ai-mastery` (filesystem). `oci-services` vs `oci-services-expert`. `daily-ops` vs `frankx-daily-execution`. Any code that does `registry → load(path)` will hit FileNotFound on these.
12. **`skill-rules-v11.json` exists but has 0 path entries.** Looks like a half-migrated category index — neither v8 nor v11 is canonical.

---

### Files referenced

- `C:\Users\frank\starlight\repos\agentic-creator-os\package.json`
- `C:\Users\frank\starlight\repos\agentic-creator-os\CLAUDE.md`
- `C:\Users\frank\starlight\repos\agentic-creator-os\skills\registry.json`
- `C:\Users\frank\starlight\repos\agentic-creator-os\skills\CLAUDE.md`
- `C:\Users\frank\starlight\repos\agentic-creator-os\skills\{business,content,design,dev,marketing}.yaml`
- `C:\Users\frank\starlight\repos\agentic-creator-os\.claude\skill-rules.json`
- `C:\Users\frank\starlight\repos\agentic-creator-os\.claude\skills\skill-rules-v11.json`
- `C:\Users\frank\starlight\repos\agentic-creator-os\.claude\skills\anthropic\template-skill\SKILL.md` (template placeholder)
- Five zero-byte stubs under `C:\Users\frank\starlight\repos\agentic-creator-os\.claude\skills\{nextjs-react-expert,oracle-database-expert,product-management-expert,social-media-strategy,video-production-workflow}\SKILL.md`
