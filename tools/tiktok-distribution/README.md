# Starlight TikTok Distribution Agent — MVP

**Status:** review-first orchestration library; not connected to TikTok or deployed. No auto-posting, auto-comments, mass DMs, or fabricated engagement.

## Existing estate / placement
- This repository already packages creator agents, skills and platform adapters; use it as the reusable orchestration contract.
- `frankxai/gencreator.ai` is the existing creator-facing Next.js product. Integrate a review queue there in a subsequent PR, not a parallel dashboard.
- Cloudflare Workers + D1 + Queues are proposed production runtime, **not provisioned by this PR**. Persist accounts, drafts, approvals, publishing receipts and snapshots in D1 with tenant isolation and an append-only audit ledger.

## Workflow
1. Register account with verified ownership and OAuth scopes; only @arcanea.ai is provisionally enabled in the sample registry. Other handles remain unknown and disabled.
2. Ingest original post URL and verify media/audio reuse rights. Create differentiated drafts for creator, technology and production audiences.
3. Agent proposes captions, relevant replies and selective community shares; human reviews each external action. No engagement exchange, reciprocal automation, or unsolicited bulk outreach.
4. Human approves with identity and audit trail. Export platform-ready draft for **manual publishing**. Later, implement official TikTok Content Posting API only after developer approval, OAuth and API scope verification.
5. Record real publication URL as receipt. Import metrics from authorized analytics exports, preserving source, timestamp, attribution window and unavailable values.
6. Compare cohorts by watch time, completion, shares, profile visits and follower conversion; avoid optimizing raw likes alone.

## Security and cost
- No account passwords/cookies; OAuth tokens only in a secret store, never in GitHub/D1 plaintext.
- Account/tenant-scoped authorization, replay-safe idempotency keys, rate limits, explicit revocation, dead-letter handling, retention policy.
- Cloudflare deployment is gated until bindings, account ownership and approved API access are verified. No Workers AI spending in this MVP.

## Verification
`node --test tools/tiktok-distribution/distribution.test.mjs`

## Production acceptance gates
- Connected accounts verified and consent recorded
- Authenticated review UI and persistent state, including approval expiry
- Official API capabilities and scopes confirmed
- Metrics provenance and deduplication implemented
- CI tests and live smoke checks green
- One real post processed end-to-end with a human-approved receipt
