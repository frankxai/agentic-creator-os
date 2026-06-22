---
name: rocket-launch-to-reel
description: "Turn a rocket launch into a short vertical reel — punchy hook, 30–45s narration, beat-synced captions, and a footage-credit line. Use when making a launch reel/short (not a long-form YouTube video), or a quick social recap of a launch."
version: 0.1.0
domain: cosmos
tags: [rocket, launch, reel, short, social]
---

# Rocket Launch → Reel

> A launch → a 30–45s vertical reel package.

## Purpose

The short-form sibling of [`../../media/rocket-launch-to-youtube`](../../media/rocket-launch-to-youtube).
Built for speed and the vertical feed: a strong hook, tight narration, beat-synced
captions, and the footage credit — grounded in verified mission facts.

## When it fires

- Keyword triggers: `launch reel`, `rocket short`, `launch recap short`,
  `reel from launch`
- File triggers: `reels/**`
- Command triggers: `/rocket-launch-to-reel`

## Inputs

| Input | Required | Notes |
|-------|----------|-------|
| `mission` | yes | Vehicle, payload, provider, date, outcome (+ source). |
| `length` | no | Target seconds, default `35`. |
| `voice` | no | `starlight` (default), `arcanea`, `frankx`. |

## Workflow

1. **Verify the launch** — vehicle, payload, outcome from a cited source. ✅ Check:
   outcome confirmed.
2. **Hook (0–3s)** — the single most striking true fact (payload, milestone, scale).
3. **Narration** — timed to `length` at ~2.5 words/sec; every claim verified.
4. **Beat captions** — ≤7-word on-screen lines synced to launch phases.
5. **Footage credit** — credit agency/provider footage; flag any reuse limits.

## Output contract

```json
{
  "hook": "string",
  "script": "string",
  "captions": ["string"],
  "rights_line": "string",
  "duration_sec": "number"
}
```

## Tools & MCP

- Tools: `WebSearch`, `WebFetch`, `Read`. MCP: none required.

## Quality bar

- [ ] Launch facts/outcome verified and cited.
- [ ] Narration fits `length`; hook is true, not hyped.
- [ ] Footage credit present.

## Example

Input: "Falcon Heavy, [payload], [date], successful" → a 35s reel with a
scale-driven hook, beat captions, and a footage-credit line.

---

Built on SIP — Starlight Intelligence Protocol
Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [file-contract, attestation, sovereignty]
Vertical: starlight-agent-skills · portable capability layer
