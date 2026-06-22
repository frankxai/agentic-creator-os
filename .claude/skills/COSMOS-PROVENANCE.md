# Cosmos skills — provenance

The seven `cosmos` domain skills below are **consumed (mirrored) from the canonical
portable library** [`frankxai/starlight-agent-skills`](https://github.com/frankxai/starlight-agent-skills),
not authored in ACOS. ACOS is the creator-content home for them; the agent-skills
repo remains the source of truth.

| Field | Value |
|-------|-------|
| Source repo | `frankxai/starlight-agent-skills` |
| Source path | `skills/cosmos/` |
| Pinned version | `v0.1.0` |
| Source commit | `ff4efe5` (main, CI green) |
| License | MIT (inherited from source) |
| Attestation | Built on SIP — each `manifest.json` carries the SIP attestation line |

## Mirrored skills

- `apod-to-short`
- `arxiv-space-paper-to-brief`
- `cosmic-mythic-overlay`
- `nasa-image-to-atlas-page`
- `rights-check-nasa-esa`
- `rocket-launch-to-reel`
- `space-social-repurposer`

## Sync model

These are **version-pinned mirrors**. When the source library publishes a new
version, re-pull the `cosmos/` domain and update the pin above. Do not hand-edit
the mirrored `SKILL.md` / `manifest.json` files here — make changes upstream in
`starlight-agent-skills` and re-mirror, so the two copies never silently diverge.

## Not yet mirrored

The other creator-content domains in the source library (`media`, `brand`,
`education`, `research`, `coding` — 15 skills) are candidates for the same
treatment in follow-up passes. The `substrate` domain (4 skills) is intended for
the Starlight Intelligence System substrate, not ACOS.
