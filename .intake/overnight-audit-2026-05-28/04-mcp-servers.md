# MCP Server Audit — Agentic Creator OS
Date: 2026-05-28

---

## 1. Server Inventory

| Server | Transport | SDK | Tool Count | Tool Naming | Build Present | Status |
|--------|-----------|-----|------------|-------------|---------------|--------|
| browser | stdio | `@modelcontextprotocol/sdk` McpServer | 9 | `snake_case` | Yes | Functional |
| creator | stdio | `@modelcontextprotocol/sdk` McpServer | 27 | `snake_case` (mixed: `platform_verb` + `verb_noun`) | Yes | Functional |
| database | stdio | `@modelcontextprotocol/sdk` McpServer | 12 | `snake_case` | Yes | Functional |
| email | stdio | `@modelcontextprotocol/sdk` McpServer | 7 | `snake_case` | Yes | Functional |
| evaluator | stdio | `@modelcontextprotocol/sdk` Server (low-level) | 7 | `snake_case` | **No** | Build missing |
| filesystem | stdio | `@modelcontextprotocol/sdk` McpServer | 6 | `snake_case` | Yes | Functional |
| website | stdio | `@modelcontextprotocol/sdk` McpServer | 4 | `snake_case` | Yes | Narrow scope |

All servers use `"bin"` entries: **none**. Entry point is `build/index.js` called by consumer config with `node`.

---

## 2. Per-Server Detail

### browser
9 tools: `navigate`, `get_page_content`, `click`, `fill_input`, `screenshot`, `evaluate`, `get_links`, `wait_for_selector`, `close`.

Uses `McpServer.registerTool` (high-level API). Zod validation on all inputs. Single persistent page instance via module-level globals (`browser`, `page`) — not session-aware, not multi-tab. `screenshot` uses a CommonJS `require("fs/promises")` inside an ESM module, which will throw at runtime. Auth: none. Tests: none.

### creator
27 tools spread across articles/clients/projects (12 tools, in-memory Maps), social platforms (15 tools via imported modules: `twitter_post`, `twitter_thread`, `twitter_analytics`, `linkedin_post`, `linkedin_article`, `linkedin_analytics`, `instagram_post`, `instagram_story`, `instagram_analytics`, `farcaster_cast`, `farcaster_thread`, `farcaster_frame`, `farcaster_analytics`), aggregated analytics (3: `analytics_aggregated`, `analytics_best_times`, `analytics_trends`), and scheduling (6: `schedule_content`, `schedule_bulk`, `schedule_list`, `schedule_upcoming`, `schedule_cancel`, `schedule_reschedule`).

Uses high-level `McpServer.registerTool`. Zod validation present. Social platform modules (`twitter.ts`, etc.) are stubs using in-memory storage — no real API calls, no OAuth tokens, no credentials. Article/client/project data lives in process-local Maps; all state is lost on restart. Naming mixes conventions: analytics tools use `analytics_*` prefix while scheduling tools use `schedule_*` prefix, but social platform tools use `platform_verb` (e.g., `twitter_post`). Auth: none. Tests: none.

### database
12 tools: `query`, `execute`, `get_article`, `create_article`, `update_article`, `list_articles`, `get_workflow`, `save_workflow`, `get_key_value`, `set_key_value`, `store_memory`, `recall_memory`.

Uses `@libsql/client` against a local SQLite file (`acos.db`) or Turso cloud via env vars `DB_URL` / `DB_AUTH_TOKEN`. High-level `McpServer.registerTool`. Zod validation present. The raw `query` and `execute` tools accept arbitrary SQL strings with no allowlist or read/write enforcement — `query` is annotated `readOnlyHint: true` but the handler will happily execute any SQL including DDL or DELETE. `execute` uses parameterized queries; `query` does not, making it a SQL injection surface. Agent memory table has an `embedding BLOB` column that is never populated. Auth: none. Tests: none.

