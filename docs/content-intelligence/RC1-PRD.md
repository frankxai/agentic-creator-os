# Content Intelligence RC1 — PRD and architecture contract

Status: Draft; implementation not accepted. Issue: #151. Date: 2026-11-14.

## Reality
GenCreator-ai/gencreator.ai owns creator identity, sources, approvals and durable state. Its README explicitly holds managed alpha and disables autonomous publishing. ACOS is experimental local workflow tooling, not a cloud agent. Reuse workflows/social-media/cross-platform-distribution.yaml and skills/blog-writing/SKILL.md. Notion Content OS Canonical Data Library and LinkedIn & Brand Presence OS exist; Drive has ACOS & GenCreator DAM Architecture and Week 46 content pack. Their contents require reconciliation.

## Objective
Produce one original, evidence-backed technical insight with two unpublished derivatives: LinkedIn document carousel PDF and Instagram 4:5 slides. No auto-publish, no production deploy, no fabricated metrics.

## Ownership
ACOS: portable SOPs, schemas, local validation and test fixtures.
GenCreator: customer identity, source records, approvals, export UX and durable state, subject to ADR-010/ADR-007 and production gates.
Starlight: research, claim provenance, model routing and eval adapters.
Notion: editorial projection; Drive/R2: source and media assets, subject to permissions.

## Data contract
content_id, topic_id, brand_id, audience, thesis, source_refs[{url, fetched_at, author, license, checksum}], claims[{text, source_ref, evidence_span, confidence}], derivatives[{channel, format, asset_hash, render_version, status}], review[{reviewer, content_hash, channel, approved_at, expires_at}], runs[{provider, model, input_tokens, output_tokens, cost_estimated, cost_billed, retries, duration_ms}].
Each claim must cite primary evidence. Absent rights or missing evidence blocks release.

## State machine
DISCOVERED -> VERIFIED -> BRIEFED -> DRAFTED -> RENDERED -> REVIEW_PENDING -> APPROVED -> EXPORT_READY. HOLD and REJECTED available from every pre-approval state. PUBLISHED intentionally unavailable in RC1. Every transition emits a receipt and is idempotent.

## Security and cost
No provider credential in browser or Git. No social API writes. No approval inferred from agent output. Review approval binds exact asset hash and channel. Any change invalidates approval. Provider cost measured from actual token counts and a versioned rate table, estimates labeled separately. Hard run budget with fail-closed behavior.

## Delivery sequence
D1–2 inventory and governance; D3–5 evidence adapter and schema; D6–9 PDF/PNG renderers; D10–12 review receipts and cost accounting; D13–14 QA and draft PR acceptance.

## Acceptance tests
Unsupported claim fails; absent license fails; changed asset hash invalidates approval; missing approval denies release; duplicate event idempotent; cost cap aborts; export dimensions verified; PDF pages readable; model usage receipts have no invented tokens; all samples remain unpublished.

## First editorial fixture
Topic: practical agent-security repositories. Repository descriptions and links must be freshly verified. No assertion that a repo is secure without testing. The thesis must distinguish prompt injection, tool authorization, secret handling, sandboxing and observability. Prefer fewer verified examples over padded lists.

## Non-goals
No autonomous posting, no scraping behind authentication, no new parallel customer database, no synthetic founder portrait, no paid deployment or release.
