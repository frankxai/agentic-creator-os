---
description: Deploy FrankX.AI website changes to Vercel with quality checks
thinking: false
---

# FrankX.AI Deployment System

**Host**: Vercel
**Repo**: github.com/frankxai/frankx.ai-vercel-website
**Main Branch**: `main` (auto-deploys to production)

## Pre-Deployment Checklist

### Code Quality

```bash
# Lint check
npm run lint

# Type check
npx tsc --noEmit

# Build verification
npm run build
```

### Content Generation

```bash
# Regenerate RSS feed
npm run gen:feed

# Regenerate search index
npm run gen:search

# Regenerate HTML reading versions
npm run gen:html
```

### Visual Check (if Playwright MCP available)

1. Capture screenshots of changed pages
2. Compare with previous version
3. Check mobile responsiveness

## Deployment Workflow

### Option 1: Direct to Main (Small Changes)

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "type(scope): description

Details of what changed and why.

[Generated with Claude Code]"

# Push to main (triggers Vercel deploy)
git push origin main
```

### Option 2: Preview Branch (Larger Changes)

```bash
# Create feature branch
git checkout -b feat/feature-name

# Make changes and commit
git add .
git commit -m "feat(scope): description"

# Push to create preview
git push -u origin feat/feature-name

# Create PR via GitHub MCP or CLI
gh pr create --title "Feature Name" --body "Description"
```

### Option 3: Current Branch Workflow

```bash
# Check current branch status
git status

# See what's changed
git diff

# Commit current work
git add .
git commit -m "$(cat <<'EOF'
fix(messaging): Update value propositions

- Refined hero messaging
- Updated CTA language
- Improved mobile layout

[Generated with Claude Code]
EOF
)"

# If on feature branch, create PR
gh pr create --fill
```

## Post-Deployment Verification

### Immediate Checks (5 min)
- [ ] Site loads at frankx.ai
- [ ] No console errors
- [ ] Key pages accessible
- [ ] Forms working (newsletter signup)

### SEO Checks (if content changed)
- [ ] RSS feed updated
- [ ] Sitemap accurate
- [ ] New pages indexable

### Performance (if Vercel MCP available)
- [ ] Lighthouse scores maintained
- [ ] Core Web Vitals green

## Rollback Procedure

If issues detected:

```bash
# View recent commits
git log --oneline -10

# Revert specific commit
git revert <commit-hash>
git push

# Or reset to previous state (caution)
git reset --hard HEAD~1
git push --force-with-lease
```

## Environment Variables

Critical env vars (in Vercel dashboard, not committed):
- `NOTION_API_KEY` - Notion integration
- `PLAUSIBLE_DOMAIN` - Analytics
- (Add others as needed)

## Deployment Notes

### Vercel Configuration

- Auto-deploy on push to `main`
- Preview deploys on PR branches
- Production URL: frankx.ai
- Preview URL pattern: `*-frankx-projects.vercel.app`

### Build Settings

From `next.config.mjs`:
- Console removal in production
- Image optimization enabled
- MDX support configured

## Quick Deploy Commands

```bash
# Full deploy cycle (most common)
npm run build && git add . && git commit -m "chore: updates" && git push

# Just deploy current changes
git add . && git commit -m "chore: quick update" && git push
```

**Ready to deploy. Run quality checks first or proceed directly?**
