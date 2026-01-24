# Creator State Template

Template for `.creator-hub/STATE.md` — the creator's living memory.

---

## File Template

```markdown
# Creator State

## Hub Reference

See: .creator-hub/HUB.md (updated [YYYY-MM-DD])

**Creator identity:** [One-liner from HUB.md]
**Current focus:** [Active project or content piece]

## Current Position

Project: [Project name or "General creation"]
Task: [Current task] of [Total tasks] in [workflow/project]
Status: [Planning / Creating / Publishing / Complete]
Last activity: [YYYY-MM-DD] — [What happened]

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**This Week:**
- Content pieces published: [N]
- Social posts: [N]
- Newsletter issues: [N]
- Products shipped: [N]

**Streak:**
- Current: [N] days consecutive creation
- Best: [N] days

*Updated after each publishing action*

## Accumulated Context

### Recent Decisions

- [YYYY-MM-DD]: [Decision summary]
- [YYYY-MM-DD]: [Decision summary]

(Full decision log in HUB.md Key Decisions table)

### Pending Ideas

- [Idea captured during session]
- [Another idea]
- [Topic to explore]

### Blockers/Concerns

- [Issue affecting current work]
- [Dependency waiting on]

## Session Continuity

Last session: [YYYY-MM-DD HH:MM]
Stopped at: [Description of last completed action]
Resume from: [Specific next action or "Fresh start"]

## Today's Focus

**Primary:** [One main thing to accomplish]
**Secondary:** [If time permits]
**Avoid:** [What NOT to work on today]
```

---

## Purpose

STATE.md is your **short-term memory** spanning all sessions.

**Problem it solves:** Information is captured in conversations, notes, and decisions but not systematically consumed. Sessions start without context. Claude doesn't remember where you left off.

**Solution:** A single, small file that's:
- Read first in every workflow
- Updated after every significant action
- Contains digest of accumulated context
- Enables instant session restoration

## Size Constraint

**Keep STATE.md under 100 lines.**

It's a DIGEST, not an archive. If accumulated context grows too large:
- Keep only 3-5 recent decisions (full log in HUB.md)
- Keep only active blockers, remove resolved ones
- Archive old ideas to a separate file
- Clear completed tasks

The goal is "read once, know where I am" — if it's too long, that fails.

## Lifecycle

### Reading (First Step of Every Workflow)

Claude reads STATE.md to understand:
- What's the current project/task
- What happened last session
- What's blocking or pending
- What to focus on today

### Writing (After Every Significant Action)

Update STATE.md:
- After completing a task
- After making a key decision
- After capturing an idea
- At session end (update "Stopped at")

### Archiving (When STATE.md Gets Full)

When approaching 100 lines:
1. Move old decisions to HUB.md
2. Move completed ideas to an archive
3. Clear resolved blockers
4. Reset progress if project complete

## Context Quality Pattern

From GSD's context engineering principles:

```
Context Quality by Fill %:
┌─────────────────────────────────────────────────────────────┐
│ 100% ─┤ █████████ ← Sweet spot                              │
│  70% ─┤ █████████████████ ← Still good                      │
│  50% ─┤ █████████████████████████ ← Watch for degradation   │
│  30% ─┤ █████████████████████████████████ ← Start splitting │
│   0% ─┴─────────────────────────────────────────────────────│
│       0%        30%        50%        70%       100%        │
└─────────────────────────────────────────────────────────────┘
                  STATE.md Fill %
```

If STATE.md is:
- **0-50%**: Healthy, keep accumulating
- **50-70%**: Archive older content
- **70-100%**: Aggressively prune, you're losing signal

## Example Updates

### After completing a blog post:
```markdown
Last activity: 2026-01-22 — Published "AI for Creators" blog post

Progress: [████████░░] 80%

### Recent Decisions
- 2026-01-22: Focused on practical examples over theory (resonated better in comments)
```

### After a brainstorm session:
```markdown
### Pending Ideas
- Newsletter series on AI music creation
- Tutorial: Claude Code for non-developers
- Product idea: Voice pattern analyzer
```

### At session end:
```markdown
## Session Continuity

Last session: 2026-01-22 14:30
Stopped at: Halfway through newsletter draft, Section 3
Resume from: Complete newsletter Section 3, then publish
```

---

## Relationship to HUB.md

| HUB.md (Stable) | STATE.md (Fluid) |
|-----------------|------------------|
| Updates monthly | Updates daily/hourly |
| Identity & mission | Current position |
| Voice patterns | Today's focus |
| All key decisions | Recent decisions only |
| Project overview | Active task detail |
| Constraints | Blockers/concerns |

Think of it as:
- **HUB.md** = Your passport (who you are)
- **STATE.md** = Your GPS (where you are right now)

---

*Creator Hub Generator - Part of Agentic Creator OS v4*
*Adapted from GSD's STATE.md pattern*
