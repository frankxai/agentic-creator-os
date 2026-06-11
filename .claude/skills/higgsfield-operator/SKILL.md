---
name: higgsfield-operator
description: "Operate Higgsfield MCP for AI video/image generation, viral clip atomization, video analysis, and virality scoring. Use for 'package and clip', '/package-clip', generating B-roll, Soul character shots, analyzing competitor videos, or scoring a video before publish. Requires the Higgsfield custom connector (https://mcp.higgsfield.ai/mcp)."
---

# Higgsfield Operator

One connector, four jobs: generate, atomize, analyze, score.

## Jobs
1. **Clip atomization** — long-form URL/file → 3–5 vertical clips, 9:16, branded subtitles. Always request virality score per clip; clips scoring bottom-quartile are cut, not published.
2. **Virality scoring** — every video gets scored BEFORE publish. Report hook strength + retention risk to the human with the review link.
3. **Video analysis** — competitor/outlier URLs → hook structure, pacing, why it worked. Output feeds the Monday intelligence brief and Obsidian distillation.
4. **Generation** — B-roll, product shots, title cards. Model selection: Soul 2.0 for character/brand consistency (train the Frank Soul character once, reuse), Kling/Veo for cinematic motion, NB-class for stills. Default to cheapest model that meets the brief; credits are the budget (Starter = 200/mo).

## Credit discipline
- Check remaining credits implicitly: if a generation fails on quota, stop and report — do not retry-burn.
- Clips + scoring first, generation second; atomization of recorded content always outranks net-new generation.

## Handoff
Clips land → Notion item to `Packaged`, attach asset links, log credit spend estimate in Ops Log.
