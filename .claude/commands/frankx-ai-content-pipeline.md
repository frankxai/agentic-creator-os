---
description: End-to-end content pipeline from idea to published and distributed
thinking: false
---

# FrankX.AI Content Pipeline

**Purpose**: Orchestrate full content lifecycle from concept to distribution

## Pipeline Overview

```
IDEATE → DRAFT → POLISH → IMAGES → PUBLISH → DISTRIBUTE → ANALYZE
   ↓        ↓        ↓        ↓         ↓          ↓          ↓
 Soul    Creation  /polish  /generate  /deploy  /generate   /analytics
Strat.   Engine   -content  -images             -social
```

## Stage 1: Ideate (Soul Strategist)

### Content Sources

| Source | Check Location | Priority |
|--------|----------------|----------|
| SEO Gaps | `/docs/SEO_MARKETING_STRATEGY.md` | High |
| Editorial Calendar | `/docs/CONTENT_ROADMAP.md` | High |
| Product Support | `/docs/pods/*/backlog.md` | Medium |
| Community Questions | Analytics/comments | Medium |
| Trend Response | News/updates | Variable |

### Idea Validation

Before creating, confirm:
- [ ] Target keyword identified
- [ ] Audience segment clear
- [ ] Transformation promise defined
- [ ] Fits content pillar strategy
- [ ] Not duplicate of existing content

### Quick Ideation

```markdown
## Content Idea: [Title]

**Keyword**: [Primary target]
**Audience**: [Who this serves]
**Promise**: [What they'll gain]
**Pillar**: Creative AI Tools | AI Updates | Agentic | Generative
**Type**: Tutorial | Thought Leadership | Briefing | Product Story
**Est. Length**: [Word count]
```

## Stage 2: Draft (Creation Engine)

### Activate Blog Command

```
/frankx-ai-blog
```

### Draft Checklist

- [ ] Compelling hook (first 3 sentences)
- [ ] Clear structure (H2s outline the journey)
- [ ] Frank's voice (personal, specific, technical-yet-warm)
- [ ] Transformation arc (problem → solution → result)
- [ ] Supporting evidence (examples, data, stories)
- [ ] Clear CTA (next step for reader)

### First Draft Output

Save to: `/content/blog/XX-slug.mdx`

Include frontmatter:
```yaml
---
title: ""
description: ""
date: ""
author: "Frank"
category: ""
tags: []
image: ""
featured: false
keywords: []
readingGoal: ""
---
```

## Stage 3: Polish

### Two Options

**Option A: Self-Polish**
Use `/frankx-ai-blog` quality checklist

**Option B: Agent Polish**
```
/polish-content
```

### Polish Checklist

- [ ] AI patterns removed ("Let's dive in...", "In today's world...")
- [ ] Specific examples added (numbers, names, results)
- [ ] Frank's stories included (personal experience)
- [ ] Jargon explained or eliminated
- [ ] Flow is natural when read aloud
- [ ] SEO keywords placed naturally
- [ ] Internal links added (3-5)

## Stage 4: Images

### Generate Visuals

```
/generate-images
```

### Required Images

| Image | Size | Purpose |
|-------|------|---------|
| Header | 1200x630 | Blog hero, OG image |
| Twitter | 1200x628 | Twitter card |
| LinkedIn | 1200x627 | LinkedIn preview |
| Instagram | 1080x1080 | Instagram post |
| Quote Cards | 1080x1080 | Social quotes (3-5) |

### Image Prompts

Create prompts based on article themes:
- Abstract/conceptual for thought leadership
- Step-by-step for tutorials
- Data visualization for briefings

## Stage 5: Publish

### Pre-Publish Checklist

```bash
# Build verification
npm run build

# Generate assets
npm run gen:feed
npm run gen:search
```

### Publish

```
/frankx-ai-deploy
```

### Post-Publish

- [ ] Verify live at frankx.ai
- [ ] Check OG image renders
- [ ] RSS feed updated
- [ ] Search works

## Stage 6: Distribute

### Social Distribution

```
/generate-social
```

### Distribution Schedule

| Day | Action |
|-----|--------|
| Day 0 | Publish blog |
| Day 0 +2h | Twitter thread |
| Day 0 +4h | LinkedIn post |
| Day 1 | Instagram carousel |
| Day 2 | Medium syndication |
| Day 2 | Dev.to syndication |
| Day 7 | Newsletter feature |

### Cross-Promotion

- [ ] Link from related existing articles
- [ ] Add to relevant product pages
- [ ] Feature in prompt library (if applicable)

## Stage 7: Analyze

### Week 1 Review

```
/frankx-ai-analytics
```

### Performance Check

- Views and engagement
- Time on page
- Conversion actions
- Social performance

### Optimization Loop

If underperforming:
1. Review title/meta for CTR
2. Check hook engagement
3. Improve internal linking
4. Refresh social distribution

## Pipeline Templates

### Quick Content (1 day)

```
Morning: Ideate + Draft (2h)
Midday: Polish (1h)
Afternoon: Images + Publish (1h)
Evening: Distribute (30m)
```

### Standard Content (2-3 days)

```
Day 1: Ideate + Draft
Day 2: Polish + Images
Day 3: Publish + Distribute
```

### Premium Content (1 week)

```
Day 1-2: Deep research + Ideate
Day 3-4: Draft + Review
Day 5: Polish
Day 6: Images + Internal review
Day 7: Publish + Distribute
```

## Content Batching

For efficiency, batch similar stages:

**Draft Day**: Write 3-4 articles
**Polish Day**: Refine all drafts
**Image Day**: Generate all visuals
**Publish Day**: Deploy batch

## Tracking Pipeline Progress

Log in `/docs/CONTENT_ROADMAP.md`:

```markdown
| Title | Stage | Owner | Target Date | Status |
|-------|-------|-------|-------------|--------|
| AI Music Guide | Polish | Creation Engine | 2025-01-15 | In Progress |
| Suno Tutorial | Draft | Freq Alchemist | 2025-01-18 | Queued |
```

**Ready to run the pipeline. What stage are we at?**
