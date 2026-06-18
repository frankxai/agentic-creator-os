---
name: traffic-week
description: Pick 2-3 traffic levers for the week and execute them. Sibling to /plan-week (which is capacity) — this is the drive-traffic forcing function. Composes /research + /seo-check + internal-link audit + schema gap-fill + AEO positioning.
triggers:
  - /traffic-week
  - /traffic
arguments:
  - name: mode
    required: false
    enum: [plan, execute, review]
    default: plan
    description: plan = pick the week's 2-3 levers · execute = run the chosen lever now · review = report last-week traffic delta
---

# /traffic-week — Drive-Traffic Forcing Function

`/plan-week` answers "what gets made this week." This command answers **"what brings readers to the site this week."** Both fire Sunday evening, both feed into the same sprint doc.

## The 8 traffic levers

| Lever | What it does | Effort | Compounds |
|---|---|---|---|
| 1. **Internal link density** | Audit a hub, raise links/page from N to N+2 | ~2h | Yes — every new article inherits |
| 2. **Schema gap-fill** | Add Article / FAQPage / Review / BreadcrumbList / Quotation JSON-LD where missing | ~2h | Yes — AI citation lift |
| 3. **AEO positioning** | Convert headers to question form on top-3 pages by search volume | ~3h | Yes — AI snippet capture |
| 4. **New pillar content** | One 2000-3000w article on a chosen pillar | ~6h | Yes — long tail |
| 5. **Newsletter cross-post** | Take last 4 newsletter issues, publish best 1 as standalone blog | ~2h | Medium — one-time per issue |
| 6. **Repost amplification** | Workshop attendees' posts → Frank repost + comment within 24h | ~30min × N | High — network effect |
| 7. **Original research** | Publish one research brief (500w validated claims) | ~3h | High — citation magnet |
| 8. **Visual upgrade** | Replace 5 low-res / placeholder hero images with NB2-generated 2K assets | ~2h | Medium — CTR lift |

## Weekly cadence

```
SUN evening   /traffic-week plan
              → ingest last-week traffic signals
              → pick 2-3 levers for the week
              → write to docs/planning/2026-W{n}-traffic.md

MON-THU       /traffic-week execute <lever-id>
              → run the chosen lever
              → write outputs to content/ or app/ as appropriate

FRI           ship the lever's deliverable (publish, deploy, sync)

NEXT SUN      /traffic-week review
              → report delta on the chosen levers
              → feed into next-week plan
```

## Plan mode workflow

### Step 1: Ingest last-week signals

If analytics are wired (memory `project_hook_learn` for social), pull them. Otherwise:

```bash
# Manual signals
- which routes saw new search hits (Google Search Console, Plausible, or similar)
- which routes have schema gaps (grep for "@type" in app/*/page.tsx)
- which routes have low internal-link density (count <Link> per page)
- which routes have placeholder images (grep for "placeholder" in public/images/)
```

If analytics aren't wired, surface that as a [DECIDE] and use proxy signals (recently-shipped routes, hub-audit findings, social engagement).

### Step 2: Pick the levers

Lever selection criteria, in order:

1. **Compounds** — levers 1, 2, 3, 7 compound across all future content. Bias here.
2. **Capacity-matched** — pick levers totaling ≤ 10h for a normal week, ≤ 5h for a travel week (e.g. W22 Madrid).
3. **Forcing-function-aligned** — if a hub is about to launch (Inner Circle June 1, Newsletter Friday), bias toward levers that touch that hub.
4. **Diversified** — at least 1 lever should be on-page (1,2,3), 1 should be content-creation (4,5,7), 1 can be operational (6,8).

Pick **2-3 levers total**, not more. Focus beats breadth.

### Step 3: Write the plan

```markdown
# Traffic Plan — W{n} (2026-MM-DD → 2026-MM-DD)

## Picked
1. Lever 2: Schema gap-fill on /library (5 detail pages missing Article + Review)
   - Effort: ~2h
   - Execute: Tue afternoon
2. Lever 7: Original research brief — "Multi-Agent Handoff Patterns: 2026 Benchmark"
   - Effort: ~3h
   - Execute: Wed morning
3. Lever 6: NLDigital attendee repost sweep (Day 1-5)
   - Effort: ~30min/day
   - Execute: continuous via @amplification-liaison

## Skipped (next week)
- Lever 1: Internal link density on /studio (3h, can wait)
- Lever 4: New pillar article (no fresh research to back it this week)

## Success signal
Measurable change in week +1 review:
- /library hub: schema PASS on /seo-check
- /research/multi-agent-handoff-patterns-2026: published, 3+ internal links from /blog
- NLDigital amplification: ≥ 60% of posting attendees got a Frank repost within 24h
```

## Execute mode workflow

When invoked with `/traffic-week execute <lever-id>`:

- **Lever 1 (internal links)** — dispatch @nextjs-vercel-deployment to add `<Link>` to identified gaps.
- **Lever 2 (schema gap-fill)** — dispatch /seo-check then write JSON-LD to identified files.
- **Lever 3 (AEO)** — read top-3 routes, rewrite H1/H2 to question form, regenerate metadata.
- **Lever 4 (new pillar)** — dispatch /factory with the picked topic.
- **Lever 5 (newsletter cross-post)** — read `content/newsletters/`, pick best issue, fork to `content/blog/`.
- **Lever 6 (repost amplification)** — dispatch @amplification-liaison (already auto-fires).
- **Lever 7 (research brief)** — dispatch /deepresearch with the chosen topic, output to `content/research/briefs/`.
- **Lever 8 (visual upgrade)** — dispatch /visual-strategy + /infogenius for the identified images.

## Review mode workflow

End-of-week (Sunday before /palace):

```markdown
# Traffic Review — W{n}

## Levers shipped
- ✅ Lever 2: schema on /library — 5/5 pages now PASS
- ✅ Lever 7: research brief published, 4 internal links from /blog
- ⚠️ Lever 6: amplification at 40% (target 60%) — investigate

## Signals
- Search Console: TBD (manual check)
- Social: hook-learn report
- Direct: any inbound from amplified posts

## Carry-forward
- Lever 6 underperformed → debug @amplification-liaison drafts quality
```

## Composition

Calls (via Task tool):
- `/research` or `/deepresearch` (intelligence layer)
- `/seo-check` (schema + AEO validation)
- `@amplification-liaison` (lever 6)
- `/factory` (lever 4)
- `/visual-strategy` + `/infogenius` (lever 8)
- `@nextjs-vercel-deployment` (lever 1 implementation)

Pairs with `/plan-week` and `/content-ops fill` as the Sunday close-ritual triad.

## Anti-patterns

- ❌ Don't pick > 3 levers — focus dilutes traffic gains.
- ❌ Don't pick the same lever 2 weeks in a row (unless review shows it's still moving).
- ❌ Don't run execute mode without first running plan mode that week.
- ❌ Don't conflate "drive traffic" with "drive conversions" — conversion is a separate concern; this command is awareness/reach only.

---

*The site that drives traffic chooses levers Sunday and ships them by Friday. Predictable, not heroic.*
