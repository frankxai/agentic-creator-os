---
name: anime-scene
description: Produce an anime scene that teaches one agentic-systems mechanism — five beats, keyframes rendered via Multimodal Studio, and a runnable lab. Usage: /anime-scene <concept | ep01..ep08> [--frames 3|5] [--video] [--aspect 16:9|9:16|1:1]
---

# /anime-scene — one mechanism, one scene, one lab

Activates the `anime-agentic-scenes` skill and the **Anime Scene Director** agent. Read `skills/anime-agentic-scenes/SKILL.md` before doing anything.

## Steps

1. **Resolve the target.** `ep01`..`ep08` loads the episode from `resources/season-1.md` and its prompts from `resources/keyframes.yaml`. A free-text concept goes through the visual grammar first; if the concept has no row, add one (all four columns) before continuing.
2. **Write the mechanism sentence.** One sentence an engineer would sign. Print it. No sentence, no render.
3. **Beats.** Establish, Trigger, Mechanism, Cost, Resolution. One action line and one learning line each.
4. **Keyframe prompts.** Template from the skill; consistency block and negative block from `resources/style-bible.md`. Default three frames (Establish, Mechanism, Resolution); `--frames 5` renders all beats.
5. **Render.** Hand the prompts to `/studio` (Higgsfield MCP). Stylized lane for stills. `--video` animates the approved Mechanism frame only, one camera move, 5 seconds. Check credits first; stop on quota, never retry-burn.
6. **Lab.** Link or write the lab under `resources/labs/`. State the expected output. Label `illustrative` if it does not run end to end.
7. **Package.** `content/anime-scenes/<ep>-<slug>/scene.md` (mechanism, beats, "what just happened", checkpoint), `keyframes/` (asset links), `lab/` (or a pointer). Run `/review-content` on scene.md; brand gate on the frames.

## Output to the operator

- Mechanism sentence
- Beat table
- Model chosen per frame, one line each
- Asset links (never fabricated)
- Lab path and expected output
- Credits spent estimate
