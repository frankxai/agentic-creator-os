# Agentic Creator OS

**Transform from overwhelmed creator to AI-empowered artist.**

A configuration-based framework for building personalized AI agent systems. Define your voice once, use it everywhere—Claude Code, OpenCode, Cursor, and beyond.

---

## Quick Start

```bash
# Clone the framework
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os

# Create your instance
cp -r templates/starter instances/your-name

# Customize your voice
edit instances/your-name/brand-voice.md

# Generate configs for your CLI
./scripts/generate-configs.sh your-name claude-code
```

---

## What This Is

Most AI tools treat every user the same. Generic responses. No memory of your style. No understanding of your workflow.

**Agentic Creator OS changes that.**

You define:
- **Your voice**: How you sound, what words you use, your creative identity
- **Your agents**: Specialized AI personas for different tasks
- **Your skills**: Reusable knowledge modules
- **Your workflows**: Standard procedures for recurring work

The framework then generates appropriate configs for whichever AI CLI you use.

```
YOUR CREATIVE VISION
        │
        ▼
┌─────────────────────────┐
│  AGENTIC CREATOR OS     │
│  • Brand Voice          │
│  • Agent Team           │
│  • Skills Library       │
│  • Workflows            │
└─────────────────────────┘
        │
    ┌───┴───┐
    ▼       ▼
Claude  OpenCode  Cursor
Code    CLI       AI
```

---

## Why This Exists

After building AI workflows for my own creative work—500+ songs with Suno, a 70+ page website, books, courses—I realized the real bottleneck wasn't the AI. It was configuring every tool separately, repeating context, losing consistency across platforms.

This framework is my solution: **define once, deploy everywhere**.

---

## Key Features

### One Source of Truth
Your brand voice, agents, and skills live in markdown files. Edit once, regenerate configs for all your tools.

### Multi-CLI Support
Currently supports Claude Code, OpenCode (with oh-my-opencode), and Cursor. More adapters coming.

### Creator-First Design
Built for writers, musicians, course creators, and builders—not enterprise teams. Simple by default, powerful when needed.

### Open and Extensible
MIT licensed. Fork it, customize it, share your improvements.

---

## Project Structure

```
agentic-creator-os/
├── CREATOR-OS.md           # Framework overview
├── ARCHITECTURE.md         # Technical deep dive
├── README.md               # This file
│
├── templates/              # Starting templates
│   ├── starter/           # Minimal setup
│   ├── brand-voice.md     # Voice definition template
│   ├── agent-team.md      # Agent configuration template
│   └── skill-template.md  # Skill creation template
│
├── instances/              # Your configurations
│   └── frankx/            # Reference implementation
│
├── adapters/               # CLI-specific adapters
│   ├── claude-code/
│   ├── opencode/
│   └── cursor/
│
├── scripts/
│   └── generate-configs.sh
│
└── docs/                   # Additional documentation
```

---

## The FrankX Instance

The `instances/frankx/` folder shows a complete implementation:

- **4 specialized agents**: Technical Translator, Frequency Alchemist, Creation Engine, Soul Strategist
- **Detailed brand voice**: Cinematic, intimate, studio-rooted
- **52 skills**: From Soulbook personal development to technical MCP architecture
- **Real workflows**: Publishing, music production, website development

Study it as a reference. Then build your own.

---

## Getting Started

### 1. Clone and Explore

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os

# See the framework structure
tree -L 2

# Read the main docs
cat CREATOR-OS.md
```

### 2. Create Your Instance

```bash
# Copy the starter template
cp -r templates/starter instances/my-brand

# Or start from the FrankX reference
cp -r instances/frankx instances/my-brand
```

### 3. Define Your Voice

Edit `instances/my-brand/brand-voice.md`:

```markdown
# My Brand Voice

## Identity
Name: [Your name]
Tagline: [What you do in one line]

## Voice Characteristics
- [How you sound #1]
- [How you sound #2]

## Words to Use
[Words that feel like you]

## Words to Avoid
[Words that don't]
```

### 4. Configure Your Agents

Create agents in `instances/my-brand/agents/`:

```markdown
# Agent: Writer

## Role
Content creation specialist

## Personality
- Direct but warm
- Uses stories to illustrate
- Avoids fluff

## Activation
"Activate Writer for [task]"
```

### 5. Generate Configs

```bash
# For Claude Code
./scripts/generate-configs.sh my-brand claude-code

# For OpenCode
./scripts/generate-configs.sh my-brand opencode

# For all platforms
./scripts/generate-configs.sh my-brand all
```

### 6. Deploy and Create

Copy generated configs to your project:

```bash
cp outputs/claude-code/CLAUDE.md ~/my-project/
cp outputs/opencode/oh-my-opencode.json ~/my-project/.opencode/
```

Now your AI tools know your voice.

---

## Documentation

- **[CREATOR-OS.md](CREATOR-OS.md)** - Complete framework overview
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture and multi-CLI design
- **[docs/concepts.md](docs/concepts.md)** - Core concepts explained
- **[docs/skills-guide.md](docs/skills-guide.md)** - How to create skills

---

## Contributing

This is an open framework. Contributions welcome:

- **New adapters**: Add support for more AI tools
- **Skill templates**: Share domain-specific skill packs
- **Documentation**: Improve guides and examples
- **Bug fixes**: Help make the scripts more robust

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Community

- **GitHub Discussions**: Ask questions, share your instances
- **Issues**: Report bugs, request features
- **Twitter/X**: [@FrankXAI](https://twitter.com/FrankXAI) for updates

---

## License

MIT License. Use it, modify it, share it. Attribution appreciated but not required.

---

## Credits

Created by [FrankX](https://frankx.ai) as part of the creator transformation mission.

Built with love for creators who believe AI should serve their vision, not the other way around.

---

*"Transform from overwhelmed creator to AI-empowered artist."*
