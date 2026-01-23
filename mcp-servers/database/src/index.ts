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
import { createClient, type Client } from "@libsql/client";

// Initialize libsql client (local SQLite or Turso cloud)
const db: Client = createClient({
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

// Query tool (read-only)
server.registerTool(
  "query",
  {
    title: "Execute SQL Query",
    description: "Execute a read-only SQL query",
    inputSchema: {
      sql: z.string().describe("SQL query to execute")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ sql }) => {
    try {
      const result = await db.execute(sql);
      return {
        content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }],
        structuredContent: { results: result.rows, columns: result.columns }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Query error: ${error}` }],
        isError: true
      };
    }
  }
);

// Execute tool (write operations)
server.registerTool(
  "execute",
  {
    title: "Execute SQL Statement",
    description: "Execute a write SQL statement (INSERT, UPDATE, DELETE)",
    inputSchema: {
      sql: z.string().describe("SQL statement to execute"),
      params: z.array(z.any()).optional().describe("Parameters for the statement")
    },
    annotations: {
      destructiveHint: false,
      idempotentHint: false
    }
  },
  async ({ sql, params = [] }) => {
    try {
      const result = await db.execute({ sql, args: params });
      return {
        content: [{ type: "text", text: `Executed successfully. Rows affected: ${result.rowsAffected}` }],
        structuredContent: { changes: result.rowsAffected, lastInsertRowid: Number(result.lastInsertRowid) }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Execution error: ${error}` }],
        isError: true
      };
    }
  }
);

