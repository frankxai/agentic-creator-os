<claude-mem-context>
# MCP Servers Directory - Content Tools

This directory contains Model Context Protocol server implementations that provide tools for content creation and evaluation.

## What Are MCP Servers?

MCP (Model Context Protocol) servers provide tools that AI assistants can use. In Agentic Creator OS, we have:
- **Creator MCP:** Content creation tools (social media, blogs, etc.)
- **Evaluator MCP:** Quality evaluation and audit tools

## Directory Structure

```
mcp-servers/
├── CLAUDE.md              ← YOU ARE HERE
├── creator/               ← Content creation tools
│   ├── src/
│   │   ├── index.ts       ← Main server entry
│   │   ├── social/
│   │   │   ├── twitter.ts
│   │   │   ├── linkedin.ts
│   │   │   ├── instagram.ts
│   │   │   ├── farcaster.ts
│   │   │   ├── analytics.ts
│   │   │   ├── scheduler.ts
│   │   │   └── types.ts
│   │   └── ...
│   ├── build/
│   │   └── index.js       ← Compiled server
│   └── package.json
└── evaluator/             ← Quality evaluation tools
    ├── src/
    │   ├── index.ts       ← Main server entry
    │   ├── evaluation/
    │   │   ├── evaluator.ts
    │   │   ├── hook-evaluator.ts
    │   │   └── metrics.ts
    │   ├── logging/
    │   │   └── audit.ts
    │   └── types/
    │       └── index.ts
    ├── build/
    │   └── index.js       ← Compiled server
    └── package.json
```

## Creator MCP Tools

### Social Media Tools
| Tool | Purpose | Parameters |
|------|---------|------------|
| `twitter_post` | Create a single tweet | content, hashtags |
| `twitter_thread` | Create a thread | tweets[], media |
| `linkedin_post` | Create LinkedIn post | content, hashtags |
| `linkedin_article` | Create LinkedIn article | title, content, tags |
| `instagram_post` | Create Instagram post | caption, media, hashtags |
| `instagram_story` | Create Instagram story | content, stickers |
| `farcaster_cast` | Create FarCaster cast | content, channels |
| `farcaster_thread` | Create FarCaster thread | casts[], channels |

### Scheduling & Analytics
| Tool | Purpose | Parameters |
|------|---------|------------|
| `schedule_content` | Schedule posts | content, platforms, datetime |
| `get_analytics` | Get platform analytics | platform, date_range |

## Evaluator MCP Tools

| Tool | Purpose | Output |
|------|---------|--------|
| `evaluate_content` | Score content quality | 0-100 score, grades |
| `evaluate_hook` | Analyze hook effectiveness | Hook score, suggestions |
| `track_performance` | Track metrics | Performance data |
| `get_metrics` | View performance | Metrics dashboard |
| `get_audit_trail` | View creation history | Audit log |

## Using MCP Tools

### Direct Tool Call
```bash
# Via skill trigger (recommended)
skill:evaluator, evaluate this content

# Or use the tool directly
<tool_call>
  tool: evaluate_content
  args: {
    content: "Your content here",
    dimensions: ["readability", "engagement"]
  }
</tool_call>
```

### Quality Scoring
The evaluator scores content on multiple dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| readability | 20% | Easy to read and understand |
| engagement | 25% | Likely to capture attention |
| brandVoice | 20% | Matches brand tone |
| platformOptimization | 20% | Platform-native format |
| seo | 10% | Search engine optimization |
| authenticity | 5% | Genuine, not spammy |

**Grades:** A+ (95+), A (90-94), B+ (85-89), B (80-84), C+ (75-79), C (70-74), D (60-69), F (<60)

## For AI Agents

When using MCP tools:

1. **Use skill triggers first** - Let the system route to tools
2. **Understand available tools** - Know what each MCP provides
3. **Evaluate quality** - Use `evaluate_content` on drafts
4. **Track performance** - Use `get_analytics` after publishing
5. **Follow guidelines** - Each tool has specific parameters

## Configuration

To use MCP servers, add to your IDE configuration:

```json
{
  "mcpServers": {
    "agentic-creator-os": {
      "command": "node",
      "args": ["path/to/mcp-servers/creator/build/index.js"]
    },
    "agentic-evaluator": {
      "command": "node", 
      "args": ["path/to/mcp-servers/evaluator/build/index.js"]
    }
  }
}
```

## Build Process

```bash
# Build creator MCP
cd mcp-servers/creator
npm run build:fast

# Build evaluator MCP
cd mcp-servers/evaluator
npm run build:fast
```

## Related Directories

| Directory | Purpose |
|-----------|---------|
| `skills/` | Triggers that use these tools |
| `workflows/` | Processes that call these tools |
| `drafts/` | Content to evaluate |
| `outputs/` | Content to publish |

---

**MCP tools power your content. Use skills to trigger workflows, use tools to create and evaluate.**
</claude-mem-context>
