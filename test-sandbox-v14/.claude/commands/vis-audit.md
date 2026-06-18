# /vis-audit — Visual Health Audit

Run automated quality checks against the visual registry and codebase. Produces a health score (0-100) with categorized issues.

## Instructions

1. Run: `node scripts/audit-visual-health.mjs`
2. For JSON output (n8n/Slack): `node scripts/audit-visual-health.mjs --json`
3. Present findings organized by severity (HIGH → LOW)
4. Suggest fixes for each HIGH priority issue
5. If score is below 70, flag as needing immediate attention

## Checks Performed
- **Placeholder detection** — finds `blog-hero-aurora.svg` and other generic fallbacks
- **Blog duplicate heroes** — same image in frontmatter AND body content
- **Oversized images** — files >2MB that need optimization
- **Orphaned images** — in registry but not referenced in any code/content

## Score Interpretation
- 90-100: EXCELLENT
- 70-89: GOOD — minor issues
- 50-69: NEEDS ATTENTION
- 0-49: CRITICAL — fix immediately
