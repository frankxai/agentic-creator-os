# Multimodal Studio

> ACOS's unified generation layer — image, video, and consistent characters across 30+ frontier models, through one connector, brand-locked and vendor-agnostic.

---

## Why this exists

Agent-first platforms (Google Antigravity 2.0, Gemini Omni) made multimodal generation a first-class part of the agent loop in 2026. ACOS already had agents, skills, commands, hooks, and six-platform adapters — but its visual generation was **image-only**, hardcoded to one tool and one set of local paths, with **no video and no character consistency.**

Multimodal Studio closes that gap and overtakes it on two axes the single-vendor platforms can't match:

1. **Model-agnostic** — not locked to one company's image/video stack. Route each shot to the best model (Soul, Flux, Seedream for stills; Kling, Hailuo, Veo, Sora, DoP for motion).
2. **Character consistency across a whole set** — train a character once, reference it everywhere. That's how a content series, a course, or a campaign stays visually coherent.

All wrapped in ACOS's existing strengths: Frank DNA, brand-lock, safety hooks, auditability, and the `/acos` router.

---

## Architecture

```
                        ┌─────────────────────────────┐
   brief / content  ──▶ │   /studio  ·  /generate-video │ ──▶  finished asset set
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   multimodal-studio (skill)   │  model matrix · prompt craft
                        │   Multimodal Director (agent) │  routing · async lifecycle
                        └──────────────┬──────────────┘
                                       │  ~~image / ~~video / ~~character
                        ┌──────────────▼──────────────┐
                        │   Higgsfield MCP (connector)  │  one OAuth · 30+ models
                        │   generate_image · _video     │
                        │   create_character · status   │
                        └─────────────────────────────┘
```

| Layer | Artifact | Role |
|-------|----------|------|
| Command | `.claude/commands/studio.md`, `generate-video.md` | Operator entry points |
| Skill | `skills/multimodal-studio/SKILL.md` (+ `resources/model-matrix.md`) | The brain: routing, prompts, lifecycle |
| Agent | `.claude/agents/multimodal-director.md` | Creative-director persona that runs the pipeline |
| Connector | `.mcp.json` → `higgsfield` | The hands: actual generation |
| Activation | `.claude/skill-rules.json`, `skills/registry.json` | Auto-load on context |

---

## Setup (60 seconds)

```bash
# Hosted server — OAuth, no API keys
claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp
```

Then authenticate in the browser with your Higgsfield account. Verify:

```bash
claude mcp list   # higgsfield should appear connected
```

Self-hosted (stdio + `HF_API_KEY`/`HF_SECRET`) is documented in `skills/multimodal-studio/resources/model-matrix.md`.

---

## The workflow: BRIEF → ROUTE → CRAFT → GENERATE → ASSEMBLE

1. **BRIEF** — goal, placement, aspect ratio (derived from placement), style, character?, modality.
2. **ROUTE** — pick the model deliberately; state the choice. Photoreal → Soul; stylized → Flux/Seedream; motion-from-still → Kling/Hailuo/DoP; text→video → Veo/Sora.
3. **CRAFT** — Subject + Action + Setting + Composition + Lighting + Style + Technical. Describe motion explicitly for video. Inject brand tokens.
4. **GENERATE** — async; submit independent assets in parallel, poll `get_generation_status`, download to canonical paths.
5. **ASSEMBLE** — verify one-campaign coherence, produce crops/derivatives, run the AI-slop checklist, log model+prompt+job ID.

---

## Examples

```
/studio hero image + 3 social cards + 5s teaser for the ACOS launch post
/studio a consistent course-instructor character, then 4 lesson thumbnails featuring her
/generate-video animate this product still into a 5s cinematic loop, 16:9
```

---

## ACOS Multimodal Studio vs. Google Antigravity 2.0

| Dimension | Google Antigravity 2.0 | ACOS + Multimodal Studio |
|-----------|------------------------|--------------------------|
| **Visual models** | Google stack (Veo, Imagen/Nano Banana) | Model-agnostic — 30+ via Higgsfield (Soul, Flux, Seedream, Kling, Hailuo, Veo, Sora) + any MCP |
| **Character consistency** | Limited | First-class: `create_character` → reuse ID across the entire set |
| **Host platform** | Antigravity IDE / Gemini ecosystem | Claude Code, Cursor, Windsurf, OpenCode, Gemini CLI — six adapters |
| **Brand control** | Generic | Brand-locked — every asset inherits Frank DNA + active brand tokens |
| **Workflow surface** | Agent Skills templates | Skills + commands + agents + safety hooks + `/acos` router |
| **Parallel generation** | Parallel subagents | Parallel async job submission + polling |
| **Auditability / reproducibility** | Platform-managed | Open: model+prompt+seed/job-id logged per asset, append-only audit trail |
| **Lock-in** | Gemini models + Antigravity runtime | None — swap any connector at the `~~category` seam |

**Where Antigravity wins today:** a polished single desktop app, deep Gemini-model integration, managed infra.

**Where ACOS wins:** no model lock-in, character consistency across sets, runs inside the agent/IDE you already use, brand-locked and fully auditable, and it composes with the rest of the creator OS (music, content, publishing) rather than being a standalone IDE.

The strategy is not to rebuild an IDE. It's to make the **generation layer** portable, model-agnostic, and brand-aware — so ACOS rides on top of whatever agent host the operator prefers, including Gemini's own CLI.

---

## Roadmap

- [ ] Wire generated assets into `/factory` and `/publish` so visuals flow straight into the publishing pipeline
- [ ] Character registry persisted in ACOS memory (reuse IDs across sessions/projects)
- [ ] Cost ledger per project (track generations against a budget)
- [ ] Storyboard mode: brief → shot list → batch generate → assemble reel
- [ ] Auto-derivatives: one hero → full OG/social/thumbnail crop set
