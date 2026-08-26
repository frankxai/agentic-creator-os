# /seo-check — Search and AI-Discovery Review

Review rendered technical eligibility, source/reader value, entity consistency, link architecture, AI-discovery controls, and measured outcomes using current first-party guidance.

## Contract

Read:

- `docs/content-intelligence.md`
- `skills/seo-optimization/SKILL.md`
- target repository instructions and content schema

Do not use scraped `site:` result counts, keyword-density formulas, fixed link/image counts, mandatory FAQ schema, generic SEO scores, or unrepeatable prompts to AI products as measurement.

## Modes

```text
/seo-check [URL-or-content-id]
/seo-check --site [domain]
/seo-check --cluster [cluster-id]
/seo-check --measurement [content-id]
```

## Evidence collection

1. Resolve canonical domain, repository/project, content ID, source path, current deployment, locale, and observation window.
2. Read connected Search Console, Bing Webmaster, analytics, link, affiliate/product, and editorial records when available. State unavailable lanes rather than inventing zeros.
3. Capture current primary search/crawler guidance for unstable policy questions.
4. Annotate algorithm updates, data incidents, migrations, campaigns, and seasonality.

## Rendered technical checks

- public HTTP 200 and meaningful server/static main content;
- index/noindex and snippet controls;
- canonical, redirects, sitemap membership, truthful `lastmod`;
- title, description, headings, locale, author/profile, publication/update dates;
- visible-content-consistent JSON-LD and validation;
- crawlable internal links, orphan status, broken links, redirect chains, canonical conflicts;
- standard image markup, stable URLs, alt text, representative image variants, crawlability;
- mobile output, performance, hydration/runtime errors, analytics events.

Robots exclusion is not a deindexing method. Do not infer indexing from a sitemap alone.

## Editorial and discovery checks

- exact reader intent and competent-reader baseline;
- first-party origin or research delta;
- material claims with primary/authoritative sources, dates, and freshness;
- information gain versus current result set;
- coherent entities, questions, answer units, and cross-format facts;
- topic/cluster role and cannibalization/consolidation decision;
- proportional offer/affiliate relationship and disclosure;
- headline and imagery accurately representing the page.

Google requires no special AI schema or AI text file and says it ignores `llms.txt`. Track `OAI-SearchBot` and `GPTBot` independently and use product-specific crawler controls. Never promise AI inclusion.

## Measurement

Separate:

- Google Web impressions/clicks/queries/pages;
- Google generative-AI impressions where the report is available;
- Bing AI citations/grounding-query samples, which are not rank or authority;
- analytics qualified visits, engagement, actions, and conversions;
- AI/search/social/referral traffic, earned links, subscriptions, opportunities, affiliates, and revenue;
- research/production/distribution/maintenance cost.

Use T+0, T+7, T+28, and T+90 snapshots or an evidence-appropriate longer window. Search Console and analytics measure different systems and will not match exactly.

## Output

Return:

1. decision and highest-impact finding;
2. measurement integrity and current state;
3. technical/index/render findings;
4. editorial/entity/link findings;
5. discovery, trust, and commercial evidence;
6. explicit guidance versus inference;
7. prioritized fixes or experiment with owner, evidence, expected effect, guardrails, and verification date.

Never attribute movement to one algorithm or content change without cohort, timing, and technical evidence.
