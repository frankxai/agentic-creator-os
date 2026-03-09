# AGENTS.md

## Cursor Cloud specific instructions

This is a **configuration-over-code** AI agent skill framework (not a traditional web app). The "application" is the set of MCP servers, the `install.sh` installer, and the skill/command/agent markdown files.

### Services overview

| Service | Description | How to run |
|---------|-------------|------------|
| MCP Servers (7) | TypeScript MCP servers (stdio-based, no HTTP) | `node mcp-servers/<name>/build/index.js` |
| Installer | Multi-platform installer script | `./install.sh --platform=<cursor\|claude\|windsurf\|gemini\|generic>` |

### Key caveats

- **`tsc` builds hang or fail** for most MCP servers due to deep type inference with `@modelcontextprotocol/sdk`. Use `npm run build:fast` (esbuild) for `creator` and `evaluator` servers. Other servers have pre-built `build/index.js` files committed to the repo.
- **MCP servers communicate via stdio**, not HTTP. To test, pipe JSON-RPC messages: `echo '{"jsonrpc":"2.0","id":1,"method":"initialize",...}' | node mcp-servers/<name>/build/index.js`.
- **No ESLint or test framework** is configured in the repository. TypeScript compilation (`tsc`) serves as the type-checking/lint step but has the issues noted above.
- The `evaluator` MCP server's pre-built output may be missing; rebuild with `cd mcp-servers/evaluator && npm run build:fast`.
- The root `package.json` uses npm workspaces (`mcp-servers/*`). A single `npm install` at the root installs all workspace dependencies.
- All standard commands are in `package.json` scripts: `npm run build:all`, `npm run install:all`, `npm run dev:all`.
