# ACOS Enhancement System

> Keep your skills cutting-edge by pulling patterns from the best AI repositories.

## Overview

The Enhancement System automatically fetches, extracts, and integrates best practices from authoritative source repositories into your Agentic Creator OS skills. This ensures your skills stay current with evolving AI development patterns.

## Source Repositories

| Source | Repository | Patterns |
|--------|-----------|----------|
| **anthropic-cookbook** | github.com/anthropics/anthropic-cookbook | Tool use, multi-turn, prompt caching |
| **langgraph** | github.com/langchain-ai/langgraph | Agent workflows, state machines |
| **mcp-servers** | github.com/modelcontextprotocol/servers | MCP best practices, tool schemas |
| **vercel-ai** | github.com/vercel/ai | Streaming, edge functions |
| **openai-swarm** | github.com/openai/swarm | Agent handoffs, coordination |

## Quick Start

```bash
# List available sources
acos-enhance list-sources

# Fetch all source repositories
acos-enhance fetch-all

# Enhance a specific skill
acos-enhance enhance mcp-architecture

# Apply a specific pattern
acos-enhance apply anthropic-cookbook/tool_use
```

## Pattern Mapping

Each pattern is mapped to skills it can enhance:

```
anthropic-cookbook/tool_use      → mcp-architecture, claude-sdk
anthropic-cookbook/multi_turn    → agentic-orchestration, creator-intelligence
anthropic-cookbook/prompt_caching → content-strategy
langgraph/examples/agent_supervisor → agentic-orchestration
langgraph/examples/multi_agent   → agentic-orchestration
mcp-servers/src                  → mcp-architecture
vercel-ai/packages/ai/core       → creator-intelligence
openai-swarm/swarm               → agentic-orchestration
```

## Commands

### `acos-enhance list-sources`
Show all available source repositories with cache status.

### `acos-enhance fetch <source>`
Clone or update a specific source repository.

```bash
acos-enhance fetch anthropic-cookbook
```

### `acos-enhance fetch-all`
Clone or update all source repositories.

### `acos-enhance list-patterns`
Show all available patterns and their target skills.

### `acos-enhance apply <pattern>`
Extract a specific pattern for integration.

```bash
acos-enhance apply langgraph/examples/multi_agent
```

### `acos-enhance enhance <skill>`
Automatically find and apply all relevant patterns for a skill.

```bash
acos-enhance enhance agentic-orchestration
```

### `acos-enhance status`
Show current enhancement status including cached sources and extracted patterns.

## How It Works

### 1. Fetch Phase
Source repositories are cloned (shallow) to `~/.claude/acos/enhance-cache/`:

```
~/.claude/acos/enhance-cache/
├── anthropic-cookbook/
├── langgraph/
├── mcp-servers/
├── vercel-ai/
└── openai-swarm/
```

### 2. Extract Phase
Relevant patterns are copied to `~/.claude/acos/patterns/`:

```
~/.claude/acos/patterns/
├── anthropic-cookbook/
│   ├── tool_use/
│   │   ├── example.py
│   │   └── PATTERNS.md
│   └── multi_turn/
└── langgraph/
    └── examples/
        └── agent_supervisor/
```

### 3. Integration Phase
Review extracted patterns and integrate them into your skills:

1. Read `PATTERNS.md` in each pattern directory
2. Copy relevant code patterns to your skill
3. Adapt patterns to your use case
4. Update skill documentation

## Integration Example

### Enhancing `mcp-architecture` with Anthropic Patterns

```bash
# Fetch and apply patterns
acos-enhance enhance mcp-architecture

# Review extracted patterns
cat ~/.claude/acos/patterns/anthropic-cookbook/tool_use/PATTERNS.md

# Copy relevant patterns to your skill
# Edit skills/technical/mcp-architecture/CLAUDE.md
```

### Extracted Pattern Example

From `anthropic-cookbook/tool_use`:

```python
# Tool definition pattern
tools = [
    {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and state, e.g. San Francisco, CA"
                }
            },
            "required": ["location"]
        }
    }
]
```

Integrate into `mcp-architecture` skill:

```markdown
## Tool Schema Patterns (from Anthropic Cookbook)

### Standard Tool Definition

\`\`\`typescript
const tools = [{
  name: "get_weather",
  description: "Get current weather for a location",
  inputSchema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "City and state, e.g. San Francisco, CA"
      }
    },
    required: ["location"]
  }
}];
\`\`\`
```

## Automatic Updates

Set up a cron job to keep sources fresh:

```bash
# Weekly refresh (add to crontab)
0 0 * * 0 /path/to/acos-enhance fetch-all
```

Or use the sync command:

```bash
# One-time sync
acos-enhance fetch-all --force
```

## Adding New Sources

To add a new source repository, edit `bin/acos-enhance`:

```bash
# Add to SOURCES array
declare -A SOURCES=(
    ...
    ["new-source"]="https://github.com/org/repo"
)

# Add pattern mappings
declare -A PATTERN_TARGETS=(
    ...
    ["new-source/path/to/pattern"]="target-skill"
)
```

## Best Practices

1. **Review Before Integrating**: Always review extracted patterns before copying to skills
2. **Adapt, Don't Copy**: Modify patterns to fit your skill's context and style
3. **Attribute Sources**: Note where patterns came from in your documentation
4. **Regular Updates**: Fetch sources weekly to stay current
5. **Test Integration**: Verify skills work correctly after adding patterns

## Troubleshooting

### "Source not found"
Run `acos-enhance list-sources` to see valid source names.

### "Pattern not found in repo"
The repository structure may have changed. Run `acos-enhance fetch <source> --force` to refresh.

### Permission denied
Ensure the script is executable: `chmod +x bin/acos-enhance`

---

*Part of [Agentic Creator OS](https://github.com/frankxai/agentic-creator-os)*
