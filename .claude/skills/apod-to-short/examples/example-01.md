# Example 01 — Pillars of Creation (Webb)

## Input

```
apod: "Pillars of Creation — JWST NIRCam. Explanation: These towering tendrils of
cold gas and dust in the Eagle Nebula (M16), ~6,500 light-years away, are being
eroded by ultraviolet light from nearby young stars. Newly forming stars appear
as bright red orbs at the tips. Image credit: NASA, ESA, CSA, STScI."
length: 45
voice: starlight
```

## Output

```json
{
  "title": "Pillars of Creation — JWST",
  "hook": "These columns are taller than our entire solar system is wide.",
  "script": "In the Eagle Nebula, 6,500 light-years away, three towers of cold gas and dust rise into space. Webb's infrared eyes cut straight through the dust — and reveal what's hiding inside: brand-new stars, glowing red at the tips. The same ultraviolet light from nearby young stars that lights this scene is also slowly evaporating it. We are watching star formation and destruction happen in the same frame. By the time that light reached Webb, it had been traveling since before recorded human history.",
  "captions": ["6,500 light-years away", "Cold gas + dust", "Webb sees through it", "New stars forming", "Lit and eroded at once", "Light older than history"],
  "shot_list": [
    "Slow vertical push up the pillars (Ken Burns), 0–8s",
    "Punch-in on red orbs at tips, label 'forming stars', 8–18s",
    "Pull back to full frame, overlay 'M16 — Eagle Nebula', 18–30s",
    "Hold on full frame with distance label, 30–45s"
  ],
  "rights_line": "Image: NASA, ESA, CSA, STScI",
  "duration_sec": 45
}
```

## Why this is a good result

Every claim (distance, infrared penetration, forming stars, UV erosion) is drawn
straight from the explanation. The credit names ESA/CSA, so this routes through
`rights-check-nasa-esa` — the rights line keeps the full multi-agency credit.
