# The Excellence Loop

_The canonical per-task loop every ACOS workflow runs. This is the engine — the thing that makes output good, and makes the system get better every week instead of staying flat._

> Status: **specification.** Steps 1–6 have real skills today; steps 7–8 (the closing) are the build. See `L99_BLUEPRINT.md` §2 and §8-Phase-0 for sequencing.

---

## The principle

Default to a single capable agent on a linear pipeline. Escalate to parallel fan-out **only** where it genuinely pays. Make the two irreversible things — **verification** and **publish** — structurally independent and measured.

Most creator tasks do not need a swarm. A swarm that fragments one draft across nine agents produces worse work than one strong drafter plus a format pass. Reach for fan-out when the sub-tasks are truly independent (four image variants, five sources to read in parallel) — not to look sophisticated.

---

## The eight steps

```
1 IDEATE → 2 CRAFT → 3 PLAN-REVIEW → 4 EXECUTE → 5 CRITIQUE →
6 VERIFY → 7 LEARN → 8 INTERCONNECT
                     ⛔ SUCCESS ORACLE grades the run true/false
```

| # | Step | What happens | Mechanism | Gate? |
|---|---|---|---|---|
| 1 | **Ideate** | Turn a vague ask into ranked, data-backed angles | Read the voice corpus (Notion) + a signal scan (Exa/Firecrawl) + recall of what won before (the store) | — |
| 2 | **Craft** | Turn the chosen angle into a structured prompt contract | `prompt-optimizer` / `craft-prompt`; declare `outputs` so the next step can parse, not guess | — |
| 3 | **Plan-review** | Sanity-check scope before any multi-step work | `/plan-review` (gstack CEO/Eng) | **Required** for multi-file/multi-step; skipped for one-shots |
| 4 | **Execute** | Do the work | Domain lead → single agent (default) or parallel Workers (justified exception) | — |
| 5 | **Critique** | Independently tear the output apart | `santa-method` — two reviewers, **no shared generation context**, worst-of-N verdict, loop-to-converge | **Enforced** at publish boundary |
| 6 | **Verify** | Prove it actually works / is on-brand | code: build→tsc→lint→test · content: `integrity-guard` (brand/claim/schema) | **Enforced**; exit status is captured |
| 7 | **Learn** | Write what happened, so next time is better | `stop-finalize` INSERTs the trajectory + graded outcome to the one store | — |
| 8 | **Interconnect** | Persist the artifact, attest it, wire it to the rest | Save to the state spine; stamp “Built on SIP”; register in `ATTESTATIONS.md` | — |

---

## The keystone: the Success Oracle

A run is graded **true / false** from exactly two signals:

1. **Verification exit status** (step 6) — did the build pass / did `integrity-guard` return PASS.
2. **A one-keystroke human verdict at Stop** — `good` / `wrong`.

That grade is what step 7 writes and step 1 recalls. Everything downstream — routing quality, voice improvement, which patterns get reinforced — is a function of this one signal.

**Build this before embeddings, vector search, or a second database.** An exact task-type match against a populated store beats cosine similarity against zero rows. Rewarding activity (`git push`, tokens spent) instead of outcome teaches the wrong lesson faster than it teaches nothing.

Until the store has real graded rows, **do not display a success metric.** A printed “X% avg success” over an empty table is a Metrics-Truth violation (see root `CLAUDE.md` / SIS `METRICS_TRUTH.md`).

---

## Why this closes the loop

Today the loop is open at both ends: nothing is measured (no oracle) and nothing persists (state lives in RAM). That is the single constraint capping the whole system — a premium creator OS's promise is _compounding_, and you cannot compound what you do not record.

Steps 6→7 fuse verification into learning: every critique verdict is written back as a labeled outcome, which is exactly the training signal the recall step (1) needs. Do that, and the OS stops being a fast stateless prompt-runner and starts being an instrument that sharpens on your voice, your standards, and your timing every week.
