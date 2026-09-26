# Handover — anime-agentic-scenes → production, into main

Target: `frankxai/agentic-creator-os`, PR #63 (`claude/anime-agentic-ai-scenes-e1sp3w` → `main`), currently draft.

## Precondition — read first

**Do not spend generation credits unless this session can actually view images** (Claude desktop, Cowork, or a harness with vision — not a text-only CLI session behind an egress-blocked proxy). Verify by fetching one existing render URL from `resources/keyframes.yaml` and confirming you can see it before doing anything else. If you cannot see it, stop generating and do documentation/code work only — that was the exact failure of the prior session: ~13 Higgsfield credits spent on renders nobody scored.

## What exists (all merged-ready as text/process, none visually verified)

- `skills/anime-agentic-scenes/SKILL.md` — entry point, references everything below in order
- `resources/visual-grammar.md` — agentic concept → body/gesture/room/cost mapping
- `resources/style-bible.md` — v1 look (superseded by STUDIO-BIBLE for world/palette)
- `resources/season-1.md` — 8-episode bible, mechanism sentences, labs
- `resources/cinema-protocol.md` — 8 pre-production locks, 30-point rubric
- `resources/character-forge.md` — 7 hard tests, cast redesigns (Ren, Mira, squad)
- `resources/STUDIO-BIBLE.md` — **authoritative**: world thesis (INK recommended), locked 6-token palette, signature devices, 12-stage pipeline
- `resources/keyframes.yaml` — every render job ID/URL, scores currently blank
- `resources/labs/*` — 6 runnable labs (Python + hook/eval configs)
- `.claude/commands/anime-scene.md`, `.claude/agents/anime-scene-director.md`

## Skills to load in the new session (in this order)

1. `anime-scene` (the installed skill/command for this pack)
2. `higgsfield-operator` — credit discipline, model routing
3. `visual-creation` — the council review pattern (Brand Guardian / Art Director / Storyteller lenses) to reuse for the critique gate
4. `character-forge` (repo-level skill, not the doc) if present, else follow `resources/character-forge.md` directly
5. `verification-quality` / `verification-loop` — before claiming any stage "done"

## Immediate next steps, in order

1. **Confirm vision.** Per precondition above.
2. **World call.** Get Frank's explicit yes/no on INK (`STUDIO-BIBLE.md` §1). Do not proceed to rendering without this — it's an open decision, not a default.
3. **Look test** (`STUDIO-BIBLE.md` stage 2): one empty district, ink-wash style, across 3-4 lanes (`nano_banana_pro`, `cinematic_studio_2_5`, `soul_cinematic`, confirm actual served model in the job metadata — `nano_banana_pro` was silently served as `nano_banana_2` last time, check every job). Score with eyes against the cinema-protocol rubric. Lock one lane. Record in `keyframes.yaml`.
4. **Character redesign as image-to-image**, not prose-to-image: 16-silhouette sheet → pick one → 6-10 refinement passes each referencing the prior output (`medias`/`image_references`), never restarting from a text block. Forge rubric gate: 18/21.
5. **Cast lock**: turnaround, expression sheet, callout sheet, key art, saved as a `show_reference_elements` Element. Record the Element ID.
6. **ep01 Establish beat**, 4 real candidates, 3-lens critique, cinema-protocol gate 24/30.
7. **Update PR #63**: fill in the blank scores in `keyframes.yaml`, mark the original ungated Sept-21 renders as `superseded`/`unverified`, push.
8. **Before requesting review**: run `node scripts/verify-public-surface.mjs`, `npm run build:all`, `npm run lint`, `npm run typecheck:all` locally — all four must pass (they did on the last push; re-verify after your changes). Mergeable state should read `clean`, not `unknown` — refresh against `main` if not.
9. **Mark ready for review** only once step 6 produces a gated ep01 keyframe with real scores, not before. Then it's Frank's merge call.

## Hard rules carried over

- Original series only — no franchise/studio resemblance in any prompt.
- One red in the palette (INK world), reserved for the human gate/failure/Traitor.
- No text baked into generated frames — titles are composited after.
- Every render needs a job ID + URL + score in `keyframes.yaml` or it didn't happen.
- Never mark a stage complete without the artifact the studio bible names for it (six presentation artifacts per locked character, receipts per pipeline stage).
