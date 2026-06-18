---
name: descript-operator
description: "Operate Descript via its MCP server for agentic video editing — rough cuts, filler removal, Studio Sound, captions, clip exports. Use whenever raw recordings need an edit pass, when the user says 'edit today's recordings', '/edit-pass', or any Descript project work. Requires the Descript MCP connector."
---

# Descript Operator

Drive Descript so the human never opens a timeline for rough work.

## Tools
- `list_projects` / `get_project` — always `get_project` first; composition IDs come from here, never guessed.
- `import_media` — URLs (direct/Drive/Dropbox as-is) or direct upload (PUT to `upload_urls`, Content-Type: application/octet-stream, exact `file_size`). New project → include `add_compositions`; existing project → omit unless asked.
- `prompt_project_agent` — the workhorse. Natural-language edit instructions.
- `wait_for_job` — poll every queued job; never report done on a queued job.
- `export_transcript` / `publish_project` — outputs.

## Standard edit pass (one prompt_project_agent call)
"Remove filler words and tighten pauses over 1.5s. Apply Studio Sound. Add captions in brand style. Mark chapter points at topic shifts. Keep all takes flagged 'keeper' in the script."

## Rules
- One review link to the human per video, not per operation.
- Long-form master stays in Descript; shorts are exported, atomization happens in Higgsfield (see higgsfield-operator).
- Project naming: `{YYYY-WW} {brand} {slug}` — e.g. `2026-24 FrankX agent-memory`.
- Local rough-cut fallback (no Descript credits): `auto-editor input.mp4 --margin 0.2s` via bash, then import the result.

## Handoff
After pass completes: update the Notion Content Engine item to `Edited`, attach the Descript review link, log in Ops Log.
