# ACOS — The L99 Blueprint

_One decisive engineering + go-to-market plan for the Agentic Creator OS._
_Produced 2026-07-08 from a 5-dimension, 11-agent architecture review grounded in real files._

---

**The through-line, stated once.** All five reviews found the same thing wearing five costumes: **the system is a beautifully-documented map of a system that does not execute.** The artifacts are genuinely deep where you sample them (`integrity-guard`, `santa-method`, `verification-loop`, `newsletter`, `meta-acos-router`) — but the connective tissue that would bind skills → routing → agents → memory → product is narrated, not wired. And the machine is optimized for _inventory size_ (117 skills, 147 agents, 4 catalogs, 5 half-built memory substrates) when the creator needs _precision and compounding_. Worse, it narrates capabilities it doesn't have (“ACOS Learning: X% avg success” over an empty store) — a direct violation of this repo's own Metrics-Truth / Karpathy doctrine.

**The L99 move is therefore not more architecture. It is delete, wire, and measure.**

---

## 1. Verdict — how good is it, truly, today

| Dimension | Score | One-line justification |
|---|---:|---|
| Naming & narrative coherence | **8** | SIS→ACOS spine, pillar/department language, connector `~~category` pattern — the story genuinely hangs together. Best asset. |
| Prompt / protocol design (IP) | **6** | santa-method, verification-loop, iterative-retrieval, model-routing are legitimately well-engineered — but 100% opt-in, zero telemetry. Unvalidated 6. |
| Skill-contract depth | **4** | The sampled contracts are deep; the score is the top 4% of a bimodal catalog with a thin long tail and no way to measure selection quality. |
| Reflection / critique enforcement | **3** | Excellent design (independent dual reviewers); runs only if a human invokes it. The one automated “critique” is a hardcoded template string. |
| Verification independence | **3** | Independence is defined but unenforced; `verification-loop` is self-review by the same agent; no default gate on publish/push. |
| Agent-team topology / dispatch | **3** | “Teams” are prose role labels, not spawnable agents; the Opus router reads `data/acos/agents.ts`, which **does not exist**; workflow YAMLs are orphaned. |
| Monetization mechanism | **2** | A `homepage:` URL in plugin metadata is not a ladder. No pricing, entitlement check, or checkout→pack gating exists. |
| Learning / memory closure | **2** | Hooks aren't registered in `settings.json` (nothing fires), `trajectories/` is absent, both DBs are the _same 155 KB seed copied twice_, scoring rewards `git push` not outcomes. |
| Product state spine / MCP wiring | **2** | The one real datastore (libsql) isn't in `.mcp.json`; the social layer is in-memory `Map()` with `// Simulate analytics`. Nothing persists. |
| Cross-repo mesh (single source of truth) | **2** | 117 skills are copy-pasted across repos, not shared. No symlinks, no workspace dep. “Hermes” orchestration tier is a phantom in one 9-line file. |

