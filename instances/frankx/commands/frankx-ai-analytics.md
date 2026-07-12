---
description: Analyze FrankX.AI website performance, traffic, and conversion metrics
thinking: false
---

# FrankX.AI Analytics Intelligence

**Analytics**: Plausible (privacy-focused)
**Deployment**: Vercel Analytics

## Analytics Dashboard Access

### Plausible Analytics
- Dashboard: Check Plausible domain settings
- Key metrics: Visitors, pageviews, bounce rate, time on page

### Vercel Analytics (if MCP available)
```
Use Vercel MCP to:
- Get real-time traffic data
- Review Core Web Vitals
- Check deployment performance
```

## Key Performance Indicators

### Traffic Metrics

| Metric | Target | Current | Action If Below |
|--------|--------|---------|-----------------|
| Monthly Visitors | 10K+ | TBD | More SEO content |
| Bounce Rate | <50% | TBD | Improve landing pages |
| Avg Session | 3+ min | TBD | Better content engagement |
| Pages/Session | 2.5+ | TBD | Internal linking |

### Content Performance

Track by content type:
- **Blog Posts**: Views, time on page, scroll depth
- **Product Pages**: Views, CTA clicks, conversions
- **Prompt Library**: Usage, ratings, shares
- **Tools**: Completions, return visits

### Conversion Funnels

| Funnel | Entry | Goal | Target Rate |
|--------|-------|------|-------------|
| Newsletter | Any page | Signup | 3-5% |
| Product | Landing | Purchase | 2-3% |
| Assessment | CTA | Complete | 40%+ |
| Content | Blog | Product page | 10% |

## Weekly Analytics Review

### Monday Check (15 min)

1. **Traffic Overview**
   - Total visitors last week
   - Traffic sources breakdown
   - Top pages

2. **Content Performance**
   - Best performing articles
   - Underperformers to optimize
   - New vs returning visitors

3. **Conversion Review**
   - Newsletter signups
   - Product page visits
   - Assessment completions

### Action Items from Analytics

| Signal | Meaning | Action |
|--------|---------|--------|
| High bounce on article | Weak intro | Rewrite hook |
| Low time on product page | Not compelling | Improve copy |
| High exit on form | Friction | Simplify form |
| Traffic spike | Content working | Double down |

## Content Analytics Template

For each major piece of content, track:

```markdown
## Article: [Title]

**Published**: YYYY-MM-DD
**URL**: /blog/slug

### Week 1 Performance
- Views: X
- Avg Time: Xm Xs
- Bounce Rate: X%
- Scroll Depth: X%

### Traffic Sources
- Organic: X%
- Social: X%
- Direct: X%
- Referral: X%

### Conversions
- Newsletter signups: X
- Product page clicks: X
- CTA engagement: X%

### Optimization Actions
- [ ] Action based on data
```

## SEO Analytics

### Organic Search Tracking

Monitor:
- Keyword rankings (manual or tool)
- Organic traffic trends
- Click-through rates
- Featured snippet appearances

### Content Gap Analysis

```bash
# Check which pages get organic traffic
# Analyze in Plausible or Search Console

# Top organic landing pages
# Pages with high impressions but low clicks (optimize titles)
# High-ranking pages (protect and improve)
```

## Product Analytics

### Conversion Path Analysis

```
Visitor → Blog Article → Product Page → Checkout
           ↓                    ↓
      Newsletter Signup    Assessment
```

Track drop-off at each stage and optimize.

### Product Page Metrics

| Product | Views/Week | CTA Clicks | Conv Rate |
|---------|------------|------------|-----------|
| Creative AI Toolkit | TBD | TBD | TBD |
| Agentic Creator OS | TBD | TBD | TBD |
| Vibe OS | TBD | TBD | TBD |

## Reporting Template

### Weekly Report

```markdown
# FrankX.AI Weekly Analytics - Week of [Date]

## Traffic Summary
- **Total Visitors**: X (±X% vs last week)
- **Pageviews**: X
- **Avg Session**: Xm
- **Bounce Rate**: X%

## Top Content
1. [Article] - X views
2. [Article] - X views
3. [Article] - X views

## Conversions
- **Newsletter**: X new subscribers
- **Assessment Starts**: X
- **Product Views**: X

## Insights
- [Key observation 1]
- [Key observation 2]

## Actions for This Week
- [ ] [Based on data]
- [ ] [Based on data]
```

## Automated Tracking

### Event Tracking Setup

Key events to track:
- Newsletter form submissions
- CTA button clicks
- Assessment completions
- Product page scroll depth
- Prompt copy clicks

### Implementation

Check `/lib/analytics.ts` for current tracking setup.

## MCP Integration

If Vercel MCP available:
```
"Use Vercel MCP to get analytics for the past 7 days"
"Get Lighthouse scores for homepage"
"Show deployment analytics"
```

**Ready to analyze. What metrics are we reviewing?**
