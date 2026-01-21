# Getting Started with Agentic Creator OS

This guide walks you through setting up and using Agentic Creator OS with Claude Code.

## Prerequisites

- **Claude Code** installed and configured
- **Node.js 18+** (for MCP servers)
- **Git** (for cloning and updates)

## Installation Methods

### Method 1: npm (Recommended)

```bash
# Install globally
npm install -g @frankx/agentic-creator-os

# Run installer
acos install

# Or use npx without installing
npx @frankx/agentic-creator-os install
```

### Method 2: Clone Repository

```bash
# Clone the repo
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os

# Run installer
./install.sh
```

### Method 3: Manual Setup

1. Download the latest release from GitHub
2. Extract to your desired location
3. Copy skill files to `~/.claude-skills/`
4. Configure MCP servers in Claude Code settings

## Post-Installation

### Verify Installation

```bash
# Check version and status
acos status

# List available skills
acos list skills

# Test a skill
acos test content-strategy
```

### Configure Your Instance

Create your project configuration:

```bash
# Initialize a new instance
acos init my-project

# This creates:
# - instances/my-project/CLAUDE.md
# - instances/my-project/brand-voice.md
# - instances/my-project/agents/
```

## First Steps

### 1. Explore Available Skills

Open Claude Code and try:

```
What skills are available?
```

Claude will list the 62+ skills organized by category:
- **Technical**: TDD, debugging, MCP architecture
- **Creative**: Brand voice, content strategy, music production
- **Business**: OCI services, product management
- **Personal**: Fitness, Spartan mindset

### 2. Activate a Skill

Skills activate automatically by context, or you can invoke explicitly:

```
/skill content-strategy
```

This loads the content strategy skill, giving Claude specialized knowledge for content planning.

### 3. Try a Workflow

Workflows orchestrate multiple skills for complex tasks:

```
/daily-content-ops
```

This runs the daily content operations workflow, which:
1. Checks your content calendar
2. Identifies today's priorities
3. Drafts scheduled content
4. Prepares social distribution

## Directory Structure

After installation, you'll have:

```
agentic-creator-os/
├── CLAUDE.md               # AI context (read this!)
├── skills/                 # All skill files
│   ├── technical/         # Technical skills
│   ├── creative/          # Creative skills
│   ├── business/          # Business skills
│   └── personal/          # Personal development
├── departments/            # Agent team configurations
├── workflows/              # Orchestrated pipelines
├── templates/              # Content templates
├── instances/              # Project configurations
└── mcp-servers/            # MCP server implementations
```

## Key Concepts

### Skills
Domain-specific knowledge modules that enhance Claude's capabilities. Each skill:
- Has a focused purpose
- Includes working code examples
- Follows progressive disclosure (metadata → instructions → resources)
- Auto-activates based on context keywords

### Agents
Specialized AI personas with distinct voices and expertise:
- **Luminor Oracle**: Strategic foresight
- **Creation Engine**: Content and products
- **Technical Translator**: AI education
- **Frequency Alchemist**: Music and consciousness

### Workflows
Orchestrated sequences that coordinate skills and agents:
- **Pipeline**: Sequential steps (Research → Plan → Create → Publish)
- **Parallel**: Concurrent execution (Blog + Social + Email)
- **Iterative**: Loop until quality threshold met

### MCP Servers
External capabilities via Model Context Protocol:
- **Browser**: Web automation with Playwright
- **Database**: Persistent storage
- **Email**: Newsletter delivery
- **Memory**: Knowledge persistence

## Configuration

### Environment Variables

Create `.env.local` in your project root:

```bash
# MCP Server Configurations
BROWSER_MCP_PORT=3001
DATABASE_MCP_URL=your-database-url
EMAIL_API_KEY=your-email-key

# Optional
OPENAI_API_KEY=for-embeddings
ANTHROPIC_API_KEY=for-claude-direct
```

### MCP Settings

Configure MCP servers in Claude Code settings:

```json
{
  "mcpServers": {
    "browser": {
      "command": "npx",
      "args": ["@anthropic/mcp-browser"]
    },
    "memory": {
      "command": "npx",
      "args": ["@anthropic/mcp-memory"]
    }
  }
}
```

## Troubleshooting

### Skills Not Loading

1. Check CLAUDE.md exists in project root
2. Verify skill files have correct frontmatter
3. Ensure skill registry is up to date: `acos sync`

### MCP Servers Not Connecting

1. Check server is running: `acos mcp status`
2. Verify port configuration
3. Check Claude Code MCP settings

### Permission Issues

```bash
# Make scripts executable
chmod +x install.sh
chmod +x bin/*
```

## Next Steps

- [Skills Guide](./skills-guide.md) - Deep dive into using and creating skills
- [Agents Guide](./agents-guide.md) - Understanding the agent system
- [Workflows Guide](./workflows-guide.md) - Building orchestrated pipelines
- [MCP Integration](./mcp-integration.md) - Setting up external capabilities

## Getting Help

- **Documentation**: Browse `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/frankxai/agentic-creator-os/issues)
- **Community**: [FrankX Discord](https://discord.gg/frankx)
- **Updates**: Follow [@frankxai](https://twitter.com/frankxai)

---

*Ready to transform your creative workflow? Let's build your personal Jarvis.*
