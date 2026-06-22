---
name: space-social-repurposer
description: "Repurpose a space asset (APOD short, mission brief, launch reel, atlas page) into a coordinated multi-platform pack, preserving image/footage credits across every variant. Use when distributing space content across X/LinkedIn/Instagram/YouTube while keeping NASA/ESA attribution intact."
version: 0.1.0
domain: cosmos
tags: [space, repurpose, distribution, social, rights]
---

# Space Social Repurposer

> One space asset → a coordinated social pack, with credits carried everywhere.

## Purpose

The space-tuned sibling of [`../../media/social-repurposer`](../../media/social-repurposer).
Same multi-platform distribution, with one critical addition: NASA/ESA/observatory
image and footage credits are propagated to *every* variant that shows the media,
so attribution never gets dropped in the repurposing.

## When it fires

- Keyword triggers: `repurpose space`, `space social pack`, `distribute space
  content`, `cross-post nasa`
- File triggers: `content/space/**`
- Command triggers: `/space-social-repurposer`

## Inputs

| Input | Required | Notes |
|-------|----------|-------|
| `source` | yes | Space asset + its credit/rights line. |
| `platforms` | no | Subset of `x`, `linkedin`, `instagram`, `youtube-short`, `newsletter`. Default: all. |
| `voice` | no | `starlight` (default), `arcanea`, `frankx`. |

## Workflow

1. **Lock facts + credit** — capture the science and the verbatim credit; route
   rights questions through [`rights-check-nasa-esa`](../rights-check-nasa-esa).
   ✅ Check: credit string captured.
2. **Generate variants** — X thread, LinkedIn, IG caption + hashtags, YouTube-short
   script, newsletter blurb — platform-native, facts consistent.
3. **Credit propagation** — every variant that shows the media carries the credit.
4. **Consistency pass** — facts agree across variants and with the source.

## Output contract

```json
{
  "core_message": "string",
  "x_thread": ["string"],
  "linkedin": "string",
  "instagram": { "caption": "string", "hashtags": ["string"] },
  "youtube_short": "string",
  "newsletter": "string",
  "rights_line": "string — propagated to all media variants"
}
```

## Tools & MCP

- Tools: `Read`, `WebFetch`. MCP: none required.

## Quality bar

- [ ] Credit line appears on every variant that shows the image/footage.
- [ ] Facts identical across variants and true to source.
- [ ] Each variant fits platform norms.

## Example

Input: the APOD "Pillars of Creation" short (credit: NASA, ESA, CSA, STScI) → a
full pack where the credit rides along on the X, LinkedIn, and Instagram variants.

---

Built on SIP — Starlight Intelligence Protocol
Substrate: starlightintelligence.org/protocol v1.1.0
Layers used: [file-contract, attestation, sovereignty]
Vertical: starlight-agent-skills · portable capability layer