// Article tools
server.registerTool(
  "get_article",
  {
    title: "Get Article",
    description: "Get an article by ID",
    inputSchema: {
      id: z.number().describe("Article ID")
    },
    annotations: { readOnlyHint: true }
  },
  async ({ id }) => {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM articles WHERE id = ?",
        args: [id]
      });
      const article = result.rows[0] || null;
      return {
        content: [{ type: "text", text: JSON.stringify(article, null, 2) }],
        structuredContent: { article }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "create_article",
  {
    title: "Create Article",
    description: "Create a new article",
    inputSchema: {
      title: z.string().describe("Article title"),
      content: z.string().describe("Article content"),
      tags: z.array(z.string()).optional().describe("Article tags")
    },
    annotations: { destructiveHint: false }
  },
  async ({ title, content, tags = [] }) => {
    try {
      const result = await db.execute({
        sql: "INSERT INTO articles (title, content, tags) VALUES (?, ?, ?)",
        args: [title, content, JSON.stringify(tags)]
      });
      return {
        content: [{ type: "text", text: `Created article with ID ${result.lastInsertRowid}` }],
        structuredContent: { id: Number(result.lastInsertRowid) }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "update_article",
  {
    title: "Update Article",
    description: "Update an existing article",
    inputSchema: {
      id: z.number().describe("Article ID"),
      title: z.string().optional().describe("New title"),
      content: z.string().optional().describe("New content"),
      status: z.enum(["draft", "published", "archived"]).optional().describe("New status")
    },
    annotations: { destructiveHint: false }
  },
  async ({ id, title, content, status }) => {
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (title !== undefined) { updates.push("title = ?"); params.push(title); }
      if (content !== undefined) { updates.push("content = ?"); params.push(content); }
      if (status !== undefined) { updates.push("status = ?"); params.push(status); }

      updates.push("updated_at = CURRENT_TIMESTAMP");
      params.push(id);

      const result = await db.execute({
        sql: `UPDATE articles SET ${updates.join(", ")} WHERE id = ?`,
        args: params
      });

      return {
        content: [{ type: "text", text: `Updated ${result.rowsAffected} row(s)` }],
        structuredContent: { changes: result.rowsAffected }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "list_articles",
  {
    title: "List Articles",
    description: "List all articles",
    inputSchema: {
      status: z.enum(["draft", "published", "archived"]).optional().describe("Filter by status"),
      limit: z.number().max(100).default(10).describe("Maximum number of articles")
    },
    annotations: { readOnlyHint: true }
  },
  async ({ status, limit = 10 }) => {
    try {
      let sql = "SELECT * FROM articles";
      const params: any[] = [];

      if (status !== undefined) {
        sql += " WHERE status = ?";
        params.push(status);
      }

      sql += " ORDER BY created_at DESC LIMIT ?";
      params.push(limit);

      const result = await db.execute({ sql, args: params });
      return {
        content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }],
        structuredContent: { articles: result.rows }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  }
);

// Workflow tools
server.registerTool(
  "get_workflow",
  {
    title: "Get Workflow",
    description: "Get a workflow by name",
    inputSchema: {
      name: z.string().describe("Workflow name")
    },
    annotations: { readOnlyHint: true }
  },
  async ({ name }) => {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM workflows WHERE name = ?",
        args: [name]
      });
      const workflow = result.rows[0] || null;
      return {
        content: [{ type: "text", text: JSON.stringify(workflow, null, 2) }],
        structuredContent: { workflow }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "save_workflow",
  {
    title: "Save Workflow",
    description: "Save or update a workflow",
    inputSchema: {
      name: z.string().describe("Workflow name"),
      department: z.string().describe("Department name"),
      steps: z.array(z.any()).describe("Workflow steps"),
      config: z.record(z.any()).optional().describe("Workflow configuration")
    },
    annotations: { destructiveHint: false }
  },
  async ({ name, department, steps, config = {} }) => {
    try {
      const result = await db.execute({
        sql: "INSERT OR REPLACE INTO workflows (name, department, steps, config) VALUES (?, ?, ?, ?)",
        args: [name, department, JSON.stringify(steps), JSON.stringify(config)]
      });
      return {
        content: [{ type: "text", text: `Saved workflow: ${name}` }],
        structuredContent: { name, changes: result.rowsAffected }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  }
);

// Key-value store tools
server.registerTool(
  "get_key_value",
  {
    title: "Get Key Value",
    description: "Get a value from the key-value store",
    inputSchema: {
      key: z.string().describe("Key to retrieve")
    },
    annotations: { readOnlyHint: true }
  },
  async ({ key }) => {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM creator_data WHERE key = ?",
        args: [key]
      });
      const row = result.rows[0] as any;
      if (row) {
        const value = row.type === "json" ? JSON.parse(row.value) : row.value;
        return {
          content: [{ type: "text", text: String(value) }],
          structuredContent: { key, value, type: row.type }
        };
      }
      return {
        content: [{ type: "text", text: `Key not found: ${key}` }],
        isError: true
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "set_key_value",
  {
    title: "Set Key Value",
    description: "Set a value in the key-value store",
    inputSchema: {
      key: z.string().describe("Key to set"),
      value: z.any().describe("Value to store"),
      type: z.enum(["string", "number", "json"]).default("string").describe("Value type")
    },
    annotations: { destructiveHint: false }
  },
  async ({ key, value, type = "string" }) => {
    try {
      const stringValue = type === "json" ? JSON.stringify(value) : String(value);
      await db.execute({
        sql: "INSERT OR REPLACE INTO creator_data (key, value, type, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
        args: [key, stringValue, type]
      });
      return {
        content: [{ type: "text", text: `Set ${key} = ${stringValue}` }],
        structuredContent: { key, value: stringValue, type }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  }
);

// Agent memory tools (new in v1.1.0)
server.registerTool(
  "store_memory",
  {
    title: "Store Agent Memory",
    description: "Store a memory entry for an agent",
    inputSchema: {
      agent_id: z.string().describe("Agent identifier"),
      memory_type: z.enum(["observation", "reflection", "plan", "fact"]).describe("Type of memory"),
      content: z.string().describe("Memory content"),
      session_id: z.string().optional().describe("Session identifier")
    },
    annotations: { destructiveHint: false }
  },
  async ({ agent_id, memory_type, content, session_id }) => {
    try {
      const result = await db.execute({
        sql: "INSERT INTO agent_memory (agent_id, session_id, memory_type, content) VALUES (?, ?, ?, ?)",
        args: [agent_id, session_id || null, memory_type, content]
      });
      return {
        content: [{ type: "text", text: `Stored memory for agent ${agent_id}` }],
        structuredContent: { id: Number(result.lastInsertRowid), agent_id, memory_type }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "recall_memory",
  {
    title: "Recall Agent Memory",
    description: "Retrieve memories for an agent",
    inputSchema: {
      agent_id: z.string().describe("Agent identifier"),
      memory_type: z.enum(["observation", "reflection", "plan", "fact"]).optional().describe("Filter by type"),
      limit: z.number().max(100).default(20).describe("Maximum number of memories")
    },
    annotations: { readOnlyHint: true }
  },
  async ({ agent_id, memory_type, limit = 20 }) => {
    try {
      let sql = "SELECT * FROM agent_memory WHERE agent_id = ?";
      const params: any[] = [agent_id];

      if (memory_type) {
        sql += " AND memory_type = ?";
        params.push(memory_type);
      }

      sql += " ORDER BY created_at DESC LIMIT ?";
      params.push(limit);

      const result = await db.execute({ sql, args: params });
      return {
        content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }],
        structuredContent: { memories: result.rows, count: result.rows.length }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  }
);

async function main() {
  await initDb();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
