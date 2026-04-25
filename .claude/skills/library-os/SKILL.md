---
name: library-os
description: Library OS — the persistent digital library system. Use when adding a book, deepening an existing review, extracting insights from handwritten notes / highlights / photos, or when the user wants to build their own library on their site. Handles the full workflow from capture to publish.
---

# Library OS

**The open-source Library Intelligence System.** Captures everything you read into a permanent, intelligent, citation-ready knowledge library on your own website.

## When to use this skill

- User mentions adding a book, book review, reading list, library
- User shares handwritten notes, book highlights, Kindle exports, or a photo of notes
- User says "I just finished [book]" or "let me capture this book"
- User asks about the book system, /library/*, or wants to port it to another site
- User wants to deepen a shallow review into a hub page

## Core philosophy

1. **Own your library.** Kindle highlights die in Kindle. Notion docs scatter. A library on your own site, in git, becomes a permanent asset that compounds for decades.
2. **Data schema is the spine.** The template is interchangeable; the `BookReview` type + its sub-types are the interoperable core. Port to any Next.js, Astro, SvelteKit, or even static HTML.
3. **Structured, not scraped.** Every book is curated — quotes carry chapter references, chapter summaries carry key ideas, related reading carries a *reason*, not a category tag.
4. **AEO-first.** Every book page emits BreadcrumbList + Article + Review + FAQPage + Quotation schema. Citation surface is the product.
5. **Repeatable, not bespoke.** One data schema, one template, one command pipeline. Every new book follows the same path. No snowflakes.

## The workflow (canonical)

```
CAPTURE ──────► EXTRACT ──────► ENRICH ──────► PUBLISH
   │                │                │              │
   ▼                ▼                ▼              ▼
Photo, notes,   quotes[]      continueReading[]   /library/{slug}
Kindle export,  chapters[]    videos[]            (live, SEO+AEO)
voice memo      tldr, faq     + schema
```

**Step 1 — CAPTURE**
The user provides the raw signal: a book title, a handwritten note photo, a highlights export, a voice memo. If a photo, extract text via vision. If a file, read it.

**Step 2 — EXTRACT**
Run `/library-add` to create the baseline entry (title, author, categories, 5 key insights, best-for, FAQ, TL;DR, cover). Then run `/library-deepen` to populate `quotes` and `chapters` via the `book-distiller` subagent.

**Step 3 — ENRICH**
Run `/library-research` to populate `continueReading` (external books with why-they-pair rationale) and `videos` (talks, interviews, lectures).

**Step 4 — PUBLISH**
Commit, sync to production repo, ship. Page goes live at `/library/{slug}` with the full deep-dive hub: TL;DR, TOC, insights, quotes, chapters, FAQ, continue-reading, videos, related-own-book, Amazon CTA.

## The three slash commands

| Command | Purpose | Writes to |
|---|---|---|
| `/library-add` | Create a new entry from just a title | `data/book-reviews.ts`, `public/images/library/` |
| `/library-deepen` | Add quotes + chapters to existing entry | `data/book-reviews.ts` |
| `/library-research` | Add continueReading + videos | `data/book-reviews.ts` |

Run in order. Each is idempotent — running `/library-deepen` twice just refines the existing quotes/chapters, it does not duplicate.

## The subagent

**book-distiller** — the extraction specialist. Given a book + (optional) source text, returns structured `quotes[]` and `chapters[]` matching the exact type shape. Delegated to by `/library-deepen` so the main conversation stays thin.

See `.claude/agents/book-distiller.md` for the agent prompt.

## The data schema (always the source of truth)

Located at `app/books/types.ts`:

```ts
interface BookReview {
  // Identity
  slug, title, author, coverImage, rating, reviewDate, categories, readingTime

  // Core content (required)
  keyInsights: string[]  // exactly 5
  bestFor: string[]      // 3-4

  // AEO core (optional, strongly recommended)
  tldr?: string
  faq?: Array<{q, a}>
  publicationYear?: number

  // Deep-dive hub (optional — the progressive depth layer)
  quotes?: BookQuote[]                // curated passages
  chapters?: BookChapterSummary[]     // number, title, keyIdea, summary
  continueReading?: RelatedReadingItem[]  // with reason, not algorithm
  videos?: BookVideo[]                // kind, duration, description

  // Wiring
  amazonUrl?: string
  relatedBook?: string     // slug from booksRegistry — links to our own books
  hasCover?: boolean       // gates the next/image render
}
```

Books without the deep-dive fields render as review-depth. Books with all fields render as full knowledge hubs. One template, progressive depth.

## Cross-AI / cross-tool portability

The intelligence is in the **schema + workflow**, not in any specific AI tool. The same pattern works with:

- **Claude Code (native)** — the three slash commands + subagent + skill are defined here
- **ChatGPT / Claude.ai (web)** — paste the extraction prompt from the command file, paste the book details, get structured output, paste into `data/book-reviews.ts`
- **Codex / Cursor / Gemini CLI** — read `.claude/commands/library-*.md` as plain instructions, execute the steps
- **Hand-roll** — the schema and template work without any AI. Manually curated libraries are valid.

See `docs/cross-ai-guide.md` in the library-os repo for the prompt-paste versions.

## Deployment targets

The template is Next.js App Router (frankx.ai uses this). Adaptations:

- **Astro** — Port `app/library/` to `src/pages/library/`, use `.astro` for layout. Data schema unchanged.
- **SvelteKit** — `routes/library/+page.svelte`, data unchanged.
- **Hugo** — static generation, the `BookReview[]` becomes frontmatter YAML in `content/library/*.md`.
- **Plain HTML** — a small build script renders the data to static pages.

The spine — `data/book-reviews.ts` as a typed array + the JSON-LD schema — is portable.

## Index page contract

The library index (`/library`) shows:
- All reviews sorted by `reviewDate` DESC (newest first)
- Cards with cover + title + author + star rating + top insight
- "Deep-dive badge" on cards that have quotes/chapters/videos (e.g. "16 quotes · 14 chapters · 5 videos")
- Category filter (optional, client-side)
- CollectionPage + ItemList + BreadcrumbList JSON-LD

## Detail page contract

The detail page (`/library/{slug}`) renders, in order:
1. Back link → `/library`
2. Header: cover + title + author + stars + category chips
3. TL;DR card (if `tldr`)
4. Table of Contents (inline anchor nav, sections only shown when data present)
5. Key Insights (5)
6. Quotes Worth Remembering (if `quotes`)
7. Chapter-by-Chapter accordion (if `chapters`)
8. Best For
9. FAQ accordion (if `faq`)
10. Continue Reading grid (if `continueReading`)
11. Go Deeper — Videos (if `videos`)
12. "If You Liked This, Read Ours" (if `relatedBook` matches a slug in booksRegistry)
13. Amazon CTA
14. More from the Library (3 other reviews)

All section IDs are anchor-linkable with `scroll-mt-24` for smooth jumps from the TOC.

## Quality bar

- **No AI-sounding phrases.** Blacklist: delve, dive into, it's worth noting, certainly, absolutely, in conclusion, let's explore.
- **No fake URLs.** If uncertain about a specific video URL, use a YouTube search URL. Better a search than a dead link.
- **No blurb-style recommendations.** Every `continueReading.reason` must state a *connection*, not a summary.
- **No chapter fabrication.** If the book's chapter list is uncertain, stop and ask for the table of contents. Never invent chapters.
- **Cover images from legitimate sources.** OpenLibrary (`covers.openlibrary.org/b/isbn/{ISBN}-L.jpg`) is fair-use for review purposes. Never scrape Amazon product images.

## Git workflow

Library changes live in the FrankX dev repo but deploy via the production repo (`frankxai/frankx.ai-vercel-website`). Standard pattern:

1. Commit library changes in FrankX dev repo (scoped: `app/library/`, `app/books/types.ts`, `data/book-reviews.ts`, `public/images/library/`)
2. Create isolated worktree from prod `origin/main`
3. Sync those exact files into the worktree
4. Commit in worktree, push branch, open PR
5. Admin-merge after Vercel preview passes (CI will show pre-existing tech debt — ignore per issue #31)
6. Verify live on frankx.ai

## Related

- `/library` → the live index
- `/library/approach` → the showcase page explaining the system
- GitHub: `library-os` repo → open-source template + docs
- Companion skill: `book-publishing` (for authoring own books)
