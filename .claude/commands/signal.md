# /signal — LinkedIn Authority Engine

Route a LinkedIn task through the **Signal** pack (`skills/signal/SKILL.md`), the LinkedIn vertical of ACOS. Signal runs the [Excellence Loop](../../docs/architecture/EXCELLENCE_LOOP.md), drafts everything, and **never auto-posts** — a human ships.

## Usage

```
/signal <mode> [brand=personal|company] [source=<url>] [topic=<text>]
```

If no `mode` is given, route by intent: a pasted URL → `repurpose`; "plan my week" → `plan`; a raw idea → `draft`.

## Modes

| Mode | Does |
|---|---|
| `plan` | A week of ranked angles mapped to the persona's pillars. Reads the voice corpus + recent winners. |
| `draft` | One idea/source → a LinkedIn draft in the chosen brand voice, staged (not posted). |
| `repurpose` | Fetch a great external post/clip → a **credited** reframe in-voice. |
| `critique` | `integrity-guard` (brand/claim/schema) + hook/format check → PASS / warn / FAIL. Gates `ship`. |
| `ship` | Export a passed draft to a Typefully/LinkedIn **draft** via official API. **A human posts.** |
| `learn` | Supplied post analytics → graded outcome written to the store → tunes next `plan`. |

## Rules (fail-closed)

1. **Never auto-post.** No mode calls a posting endpoint. `ship` produces a draft a human confirms. (Root `CLAUDE.md` human-gate + LinkedIn ToS.)
2. **`ship` refuses an un-critiqued draft.** Critique gates the publish boundary.
3. **`repurpose` always credits the source**, on its own line.
4. **No fabricated metrics.** `learn` writes only real, human-supplied analytics. No "top voice"/follower claims unless verified (Metrics-Truth).

## First run

Fill the `<placeholder>` fields in `skills/signal/personas.md` (both brands) and seed your Dream100 in `skills/signal/knowledge.md` §3. Until the state spine + Typefully wiring land (see `docs/architecture/L99_BLUEPRINT.md` §8), `draft`/`critique`/`repurpose` work fully; `ship`/`learn` produce the staged output and say plainly what isn't wired yet.

## Related

- General loop commands: `/ideate` · `/craft` · `/plan-review` · `/factory` · `/critique` · `/verify` · `/publish`
- `frankx-brand`, `integrity-guard` (voice + claim gate), `canvas-design` (carousels)
