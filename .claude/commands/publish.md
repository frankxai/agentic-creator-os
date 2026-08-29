---
name: publish
description: Publish a reviewed content packet through the canonical publisher and verify the remote result
---

# /publish — Evidence-Bound Publishing Orchestrator

Publish a reviewed content packet through the active repository/CMS and verify the actual production result.

## Contract

Read `docs/content-intelligence.md` and the target repository's instructions/content schema before action. Use the working article packet based on `templates/content/article-packet.json`.

```text
/publish [path-or-content-id]
/publish --dry-run [path-or-content-id]
/publish --authority=PREVIEW|PUBLISH|DISTRIBUTE [path-or-content-id]
```

There is no `--force`, `--skip-review`, direct-to-main, hard-coded copy path, or fabricated live URL path. Resolve the canonical publisher from repository evidence.

## Preflight

Require:

- stable content ID, canonical creator/property, repository/CMS path, and explicit authority;
- frozen thesis and reader consequence;
- source and typed claim ledgers with no unresolved central claim;
- truth/rights, commissioning editor, SEO/GEO, and production-verifier passes;
- governed media identities, provenance, rights, alt text, placements, and approval;
- correct commercial relationship, affiliate disclosure/link qualification, and current destination;
- index/canonical/sitemap/structured-data/internal-link plan;
- rollback or supersession path.

Return the exact blocker when any requirement fails.

## Preview

1. Create or reuse a content branch; never overwrite unrelated work.
2. Apply the smallest coherent change according to the target content model.
3. Run repository-native format, lint, type, content/schema, link, and production-build checks.
4. Create a pull request with brief, source/evidence receipt, media placements, test results, risk, and rollback.
5. Resolve the actual preview deployment and inspect mobile/desktop output:
   - HTTP and rendered main content;
   - title, description, author/dates, canonical, robots/snippet controls;
   - JSON-LD matching visible content;
   - images, alt text, crop, links, responsive behavior;
   - analytics events and runtime/build errors.
6. Mark `PREVIEW_LIVE` only when the pull request and preview are confirmed.

## Production

Proceed only with `PUBLISH` or `DISTRIBUTE` authority and passed preview/release gates.

1. Merge or release through the repository/CMS native path.
2. Resolve the production deployment and canonical URL.
3. Verify the live page serves the intended version and critical metadata/assets/links.
4. Capture commit/PR/deployment/live URL/time and rollback evidence.
5. Update the existing editorial record; do not create another cockpit or canonical copy.
6. Mark `PUBLISHED` only after production readback succeeds.

## Distribution

With `DISTRIBUTE` authority, stage or publish only to named verified accounts. Preserve content ID, source version, copy/media versions, UTMs, disclosure, approval, schedule, remote result ID, and final URL. A live article does not imply automatic social permission.

## Report

Return the live or preview URL first, then the gate verdicts, executed writes, verification, blockers, rollback, and next measurement event. Never expose credentials, signed URLs, private source material, or internal tokens.
