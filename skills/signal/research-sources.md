# Signal — Research Sources (best-of-best intake)

Where Signal's ideation pulls "the best of the best" from, and how raw signal becomes a post. The rule: **never draft from a blank prompt.** Every angle starts from something real — a paper, a video, a post, a trend — plus recall of what worked for you.

---

## The source lanes

| Lane | Source | Connector | What it feeds |
|---|---|---|---|
| **Papers** | arXiv, Semantic Scholar, lab blogs (Anthropic, OpenAI, DeepMind) | Exa + Firecrawl | "here's what this research means for builders" posts |
| **Videos** | YouTube talks, podcast episodes, conference keynotes | Firecrawl (transcript) + yt-dlp | repurpose-with-credit clips; "I watched X so you don't have to" |
| **PDFs / reports** | industry reports, whitepapers, slide decks | `pdf` skill + Firecrawl | data-drop hooks, infographic source material |
| **Posts** | your Dream100's LinkedIn/X, top newsletters | Exa (neural search) | what the field is reacting to *right now* |
| **Trends** | what's spiking in your niche this week | Exa + WebSearch | timely takes, prediction hooks |

Connect the two that matter most first: **Firecrawl** (URL → clean text, feeds everything) and **Exa** (neural search, finds *what to react to*). Skip Apify unless you need a bespoke scraper.

---

## The vetting bar (what makes the cut)

An input earns a post only if it clears all three:
1. **True** — you can stand behind it; the source is real and correctly represented (Metrics-Truth applies).
2. **Yours** — you have a genuine take, a counter-example, or lived experience to add. Reframing adds judgment; summarizing adds nothing.
3. **Theirs** — it teaches *your audience* something they'd thank you for. If it only impresses peers, skip it.

---

## Signal → post pipeline

```
source (Firecrawl/Exa/arXiv/PDF)
  → extract the single sharpest idea
  → match to a hook pattern (knowledge.md §1) + a pillar
  → your take layered on top (this is the value)
  → format pass (text / carousel / infographic / article)
  → critique gate → stage → you post
```

For repurpose-with-credit: the source is someone else's clip/post, the credit is mandatory and on its own line, and *your reframe is the product*. See `knowledge.md` §2.

---

## Indexing your own content (so nothing is wasted)

Point Signal at what you already have — past posts, talks, threads, repos, docs — and it builds a searchable library so ideation can recall and repurpose your own back-catalog:
- Drop exports / links and run `/linkedin index`.
- The index records: topic, format, hook used, performance (if known), and a one-line summary.
- `plan` then surfaces "you made this point 8 months ago and it did well — here's a fresh angle."

Your indexed library is private operating data — it lives in **Notion** (or your private repo), never in the open ACOS repo.
