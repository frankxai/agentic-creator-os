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

Every tool name carries its server prefix (`creator_`, `evaluator_`, ...) so agents with many servers loaded pick the right one. Tools return `structuredContent` matching a declared `outputSchema`, plus the same JSON as text.

### Social Media Tools (simulated)
The social tools record posts in the server's memory only; no platform API is called and nothing is published. Analytics tools return randomly generated sample numbers, flagged `simulated: true`.

| Tool | Purpose | Parameters |
|------|---------|------------|
| `creator_twitter_post` | Record a single tweet | text, mediaUrls, replyToId, scheduledFor |
| `creator_twitter_thread` | Record a thread | tweets[], scheduledFor |
| `creator_linkedin_post` | Record a LinkedIn post | text, mediaUrls, visibility, scheduledFor |
| `creator_linkedin_article` | Record a LinkedIn article | title, content, tags, publishNow |
| `creator_instagram_post` | Record an Instagram post | caption, mediaUrls, type, tags |
| `creator_instagram_story` | Record an Instagram story | mediaUrl, type, link, stickers |
| `creator_farcaster_cast` | Record a Farcaster cast | text, channelId, embeds, mentions |
| `creator_farcaster_thread` | Record a Farcaster thread | casts[], channelId |

### Scheduling & Analytics
| Tool | Purpose | Parameters |
|------|---------|------------|
| `creator_schedule_content` | Queue one item | platform, type, content, scheduledFor |
| `creator_schedule_list` | List the queue | platform, status, startDate, endDate, limit |
| `creator_analytics_aggregated` | Cross-platform summary (sample data) | startDate, endDate, platforms |

## Evaluator MCP Tools

| Tool | Purpose | Output |
|------|---------|--------|
| `evaluator_evaluate_content` | Score content quality | 0-100 scores, grade, evaluationId |
| `evaluator_evaluate_hook` | Analyze hook effectiveness | Hook scores, suggestions |
| `evaluator_track_performance` | Record real metrics for an evaluationId | Accuracy percentage |
| `evaluator_get_metrics` | View performance | Aggregated metrics |
| `evaluator_get_audit_trail` | View evaluation history | Audit entries |
| `evaluator_compare_content` | Compare two versions | Per-metric winner |
| `evaluator_generate_improvements` | Suggest edits | Ranked suggestions |

## Using MCP Tools

### Direct Tool Call
```bash
# Via skill trigger (recommended)
skill:evaluator, evaluate this content

# Or use the tool directly
<tool_call>
  tool: evaluator_evaluate_content
  args: {
    content: "Your content here",
    contentType: "linkedin"
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
3. **Evaluate quality** - Use `evaluator_evaluate_content` on drafts
4. **Track performance** - Use `evaluator_track_performance` with real numbers after publishing
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
