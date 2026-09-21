---
name: Anime Agentic Scenes
description: Turn agentic-systems concepts (agent loops, tools, MCP, orchestration, swarms, memory, safety, evals, consensus) into epic anime scenes that teach the mechanism and ship with a runnable implementation lab. Visual grammar, style bible, Season 1 episode bible, generation-ready keyframe prompts, and the render pipeline via Multimodal Studio.
version: 1.0.0
triggers:
  - anime scene
  - anime agentic
  - agentic anime
  - explain agents as anime
  - episode
  - keyframe
  - storyboard agents
  - the orchestrator series
  - teach agentic systems
  - ai world
---

# Anime Agentic Scenes

> Every mechanism in an agentic system has a body, a weapon, a room, and a cost. Draw those, and people understand the system before they read the code.

## Purpose

A production skill with three outputs per scene:

1. **The scene** — anime-cinematic keyframes (and optionally motion) rendered through Multimodal Studio.
2. **The mechanism** — the exact agentic concept the scene encodes, stated in plain engineering language.
3. **The lab** — a runnable implementation the viewer can execute in Claude Code / ACOS in under 20 minutes.

Scene without mechanism is decoration. Mechanism without lab is a lecture. All three or it does not ship.

## When to use

- "Make an anime scene that explains X" where X is any agentic concept
- Building an episode of the series (see `resources/season-1.md`)
- Producing a teaching short, a course hero, a thumbnail set, or a talk opener about agent systems
- Exploring a new agentic capability (new SDK feature, new topology) and wanting a visual + lab pair for it

## The contract

| Layer | Source of truth | Never |
|---|---|---|
| Concept → visual metaphor | `resources/visual-grammar.md` | Invent a second metaphor for a concept that already has one |
| Look, characters, camera, palette | `resources/style-bible.md` | Drift the character sheet between shots |
| Episodes, beats, labs | `resources/season-1.md` | Ship a scene whose lab does not run |
| Prompts ready to render | `resources/keyframes.yaml` | Paste a prompt without the consistency block |
| Rendering | `multimodal-studio` skill + Higgsfield MCP | Fabricate an image URL |

## Workflow: CONCEPT → GRAMMAR → BEATS → KEYFRAMES → RENDER → LAB → SHIP

1. **CONCEPT** — name the mechanism in one sentence an engineer would sign. ("A circuit breaker counts failures per file and restricts writes after 5.") If you cannot write that sentence, you are not ready to draw.
2. **GRAMMAR** — look up the concept in `visual-grammar.md`. Use the registered body / weapon / room / cost. If the concept is new, register it there first (one row), then proceed.
3. **BEATS** — five shots, always: *Establish · Trigger · Mechanism · Cost · Resolution*. Each beat is one sentence of action and one sentence of what the viewer learns.
4. **KEYFRAMES** — write one prompt per beat using the template below. Prepend the consistency block from the style bible. Three keyframes minimum per scene (Establish, Mechanism, Resolution); five for a full episode.
5. **RENDER** — route through `multimodal-studio`: stills via the stylized lane (Flux / Seedream class), motion via image-to-video (Kling class) from the approved still. Recurring cast goes through `create_character` once; reuse the ID. Check credits; atomize before generating net-new.
6. **LAB** — write or link the runnable lab. It must execute with only the repo plus one API key. Include the expected output.
7. **SHIP** — package as `episodes/<nn>-<slug>/` with `scene.md` (beats + mechanism), `keyframes/` (renders), `lab/` (code + README). Run `/review-content` on the mechanism text; run the brand gate on the frames.

## Keyframe prompt template

```
[CONSISTENCY BLOCK from style-bible.md]
Shot: <Establish|Trigger|Mechanism|Cost|Resolution>, <camera: wide / medium / close / dutch / overhead>, <lens feel>.
Subject: <cast member(s) from the sheet> <doing the action from the beat>.
Mechanism cue: <the visual grammar element made visible — the ring, the seal, the gate, the formation>.
Setting: <room from the grammar>, <time of day / weather>.
Lighting: <key + rim colour from palette>, <atmosphere>.
Motion (video only): <camera move> + <subject motion> + <pacing>.
Text: none in frame.
Negative: <from style bible>.
Aspect: <16:9 for episodes, 9:16 for shorts, 1:1 for cards>.
```

## Teaching structure per scene (what the viewer receives)

1. Cold open keyframe (no words) — 3 seconds
2. One-line mechanism statement (the engineer's sentence)
3. The five beats with frames
4. "What just happened" — the mechanism in 5 bullets, real terms (tokens, tool call, MCP server, hook, quorum)
5. The lab — run it, see the same thing the scene showed
6. Checkpoint — one question that cannot be answered without having run the lab

## Voice and taste

- Frank DNA: cool, premium, high intellect, fun. The series is a shonen about builders, not a lecture with pictures.
- Engineering terms stay engineering terms in the mechanism layer. The metaphor lives in the frame, not in the explanation.
- No mystical language for computation. A vault is storage. A seal is a threshold. A summon is a function call.
- No text in frames. Titles and labels are composited afterwards.
- Cost is always visible: a meter, a ring, a fading light. Agentic systems spend tokens, time, and trust. Draw the spend.

## Guardrails

- Never render before the mechanism sentence exists.
- Never let the lab drift from the scene: if the scene shows three agents, the lab spawns three agents.
- Never claim capability the code does not have. If a lab is illustrative only, label it `illustrative` in the README.
- Character and world assets are FrankX-owned original IP for this series. No references to existing anime franchises, studios, or characters in prompts.
- Credits are the budget. Three approved stills before any video. One video per episode until the cut is approved.

## Related

- `multimodal-studio` — rendering, model matrix, async lifecycle
- `higgsfield-operator` — credit discipline, virality scoring before publish
- `hook` — hooks for the shorts cut from each episode
- `/studio`, `/generate-video`, `/generate-images` — the render commands this skill feeds
