# Getting Started with Agentic Creator OS

This guide walks you through setting up and using Agentic Creator OS with Claude Code.

## Prerequisites

- **Claude Code** installed and configured
- **Node.js 18+** (for MCP servers)
- **Git** (for cloning and updates)

## Installation Methods

`@frankx/agentic-creator-os` is not published on npm. Use the repository installer.

### Method 1: Claude Code, Codex, or Grok

This installs five skills. It does not copy the rest of the repository.

```bash
claude plugin marketplace add frankxai/agentic-creator-os
claude plugin install creator-os-core@frankx-creator
```

Codex uses `codex plugin marketplace add frankxai/agentic-creator-os` and `codex plugin add creator-os-core@frankx-creator`. Grok uses `grok plugin marketplace add frankxai/agentic-creator-os` and `grok plugin install creator-os-core --trust`.

### Method 2: Full catalog, with a preview

```bash
git clone --depth 1 https://github.com/frankxai/agentic-creator-os.git
bash ./agentic-creator-os/install.sh --dry-run --platform=cursor --target=.
bash ./agentic-creator-os/install.sh --platform=cursor --target=.
```

`--dry-run` writes nothing. The second command writes into the project. Use `--platform=antigravity` or `--platform=grok` the same way. `--platform=claude` copies the full catalog into your Claude profile and can replace files with the same name. Prefer Method 1 unless you want that.

### Method 3: Install from inside the clone

```bash
git clone https://github.com/frankxai/agentic-creator-os.git
cd agentic-creator-os
./install.sh --dry-run --platform=claude
./install.sh --platform=claude
```

### Method 4: Manual setup

1. Download the latest release from GitHub
2. Extract to your desired location
3. Copy skill files to `~/.claude-skills/`
4. Configure MCP servers in Claude Code settings

## After it is installed

Open a new session. Type `/acos`, or say what you are doing in one sentence.

You have five practices.

- Start safely, before the first change in a repository.
- Review a diff, when you want a judgment and not a rewrite.
- Stated voice, when someone else will read the words.
- Run the checks, when a change needs proof.
- Hand off clean, when another person will continue.

The first things people ask are "Review this diff", "Write the install note", and "Run the checks".

There is no `acos status` command. If the new session does not know `/acos`, add the marketplace again in that profile and open another session.

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
Γö£ΓöÇΓöÇ CLAUDE.md               # AI context (read this!)
Γö£ΓöÇΓöÇ skills/                 # All skill files
Γöé   Γö£ΓöÇΓöÇ technical/         # Technical skills
Γöé   Γö£ΓöÇΓöÇ creative/          # Creative skills
Γöé   Γö£ΓöÇΓöÇ business/          # Business skills
Γöé   ΓööΓöÇΓöÇ personal/          # Personal development
Γö£ΓöÇΓöÇ departments/            # Agent team configurations
Γö£ΓöÇΓöÇ workflows/              # Orchestrated pipelines
Γö£ΓöÇΓöÇ templates/              # Content templates
Γö£ΓöÇΓöÇ instances/              # Project configurations
ΓööΓöÇΓöÇ mcp-servers/            # MCP server implementations
```

## Key Concepts

### Skills
Domain-specific knowledge modules that enhance Claude's capabilities. Each skill:
- Has a focused purpose
- Includes working code examples
- Follows progressive disclosure (metadata ΓåÆ instructions ΓåÆ resources)
- Auto-activates based on context keywords

### Agents
Specialized AI personas with distinct voices and expertise:
- **Visionary**: Strategic foresight
- **Creation Engine**: Content and products
- **Code Architect**: Dev and systems
- **Sonic Engineer**: Music and audio

### Workflows
Orchestrated sequences that coordinate skills and agents:
- **Pipeline**: Sequential steps (Research ΓåÆ Plan ΓåÆ Create ΓåÆ Publish)
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
