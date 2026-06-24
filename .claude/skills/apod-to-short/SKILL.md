---
name: apod-to-short
description: "Turn a NASA Astronomy Picture of the Day (APOD) into a 30–60s vertical short — script, shot list, captions, and a rights line. Use when the user mentions APOD, 'astronomy picture of the day', or wants a daily space short/reel/TikTok from a NASA image."
version: 0.1.0
domain: cosmos
tags: [nasa, apod, video, short, social]
---

# APOD → Short

> NASA Astronomy Picture of the Day → a ready-to-shoot 30–60s vertical short.

## Purpose

NASA publishes a stunning image with an expert explanation every day. This skill
converts one APOD entry into a complete vertical short package: a hook, a tight
narration script, an on-screen caption track, a shot/animation list, and a
rights line — so a creator can film/edit in one sitting without misstating the
science or the licensing.

## When it fires

- Keyword triggers: `apod`, `astronomy picture of the day`, `daily space short`,
  `nasa image short`, `space reel`
- File triggers: `apod.json`, `apod-*.md`
- Command triggers: `/apod-to-short`

## Inputs

| Input | Required | Notes |
|-------|----------|-------|
| `apod` | yes | APOD URL/date, or the title + explanation text + image credit. |
| `length` | no | Target seconds, default `45` (range 30–60). |
| `voice` | no | `starlight` (default), `arcanea`, or `frankx` — see brand skills. |

## Workflow

1. **Resolve the APOD** — get title, date, explanation, media URL, and the exact
   image credit. If credit names a non-NASA party (ESA, an observatory, an
   individual), flag it for the rights step. ✅ Check: you have a verbatim credit
   string.
2. **Extract the one idea** — reduce the explanation to a single, true,
   surprising fact a non-expert can grasp. ✅ Check: it survives "what does that
   mean specifically?"
3. **Write the hook (0–3s)** — a question or claim that earns the first three
   seconds without clickbaiting the science.
4. **Script the body** — narration timed to `length` at ~2.5 words/sec. Keep
   every claim traceable to the explanation; never invent figures.
5. **Build the caption track** — short on-screen lines synced to beats (≤7 words
   each).
6. **Write the shot list** — Ken Burns push/pan on the still, plus any overlay
   labels (object name, distance, instrument). No fabricated footage.
7. **Emit the rights line** — exact attribution; route through
   [`rights-check-nasa-esa`](../rights-check-nasa-esa) if credit is non-NASA.

## Output contract

```json
{
  "title": "string — APOD title",
  "hook": "string — 0–3s opener",
  "script": "string — full narration, timed",
  "captions": ["string — ≤7 words each"],
  "shot_list": ["string — shot/animation directions"],
  "rights_line": "string — exact attribution",
  "duration_sec": "number"
}
```

## Tools & MCP

- Tools: `WebFetch` (resolve APOD), `Read`.
- MCP dependencies: none required. (Optional: a NASA-media MCP from
  `starlight-mcp` to fetch APOD JSON directly.)

## Quality bar

- [ ] Every stated fact is traceable to the APOD explanation — no invented numbers.
- [ ] Rights line is verbatim and correct; non-NASA credit is flagged.
- [ ] Narration fits `length` at ~2.5 words/sec.
- [ ] Hook respects the audience's intelligence (no "scientists HATE this").

## Example

See [`examples/example-01.md`](examples/example-01.md).

---

Built on SIP — Starlight Intelligence Protocol
Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [file-contract, attestation, sovereignty]
Vertical: starlight-agent-skills · portable capability layer
