---
name: hub-audit
description: Quarterly excellence sweep on one site hub. Composes /v (Vercel swarm) + /seo-check + /vis-audit + brand voice gate + design-gods review against a single public route. Raises the floor on every hub without re-inventing the prompt.
triggers:
  - /hub-audit
  - /audit-hub
arguments:
  - name: hub
    required: true
    enum: [library, studio, watch, workshops, research, partnerships, papa, os, intelligence-system, familie, prompt-library, blog, newsletter]
    description: Which hub to audit (must be a top-level public route on frankx.ai)
  - name: mode
    required: false
    enum: [quick, deep]
    default: quick
    description: quick = read-only audit + recommendations. deep = also generates a fix manifest with file:line diffs.
---

# /hub-audit — Single-Hub Excellence Sweep

The site has 9+ public hubs. Without a scheduled audit, excellence is implicit (worked on the day it shipped, drifts thereafter). This command runs **all the gates against one hub on rotation** — Saturday by default in the weekly cadence.

## When to run

| Trigger | Action |
|---|---|
| Saturday rotation | Cycle through hubs week-by-week (Library → Studio → Watch → Workshops → Research → Partnerships → Papa → OS → repeat) |
| Pre-launch | Audit Inner Circle before June 1 launch, audit Newsletter before Issue 1 send |
| Post-major-edit | Any time a hub gets 5+ files changed |
| Bug report | Reader/operator surfaces a brand, performance, or accessibility issue |

## What it composes

```
                         /hub-audit <hub>
                                │
        ┌─────────────────┬─────┴─────┬──────────────────┐
        ▼                 ▼           ▼                  ▼
    /v BUILD          /seo-check   /vis-audit       brand-voice
   (Lighthouse,      (schema,      (image          gate (banned
    a11y, perf,       FAQs, meta,   registry,       phrases, AI-slop,
    bundle size)      AEO, OG)      alt text,       Arcanea-leak
                                    LCP imgs)       on FrankX surfaces)
                                │
                                ▼
                       @design-gods review
                       (taste.md 8-step polish pass +
                        baseline-ui + ui-ux-pro-max
                        acceptance criteria)
                                │
                                ▼
                       Verdict report:
                       PASS  / WARN N / FAIL N
                       + per-finding file:line + fix priority
```

## Acceptance criteria (gates that must pass)

