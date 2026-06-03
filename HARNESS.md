# Harness — agentic-creator-os (ACOS)

**Profile:** B — Skills / Agents / Plugin pack
**Stack installed:** L0 ☑ (truth counts) · L1 ☑ (CI ready) · L2 ☑ (frontmatter lint) · L3 ☐ (activation/E2E evals — recommended next) · L4 ☐ · L5 ☐
**Last verified:** 2026-06-03

## Claimed vs verified (the headline number)

Run: `node test/inventory-truth.mjs`

| Asset | Claimed (README) | Verified | Verdict |
|---|---|---|---|
| Skills | 90+ | **165** `SKILL.md` under `.claude/skills/` | ✅ under-claimed (reality nearly 2×) |
| Commands | 65+ | **77** top-level `.md` (166 incl. nested) under `.claude/commands/` | ✅ under-claimed |
| Agents | 38 | **69** top-level (`.md`+`.json`, 148 incl. nested) under `.claude/agents/` | ✅ under-claimed |
| Plugins | 8 | **1** `plugin.json` manifest; no `marketplace.json` found | ⚠️ **DRIFT** — "8 plugins" not substantiated by manifests |

The substance is real and exceeds the marketing copy for skills/commands/agents. The only
overstatement is "8 Plugins" — there is one plugin manifest at `.claude-plugin/plugin.json`.
Either ship the other 7 manifests or correct the count to "1 plugin (N bundled capabilities)."

## Frontmatter validity (L2 lint) — 150/165 valid

15 `SKILL.md` files are **not spec-conformant** (no YAML frontmatter block, or missing
`name`/`description`):

```
excellence-book-writing, nextjs-agent-team, nextjs-expert, nextjs-react-expert,
nextjs-upgrade-assistant, oracle-ai-architect, oracle-database-expert,
oracle-diagram-generator, product-management-expert, safety-guard, security-auditor,
skill-stocktake, social-media-strategy, video-production-workflow, web-design-expert
```

**Precise impact:** these will not be discovered by *native* Claude Code skill loading or by
portable/junction installs that read frontmatter. ACOS's own `.claude/skill-rules.json`
(keyword activation) may still fire them in-repo — so they are not necessarily "dead," but they
are non-portable and fail the spec. Fix = add `---\nname: …\ndescription: …\n---` headers.
This is a clean, bounded fix-list (15 files).

## Run it

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
node test/inventory-truth.mjs    # prints deltas; exit 1 while any frontmatter invalid
```

## CI

`.github/workflows/harness.yml` written + ready (runs the truth/lint pass on push/PR). **Not
committed** — token lacks `workflow` scope (`gh auth refresh -s workflow`). See `BLOCKERS.md`.

## Golden dataset / next layer

**Not built tonight (honest gap):** the L3 activation-precision eval and the 5 headline-pipeline
E2E evals (blog→social, music→video, research→report) require golden datasets + running the live
agent harness — out of scope for one overnight pass without overstating. This is the single
highest-leverage next investment for ACOS: it would turn "165 skills exist + valid frontmatter"
into "skills fire correctly and produce coherent artifacts, scored." Recommended in `BLOCKERS.md`.

## Demo today

**Partial** — `node test/inventory-truth.mjs` proves the inventory is real and mostly conformant.
The *behavioral* demo (skills firing E2E) is the next milestone, not yet provable.

## Status: **NEEDS-WORK**

Not because the substance is thin — it's substantial and largely under-claimed — but because
(a) the "8 plugins" claim is unsubstantiated, (b) 15 skills fail the frontmatter spec, and
(c) there is no behavioral proof (activation/E2E) yet. Fix those three and ACOS is SELLABLE with
a defensible "165 skills / 77 commands / 69 agents, all activation-tested" claim.
