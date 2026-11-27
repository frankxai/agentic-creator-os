# Content Intelligence RC1 (draft-only)

Run locally: `node --test tools/content-intelligence/*.test.mjs`.

`validate.mjs` implements evidence packet validation, approval verification and token-based cost estimates. `render.mjs` produces deterministic 1080×1350 SVG slides for LinkedIn/Instagram from validated structured copy. SVG is an intermediate format; PDF, PNG and MP4 exports are **not yet implemented**.

No publish API exists in this module. All output is for operator review only.

## First editorial direction
**Headline:** Security is not a prompt.

**Thesis:** Agent security depends on tool authorization, secret isolation, sandbox boundaries and observable execution, not only instructions to the model.

**Evidence:** Use current OWASP LLM guidance and verified repository documentation. Do not call a repository secure without an independent evaluation.

**Slide sequence:** (1) Security is not a prompt; (2) The actual trust boundary; (3) Tool permissions; (4) Secret isolation; (5) Sandboxing; (6) Logs and approvals; (7) What to evaluate before deploying.

This is a creative brief, not an assertion that external research has been completed. Each material claim requires a cited source and independent review before distribution.

## Remaining gates
Reconcile actual GenCreator schema and brand tokens; build a source retrieval adapter and claim-level citation ledger; generate approved PDF/PNG exports; add independent visual review; record real provider usage; test locally and in CI; obtain human approval. Autonomous publishing remains disabled.