1. **Performance** — LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms, Lighthouse Performance ≥ 90.
2. **Accessibility** — WCAG 2.2 AA. Lighthouse a11y ≥ 95. Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text + UI.
3. **SEO + AEO** — H1 unique. H2s question-based where appropriate. FAQ schema if FAQ exists. Article/CollectionPage/Review schema as appropriate. OG image present, 1200×630, ≤ 200KB.
4. **Internal linking** — every page on the hub links to ≥ 3 related pages + ≥ 1 conversion surface (Inner Circle / Newsletter / Waitlist).
5. **Brand voice** — no banned phrases (delve, dive into, certainly, absolutely, it's worth noting). No "AI Systems Architect" (must be "AI Architect"). No Arcanean mythology unless route is `/ultraworld/*`.
6. **Visual quality** — all hero images ≥ 2K res. No placeholder strings. Alt text present + descriptive. Registry entry in `data/vault-manifest.json`.
7. **Design contract** — tokens from `design.md` honored. The 8-step `taste.md` polish pass scored ≥ 7/10.
8. **Conversion** — every detail page has ≥ 1 primary CTA above the fold. CTAs route to one of the three waitlist surfaces.

## Workflow

### Step 1: Discover the hub surface

```bash
# Get all routes under the hub
find app/<hub> -name "page.tsx" -o -name "page.mdx" | head -50

# Get all components for the hub
find components/<hub> -type f 2>/dev/null | head -50

# Get all content
find content/<hub> -type f 2>/dev/null | head -50
```

Quote the count of routes + components + content files.

### Step 2: Dispatch the gates in parallel

```
Task @nextjs-vercel-deployment + @performance-guardian → /v BUILD audit on the hub root + 3 sample detail pages
Task /seo-check on hub root + index page (schema, meta, OG, AEO)
Task @visual-vis-registry → registry audit for hub images
Task brand-voice gate → grep for banned phrases + brand violations across hub files
Task @visual-design-gods → design review against taste.md against 2 representative routes
```

Run all in parallel — no dependencies between them.

### Step 3: Synthesize findings

Aggregate into one report:

```markdown
# /hub-audit <hub> — 2026-MM-DD

**Hub:** /<hub>
**Routes audited:** N
**Verdict:** PASS / WARN (X warnings) / FAIL (X failures)

## Gates
| Gate | Score | Verdict |
|---|---|---|
| Performance | LCP 1.8s / CLS 0.04 / INP 120ms | PASS |
| Accessibility | Lighthouse 97 | PASS |
| SEO + AEO | 4/5 pages have schema | WARN (1 missing on /<hub>/<slug>) |
| Internal linking | avg 4.2 links/page | PASS |
| Brand voice | 0 banned phrases | PASS |
| Visual quality | 2 hero images < 2K | WARN |
| Design contract | taste score 8/10 | PASS |
| Conversion | 1 page missing CTA above fold | WARN |

## Findings (priority order)
1. [SAFE] file.tsx:42 — Hero image is 1024×683, regenerate at 2K via /infogenius
2. [SAFE] file.tsx:88 — Missing CTA above fold on /<hub>/<slug>
3. [DECIDE] file.tsx:7 — JSON-LD missing on this page; Frank confirms type

## Fix manifest
[deep mode only — unified diffs written to .agent/audits/<date>-hub-<hub>.md]
```

### Step 4: Write report + handover

- Quick mode: write to `.agent/audits/2026-MM-DD-hub-<hub>.md` and post summary to chat.
- Deep mode: also write fix-manifest diffs to the same file, leave them un-applied. Frank reviews + approves chunk by chunk.

### Step 5: Update memory

If the hub passed all gates, note it in MEMORY.md as a recently-audited hub. Next rotation skips it for 2 weeks.

## Token discipline

- Quick mode: ≤ 5k input (per-route reads), ≤ 1.5k output (synthesized report only).
- Deep mode: full budget — runs once per quarter per hub.

## Anti-patterns

- ❌ Don't audit /ultraworld/* with the brand-voice gate enabled — that route is the intentional Arcanea quarantine.
- ❌ Don't auto-apply fixes — even in deep mode. Operator review is mandatory.
- ❌ Don't audit more than 1 hub per session (token + focus pollution).
- ❌ Don't run if the merge gate is currently failing — fix the gate first, then audit.

## v1 known gaps (from first pilot 2026-05-20 on /library)

Surfaced during real execution against /library. To be addressed in v2:

1. **Performance gate is partial without Lighthouse** — without a real deploy, gate 1 falls back to code-auditable checks: Next.js Image usage on hero/cover images, lazy-load on below-fold assets, no render-blocking third-party scripts above fold. For full LCP / CLS / INP numbers, run after a Vercel preview deploy.
2. **"Primary CTA" needs explicit definition** — for v1 interpretation: a link or button with `cta` / `button-primary` / `call-to-action` class semantics, above the first viewport scroll, routing to a gravity surface (`/inner-circle`, `/newsletter`, `/waitlist`, or hub-internal next step). Secondary CTAs (related-item links, Amazon affiliate links) don't count.
3. **Brand-voice gate should grep thematic leakage**, not just literal strings — Arcanea mythology can sneak in via "the Construct", "Third Age", "Archons" even when "Realm/Seeker/Gate" aren't used. Add a thematic blocklist alongside the literal one.
4. **Add vault-manifest validation** — every hub image should have an entry in `data/vault-manifest.json` (alt text, resolution, source). Currently checked manually; gate 6 should automate.
5. **Design contract scoring needs the rubric inline** — gate 7 (`taste.md` 8-step polish pass) requires reading `taste.md` as input. Either resolve at command-load time or pass via argument.

These are not blockers; the v1 spec runs and produces actionable findings (the /library pilot returned PASS with 3 P1 recommendations + 3 P2 polish notes). v2 is a quarterly improvement, not a hotfix.

## v2 spec (drafted 2026-05-21 after 6 pilots)

After 6 pilots — 5 PASS + 1 WARN across 4 hub archetypes — three new dimensions surfaced that v1 doesn't handle.

### 1. `--archetype` parameter (mandatory in v2)

v1 conflates all hubs under one lens. /papa hub revealed this: conversion gate would mis-flag a memorial hub as failing for not having "Join now" CTAs above the fold. v2 accepts archetype context:

```
/hub-audit <hub> --archetype <type>
```

| Archetype | Conversion gate calibration | Brand-voice calibration |
|---|---|---|
| `product` | gravity-surface CTAs above fold = REQUIRED | marketing register = OK |
| `authority` | thought leadership CTAs = OK, no hard-sell expected | technical / reflective = OK |
| `memorial` | NO gravity-surface CTAs above fold = EXPECTED | reflective / familial = REQUIRED |
| `family` | private archive routes noindex'd = REQUIRED | warm / intimate = OK |
| `personal` | minimal funnel = EXPECTED | first-person = REQUIRED |

Default if omitted: `product` (most common; same as v1 behavior).

### 2. Multilingual parity check (new dimension)

/papa hub revealed multilingual design as either translation-parity OR intentional asymmetry:

| Parity model | Use case | What to check |
|---|---|---|
| `full-parity` | product hubs (marketing must reach all markets) | DE/EN content identical; both indexed |
| `bridge-parity` | memorial / authority secondary language | secondary language = summary/pointer; canonical correct |
| `market-specific` | features available only in primary language | hreflang declares scope |

v2 spec: declare parity model in hub config; audit checks against it.

### 3. Component-level findings (new tag)

/studio pilot revealed: one component (`ProducerPlaceholderPage`) had one bug, but 7 pages inherited it. v1 reported as N separate findings on N pages. v2 tags as `[COMPONENT]` so the operator sees the leverage point:

```
P0: [COMPONENT] components/studio/ProducerPlaceholderPage.tsx
    Affects 7 pages: /studio/{audio,music,prose,screen,food,travel,video}-producer
    Fix: add primaryCta prop with smart default routing
```

### 4. Archetype-specific gates (new)

- **research/authority archetype** — sub-gate 6.5 "Research authority": validate `evidenceGrade` + `sourceCount` in JSON-LD if hub claims research grounding
- **partner-relationship archetype** — sub-gate "Relationship-status rendering consistency": every declared status (active / in-conversation / placeholder) has a corresponding UI state; no orphaned configs
- **memorial archetype** — sub-gate "Family-archive privacy": routes that hold family-contributed material default to page-level `robots: noindex`

### 5. `--aggregate` flag (new mode)

After 6 pilots there are 6 individual audit reports at `.agent/audits/`. v2 adds:

```
/hub-audit --aggregate
```

Reads all pilot reports, produces site-wide excellence summary:
- Pass-rate by archetype
- Pattern recognition across hubs (e.g., "5 of 6 hubs have OG image at correct size; outlier is /studio")
- Trending issues (e.g., "vault-manifest coverage incomplete across 4 of 6 hubs")
- Stale audits (hubs not re-audited in > 90 days)

### 6 pilots that produced the v2 spec

| # | Hub | Verdict | Archetype | Key learning |
|---|---|---|---|---|
| 1 | /library | PASS | authority | v1 baseline works |
| 2 | /workshops | PASS | product | consistency holds |
| 3 | /research | PASS | authority | TechArticle schema validated |
| 4 | /studio | WARN | product | component-level findings + first WARN validates honesty |
| 5 | /partnerships | PASS | product (relationship) | relationship-status dimension surfaced |
| 6 | /papa | PASS | memorial | archetype parameter requirement surfaced |

## Composition

Calls (via Task tool):
- `@nextjs-vercel-deployment` + `@performance-guardian` (the /v swarm specialists for build + perf)
- `/seo-check` (schema + AEO + meta validation)
- `@visual-vis-registry` + `@visual-design-gods` (visual surface)
- `@accessibility-auditor` (WCAG 2.2 AA pass)
- `brand-voice` skill via direct grep + grep-based checks

Composes into the L4 Excellence Gates layer of the weekly cadence (see CLAUDE.md § "The 6-layer operating loop").

---

*Excellence across every hub, on rotation. The site stays top-notch by design, not by remembering.*
