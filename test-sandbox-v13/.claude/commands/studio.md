---
name: studio
description: End-to-end multimodal production — turn a brief into a coherent set of images, video, and consistent characters via the Multimodal Studio (Higgsfield MCP).
---

# /studio — Multimodal Production Pipeline

**One brief in, a finished brand-locked asset set out. Images + video + consistent characters across 30+ models.**

```text
╔══════════════════════════════════════════════════════════════════════╗
║                      MULTIMODAL STUDIO PIPELINE                        ║
║         "One connector. Stills, motion, and a character that stays."   ║
╠══════════════════════════════════════════════════════════════════════╣
║  BRIEF  →  ROUTE  →  CRAFT  →  GENERATE (async, parallel)  →  ASSEMBLE  ║
╚══════════════════════════════════════════════════════════════════════╝
```

This command activates the `multimodal-studio` skill and the **Multimodal Director** agent. Read the skill before generating; it holds the model matrix, prompt structure, and async lifecycle.

## Step 0 — Connector check

Confirm the higgsfield MCP tools are available (`generate_image`, `generate_video`, `create_character`, `list_characters`, `get_generation_status`). If they're missing, stop and tell the operator:
```bash
claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp
```
Never fabricate an image or a URL.

## Step 1 — BRIEF

Gather (infer from project context; ask only for gaps):
- **Goal & placement** — blog hero / OG card / IG reel / YouTube thumbnail / campaign set
- **Aspect ratio** — derive from placement (see skill matrix); don't ask for pixels
- **Style** — photoreal / 3D / illustration / minimalist / cinematic; inherit brand tokens if a brand skill is active
- **Character?** — recurring subject that must stay consistent across assets
- **Modality** — stills, video, or both

## Step 2 — ROUTE

Pick models deliberately and state the choice in one line each:
- Photoreal people/products → **Soul** (4K)
- Stylized / illustration / in-image text → **Flux / Seedream**
- Motion from a still → **image→video** (Kling / Hailuo / DoP)
- Text→video, complex scenes → **Veo / Sora-class**

## Step 3 — CRAFT

Build each prompt as **Subject + Action + Setting + Composition + Lighting + Style + Technical**. For video, describe camera move + subject motion + pacing explicitly. Inject brand palette/mood.

## Step 4 — GENERATE (async + parallel)

- For a recurring subject: `create_character` once → reuse its ID in every call.
- Submit independent assets in parallel, capture job IDs, poll `get_generation_status`.
- Download finished assets to the project's canonical asset path.
- On policy/failure: report, adjust, retry once.

## Step 5 — ASSEMBLE

- Verify the set reads as one campaign (same character ID, palette, lighting).
- Produce derivatives (hero → OG 1200×630, square 1080×1080, vertical 1080×1920).
- Run the AI-slop checklist; regenerate anything that fails.
- Log model + prompt + seed/job ID per keeper.

## Usage

```text
/studio hero image + 3 social cards + 5s teaser for the "Agentic Creator OS" launch post
/studio a consistent course-instructor character, then 4 lesson thumbnails featuring her
/studio animate this product still into a 5s cinematic loop
```

## Related

- `/generate-video` — video-first entry point
- `/generate-images` — single-image / article-asset flow
- `/infogenius` — research-grounded image prompts
- `/create-music` — score the videos this produces
