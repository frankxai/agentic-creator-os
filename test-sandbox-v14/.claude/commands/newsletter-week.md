---
name: newsletter-week
description: Pick theme, research, draft, gate, schedule, and send one newsletter issue per week. Resend-powered. Closes the L3-L5 loop (production → excellence → distribution) for newsletter as a forcing function.
triggers:
  - /newsletter-week
  - /nl-week
arguments:
  - name: mode
    required: false
    enum: [pick, draft, gate, schedule, send, archive]
    default: pick
    description: pick = choose theme · draft = write issue · gate = quality check · schedule = queue in Resend · send = trigger · archive = post-send rituals
  - name: issue
    required: false
    description: Issue number (e.g. 1, 2, 3) — defaults to next unscheduled
---

# /newsletter-week — Weekly Newsletter Cadence

Issue 1 ships Friday W21 (2026-05-22). The newsletter is wired to Resend, archive lives at `/newsletter/archive`, double-opt-in via HMAC-signed token. **First issue is Issue 1 — no backfill of placeholders.**

## The weekly cadence

```
MON         /newsletter-week pick     → theme + angle locked
TUE         /newsletter-week draft    → 800-1200w draft written
WED         /newsletter-week gate     → @integrity-guard + /seo-check pass
THU         operator review (Frank)   → final edit pass
FRI 10:00   /newsletter-week schedule → queued in Resend
FRI 11:00   /newsletter-week send     → trigger send to list
FRI 16:00   /newsletter-week archive  → publish to /newsletter/archive/issue-{n}
```

## Pick mode workflow

### Step 1: Read context

```bash
# What's this week's strategic theme?
cat docs/planning/2026-W{n}-sprint.md | head -50

# What did the research layer surface?
ls -t research/briefs/ | head -5

# What shipped on the site this week?
git log --since="7 days ago" --oneline | grep -E "feat|ship" | head -20

# What's the audience asking? (from CRM + workshop debriefs)
cat data/crm/recent-questions.json 2>/dev/null | head -20
```

### Step 2: Choose the theme

Use the 3-bucket structure:

| Bucket | What lives here | Default share |
|---|---|---|
| **Spotlight** | The week's main story — a shipped surface, a research brief, a strategic frame | 60% of issue |
| **Receipts** | 2-3 short specific wins / case studies / artifacts | 25% of issue |
| **Toolkit** | 1 actionable thing the reader can do this week | 15% of issue |

Pick a theme that connects to **one of the active forcing functions** (Inner Circle launch, current workshop, new research). The newsletter should reinforce the site's gravity, not divert it.

### Step 3: Write the brief

```markdown
# Newsletter Issue {N} — {Subject Line}

**Date:** Friday 2026-MM-DD
**Theme:** {one-line}
**Connects to:** {forcing function / hub / pillar}

## Spotlight
{angle}

## Receipts
- {receipt 1}
- {receipt 2}
- {receipt 3}

## Toolkit
{actionable thing}

## CTA
{single primary CTA — Inner Circle / specific surface / no CTA if reinforcing existing momentum}

## Why this issue
{2 sentences on what makes it sing — for /content-ops daily brief tone}
```

Write to `content/newsletters/staging/issue-{n}.md`.

## Draft mode workflow

### Step 1: Read voice spec

```bash
cat content/strategy/newsletter-voice.md  # if exists
cat lib/voice/frankx-voice.ts             # canonical brand voice
```

### Step 2: Compose

- **Subject line:** ≤ 60 chars. Specific > clever. No emoji unless the issue is itself about emoji.
- **Preview text:** ≤ 100 chars. Either continues subject (specific) or contradicts it (curiosity gap).
- **Greeting:** No "Hey friend" / "Dear reader" — open with the spotlight directly.
- **Body:** 800-1200 words. Short paragraphs (≤ 4 lines). Specific > vague. Receipts > claims.
- **CTA:** One primary, optional secondary. Never more than two CTAs.
- **Sign-off:** "—Frank" (no exclamation, no "best", no "talk soon").

### Step 3: Write

Output to `content/newsletters/staging/issue-{n}.mdx` (MDX because Resend templates can take React Email components for embedded receipts/visuals).

## Gate mode workflow

Run all three in parallel:

```
Task @integrity-guard → brand voice + AI-slop + claim audit on staged issue
Task /seo-check → if cross-posting to /blog later, ensure schema-ready
Task /v BUILD (subset) → render check via React Email preview
```

Verdict:
- ✅ All pass → move to scheduled state
- ⚠️ Warnings → surface to Frank with file:line, Frank decides ship-or-fix
- ❌ Failures → block send, fix required

## Schedule mode workflow

Queue in Resend via MCP (or direct API):

```bash
# Pseudo — actual implementation in scripts/newsletter-schedule.mjs
node scripts/newsletter-schedule.mjs --issue {n} --send-at "2026-MM-DDT11:00:00+02:00"
```

Confirms:
- Subject + preview locked
- Recipient list = `unsubscribed: false` subscribers only
- Double-opt-in confirmed (HMAC token validates)
- Send-at time = Friday 11:00 CET (validated against issue frontmatter)

## Send mode workflow

Triggered by schedule firing OR explicit `/newsletter-week send`. Logs send to:

```
data/newsletters/sent.jsonl
{ "issue": N, "subject": "...", "sentAt": "ISO", "recipientCount": M, "resendMessageId": "..." }
```

## Archive mode workflow

Post-send (Friday afternoon):

1. Move `content/newsletters/staging/issue-{n}.mdx` → `content/newsletters/published/issue-{n}.mdx`
2. Generate `/newsletter/archive/issue-{n}` page (or trigger ISR if route is dynamic)
3. Update `data/newsletters/index.json` with new issue metadata
4. Cross-post the spotlight section to `/blog/` if marked `crossPost: true` in frontmatter (separate `/traffic-week` lever)

## Issue 1 special case (W21)

The W21 sprint locks Issue 1 as the **first issue of the new era**. Do not backfill the 7 placeholders in `content/newsletters/`. Issue 1 frontmatter:

```yaml
---
issue: 1
subject: "Issue 1: The 6-layer operating loop"
preview: "What it means to publish without the scramble"
theme: "The system that ships every Friday"
connectsTo: "newsletter-issue-1 W21 sprint goal + Inner Circle June 1 launch"
sendAt: "2026-05-22T11:00:00+02:00"
crossPost: false
---
```

## Composition

Calls (via Task tool):
- `/research` or `/deepresearch` (when theme needs external validation)
- `/factory` (for the body draft if the spotlight wants the full publishing pipeline)
- `@integrity-guard` (the gate — must exist for /newsletter-week to be safe)
- `/seo-check` (cross-post readiness)

Pairs with `/content-strategy` (pillar alignment) and `/content-ops` (calendar slot).

## Anti-patterns

- ❌ Don't send mid-week — Friday 11:00 CET is the cadence. Discipline > opportunism.
- ❌ Don't skip the gate — Issue 1's brand voice sets the standard for every future issue.
- ❌ Don't backfill placeholder issues — Issue 1 is the start, no historical revisionism.
- ❌ Don't add a CTA per receipt — one primary CTA per issue, period.
- ❌ Don't send without operator review (`gate` mode is automated, `send` mode is human-triggered).

## Token discipline

- Pick: ≤ 3k input, ≤ 800 output
- Draft: full budget — runs once per week
- Gate: ≤ 5k input, ≤ 1k output
- Schedule/Send/Archive: minimal

---

*Friday is a forcing function, not a hope. Issue 1 ships on time. Issue 52 ships on time. The cadence is the product.*
