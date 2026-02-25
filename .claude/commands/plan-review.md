# /plan-review — Review All Initiatives

Review all plan initiatives, surface blockers, and suggest priority adjustments.

## What This Does

1. Read `lib/plan/initiatives.ts` and load all initiatives
2. Generate a comprehensive status report:
   - **Active initiatives**: What's in-progress, what percentage done
   - **Blocked items**: Tasks with `blocked` status or initiatives with unmet dependencies
   - **Priority suggestions**: Based on progress, deadlines, and dependencies
   - **Stale initiatives**: Anything not updated in 7+ days
   - **Next actions**: Recommended next steps for each active initiative
3. Show agent activity summary (most recent comments)
4. Output a formatted markdown report

## Report Format

```markdown
## Plan Review — [Date]

### Active Now (N)
| Initiative | Progress | Lead | Last Updated |
|...

### Blocked / At Risk
- [Initiative]: [Reason]

### Priority Recommendations
- Consider elevating [X] — [reason]
- Consider deferring [Y] — [reason]

### Stale (7+ days)
- [Initiative]: Last updated [date]

### Next Actions
1. [Most impactful next step]
2. [Second priority]
3. [Third priority]

### Agent Activity (Last 5)
- AGENT: "Comment" — Initiative (time ago)
```

## No Arguments Required

This command reviews all initiatives automatically.

$ARGUMENTS