### email
7 tools: `send_email`, `send_template_email`, `send_welcome_email`, `send_notification`, `verify_connection`, `add_template`, `list_templates`.

Uses `nodemailer` with SMTP credentials from env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`). Defaults hardcode `smtp.example.com` — the server will fail silently at start if env vars are not set (no startup validation). Template variable substitution uses a regex loop that is vulnerable to catastrophic backtracking on malicious input (the pattern `new RegExp(key)` treats the key as a live regex). `send_email` is annotated `destructiveHint: true`, which is the only tool in the set with accurate side-effect labeling. Auth: none (callers can supply arbitrary `to` recipients). Tests: none.

### evaluator
7 tools declared: `evaluate_content`, `evaluate_hook`, `track_performance`, `get_metrics`, `get_audit_trail`, `compare_content`, `generate_improvements`.

This server is architecturally different from all others: it uses the low-level `Server` class with `setRequestHandler(ListToolsRequestSchema)` / `setRequestHandler(CallToolRequestSchema)` rather than `McpServer.registerTool`. Tool schemas are hand-duplicated as plain JSON objects inside `ListToolsRequestSchema` while Zod schemas exist separately — they can drift. `generate_improvements` references a focusArea property via a `z.enum(...)` call directly inside a plain object JSON schema block, which is a bug (Zod inside JSON schema). The build directory is missing entirely, making this the only server that cannot be started without running `tsc` or `esbuild` first. Tests: none.

### filesystem
6 tools: `read_file`, `write_file`, `list_directory`, `create_directory`, `delete_file`, `file_exists`.

Path validation via `validatePath` uses `fs.realpath` and checks against `allowedDirectories` (configured from `FILESYSTEM_ALLOWED_DIRS` env var, defaulting to `process.cwd()`). This is the only server with any access control. However, `write_file` calls `validatePath` before the file exists — `fs.realpath` will throw for non-existent paths, making it impossible to write new files to an allowed directory without that file already existing. Auth: none. Tests: none.

### website
4 tools: `create_nextjs_project`, `add_page`, `add_api_route`, `get_project_structure`.

Scaffolds Next.js 14 projects by writing hardcoded config files to disk. No path validation (unlike filesystem server). `get_project_structure` recurses without depth limit — can hang on large or circular-symlink trees. Despite its name, this is a scaffolding server, not a web scraping or deployment server. README.md lists it as "Web scraping & content extraction" — the description is wrong. Auth: none. Tests: none.

---

## 3. Architectural Inconsistencies

**SDK API split.** Six servers use the modern high-level `McpServer.registerTool` API. Evaluator alone uses the low-level `Server` + `setRequestHandler` pattern from an earlier SDK era. This means evaluator's tool annotations (read-only hints, destructive hints) are absent entirely, and its input validation path is different from every other server.

**Tool naming inconsistency in creator.** Three distinct naming styles appear in one server: `verb_noun` for articles/clients/projects (`create_article`, `list_clients`), `platform_verb` for social (`twitter_post`, `instagram_story`), and `category_verb` for analytics/scheduling (`analytics_aggregated`, `schedule_upcoming`). No single convention.

**Overlapping article CRUD.** Both `creator` and `database` expose `create_article`, `get_article`, `update_article`, and `list_articles`. Creator stores articles in an in-memory Map (ephemeral); database stores them in SQLite (persistent). There is no coordination. An agent calling `create_article` will get different behavior depending on which server it targets.

**Overlapping browser/website scope.** The `browser` server does full Playwright automation. The `website` server does file-based scaffolding. The names suggest both relate to "web" work; README describes website as "scraping & content extraction" but the implementation is a Next.js scaffolding tool. A reader navigating the server list cannot tell which to use for web-related tasks without reading source.

**Filesystem duplication.** The `filesystem` server provides `read_file` / `write_file` / `list_directory`. The `website` server also calls `fs.mkdir` and `fs.writeFile` directly without going through the filesystem server or any path validation. These two servers share a concern but are uncoordinated.

**Missing `bin` entries in all seven package.json files.** None of the server packages define a `"bin"` field, so they cannot be invoked via `npx @agentic-creator-os/creator-mcp` or similar. Consumers must know to call `node build/index.js` explicitly.

**Evaluator has no build directory.** All other servers ship a `build/` directory. Evaluator only has `src/`. It cannot be started without a local build step, and no build artifacts are present in the repo at the time of this audit.

---

## 4. Integration Coverage

**.mcp.json (project-level MCP config):** References only `claude-flow` — none of the seven ACOS servers are wired here.

**opencode.json:** References `acos-creator` and `agentic-evaluator` via hardcoded absolute paths (`C:/Users/Frank/FrankX/FrankX.AI - Vercel Website/...`) that are stale — this path no longer matches the repo's location on disk.

**instances/frankx/config.json:** Acknowledges the `mcp-servers` directory by path only; contains no MCP server registration.

**CLAUDE.md (project root):** Mentions `/mcp-status` command and references MCP servers as part of optional add-ons.

**mcp-servers/README.md:** Describes all 7 servers as optional and provides manual config snippets, but these are not integrated into any active config file.

**mcp-servers/CLAUDE.md:** Documents only `creator` and `evaluator`. The remaining five servers (browser, database, email, filesystem, website) are not mentioned despite all being present.

Summary: Zero servers are live in the project-level MCP config. Two servers (`creator`, `evaluator`) have stale path references in `opencode.json`. Five servers have no integration references anywhere. The evaluator is the only server the CLAUDE.md context file attempts to document for agent use.

---

## 5. Top 10 Improvements

1. **Fix evaluator build.** The evaluator has no `build/` directory and is the most-documented server in CLAUDE.md. Run `esbuild` or `tsc`, commit the output, or add it to `build-servers.sh` CI and document the pre-requisite step clearly.

2. **Migrate evaluator to McpServer.registerTool.** The low-level `setRequestHandler` pattern duplicates schema definitions and loses automatic input validation, structured output, and tool annotations. Migrating to the high-level API removes the JSON/Zod schema drift and makes it consistent with the other six servers.

3. **Fix filesystem write_file path validation.** `validatePath` calls `fs.realpath` which throws for non-existent files. The tool should validate the parent directory is allowed, then permit writes to new files within it.

4. **Fix browser screenshot CJS/ESM bug.** `require("fs/promises")` inside an ESM module throws at runtime. Replace with a static `import * as fsPromises from "fs/promises"` at the top of the file.

5. **Resolve article CRUD duplication between creator and database.** Either remove article tools from `creator` (directing agents to use `database` for persistence) or route `creator`'s article operations through the `database` server. Document the intended division.

6. **Add `bin` entries to all server package.json files.** Each server should have `"bin": { "acos-<name>": "./build/index.js" }` so they can be invoked via npx without knowing internal paths.

7. **Update opencode.json paths.** The hardcoded `C:/Users/Frank/FrankX/...` paths are stale. Replace with relative paths (e.g., `./mcp-servers/creator/build/index.js`) or use `$PWD`-relative notation.

8. **Wire at least creator and evaluator into .mcp.json.** These are the two servers actively documented for agent use. Adding them to `.mcp.json` with relative paths makes them immediately usable by any Claude Code session in the repo without manual config.

9. **Fix the email template regex injection.** `new RegExp(key)` treats user-supplied template variable names as live regex patterns. Escape keys with `key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` or use string-split replacement instead.

10. **Correct the website server's README description and CLAUDE.md scope.** README says "Web scraping & content extraction"; the server scaffolds Next.js projects. Rename or split the server to match its actual purpose, and add all five undocumented servers (browser, database, email, filesystem, website) to mcp-servers/CLAUDE.md.
