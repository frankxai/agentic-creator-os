# Deviation Rules for Autonomous Execution

When AI executes tasks, it WILL discover work not in the plan. These rules govern how to handle deviations.

---

## The Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVIATION DECISION TREE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Is it a BUG?                                               │
│  ├── YES → RULE 1: Auto-fix, track for summary              │
│  └── NO ↓                                                    │
│                                                              │
│  Is it MISSING CRITICAL functionality?                       │
│  (Security, validation, error handling)                      │
│  ├── YES → RULE 2: Auto-add, track for summary              │
│  └── NO ↓                                                    │
│                                                              │
│  Is it BLOCKING current task?                                │
│  (Dependency, import, config)                                │
│  ├── YES → RULE 3: Auto-fix, track for summary              │
│  └── NO ↓                                                    │
│                                                              │
│  Is it an ARCHITECTURAL change?                              │
│  (New systems, breaking changes, major refactors)            │
│  ├── YES → RULE 4: STOP, return checkpoint, ask user        │
│  └── NO → Continue task                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Rule 1: Bug Fixes (Auto-Fix)

**Definition**: Code that doesn't work as intended.

**Examples**:
- Syntax errors
- Logic errors
- Typos in variable names
- Missing imports
- Broken references

**Action**: Fix immediately. Track in summary.

**Template**:
```markdown
### Deviations Handled
- **Bug fixed**: [description] — [how fixed]
```

---

## Rule 2: Critical Missing Functionality (Auto-Add)

**Definition**: Security, validation, or error handling that should exist.

**Examples**:
- Missing input validation
- No error handling on API calls
- Security vulnerabilities (XSS, injection)
- Missing null checks
- Unhandled edge cases

**Action**: Add immediately. Track in summary.

**Template**:
```markdown
### Deviations Handled
- **Critical added**: [what] — [why necessary]
```

---

## Rule 3: Blocking Issues (Auto-Fix)

**Definition**: Something preventing task completion.

**Examples**:
- Missing dependency
- Incorrect import path
- Config value needed
- Environment variable missing
- Type mismatch

**Action**: Fix the blocker. Track in summary.

**Template**:
```markdown
### Deviations Handled
- **Blocker resolved**: [what blocked] — [how resolved]
```

---

## Rule 4: Architectural Changes (STOP & Ask)

**Definition**: Changes that alter system structure or have wide impact.

**Examples**:
- New database tables
- New services or modules
- Breaking API changes
- Major refactors
- New third-party integrations
- Significant UX changes

**Action**: STOP execution. Present checkpoint to user.

**Checkpoint Format**:
```markdown
## Architectural Decision Required

**Context**: While working on [task], I discovered [situation].

**Impact**: This would require [architectural change].

**Options**:
1. **Proceed with change**: [implications]
2. **Alternative approach**: [different solution]
3. **Skip for now**: [what gets deferred]

**Recommendation**: [which option and why]

Please choose an option to continue.
```

---

## Tracking Deviations

Every execution summary should include:

```markdown
## Execution Summary

### Tasks Completed
- [Task 1]
- [Task 2]

### Deviations Handled
- **Bug fixed**: Corrected typo in function name `getUsrData` → `getUserData`
- **Critical added**: Added input validation to email field
- **Blocker resolved**: Installed missing `zod` dependency

### User Decisions Pending
- [None / List if Rule 4 triggered]
```

---

## Why This Matters

**Without deviation rules**:
- AI asks permission for everything (slow)
- OR AI changes everything without telling you (dangerous)

**With deviation rules**:
- Bugs, critical gaps, and blockers fixed automatically
- Architectural decisions preserved for human judgment
- Clear audit trail of what changed and why

---

## For Content Creators

Deviation rules apply beyond code:

| Deviation Type | Content Example | Action |
|---------------|-----------------|--------|
| Bug | Broken link, typo | Auto-fix |
| Critical | Missing CTA, no SEO | Auto-add |
| Blocker | Missing image, dead reference | Auto-fix |
| Architectural | Change article structure, new section | Ask first |

---

*Adapted from GSD's deviation rules*
*Creator Hub Generator - Part of Agentic Creator OS v4*
