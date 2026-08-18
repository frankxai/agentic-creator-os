---
name: higgsfield-studio
description: "Route any ad, UGC, faceless video, thumbnail, product photo, character, or brand-visual request for FrankX / Arcanea / Starlight through the Higgsfield MCP's own bundled workflows, with brand locks and the house production rules. Use whenever Frank asks to make an ad, UGC video, short, reel, TikTok, faceless video, explainer, thumbnail, product shot, character sheet, brand kit, or campaign asset."
priority: high
requires: "Higgsfield MCP (https://mcp.higgsfield.ai/mcp)"
---

# Higgsfield Studio

Higgsfield's own bundled workflows beat every community skill for the same job. They are not prompt templates — they are full production pipelines with storyboard architecture, a mandatory anti-slop pass, frozen-frame QA, and an execution sandbox. **Do not substitute, do not supplement, do not "improve" them mid-run.**

## Step 0 — non-negotiable

Call `get_workflow_instructions` with **no argument** to load the live catalog, then again with the matching workflow name. New workflows ship over time; the catalog is the authority, never memory. Load the workflow *before* writing any prompt or calling any `generate_*` tool.

If no workflow matches, only then fall through to raw `generate_image` / `generate_video`.

## Route table

| Ask | Workflow |
|---|---|
| UGC talking-head review (the default UGC ask) | `ugc-flow` |
| Product-only, no creator on camera | `ugc-product-flow` |
| Site / app / store page shown on screen | `ugc-saas-flow` |
| Unboxing, haul, PR drop, first reaction | `ugc-unboxing-flow` |
| Try-on, fit check, OOTD | `ugc-try-on-flow` |
| Step-by-step how-to with on-screen steps | `ugc-tutorial-flow` |
| Faceless narrated video — explainer, history, myth, kids | `faceless-channel-video` |
| YouTube / IG thumbnail or cover | `youtube-thumbnail-generator` |
| Logo, identity, brandbook, packaging, merch, social graphics | `brandkit` |
| Character reference, model sheet, turnaround, expression sheet | `character-sheet` |
| Branded ad video with avatars + products (9 modes) | `marketing_studio` |
| Score a finished cut | `virality_predictor` |
| Long-form to vertical clips | `personal_clipper` / `shorts_studio` |

Sibling workflows **contradict each other by design**. Never mix references across flows.

## House rules (Higgsfield's, adopted verbatim)

**Pinned is pinned.** Models per step, aspect ratios, resolution, board counts, `medias` shape — all decided by the workflow. Never ask Frank about them and never offer a fork. Bundle the genuine gaps into **one** question: duration, product (URL or photo), any accent/quirk. Nothing else.

**Anti-slop is a pass, not an adjective.** Every storyboard gets a `seedream_v5_pro` de-slop generation before it feeds video. Never send a raw `gpt_image_2` board to Seedance. Writing "photorealistic, not AI-looking" into a prompt is not a substitute.

**Frozen-frame QA before anything is shown.** Pull evenly spaced stills plus 2-3 mid-word frames and check by eye: exactly one hero product, 2 hands max per person (count mirrors and frame edges), absent features stayed absent, prop states consistent, label not gibberish or a real brand, product scale matches the hand, no doubled lip edges, face matches the reference, no baked text. Staging failure means fix the prompt and re-roll that clip only. A motion pass misses these.

**Sequential boards, parallel clips.** Boards condition on the previous board and must run in order. Clips submit in one batch.

**One identity per run.** The same `character_media_id` seeds every board. Never regenerate mid-run. Never describe the creator inline as a substitute for generating them.

**Chain by `job_id`.** Outputs flow into the next call's `medias[].value` — no download, no re-upload. One exception: Seedream i2i (`role: image_references`) rejects a `job_id`, so `media_import_url` the hosted URL first.

**Shell work runs in the sandbox.** `sandbox_exec` has ffmpeg and the bundled scripts preinstalled at `$HF_WORKFLOWS/<workflow>/scripts/`. Nothing needs installing on Frank's machine. The sandbox is ephemeral — curl inputs in and PUT outputs out inside the same command.

**Your text is the only memory.** Generated images cannot be re-inspected. Whatever was written about the creator, product, and location *is* the continuity contract — carry it forward verbatim.

**Never bake text into a generation.** On-video text is a post-render burn, timed from a word-level transcript of the final audio, and only if asked.

**Hide the plumbing.** Report the hosted URL and duration. No job ids, no intermediate steps.

**Never invent a model name.** `models_explore` is the source of truth. `seedance_2_0` for motion and identity-consistent reference video, `kling3_0` for the cleanest image-to-video at lower cost, `soul_2` for creator/character stills, `gpt_image_2` / `nano_banana_pro` for boards and 4K stills, `seed_audio` for audio.

**`use_unlim` is opt-in and Frank's call.** Send the flag only when he asks to spend free-trial generations, and when he does, send it without pre-gating — the backend rejects, it never silently charges. State expected credit spend in one line before any paid batch.

## Brand locks — inject, never ask

- **FrankX** — personal brand, AI-architect register. Attach Frank's own photo as the creator rather than generating one; `ugc-flow` treats an attached person photo as the creator and skips generation. Compose with `frankx-brand`.
- **Arcanea** — creative-platform brand. Canon at `starlight/repos/arcanea-ai-app/.arcanea/lore/CANON_LOCKED.md`; read before any lore-adjacent visual. `arcanea-infogenius` carries the Gates colour/composition framework.
- **Starlight Intelligence Systems** — substrate/protocol. Product-demo register: `ugc-saas-flow` or screen capture. Never a creator-led testimonial.

## Known gap — Soul ID

`soul_2` and `soul_cinematic` accept a `soul_id` for a persistent trained identity, but the MCP exposes no training tool and `show_characters` is empty. A recurring on-camera spokesperson across campaigns requires the Higgsfield web app or the CLI (`higgsfield soul-id create --name <brand> --soul-2 --image ...`, 5-20 photos, returns a `reference_id`). Until then, per-run identity locking via `character_media_id` and Seedance `image_references` is the ceiling — good within an ad, not across a catalogue. Vault any `reference_id` created.

## Boundary with `higgsfield-operator`

`higgsfield-operator` owns clip atomization, virality scoring, and competitor video analysis. This skill owns everything generative. When a request is "make something", this skill leads. When it is "cut / score / analyse something that exists", operator leads.

## Deep reference (read, never auto-trigger)

`starlight/repos/FrankX/references/higgsfield-prompt-lab/` — 31 documents: Seedance content-filter diagnosis (instant fail under 10s = filter rejection, never regenerate unchanged; delayed fail over 30s = infra), the six-slot prompt formula, the 50-80 word attention law, MCSLA, Kling Motion Control, camera and lighting vocabulary, a 13-project production corpus. Deliberately kept **out** of any skills directory so it cannot hijack workflow routing. Read it when diagnosing a rejection or writing a raw prompt outside a workflow — never as a replacement for one.
