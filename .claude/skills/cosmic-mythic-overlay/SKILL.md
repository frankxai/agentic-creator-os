---
name: cosmic-mythic-overlay
description: "Layer an Arcanea-style cosmic-mythic framing over a real space object or event, keeping the astronomy intact and separable from the myth. Use when giving a nebula/planet/launch a mythic narrative for the Arcanea universe without distorting the science."
version: 0.1.0
domain: cosmos
tags: [cosmos, mythic, arcanea, narrative, astronomy]
---

# Cosmic Mythic Overlay

> A real space object/event → its astronomy plus a separable cosmic-mythic framing.

## Purpose

The cosmos-specialized sibling of
[`../../brand/arcanea-mythic-overlay`](../../brand/arcanea-mythic-overlay). It
applies an Arcanea-style mythic narrative to genuine astronomy — turning a nebula
or a launch into universe-flavored story — while keeping the real science and any
image credit intact and clearly distinguishable from the myth.

## When it fires

- Keyword triggers: `cosmic myth`, `mythic space`, `arcanea cosmos`,
  `myth this nebula`, `universe framing space`
- File triggers: `arcanea/cosmos/**`
- Command triggers: `/cosmic-mythic-overlay`

## Inputs

| Input | Required | Notes |
|-------|----------|-------|
| `object` | yes | The real space object/event + its facts/credit. |
| `intensity` | no | `light` (default), `medium`, `full`. |

## Workflow

1. **Lock the astronomy** — the true facts + image/footage credit that must remain
   unchanged. ✅ Check: a clean factual layer exists.
2. **Map to canon** — relevant Arcanea Guardian/Luminor motifs (CC-BY-NC).
3. **Layer the myth** — narrative framing at the chosen `intensity`, wrapping the facts.
4. **Separation pass** — myth and astronomy are distinguishable; science untouched.
5. **Attribution** — Arcanea canon (CC-BY-NC) note + the original image credit.

## Output contract

```json
{
  "astronomy_layer": "string — true facts + credit",
  "mythic_overlay": "string — Arcanea framing",
  "combined": "string — separable myth + science",
  "canon_attribution": "string",
  "image_credit": "string"
}
```

## Tools & MCP

- Tools: `Read`. MCP: none required.

## Quality bar

- [ ] Astronomy is unchanged and distinguishable from the myth.
- [ ] Image/footage credit preserved.
- [ ] Arcanea canon attributed (CC-BY-NC).
- [ ] Register is mythic, science stays accurate.

## Example

Input: the Eagle Nebula (Pillars of Creation) + credit → `astronomy_layer` keeps
the science and NASA/ESA/CSA/STScI credit; `mythic_overlay` frames the pillars in
Arcanea canon; both remain separable.

---

Built on SIP — Starlight Intelligence Protocol
Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [file-contract, attestation, sovereignty]
Vertical: starlight-agent-skills · portable capability layer
