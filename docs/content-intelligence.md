# Content Intelligence Contract

Version: 1.0.0  
Verified against first-party search guidance: 2026-08-26

ACOS content work is an evidence-bound editorial system, not a volume generator. Scale research contracts, publishing infrastructure, and learning loops; do not scale commodity prose.

## Governing outcome

Publish work with a source-visible unique contribution that serves a real reader, clears rights and technical gates, compounds the creator's authority, and produces measurable learning or commercial value.

`PUBLISH NOTHING` is valid when origin, evidence, reader consequence, or authority is missing.

## System shape

Use a manager-workers vertical:

- editor-in-chief: task envelope, commission, synthesis, conflict resolution, final status;
- research lead: primary sources, SERP/competitor snapshot, claim candidates;
- fact/rights reviewer: claim support, quotation, privacy, license, disclosure;
- SEO/GEO architect: intent, entities, crawl/render, metadata, schema, links;
- author: source-grounded draft and one substantive revision;
- commissioning/ICP editor: origin, information gain, trust, reader transfer;
- visual director: visual necessity and governed production brief;
- production engineer: repository checks, preview, deployment evidence;
- distribution/revenue lead: channel adaptation, UTM, offer/affiliate fit;
- measurement analyst: dated snapshots, diagnosis, refresh decision.

Workers append to one article packet. They cannot silently overwrite another lane or approve their own work.

## Authority levels

| Level | Allowed actions |
| --- | --- |
| `DRAFT` | Research, brief, article packet, local draft, media brief, validation |
| `PREVIEW` | `DRAFT` plus branch, commit, pull request, preview, editorial-ledger update |
| `PUBLISH` | `PREVIEW` plus merge/CMS release and production verification for the named property |
| `DISTRIBUTE` | `PUBLISH` plus approved scheduling/posting to named accounts and result capture |

A request to write does not imply publish. A request to publish one property does not authorize every property or social account. Use explicit operator language or checked-in standing policy.

## Canonical source responsibilities

Keep one owner per truth:

- Git repository or repository-backed CMS: publishable source, code, schema, policy, history;
- editorial system: briefs, decisions, status, assignment, review context;
- document store: proofs, source files, collaborator review, handoff;
- deployed site: rendered behavior, metadata/schema, preview/production evidence;
- analytics: dated measurements, never editorial canon;
- scheduler: staged/approved channel objects and remote results, never article canon.

Do not create a second cockpit when one already exists. Never claim a remote write, preview, deployment, page, or post exists without connector evidence.

## Source and claim control

Use the closest authoritative source:

1. verified first-party artifact, measured result, approved statement, or direct observation;
2. canonical code/configuration/release/telemetry/CMS record;
3. primary external documentation, standard, law, filing, dataset, or paper;
4. inspectable high-quality synthesis;
5. community discourse as a language or demand signal only.

Read the full source. Search snippets establish relevance, not truth. Record publication/update time and retrieval time separately.

Every material claim records:

- stable claim ID and atomic public wording;
- type: `fact`, `first_party`, `inference`, `opinion`, `forecast`, or `community_signal`;
- source IDs and support: `direct`, `derived`, `contextual`, `contested`, or `blocked`;
- `as_of` date, freshness/expiry trigger, and independent verdict.

State inference and forecast explicitly. Never invent a source, quote, number, customer, result, experience, partnership, URL, or publication state. If support is unavailable, narrow/remove the claim or block promotion.

## Commission gate

Freeze before prose:

- subject and first-party origin or research delta;
- one thesis, stakes, reader baseline, and reader consequence;
- strongest informed objection;
- brand/property, audience, cluster, canonical URL, related pages, and cannibalization decision;
- intent, entities, questions, internal-link role, and search-result gap;
- source ledger and typed claim ledger;
- offer/affiliate relationship or `none`;
- media necessity, rights boundary, authority, and freshness window.

Proceed only when the piece has original reporting, data, working artifacts, verified experience, uncommon examples, a consequential decision, or proprietary synthesis. Style cannot repair missing authority.

## Article graph

1. Reconstruct canonical context and existing URLs.
2. Capture current primary sources and a dated SERP/competitor/community signal packet where relevant.
3. Pass the commission gate and freeze the brief/claims.
4. Draft from evidence: direct answer or earned thesis -> evidence/context -> mechanism -> implications/trade-offs -> examples -> reader transfer.
5. Design media only when it adds evidence, emotion, or explanatory power.
6. Run independent truth/rights, editorial/ICP, SEO/GEO, visual, and production lanes.
7. Allow one substantive editorial rewrite; return weak work to reporting or hold.
8. Create a pull request and inspect the rendered preview when authority permits.
9. Publish/distribute only within authority and capture remote evidence.
10. Observe T+0, T+7, T+28, and T+90; append learning without rewriting the original hypothesis.

## Search and AI-discovery position

Google states that established SEO fundamentals apply to AI Overviews and AI Mode, eligible pages must be indexed and snippet-eligible, and no special AI schema, AI text file, or artificial chunking is required. Google says it ignores `llms.txt`.

- [Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), updated 2026-07-10.
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), updated 2025-12-10.

