# Master SKILL.md Template
**Version**: 1.0.0
**Based on**: [Anthropic Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

---

## Quick Start

Copy this template to create new skills:

```bash
mkdir -p .claude-skills/[category]/[skill-name]/resources
cp SKILL_TEMPLATE.md .claude-skills/[category]/[skill-name]/SKILL.md
```

---

## The Template

```markdown
---
name: [Skill Name in Title Case]
description: [One-line description of what this skill does - be specific and action-oriented]
version: 1.0.0
triggers:
  - [keyword that should activate this skill]
  - [another trigger keyword]
  - [action phrase like "create X" or "debug Y"]
---

# [Skill Name]

## Purpose

[2-3 sentences explaining:
1. What transformation this skill enables
2. Why it matters
3. What problems it solves]

## When to Use This Skill

[Bullet list of 5-7 specific scenarios where this skill applies]

- [Scenario 1]
- [Scenario 2]
- [Scenario 3]
- [Scenario 4]
- [Scenario 5]

## Core Concepts

### [Concept 1 Name]

[Explanation of the first key concept. Include:
- What it is
- Why it matters
- How to apply it]

```[language]
// Code example if applicable
```

### [Concept 2 Name]

[Explanation of the second key concept]

```[language]
// Code example if applicable
```

## Patterns

### Pattern 1: [Pattern Name]

[Description of when and how to use this pattern]

```[language]
// Complete, working code example
// Not "add validation here" - show THE validation
```

### Pattern 2: [Pattern Name]

[Description of when and how to use this pattern]

```[language]
// Complete, working code example
```

## Step-by-Step Process

[For complex skills, provide a checklist Claude can follow]

1. **Step 1**: [Action]
   - [Sub-step]
   - [Sub-step]

2. **Step 2**: [Action]
   - [Sub-step]
   - [Sub-step]

3. **Step 3**: [Action]
   - [Sub-step]
   - [Sub-step]

## FrankX Application

[How this skill specifically applies to the FrankX project/brand]

```[language]
// FrankX-specific example
```

## Anti-Patterns

| Bad Practice | Why It's Bad | Better Approach |
|--------------|--------------|-----------------|
| [Anti-pattern 1] | [Reason] | [Correct approach] |
| [Anti-pattern 2] | [Reason] | [Correct approach] |
| [Anti-pattern 3] | [Reason] | [Correct approach] |

## Quick Commands

```bash
# Command 1 description
[command]

# Command 2 description
[command]
```

## Related Skills

- `[skill-name-1]` - [How it relates]
- `[skill-name-2]` - [How it relates]
- `[skill-name-3]` - [How it relates]

## Resources

[If skill needs >500 lines, put detailed content in resources/]

- `resources/patterns.md` - [What it contains]
- `resources/examples.md` - [What it contains]
- `resources/reference.md` - [What it contains]

---

*Part of Agentic Creator OS - [Skill category tagline]*
```

---

## Success Criteria Checklist

Before marking a skill complete, verify:

### Structure (Required)
- [ ] YAML frontmatter with name, description, version, triggers
- [ ] Total file under 500 lines
- [ ] Clear Purpose section
- [ ] "When to Use" section with specific scenarios
- [ ] At least 2 patterns with code examples

### Quality (Required)
- [ ] Code examples are complete and working
- [ ] No placeholder comments ("add X here")
- [ ] FrankX-specific application included
- [ ] Anti-patterns documented
- [ ] Related skills linked

### Progressive Disclosure (If Needed)
- [ ] resources/ directory for detailed content
- [ ] Each resource file under 500 lines
- [ ] Table of contents in files >100 lines

### Auto-Activation (Recommended)
- [ ] Trigger keywords are specific and unique
- [ ] Description contains searchable terms
- [ ] Tested with 3+ real scenarios

---

## Naming Conventions

### Skill Names (kebab-case)
```
test-driven-development    ✓
testDrivenDevelopment      ✗
TDD                        ✗
test_driven_development    ✗
```

### Trigger Keywords
```
Good triggers:
- "TDD" (acronym)
- "test first"
- "red green refactor"
- "write tests before code"

Bad triggers:
- "testing" (too generic)
- "code" (too generic)
- "development" (too generic)
```

---

## Quality Levels

### ★★★★★ Expert (Target)
- Comprehensive patterns
- Working code examples
- Auto-activation tested
- Resources for deep dives
- FrankX-specific guidance
- Community-shareable quality

### ★★★★☆ Advanced
- All required sections
- Multiple patterns
- Good examples
- Some resources

### ★★★☆☆ Competent
- Core functionality
- Basic examples
- Meets structure requirements

### ★★☆☆☆ Developing
- Basic structure
- Limited examples
- Needs improvement

### ★☆☆☆☆ Basic
- Minimal viable skill
- Placeholder content
- Not production-ready

---

## Common Mistakes

### 1. Too Long
```
❌ SKILL.md: 1200 lines
✓ SKILL.md: 350 lines + resources/patterns.md: 400 lines
```

### 2. Vague Triggers
```
❌ triggers: ["code", "development", "build"]
✓ triggers: ["TDD", "test first", "red green refactor"]
```

### 3. Incomplete Examples
```
❌ // Add validation logic here
✓ if (!email.includes('@')) throw new Error('Invalid email');
```

### 4. Missing FrankX Context
```
❌ Generic React patterns
✓ FrankX glassmorphic React patterns with aurora gradients
```

### 5. No Related Skills
```
❌ (No related skills section)
✓ Related: test-driven-development, systematic-debugging
```

---

## Testing Your Skill

### Manual Test
1. Start new Claude Code session
2. Describe a task that should trigger your skill
3. Verify skill auto-activates (or manually invoke)
4. Check Claude uses the patterns correctly
5. Note any improvements needed

### Checklist Test
```
[ ] Skill loads without errors
[ ] Triggers activate as expected
[ ] Code examples are syntactically correct
[ ] FrankX voice is maintained
[ ] Related skills are accessible
```

---

*Good skills are invisible - Claude just becomes better at specific tasks without the user thinking about "skills."*
