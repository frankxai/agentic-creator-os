---
description: Enrich a book entry with curated "Continue Reading" recommendations and "Go Deeper" videos. Final step in the Library OS deepen workflow.
---

# /library-research — External Context for a Book

You are the **Library OS Research agent**. Your job is to populate `continueReading` (external books that pair with this one) and `videos` (talks, interviews, lectures that extend the book's ideas) on an existing library entry.

## Input

Arguments: `/library-research {slug}` (e.g. `/library-research atomic-habits`)

## Execution

### Step 1 — Understand the book's intellectual neighborhood

Read the existing entry. The `categories`, `keyInsights`, `tldr`, and `chapters` already define what territory this book lives in. Your job is to map the surrounding territory.

### Step 2 — Curate `continueReading` (6–8 items)

For each recommendation, answer: **"Why does this book pair with the source book?"**

Target distribution:
- **1–2 foundational** — the intellectual ancestors the source book builds on (e.g. Popper for Deutsch, Gerber for Michalowicz)
- **1–2 contemporaries** — books making similar arguments from a different angle
- **1–2 contrarians** — books that challenge or extend the source book's claims (Penrose vs. Deutsch on computation)
- **1–2 practical** — books that apply the source book's ideas to a specific domain
- **1 adjacent** — a book from a different field that unexpectedly illuminates the source

**Each item:**
- `title`, `author` — required, exact
- `reason` — 1–2 sentences explaining the pairing. Not a summary of the recommended book — a *connection*.
- `url` — canonical Amazon or publisher link, optional but preferred

**Never recommend algorithmically**. Every item must earn its place by reason. If you cannot articulate the pairing in one sentence, it does not belong.

### Step 3 — Curate `videos` (3–6 items)

Priorities:
1. **The author in long-form** — interview/lecture/podcast with the book's author. Often the richest context.
2. **The author's canonical talk** — TED, keynote, summary talk. 10–30 min entry points.
3. **Critical engagement** — a thinker who takes the book seriously and argues with it.
4. **Domain explainer** — a short overview for readers who want the TL;DR before committing.

**Each item:**
- `title`, `creator` — required
- `url` — YouTube URL preferred. If uncertain whether a specific video exists, use a YouTube search URL (`https://www.youtube.com/results?search_query=...`) rather than inventing a URL
- `description` — 1–2 sentences: what the viewer learns
- `duration` — approximate, optional
- `kind` — one of `interview`, `lecture`, `talk`, `explainer`, `summary`

### Step 4 — Verify

For each URL, confirm:
- If direct YouTube URL: the channel / video title matches what you claimed
- If YouTube search URL: the search query returns sensible results (just check shape)
- If Amazon URL: the ISBN pattern matches the book (no fake links)

**Never fabricate URLs.** Better to use a search query than a dead direct link.

### Step 5 — Merge and ship

Write the results into `data/book-reviews.ts` against the slug's entry. Type-check. Print a summary:

```
Continue Reading: N items
Videos: N items

Deep-dive complete for {slug}. See /library/{slug} — TOC now has all 7 sections.
```

## Quality standards

### continueReading
- **Reason, not blurb.** "Popper is where Deutsch's epistemology comes from" beats "A classic of 20th-century philosophy of science"
- **No padding.** If you only have 4 strong pairings, ship 4. Weak recommendations erode trust in the 4 strong ones.
- **Disclose contrarians honestly.** "Penrose argues consciousness is non-computable, directly contradicting Deutsch's Turing principle" is more valuable than pretending everyone agrees.

### videos
- **Watch-worthy, not algorithmic.** If the top YouTube result for the author is a low-quality reaction video, use a search URL and let the user filter.
- **Entry points matter more than comprehensiveness.** A 15-minute TED talk that opens the door beats a 3-hour podcast most people won't finish.
- **Describe the value, not the video.** "Naval's framing of why 'problems are soluble' is a physics claim, not a slogan" beats "Naval interviews Deutsch about epistemology."

## Integration

- Upstream: `/library-deepen` (typically runs right after)
- Skill: `library-os`
- Data written into: `data/book-reviews.ts` (same file as `/library-add` and `/library-deepen`)

## Example output shape

```ts
continueReading: [
  {
    title: 'The Beginning of Infinity',
    author: 'David Deutsch',
    reason: "Deutsch's 2011 sequel. If Fabric of Reality is the synthesis, Beginning of Infinity is the mature worldview — 'good explanations', the reach of knowledge, and the ethics of progress.",
    url: 'https://www.amazon.com/Beginning-Infinity-.../dp/0143121359',
  },
  // ...
],
videos: [
  {
    title: 'David Deutsch — A new way to explain explanation',
    creator: 'TED',
    url: 'https://www.ted.com/talks/david_deutsch_a_new_way_to_explain_explanation',
    description: "Deutsch's canonical 16-minute talk. The 'hard-to-vary' criterion for good explanations, distilled. Best single-video entry point to his worldview.",
    duration: '16m',
    kind: 'talk',
  },
  // ...
],
```
