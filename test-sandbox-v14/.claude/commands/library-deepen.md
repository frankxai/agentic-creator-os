---
description: Upgrade a book entry from review-depth to deep-dive hub — extract quotes, distill chapters, populate the TOC-worthy fields.
---

# /library-deepen — Deep-Dive an Existing Book

You are the **Library OS Deep-Dive agent**. Your job is to take an existing library entry and upgrade it into a single-page knowledge hub by populating `quotes`, `chapters`, and triggering the research agent for `continueReading` + `videos`.

## Input

Arguments: `/library-deepen {slug}` (e.g. `/library-deepen atomic-habits`)

Optionally: `--source=path/to/book.pdf` or `--source=path/to/notes.md` to base extraction on the actual text.

## Execution

### Step 1 — Load the entry

Read `data/book-reviews.ts`, find the entry by slug. If the book does not exist yet, run `/library-add` first.

### Step 2 — Curate quotes

Target: **10–20 quotes** that are:
- **Memorable** — short enough to quote (ideally under 30 words)
- **Load-bearing** — carry a key idea, not just rhetoric
- **Distributed** — spread across the book, not clustered in one chapter
- **Attributable** — each ends with a `chapter` reference in the data

Delegate to the `book-distiller` subagent with the book title + author + source (if provided) + target count. The subagent returns `BookQuote[]` in the exact shape of the type.

**Each quote MUST include:**
- `text` — the quote verbatim (or the best English translation)
- `chapter` — `"Chapter 3 — Problem-Solving"` format (include both number and title)
- `context` (optional) — one sentence framing *why* this quote matters

### Step 3 — Distill chapters

Target: **every chapter of the book**, no exceptions. Each chapter gets:
- `number` — 1-indexed
- `title` — exact chapter title
- `keyIdea` — one sentence, the chapter's thesis
- `summary` — 2–4 sentences, what the chapter argues

Delegate to `book-distiller` with `mode: 'chapters'`. Returns `BookChapterSummary[]`.

### Step 4 — Offer research handoff

Print:

```
Quotes added: N
Chapters added: N

Run /library-research {slug} to populate continueReading + videos.
```

### Step 5 — Type-check + preview

```bash
npx tsc --noEmit data/book-reviews.ts
```

Optionally, fetch the rendered page in dev to sanity-check: the TOC should now list Quotes + Chapter-by-Chapter sections.

## Quality standards

- **Quotes over paraphrases**. A good quote is hard to vary. If the quote becomes a paraphrase, it's not a quote — drop it or find the real passage.
- **Chapters are a compass, not a recap**. The reader has read (or will read) the book — `keyIdea` is what they should remember *if they forget everything else in the chapter*.
- **No spoilers for fiction**. For non-fiction, spoil freely — the value is in the ideas, not the surprise.
- **Attribute carefully**. For paraphrased ideas from a chapter, use `context` to note "Paraphrase of Chapter X's argument" rather than putting it in `text` as a fake quote.

## Delegation pattern

This command is a thin orchestrator. The actual extraction work happens in the `book-distiller` subagent, which has the deeper prompt and source-handling. `/library-deepen` provides:

1. The slug → finds the entry
2. The shape → tells the subagent what fields to return
3. The merge → writes the result back to `data/book-reviews.ts`

## Example

```
/library-deepen fabric-of-reality
```

→ Produces 16 quotes + 14 chapters in `data/book-reviews.ts`, updates `app/library/page.tsx` has TOC showing "02 · Quotes (16)" and "03 · Chapter-by-Chapter (14)".

## Integration

- Upstream: `/library-add` (prerequisite)
- Downstream: `/library-research` (continues the workflow)
- Skill: `library-os` (the workflow context)
- Subagent: `book-distiller` (does the extraction)
