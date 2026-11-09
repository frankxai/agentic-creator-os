# MCP Servers (Optional)

ACOS includes 7 optional MCP server implementations. These extend your AI agent's capabilities with external tools.

## Important

These servers are **optional add-ons**, not required for ACOS to work. Skills, commands, and agents function without MCP servers.

**These do NOT conflict with your existing MCP setup.** If you already have MCP servers configured in `~/.claude/settings.json` (like nano-banana, browser-use, etc.), ACOS MCP servers are completely separate. You choose which to install.

## Available Servers

| Server | Purpose | Dependencies |
|--------|---------|-------------|
| `browser/` | Playwright-based browser automation | playwright |
| `creator/` | Creator CRM plus simulated social drafts and scheduling (no platform APIs) | MCP SDK |
| `database/` | LibSQL database backend | libsql |
| `email/` | Email delivery | MCP SDK |
| `evaluator/` | Quality evaluation & audit logging | MCP SDK |
| `filesystem/` | File operations inside FILESYSTEM_ALLOWED_DIRS | MCP SDK |
| `website/` | Next.js project scaffolding (pages, API routes) | MCP SDK |

Tool names carry the server prefix (`browser_navigate`, `database_query`, ...). Every tool declares annotations and an output schema, and `test/mcp-contract.test.mjs` holds each server to the `mcp-doctor score` criteria.

## Installation

```bash
# Build all servers
./build-servers.sh

# Or install via the main installer
./install.sh --mcp-only
```

## Adding to Your Config

After building, add servers to your Claude Code MCP config (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "acos-creator": {
      "command": "node",
      "args": ["path/to/agentic-creator-os/mcp-servers/creator/build/index.js"]
    }
  }
}
```

Only add the servers you actually need. Each server adds ~100-150MB memory overhead.

## When to Use

- **creator/** — If you use `/article-creator` or `/generate-social` frequently
- **evaluator/** — If you want automated quality scoring on content
- **database/** — If you need persistent storage for trajectories or patterns
- **browser/** — If you need web scraping or browser automation
- **email/** — If you want email delivery from ACOS workflows

Most users don't need these. The core ACOS experience (skills + commands + agents) works without MCP servers.
