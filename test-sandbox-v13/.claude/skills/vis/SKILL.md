---
name: Visual Intelligence System (VIS)
description: Agentic visual asset management — scan, audit, and manage images across your site with AI-powered quality enforcement
version: 1.0.0
category: visual-management
triggers:
  - visual registry
  - image audit
  - visual health
  - placeholder image
  - orphaned image
  - oversized image
  - brand visual
  - image management
  - visual intelligence
  - vis scan
  - vis audit
  - vis report
---

# Visual Intelligence System (VIS)

## What VIS Does

VIS is the visual asset management layer for ACOS. It ensures every image across your site is:
- **Tagged** — auto-detected mood, theme, color palette, placement suitability
- **Audited** — placeholders, duplicates, orphans, and oversized images detected
- **Mapped** — every page linked to its images with coverage status
- **Brand-aligned** — validated against your brand visual DNA

## Core Workflow

### 1. Always Query Registry First
Before generating ANY new image, query the visual registry:
```bash
# Find dark, atmospheric music images suitable for homepage
jq '[.[] | select(.tags | contains(["music"])) | select(.mood == "atmospheric")]' data/visual-registry.json
```

If a suitable image exists, USE IT. Only generate new images when nothing fits.

### 2. Scan Images
Rebuild the registry after adding new images:
```bash
node scripts/scan-visual-registry.mjs          # Full rebuild
node scripts/scan-visual-registry.mjs --diff   # Only new images
node scripts/scan-visual-registry.mjs --report # Health summary
```

### 3. Audit Visual Health
Run automated quality checks:
```bash
node scripts/audit-visual-health.mjs           # Full audit with score
node scripts/audit-visual-health.mjs --json    # JSON for n8n/Slack
```

**Health Score Interpretation:**
- 90-100: EXCELLENT — no action needed
- 70-89: GOOD — minor issues to address
- 50-69: NEEDS ATTENTION — several issues
- 0-49: CRITICAL — immediate action required

### 4. Check Page Coverage
Query the sitemap-image map:
```bash
# Find pages that need images
jq '[.[] | select(.status == "needs-images")]' data/sitemap-image-map.json

# Find pages using placeholders
jq '[.[] | select(.status == "placeholder")]' data/sitemap-image-map.json
```

## Key Data Files

| File | Purpose | Update Frequency |
|------|---------|-----------------|
| `data/visual-registry.json` | 408+ images tagged & indexed | After every image addition |
| `data/brand-visual-dna.json` | Brand visual standards | Rarely (brand changes) |
| `data/sitemap-image-map.json` | Page-to-image coverage | After page/image changes |

## Brand Visual DNA

The brand DNA file (`data/brand-visual-dna.json`) defines:
- **Palette** — primary background (#0a0a0b), accent colors with usage rules
- **Image Standards** — hero (16:9, min 1600px), OG (1200x630), thumbnails (16:10)
- **Mood Profiles** — atmospheric, branded, technical, artistic, cinematic
- **Quality Council** — 3-perspective review before any visual ships:
  1. **Brand Guardian** — Does it match visual DNA? Dark theme, accent harmony?
  2. **Conversion Optimizer** — Does it drive action? Mood-setting vs distracting?
  3. **Accessibility Auditor** — Sufficient contrast? Meaningful alt text?

## Generation Rules

When generating new images:
1. Use `mcp__nanobanana__generate_image` with model_tier "pro" for heroes
2. Always use dark background (#0a0a0b) — images must blend with site theme
3. Aspect ratio 16:9 for heroes, 1200x630 for OG images
4. Run through council review before deploying
5. Auto-register in visual-registry.json after generation
6. Include negative_prompt: "text, watermark, logo, bright background, cartoon, flat design"

## Common Issues & Fixes

| Issue | Detection | Fix |
|-------|-----------|-----|
| Placeholder SVG | `blog-hero-aurora.svg` in frontmatter | Generate unique hero image |
| Duplicate hero | Same image in header AND body | Remove body `![](...)` reference |
| Oversized image | >2MB in registry | Optimize with sharp or re-generate at lower resolution |
| Orphaned image | In registry but no code reference | Investigate — may be dynamically loaded |
| Missing alt text | Empty `alt=""` on `<Image>` | Add descriptive alt text |

## Integration Points

- **visual-creation skill** — Generation pipeline with quality gates
- **brand-rules skill** — Brand Guardian enforcement
- **design-system skill** — Color domain mapping and token architecture
- **nanobanana MCP** — Image generation (Gemini 3 Pro/Flash)
- **n8n** — Automated weekly audits via webhook
