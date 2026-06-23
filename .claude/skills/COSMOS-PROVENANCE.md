---
name: cosmos-provenance
description: Provenance, version pin, and sync instructions for the 7 cosmos skills mirrored from starlight-agent-skills. Do not hand-edit these files — make changes upstream and re-mirror.
---

# Cosmos skills — provenance

Seven production-grade space-content skills live here as a **version-pinned mirror** of
[`frankxai/starlight-agent-skills`](https://github.com/frankxai/starlight-agent-skills).
This directory is their runtime home in ACOS — the creator OS is the right layer for
space-content repurposers. The source library remains the single source of truth.

## Version pin

| Field | Value |
|-------|-------|
| Source repo | [`frankxai/starlight-agent-skills`](https://github.com/frankxai/starlight-agent-skills) |
| Source path | `skills/cosmos/` |
| Pinned version | `v0.1.0` |
| Pinned commit | `ff4efe5` (main, CI ✅) |
| License | MIT (inherited from source) |
| SIP attestation | present in every `manifest.json` |

## Skills in this mirror

| Skill | What it does |
|-------|--------------|
| `apod-to-short` | NASA APOD → 30–60s vertical short: script, captions, shot list, rights line |
| `arxiv-space-paper-to-brief` | Astrophysics arXiv paper → audience-tuned brief with object/mission context |
| `cosmic-mythic-overlay` | Arcanea mythic framing layered over real astronomy — facts and myth stay separable |
| `nasa-image-to-atlas-page` | NASA/ESA image → MDX cosmic-atlas page with fact table, sources, and rights |
| `rights-check-nasa-esa` | Usage-rights check for NASA/ESA/observatory media → correct attribution line |
| `rocket-launch-to-reel` | Launch details → punchy 30–45s vertical reel: hook, narration, captions, credit |
| `space-social-repurposer` | One space asset → coordinated multi-platform content pack, credits intact |

## What's included

Only the **runnable core**: `SKILL.md` + `manifest.json`. The `examples/` and `tests/`
directories are QA artifacts that stay in the source library — consult
[`starlight-agent-skills/skills/cosmos/`](https://github.com/frankxai/starlight-agent-skills/tree/main/skills/cosmos)
to browse them.

## Sync rules

> Do not hand-edit these files. Make changes upstream in `starlight-agent-skills`,
> get CI green there, then re-mirror here.

To re-mirror when the source publishes a new version:

```bash
# From your local starlight-agent-skills clone:
for skill in apod-to-short arxiv-space-paper-to-brief cosmic-mythic-overlay \
             nasa-image-to-atlas-page rights-check-nasa-esa \
             rocket-launch-to-reel space-social-repurposer; do
  node scripts/port-skill.mjs cosmos/$skill \
       --target=/path/to/agentic-creator-os/.claude/skills \
       --dry-run      # review output, then remove --dry-run to write
done
```

After writing, update **Pinned version** and **Pinned commit** in the table above
and open a PR.

## Not yet mirrored

The 15 creator-content skills across `media`, `brand`, `education`, `research`, and
`coding` domains are the next mirror candidates. The `substrate` domain
(`agentic-income`, `affiliate-audit`, `payments-mandate`, `swarm-queen-coordination`)
is intentionally not mirrored here — those 4 skills belong in
`Starlight-Intelligence-System`, not ACOS.
