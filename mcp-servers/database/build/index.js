/**
 * Database MCP Server for Agentic Creator OS
 *
 * Uses libsql for universal SQLite compatibility (no native compilation required).
 * Works on Node.js 18, 20, 22, 24+ without any build issues.
 *
 * @version 1.1.0
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from "@libsql/client";
// Initialize libsql client (local SQLite or Turso cloud)
const db = createClient({
    url: process.env.DB_URL || "file:acos.db",
    authToken: process.env.DB_AUTH_TOKEN, // Optional: for Turso cloud
});
const server = new McpServer({
    name: "database",
    version: "1.1.0"
});
// Initialize tables
async function initDb() {
    await db.execute(`
    CREATE TABLE IF NOT EXISTS creator_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'string',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    await db.execute(`
    CREATE TABLE IF NOT EXISTS workflows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      steps TEXT NOT NULL,
      config TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    await db.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      tags TEXT DEFAULT '[]',
      metadata TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    await db.execute(`
    CREATE TABLE IF NOT EXISTS agent_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      session_id TEXT,
      memory_type TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding BLOB,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_agent_memory_agent ON agent_memory(agent_id)
  `);
}
const STATUSES = ["draft", "published", "archived"];
const MEMORY_TYPES = ["observation", "reflection", "plan", "fact"];
const sqlInput = z.string().min(1).max(20000);
const identifier = z.string().min(1).max(200);
const articleShape = z.object({
    id: z.number().describe("Article ID"),
    title: z.string().describe("Title"),
    content: z.string().describe("Body text"),
    status: z.string().describe("draft, published or archived"),
    tags: z.array(z.string()).describe("Tags"),
    created_at: z.string().describe("Creation time (UTC, SQLite format)"),
    updated_at: z.string().describe("Last update time (UTC, SQLite format)")
}).passthrough();
const memoryShape = z.object({
    id: z.number().describe("Memory ID"),
    agent_id: z.string().describe("Agent that owns the memory"),
    session_id: z.string().nullable().describe("Session the memory came from, if any"),
    memory_type: z.string().describe("observation, reflection, plan or fact"),
    content: z.string().describe("Memory text"),
    created_at: z.string().describe("Creation time (UTC, SQLite format)")
}).passthrough();
/** JSON round trip: libsql Row objects become plain objects, so the text block and structuredContent match. */
function ok(data) {
    const plain = JSON.parse(JSON.stringify(data));
    return { content: [{ type: "text", text: JSON.stringify(plain, null, 2) }], structuredContent: plain };
}
function fail(message) {
    return { content: [{ type: "text", text: message }], isError: true };
}
function toArticle(row) {
    let tags = [];
    try {
        tags = JSON.parse(String(row.tags ?? "[]"));
    }
    catch {
        tags = [];
    }
    return { ...row, tags };
}
function toMemory(row) {
    const { embedding: _unused, ...rest } = row;
    return rest;
}
server.registerTool("database_query", {
    title: "Run read-only SQL query",
    description: "Run one read-only SQL statement (SELECT, WITH, EXPLAIN) against the ACOS database (DB_URL, default local acos.db). Writes are rolled back and reported as an error; use database_execute to change data. Returns column names and up to limit rows.",
    inputSchema: {
        sql: sqlInput.describe("One SQL statement with literal values (no ? placeholders)"),
        limit: z.number().int().min(1).max(1000).default(100).describe("Maximum rows to return; truncated is true when the query produced more")
    },
    outputSchema: {
        columns: z.array(z.string()).describe("Column names in result order"),
        rows: z.array(z.record(z.unknown())).describe("Result rows as column-to-value objects"),
        rowCount: z.number().describe("Rows the query produced before the limit"),
        truncated: z.boolean().describe("True when rows were cut at limit")
    },
    annotations: { readOnlyHint: true, openWorldHint: false }
}, async ({ sql, limit }) => {
    const tx = await db.transaction("read");
    try {
        const result = await tx.execute(sql);
        if (result.rowsAffected > 0) {
            return fail(`database_query is read-only: the statement would change ${result.rowsAffected} row(s) and was rolled back. Use database_execute for writes.`);
        }
        return ok({ columns: result.columns, rows: result.rows.slice(0, limit), rowCount: result.rows.length, truncated: result.rows.length > limit });
    }
    catch (error) {
        return fail(`Query error: ${error}`);
    }
    finally {
        await tx.rollback().catch(() => undefined);
        tx.close();
    }
});
server.registerTool("database_execute", {
    title: "Execute SQL statement",
    description: "Execute one SQL statement that changes data (INSERT, UPDATE, DELETE, CREATE) against the ACOS database, with ? placeholders bound from params. Changes are committed immediately and cannot be undone. Returns rows affected and the last insert row ID.",
    inputSchema: {
        sql: sqlInput.describe("One SQL statement with ? placeholders for values"),
        params: z.array(z.string().max(100000)).max(100).default([]).describe("Values bound to the ? placeholders in order, as text; SQLite column affinity converts numeric text for INTEGER and REAL columns")
    },
    outputSchema: {
        changes: z.number().describe("Rows inserted, updated or deleted"),
        lastInsertRowid: z.number().nullable().describe("Row ID of the last insert, or null when nothing was inserted")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }
}, async ({ sql, params }) => {
    try {
        const result = await db.execute({ sql, args: params });
        return ok({ changes: result.rowsAffected, lastInsertRowid: result.lastInsertRowid === undefined ? null : Number(result.lastInsertRowid) });
    }
    catch (error) {
        return fail(`Execution error: ${error}`);
    }
});
server.registerTool("database_get_article", {
    title: "Get article",
    description: "Fetch one stored article by its numeric ID, as returned by database_create_article or database_list_articles. Returns the full article including body text and tags, or article null when no article has that ID. One indexed lookup.",
    inputSchema: {
        id: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER).describe("Article ID")
    },
    outputSchema: {
        article: articleShape.nullable().describe("The article, or null when not found")
    },
    annotations: { readOnlyHint: true, openWorldHint: false }
}, async ({ id }) => {
    try {
        const result = await db.execute({ sql: "SELECT * FROM articles WHERE id = ?", args: [id] });
        return ok({ article: result.rows[0] ? toArticle(result.rows[0]) : null });
    }
    catch (error) {
        return fail(`Error: ${error}`);
    }
});
server.registerTool("database_create_article", {
    title: "Create article",
    description: "Store a new article as a draft in the ACOS database, persisting across sessions. Each call creates a new row, so do not retry blindly. Returns the new numeric article ID to use with database_update_article or database_get_article.",
    inputSchema: {
        title: z.string().min(1).max(500).describe("Article title"),
        content: z.string().max(500000).describe("Article body, usually Markdown"),
        tags: z.array(z.string().max(100)).max(50).default([]).describe("Tags for filtering and SEO")
    },
    outputSchema: {
        id: z.number().describe("ID of the new article")
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
}, async ({ title, content, tags }) => {
    try {
        const result = await db.execute({
            sql: "INSERT INTO articles (title, content, tags) VALUES (?, ?, ?)",
            args: [title, content, JSON.stringify(tags)]
        });
        return ok({ id: Number(result.lastInsertRowid) });
    }
    catch (error) {
        return fail(`Error: ${error}`);
    }
});
server.registerTool("database_update_article", {
    title: "Update article",
    description: "Overwrite the title, content and/or status of a stored article; omitted fields are kept and updated_at is refreshed. Previous values are not versioned. Returns the number of rows changed: 0 means no article has that ID.",
    inputSchema: {
        id: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER).describe("Article ID"),
        title: z.string().min(1).max(500).optional().describe("New title"),
        content: z.string().max(500000).optional().describe("New body, replacing the old one"),
        status: z.enum(STATUSES).optional().describe("New status")
    },
    outputSchema: {
        changes: z.number().describe("Rows updated: 1, or 0 when the ID does not exist")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
}, async ({ id, title, content, status }) => {
    try {
        const updates = [];
        const params = [];
        if (title !== undefined) {
            updates.push("title = ?");
            params.push(title);
        }
        if (content !== undefined) {
            updates.push("content = ?");
            params.push(content);
        }
        if (status !== undefined) {
            updates.push("status = ?");
            params.push(status);
        }
        updates.push("updated_at = CURRENT_TIMESTAMP");
        params.push(id);
        const result = await db.execute({ sql: `UPDATE articles SET ${updates.join(", ")} WHERE id = ?`, args: params });
        return ok({ changes: result.rowsAffected });
    }
    catch (error) {
        return fail(`Error: ${error}`);
    }
});
server.registerTool("database_list_articles", {
    title: "List articles",
    description: "List stored articles, newest first, optionally filtered by status (draft, published, archived). Use it to find an article ID or review the content pipeline. Returns up to limit articles (default 10, max 100) including their full body text.",
    inputSchema: {
        status: z.enum(STATUSES).optional().describe("Only return articles with this status"),
        limit: z.number().int().min(1).max(100).default(10).describe("Maximum number of articles")
    },
    outputSchema: {
        articles: z.array(articleShape).describe("Articles, newest first")
    },
    annotations: { readOnlyHint: true, openWorldHint: false }
}, async ({ status, limit }) => {
    try {
        let sql = "SELECT * FROM articles";
        const params = [];
        if (status !== undefined) {
            sql += " WHERE status = ?";
            params.push(status);
        }
        sql += " ORDER BY created_at DESC, id DESC LIMIT ?";
        params.push(limit);
        const result = await db.execute({ sql, args: params });
        return ok({ articles: result.rows.map((row) => toArticle(row)) });
    }
    catch (error) {
        return fail(`Error: ${error}`);
    }
});
server.registerTool("database_get_workflow", {
    title: "Get workflow",
    description: "Fetch one saved workflow definition by its unique name, as stored with database_save_workflow. Returns the department, the ordered steps and the config, or workflow null when no workflow has that name. One indexed lookup.",
    inputSchema: {
        name: identifier.describe("Workflow name")
    },
    outputSchema: {
        workflow: z.object({
            name: z.string().describe("Workflow name"),
            department: z.string().describe("Owning department"),
            steps: z.array(z.unknown()).describe("Ordered steps"),
            config: z.unknown().describe("Workflow configuration"),
            created_at: z.string().describe("When it was first saved")
        }).passthrough().nullable().describe("The workflow, or null when not found")
    },
    annotations: { readOnlyHint: true, openWorldHint: false }
}, async ({ name }) => {
    try {
        const result = await db.execute({ sql: "SELECT * FROM workflows WHERE name = ?", args: [name] });
        const row = result.rows[0];
        if (!row)
            return ok({ workflow: null });
        return ok({ workflow: { ...row, steps: JSON.parse(String(row.steps)), config: JSON.parse(String(row.config ?? "{}")) } });
    }
    catch (error) {
        return fail(`Error: ${error}`);
    }
});
server.registerTool("database_save_workflow", {
    title: "Save workflow",
    description: "Save a named workflow (department, ordered steps, optional JSON config), replacing any workflow with the same name. Use it to persist a reusable content or ops pipeline. Returns the name and rows changed; one local write.",
    inputSchema: {
        name: identifier.describe("Unique workflow name; an existing workflow with this name is replaced"),
        department: z.string().min(1).max(100).describe("Department that owns the workflow"),
        steps: z.array(z.string().max(5000)).min(1).max(100).describe("Ordered steps, each a short instruction or a JSON-encoded step object"),
        config: z.string().max(50000).optional().describe("Optional JSON object text with workflow settings, e.g. {\"cadence\":\"weekly\"}")
    },
    outputSchema: {
        name: z.string().describe("Saved workflow name"),
        changes: z.number().describe("Rows written")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
}, async ({ name, department, steps, config }) => {
    let parsedConfig = {};
    if (config !== undefined) {
        try {
            parsedConfig = JSON.parse(config);
        }
        catch {
            return fail("config is not valid JSON; pass a JSON object as text, e.g. {\"cadence\":\"weekly\"}");
        }
    }
    try {
        const result = await db.execute({
            sql: "INSERT OR REPLACE INTO workflows (name, department, steps, config) VALUES (?, ?, ?, ?)",
            args: [name, department, JSON.stringify(steps), JSON.stringify(parsedConfig)]
        });
        return ok({ name, changes: result.rowsAffected });
    }
    catch (error) {
        return fail(`Error: ${error}`);
    }
});
server.registerTool("database_get_key_value", {
    title: "Get key value",
    description: "Read one value from the persistent key-value store by key. Use it for small settings and state shared across sessions. Returns found, the value decoded by its stored type (string, number or parsed JSON) and the type. One indexed lookup.",
    inputSchema: {
        key: identifier.describe("Key to read")
    },
    outputSchema: {
        key: z.string().describe("Key that was read"),
        found: z.boolean().describe("False when the key does not exist"),
        value: z.unknown().optional().describe("Decoded value, when found"),
        type: z.enum(["string", "number", "json"]).optional().describe("Stored type, when found")
    },
    annotations: { readOnlyHint: true, openWorldHint: false }
}, async ({ key }) => {
    try {
        const result = await db.execute({ sql: "SELECT * FROM creator_data WHERE key = ?", args: [key] });
        const row = result.rows[0];
        if (!row)
            return ok({ key, found: false });
        const type = String(row.type);
        const raw = String(row.value);
        const value = type === "json" ? JSON.parse(raw) : type === "number" ? Number(raw) : raw;
        return ok({ key, found: true, value, type });
    }
    catch (error) {
        return fail(`Error: ${error}`);
    }
});
server.registerTool("database_set_key_value", {
    title: "Set key value",
    description: "Write a value to the persistent key-value store, replacing any existing value for the key. The value is text: a plain string, a number, or JSON when type is json (validated before saving). Returns the key, stored text and type.",
    inputSchema: {
        key: identifier.describe("Key to write"),
        value: z.string().max(100000).describe("Value as text; for type json pass JSON, for type number a numeric string"),
        type: z.enum(["string", "number", "json"]).default("string").describe("How the value is decoded on read")
    },
    outputSchema: {
        key: z.string().describe("Key written"),
        value: z.string().describe("Stored text"),
        type: z.enum(["string", "number", "json"]).describe("Stored type")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
}, async ({ key, value, type }) => {
    if (type === "number" && !Number.isFinite(Number(value)))
        return fail(`'${value}' is not a number; use type string or pass a numeric value`);
    if (type === "json") {
        try {
            JSON.parse(value);
        }
        catch {
            return fail("value is not valid JSON; fix it or use type string");
        }
    }
    try {
        await db.execute({
            sql: "INSERT OR REPLACE INTO creator_data (key, value, type, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
            args: [key, value, type]
        });
        return ok({ key, value, type });
    }
    catch (error) {
        return fail(`Error: ${error}`);
    }
});
server.registerTool("database_store_memory", {
    title: "Store agent memory",
    description: "Append one memory entry (observation, reflection, plan or fact) for an agent, optionally tagged with a session. Memories persist across sessions and are read back with database_recall_memory. Each call adds a row. Returns the new memory ID.",
    inputSchema: {
        agent_id: identifier.describe("Agent identifier, e.g. content-strategist"),
        memory_type: z.enum(MEMORY_TYPES).describe("Kind of memory"),
        content: z.string().min(1).max(20000).describe("Memory text"),
        session_id: z.string().max(200).optional().describe("Session the memory belongs to")
    },
    outputSchema: {
        id: z.number().describe("New memory ID"),
        agent_id: z.string().describe("Agent identifier"),
        memory_type: z.enum(MEMORY_TYPES).describe("Kind of memory")
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
}, async ({ agent_id, memory_type, content, session_id }) => {
    try {
        const result = await db.execute({
            sql: "INSERT INTO agent_memory (agent_id, session_id, memory_type, content) VALUES (?, ?, ?, ?)",
            args: [agent_id, session_id || null, memory_type, content]
        });
        return ok({ id: Number(result.lastInsertRowid), agent_id, memory_type });
    }
    catch (error) {
        return fail(`Error: ${error}`);
    }
});
server.registerTool("database_recall_memory", {
    title: "Recall agent memory",
    description: "Read an agent's stored memories, newest first, optionally only one memory type. Use it at the start of a task to restore context. Returns up to limit entries (default 20, max 100) with their full text and count; no semantic search.",
    inputSchema: {
        agent_id: identifier.describe("Agent identifier"),
        memory_type: z.enum(MEMORY_TYPES).optional().describe("Only return this kind of memory"),
        limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of memories")
    },
    outputSchema: {
        memories: z.array(memoryShape).describe("Memories, newest first"),
        count: z.number().describe("Number of memories returned")
    },
    annotations: { readOnlyHint: true, openWorldHint: false }
}, async ({ agent_id, memory_type, limit }) => {
    try {
        let sql = "SELECT * FROM agent_memory WHERE agent_id = ?";
        const params = [agent_id];
        if (memory_type) {
            sql += " AND memory_type = ?";
            params.push(memory_type);
        }
        sql += " ORDER BY created_at DESC, id DESC LIMIT ?";
        params.push(limit);
        const result = await db.execute({ sql, args: params });
        const memories = result.rows.map((row) => toMemory(row));
        return ok({ memories, count: memories.length });
    }
    catch (error) {
        return fail(`Error: ${error}`);
    }
});
async function main() {
    await initDb();
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
//# sourceMappingURL=index.js.map