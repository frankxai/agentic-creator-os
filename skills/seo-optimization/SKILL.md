---
name: SEO Optimization
description: Improve search and AI-discovery eligibility, usefulness, technical integrity, entity consistency, internal links, digital PR, and measurable outcomes using current first-party guidance without ranking guarantees or keyword-density tactics
version: 2.0.0
triggers:
  - "seo"
  - "geo"
  - "aeo"
  - "AI search"
  - "search optimization"
  - "keyword research"
  - "rank higher"
  - "backlinks"
  - "skill:seo-optimization"
---

# SEO and AI Discovery

## Governing contract

Read `docs/content-intelligence.md`. Use current first-party search and crawler documentation for any unstable rule, feature, limit, or claim.

Never promise rank, traffic, rich results, or AI citation. Forecast with explicit assumptions and confidence, then preserve predicted and actual outcomes separately.

## Current position

Google states that existing SEO fundamentals apply to AI Overviews and AI Mode. Pages must be indexed and snippet-eligible. No special AI schema, AI text file, or artificial chunking is required, and Google says it ignores `llms.txt`.

- [Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), updated 2026-07-10.
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), updated 2025-12-10.

AI-assisted production is not prohibited as a method. Scaled automation produced primarily to manipulate ranking can violate spam policy. Require information gain, accuracy, source visibility, relevant metadata, and disclosure where expected.

- [Generative AI content guidance](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content), updated 2025-12-10.
- [People-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), updated 2025-12-10.
- [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies), updated 2026-05-15.

## Opportunity packet

Capture:

- query, locale, device posture, date, dominant intent, result types, source diversity;
- competent-reader expectation and weak/duplicated result coverage;
- creator's earned information gain and primary evidence;
- canonical URL, existing adjacent pages, consolidation/cannibalization decision;
- entities, subquestions, answer units, internal-link role, and freshness burden;
- likely conversion or authority role, not only estimated traffic.

Treat community language and search snippets as discovery evidence, not factual support.

## Rendered technical gate

Verify:

- public HTTP 200 and meaningful server/static main content;
- index/noindex and snippet controls;
- canonical, redirects, absolute canonical sitemap URL, truthful `lastmod`;
- title, description, heading structure, locale, author/profile identity;
- crawlable `<a href>` internal links, no orphan important pages, no broken links or redirect chains;
- accessible images in standard markup with stable URLs, useful alt text, captions/credits when needed;
- visible-content-consistent JSON-LD and no schema errors;
- mobile output, performance, hydration/runtime errors, and analytics events.

Robots exclusion is not a deindexing method. Use `noindex` while allowing the crawler to read it when deindexing is intended.

## Content and entities

- Lead with the actual answer or earned thesis.
- Use clear sections inside a substantial canonical page; do not create thin fan-out pages.
- Preserve exact entity names, dates, units, scope, author, organization, sources, method, and update history.
- Use `Article`/`BlogPosting`, profile, organization, breadcrumb, or media schema only when supported and visible.
- Do not force FAQ sections or FAQ schema. Google reported FAQ rich results stopped appearing in May 2026; Q&A still belongs where readers need it.
- Internal links should be contextual and descriptive. There is no magic link count.

## AI crawler controls

- `OAI-SearchBot` controls ChatGPT Search visibility; `GPTBot` is a separate training-use control: [OpenAI crawler docs](https://developers.openai.com/api/docs/bots).
- `PerplexityBot` controls Perplexity search crawling; `Perplexity-User` is distinct: [Perplexity crawler docs](https://docs.perplexity.ai/docs/resources/perplexity-crawlers).
- Validate published IP/signature guidance and WAF behavior; do not trust user-agent text alone.
- `llms.txt` may remain optional ecosystem metadata but does not replace HTML, schema, crawler access, or sitemaps.

## Images

Use high-quality relevant images near supporting text, descriptive filenames, contextual alt text, stable crawlable URLs, and standard markup. Keep the clean representative article/schema image separate from text-led social cards. Preserve high-resolution 16:9, 4:3, and 1:1 variants where the publisher supports them.

- [Google Images guidance](https://developers.google.com/search/docs/appearance/google-images), updated 2026-03-02.
- [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article).

## Digital PR and links

Earn links through original datasets, benchmarks, tools, calculators, templates, primary interviews, definitive maps, maintained references, and uncommon visual explanations.

Reject paid ranking credit, automated link creation, excessive exchanges, low-quality directories, disguised advertorials, and mass low-context outreach. Qualify paid and affiliate links with `sponsored` or appropriate `nofollow`; use `ugc` for user-generated links.

- [Qualifying outbound links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links).

## Measurement

Separate:

- Google Search Console Web impressions/clicks/queries/pages;
- Google Generative AI Performance where available;
- Bing AI citations and grounding queries, which are not rank or authority;
- analytics sessions, engagement, actions, and conversions;
- AI/search/social/referral sources, earned links, affiliate/product value.

Annotate algorithm updates, data incidents, migrations, campaigns, and seasonality before diagnosis.

- [Google Generative AI Performance](https://support.google.com/webmasters/answer/16984139?hl=en).
- [Search Console and Analytics](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console).
- [Bing AI Performance](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview), 2026-02-10.

## Output

Return opportunity evidence, technical findings, content/entity findings, link graph, prioritized actions, forecast with assumptions, executed fixes, verification, and measurement date. Distinguish explicit guidance from implementation inference.

## Remove these legacy patterns

- keyword density, LSI keywords, bolding keywords, and universal title/meta/word-count formulas;
- fixed minimum internal/external link or image counts;
- manual `site:` result-count scraping as an indexing metric;
- asking an AI product whether it mentions the brand as a measurement system;
- mandatory FAQPage schema or “featured snippet” copy blocks;
- automatically interpreting an SEO score as publication quality.
