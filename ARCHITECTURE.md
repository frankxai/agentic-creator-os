# Agentic Creator OS - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CREATOR LAYER                                    │
│                                                                          │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐               │
│   │  Brand Voice │   │  Agent Team  │   │    Skills    │               │
│   │   System     │   │   Config     │   │   Library    │               │
│   └──────────────┘   └──────────────┘   └──────────────┘               │
│          │                  │                  │                        │
│          └──────────────────┼──────────────────┘                        │
│                             │                                           │
│                             ▼                                           │
│                    ┌────────────────┐                                   │
│                    │   COMPILER     │                                   │
│                    │   (Scripts)    │                                   │
│                    └────────────────┘                                   │
│                             │                                           │
│          ┌──────────────────┼──────────────────┐                        │
│          ▼                  ▼                  ▼                        │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐               │
│   │   CLAUDE.md  │   │  oh-my-*.json│   │ .cursorrules │               │
│   │   Adapter    │   │   Adapter    │   │   Adapter    │               │
│   └──────────────┘   └──────────────┘   └──────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLI LAYER                                       │
│                                                                          │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐               │
│   │  Claude Code │   │   OpenCode   │   │    Cursor    │               │
│   │     CLI      │   │     CLI      │   │      AI      │               │
│   └──────────────┘   └──────────────┘   └──────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Brand Voice System

**Location:** `instances/{name}/brand-voice.md`

Defines who you are as a creator:

```markdown
# Brand Voice

## Identity
name: "Creator Name"
tagline: "One-line description"
transformation: "From X → To Y"

## Audience
primary: "Who you serve"
pain_points:
  - "What they struggle with"
psychographics:
  - "What they believe"

## Voice
tone: ["characteristic1", "characteristic2"]
words_use: ["preferred", "vocabulary"]
words_avoid: ["corporate", "jargon"]

## Examples
[Reference content that captures your voice]
```

### 2. Agent Team Configuration

**Location:** `instances/{name}/agents/`

Each agent is a markdown file:

```markdown
# Agent: Writer

## Role
Content creation specialist for blogs, books, and marketing copy.

## Personality
- Warm but direct
- Uses stories to illustrate points
- Avoids fluff and filler

## Capabilities
- Long-form content
- Social media adaptation
- Email sequences
- Book chapters

## Handoff Protocol
- Receives briefs from Strategist
- Passes drafts to Editor
- Collaborates with Designer on visuals

## Activation Phrases
- "Write a blog post about..."
- "Draft an email for..."
- "Create content for..."
```

### 3. Skills Library

**Location:** `instances/{name}/skills/`

Modular knowledge that agents can access:

```
skills/
├── writing/
│   ├── seo-writing.md
│   ├── storytelling.md
│   └── email-sequences.md
├── technical/
│   ├── nextjs-patterns.md
│   ├── api-design.md
│   └── database-optimization.md
├── creative/
│   ├── music-production.md
│   ├── visual-design.md
│   └── video-editing.md
└── business/
    ├── pricing-strategy.md
    ├── launch-planning.md
    └── customer-research.md
```

---

## Adapter System

### Claude Code Adapter

**Output:** `CLAUDE.md`

Claude Code reads markdown files for context. The adapter compiles your voice, agents, and skills into a single markdown file:

```markdown
# {Creator Name} Claude Code Configuration

## Core Mission
{From brand-voice.md}

## Voice Guidelines
{Compiled voice characteristics}

## Agent Profiles
{Each agent as an XML block}

## Skills Reference
{Selected skills embedded or linked}

## Activation Commands
{Agent activation phrases}
```

**Key Features:**
- Supports `<agent_profile>` XML blocks
- Skills can be inline or file references
- Works with Claude Code's memory system

### OpenCode Adapter

**Output:** `oh-my-opencode.json`

OpenCode uses JSON configuration. The adapter generates:

```json
{
  "identity": {
    "override": true,
    "name": "{Creator Name}",
    "personality": "{From brand-voice}"
  },
  "voice": {
    "use": ["{words}"],
    "avoid": ["{words}"]
  },
  "subagents": {
    "writer": {
      "enhance": true,
      "context": "{Agent config}"
    }
  },
  "magic_words": {
    "ulw": "ultrawork mode",
    "ulc": "ultracode mode"
  }
}
```

**Key Features:**
- Works with oh-my-opencode subagent system
- Supports identity override
- Compatible with magic words

### Cursor Adapter

**Output:** `.cursorrules`

Cursor uses a rules file for AI behavior:

```
# {Creator Name} Cursor Rules

## Voice
{Voice guidelines}

## Code Style
{Technical preferences}

## Communication
{How to respond}
```

**Key Features:**
- Simpler format (Cursor has less configuration)
- Focus on coding conventions
- Project-specific overrides supported

---

## Multi-CLI Workflow

