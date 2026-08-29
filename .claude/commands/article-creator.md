---
name: article-creator
description: Create a source-grounded article and advance it only to the explicitly authorized state
---

# /article-creator — Content Intelligence Article Pipeline

Create a source-grounded article and take it only as far as the operator's authority permits.

## Contract

Read:

1. `docs/content-intelligence.md`
2. `skills/blog-writing/SKILL.md`
3. `skills/seo-optimization/SKILL.md`
4. `workflows/content/research-to-article.yaml`

Create working state from `templates/content/article-packet.json`.

Default authority is `DRAFT`. A request to write does not silently authorize repository, deployment, CMS, scheduler, or social writes.

## Invocation

```text
/article-creator [topic or source]
/article-creator --authority=DRAFT|PREVIEW|PUBLISH|DISTRIBUTE [topic or source]
```

Infer routine context from the active repository and connected evidence. Ask only when a missing choice changes public identity, rights, secrecy, destructive scope, or publication authority. Do not force the user through a generic backlog/angle/length questionnaire.

## Execution

1. Resolve the task envelope: creator/property, canonical repository/CMS, audience, authority, rights, timing, and success condition.
2. Inspect active instructions, current content model, existing related URLs, editorial state, live route, and performance evidence.
3. Build the source and claim ledgers; capture current primary sources and a dated search/competitor snapshot when discovery matters.
4. Pass the commission gate. Return one precise reporting assignment, `HOLD`, or `KILL` when origin, evidence, or information gain is missing.
5. Freeze the thesis, reader consequence, strongest objection, canonical/internal-link role, offer/affiliate relationship, and media necessity.
6. Draft in the active creator voice. Do not impose word count, keyword density, TL;DR, question headings, FAQ, link count, image count, or CTA unless the subject/repository requires it.
7. Run independent truth/rights, commissioning/ICP, SEO/GEO, visual, and production lanes. Allow one substantive editorial rewrite.
8. For `PREVIEW+`, create a content branch and pull request, run repository-native checks, and inspect the rendered preview on mobile and desktop.
9. For `PUBLISH+`, release only after every gate passes and verify the canonical production URL.
10. For `DISTRIBUTE`, create channel-native objects with content ID, UTMs, disclosure, asset renditions, approval, remote result, and final URL.
11. Record T+0/T+7/T+28/T+90 measurement and freshness triggers.

## Completion

Lead with the actual article or verified preview. Then return:

- status and authority;
- canonical property/path and content ID;
- key sources and claims changed or removed;
- media asset IDs and placements;
- checks and independent verdicts;
- remote writes and verified URLs;
- blockers, rollback, and next measurement event.

Never synthesize a live URL, claim a deployment from a commit alone, or mark `PUBLISHED`/`DISTRIBUTED` without remote confirmation.
