# Research packet field contract

`templates/content/research-packet.json` is the evidence attachment to the existing
article packet. `article_content_id` joins the records. It does not replace
editorial status, approval, deployment receipts, or the canonical site content
model. Unknown values stay null; an unfilled template cannot pass validation.

Run `node scripts/validate-research-packet.mjs <packet.json>` before review. The
dependency-free validator returns deterministic errors and nonzero exit on failure.
It checks structure and declarations, not source truth or legal validity.

| Record | Required fields |
| --- | --- |
| Brief | `question`, `decision`, `contribution`, `strongest_objection` |
| Method | `mode: source_review / original_experiment / mixed`, nonempty `limitations`, nonempty `contrary_search`, `coverage_gaps` |
| Source | unique `id`, `url`, `title`, `kind`, `published_at` and `updated_at` (date or null), observed `retrieved_at` (ISO timestamp, or date with `retrieval_precision: date`), `reviewed: true`, `evidence_family`, `availability`, `limitations` array |
| Claim | unique `id`, atomic `text`, `type`, `as_of`, `verdict`, nonempty `references`, `limitations`, nonempty `freshness_triggers`, `contrary_evidence` |
| Claim reference | known `source_id`, exact `locator`, `support: direct / derived / contextual / contested` |
| Contrary evidence | known `source_id`, exact `locator`, `effect` on the claim |
| Executed experiment | unique `id`, `question`, `artifact`, `environment`, `command`, `result`, `executed_at` (ISO timestamp), nonempty `limitations` |
| Media | unique `id`, `kind`, known `source_id`, `url`, `publisher`, `captured_at` (ISO timestamp), `locator`, `caption`, `alt`, `placement`, `transformation`, `use`, `rights_basis`, `rights_evidence` |
| Publication record | canonical HTTPS URL, `title`, `description`, `author`, distinct `reviewer`, `reviewed_at` (ISO timestamp), `related_urls`, `render_strategy: server_or_static` |

Source kinds: `documentation`, `paper`, `repository`, `release`, `dataset`,
`official_video`, `observation`, `secondary`. Availability: `ga`, `preview`, `beta`,
`experimental`, `proposed`, `unknown`, `not_applicable`. Source date fields may be
null when not supplied by the publisher; retrieval dates must be observed. Preserve
the precision actually available: use `retrieved_at: "2026-10-09"` with
`retrieval_precision: "date"` when only the retrieval day is recorded. Use an ISO
timestamp with `retrieval_precision: "timestamp"` when the clock time is recorded.
Omitting precision preserves compatibility with existing timestamp records; a
date-only value requires explicit date precision. Do not invent midnight or another
clock time. Media `captured_at` still requires an observed timestamp.

Claim types inherit the content intelligence contract: `fact`, `first_party`,
`inference`, `opinion`, `forecast`, `community_signal`. Verdicts: `pass`, `revise`,
`blocked`. A promoted fact needs direct or derived support, not contextual citations
alone. Claims under dispute need a changed/narrowed claim or an explicit limitation
that acknowledges the dispute; a source count is never a truth score.

Media kinds: `screenshot`, `graphic`, `video`, `original_diagram`. Use: `rehost`,
`embed`, `link`, `original`. Rights basis: `permission`, `license`, `provider_embed`,
`link_only`, `original`, `unresolved`. Rehosting needs permission/license; embedding
needs provider-embed permission/license; linking needs link-only/permission/license;
original work needs original provenance. Rights evidence is an inspectable license,
permission, verified official embed record, or original asset record, not “official”.

`SOURCE_REVIEWED` means inspected source synthesis, not independent reproduction.
It requires source-review mode, supported claims, independent reviewer, and no
blocking declarations. `EXPERIMENT_REPORTED` requires original/mixed mode and at
least one executed, inspectable experiment. `SEED` and `HOLD` permit unresolved
claims and rights but still require structurally valid records. Live publication is
recorded only in the article packet with remote evidence.

`publication_record` describes the intended canonical output, not deployment proof.
The publishing repository owns the record that generates visible research, hub
cards, metadata/schema, and sitemap. Keep the packet's canonical URL/title/method
aligned with that record during handoff; validation does not implement a site renderer.
