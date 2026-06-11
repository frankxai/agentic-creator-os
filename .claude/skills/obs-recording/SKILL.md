---
name: obs-recording
description: "Manage recording sessions through OBS via obs-mcp (OBS WebSocket) — start/stop recording, switch scenes, check audio levels, verify output files. Use for batch record sessions, 'manage my camera', or '/record' workflows. Requires OBS Studio + obs-websocket + obs-mcp server configured locally."
---

# OBS Recording

Claude runs the booth; Frank runs the performance.

## Session protocol
1. **Pre-flight** (before Frank sits down): verify OBS running, correct scene collection (`FrankX Studio`), mic input live and levels in range, recording output path = `C:\Users\frank\starlight\capture\{YYYY-WW}\`, disk space > 20GB.
2. **Per video**: confirm script loaded in Speakflow (human confirms), start recording, log start timestamp + slug. On Frank's cue ("cut" / done signal): stop, verify file exists and is non-zero, log duration.
3. **Batch mode**: 2–4 videos back-to-back; one pre-flight, per-video start/stop. Between takes: 30s reset, confirm next script.
4. **Post**: list session files with durations → hand to descript-operator for import. Update Notion items to `Recorded`.

## Scenes (standard collection)
- `Talking Head` — camera full frame
- `Screen + Cam` — screen capture with camera bubble
- `Screen Only`
Switch on verbal plan in the brief; never mid-take unless scripted.

## Failure rules
- Recording won't start / file missing → tell Frank immediately, before he performs to a dead camera.
- Audio levels clipping or silent in pre-flight → block the session until fixed.
