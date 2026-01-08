# Agentic Creator OS

**Transform from overwhelmed creator to AI-empowered artist.**

A protocol and framework for building personalized AI agent systems that amplify creative expression without replacing the human at the center.

---

## What This Is

Agentic Creator OS is a **configuration-based framework** that lets you build your own AI-powered creative system. It works with the tools you already use (Claude Code, OpenCode, Cursor, etc.) rather than replacing them.

```
┌─────────────────────────────────────────────────────────────┐
│              YOUR CREATIVE VISION                           │
│   (Books, Music, Courses, Content, Products)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              AGENTIC CREATOR OS                             │
│   • Your Brand Voice System                                 │
│   • Your Agent Team Configuration                           │
│   • Your Skills Library                                     │
│   • Your Workflow Protocols                                 │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌───────────┐       ┌───────────┐       ┌───────────┐
    │  Claude   │       │ OpenCode  │       │  Cursor   │
    │   Code    │       │   CLI     │       │    AI     │
    └───────────┘       └───────────┘       └───────────┘
```

---

## Core Principles

### 1. Creator-First, Not Tool-First

Your creative vision drives the system. AI agents serve your expression—they don't replace it. Every configuration choice should answer: "Does this amplify my voice or dilute it?"

### 2. One Source of Truth

Your brand voice, your skills, your workflows—defined once, used everywhere. No copy-pasting between tools. No drift between systems.

### 3. Portable by Design

Works with Claude Code, OpenCode, Cursor, and future tools. The framework generates appropriate configs for each platform from your single source of truth.

### 4. Progressive Complexity

Start simple. A basic voice profile and one agent is enough. Add skills, subagents, and workflows as you grow. The system scales with you.

---

## Quick Start (5 Minutes)

### Step 1: Clone the Framework

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
```

### Step 2: Create Your Instance

```bash
cp -r templates/starter instances/your-name
```

### Step 3: Define Your Voice

Edit `instances/your-name/brand-voice.md`:

```markdown
# Your Brand Voice

## Identity
Name: [Your creator name]
Role: [What you create]
Audience: [Who you serve]

## Voice Characteristics
- [Characteristic 1: e.g., "Direct but warm"]
- [Characteristic 2: e.g., "Technical with creative flair"]
- [Characteristic 3: e.g., "Personal stories over abstractions"]

## Words to Use
- [Words that sound like you]

## Words to Avoid
- [Corporate jargon, overused phrases]
```

### Step 4: Generate Configs

```bash
./scripts/generate-configs.sh your-name claude-code
```

This creates a CLAUDE.md file tuned to your voice and ready to use.

### Step 5: Start Creating

```bash
cd your-project
# Claude Code now knows your voice, your skills, your way of working
claude "Write the introduction for my new article"
```

---

## Framework Structure

```
agentic-creator-os/
├── CREATOR-OS.md           # This file - framework overview
├── ARCHITECTURE.md         # Technical architecture & multi-CLI support
├── QUICK-START.md          # Detailed getting started guide
├── templates/
│   ├── starter/            # Minimal starting template
│   ├── brand-voice.md      # Voice definition template
│   ├── agent-team.md       # Agent configuration template
│   └── skills/             # Skill definition templates
├── instances/
│   └── frankx/             # Reference implementation
├── adapters/
│   ├── claude-code/        # Claude Code adapter
│   ├── opencode/           # OpenCode/oh-my-opencode adapter
│   └── cursor/             # Cursor AI adapter
├── scripts/
│   └── generate-configs.sh # Config generator
└── docs/
    ├── concepts.md         # Core concepts explained
    ├── skills-guide.md     # How to create skills
    └── multi-agent.md      # Multi-agent coordination
