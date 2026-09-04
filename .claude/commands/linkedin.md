---
description: Run the LinkedIn Authority Engine (Signal). The memorable front door for the whole LinkedIn daily loop — plan, research, draft, repurpose, carousel, infographic, critique, ship, engage, learn, index. Never auto-posts; a human ships. Alias of /signal.
argument-hint: "[plan|research|draft|repurpose|carousel|infographic|critique|ship|engage|learn|index] [brand=personal|company] [source=<url>] [--week]"
---

# /linkedin — LinkedIn Authority Engine

The front door for your daily LinkedIn operation. This is the memorable alias for the **Signal** pack (`skills/signal/SKILL.md`); `/signal` and `/linkedin` are the same engine. Runs the [Daily Loop](../../skills/signal/DAILY_LOOP.md), drafts everything, and **never auto-posts** — you click post.

## Modes

| Mode | Does | Loop step |
|---|---|---|
| `plan` | 5 ranked angles for today (add `--week` for the weekly calendar) | Ideate |
| `research` | Sweep the source lanes (papers/videos/pdfs/posts) + vet | Ideate |
| `draft` | One idea/source → a staged post in the chosen brand voice | Craft |
| `repurpose` | A great external post/clip → a **credited** reframe | Execute |
| `carousel` | A post → brand-locked carousel slides (multimodal + canvas) | Execute |
| `infographic` | A post/data → a brand-locked infographic | Execute |
| `critique` | Independent voice/claim/hook gate → PASS/warn/FAIL (gates ship) | Critique |
| `ship` | Export a passed draft to a Typefully/LinkedIn **draft** → you post | Interconnect |
| `engage` | Dream100 newest posts → substantive comment drafts (you post) | Distribute |
| `learn` | Real metrics → outcome to the store → tunes next `plan` | Learn |
| `index` | Index your existing content (posts/talks/repos) into the searchable library | — |

No mode given → route by intent: a URL → `repurpose`; "plan my week" → `plan --week`; a raw idea → `draft`; "who should I engage" → `engage`.

## Rules (fail-closed)

1. **Never auto-post / auto-comment.** Every mode drafts and stages; a human posts. (Root `CLAUDE.md` human-gate + LinkedIn ToS.)
2. **`ship` refuses an un-critiqued draft.** Critique gates the publish boundary.
3. **`repurpose` and `engage` credit sources**; comments are substantive, never "great post".
4. **No fabricated metrics.** `learn` writes only real, human-supplied analytics.

## First run

Fill `skills/signal/personas.md` (both brands), seed your Dream100 (`knowledge.md` §3), and connect Firecrawl + Exa for `research`. See `skills/signal/DAILY_LOOP.md` for the operating rhythm and `skills/signal/agent-team.md` for who does what.

## Related

`/signal` (same engine) · general loop: `/ideate` `/craft` `/critique` `/verify` `/publish` · `frankx-brand`, `integrity-guard`, `canvas-design`, `multimodal-studio`.
