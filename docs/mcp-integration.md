# MCP Integration Guide

Model Context Protocol (MCP) servers extend Claude's capabilities with external tools. This guide covers setting up and using MCP servers with Agentic Creator OS.

## What is MCP?

MCP (Model Context Protocol) is Anthropic's standard for connecting AI assistants to external tools and data sources. MCP servers provide:

- **Tools**: Actions Claude can perform (read files, query databases, send emails)
- **Resources**: Data Claude can access (files, database records, API responses)
- **Prompts**: Pre-configured prompt templates

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLAUDE CODE                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    MCP CLIENT                             │   │
│  └───────────────────────────┬──────────────────────────────┘   │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
   ┌───────────┐         ┌───────────┐         ┌───────────┐
   │  Browser  │         │  Memory   │         │  Database │
   │   Server  │         │   Server  │         │   Server  │
   │           │         │           │         │           │
   │ Playwright│         │ Knowledge │         │  SQLite   │
   │ Automation│         │   Graph   │         │  Queries  │
   └───────────┘         └───────────┘         └───────────┘
```

## Available MCP Servers

### Browser Server (Playwright)

Web automation and testing capabilities.

**Capabilities:**
- Navigate to URLs
- Take screenshots
- Click elements
- Fill forms
- Execute JavaScript

**Installation:**
```bash
npm install @anthropic/mcp-browser
```

**Configuration:**
```json
{
  "mcpServers": {
    "browser": {
      "command": "npx",
      "args": ["@anthropic/mcp-browser"]
    }
  }
}
```

**Usage examples:**
```
"Take a screenshot of frankx.ai"
"Click the login button on the page"
"Fill the contact form with my details"
```

### Memory Server

Persistent knowledge storage using a knowledge graph.

**Capabilities:**
- Create entities with observations
- Build relationships between entities
- Search and retrieve knowledge
- Persist across sessions

**Installation:**
```bash
npm install @anthropic/mcp-memory
```

**Configuration:**
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["@anthropic/mcp-memory"],
      "env": {
        "MEMORY_FILE": "~/.claude/memory.json"
      }
    }
  }
}
```

**Usage examples:**
```
"Remember that the project deadline is January 30"
"What do you know about the content strategy?"
"Create a relationship between Project A and Client B"
```

### Sequential Thinking Server

Structured reasoning for complex problems.

**Capabilities:**
- Break down complex problems
- Track reasoning steps
- Revise and refine thinking
- Branch into alternative approaches

**Installation:**
```bash
npm install @anthropic/mcp-sequential-thinking
```

**Configuration:**
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["@anthropic/mcp-sequential-thinking"]
    }
  }
}
```

**Usage examples:**
```
"Think through this architecture decision step by step"
"Analyze the pros and cons systematically"
```

### Filesystem Server

Read and write files with permissions.

**Capabilities:**
- Read files and directories
- Write and create files
- Search with glob patterns
- Watch for changes

**Configuration:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "@anthropic/mcp-filesystem",
        "--allow-read", "/path/to/allowed",
        "--allow-write", "/path/to/allowed"
      ]
    }
  }
}
```

### Custom Servers

Agentic Creator OS includes custom MCP servers:

#### Creator Server
Social media platform integrations.

```
mcp-servers/creator/
├── package.json
├── src/
│   ├── index.ts
│   ├── platforms/
│   │   ├── twitter.ts
│   │   ├── linkedin.ts
│   │   └── instagram.ts
│   └── tools/
│       ├── post.ts
│       ├── schedule.ts
│       └── analytics.ts
```

#### Database Server
Content and analytics storage.

```
mcp-servers/database/
├── package.json
├── src/
│   ├── index.ts
│   ├── schema.ts
│   └── tools/
│       ├── query.ts
│       ├── insert.ts
│       └── update.ts
```

#### Email Server
Newsletter and notification delivery.

```
mcp-servers/email/
├── package.json
├── src/
│   ├── index.ts
│   └── tools/
│       ├── send.ts
│       ├── template.ts
│       └── subscribe.ts
```

## Setting Up MCP

### Step 1: Configure Claude Code

