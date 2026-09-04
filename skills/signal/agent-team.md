# Signal — The Agent Team

The multi-agent org behind `/linkedin`. One lead, a small bench of workers, one independent critic at the publish boundary. This is the [blueprint's](../../docs/architecture/L99_BLUEPRINT.md) six-lead topology, instantiated for the Growth/LinkedIn domain.

Design rule (from the blueprint): **default to one capable agent on a linear pipeline; fan out only where it genuinely pays.** No nine-platform-writer explosion.

```
                         /linkedin  (router)
                              │
                    ┌─────────▼──────────┐
                    │   LINKEDIN LEAD     │  owns the day, picks the flow
                    └─────────┬──────────┘
        ┌──────────┬──────────┼──────────┬───────────┐
        ▼          ▼          ▼          ▼           ▼
   Researcher   Ideator    Drafter   Designer    Engagement
   (sweep +     (angles    (post in  (carousel/  (Dream100
    vet)         from       voice)    infographic) comments)
                 signal)
        └──────────┴────►  ⛔ CRITIC (independent voice/claim/hook gate)
                                        │
                                        ▼
                              stage → you post → Learner (writes outcome)
```

| Agent | Single responsibility | Fans out? |
|---|---|---|
| **Lead** | Reads the ask, picks the flow (plan / draft / repurpose / carousel / engage / learn), sequences the workers | no |
| **Researcher** | Sweep the source lanes (`research-sources.md`), vet against the 3-point bar, return ranked raw material | yes — one thread per lane when doing a full sweep |
| **Ideator** | Turn vetted material + recall into 5 ranked angles mapped to pillars | no |
| **Drafter** | One angle → one post in the chosen persona voice, format-disciplined | no (one strong draft beats fragments) |
| **Designer** | Post → carousel slides or infographic via multimodal + `canvas-design`, brand-locked | yes — parallel slide/variant generation |
| **Engagement** | Dream100 newest posts → substantive comment drafts (human posts) | yes — one per Dream100 target |
| **Critic** | Independent gate: voice, claim-honesty, hook. PASS/warn/FAIL. Blocks `ship`. | no — independence is the point |
| **Learner** | Real metrics → graded outcome to the store → tunes next `plan` | no |

**Where the swarm actually pays:** the Researcher (many lanes at once), the Designer (many slide variants), and the Engagement drafter (many Dream100 targets). Everything else is a single strong agent on a line — faster *and* better than fragmenting.

**The one non-negotiable:** the Critic is independent (no shared context with the Drafter) and gates the publish boundary. Nothing ships without a PASS. Reputation is the fail-closed surface here, the way funds are in the payments vertical.
