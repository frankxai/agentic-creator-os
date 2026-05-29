# ACOS Departments + Agents Audit

Repo: `C:\Users\frank\starlight\repos\agentic-creator-os`
Date: 2026-05-28
Mode: READ-ONLY

---

## 1. Counts: actual vs claimed

### The claim

`package.json` advertises **"38 agents"** + 5 departments. `README.md`, `QUICKSTART.md`, and `CLAUDE.md` all repeat the 38 figure. The plugin manifest tells a different story:

```json
// .claude-plugin/plugin.json
"stats": { "skills": 10, "commands": 0, "agents": 0, "verified": "2026-05-03",
  "note": "Aspirational targets in docs/ACOS_V11_MASTER_PLAN.md
           (90+ skills / 65+ commands / 38 agents).
           Manifest reflects current shipped state, not aspiration." }
```

So the plugin manifest itself admits `agents: 0` and labels 38 as **aspirational**. The marketing surfaces (README, package.json, QUICKSTART) do not.

### The actual count

There is no `agents/` directory at repo root. The two real surfaces are:

1. **`departments/`** — 5 dept dirs, each with `agent.md` + `skill.md`. 5 "department lead" agent definitions total.
2. **`.claude/agents/`** — the bulk agent library, 21 subdirs deep.

Reproducible counts (PowerShell, run from repo root):

```powershell
# Department leads
(Get-ChildItem departments -Recurse -Filter agent.md).Count
# → 5

# .claude/agents — top-level loose files
(Get-ChildItem .claude\agents -File -Include *.md,*.json).Count
# → 69 (67 .md + 2 .json)

# .claude/agents — recursive (all definitions)
(Get-ChildItem .claude\agents -Recurse -File -Include *.md,*.json).Count
# → 148

# Excluding README.md / CLAUDE.md noise files
(Get-ChildItem .claude\agents -Recurse -File -Include *.md,*.json |
  Where-Object { $_.Name -notin 'README.md','CLAUDE.md' }).Count
# → 144

# Distinct agent identities (unique `name:` frontmatter values)
(Get-ChildItem .claude\agents -Recurse -Filter *.md |
  ForEach-Object { Get-Content $_.FullName -TotalCount 4 |
  Select-String '^name:\s*' } | Sort-Object -Unique).Count
# → 137
```

**Verdict:** 38 is wrong in both directions.

- If "agent" means *.claude/agents/ definition* → actual is **~144 files / 137 distinct names**, ~3.8× the claim.
- If "agent" means *registered in dept YAML rosters* → actual is **5** (the dept leads themselves; their named teams are ghosts, see §3).
- If "agent" means *the plugin manifest's count* → **0**.

No file enumerates exactly 38. The number appears to be marketing copy with no source of truth.

---

## 2. Per-department breakdown