AI-assisted production is not prohibited as a method. Scaled automation created primarily to manipulate rankings can violate spam policy. Require accuracy, quality, relevance, metadata, disclosure where expected, and real information gain.

- [Generative AI content guidance](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content), updated 2025-12-10.
- [People-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), updated 2025-12-10.
- [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies), updated 2026-05-15.

Operational rules:

- satisfy intent with substantial canonical pages and clear, independently legible answer units;
- preserve identifiable author/reviewer, sources, method, dates, and update history;
- generate JSON-LD from the same record that renders visible content;
- use only supported, accurate schema; rich results are never guaranteed;
- do not force FAQ sections or FAQ schema; Q&A is valid only when the reader needs it;
- use contextual crawlable internal links; prevent orphans, duplicates, redirect chains, and keyword-stuffed anchors;
- validate rendered HTTP 200, canonical, robots/index/snippet controls, sitemap/lastmod, metadata, schema, links, images, mobile output, and runtime errors;
- prefer server/static output for essential article content;
- never promise rank, traffic, or AI citation.

## AI crawler controls

Treat discovery and training controls independently:

- allow `OAI-SearchBot` for ChatGPT Search visibility when desired; `GPTBot` is a separate training-use control: [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots);
- allow `PerplexityBot` for Perplexity search visibility when desired; `Perplexity-User` is a distinct user-triggered fetcher: [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers);
- validate published IP/signature and WAF behavior instead of trusting user-agent text alone;
- treat `llms.txt` as optional ecosystem metadata, never as a substitute for indexable HTML, sitemaps, structured data, or crawler access.

## Images and media

Every article needs deliberate social/metadata imagery, but not every article needs a decorative on-page hero or infographic. Visuals must reveal evidence, carry emotion unavailable in prose, or make a mechanism materially easier to understand.

Use high-quality relevant images near supporting text, descriptive filenames, contextual alt text, stable crawlable URLs, and standard image markup. Maintain representative high-resolution 16:9, 4:3, and 1:1 variants where the publisher supports them. Keep clean editorial/schema imagery separate from text-led social cards.

- [Google Images guidance](https://developers.google.com/search/docs/appearance/google-images), updated 2026-03-02.
- [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article).

Preserve stable asset/version/rendition identity, provenance, rights, consent, checksum, dimensions, alt text, approval, semantic placement, and rollback. Never fabricate documentary evidence.

## Digital PR and affiliates

Earn links with assets worth citing: original research, datasets, benchmarks, open tools, calculators, templates, primary interviews, definitive maps, maintained reference pages, and uncommon visual explanations.

Reject paid ranking credit, automated links, excessive exchanges, low-quality directories, disguised advertorials, and mass low-context outreach. Qualify paid/affiliate links with `rel="sponsored"` or appropriate `nofollow`; use `ugc` for user-generated links. Affiliate work needs original decision value, verified destinations/terms, explicit disclosure, and proportional fit.

- [Qualifying outbound links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links).

## Distribution and measurement

Adapt by medium; do not paste the same article summary everywhere. Preserve content ID, source version, channel/account, copy version, media rendition IDs, canonical URL/UTM, disclosure, approval, schedule, remote result, and final URL.

Separate:

- discovery: index/canonical, Google Web, Google generative-AI reporting where available, Bing AI citations, referrals, earned links;
- consumption/trust: qualified sessions, return, subscriptions, saves/shares/replies, expert response, branded demand;
- commercial: CTA, lead/trial/product, affiliate outbound/revenue, assisted conversion, contribution after production/maintenance cost.

Google Web/Search Console and GA4 will not match exactly; measure their distinct roles. Bing citation count is not rank or authority.

- [Google Generative AI Performance report](https://support.google.com/webmasters/answer/16984139?hl=en).
- [Search Console and Analytics](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console).
- [Bing AI Performance](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview), 2026-02-10.

Annotate algorithm updates, data incidents, migrations, campaigns, and seasonality before diagnosis.

## Scale protocol

For more than three pieces:

1. build a topic/entity/URL graph and existing-content inventory;
2. define cluster sources, unique contribution, internal-link roles, commercial path, and maintenance cost;
3. prioritize by reader pain, earned authority, information gap, linkability, conversion relevance, and evidence readiness;
4. release a proof wave of up to three;
5. observe indexing, qualified engagement, citations/referrals, assisted conversion, and editorial feedback;
6. expand in bounded waves with semantic-duplication and cannibalization checks.

Use a 3/3/4 evidence cadence for ten pieces. Treat 200 pieces as a maintained portfolio with cluster owners, refresh budgets, and kill thresholds—not one generation run.

## Status and evidence receipt

Use `SEED`, `COMMISSION`, `DRAFT`, `READY_FOR_OPERATOR`, `PREVIEW_LIVE`, `PUBLISHED`, `DISTRIBUTION_STAGED`, `DISTRIBUTED`, `HOLD`, or `KILL`. Reserve live states for confirmed external evidence.

Return the publishable object or preview first, then a compact receipt: sources read, claims changed/removed, asset IDs, checks, remote writes/URLs, blockers, rollback, and next measurement event.
