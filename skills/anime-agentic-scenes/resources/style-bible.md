# Style bible — The Orchestrator (Season 1)

Working title: **The Orchestrator**. A shonen about builders who run agent systems, set in the City of Light, a vertical city where every district is a running process.

## Consistency block (prepend to every prompt)

```
Anime cinematic keyframe, original series "The Orchestrator". Clean 2D-anime rendering with painterly backgrounds, hard cel shading on characters, soft volumetric light in environments. Palette: deep navy (#0B1220) and near-black backgrounds, electric cyan (#22D3EE) for system light, warm amber (#F59E0B) for human-side light and cost meters, crimson (#DC2626) reserved for failure states only. Restrained line weight, no chromatic aberration, no lens flare spam. Wide cinematic framing, 2.39:1 letterbox feel inside the chosen aspect. No text, no logos, no watermarks.
```

## Negative block (append to every prompt)

```
Negative: text, captions, subtitles, logos, watermark, extra fingers, deformed hands, duplicate characters, photoreal skin, 3D render look, glossy plastic, neon overload, chibi, sketch lines, blurry, low detail, existing franchise characters.
```

## Cast sheet

Cast designs live in `character-forge.md` and are the authority. Summary for prompt use:

| Cast | Silhouette | Signature assets | Dominant / accent |
|---|---|---|---|
| **Ren, the Operator** | Tall vertical rectangle: sleeveless floor-length split duster, high collar, crown of nine obsidian shards orbiting at brow height on a tilted plane | The Crown of Shards (context) and the Filament Scarf (stamina, dims from the tip up; one amber thread never dims) | Charcoal / cyan |
| **Mira, the Conductor** | Triangle: a rigid bone-white Sail Collar rising on the right side above her head, asymmetric mantle long on the left | The Sail (task graph drawn on its inner face) and the Fork Baton (cyan core between the tines, dims per summon) | Bone white / cyan |
| **Scout** | Small circle, crouched | Goggle-lantern, folded map cloak | Moss green / pale cyan |
| **Coder** | Sharp square, long-limbed | Twin glyph bracers | Deep cyan / white |
| **Reviewer** | Heavy circle, planted | Defect lantern, back ledger | Amber / charcoal |
| **Tester** | Narrow triangle, fast | Quiver of dummy pins | Chalk white / crimson thread |
| **The Queen** | Wide triangle, tallest | Crown of light that fills with her ring | Gold / navy |
| **The Traitor** | Mirrors its host | A sigil that never settles | Host base / flickering accent |
| **The Founder** | A hand and a warm amber sleeve | The Stamp | Amber / none |

Consistency rule: cast members are always drawn from the forge. If a render drifts (wrong asset, wrong dominant, generic silhouette), it is discarded, not "fixed in the next shot." A cast member is locked only when all six presentation artifacts in the forge exist.

## World sheet

| Place | Look |
|---|---|
| **The City of Light** | Vertical megacity at night, districts stacked on floating plates, each plate a different hue of cyan. Rain-slick. Always seen from above or from a cliff edge. |
| **The Workshop** | Cliffside studio, one wall open to the city. Wooden floor with the Seal inlaid in the centre. Tools float in the air at rest. |
| **The Vault** | Below the Workshop. Spiral stair into black stone. Tablets set into the walls, most dark, a few lit. |
| **The Rim** | Ring road at the city's edge lined with standing-stone Gates. Each arch shows glyphs on its face and a different city through it. |
| **The Bridge** | Open floating deck above the Workshop, no railings, the task graph drawn in light in the air above it. The Stamp sits on a plinth at the far end, under warm amber light. |
| **The Field** | Any district where Squadmates work. Drawn from the Bridge's height so formations read. |
| **The Council Hall** | Round hall, seven seats, a crowned leader's seat, a stone log table in the centre. |
| **The Dojo** | Training hall with lamp oil meters on the walls and target dummies that light green or red. |

## Camera language

| Beat | Default camera |
|---|---|
| Establish | Wide, high angle, slow push-in |
| Trigger | Medium, eye level, fast cut-in |
| Mechanism | Close on the grammar element (ring, seal, gate, baton), shallow focus |
| Cost | Insert on the meter or the drain, then rack focus to the character's face |
| Resolution | Wide again, lower angle than Establish, still |

Motion prompts (video): one camera move, one subject motion, one pace word. Never three moves.

## Typography and titles (composited after render, never in prompt)

Episode titles set in the ACOS display face, sentence case, bottom-left, 4 percent margin, cyan on navy. Mechanism sentence appears as a single line at the cut point, amber on black.

## Music note

Each episode's cut gets a custom lo-fi or cinematic bed via `/create-music` (Suno). Tempo: 72 to 84 BPM for teaching cuts, 120+ for cold opens. This series shares its sonic register with the FrankX lo-fi catalogue.

## Model routing (via multimodal-studio)

- Keyframes: stylized lane (Flux / Seedream class). Soul only for the Founder's hand, which needs skin realism against the cel world.
- Motion: image-to-video from the approved keyframe (Kling class), 5 seconds, one move.
- Cast: `create_character` per named cast member, once. Reuse across episodes.