### Same Source, Different Outputs

```
instances/your-name/
├── brand-voice.md          # YOUR SOURCE OF TRUTH
├── agents/
│   ├── writer.md
│   ├── architect.md
│   └── editor.md
└── skills/
    └── ...

↓ generate-configs.sh ↓

outputs/
├── claude-code/
│   └── CLAUDE.md           # For Claude Code CLI
├── opencode/
│   └── oh-my-opencode.json # For OpenCode CLI
└── cursor/
    └── .cursorrules        # For Cursor AI
```

### Using Multiple CLIs

You can use different CLIs for different tasks:

| Task | Recommended CLI | Why |
|------|-----------------|-----|
| Code development | Claude Code | Best tool integration |
| Quick queries | OpenCode | Fast subagent spawning |
| IDE coding | Cursor | Native editor integration |
| Complex orchestration | Claude Code | Multi-agent support |

All CLIs share your voice, skills, and agent configurations.

---

## Agent Communication Protocol

### Handoff Format

When agents pass work to each other:

```markdown
## Handoff: Writer → Editor

### Context
{What was created and why}

### Deliverable
{The content/code/asset}

### Specific Requests
- Check for voice consistency
- Verify technical accuracy
- Suggest structural improvements

### Constraints
- Maintain original intent
- Keep under 2000 words
- Preserve all examples
```

### Multi-Agent Sessions

For complex tasks requiring multiple agents:

```markdown
## Session: Launch Campaign

### Agents Involved
1. Strategist (planning)
2. Writer (content)
3. Designer (visuals)
4. Editor (polish)

### Workflow
Strategist → brief → Writer
Writer → draft → Designer (parallel)
Designer → assets → Editor
Editor → final review → Publish

### Coordination
- Strategist is session lead
- All agents can request clarification
- Editor has final approval
```

---

## Skill Architecture

### Skill Structure

```markdown
# Skill: {Name}

## Purpose
{One sentence: what this skill enables}

## When to Use
- {Trigger condition 1}
- {Trigger condition 2}

## Guidelines
{Detailed instructions}

## Examples
{Reference implementations}

## Anti-Patterns
{What NOT to do}

## Related Skills
- {skill-1}
- {skill-2}
```

### Skill Composition

Skills can reference other skills:

```markdown
# Skill: SEO-Optimized Blog Post

## Composes
- skill:writing/storytelling
- skill:technical/seo-writing
- skill:business/audience-research

## Additional Guidelines
{Specific to this composed skill}
```

### Skill Loading

Adapters handle skill inclusion differently:

**Claude Code:** Skills embedded directly or via file paths
**OpenCode:** Skills loaded as context in subagent configs
**Cursor:** Key skills included in rules, others available on request

---

## Extension Points

### Adding a New CLI Adapter

1. Create adapter folder: `adapters/{cli-name}/`
2. Add template: `adapters/{cli-name}/template.{ext}`
3. Add generator: `adapters/{cli-name}/generate.sh`
4. Register in `scripts/generate-configs.sh`

### Creating Custom Agents

1. Copy template: `templates/agent-template.md`
2. Customize for your needs
3. Place in `instances/{name}/agents/`
4. Reference in workflow configs

### Building Skill Packs

Reusable skill collections:

```
skill-packs/
├── writer-essentials/
│   ├── pack.json
│   └── skills/
├── developer-tools/
│   ├── pack.json
│   └── skills/
└── creator-business/
    ├── pack.json
    └── skills/
```

---

## Security Considerations

### Sensitive Information

Never include in configs:
- API keys
- Passwords
- Personal identifiable information
- Client confidential data

Use environment variables and `.env` files instead.

### Public vs. Private Skills

Some skills should remain private:

```
instances/{name}/
├── skills/           # Can be public
│   └── public/
└── skills-private/   # Never commit
    └── ...
```

Add `skills-private/` to `.gitignore`.

---

## Performance Optimization

### Large Skill Libraries

If you have 50+ skills, consider:

1. **Lazy loading**: Only include relevant skills per session
2. **Skill indices**: Create summary files for navigation
3. **Chunking**: Split large skills into sub-skills

### Config Size Limits

Different CLIs have context limits:

| CLI | Recommended Config Size |
|-----|------------------------|
| Claude Code | < 50KB CLAUDE.md |
| OpenCode | < 100KB JSON |
| Cursor | < 20KB rules |

Use file references for large skill content.

---

## Roadmap

### Current (v1.0)
- Core framework structure
- Claude Code adapter
- OpenCode adapter
- Basic skill system

### Next (v1.1)
- Cursor adapter
- Skill pack marketplace
- GUI config editor
- Multi-instance management

### Future (v2.0)
- Real-time sync between CLIs
- Collaborative instances
- AI-assisted skill creation
- Performance analytics

---

*Architecture designed for extensibility. Build what you need, share what works.*
