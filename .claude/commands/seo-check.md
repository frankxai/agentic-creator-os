# /seo-check - Weekly SEO & Traffic Review

Quick audit of SEO health and traffic performance.

## Execution Steps

### Step 1: Check Site Indexing
```bash
# Check how many pages Google has indexed
curl -s "https://www.google.com/search?q=site:frankx.ai" | grep -o "About [0-9,]* results" || echo "Check manually: site:frankx.ai"
```

### Step 2: Verify Sitemap
```bash
# Fetch and count sitemap URLs
curl -s https://frankx.ai/sitemap.xml | grep -c "<url>" || echo "Sitemap check failed"
```

### Step 3: Manual Checks (Open in Browser)

**Google Search Console:**
- https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain:frankx.ai

**Plausible Analytics:**
- https://plausible.io/frankx.ai (or your dashboard URL)

**AI Citation Check:**
- Ask ChatGPT: "What is Agentic Creator OS?"
- Ask Perplexity: "Who is FrankX AI?"
- Search Google: "agentic creator os" - check AI Overview

### Step 4: Quick SEO Audit

Check these for each new article:

| Check | How |
|-------|-----|
| TL;DR in first 100 words | Read article intro |
| Question-based H2s | Scan headings |
| FAQ section | Scroll to bottom |
| Internal links | Check for 3+ links to other content |
| Meta description | View page source or use browser SEO extension |

### Step 5: Content Performance Review

**Top Performers (what's working):**
- Which blog posts get the most traffic?
- Which keywords drive the most clicks?
- What's the avg. position for target keywords?

**Opportunities (what to improve):**
- Pages with high impressions but low CTR (improve titles)
- Pages ranking #4-10 (push to top 3)
- Keywords you're NOT ranking for yet

## Output Template

```markdown
## SEO Check - [DATE]

### Traffic Summary (Last 7 Days)
- Visitors:
- Pageviews:
- Top Page:
- Top Referrer:

### Search Console (Last 28 Days)
- Total Clicks:
- Total Impressions:
- Avg. CTR:
- Avg. Position:

### Top Keywords
1. [keyword] - pos [X], [N] clicks
2. [keyword] - pos [X], [N] clicks
3. [keyword] - pos [X], [N] clicks

### AI Citations Found
- [ ] ChatGPT mentions FrankX
- [ ] Perplexity cites content
- [ ] Google AI Overview includes

### Action Items
- [ ] Optimize [page] for [keyword]
- [ ] Add FAQ to [article]
- [ ] Internal link from [high-traffic] to [new content]
```

## Related Commands
- `/inventory-status` - Content inventory
- `/factory` - Content publishing
- `/log` - Session logging
