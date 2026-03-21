# /vis-scan — Rebuild Visual Registry

Scan all image directories and rebuild `data/visual-registry.json` with auto-detected tags, mood, theme, and placement suitability.

## Instructions

1. Run: `node scripts/scan-visual-registry.mjs` (full rebuild) or `node scripts/scan-visual-registry.mjs --diff` (new images only)
2. Report: total images, images per category, oversized images
3. If `--diff` mode found new images, list them with their auto-detected tags

## When to Use
- After adding new images to `public/images/`
- After generating images with nanobanana/infogenius
- Before selecting images for a page (ensure registry is current)
- As part of weekly visual health routine
