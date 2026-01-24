# Daily Creator Operations Template

Template for `.creator-hub/workflows/daily-ops.md` — personalized daily workflow.

---

## File Template

```markdown
# Daily Creator Operations

## Morning Ritual (15 min)

### 1. Load Context
```bash
cat .creator-hub/STATE.md
```

**Check:**
- [ ] Where did I stop last session?
- [ ] What's blocking me?
- [ ] What's today's focus?

### 2. Review Calendar
- What content is due today?
- Any deadlines approaching?
- Scheduled publishing times?

### 3. Clear the Deck
- Process pending ideas (keep/archive/trash)
- Review blockers (resolved?)
- Update STATE.md if needed

---

## Creation Block ([TIME] - Focus Time)

Based on your primary workflow: **[PRIMARY_WORKFLOW]**

### Today's Creation Priority

**Main Task**: [From STATE.md Today's Focus]

**Creation Mode:**
- [ ] Research phase → Gather sources
- [ ] Draft phase → Write/create
- [ ] Edit phase → Refine
- [ ] Publish phase → Ship it

### Quality Check Before Moving On
- [ ] Does this meet my standards?
- [ ] Is it on-brand (check HUB.md constraints)?
- [ ] Would I be proud to share this?

---

## Distribution Block (30 min)

### 1. Publish Ready Content
- [ ] Main content published to primary platform
- [ ] Cross-posted where appropriate

### 2. Create Social Versions
**From today's main content:**

- **Twitter/X**: [Key insight in <280 chars]
- **LinkedIn**: [Professional angle, 3 paragraphs]
- **[Other platforms]**: [Platform-specific version]

### 3. Engage
- [ ] Respond to comments on recent posts
- [ ] Engage with audience questions
- [ ] Thank shares/mentions

---

## Capture Block (10 min)

### 1. Log Ideas
Any ideas captured today? Add to STATE.md:
```markdown
### Pending Ideas
- [New idea from today]
```

### 2. Update STATE.md
```markdown
Last activity: [TODAY] — [What you accomplished]
Progress: [Update progress bar]

## Session Continuity
Last session: [NOW]
Stopped at: [What you finished]
Resume from: [Next action]
```

### 3. Set Tomorrow's Focus
What's the ONE thing for tomorrow?

---

## Weekly Review (Friday, 30 min)

### Metrics Check
- Content pieces published this week: [N]
- Social engagement: [Up/Down/Stable]
- Newsletter growth: [+N subscribers]
- Revenue: [$N]

### What Worked
- [Win 1]
- [Win 2]

### What Didn't
- [Challenge 1]
- [Challenge 2]

### Next Week's Focus
- [ ] Priority 1
- [ ] Priority 2
- [ ] Priority 3

### Update HUB.md if Needed
- Any key decisions to log?
- Project status changes?
- New tools/platforms added?

---

## Quick Commands

| Task | Command |
|------|---------|
| Check state | `cat .creator-hub/STATE.md` |
| Start content | `/acos:create [type]` |
| Distribute | `/acos:distribute` |
| Review week | `/acos:weekly-review` |
| Update state | `/acos:update-state` |

---

## Context Quality Monitor

If Claude seems confused or quality degrades:

```
Context Fill Check:
├── 0-30%: Peak zone ✓
├── 30-50%: Good, continue
├── 50-70%: Consider splitting
└── 70%+: Start fresh session
```

**Signs of context degradation:**
- Repeating information unnecessarily
- Missing recent context
- Inconsistent with earlier decisions
- Generic responses

**Fix:** Start a fresh session, read STATE.md first.

---

*Personalized for: [CREATOR_NAME]*
*Primary workflow: [PRIMARY_WORKFLOW]*
*Generated: [DATE]*
```

---

## Customization Rules

When generating daily-ops.md, customize based on:

### By Primary Workflow

**If Blog Writer:**
```markdown
## Creation Block (2-3 hours)
1. Research phase (30 min)
2. Outline (15 min)
3. Draft (90 min)
4. Edit (30 min)
5. Publish
```

**If Music Producer:**
```markdown
## Creation Block (2-3 hours)
1. Session intention (5 min)
2. Sound exploration (30 min)
3. Production (90 min)
4. Mix review (30 min)
5. Export/distribute
```

**If Course Creator:**
```markdown
## Creation Block (2-3 hours)
1. Module outline (20 min)
2. Content creation (60 min)
3. Exercise design (30 min)
4. Recording/writing (60 min)
5. Quality check
```

### By Content Cadence

**Daily Publisher:**
- Morning: Create
- Afternoon: Distribute
- Evening: Engage

**Weekly Publisher:**
- Mon-Wed: Research & draft
- Thu: Edit & finalize
- Fri: Publish & distribute

**Monthly Publisher:**
- Week 1: Research
- Week 2: Create
- Week 3: Edit
- Week 4: Publish & promote

---

## Integration with STATE.md

Daily-ops updates STATE.md at:
- Session start (read)
- After main creation (update progress)
- After distribution (log activity)
- Session end (continuity info)

---

*Creator Hub Generator - Part of Agentic Creator OS v4*
