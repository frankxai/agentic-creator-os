# Skills Guide

Skills are the foundational building blocks of Agentic Creator OS. They provide domain-specific knowledge that enhances Claude's capabilities for particular tasks.

## What Are Skills?

A skill is a focused knowledge module containing:
- **Metadata**: Name, triggers, version
- **Instructions**: Step-by-step guidance
- **Examples**: Working code and patterns
- **Resources**: Extended content (on-demand)

## Progressive Disclosure Architecture

Skills use a three-tier loading system to optimize context usage:

```
┌─────────────────────────────────────────────────────────────────┐
│                     PROGRESSIVE DISCLOSURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Level 1: METADATA (~100 tokens)                                 │
│  ┌────────────────────────────────────────┐                     │
│  │ name: content-strategy                  │                     │
│  │ triggers: ["content", "calendar"]       │                     │
│  │ version: 1.2.0                          │                     │
│  └────────────────────────────────────────┘                     │
│         ↓ "Is this relevant?"                                    │
│                                                                  │
│  Level 2: INSTRUCTIONS (<5k tokens)                              │
│  ┌────────────────────────────────────────┐                     │
│  │ # Content Strategy Skill                │                     │
│  │ ## When to Use                          │                     │
│  │ ## Core Patterns                        │                     │
│  │ ## Examples                             │                     │
│  └────────────────────────────────────────┘                     │
│         ↓ "How do I do this?"                                    │
│                                                                  │
│  Level 3: RESOURCES (on-demand)                                  │
│  ┌────────────────────────────────────────┐                     │
│  │ resources/pillar-framework.md           │                     │
│  │ resources/seo-checklist.md              │                     │
│  │ resources/templates/                    │                     │
│  └────────────────────────────────────────┘                     │
│         ↓ "Give me the details"                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Skill Categories

### Technical Skills (18)

| Skill | Purpose |
|-------|---------|
| `test-driven-development` | TDD methodology and testing patterns |
| `systematic-debugging` | Structured debugging approach |
| `mcp-architecture` | Model Context Protocol design |
| `react-nextjs-patterns` | React and Next.js best practices |
| `shadcn-ui-patterns` | shadcn/ui component patterns |
| `security-auditor` | Security analysis and fixes |
| `webapp-testing` | End-to-end testing strategies |
| `parallel-agents` | Multi-agent coordination |
| `implementation-planning` | Breaking down complex tasks |
| `ai-architecture-patterns` | Enterprise AI design |

### Creative Skills (8)

| Skill | Purpose |
|-------|---------|
| `content-strategy` | Strategic content planning |
| `frankx-brand` | Brand voice and identity |
| `suno-ai-mastery` | AI music production with Suno |
| `suno-prompt-architect` | Crafting effective music prompts |
| `golden-age-book-writing` | Book authoring methodology |
| `frankx-content` | Content creation workflows |

### Business Skills (2)

| Skill | Purpose |
|-------|---------|
| `oci-services-expert` | Oracle Cloud Infrastructure |
| `oracle-database-expert` | Oracle database optimization |

### Personal Skills (4)

| Skill | Purpose |
|-------|---------|
| `spartan-warrior` | Discipline and mental strength |
| `gym-training-expert` | Fitness and training protocols |
| `health-nutrition-expert` | Nutrition science |
| `greek-philosopher` | Philosophical wisdom |

### Soulbook Skills (25)

The Soulbook framework for personal transformation:
- 7 Pillars of life balance
- Life Symphony methodology
- Golden Path guidance
- Assessment frameworks

## Using Skills

### Automatic Activation

Skills auto-activate when Claude detects relevant keywords:

```
User: "Help me plan content for next week"
      ↓
System detects: "plan content"
      ↓
Auto-loads: content-strategy skill
      ↓
Claude responds with content planning knowledge
```

### Explicit Invocation

Invoke skills directly:

```bash
# Slash command
/skill content-strategy

# Natural language
"Load the content strategy skill"

