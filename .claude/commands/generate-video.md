---
name: generate-video
description: Generate short-form / cinematic video from a still or a text prompt via the Multimodal Studio (Higgsfield MCP) — Kling, Hailuo, Veo, Sora-class, DoP.
---

# 🎥 /generate-video — Video Generation

**Turn a still or a prompt into motion. Image→video first (cheaper, keeps your composition); text→video for hero scenes.**

Activates the `multimodal-studio` skill and the **Multimodal Director**. Read the skill's `resources/model-matrix.md` for routing and the async lifecycle.

## Step 0 — Connector check
Confirm higgsfield tools are available. If not:
```bash
claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp
```

## Step 1 — Source & intent
- **Source:** existing still (preferred — image→video) or text-only (text→video)
- **Placement & ratio:** Reels/Shorts/TikTok → 9:16; YouTube/landing → 16:9
- **Length:** default short (≤10s); state the target
- **Character?:** reference an existing character ID for consistency

## Step 2 — Route the model
- Image→video, cinematic motion/physics → **Kling**
- Image→video, expressive character action → **Hailuo**
- Text→video, complex scene → **Veo / Sora-class**
- Fast still→motion (~5s) → **DoP**
State the choice in one line.

## Step 3 — Craft the motion prompt
Describe **camera move + subject motion + pacing** explicitly — models default to near-static otherwise. Include lighting and mood. Example:
> "Slow push-in on the subject, hair drifting in a gentle breeze, volumetric backlight, cinematic teal-and-amber grade, 24fps filmic motion, 9:16."

## Step 4 — Generate (async)
Submit, capture the job ID, poll `get_generation_status`. Video takes longer than stills — poll, don't assume. Download to the canonical asset path. Inspect for motion artifacts; regenerate once if needed.

## Step 5 — Deliver
- Provide the clip + a poster frame (still export).
- Note model, prompt, seed/job ID.
- Offer to score it with `/create-music`.

## Usage
```text
/generate-video animate this hero still into a 5s cinematic loop, 16:9
/generate-video 9:16 teaser: neon city flythrough, fast cuts, 8s
/generate-video lesson intro featuring character <id>, slow push-in, warm light
```
