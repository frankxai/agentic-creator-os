---
description: Comprehensive FrankX.AI website build session - plan, create, review, deploy
thinking: false
---

# FrankX.AI Build Session

**Purpose**: Complete website build cycle from planning to deployment

## Build Session Flow

```
PLAN → CREATE → REVIEW → DEPLOY → LOG
```

## Step 1: Plan (5-10 min)

### What are we building today?

| Build Type | Primary Command | Est. Time |
|------------|-----------------|-----------|
| New Article | `/frankx-ai-blog` | 2-3h |
| New Component | `/frankx-ai-components` | 1-2h |
| Product Update | `/frankx-ai-products` | 1-2h |
| Prompt Addition | `/frankx-ai-prompts` | 30m |
| SEO Optimization | `/frankx-ai-seo` | 1h |
| Site Improvements | `/frankx-best-website` | 2h+ |
| Bug Fixes | Standard dev | 30m-2h |

### Quick Health Check

```bash
# Current state
git status

# Any build issues?
npm run build

# What's in progress?
cat docs/DAILY_INTELLIGENCE_OPERATIONS.md | tail -50
```

### Priority Selection

Check these sources for today's priority:
1. `/docs/CONTENT_ROADMAP.md` - Editorial calendar
2. `/docs/PRODUCT_ORG_BLUEPRINT.md` - Product priorities
3. Git issues/PRs - Open items
4. Previous day's log - Continuity

## Step 2: Create

### Agent Selection

Based on build type, activate appropriate agent(s):

| Build | Lead Agent | Supporting |
|-------|------------|------------|
| Content | Creation Engine | Technical Translator |
| Technical | Technical Translator | - |
| Music | Frequency Alchemist | Creation Engine |
| Strategy | Soul Strategist | Creation Engine |

### Skill Invocation

```
/skill frankx-brand           # Voice consistency
/skill ui-ux-design-expert    # Design decisions
/skill suno-prompt-architect  # Music content
/skill frontend-design:frontend-design  # Components
```

### Build Commands

Execute the appropriate command for your focus:
- `/frankx-ai-blog` - Article creation
- `/frankx-ai-components` - UI development
- `/frankx-ai-products` - Product pages
- `/frankx-ai-prompts` - Prompt library
- `/frankx-ai-agents` - Agent-powered content

## Step 3: Review

### Self-Review Checklist

**Content Quality**
- [ ] Voice is authentic FrankX
- [ ] No generic AI patterns
- [ ] Specific examples included
- [ ] Transformation value clear

**Technical Quality**
- [ ] TypeScript strict compliance
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Accessible (WCAG 2.1 AA)

**SEO Quality**
- [ ] Metadata complete
- [ ] Internal links added
- [ ] Keywords placed naturally
- [ ] Images have alt text

### Build Verification

```bash
# Lint check
npm run lint

# Type check
npx tsc --noEmit

# Full build
npm run build

# Local preview
npm run dev
```

### Agent Review (Optional)

For significant changes, invoke code review:
```
Task({
  subagent_type: "pr-review-toolkit:code-reviewer",
  prompt: "Review recent changes for quality and FrankX standards"
})
```

## Step 4: Deploy

### Pre-Deploy Checklist

- [ ] Build passes locally
- [ ] Content generated (RSS, search index)
- [ ] Changes tested locally
- [ ] Commit message meaningful

### Deploy Flow

```bash
# Generate static assets
npm run gen:feed
npm run gen:search

# Commit changes
git add .
git commit -m "feat(scope): description

Details of changes.

[Generated with Claude Code]"

# Deploy
git push origin main  # Direct deploy
# or
git push -u origin feature-branch && gh pr create  # PR flow
```

### Post-Deploy Verification

- [ ] Site loads at frankx.ai
- [ ] Changed pages work
- [ ] No console errors
- [ ] Forms functional

## Step 5: Log

### Update Daily Operations

Add to `/docs/DAILY_INTELLIGENCE_OPERATIONS.md`:

```markdown
**YYYY-MM-DD**

- **Build Focus**: [What you worked on]
- **Shipped**:
  - [Item 1]
  - [Item 2]
- **Agent(s)**: [Which agents led]
- **Metrics**: [Any measurable impact]
- **Tomorrow**: [Next priority]
```

### Content Pipeline Update

If content created:
- [ ] Blog ready? Update `/docs/CONTENT_ROADMAP.md`
- [ ] Social needed? Queue `/generate-social`
- [ ] Images needed? Queue `/generate-images`

## Quick Build Session

For rapid iterations:

```bash
# 1. Quick check
git status && npm run build

# 2. Make changes
# ... edit files ...

# 3. Verify
npm run lint && npm run build

# 4. Ship
git add . && git commit -m "chore: quick update" && git push

# 5. Log (optional)
echo "**$(date +%Y-%m-%d)** - Quick update: [description]" >> docs/DAILY_INTELLIGENCE_OPERATIONS.md
```

## Extended Build Session

For major work:

1. **Morning Block** (2-3h)
   - Deep creation work
   - New content or features
   - Agent collaboration

2. **Afternoon Block** (1-2h)
   - Review and polish
   - Testing and fixes
   - Deploy and document

3. **Close** (15m)
   - Log progress
   - Set tomorrow's priority

## Build Metrics

Track over time:
- Articles published per week
- Components created
- Prompts added
- Commits shipped
- Time from idea to deploy

**Ready to build. What's today's focus?**
