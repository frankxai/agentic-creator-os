# Runnable orchestration reference kit

Candidate 1.0.0. Requires Node 22+ for this optional kit; ACOS's existing runtime
requirements are unchanged. No installation, account or API key is needed for
the fixture demo.

```sh
node --test tools/orchestration/orchestration.test.mjs
node tools/orchestration/demo.mjs
```

The demo runs two fixture workers followed by synthesis, serially. It makes zero
model calls and does not establish provider quality. The tests cover all five
patterns, capability failures, explicit fallback, ownership conflicts, independent
verification, bounded refinement, cancellation, timeout and checkpoint resume.

The original implementation is maintained by
[Starlight Swarm](https://github.com/frankxai/starlight-swarm/tree/codex/orchestration-quality-20260924/src/swarm/orchestration).
`provenance.json` pins an immutable source commit and file hashes. MIT attribution
is retained in this directory; the rest of ACOS retains its existing license.
Change the source and re-project reviewed bytes, rather than maintaining a fork.

## Connect your own harness

Import `selectModel` from `router.mjs` and `runPlan` from `runtime.mjs`.
Supply a fresh, successful capability probe, machine admission, an execution
adapter and an artifact verifier. Model names in `presets.json` are hypotheses;
they do not enable accounts or change your defaults. Preserve explicit model
choices. Fallback is opt-in. Do not auto-enable ultra or recursive delegation.

Each task declares objective, repository, input references, owned paths, expected
artifact, stop condition and verification. The adapter enforces actual tool and
filesystem permissions; this library is not a sandbox. It must stop its owned
work on AbortSignal. A timeout prevents new scheduling but cannot prove that a
remote job stopped. Consequential results require an independent provider review.

The host persists checkpoints and receipts privately, verifies artifact bytes,
and redacts publication outputs. Do not trust model-authored claims as test proof.
Use the ten-fixture, 60-run pilot in `frankxai/starlight-evals` before changing
defaults. No benchmark winners or real provider results ship with this kit yet.

## Choose the pattern

| Work | Pattern |
|---|---|
| Small or tightly coupled change | Single owner |
| Dependent stages | Sequential |
| Independent evidence gathering | Parallel workers |
| Bounded workers plus synthesis | Manager |
| Checkable defect with one correction attempt | Refinement |

One coordinator owns integration. Company leaders set priorities, domain owners
set acceptance criteria, and workers own artifacts. Role names do not require
additional agents. Maximum quality comes first; cost and time break quality ties.

Release status: candidate; independent review, live evaluation and publication
approval remain required. Removing this optional directory and its package
scripts restores the previous interface without changing installed model defaults.
