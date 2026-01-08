# Core Concepts

Understanding the key ideas behind Agentic Creator OS.

---

## What is a "Creator OS"?

A Creator OS is a personalized system that helps you create consistently. It includes:

1. **Your Voice**: How you communicate
2. **Your Tools**: What you use to create
3. **Your Processes**: How you work
4. **Your Knowledge**: What you know and can teach

Traditionally, this lives in your head. Agentic Creator OS makes it explicit and shareable with AI.

---

## Brand Voice as Foundation

Everything starts with your brand voice. It's not just for marketing—it's for every interaction.

When your AI tools know your voice:
- Code comments sound like you
- Documentation matches your style
- Generated content needs less editing
- The AI becomes a true collaborator, not generic assistant

**Voice is identity. Identity creates consistency. Consistency builds trust.**

---

## Agents vs. Skills

### Agents
Agents are **personas** with distinct personalities and roles:

- **Who** they are (personality)
- **What** they do (capabilities)
- **How** they sound (voice within your brand)

Think of agents as team members with different jobs.

### Skills
Skills are **knowledge modules** any agent can use:

- **Information** (how to do something)
- **Guidelines** (what to do and avoid)
- **Examples** (what good looks like)

Think of skills as training materials your team shares.

**Example:**
- Agent: "Writer" (persona)
- Skills Writer uses: "SEO Writing", "Storytelling", "Email Sequences" (knowledge)

---

## One Source of Truth

The problem with multiple AI tools: each needs separate configuration. You end up:
- Repeating context across platforms
- Maintaining multiple versions of your preferences
- Losing consistency between tools

**Solution:** Define once in Agentic Creator OS, generate configs for each tool.

```
Your Instance (Source of Truth)
        │
        ├──> CLAUDE.md (for Claude Code)
        ├──> oh-my-opencode.json (for OpenCode)
        └──> .cursorrules (for Cursor)
```

Change your voice? Regenerate all configs. Consistency maintained.

---

## Adapters and Portability

Each AI tool has its own configuration format:

| Tool | Format | Location |
|------|--------|----------|
| Claude Code | Markdown | `CLAUDE.md` |
| OpenCode | JSON | `.opencode/*.json` |
| Cursor | Text | `.cursorrules` |

Adapters translate your instance into each format. You focus on *what* you want; adapters handle *how* to configure it.

**Portability benefit:** If a new tool emerges, add an adapter. Your instance stays the same.

---

## Progressive Complexity

Start simple:
1. Basic voice profile
2. One general agent
3. A few key skills

Grow as needed:
1. Detailed voice with examples
2. Specialized agent team
3. Comprehensive skill library
4. Automated workflows

The framework scales with you. Don't over-engineer day one.

---

## Skills Architecture

Skills are modular by design:

```
skills/
├── writing/
│   ├── seo-writing.md
│   └── storytelling.md
├── technical/
│   └── api-design.md
└── business/
    └── pricing.md
```

**Benefits:**
- Share skills across projects
- Update knowledge in one place
- Build skill packs for different contexts
- Potentially sell/share skill collections

**Skill loading:** Adapters decide how to include skills—some embed directly, others reference files.

---

## Multi-Agent Coordination

For complex work, agents collaborate:

```
Task: Write and publish blog post

1. Strategist → defines angle and audience
2. Writer → creates draft
3. Editor → reviews and polishes
4. Publisher → formats and deploys
```

**Handoff protocol:** Clear format for passing work between agents:
- What was done
- What needs to happen
- Any constraints

This mirrors how human teams work—specialized roles, clear communication.

---

## Instance vs. Framework

**Framework:** Agentic Creator OS itself
- Templates
- Adapters
- Generator scripts
- Documentation

**Instance:** Your customization
- Your voice
- Your agents
- Your skills
- Your workflows

Keep these separate. Update the framework without losing your customizations.

---

## The Creator-First Principle

Every design decision asks: "Does this serve creators?"

**Included:**
- Simple markdown files (no code required)
- Clear templates with examples
- Works with existing tools

**Excluded:**
- Enterprise complexity
- Vendor lock-in
- Unnecessary abstraction

If it doesn't help you create better, it doesn't belong here.

---

## Next Steps

- [**Brand Voice Guide**](brand-voice-guide.md) - Deep dive into defining your voice
- [**Skills Guide**](skills-guide.md) - How to create effective skills
- [**Multi-Agent Guide**](multi-agent.md) - Coordinating multiple agents

---

*Understanding these concepts makes everything else click.*
