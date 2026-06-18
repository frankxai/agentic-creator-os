---
name: edit-pass
description: Agentic Descript edit pass over the latest recording session
---

# /edit-pass [session-week | project-name]

Run the Edit stage. Model: Sonnet (Opus if the edit brief has creative ambiguity).

1. Load skill: `descript-operator`.
2. Locate session files (`starlight/capture/{YYYY-WW}/` or Descript project) — import if not yet in Descript.
3. Run the standard edit pass (filler, pauses, Studio Sound, captions, chapters) via `prompt_project_agent`; `wait_for_job` to completion.
4. Export transcript → save alongside the Notion item (feeds newsletter + posts atomization).
5. Notion item → `Edited`, attach review link. One review link per video.
6. Stop. Packaging is `/package-clip` after Frank approves the edit.
