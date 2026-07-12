# Agent & Skill Contribution Guide

This guide walks you through creating new agents and skills for ACOS. All contributions must align with the [Frank DNA](../CREATOR.md).

## Quick Reference

| I want to... | Create a... | Location |
|--------------|-------------|----------|
| Add domain expertise | Skill | `.claude/skills/my-skill/SKILL.md` |
| Add a cognitive pattern | Agent | `.claude/agents/my-agent.md` |
| Add a workflow | Command | `.claude/commands/my-command.md` |

## Part 1: Creating a Skill

Skills are domain knowledge modules that auto-activate based on context.

### Step 1: Create the Directory

```bash
mkdir -p .claude/skills/my-new-skill
```

### Step 2: Create SKILL.md

```markdown
# My New Skill

**Version:** 1.0 (ACOS v11)
**Author:** Your Name
**Last Updated:** 2026-06-08

## Overview

What this skill does and when to use it.

## Quick Start

How to get started quickly.

## Core Expertise

### Pattern 1: [Name]

Detailed explanation with examples.

### Pattern 2: [Name]

More patterns.

## Integration Points

How this skill works with others.

## Anti-Patterns

What NOT to do.
```

### Step 3: Add Activation Rules

Edit `.claude/skill-rules.json`:

```json
{
  "skill": "my-new-skill",
  "triggers": {
    "keywords": ["keyword1", "keyword2"],
    "file_patterns": ["*.ext"],
    "commands": ["/my-command"]
  },
  "priority": "medium"
}
```

### Step 4: Test Activation

1. Start Claude Code in the ACOS directory
2. Type a message containing your trigger keywords
3. Verify the skill activates

---

## Part 2: Creating an Agent

Agents are specialized cognitive patterns with defined capabilities and tool access.

### Step 1: Choose the Right Category

| Category | Purpose | Location |
|----------|---------|----------|
| `core/` | Fundamental agents (planner, coder, reviewer) | `.claude/agents/core/` |
| `github/` | GitHub integration agents | `.claude/agents/github/` |
| `hive-mind/` | Swarm coordination agents | `.claude/agents/hive-mind/` |
| `consensus/` | Distributed consensus agents | `.claude/agents/consensus/` |
| `optimization/` | Performance agents | `.claude/agents/optimization/` |
| `goal/` | Goal-oriented planning | `.claude/agents/goal/` |
| Root level | Specialized domain agents | `.claude/agents/` |

### Step 2: Create the Agent File

Use this template:

```markdown
---
name: my-agent-name
type: specialist
color: "#4A90D9"
description: Clear one-line description of what this agent does
capabilities:
  - capability-1
  - capability-2
  - capability-3
priority: medium
hooks:
  pre: |
    echo "🚀 Starting my-agent-name"
  post: |
    echo "✅ my-agent-name complete"
---

# My Agent Name

## Purpose

What specific problem does this agent solve? Who calls it? What are success criteria?

## Core Responsibilities

### 1. [Responsibility Name]

Detailed explanation of what this agent does.

### 2. [Responsibility Name]

Another key responsibility.

## Workflow

1. Step one
2. Step two
3. Step three

## Usage Examples

### Example 1: [Scenario]

```
User: [What they might ask]
Agent: [What this agent does]
```

## Integration Points

- **Works with:** [Other agents or skills]
- **Called by:** [What triggers this agent]
- **Calls:** [What this agent delegates to]

## Best Practices

- Do this
- Avoid that
```

### Step 3: Define Tool Access

Reference the appropriate profile from `.claude/agent-iam.json`:

| Profile | Tools | Use For |
|---------|-------|---------|
| `content-writer` | Read/Edit/Write/Grep/Glob | Content creation, no system access |
| `frontend-engineer` | All tools | UI/component work |
| `backend-engineer` | All tools | API/server work |
| `devops-engineer` | All tools + delete | Infrastructure/CI |
| `security-auditor` | Read-only | Security reviews |
| `system-architect` | All tools | Core system changes |

### Step 4: Validate Frontmatter

Required fields:

- [ ] `name` — Kebab-case identifier
- [ ] `type` — Category (specialist, coordinator, etc.)
- [ ] `color` — Hex color for UI
- [ ] `description` — One clear sentence
- [ ] `capabilities` — 3-7 concrete abilities
- [ ] `priority` — high, medium, or low

---

## Part 3: Frank DNA Alignment Checklist

Before submitting, verify your agent/skill:

### Voice & Vibe

- [ ] Uses direct, technical language (no fluff)
- [ ] Feels premium and high-quality
- [ ] Would be fun to use
- [ ] Avoids corporate speak

### Mission Alignment

- [ ] Helps people build their own systems
- [ ] Provides practical value (not just philosophy)
- [ ] Shows don't tells (output speaks)

### Technical Standards

- [ ] YAML frontmatter is valid
- [ ] Capabilities are concrete and measurable
- [ ] Tool access matches IAM profile
- [ ] Hooks are tested and work

### Anti-Patterns to Avoid

| Don't | Do |
|-------|-----|
| Vague spiritual language | Specific, measurable outcomes |
| "Transformative experience" | Describe the actual transformation |
| Passive voice everywhere | Active, direct voice |
| Claims without evidence | Show the work first |
| Over-engineered abstractions | Simple, clear patterns |

---

## Part 4: Testing Your Contribution

### For Skills

1. Add to `skill-rules.json`
2. Test keyword activation
3. Verify no conflicts with existing skills
4. Check `max_concurrent_skills` behavior

### For Agents

1. Test the agent definition loads without errors
2. Verify hooks execute correctly
3. Test with sample prompts
4. Check IAM boundaries are respected

### Validation Commands

```bash
# Lint the YAML frontmatter
npm run lint

# Run the health check
npm run acos:health

# Test skill activation
# (Start Claude Code and try trigger keywords)
```

---

## Part 5: Submitting Your PR

1. Use the [agent_contribution.md](../.github/ISSUE_TEMPLATE/agent_contribution.md) issue template to propose first
2. Fork the repo and create a feature branch
3. Create your agent/skill following this guide
4. Fill out the PR template with alignment checklist
5. Submit and respond to review feedback

### PR Naming Convention

- `Add: new [skill-name] skill for [purpose]`
- `Add: new [agent-name] agent for [purpose]`

---

## Examples

### Good Skill Example

See: `.claude/skills/nextjs-expert/SKILL.md`

### Good Agent Example

See: `.claude/agents/templates/implementer-sparc-coder.md`

---

## Questions?

- Open a [Discussion](https://github.com/frankxai/agentic-creator-os/discussions)
- Check the [Agent Registry](AGENT_REGISTRY.md) for existing patterns
- Review the [Frank DNA](../CREATOR.md) for alignment guidance

---

*"Build your system, not someone else's."* — Frank DNA
