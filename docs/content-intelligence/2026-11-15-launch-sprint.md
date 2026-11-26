# 48-hour editorial launch — five source-backed packages (draft only)

Date: 2026-11-15. Owner: FrankX / Starlight. Existing RC1: #153. Product release remains HOLD.

## Verified design references
- FrankX Canva social master 1080x1350: DAHXSjJ1vz4 (3 pages).
- Starlight Canva campaign carousel 1080x1350: DAHXS28Fa5U (9 pages).
These are design references, not authorization to overwrite or claims of exact token fidelity. Figma canonical character folios remain to be inspected before character imagery.

## Editorial queue
| ID | Brand | Hook | Primary evidence | CTA | State |
|---|---|---|---|---|---|
| CI-01 | FrankX | Before an agent sends its first email, decide who can approve the send. | https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ | AGENT | REVIEW_REQUIRED |
| CI-02 | Starlight | The approval log should show who could act, what they approved and what happened. | https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ | AGENT | REVIEW_REQUIRED |
| CI-03 | FrankX | A workflow that reads issues can run with a read-only GitHub token. | https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication | AGENT | REVIEW_REQUIRED |
| CI-04 | Starlight | An agent reading a document needs a boundary between its source and its instructions. | https://genai.owasp.org/llmrisk/llm01-prompt-injection/ | AGENT | REVIEW_REQUIRED |
| CI-05 | FrankX | Before the first release, list every action the agent can take without you. | https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ | AGENT | REVIEW_REQUIRED |

These sources support the themes, not any claim that the Starlight implementation has been security certified.

## ManyChat AGENT funnel (specification; not connected)
1. Instagram professional account and eligible ManyChat channel connection must be verified by owner.
2. Trigger: comment containing standalone keyword AGENT on selected approved post; provider-native deduplication and platform limits apply.
3. Send one permitted DM with a link to a hosted, free Agent Security Checklist; do not imply a DM was sent until delivery is confirmed.
4. On landing page, offer optional consented email subscription with explicit purpose and unsubscribe; no gating of free resource behind forced consent.
5. Store event identifiers and consent evidence in existing GenCreator customer state or approved CRM; avoid parallel shadow databases.
6. Capture anonymous attribution: post_id, campaign, channel, keyword, delivered, click, opt-in, download, qualified lead; retention and privacy review required.
7. Stop automation on unsubscribe, disconnect, provider error or permission revocation; never message outside provider-approved interaction windows.

## Approval queue
DISCOVERED -> EVIDENCE_REVIEW -> COPY_REVIEW -> DESIGN_REVIEW -> APPROVAL_PENDING -> APPROVED_FOR_EXPORT -> MANUAL_PUBLISH_READY.
No autonomous publish transition. Approval bound to brand, channel, content SHA, asset SHA, reviewer, time and expiry. Any edit invalidates approval.

## Acceptance / blockers
Five independently sourced packages, PNG derivatives, PDF carousel previews, free checklist, per-asset manifest and review ledger; QA for legibility and claims. Live ManyChat OAuth, Instagram publishing, website lead capture and actual provider usage receipts are NOT verified and remain blocked. No posts published.