Add MCP servers to your Claude Code settings:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/claude/claude_desktop_config.json`

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
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["@anthropic/mcp-sequential-thinking"]
    }
  }
}
```

### Step 2: Install Server Dependencies

```bash
cd agentic-creator-os/mcp-servers

# Install all servers
npm install --workspaces

# Or install individually
cd browser && npm install
cd ../database && npm install
```

### Step 3: Configure Environment

Create `.env` in the MCP server directory:

```bash
# Browser Server
BROWSER_HEADLESS=true
BROWSER_TIMEOUT=30000

# Database Server
DATABASE_URL=sqlite:./data/content.db

# Email Server
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=hello@frankx.ai

# Creator Server
TWITTER_API_KEY=xxxxx
LINKEDIN_ACCESS_TOKEN=xxxxx
```

### Step 4: Test Connection

```bash
# Check server status
acos mcp status

# Test specific server
acos mcp test browser
```

## Using MCP in Skills

Skills can declare MCP tool requirements:

```yaml
# In SKILL.md frontmatter
---
name: social-publishing
mcp_tools:
  - browser: [navigate, screenshot]
  - creator: [post, schedule]
  - database: [query, insert]
---
```

When the skill activates, Claude gains access to these tools:

```markdown
## Publishing Workflow

1. Create content draft
2. Use `browser` to preview on staging
3. Use `creator` to post to social platforms
4. Use `database` to log publication
```

## Using MCP in Workflows

Workflows can incorporate MCP actions:

```yaml
steps:
  - id: research
    type: tool
    tool: browser
    action: navigate
    params:
      url: "https://example.com/article"

  - id: extract
    type: tool
    tool: browser
    action: evaluate
    params:
      script: "document.querySelector('article').innerText"

  - id: save
    type: tool
    tool: database
    action: insert
    params:
      table: research
      data: ${extract.output}
```

## Building Custom MCP Servers

### Server Template

```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

const server = new Server({
  name: 'my-server',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
})

// Define tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'my_tool',
      description: 'Description of what this tool does',
      inputSchema: {
        type: 'object',
        properties: {
          param1: { type: 'string', description: 'Parameter description' }
        },
        required: ['param1']
      }
    }
  ]
}))

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params

  if (name === 'my_tool') {
    // Implement tool logic
    const result = await doSomething(args.param1)
    return { content: [{ type: 'text', text: JSON.stringify(result) }] }
  }

  throw new Error(`Unknown tool: ${name}`)
})

// Start server
const transport = new StdioServerTransport()
await server.connect(transport)
```

### Package Configuration

```json
{
  "name": "@frankx/mcp-my-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mcp-my-server": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
```

## Security Considerations

### Principle of Least Privilege

Only grant necessary permissions:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "@anthropic/mcp-filesystem",
        "--allow-read", "./content",
        "--allow-write", "./drafts"
        // NOT --allow-write "/"
      ]
    }
  }
}
```

### Environment Variable Protection

Never commit sensitive values:

```bash
# .env (never commit)
API_KEY=secret_xxxxx

# .env.example (commit this)
API_KEY=your_api_key_here
```

### API Rate Limiting

Implement rate limits in custom servers:

```typescript
const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000 // 1 minute
})

server.setRequestHandler('tools/call', async (request) => {
  await rateLimiter.check()
  // ... tool implementation
})
```

## Troubleshooting

### Server Not Connecting

1. Check server is installed: `which npx @anthropic/mcp-browser`
2. Verify configuration path is correct
3. Check logs: `tail -f ~/.claude/logs/mcp.log`

### Tool Not Available

1. Verify tool is listed: ask Claude "what tools do you have?"
2. Check skill declares the tool in frontmatter
3. Restart Claude Code after config changes

### Permission Denied

1. Check file/directory permissions
2. Verify allowed paths in server config
3. Check API keys are valid

### Timeout Errors

1. Increase timeout in server config
2. Check network connectivity
3. Verify external API status

---

## Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Official MCP Servers](https://github.com/modelcontextprotocol/servers)
- [Building MCP Servers](https://modelcontextprotocol.io/docs/building-servers)

---

Next: [Contributing](./contributing.md) - How to contribute to Agentic Creator OS