Each department ships exactly two files: `agent.md` (the lead's system prompt + frontmatter) and `skill.md` (trigger phrases, capabilities, workflows). All five leads run on `model: sonnet`. None reference Frank DNA, FRANK_DNA.md, or the v10 safety hooks defined in root `CLAUDE.md`.

### 2.1 business/
- **Lead:** `business-department` (color: blue; tools: filesystem, database, email, creator-mcp)
- **Claimed team** (per `agent.md` + `skills/business.yaml`): CRM Agent, Finance Agent, Operations Agent, Legal Agent — plus `business-lead`, `crm-agent`, `finance-agent`, `operations-agent`, `legal-agent` in YAML.
- **Actual sub-agent files:** 0. None exist anywhere in `.claude/agents/`.
- **Skills:** `skills/business.yaml` (5-agent roster). `departments/business/skill.md` triggers: client management, CRM, invoicing, financial tracking.
- **Workflows referenced:** `business/client-onboarding.yaml`, `invoice-workflow.yaml`, `financial-review.yaml`, `lead-followup.yaml` — existence not validated here.
- **Voice:** precise with numbers, confirm before sending invoices. Generic ops-lead tone, no Frank DNA.
- **Scope:** CRM, invoicing, finance, ops, legal.

### 2.2 content/
- **Lead:** `content-department` (color: green; tools: filesystem, database, browser, website, email)
- **Claimed team:** Writer Agent, Editor Agent, Publisher Agent (agent.md) / `content-lead`, `writer`, `editor`, `publisher` (content.yaml).
- **Actual sub-agent files:** 0 with those exact names. The `.claude/agents/` library has 20+ writing-adjacent agents (`book-distiller`, `developmental-editor`, `line-editor-voice-alchemist`, `content-polisher`, `frankx-content-creation`, `social-content-generator`, `creator-book-writer`, `business-book-writer`, `fantasy-book-writer`, `deep-fiction-writer`, `golden-age-visionary`, `master-story-architect`, `publishing-strategist`, `prompt-*` family, etc.). None are wired to `content-department`.
- **Skills:** `skills/content.yaml` lists 12 slash commands (`/content-strategy`, `/linkedin-content`, `/x-content`, `/meta-content`, `/farcaster-content`, `/mirror-content`, etc.) and 12 workflows.
- **Voice:** "Be specific about platform requirements. Provide word count and reading time." Professional/generic, no Frank DNA.
- **Scope:** blog, social, newsletter, video script, SEO, multi-platform publish. This is the largest scope of any dept, both claimed and in available agents.

### 2.3 design/
- **Lead:** `design-department` (color: pink; tools: filesystem, database, browser, creator-mcp)
- **Claimed team:** Branding Agent, UI/UX Agent, Graphic Agent, Motion Agent.
- **Actual sub-agent files:** 0 with those names. Related but unconnected agents in `.claude/agents/`: `accessibility-auditor`, `nano-banana-image-generation`, `ui-ux-design-guidance`, `ux-design-development`, `visual-brand-guidelines`, `template-design`.
- **Skills:** `skills/design.yaml` exists, triggers per `skills/CLAUDE.md`: "design logo", "create visual", "branding", "ui design".
- **Voice:** "Ask for brand guidelines if not provided. Present concepts before refining." Generic agency-creative tone.
- **Scope:** logos, brand identity, UI/UX, social graphics, presentations, motion. Overlaps with marketing on "social graphics" and with content on "presentations".

### 2.4 dev/
- **Lead:** `dev-department` (color: purple; tools: filesystem, database, browser, website-mcp)
- **Claimed team:** Frontend, Backend, DevOps, QA agents.
- **Actual sub-agent files:** 0 with those names. The `.claude/agents/development/`, `devops/`, `core/`, `architecture/`, `testing/`, `github/` (13 files), `analysis/`, `sparc/` (4) subtrees contain ~40+ engineering agents — `coder`, `tester`, `planner`, `reviewer`, `researcher`, `backend-dev`, `cicd-engineer`, `ml-developer`, `system-architect`, `code-analyzer`, the entire `github/` swarm family, plus `nextjs-vercel-deployment` and `frankx-website-builder` at top level. None claim membership in `dev-department`.
- **Skills:** `skills/dev.yaml` triggers: "create website", "build application", "develop", "code".
- **Voice:** "Confirm technical requirements upfront. Explain technical decisions." Standard senior-eng register, no Frank DNA.
- **Scope:** Next.js / React / Vue, APIs, Postgres/SQLite, Vercel/Railway/Netlify, Docker, monitoring. Heaviest overlap with the gstack sprint commands in root CLAUDE.md (`/office-hours`, `/review`, `/ship`, `/qa`) — dept is not aware of them.

### 2.5 marketing/
- **Lead:** `marketing-department` (color: orange; tools: filesystem, database, browser, website, email)
- **Claimed team:** SEO Agent, Content Marketing Agent, Paid Ads Agent, Analytics Agent, Social Agent (5 — the largest claimed roster).
- **Actual sub-agent files:** 0 with those names. `.claude/agents/seo_specialist.md` exists at top level but has NO yaml frontmatter (orphan format) and is not linked to `marketing-department`. `viral-content-strategy.md` and `social-content-generator.md` are loose top-level files.
- **Skills:** `skills/marketing.yaml`. Triggers: "seo audit", "marketing campaign", "analytics", "keyword research".
- **Voice:** "Set clear KPIs upfront. Test continuously. Iterate based on performance." Data-driven growth-marketer tone.
- **Scope:** SEO, content marketing, paid ads, analytics, social. **Major overlap with content/** on "content marketing", "blog strategy", "social".

---

## 3. Orphans + ghosts

### Ghosts (registered but file missing)

The `business.yaml`, `content.yaml`, `design.yaml`, `dev.yaml`, `marketing.yaml` skill manifests collectively register **23 named sub-agents**: `business-lead`, `crm-agent`, `finance-agent`, `operations-agent`, `legal-agent`, `content-lead`, `writer`, `editor`, `publisher`, `dev-lead`, `frontend-agent`, `backend-agent`, `devops-agent`, `qa-agent`, plus the design and marketing rosters from their respective `agent.md` files.

Grep confirms zero matches for any of these slugs in `.claude/agents/`. **All 23 sub-agent rosters are ghosts.** The 5 department-lead `agent.md` files are the only real artifacts behind the dept system.

### Orphans (file exists but unregistered)

`.claude/agents/` is dominated by orphans relative to the department system. Three categories:

1. **Format orphans** — three files at top level have no yaml frontmatter (so they cannot be invoked as Claude Code sub-agents): `seo_specialist.md`, `strategist.md`, and `CLAUDE.md` (the last is a claude-mem context file, expected).
2. **Naming orphans** — the bulk Synthetic Intelligence library (`consensus/` 8, `hive-mind/` 5, `swarm/` 4, `sparc/` 4, `optimization/` 6, `github/` 13, `sublinear/` 5, `goal/` 3, `sona/` 1, `analysis/` 3, `testing/` 4, `templates/` 9, `data/`, `payments/`, `documentation/`, `custom/`, `specialized/`) appears to be a wholesale import from claude-flow or a similar swarm framework. None of these reference `business/`, `content/`, `design/`, `dev/`, or `marketing/` as their department.
3. **Brand-aligned orphans** — `frankx-content-creation`, `frankx-website-builder`, `golden-age-visionary`, `luminor-strategic-guidance`, `starlight-architecture-design`, `starlight-orchestrator`, the `meta-*` family (9), the `prompt-*` family (13). These ARE Frank-brand work but live entirely outside the dept system.

### Net

If you treat the dept skill YAMLs as the registry, **23 ghosts + ~135 orphans**. The dept system and the `.claude/agents/` library are two parallel, unconnected universes. The "38 agents" claim correlates to neither.

---

## 4. Voice + brand alignment

### Frank DNA penetration

Root `CLAUDE.md` mandates: *"Every agent in ACOS inherits the Frank DNA … Cool, ultra high status, premium quality, high intellect, purpose-driven, FUN. Direct. Technical. Warm. Playful."*

Grep for `Frank DNA | Systems Architect × Composer × Gamer × Builder` across `.claude/agents/`: **3 hits** (`luminor-strategic-guidance`, `starlight-architecture-design`, `integrity-guard`). Out of ~137 agents — a **~2% inheritance rate**.

Across the 5 department `agent.md` files: **0 references** to Frank DNA, the FrankX brand voice, the "show don't tell" rule, the language-judgment table, or the safety hooks. Every dept lead reads like a generic SaaS assistant ("Be precise with numbers", "Set clear KPIs upfront").

### Voice consistency

The 5 dept leads use the same template (frontmatter → Your Team → Core Responsibilities → How You Work → Workflows → Metrics → Interaction Style) and the same neutral-corporate register. They are internally consistent with each other — and uniformly disconnected from Frank's actual voice as defined in `CLAUDE.md` and `instances/frankx/config.json` ("provocative, visionary, bold, transformative, paradigm shift").

The `.claude/agents/` library is the opposite: highly varied. The `frankx-*` and `golden-age-visionary` files do carry brand voice. The `consensus/`, `hive-mind/`, `swarm/` files read as upstream framework imports with no Frank touch. The book-writing family (`master-story-architect`, `deep-fiction-writer`, etc.) has its own literary voice.

### Inter-department overlap

Real conflicts where two depts claim the same task:

- **Social media graphics** → design (Graphic Agent) AND marketing (Social Agent) AND content (Publisher).
- **SEO / blog optimization** → content (SEO optimization in skill.md) AND marketing (SEO Agent + on-page optimization).
- **Newsletter content + send** → content (Newsletter copy + Publisher) AND marketing (Email sequences under Content Marketing) AND business (no, business is invoices not newsletters — clean here).
- **Landing pages** → design (Landing Page Design workflow) AND dev (Frontend / Website Creation).
- **Brand guidelines** → design (Brand Creation workflow) AND content (implicit via `frankx-brand` skill dependency in `skills/registry.json`).

No router or precedence rule resolves these. The `meta-acos-router.md` agent exists but does not reference the dept system in its frontmatter.

### Brand alignment

`instances/frankx/config.json` defines the FrankX brand voice (provocative / visionary / transformative; avoidKeywords: mainstream, conventional, status quo). None of the 5 dept leads honor it. The leads default to a tone that uses exactly the language Frank's config tells them to avoid (`professional`, `corporate metrics`, `streamline workflows`).

**Bottom line on brand:** ACOS has world-class brand definition (Frank DNA in CLAUDE.md + instances/frankx/config.json) and a department layer that doesn't read either. The two are wired in series only by aspiration.

---

## Quick fixes (not done, just flagged)

1. Reconcile `package.json` "38 agents" with `.claude-plugin/plugin.json` `agents: 0`. Either count `.claude/agents/` actual files (~137) or pick a curated 38 and write a registry that points at them.
2. Either (a) create the 23 ghost sub-agents as real `.md` files inside `departments/<dept>/agents/` and reference them, or (b) delete the team rosters from each `agent.md` and `skills/*.yaml`.
3. Inject the Frank DNA preamble (or a one-line `inherits: frank-dna` directive) into every dept lead frontmatter so they actually embody what CLAUDE.md mandates.
4. Decide ownership for the four overlap zones (social graphics, SEO, newsletter, landing pages) — most natural: marketing owns SEO + paid + analytics; content owns copy + social text + newsletter copy; design owns visuals; dev owns code.
5. The two format-orphan files (`seo_specialist.md`, `strategist.md`) need yaml frontmatter or should move out of `.claude/agents/`.
