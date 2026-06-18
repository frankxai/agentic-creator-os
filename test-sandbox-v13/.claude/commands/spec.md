---
name: spec
description: Spec-driven development workflow - Requirements → Design → Tasks → Implementation
---

# /spec - Spec-Driven Development Command

> **Based on:** [Pimzino/claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow) + [MADR](https://github.com/adr/madr) + [joelparkerhenderson ADRs](https://github.com/joelparkerhenderson/architecture-decision-record)

## Overview

This command implements a complete spec-driven development workflow that automatically flows into `/planning-with-files` for execution.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SPEC → PLAN → BUILD FLOW                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  /spec                                                              │
│    │                                                                │
│    ├─► 1. REQUIREMENTS                                              │
│    │      └─► User stories, acceptance criteria                     │
│    │                                                                │
│    ├─► 2. DESIGN                                                    │
│    │      └─► Architecture, file changes, data structures           │
│    │                                                                │
│    ├─► 3. TASKS                                                     │
│    │      └─► Atomic task breakdown with estimates                  │
│    │                                                                │
│    └─► 4. AUTO-INVOKE /planning-with-files                          │
│           └─► Creates task_plan.md, findings.md, current_status.md  │
│           └─► Execution begins                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Usage

```bash
# Create a new feature spec
/spec new-feature "Add user authentication"

# Create a spec for improvement
/spec improve "Blog search performance"

# Create a spec for a fix
/spec fix "Mobile navigation bug"

# Create a spec for refactoring
/spec refactor "Consolidate navigation components"
```

## The Workflow

### Phase 1: Requirements Gathering

Claude will:
1. Ask clarifying questions about the feature
2. Generate user stories with acceptance criteria
3. Define success metrics
4. Identify constraints and dependencies

**Output:** `docs/specs/SPEC-XXX-[name]/requirements.md`

### Phase 2: Technical Design

Claude will:
1. Research relevant codebase areas
2. Document architecture decisions (MADR format)
3. List files to create/modify
4. Define data structures and APIs

**Output:** `docs/specs/SPEC-XXX-[name]/design.md`

### Phase 3: Task Breakdown

Claude will:
1. Break work into atomic tasks (max 2h each)
2. Define task dependencies
3. Create acceptance criteria per task
4. Estimate complexity

**Output:** `docs/specs/SPEC-XXX-[name]/tasks.md`

### Phase 4: Auto-Invoke Planning

After spec approval, Claude automatically:
1. Invokes `/planning-with-files`
2. Creates `task_plan.md` from spec tasks
3. Creates `findings.md` from research
4. Creates `current_status.md` for tracking
5. Begins implementation

---

## Spec Directory Structure

```
docs/specs/
├── SPEC_TEMPLATE.md           # Template reference
├── SPEC-001-brand-cleanup/
│   ├── requirements.md        # User stories, acceptance criteria
│   ├── design.md              # Architecture, MADR decisions
│   ├── tasks.md               # Atomic task breakdown
│   └── status.md              # Execution tracking
├── SPEC-002-page-quality/
│   └── ...
└── ...
```

---

## Steering Documents (Project Context)

The spec system uses three steering documents for context:

### 1. Product Context (`CLAUDE.md`)
Already exists - contains brand positioning, agent profiles, content standards

### 2. Tech Context (`package.json` + `tsconfig.json`)
Already exists - defines stack, tools, constraints

### 3. Structure Context (`docs/ARCHITECTURE.md`)
Already exists - file organization, patterns, conventions

---

## Template: Requirements Document

```markdown
# SPEC-XXX: [Feature Name] - Requirements

## Problem Statement
[What problem are we solving? Why does it matter?]

## User Stories

### Story 1: [User Role] wants to [action]
**As a** [user type]
**I want** [capability]
**So that** [benefit]

**Acceptance Criteria:**
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]

### Story 2: ...

## Success Metrics
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

## Constraints
- [Technical constraint]
- [Business constraint]
- [Timeline constraint]

## Dependencies
- [Prerequisite 1]
- [Prerequisite 2]
```

---

## Template: Design Document (MADR Format)

```markdown
# SPEC-XXX: [Feature Name] - Design

## Status
Proposed | Accepted | Deprecated | Superseded

## Context
[Describe the situation and problem]

## Decision Drivers
- [Driver 1: e.g., performance requirement]
- [Driver 2: e.g., maintainability]
- [Driver 3: e.g., team familiarity]

## Considered Options
1. [Option 1]
2. [Option 2]
3. [Option 3]

## Decision Outcome
Chosen option: "[Option X]" because [justification]

### Consequences
**Good:**
- [Positive consequence 1]
- [Positive consequence 2]

**Bad:**
- [Negative consequence 1]
- [Mitigation strategy]

## Technical Specification

### Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| `path/file.tsx` | Create | New component |
| `path/existing.tsx` | Modify | Add feature X |

### Data Structures
\`\`\`typescript
interface Example {
  id: string;
  name: string;
}
\`\`\`

### API Changes
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/example` | POST | Create example |
```

---

## Template: Tasks Document

```markdown
# SPEC-XXX: [Feature Name] - Tasks

## Task Overview
| ID | Task | Estimate | Depends On | Status |
|----|------|----------|------------|--------|
| T1 | [Task name] | 1h | - | 🔲 |
| T2 | [Task name] | 2h | T1 | 🔲 |
| T3 | [Task name] | 1h | T1 | 🔲 |

## Task Details

### T1: [Task Name]
**Description:** [What needs to be done]
**Files:** `path/to/file.tsx`
**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### T2: [Task Name]
...

## Quality Gates
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Tests pass (if applicable)
- [ ] Manual verification
```

---

## Integration with /planning-with-files

After spec creation and approval, `/spec` automatically invokes `/planning-with-files`:

```
/spec creates:
├── docs/specs/SPEC-XXX-name/
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md

/planning-with-files creates:
├── task_plan.md      ← Generated from tasks.md
├── findings.md       ← Generated from design research
└── current_status.md ← Live execution tracking
```

**The handoff is automatic.** Once you approve the spec, Claude begins execution using the planning-with-files workflow.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/spec [type] "description"` | Create new spec |
| `/spec status` | Check spec progress |
| `/spec list` | List all specs |
| `/planning-with-files` | Manual planning mode |

---

## Sources & Attribution

This workflow is adapted from:
- [Pimzino/claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow) - Claude Code spec system
- [adr/madr](https://github.com/adr/madr) - Markdown ADR format
- [joelparkerhenderson/architecture-decision-record](https://github.com/joelparkerhenderson/architecture-decision-record) - ADR best practices
- [Pragmatic Engineer RFC Guide](https://newsletter.pragmaticengineer.com/p/software-engineering-rfc-and-design) - Industry patterns

---

## Instructions for Claude

When `/spec` is invoked:

1. **Parse the command type** (new-feature, improve, fix, refactor)

2. **Gather requirements:**
   - Ask 3-5 clarifying questions
   - Research relevant codebase areas
   - Generate user stories with acceptance criteria

3. **Create design document:**
   - Use MADR format for decisions
   - List all files to create/modify
   - Define data structures and APIs

4. **Break into atomic tasks:**
   - Each task ≤2 hours
   - Clear dependencies
   - Specific acceptance criteria

5. **Save spec to** `docs/specs/SPEC-XXX-[slug]/`

6. **Ask for approval**

7. **On approval, automatically invoke `/planning-with-files`:**
   - Generate task_plan.md from tasks.md
   - Generate findings.md from design research
   - Begin execution

8. **Track progress** in spec status.md and current_status.md
