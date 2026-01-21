import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";

const server = new McpServer({
  name: "filesystem",
  version: "1.0.0"
});

let allowedDirectories: string[] = [];

async function validatePath(inputPath: string): Promise<string> {
  const normalized = path.normalize(inputPath);
  const resolved = await fs.realpath(normalized);
  
  const isAllowed = allowedDirectories.some(allowed => {
    const relative = path.relative(allowed, resolved);
    return !relative.startsWith("..") && !path.isAbsolute(relative);
  });
  
  if (!isAllowed) {
    throw new Error(`Path ${inputPath} is not allowed`);
  }
  
  return resolved;
}

server.registerTool(
  "read_file",
  {
    title: "Read File",
    description: "Read the contents of a file",
    inputSchema: {
      path: z.string().describe("Path to the file to read")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ path: filePath }) => {
    try {
      const validPath = await validatePath(filePath);
      const content = await fs.readFile(validPath, "utf-8");
      return {
        content: [{ type: "text", text: content }],
        structuredContent: { content }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error reading file: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "write_file",
  {
    title: "Write File",
    description: "Write content to a file, creating if necessary",
    inputSchema: {
      path: z.string().describe("Path to the file to write"),
      content: z.string().describe("Content to write to the file")
    },
    annotations: {
      destructiveHint: false,
      idempotentHint: false
    }
  },
  async ({ path: filePath, content }) => {
    try {
      const validPath = await validatePath(filePath);
      await fs.writeFile(validPath, content, "utf-8");
      return {
        content: [{ type: "text", text: `Successfully wrote to ${filePath}` }],
        structuredContent: { path: validPath }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error writing file: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "list_directory",
  {
    title: "List Directory",
    description: "List files and directories in a folder",
    inputSchema: {
      path: z.string().describe("Path to the directory to list")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ path: dirPath }) => {
    try {
      const validPath = await validatePath(dirPath);
      const entries = await fs.readdir(validPath, { withFileTypes: true });
      const result = entries.map(entry => ({
        name: entry.name,
        type: entry.isDirectory() ? "directory" : "file"
      }));
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: { entries: result }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error listing directory: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "create_directory",
  {
    title: "Create Directory",
    description: "Create a new directory",
    inputSchema: {
      path: z.string().describe("Path to the directory to create")
    },
    annotations: {
      destructiveHint: false
    }
  },
  async ({ path: dirPath }) => {
    try {
      const validPath = await validatePath(dirPath);
      await fs.mkdir(validPath, { recursive: true });
      return {
        content: [{ type: "text", text: `Created directory: ${dirPath}` }],
        structuredContent: { path: validPath }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error creating directory: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "delete_file",
  {
    title: "Delete File",
    description: "Delete a file or empty directory",
    inputSchema: {
      path: z.string().describe("Path to the file or directory to delete")
    },
    annotations: {
      destructiveHint: true
    }
  },
  async ({ path: filePath }) => {
    try {
      const validPath = await validatePath(filePath);
      const stat = await fs.stat(validPath);
      
      if (stat.isDirectory()) {
        await fs.rmdir(validPath);
      } else {
        await fs.unlink(validPath);
      }
      
      return {
        content: [{ type: "text", text: `Deleted: ${filePath}` }],
        structuredContent: { path: validPath }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error deleting: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "file_exists",
  {
    title: "Check File Exists",
    description: "Check if a file or directory exists",
    inputSchema: {
      path: z.string().describe("Path to check")
    },
    annotations: {
      readOnlyHint: true
    }
  },
  async ({ path: filePath }) => {
    try {
      const validPath = await validatePath(filePath);
      await fs.access(validPath);
      return {
        content: [{ type: "text", text: `File exists: ${filePath}` }],
        structuredContent: { exists: true, path: filePath }
      };
    } catch {
      return {
        content: [{ type: "text", text: `File does not exist: ${filePath}` }],
        structuredContent: { exists: false, path: filePath }
      };
    }
  }
);

async function main() {
  const configPath = process.env.FILESYSTEM_ALLOWED_DIRS?.split(",") || [process.cwd()];
  allowedDirectories = configPath.map(p => path.resolve(p));
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
