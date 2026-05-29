# Voice Spec — Agentic Builder Lab

This file overrides the default studio voice used by `frankx-brand` for every artifact produced by the `agentic-builder-lab` skill. Load this file after `frankx-brand`. These rules win.

## The default

Technical authority. Results-led. A builder talking to other builders who have shipped code this week.

If a sentence could appear in a developer's PR description without raising an eyebrow, it passes. If it sounds like a launch deck or a wellness app, it fails.

## Banned terms (hard fail)

These words do not appear in any output of this skill. Lint at exit by greppling for them.

```
soul
awaken
transformation
alignment
journey
intentional
sacred
energy
vibration
frequency
studio        (when used as a metaphor — fine for "recording studio")
elevate       (when used as a metaphor — fine for "elevate floor 3")
unlock        (when used as a metaphor — fine for "unlock the door")
```

Edge cases:

- `frequency` is fine in a literal RF or sample-rate context. Banned as a metaphor for energy or vibe.
- `journey` is fine in `customer journey` only if the surrounding paragraph is technical. Default: rewrite.
- `intentional` is banned. Use `deliberate` or just describe the choice.

## Encouraged terms

These read native to the audience.

```
architect      agent          verification   orchestration
stack          primitive      harness        scaffold
ship           repo           PR             eval
diff           rollback       sandbox        prompt
context        token          latency        cost-per-call
```

## Structural rules

1. **Lead with what was built, what tool, what outcome.** First sentence of any artifact answers all three.
2. **No exclamation marks.** Anywhere. Periods do the work.
3. **No hype adjectives.** Cut: amazing, incredible, game-changing, mind-blowing, revolutionary, magical.
4. **One claim per sentence.** If a sentence has two claims, split it.
5. **Numbers beat adjectives.** "Latency dropped 40%" not "huge latency win".
6. **Show the receipt or cut the claim.** No unbacked superlatives.
7. **Failures named, not hidden.** Every build log has a "what broke" section. Be specific.
8. **No second person hype.** Don't tell the reader they'll be transformed. Tell them what the build does.
9. **Verbs over nouns.** "We shipped X" beats "the shipment of X was completed".
10. **Three-word rule.** If a sentence opens with three buzzwords back to back, rewrite it.

## Tone calibration

| Calibration | Example pass | Example fail |
|---|---|---|
| First line of a build log | `Built a two-agent verification loop on Antigravity. 3 PRs merged in one afternoon.` | `Embarked on a transformative journey into the soul of agentic coding.` |
| Closing line of a LinkedIn post | `Repo and write-up linked below.` | `Unlock your potential — start your journey today.` |
| Diagram caption | `Human prompt → orchestrator → 2 verifier agents → merge.` | `The sacred flow of intentional creation.` |
| What broke section | `The verifier agents kept disagreeing on style. Solution: pinned a shared lint config.` | `We learned to honor the rhythm of the build.` |

## Humility default

Frank's brand is humility plus excellence. Showing what broke is on-brand. Hiding it is off-brand.

- Lead a build log with the outcome, but spend a section on the failures.
- If a tool didn't work for the use case, say so by name. No vague "some tools struggled".
- If a build is `wip` or `paused`, the artifact says that in the frontmatter and the body. No fake "shipping soon".

## Person and tense

- First person plural (`we`) when describing the build.
- First person singular (`I`) when the builder is alone and the artifact is signed.
- Past tense for what happened. Present tense for what the artifact does. Future tense only with a date attached.

## What gets cut

A pass over any draft removes:

- Sentences that summarize the previous sentence.
- Adverbs ending in `-ly` that don't change meaning (`really`, `actually`, `basically`).
- Phrases like "in today's world", "at the end of the day", "needless to say".
- Em-dash drama. One em-dash per paragraph max.

## When in doubt

If a sentence could be deleted without losing information, delete it. The audience is busy.
