# ACOS Decision Framework
## Preventing Over-Engineering & Ensuring Quality Decisions

*All ACOS agents MUST load this before proposing structural changes.*

---

## The Prime Directive

**Optimize for OUTCOMES, not impressive-sounding METRICS.**

Bad: "60% route reduction!" (sounds good, may cause damage)
Good: "Users find content in 2 clicks instead of 5" (actual improvement)

---

## Pre-Action Checklist

Before proposing changes to:
- File/folder structure
- URLs/routes
- Architecture
- Workflows
- Configurations

**Complete this checklist:**

```markdown
## Decision Validation

### Problem Definition
- [ ] What SPECIFIC problem are we solving?
- [ ] Who experiences this problem?
- [ ] What's the EVIDENCE? (Not assumption)
- [ ] Is this a real problem or "architecture smell"?

### Solution Evaluation
- [ ] What's the SIMPLEST solution?
- [ ] Can we configure instead of restructure?
- [ ] Can we hide instead of delete?
- [ ] Are we optimizing for users or aesthetics?

### Risk Assessment
- [ ] What could go wrong?
- [ ] Is this reversible?
- [ ] SEO/backlink impact?
- [ ] User confusion risk?

### Approval Gate
- [ ] If irreversible → Get explicit approval
- [ ] If URL change → Justify SEO cost
- [ ] If deletion → Verify no dependencies
```

---

## 3-Tier Decision Routing (from claude-flow)

Not every decision needs deep analysis:

| Tier | When | Action |
|------|------|--------|
| **Tier 1: Auto** | Simple, reversible, low-risk | Execute directly |
| **Tier 2: Validate** | Medium complexity, some risk | Run checklist |
| **Tier 3: Escalate** | Structural, irreversible, high-risk | Get approval |

### Tier 3 Triggers (Always Escalate)
- Deleting files/pages
- Renaming URLs
- Changing architecture
- Modifying production configs
- Affecting SEO or user flows

---

## Anti-Patterns to AVOID

| Bad Instinct | Reality | Better Approach |
|--------------|---------|-----------------|
| "X% reduction" | Metrics ≠ outcomes | Focus on user impact |
| "Cleaner architecture" | May break things | If it works, don't touch |
| "For consistency" | Consistency has costs | Justify the change |
| "Best practice says" | Context matters | What works HERE? |
| "The spec says" | Specs can be wrong | Question everything |
| "Quick fix" | Quick fixes compound | Do it right or flag it |

---

## Structural Change Rules

### NEVER Do Without Approval
1. **Delete** any file with potential dependencies
2. **Rename** any URL that may have external links
3. **Move** content that users might bookmark
4. **Restructure** navigation or information architecture
5. **Modify** production configurations

### ALWAYS Prefer
1. **Configure** over restructure
2. **Hide** over delete
3. **Redirect** over rename
4. **Add** over replace
5. **Minimal** over impressive

---

## The Consolidation Trap

When someone says "consolidate":

**They probably mean:** Fix navigation, reduce clutter, improve UX
**They probably DON'T mean:** Delete files, rename URLs, restructure everything

### Right Way to Consolidate
```
WRONG: Delete 60 routes to have fewer routes
RIGHT: Fix navigation to show 6 clear options (routes stay)

WRONG: Rename /ai-architect to /architect for "shorter URL"
RIGHT: Keep established URLs, they have SEO value

WRONG: Move /soulbook to /resources/soulbook for "organization"
RIGHT: If it's a lead magnet, keep it prominent
```

---

## Consensus Patterns (from claude-flow)

For multi-agent decisions:

| Pattern | When to Use | Threshold |
|---------|-------------|-----------|
| **Majority** | Quick, low-risk decisions | >50% agree |
| **Weighted** | Strategic decisions | Lead agent 3x weight |
| **Supermajority** | Critical/irreversible | 2/3 must agree |

### Drift Prevention
- Frequent checkpoints during long tasks
- Verify alignment with original goal
- Question "scope creep" immediately
- If task changed significantly → re-validate with user

---

## Quality Gates

Before completing any significant task:

```markdown
## Output Validation

### Alignment Check
- [ ] Does this solve the ORIGINAL problem?
- [ ] Did scope creep occur? If yes, flag it.
- [ ] Would Frank approve this approach?

### Risk Check
- [ ] Any irreversible actions taken?
- [ ] Any potential negative side effects?
- [ ] Tested in safe environment first?

### Value Check
- [ ] Does this help users build THEIR system?
- [ ] Is this practical, not just theoretical?
- [ ] Would this be fun to use?
```

---

## Recovery Protocols

If you made a mistake:

1. **STOP** - Don't compound the error
2. **ASSESS** - What was affected?
3. **REVERT** - If possible, undo immediately
4. **REPORT** - Be transparent about what happened
5. **LEARN** - Document in this framework

---

## The Frank Test

Before any major action, ask:

1. **"Does this help someone build their own system?"**
   - If no → Reconsider

2. **"What could go wrong?"**
   - If answer is vague → Think harder

3. **"Is this the simplest solution?"**
   - If no → Find the simpler one

4. **"Would I want to explain this decision?"**
   - If uncomfortable → Don't do it

---

## Learning from Mistakes

This framework exists because of real errors:

### The Route Consolidation Mistake
- Proposed deleting 70+ pages for "60% reduction"
- Would have damaged SEO and confused users
- Solved no real problem
- **Lesson:** "Consolidate" usually means fix nav, not delete pages

### The URL Rename Mistake
- Proposed `/ai-architect` → `/architect` for "cleaner URLs"
- Would have lost SEO value and brand identity
- **Lesson:** Established URLs have value. Don't rename without strong justification.

---

## Integration with claude-flow Patterns

ACOS decision-making aligns with claude-flow's:

- **ReasoningBank:** Learn from successful patterns
- **Byzantine Tolerance:** Tolerate some agent disagreement
- **Hierarchical Consensus:** Lead agent guides, but validates
- **Anti-Drift:** Frequent checkpoints prevent goal divergence

---

*This framework is mandatory for all structural decisions. Skip it at your own risk.*

*Created: 2026-01-30 | Sources: claude-flow, FrankX learnings*