```

---

## Core Concepts

### Brand Voice System

Your brand voice is the foundation. It defines:

- **Identity**: Who you are as a creator
- **Audience**: Who you're talking to
- **Tone**: How you sound (warm, direct, poetic, technical)
- **Vocabulary**: Words you use vs. avoid
- **Examples**: Reference content that captures your voice

Every AI interaction passes through this filter. Whether you're writing a blog post, coding a feature, or crafting a sales page—it sounds like you.

### Agent Team

Specialized agents handle different aspects of your creative work:

| Agent | Role | Example Tasks |
|-------|------|---------------|
| **Writer** | Content creation | Blog posts, book chapters, emails |
| **Architect** | System design | Code structure, product architecture |
| **Designer** | Visual direction | UI decisions, brand assets |
| **Editor** | Quality control | Review, polish, consistency |
| **Strategist** | Direction | Planning, prioritization, goals |

You can start with just one (Writer) and add more as needed.

### Skills Library

Skills are reusable knowledge modules:

```markdown
# Skill: SEO Writing

## Purpose
Create content that ranks AND resonates.

## Guidelines
- Lead with value, optimize second
- Target one primary keyword per piece
- Use semantic variations naturally
- Structure for featured snippets
- Include internal links strategically

## Examples
[Reference content...]
```

Skills can be:
- **General**: Writing, coding, design principles
- **Domain-specific**: Your industry expertise
- **Personal**: Your unique methodologies
- **Technical**: Tool-specific knowledge

### Workflow Protocols

Standard operating procedures for recurring tasks:

```markdown
# Workflow: Weekly Content Publishing

## Trigger
Every Monday, 9 AM

## Steps
1. Review content calendar
2. Select ready drafts
3. Polish with Editor agent
4. Generate social snippets
5. Schedule publication
6. Create tracking tasks

## Agents Involved
- Writer (step 4 polish)
- Strategist (step 1 review)
```

---

## Multi-CLI Architecture

The framework generates configs for multiple AI tools from your single source:

### Claude Code
Outputs: `CLAUDE.md` with your voice, skills, and agent profiles embedded.

### OpenCode / oh-my-opencode
Outputs: `oh-my-opencode.json` with identity override, subagent enhancements, and magic words.

### Cursor AI
Outputs: `.cursorrules` with your conventions and preferences.

### Future Tools
The adapter pattern makes adding new tools straightforward.

---

## Example: The FrankX Instance

The `instances/frankx/` folder shows a complete implementation:

- **Voice**: Cinematic, intimate, studio-rooted
- **Audience**: Creators transforming with AI
- **Agents**: Technical Translator, Frequency Alchemist, Creation Engine, Soul Strategist
- **Skills**: 52 skills across Soulbook, Technical, Creative, Personal, Business domains
- **Workflows**: Daily publishing, book writing, music production, website development

Study it as a reference, but build YOUR instance from YOUR creative vision.

---

## What This Enables

### For Individual Creators

- Consistent voice across all content
- AI that knows your style and preferences
- Reusable skills that compound over time
- Multi-tool workflow without duplication

### For Teams

- Shared brand voice across contributors
- Standardized agent configurations
- Skill libraries as team knowledge base
- Onboarding new members with context

### For Products

- Package your methodology as skills
- Sell/share your agent configurations
- Build tools on top of the framework
- Create niche instances for specific audiences

---

## Philosophy

> "AI should amplify human creativity, not replace it."

This framework exists because we believe:

1. **Every creator deserves AI that knows them.** Generic AI responses waste time. Personalized AI accelerates expression.

2. **Configuration beats code.** You shouldn't need to be a developer to have a sophisticated AI system. Markdown files and simple scripts should be enough.

3. **Portability matters.** Today's best tool might not be tomorrow's. Your creative system should move with you.

4. **Open source wins.** The best frameworks come from communities. Share what works, learn from others, build together.

---

## Getting Started

1. **[Quick Start Guide](QUICK-START.md)** - Set up your first instance in 15 minutes
2. **[Architecture Deep Dive](ARCHITECTURE.md)** - Understand how the pieces fit
3. **[Skills Guide](docs/skills-guide.md)** - Create your first custom skill
4. **[Reference Instance](instances/frankx/)** - See a complete implementation

---

## Contributing

This is an open framework. Contributions welcome:

- New adapter templates for AI tools
- Skill templates for different domains
- Documentation improvements
- Instance examples (with permission)

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License. Use it, modify it, share it. Attribution appreciated but not required.

---

*Built with love for creators who believe AI should serve their vision, not the other way around.*
