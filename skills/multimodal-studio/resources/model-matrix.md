# Multimodal Studio — Model Matrix & Reference

Deep reference for the `multimodal-studio` skill. Loaded on demand (progressive disclosure).

## Image models

| Model | Best for | Resolution | Notes |
|-------|----------|-----------|-------|
| **Soul** | Photoreal people, products, brand stills | up to 4K | Strongest on faces/skin; pairs with character training |
| **Flux** | Stylized, illustration, in-image typography | high | Excellent prompt adherence, clean text rendering |
| **Seedream** | Artistic / painterly / concept art | high | Distinctive aesthetic, good for moodboards |
| **Nano Banana** (Gemini 2.5 Flash Image) | Fast drafts, infographics, edits | standard | ACOS legacy default; cheap iteration |

## Video models

| Model | Mode | Length | Best for |
|-------|------|--------|----------|
| **Kling** | image→video, text→video | up to ~10s | Cinematic motion, strong physics |
| **Minimax Hailuo** | image→video, text→video | short | Expressive motion, character action |
| **Veo** | text→video | short clips | Complex scenes, prompt fidelity |
| **Sora-class** | text→video | short clips | Narrative, multi-shot feel |
| **DoP** | image→video | ~5s | Fast still-to-motion (self-hosted MCP default) |

> Routing rule of thumb: **start from a still you already love and animate it** (image→video) before paying for text→video. It's cheaper, faster, and keeps your composition.

## Aspect ratio → placement

| Placement | Ratio | Pixels (target) |
|-----------|-------|-----------------|
| Blog hero | 16:9 | 1920×1080 |
| OG / Twitter card | 1.91:1 | 1200×630 |
| Instagram feed | 1:1 | 1080×1080 |
| Instagram/TikTok/Reels/Shorts | 9:16 | 1080×1920 |
| YouTube thumbnail | 16:9 | 1280×720 |
| LinkedIn image | 1.91:1 | 1200×627 |

Derive ratio from placement automatically — don't ask the operator for pixels.

## Cost tiers (relative)

1. **Draft** — Nano Banana / standard-res image. Iterate prompts here.
2. **Final still** — Soul/Flux at 4K once composition is locked.
3. **Image→video** — animate the locked still (mid cost).
4. **Text→video** — Veo/Sora-class (highest cost; reserve for hero motion).

## Connection options

### Hosted (default, recommended)
```bash
claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp
```
OAuth via Higgsfield account. No API keys. Works in Claude Code, Claude web/Cowork, and any MCP client.

### Hosted — manual `.mcp.json`
```json
{
  "mcpServers": {
    "higgsfield": {
      "type": "http",
      "url": "https://mcp.higgsfield.ai/mcp"
    }
  }
}
```

### Self-hosted (stdio, API keys)
```json
{
  "mcpServers": {
    "higgsfield": {
      "command": "python",
      "args": ["-m", "higgsfield_mcp.server"],
      "cwd": "/absolute/path/to/higgsfield_ai_mcp",
      "env": { "HF_API_KEY": "${HF_API_KEY}", "HF_SECRET": "${HF_SECRET}" }
    }
  }
}
```
Keys from https://cloud.higgsfield.ai/api-keys. Self-hosted exposes `generate_image` (Soul), `generate_video` (DoP), `create_character`, `list_characters`, `get_generation_status`.

## Async lifecycle pattern

```text
submit generate_image/video  →  receive job id
        ↓
poll get_generation_status(job_id)  →  pending? wait, re-poll
        ↓
status = done  →  download asset to canonical path  →  log (model, prompt, seed, job id)
```

Submit independent assets in parallel, then poll them together. Never block on one job before submitting the next when they're independent.

## AI-slop checklist (inspect every keeper)

- Hands/fingers correct count and shape
- In-image text spelled correctly (or absent by design)
- Skin/material not plastic or over-smoothed
- No warped backgrounds, duplicated limbs, or melted edges
- Lighting direction consistent across the asset set
- Character matches its reference ID across the set

If any fail → adjust prompt and regenerate. Don't ship slop.