# Full path
"Use skills/creative/content-strategy"
```

### Combining Skills

Multiple skills can be active simultaneously:

```
/skill content-strategy
/skill frankx-brand

"Now plan content that matches our brand voice"
```

## Skill File Structure

Every skill follows this structure:

```markdown
---
name: skill-name
description: Brief description of what this skill does
author: Author name
version: 1.0.0
triggers:
  keywords: ["keyword1", "keyword2"]
  files: ["*.ts", "*.tsx"]
  commands: ["/skill-name"]
---

# Skill Name

Brief introduction to the skill.

## When to Use

- Scenario 1
- Scenario 2
- Scenario 3

## Core Patterns

### Pattern 1: [Name]

[Description]

```typescript
// Working code example
```

### Pattern 2: [Name]

[Description]

## FrankX Application

How this applies specifically to FrankX projects.

## Anti-Patterns

What NOT to do:
- Anti-pattern 1
- Anti-pattern 2

## Related Skills

- [Related Skill 1](path)
- [Related Skill 2](path)
```

## Creating New Skills

### 1. Choose Category

Place skills in the appropriate category:
- `skills/technical/` - Development and architecture
- `skills/creative/` - Content and brand
- `skills/business/` - Business operations
- `skills/personal/` - Personal development

### 2. Use the Template

```bash
# Copy master template
cp templates/SKILL_TEMPLATE.md skills/[category]/[skill-name]/SKILL.md
```

### 3. Fill Required Sections

**Required:**
- YAML frontmatter with triggers
- Purpose/description
- When to use
- At least 2 core patterns with examples
- Anti-patterns

**Optional but recommended:**
- FrankX application section
- Related skills
- Resources folder

### 4. Validate

```bash
# Run skill validator
acos validate skills/[category]/[skill-name]

# Checklist:
# - [ ] Under 500 lines
# - [ ] Valid YAML frontmatter
# - [ ] Working code examples
# - [ ] No placeholder text
```

## Best Practices

### Keep Skills Focused

Each skill should do ONE thing well:

```
❌ BAD: "full-stack-development" (too broad)
✅ GOOD: "react-testing-patterns" (focused)
```

### Provide Real Examples

Always include working, tested code:

```typescript
// ❌ BAD: Placeholder
function example() {
  // TODO: implement
}

// ✅ GOOD: Complete example
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

### Use Progressive Disclosure

Don't overload the main file:

```
skills/content-strategy/
├── SKILL.md            # Core instructions (<500 lines)
├── CLAUDE.md           # AI context
└── resources/          # Extended content
    ├── pillar-framework.md
    ├── seo-checklist.md
    └── templates/
```

### Include Anti-Patterns

Help users avoid common mistakes:

```markdown
## Anti-Patterns

### Don't: Test Implementation Details

❌ Testing internal state directly
✅ Test observable behavior

### Don't: Skip Error Handling

❌ Assuming happy path always
✅ Handle and test edge cases
```

## Skill Registry

All skills are indexed in `skills/registry.json`:

```json
{
  "version": "1.0.0",
  "skills": {
    "content-strategy": {
      "version": "1.2.0",
      "category": "creative",
      "path": "skills/creative/content-strategy",
      "triggers": {
        "keywords": ["content", "calendar", "pillar"],
        "files": [],
        "commands": ["/content-strategy"]
      }
    }
  }
}
```

Update the registry when adding skills:

```bash
# Sync registry with skills directory
acos sync
```

## Troubleshooting

### Skill Not Activating

1. Check trigger keywords match user input
2. Verify skill is in registry
3. Check YAML frontmatter is valid

### Context Overflow

1. Move detailed content to resources/
2. Keep SKILL.md under 500 lines
3. Use progressive disclosure

### Outdated Patterns

1. Check skill version
2. Run `acos update`
3. Contribute updates via PR

---

Next: [Agents Guide](./agents-guide.md) - Understanding the agent system
