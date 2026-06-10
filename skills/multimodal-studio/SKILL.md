---
name: Multimodal Studio
description: Unified image, video, and character generation across 30+ frontier models through a single connector. Model routing, visual prompt engineering, character consistency, async job handling, and brand-locked output for production creative work.
version: 1.0.0
triggers:
  - generate image
  - generate video
  - create character
  - multimodal
  - higgsfield
  - image generation
  - video generation
  - b-roll
  - cinematic
  - thumbnail
  - hero image
  - character reference
  - visual asset
---

# Multimodal Studio

> One connector. Image + video + consistent characters. Thirty-plus models, vendor-agnostic, brand-locked.

## Purpose

Turn a creative brief into finished visual assets — images, videos, and reusable characters — without leaving the agent loop. Multimodal Studio is ACOS's unified generation layer: it routes each request to the right model, engineers the prompt, holds brand and character consistency across a whole asset set, and handles the async generation lifecycle end to end.

This is the capability that closes the gap with agent-first platforms like Google Antigravity — except ACOS stays **model-agnostic** (no lock-in to one vendor's image/video stack) and **brand-aware** (every asset inherits Frank DNA + project brand tokens).

## When to Use This Skill

- Generating a hero image, thumbnail, OG card, or social visual for a piece of content
- Producing short-form video, b-roll, or a cinematic clip from a still or a prompt
- Creating a **reusable character** that stays consistent across many images and videos
- Building a coordinated asset set (article header + 3 social cards + a 5s teaser) that must look like one campaign
- Any time a workflow says `~~image generation` or `~~video generation`

## The Connector (Higgsfield MCP — default)

ACOS's default multimodal connector is **Higgsfield MCP** — one OAuth connection exposes 30+ image and video models plus character training. Per `CONNECTORS.md`, this skill is tool-agnostic: any MCP that fills the `~~image generation` / `~~video generation` categories works. Higgsfield is the default because a single server covers all three modalities with consistent characters.

**Connect (Claude Code):**
```bash
claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp
# then authenticate via OAuth in your Higgsfield account — no API keys to manage
```

**Self-hosted alternative (stdio + API keys):** see `resources/model-matrix.md`.

**Tools exposed:** `generate_image`, `generate_video`, `create_character`, `list_characters`, `get_generation_status`.

**Verify before generating:** if the higgsfield tools are not available, do NOT silently fall back to describing images in text. Tell the operator the connector is missing and give them the one-line `claude mcp add` command above.

## The Workflow (BRIEF → ROUTE → CRAFT → GENERATE → ASSEMBLE)

### 1. BRIEF — lock intent before spending a generation
Capture (ask only for what's missing; infer the rest from project context):
- **Goal & placement** — where does this live? (blog hero, IG reel, YouTube thumbnail, OG card)
- **Aspect ratio & resolution** — derive from placement (see matrix); never ask if placement implies it
- **Style** — photoreal / 3D / illustration / minimalist / cinematic (inherit brand tokens if a brand skill is active)
- **Character?** — is there a recurring subject that must stay consistent across assets?
- **Modality** — still, video, or both (image → animate is the cheapest path to video)

### 2. ROUTE — pick the model deliberately (see `resources/model-matrix.md`)
Routing heuristics:
- **Photoreal stills, people, products** → Soul (4K, strong on faces/brand)
- **Stylized / illustration / typography-in-image** → Flux or Seedream
- **Cinematic motion from a still** → image-to-video (Kling / Hailuo / DoP)
- **Text-to-video, complex scenes** → Veo / Sora-class
- **Recurring subject across the set** → `create_character` once, then reference its ID in every call
Always state which model you chose and why in one line before generating.

### 3. CRAFT — engineer the prompt
Structure every visual prompt as: **Subject + Action + Setting + Composition + Lighting + Style + Technical.**
- Lead with the subject and the single most important visual idea.
- Specify camera/lens/lighting for photoreal ("85mm, soft key light, shallow depth of field").
- For video, describe **motion explicitly** (camera move + subject motion + pacing); models default to static otherwise.
- Inject brand tokens (palette, mood, typography rules) when a brand skill is loaded.
- Negative space and aspect ratio are part of the prompt, not an afterthought.

### 4. GENERATE — handle the async lifecycle
- Generation is **asynchronous**. Submit, capture the job ID, then poll `get_generation_status` — do not assume instant results. Images: seconds. Video: tens of seconds to minutes.
- Submit independent assets **in parallel** (multiple `generate_image` calls in one turn), then poll. This is the multi-asset speed advantage.
- On failure or content-policy rejection: report it plainly, adjust the prompt, retry once — don't loop silently.
- Save returned assets to the project's canonical asset path; never leave them only as URLs.

### 5. ASSEMBLE — deliver a coherent set
- Verify the set reads as one campaign (same character ID, palette, lighting language).
- Produce required derivatives (e.g. crop hero → OG 1200×630, square 1080×1080).
- Log what was generated (model, prompt, job ID) so it's reproducible and auditable.

## Character Consistency (the differentiator)

For any recurring subject (a brand mascot, a course instructor avatar, a series protagonist):
1. `create_character` once from a reference image or description → get a character ID.
2. Reference that ID in every subsequent `generate_image` / `generate_video` call.
3. `list_characters` to reuse across sessions and projects.
This is how you get a character that looks identical across an entire content series — the thing single-shot image tools cannot do.

## Quality Bar (Frank DNA)

- **Show, don't tell** — the asset is the proof; don't describe what you'll make, make it.
- **Premium by default** — highest sensible resolution, deliberate composition, no AI-slop tells (mangled hands, garbled text, plastic skin). Inspect output and regenerate if it has them.
- **Brand-locked** — if a brand skill is active, every asset obeys its palette/voice/tokens.
- **Reproducible** — log model + prompt + seed/job ID for every keeper.
- **Cost-aware** — image-to-video before text-to-video; lower res for drafts, 4K for finals.

## Composes With

- `frankx-brand` / `brand-guidelines` → brand tokens for generation
- `content-strategy` / `video-script` → briefs that feed the studio
- `suno-mastery` → score the videos this skill produces
- `infogenius` command → research-grounded image prompts
- `/studio` and `/generate-video` commands → operator entry points

## Reference

- `resources/model-matrix.md` — full model selection matrix, aspect-ratio table, self-hosted config, cost tiers
