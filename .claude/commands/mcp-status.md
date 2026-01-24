---
description: Check MCP server status and get recommendations for current work
thinking: false
---

# MCP Server Status Check

## Currently Configured MCP Servers

### FrankX Project
- **nano-banana** - Gemini image generation (Toggle: `@nano-banana turn on/off`)
- **next-devtools** - Next.js 16 dev tools (Toggle: `@next-devtools turn on/off`)

### Arcanea Project
- **next-devtools** - Next.js 16 dev tools (Toggle: `@next-devtools turn on/off`)

## Check Active Servers

Run `/mcp` to see which servers are currently enabled and consuming context.

## Recommendations

**For Next.js Development:**
```
@next-devtools turn on
```

**For Image Generation:**
```
@nano-banana turn on
```

**For Deployment:**
```
@next-devtools turn on  # For pre-deployment checks
```

**When Finished:**
```
@server-name turn off  # Disable any server you enabled
```

## Context Optimization

Enabled MCP servers consume part of your context window even when not actively used. Keep only necessary servers enabled during your session.

**Best Practice:**
1. Enable server before using
2. Work with the tools
3. Disable when switching tasks

## Need More Servers?

### Add Vercel MCP (when available)
```bash
claude mcp add --transport stdio vercel -- npx vercel-mcp
```

### Add GitHub MCP
```bash
claude mcp add --transport stdio github -- npx @modelcontextprotocol/server-github
```

### Add other MCP servers
Browse available servers at: https://mcpcat.io

---

**Quick Reference:** See `MCP_QUICK_REFERENCE.md` for common commands and workflows.
