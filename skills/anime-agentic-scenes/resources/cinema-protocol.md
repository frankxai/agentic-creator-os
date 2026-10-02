# Cinema protocol — the pre-production gate

Nothing in this series is rendered until the six locks below are closed. The first proof render (ep01, gpt lane, one candidate, no cast lock, no critique) is the reference for what this protocol exists to prevent: competent, generic, forgettable. Premium is a process property, not a prompt property.

The protocol is the film pipeline compressed: **intent → image system → cast lock → location lock → lane bake-off → candidate loop → critique gate → motion → post**. Each lock produces an artifact that the next lock consumes. Skipping a lock voids the scene.

---

## Lock 1 — Director's intent (before any image)

Three lines, written and committed before anything else:

| Line | Question | ep01 example |
|---|---|---|
| **Emotion** | What must the viewer feel in the first 2 seconds? | Solitude with agency. One person, a whole city, no fear. |
| **Thesis** | What is the one idea this scene proves? | An agent starts empty and earns context one call at a time. |
| **Image** | What is the single frame you would put on the poster? | Ren from behind, small, the empty Ring above, the city vast and dark below. |

If the Image line does not already contain the mechanism cue, the scene is decoration.

Then the **pre-viz**: five thumbnail sketches in words, one per beat, each naming: frame edge (what touches the border), eye entry point, eye exit point, dominant value (dark / mid / light), and the one thing in motion. Pre-viz is the shot list a cinematographer could light from.

## Lock 2 — Image system (per season, then per episode)

The style bible gives palette and cast. The image system gives the **rules of the camera** and the **arc of colour**. It is written once per season and adjusted per episode.

### Lens set
The series shoots on two virtual lenses. No others.

| Lens | Use | Prompt phrase |
|---|---|---|
| **24mm** | Establish, Resolution, any room | `wide 24mm anamorphic feel, deep focus, slight barrel, vertical lines held straight` |
| **85mm** | Trigger, Mechanism, Cost, any face or hand | `85mm portrait compression, shallow depth of field, background falls to soft bokeh` |

### Value structure
Every frame is designed in three values before colour: 60 percent dark, 30 percent mid, 10 percent light. The 10 percent is where the eye goes and it is always the grammar element (Ring, Seal, Gate, baton, Stamp). A frame that fails this on a black-and-white squint is re-lit, not re-prompted.

### Colour script
An arc across the five beats, not a static palette:

| Beat | Dominant | Accent | Temperature |
|---|---|---|---|
| Establish | Navy | Cyan, small | Cold |
| Trigger | Navy | Cyan, larger | Cold |
| Mechanism | Near-black | Cyan, dominant | Cold, one amber point |
| Cost | Near-black | Amber, rising | Warming |
| Resolution | Navy, lifted | Amber and cyan balanced | Neutral |

Crimson enters only in ep06 (Seal) and ep08 (Traitor), and only in the Mechanism beat. Anywhere else it is a defect.

### Atmosphere and texture
Rain or mist in every exterior. Volumetric light through it. Fine film grain, halation on the brightest cyan only, letterbox 2.39:1 composited in post inside the 16:9 frame. No chromatic aberration, no bloom on everything, no god rays unless the Founder's Stamp is in frame.

### Anime render discipline
Characters: hard cel shading, two-tone shadow, clean line, no gradient skin. Backgrounds: painterly, soft edges, atmospheric perspective. The contrast between crisp character and painted world is the look. A render where the character is painterly or the background is cel-flat is off-model.

## Lock 3 — Cast lock (Higgsfield character-sheet workflow, anime-2d preset)

Before any scene keyframe, every named cast member gets:

1. **Turnaround sheet** — front, three-quarter, profile, back. Composition preset `turnaround`, style preset `anime-2d`, 16:9, `nano_banana_pro` at 2k. Prompt built slot by slot from the style bible's cast sheet: identity, face, eyes, hair, wardrobe head to toe, then the anime-2d render module and quality tail, then the negative tail with `single subject only`.
2. **Expression sheet** — neutral, resolve, strain, relief. Same model, same slots.
3. **Save as reference Element** — `show_reference_elements` `create` from the approved turnaround. Elements, not Soul: Soul is single-person photoreal only; scenes here have multiple cast and a cel look. The Element ID is written into `keyframes.yaml` under `cast_ids` and referenced in every scene prompt via `medias` with the `image_references` role.
4. **Drift test** — three throwaway frames of the cast member in three rooms. If face, coat, or hair drift, the sheet is re-cut before any scene is shot.

Ren and Mira are locked in Season 1 episode 1 pre-production. Squadmate base, Queen, Traitor lock before ep04. The Founder's hand locks before ep06.

## Lock 4 — Location lock

Each of the eight rooms gets a **plate**: an empty environment keyframe, 24mm, no characters, at the room's canonical time of day. Model: `nano_banana_pro` 2k or `soul_location`. The approved plate is saved as an Element and referenced in every scene set in that room. A room whose plate has not been approved cannot host a scene.

Plates are also the Establish beat's starting point: the Establish frame is the plate plus the cast, not a fresh composition.

## Lock 5 — Lane bake-off (once per season, measured)

Do not assume a model. Run one **control shot** (ep01 Establish, fixed prompt, cast Element attached) across the candidate lanes and score with the rubric below:

| Lane | Model | Setting |
|---|---|---|
| A | `nano_banana_pro` | 2k |
| B | `cinematic_studio_2_5` | 2k |
| C | `gpt_image_2_5` | default |
| D | `soul_cinematic` | 2k (concept-art strength, no soul_id) |

The winning lane is locked for stills for the season. A second lane may be locked for a specific beat type (for example, 85mm close-ups) if it wins that beat decisively. Record the bake-off scores in `keyframes.yaml` under `bakeoff`.

Video lane: `seedance_2_0`, `std` mode, 1080p for review and 4k for the final, `generate_audio: false` (music and sound come from post), `genre: drama` for teaching beats and `epic` for cold opens, `start_image` = the gated still, `image_references` = cast Element. One camera move. 5 seconds. Video is never generated from an ungated still.

## Lock 6 — Candidate loop and critique gate

### The loop
1. **Four candidates minimum** per beat, submitted as one batch: two prompt variants (composition A and B from pre-viz) × two of (seed, lane). Never one render.
2. **Score** every candidate on the rubric. Three lenses score independently, then reconcile:
   - **Cinematographer** — composition, light, depth, lens discipline
   - **Art director** — cast fidelity, render discipline, colour script, taste
   - **Systems engineer** — does the mechanism read without text, is the cost visible, would an engineer sign it
3. **Select** the top candidate only if it clears the gate. If nothing clears, rewrite the pre-viz, not just the prompt.
4. **Refine** once: the winner goes back in as `image_references` with surgical notes (one or two changes named exactly). Never a full re-roll.
5. **Upscale** the approved frame to 4k for the final. Review happens at 2k.

### The rubric (score 0 to 3 each, gate is 24 of 30 with no axis at 0)

| Axis | 3 means |
|---|---|
| Composition | Eye enters, travels, and lands on the grammar element; frame edges are intentional |
| Staging | Silhouettes read at thumbnail size; nothing tangent to a frame edge |
| Light | Motivated key, rim separation on the cast, value structure 60/30/10 holds under squint |
| Colour | Matches the colour script for this beat; one accent; no stray hue |
| Depth | Three planes with atmosphere between them |
| Render discipline | Crisp cel cast against painterly world; no photoreal or 3D drift |
| Cast fidelity | Matches the locked sheet; a stranger would recognise Ren from the previous frame |
| Mechanism legibility | The concept is readable with the sound off and no titles |
| Cost cue | The spend is visible: meter, ring capacity, dim baton, oil |
| Clean | No text, no extra limbs, no duplicate cast, no watermark |

A 2 on Mechanism legibility or Cast fidelity is a soft fail: the frame may pass the gate numerically but is flagged for the refine pass.

### Critique format
One line per axis, score first, then the fix. No praise paragraphs. Example:

```
Composition 2 — Ren dead centre; move to lower-left third so the Ring reads against the open wall.
Light 1 — no rim on the coat; add cyan rim from the city, drop the lamp key a stop.
Mechanism 3.
Cost 0 — belt meter not visible. Fail. Re-stage with the belt in the lit third.
```

## Lock 7 — Motion doctrine

- One camera move per shot. Push, pull, orbit, or hold. Never two.
- The subject motion is the beat's action and nothing else. Background life (rain, drifting shards) is allowed; extra gestures are not.
- 5 seconds. Cut on the moment the mechanism completes.
- Reduced motion cut for teaching contexts: the still with a slow push only.
- Reject any clip with morphing cast, popping geometry, or a second move the prompt did not ask for. Re-run from the same still with the move stated more plainly, once. Then stop and re-stage.

## Lock 8 — Post

- Letterbox 2.39:1, grain, halation on cyan peaks only.
- Episode title bottom-left, sentence case, 4 percent margin, composited, never generated.
- Mechanism sentence card at the cut point, amber on black, 2 seconds.
- Music via `/create-music`: 72 to 84 BPM teaching bed, 120 plus for cold opens; the series shares the FrankX lo-fi register.
- Sound signatures per grammar element, kept in a shared library: summon (rising glass tone), shard slot (soft click), ring fuse (low pressure), seal crack (dry snap), stamp (single deep thud), gate glyphs (ascending ticks).

## Budget ledger (per episode, credits)

| Stage | Credits, approximate |
|---|---|
| Cast lock (one member: turnaround + expression + drift test) | 6 to 10 |
| Location plate (one room, 2 candidates) | 4 |
| Bake-off (season only, 4 lanes × 1) | 8 |
| Keyframes (5 beats × 4 candidates + 1 refine + 1 upscale) | 30 to 45 |
| Motion (1 clip at 1080p review + 1 at 4k final) | 20 to 40 |
| **Episode total** | **60 to 100** |

At 3000 credits on the current plan, Season 1 fits with margin. The ledger is updated with actuals in `keyframes.yaml` after every episode.

## What changes in the workflow

The skill's workflow was `CONCEPT → GRAMMAR → BEATS → KEYFRAMES → RENDER → LAB → SHIP`. It is now:

```
CONCEPT → GRAMMAR → INTENT + PRE-VIZ → IMAGE SYSTEM → CAST LOCK → LOCATION LOCK
        → (season) LANE BAKE-OFF → CANDIDATES ×4 → CRITIQUE GATE → REFINE → UPSCALE
        → MOTION (gated stills only) → POST → LAB → SHIP
```

The lab and mechanism layers are unchanged. The film layer is where the quality was missing.
