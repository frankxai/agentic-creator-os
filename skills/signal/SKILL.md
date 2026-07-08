---
name: Signal — LinkedIn Authority Engine
description: The LinkedIn vertical of ACOS. Draft, critique, repurpose, and schedule LinkedIn posts and articles in a specific creator's voice — for a personal brand and a company brand — then learn from what performed. Runs the Excellence Loop, drafts everything, and NEVER auto-posts (a human ships). Use for "/signal", "write a linkedin post", "linkedin article", "repurpose this for linkedin", "plan my linkedin week", "dream100", "become a linkedin top voice".
version: 0.1.0
triggers:
  - "/signal"
  - "linkedin post"
  - "linkedin article"
  - "repurpose for linkedin"
  - "linkedin week"
  - "dream100"
  - "thought leadership post"
inputs:
  required: []
  optional: [mode, brand, source, topic]
outputs:
  - LinkedIn drafts (plain-text, ToS-safe, never auto-posted)
  - A weekly plan mapped to content pillars
  - A credited repurpose reframe
  - An outcome row written to the learning store (when analytics are supplied)
dependencies: [frankx-brand, integrity-guard]
mcp: [notion, firecrawl]
---

# Signal — LinkedIn Authority Engine

The productized LinkedIn layer of ACOS, and the flagship vertical of **The Studio**. Signal is a thin, sellable configuration of the general [Excellence Loop](../../docs/architecture/EXCELLENCE_LOOP.md) — the same eight steps, wearing a LinkedIn skin.

Two things make Signal different from "an AI that writes LinkedIn posts":

1. **It runs a critique + learning loop.** Every draft passes an independent voice/claim/hook check before it's shippable, and every _shipped_ post's performance is written back so next week's drafts are grounded in what actually worked — not a blank prompt.
2. **It never posts for you.** LinkedIn's terms forbid automated posting through unofficial means. Signal drafts, critiques, and _stages_; a human clicks post. This is the compliant design and the simpler one.

## The two-brand model

Signal always operates under one of two voices, loaded from [`personas.md`](personas.md):

- **Personal** — the individual's authority voice (first-person, opinionated, career/insight-led).
- **Company** — the brand's voice (we/product-led, proof and customer-outcome-led).

Same engine, two lenses. Pass `brand: personal` or `brand: company`; default is `personal`. Never blend the two in one draft — pick the lens first.

## Modes (the command surface)

Invoke via `/signal <mode>`. Each mode is a segment of the Excellence Loop.

| Mode | Loop step | What it does |
|---|---|---|
| `plan` | Ideate | Reads the voice corpus + recent winners → a week of ranked angles mapped to pillars. |
| `draft` | Craft → Execute | One idea/source → a LinkedIn draft in the chosen brand voice, staged as a draft. |
| `repurpose` | Execute | Fetch a great external clip/post (Firecrawl) → a **credited** reframe. Highest-ROI motion. |
| `critique` | Critique + Verify | Runs `integrity-guard` (brand/claim/schema) + a hook/format check. Returns PASS / warn / FAIL. |
| `ship` | Interconnect | Exports the passed draft to a Typefully/LinkedIn **draft** via official API. **A human posts.** |
| `learn` | Learn | Takes supplied post analytics → writes the graded outcome to the store → tunes next week. |

If no mode is given, route by intent: a pasted URL → `repurpose`; "plan my week" → `plan`; a raw idea → `draft`.

## The non-negotiables

- **Never auto-post.** No mode calls a posting endpoint. `ship` produces a draft a human confirms. This is a hard stop inherited from the root `CLAUDE.md` (posting to LinkedIn is human-gated) and from LinkedIn ToS.
- **Critique gates ship.** `ship` refuses a draft that hasn't passed `critique`. Fail-closed.
- **Credit is mandatory on `repurpose`.** A reframe of someone else's clip names the source, on its own line, every time.
- **No fabricated metrics.** Follower counts, view counts, "top voice" claims obey the Metrics-Truth rule — verify or omit. `learn` only writes numbers a human supplied from real analytics.

## LinkedIn format discipline (the format pass)

Applied to every draft, from `knowledge.md`:

- Plain text — LinkedIn renders no markdown. No `#`, `*`, or `-` bullets that won't render; use line breaks and unicode where needed.
- Hook in the first 1–2 lines (before the "…see more" fold). The scroll stops here or nowhere.
- One idea per 1–2 lines, generous line breaks — LinkedIn is skimmed on mobile.
- ≤ 3 hashtags, at the end. One link, on its own line near the close (links suppress reach — place deliberately).
- Match the persona's emoji/exclamation rules exactly (personal and company differ — see `personas.md`).

## The knowledge base (the moat)

[`knowledge.md`](knowledge.md) holds the reusable intelligence Signal draws on: the hook taxonomy, the format playbooks (text post · document/carousel · article · repurpose), and the Dream100 method. This is the asset that compounds — it grows every time `learn` records what worked.

## What to build next (this pack is a scaffold)

Per `L99_BLUEPRINT.md`, Signal is only _real_ once the loop closes. The build order:
1. A `content` table (state spine) so `draft`/`ship` persist instead of vanishing.
2. `ship` wired to the Typefully/LinkedIn official draft API.
3. `learn` wired to the Success Oracle store so performance tunes the next `plan`.

Until then, Signal drafts and critiques honestly — and says so.
