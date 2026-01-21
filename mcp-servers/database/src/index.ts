import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Database from "better-sqlite3";

const db = new Database(process.env.DB_PATH || ":memory:");
const server = new McpServer({
  name: "database",
  version: "1.0.0"
});

db.exec(`
  CREATE TABLE IF NOT EXISTS creator_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    steps TEXT NOT NULL,
    config TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
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
      const stmt = db.prepare(sql);
      const results = stmt.all();
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        structuredContent: { results }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Query error: ${error}` }],
        isError: true
      };
    }
  }
);

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
      const stmt = db.prepare(sql);
      const result = stmt.run(...params);
      return {
        content: [{ type: "text", text: `Executed successfully. Rows affected: ${result.changes}` }],
        structuredContent: { changes: result.changes, lastInsertRowid: result.lastInsertRowid }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Execution error: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "get_article",
  {
    title: "Get Article",
    description: "Get an article by ID",
    inputSchema: {
      id: z.number().describe("Article ID")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ id }) => {
    try {
      const stmt = db.prepare("SELECT * FROM articles WHERE id = ?");
      const article = stmt.get(id);
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
    annotations: {
      destructiveHint: false
    }
  },
  async ({ title, content, tags = [] }) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO articles (title, content, tags) VALUES (?, ?, ?)
      `);
      const result = stmt.run(title, content, JSON.stringify(tags));
      return {
        content: [{ type: "text", text: `Created article with ID ${result.lastInsertRowid}` }],
        structuredContent: { id: result.lastInsertRowid }
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
    annotations: {
      destructiveHint: false
    }
  },
  async ({ id, title, content, status }) => {
    try {
      const updates: string[] = [];
      const params: any[] = [];
      
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
      
      const stmt = db.prepare(`
        UPDATE articles SET ${updates.join(", ")} WHERE id = ?
      `);
      const result = stmt.run(...params);
      
      return {
        content: [{ type: "text", text: `Updated ${result.changes} row(s)` }],
        structuredContent: { changes: result.changes }
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
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ status, limit }) => {
    try {
      let sql = "SELECT * FROM articles";
      const params: any[] = [];
      
      if (status !== undefined) {
        sql += " WHERE status = ?";
        params.push(status);
      }
      
      sql += " ORDER BY created_at DESC LIMIT ?";
      params.push(limit);
      
      const stmt = db.prepare(sql);
      const articles = stmt.all(...params);
      return {
        content: [{ type: "text", text: JSON.stringify(articles, null, 2) }],
        structuredContent: { articles }
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
  "get_workflow",
  {
    title: "Get Workflow",
    description: "Get a workflow by name",
    inputSchema: {
      name: z.string().describe("Workflow name")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ name }) => {
    try {
      const stmt = db.prepare("SELECT * FROM workflows WHERE name = ?");
      const workflow = stmt.get(name);
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
    annotations: {
      destructiveHint: false
    }
  },
  async ({ name, department, steps, config = {} }) => {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO workflows (name, department, steps, config)
        VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(name, department, JSON.stringify(steps), JSON.stringify(config));
      return {
        content: [{ type: "text", text: `Saved workflow: ${name}` }],
        structuredContent: { name, changes: result.changes }
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
  "get_key_value",
  {
    title: "Get Key Value",
    description: "Get a value from the key-value store",
    inputSchema: {
      key: z.string().describe("Key to retrieve")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ key }) => {
    try {
      const stmt = db.prepare("SELECT * FROM creator_data WHERE key = ?");
      const row = stmt.get(key);
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
    annotations: {
      destructiveHint: false
    }
  },
  async ({ key, value, type = "string" }) => {
    try {
      const stringValue = type === "json" ? JSON.stringify(value) : String(value);
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO creator_data (key, value, type, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `);
      stmt.run(key, stringValue, type);
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
