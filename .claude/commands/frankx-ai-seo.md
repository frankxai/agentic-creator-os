---
description: SEO optimization, keyword research, and content performance for FrankX.AI
thinking: false
---

# FrankX.AI SEO Intelligence System

**Strategy Doc**: `/docs/SEO_MARKETING_STRATEGY.md`
**Content Strategy**: `/docs/CONTENT_STRATEGY.md`

## SEO Architecture Overview

### Core Pillars (from KNOWLEDGE_BASE.md)

1. **Creative AI Tools** - Tool guides, tutorials, comparisons
2. **Latest AI Updates** - News, trends, intelligence briefings
3. **Agentic Management** - Multi-agent systems, orchestration
4. **Generative AI Approach** - Creative workflows, prompts

### Target Keywords by Pillar

| Pillar | Primary Keywords | Content Type |
|--------|------------------|--------------|
| AI Tools | "AI music tools", "Suno tutorial", "AI for creators" | Tutorials |
| AI Updates | "AI news 2025", "agentic AI", "enterprise AI" | Briefings |
| Agentic | "multi-agent AI", "AI orchestration", "agent workflows" | Deep dives |
| Generative | "AI prompt engineering", "creative AI", "AI art" | Guides |

## SEO Audit Checklist

### Technical SEO

```bash
# Check sitemap exists
ls public/sitemap.xml

# Check robots.txt
cat public/robots.txt

# Verify RSS feed
cat public/rss.xml | head -50

# Check for missing alt texts
grep -r "alt=\"\"" components/
```

### On-Page SEO (per article)

- [ ] Title tag: 50-60 chars, keyword front-loaded
- [ ] Meta description: 150-160 chars, includes CTA
- [ ] H1: One per page, contains primary keyword
- [ ] H2s: Secondary keywords, logical structure
- [ ] Internal links: 3-5 per article
- [ ] External links: Authoritative sources
- [ ] Image alt text: Descriptive, keyword-aware
- [ ] URL slug: Short, keyword-rich

### Content Quality Signals

- [ ] Word count: 1500+ for pillar content
- [ ] Originality: Frank's unique perspective
- [ ] E-E-A-T: Experience, Expertise, Authority, Trust
- [ ] Freshness: Recent examples, 2025 references
- [ ] Multimedia: Images, code blocks, frameworks

## SEO Opportunities

### Quick Wins
1. Update old articles with 2025 context
2. Add internal links to new content
3. Optimize underperforming titles
4. Add FAQ schema to relevant pages

### Content Gaps
Check what competitors rank for but we don't:
- AI music production workflows
- Enterprise AI governance
- Creator AI tools comparison

### Internal Linking Strategy

Link TO these high-value pages:
- `/intelligence-atlas` - Flagship research
- `/products/agentic-creator-os` - Core offer
- `/prompt-library` - Utility value
- `/blog/08-golden-age-of-intelligence` - Thought leadership

Link FROM new content to spread authority.

## SEO Tracking

### Key Metrics to Monitor
- Organic traffic (via Plausible/Vercel)
- Keyword rankings
- Click-through rate
- Time on page
- Bounce rate

### Performance by Content Type

| Type | Avg. Organic Traffic | Top Performer |
|------|---------------------|---------------|
| Intelligence Briefings | TBD | Week 39 |
| Tutorials | TBD | - |
| Thought Leadership | TBD | Golden Age |
| Product Pages | TBD | - |

## Schema Markup

Using JSON-LD for:
- Organization schema (sitewide)
- Article schema (blog posts)
- Product schema (product pages)
- FAQ schema (where applicable)

Check implementation in `/lib/seo.ts`.

## Monthly SEO Tasks

1. **Week 1**: Audit top 10 pages, update metadata
2. **Week 2**: Publish 2 new keyword-targeted articles
3. **Week 3**: Build internal links, update old content
4. **Week 4**: Analyze performance, plan next month

## Tools Integration

If available via MCP:
- Vercel Analytics for traffic data
- Search Console data (manual check)
- Competitor analysis tools

## SEO-First Article Template

When creating for SEO:

```markdown
---
title: "[Primary Keyword]: [Benefit/Promise]"
description: "[Action verb] [keyword] [outcome]. [CTA]."
keywords: ["primary", "secondary", "long-tail"]
---

# [H1 with Primary Keyword]

[Hook paragraph with keyword naturally included]

## What is [Keyword]? (Definition/Context)

## Why [Keyword] Matters for [Audience]

## How to [Action] with [Keyword]: Step-by-Step

## [Keyword] Best Practices

## FAQ: [Keyword] Questions

## Next Steps
```

**Ready for SEO work. What's the focus - audit, optimization, or new content planning?**