**The single ceiling-capping constraint:** the loop is open at both ends — **nothing is measured and nothing persists.** There is no success oracle (a run can't be graded true/false) and no connected state layer (drafts, analytics, voice corpus live in RAM and vanish). A premium creator OS's entire promise is _compounding_. Without an outcome signal feeding a durable store, every other upgrade polishes a stateless prompt-runner that learns nothing. **Fix this first; it is the gate under all the others.**

---

## 2. The Excellence Loop (L99) — the heart

The canonical per-task loop **every** workflow runs. Design principle: _default to a single capable agent on a linear pipeline; escalate to fan-out only where parallelism genuinely pays; and make the two irreversible things — verification and publish — structurally independent and measured._

```
1 IDEATE → 2 CRAFT → 3 PLAN-REVIEW → 4 EXECUTE → 5 CRITIQUE →
6 VERIFY → 7 LEARN (write outcome) → 8 INTERCONNECT (persist + attest)
          ⛔ SUCCESS ORACLE grades the run true/false  ← the keystone
```

| # | Step | Mechanism | State today | Build |
|---|---|---|---|---|
| 1 | **Ideate** | `/ideate` reads Notion voice-store + Exa/Firecrawl scan + trajectory recall | Static prose scaffolds | Make ideation data-driven: read the real voice corpus + recent winners, not a blank prompt. |
| 2 | **Craft** | `prompt-optimizer` / `craft-prompt` | Real, good | Enforce a structured-output contract per skill (declared `outputs` in frontmatter). |
| 3 | **Plan-review** | `/plan-review` (gstack CEO/Eng) | Prose, opt-in | Required gate for any multi-file/multi-step task; skip one-shots. |
| 4 | **Execute** | Domain-lead → single agent (default) or parallel Workers (exception) | No real dispatch | Generate a real agent registry; `dispatch:` block only where fan-out pays. |
| 5 | **Critique** | `santa-method` — two independent reviewers, no shared context, worst-of-N | Excellent design, opt-in | **Promote to an enforced gate** at Stop / `/publish` / `/factory`. Both must PASS. |
| 6 | **Verify** | `verification-loop` (code) / `integrity-guard` (content) | Real, self-run, unenforced | **Capture exit status as the outcome signal.** Cap `successScore ≤ 0.3` on failure. |
| 7 | **Learn** | ONE store — libsql `memory.db` (schema already has `patterns`, `trajectories`, `confidence`) | Cosplay: unwired, empty | `stop-finalize` INSERTs trajectory + outcome; `session-start` SELECTs top patterns for the task-type. Rip out activity-heuristic scoring. |
| 8 | **Interconnect** | Persist to state spine (Supabase `content`); carry “Built on SIP”; register in `ATTESTATIONS.md` | No persistence, no attestation | Persistence hook + ambient attestation (copy the pattern already live in `agentic-mind-os`). |

**The keystone — the Success Oracle.** A run is graded true/false against exactly two signals: (a) `verification-loop` exit status, and (b) a one-keystroke human verdict at Stop (`good` / `wrong`). Build it _before_ embeddings, routing, or DBs — exact task-type match on a populated store beats cosine similarity on zero rows. This one primitive converts the entire loop from open to closed.

---

## 3. Agent-team topology — prune the sprawl to a spine

Kill the fiction: _generate_ the missing `data/acos/agents.ts` from real agent frontmatter; demote `departments/*/agent.md` “teams” to domain notes; fence the 79 vendored claude-flow swarm/sparc agents into their own namespace or drop them. Reconcile the count (CLAUDE.md says 67, router says 99, disk says 147 → one derived number).

```
ROUTER  (deterministic keyword table + scored arbitration — NOT an Opus call)
   │  intent → one domain lead
   ├── Content Lead   ├── Visual Lead   ├── Audio Lead
   ├── Code Lead      ├── Growth Lead   └── Ops Lead
        │  DEFAULT: single capable agent, linear pipeline
        │  EXCEPTION (justified): parallel Workers, non-overlapping scopes
        ▼
   ⛔ CRITIC (independent, adversarial, fail-closed) → SYNTHESIZER (weighted merge)
```

- **Orchestrator = the deterministic keyword table, not the Opus router.** Routing is classification; don't burn an Opus subagent on a router that reads a missing file.
- **Six domain leads** (Content · Visual · Audio · Code · Growth · Ops) replace the three competing taxonomies (departments vs pillars vs flow-roles). Each is a real, spawnable agent.
- **Workers are the only executors.** Consolidate the 13 `prompt-*` agents behind one conductor; the 11 book agents behind `author-team`.
- **The Critic is the fan-out/verify spine** — one mandatory independent checker gating the irreversible, audience-facing boundary (`/publish`, `/factory`).
- **Do NOT spawn Writer/Editor/9×Platform-Writer agents.** That is the Agent-Explosion anti-pattern the system's own skill warns against. One strong drafter + a per-platform format pass beats nine agents fragmenting context.

**Build:** `scripts/build-agent-registry.mjs` walks `.claude/agents/*.md` frontmatter → emits `{subagent_type, domain, triggers, tools}`. The router's source of truth becomes derived from what exists — a phantom becomes impossible by construction.

---

## 4. Brand, naming & how we articulate it

| Level | Name | What it is |
|---|---|---|
| The OS | **ACOS — Agentic Creator OS** | Open-core umbrella: skills, the Excellence Loop, the six-lead topology. MIT. |
| The engine | **The Excellence Loop** | The canonical per-task loop (§2). The differentiator — nobody else ships a closed critique+learning loop for creators. |
| The surface | **The Studio** | The runnable product: dashboard + state spine + MCP connectors. Exists as `/studio` + `app/studio`. |
| The flagship pack | **Signal** — _the LinkedIn Authority Engine_ | First paid vertical on the Studio: draft → schedule → human-post → learn. |

**Positioning (one sentence):** _ACOS is the open operating system for creators who want to compound — an AI that gets measurably better at your voice, your timing, and your standards every week, because every piece of work runs an independent critique and writes back what worked._

**Open-core story:** the loop and skills are open (credibility, funnel, “read the source”). The Studio (persistence, dashboard, hosted queue) and the packs are commercial. Every artifact carries “Built on SIP.” The _thinking_ is free; the _compounding infrastructure_ is the product.

**Voice:** direct, technical, warm, understated. Lead with the mechanism (“independent dual-reviewer gate,” “outcome-scored memory”), never the adjective.

---

## 5. Product — how we sell and build

**The monetization ladder (a mechanism, not a story):**

1. **Open skills + the Loop** — free, MIT. Credibility and funnel. _Ship: it exists._
2. **Signal starter template** — one-time, ~$79. Draft engine + Notion calendar + Typefully queue + thin dashboard. _First thing that charges money._
3. **Paid packs** — ~$49 each: `music-lab`, `design-excellence`, `research-hub`. Entitlement-gated.
4. **SaaS / AaaS** — subscription: **hosted Studio** where the loop runs self-service, analytics accumulate, the voice model improves. The recurring hook.
5. **Done-with-you** — retainer: estate/advisory (the `estate-army-commissioning` workflow already exists in SIS).

**The surface (Studio = dashboard + DB + MCP):**
- **DB:** Supabase (Postgres + auth + realtime) for app/queue; libsql/Turso for fast agent-local memory. One `content` table: `id, body, platform, status ∈ {draft,scheduled,posted}, scheduled_for, external_ref, metrics_json`.
- **MCP:** a real `.mcp.json` wiring `database` (autoStart:true), `browser` (Playwright), `higgsfield`, `notion`, Supabase — so advertised tools actually exist. Drop the Neon/Resend/Figma fiction from `CONNECTORS.md`.
- **Dashboard:** `app/studio/social/page.tsx` (today 19 static lines) reads the queue: Drafts → Scheduled → Posted → Performance. Built on `v0` + existing `app/api/*` — no net-new framework.

**Ship first:** the state spine. Nothing on rungs 2–5 charges money until drafts persist, analytics accumulate, and the loop demos end-to-end.

---

## 6. The real tooling stack — decisive picks

| Layer | Pick | Why |
|---|---|---|
| Ingestion | **Firecrawl** (URL→markdown) + **Exa** (neural search) | Firecrawl feeds “one idea → many formats”; Exa's semantic search beats keyword for _finding what to react to_. Skip Apify unless bespoke scrapers needed. |
| Scheduling | **Vercel Cron** over the Supabase queue | Creator cadence is hourly-at-most, human-gated. Managed cron over the state table is the whole job. Keep it boring. |
| Memory / DB | **Supabase** (app/queue/auth) + **libsql/Turso** (agent-local) | Supabase gives the dashboard Postgres+auth+realtime; libsql stays fast local memory. Add a vector column _after_ rows exist. |
| Knowledge | **Notion** | Already the only social-adjacent server making real API calls. It's the voice corpus the Ideate step reads. |
| Dashboard | **Next.js + v0 + Vercel** | The site is already Next/Vercel; v0 generates Studio panels fast against existing tokens. Zero new stack. |
| Browser-in-loop | **Playwright** (verify/scrape) + **Claude-in-Chrome** (human-supervised post) | Playwright for QA/read-only; Chrome-in-loop is the ToS-compliant way a human confirms the actual post. |
| Distribution | **Typefully** (default, official API) + **Postiz** (self-host option) | Both keep a human in the publish loop → ToS-safe. Typefully for polish now; Postiz for the open-core ethos. |

**The ToS-safe LinkedIn posture (non-negotiable):** LinkedIn's terms forbid automated posting via unofficial means. **Signal never auto-posts.** The honest, compliant, _simpler_ design: generate → persist to `content` → export as an official LinkedIn/Typefully **draft** → **a human clicks post.** Rip out every `new Map()` / `// Simulate analytics` path — the simulation is _more_ code than the honest pipeline. Analytics come read-only via the official API (or manual entry) and feed the Success Oracle.

---

## 7. Slash commands & the workflows behind them

**General OS — the Excellence Loop, exposed:** `/ideate` · `/craft` · `/plan-review` · `/factory` · `/critique` (enforced santa-method) · `/verify` · `/learn` (missing today — build it) · `/publish` (Critic gate + attestation + persist).

**Signal (LinkedIn) — the vertical:**

| Command | Workflow |
|---|---|
| `/signal plan` | Weekly cadence: pick pillars, slot the Notion calendar |
| `/signal draft` | Idea/source (Firecrawl) → LinkedIn draft in-voice → persist as `draft` |
| `/signal critique` | `integrity-guard` voice + claim + hook check (the Critic, content-tuned) |
| `/signal repurpose` | Fetch a great clip/post → credited reframe draft (the highest-ROI motion) |
| `/signal ship` | Export to Typefully draft via official API → **human posts** → mark `scheduled/posted` |
| `/signal learn` | Pull analytics → write outcome to the store → voice model improves next week |

The general commands _are_ the Signal commands with a LinkedIn skin — the open-core→pack story made concrete.

---

## 8. The 90-day build sequence — ordered to compound

**Phase 0 · Weeks 1–2 · Truth foundation (the gate — do nothing else first).** Build the **Success Oracle** (verification exit status + one-keystroke human verdict → trajectory row). Move the `hooks` block from orphan `hooks.json` into `settings.json`. Pick ONE store (libsql `memory.db`); quarantine the other four. **Kill the “X% avg success” banner** until the number is real.

**Phase 1 · Weeks 3–4 · Catalog & registry sanity.** Collapse to one skill catalog; _generate_ `registry.json` + `skill-rules.json` from frontmatter with a CI check; cull the routable surface to ~35 jobs-to-be-done. Bring routing in-repo + add `eval/routing.jsonl` (50 prompts → expected skills). Run `build-agent-registry.mjs` → ship the real `data/acos/agents.ts`.

**Phase 2 · Weeks 5–6 · The enforced Critic.** Promote `santa-method` to an enforced fail-closed gate on `/publish` and `/factory`. Write each verdict back as a labeled `trajectory_step` — this fuses verification into learning.

**Phase 3 · Weeks 7–9 · State spine + Signal MVP (first thing that bills).** Wire `database` into `.mcp.json`; create the `content` table. Rip out the `Map()` simulations; ship the honest draft pipeline via Typefully official API. Ship `/signal draft|plan|ship|learn` + the thin `app/studio/social` dashboard.

**Phase 4 · Weeks 10–12 · Package, sell, interconnect.** Package **Signal** as the paid template; add entitlement/checkout gating. One real mesh wire: shared skills via pnpm-workspace/symlink (kill the 117-copy duplication) + the “Built on SIP” attestation hook; delete the phantom Hermes tier. Close the Signal learning loop so the compounding claim becomes _true_.

**Why this order compounds:** the Oracle (P0) makes every later step measured; catalog sanity (P1) makes routing work; the enforced Critic (P2) makes quality structural and mints labeled data; the state spine + Signal (P3) make it real and sellable; packaging + mesh (P4) make it compound and ship. Each phase is worthless-to-dangerous without the one before it — which is exactly why the system stalled: it built P4-shaped surface (marketplaces, 147 agents, transmission channels) on a missing P0.

---

**Bottom line.** You have the best _narrative_ and a genuinely strong _protocol library_ in the space. What you do not yet have is a system that measures itself or remembers anything. Build the Success Oracle and the state spine first, enforce one independent Critic at the publish boundary, cut the inventory by two-thirds, and ship **Signal** as the proof. Do that in 90 days and ACOS stops being a map of an operating system and becomes one.
