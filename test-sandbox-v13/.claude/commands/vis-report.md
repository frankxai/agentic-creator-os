# /vis-report — Visual Intelligence Report

Generate a comprehensive visual health summary including registry stats, category breakdown, page coverage, and actionable recommendations.

## Instructions

1. Run: `node scripts/scan-visual-registry.mjs --report` for registry stats
2. Query `data/sitemap-image-map.json` for page coverage:
   - Pages with status "complete" vs "needs-images" vs "placeholder"
   - Overall coverage percentage
3. Present combined report with:
   - Total images, total size, categories
   - Mood distribution
   - Page coverage stats
   - Top 5 action items (most impactful fixes)
4. Compare against brand-visual-dna.json standards

## When to Use
- Weekly visual health review
- Before major site launches or redesigns
- When planning image generation batch
- For stakeholder reporting
