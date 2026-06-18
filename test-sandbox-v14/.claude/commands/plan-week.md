# /plan-week - Weekly Content Planning

**ACOS Strategic Planning - Align creation with goals**

## Workflow Overview

```
╔═══════════════════════════════════════════════════════════════════╗
║                    WEEKLY PLANNING SESSION                         ║
║              "Strategic Creation, Not Reactive Chaos"              ║
╠═══════════════════════════════════════════════════════════════════╣
║  Review → Prioritize → Schedule → Set Goals → Track Progress       ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Step 1: Review Current State

### Check Inventories
```bash
# Music inventory count
cat data/inventories/frankx/music.json | jq '._count'

# Blog inventory count
cat data/inventories/frankx/blog-articles.json | jq '._count'

# In-progress items
cat data/inventories/creation-pipeline.json | jq '.inProgress.items'
```

### Review Last Week
- What got published?
- What got blocked?
- What performed well?

## Step 2: Review Content Backlog

**Check prioritized ideas:**

```bash
# High priority backlog items
cat data/inventories/creation-pipeline.json | jq '.contentBacklog | to_entries | .[] | .value | map(select(.priority == "high"))'
```

**Backlog Categories:**
| Type | High Priority Items |
|------|---------------------|
| 🎵 Music | Meditation Series (7 tracks), Vibe OS Sample Pack |
| 📝 Articles | Suno Prompt Guide, Enterprise AI Patterns |
| 🎬 Videos | Suno Mastery Tutorial |
| 📦 Products | Suno Prompt Library Pack |
| 🌐 Websites | AI Architect Academy Portal |

## Step 3: Prioritize for the Week

**Selection Criteria:**
1. **Revenue Impact**: Does it directly generate income?
2. **Audience Growth**: Does it attract new followers?
3. **Brand Building**: Does it establish authority?
4. **Personal Energy**: Am I excited about this?
5. **Dependencies**: What's blocking what?

**Weekly Capacity:**
- 1-2 Articles (high effort)
- 3-5 Music tracks (medium effort)
- Daily social posts (low effort)
- 1 Major project milestone

## Step 4: Create Weekly Plan

Update the creation-pipeline.json:

```json
{
  "thisWeek": {
    "_description": "Planned for this week",
    "items": [
      {
        "id": "backlog-music-001",
        "type": "music",
        "title": "Soulbook Energy Meditation",
        "targetDate": "2026-01-25",
        "priority": 1
      },
      {
        "id": "backlog-article-001",
        "type": "article",
        "title": "Complete Suno Prompt Engineering Guide",
        "targetDate": "2026-01-27",
        "priority": 2
      }
    ]
  }
}
```

## Step 5: Set Success Metrics

**Define what "done" looks like:**

| Goal | Metric | Target |
|------|--------|--------|
| Music Published | Tracks on Suno | 3 |
| Articles Published | Live on frankx.ai | 1 |
| Social Engagement | LinkedIn impressions | 1000 |
| Product Progress | % complete | 25% |

## Step 6: Block Time

**Recommended Creative Blocks:**

| Day | Morning (High Energy) | Afternoon | Evening |
|-----|----------------------|-----------|---------|
| Mon | 🎵 Music creation | 📝 Writing | Social |
| Tue | 📝 Deep writing | Research | Social |
| Wed | 🎵 Music creation | 📦 Product work | Social |
| Thu | 📝 Deep writing | Research | Social |
| Fri | 📦 Product work | Review & polish | Ship! |

## Quick Commands

After planning, execute with:
- `/create-music` - Start a music creation session
- `/create-article` - Start an article creation session
- `/inventory-status` - Check all inventory counts
- `/deploy` - Push completed work to production

## Weekly Review Questions

At end of week, reflect:
1. What got shipped?
2. What got blocked?
3. What surprised me?
4. What should I do more of?
5. What should I stop doing?

## Integration with Creation Pipeline

The planning session should update:

```json
// data/inventories/creation-pipeline.json

{
  "thisWeek": {
    "items": [/* Selected items for this week */]
  },
  "inProgress": {
    "items": [/* Currently being worked on */]
  }
}
```

## Sample Weekly Plan

```markdown
## Week of Jan 23-29, 2026

### 🎯 Focus: Suno Content + Product Launch Prep

### Must Ship
- [ ] Soulbook Energy Meditation track
- [ ] Suno Prompt Engineering Guide (article)
- [ ] 5 LinkedIn posts

### Should Ship
- [ ] Soulbook Mind Meditation track
- [ ] Update music inventory with recent tracks

### Could Ship
- [ ] Arcanea soundtrack track
- [ ] Video outline for Suno Mastery

### Blockers
- Need to export 466 more Suno track URLs
```

---

*Consult the Soul Strategist for purpose-aligned planning.*
