import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";

const server = new McpServer({
  name: "filesystem",
  version: "1.1.0"
});

let allowedDirectories: string[] = [];

const MAX_FILE_CHARS = 1_000_000;
const pathInput = z.string().min(1).max(4096);

function ok<T extends Record<string, unknown>>(data: T) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }], structuredContent: data };
}

function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

function isInside(allowed: string, candidate: string): boolean {
  const relative = path.relative(allowed, candidate);
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

/**
 * Resolves symlinks through the deepest existing ancestor, so a path that does not exist yet
 * (a file about to be written) is still checked against the allowed roots.
 */
async function validatePath(inputPath: string): Promise<string> {
  const absolute = path.resolve(inputPath);
  let existing = absolute;
  const missing: string[] = [];
  for (;;) {
    try {
      existing = await fs.realpath(existing);
      break;
    } catch {
      // A dangling symlink exists but cannot be resolved; following it on write could escape the roots.
      if (await fs.lstat(existing).then(() => true, () => false)) {
        throw new Error(`Path ${inputPath} goes through a broken symlink (${existing}); refusing to follow it`);
      }
      const parent = path.dirname(existing);
      if (parent === existing) throw new Error(`Path ${inputPath} has no existing ancestor`);
      missing.unshift(path.basename(existing));
      existing = parent;
    }
  }
  const resolved = path.join(existing, ...missing);
  if (!allowedDirectories.some((allowed) => isInside(allowed, resolved))) {
    throw new Error(`Path ${inputPath} is outside the allowed directories (${allowedDirectories.join(", ")}); set FILESYSTEM_ALLOWED_DIRS to widen them`);
  }
  return resolved;
}

server.registerTool(
  "filesystem_read_file",
  {
    title: "Read file",
    description: "Read a UTF-8 text file inside the allowed directories (FILESYSTEM_ALLOWED_DIRS, default: the server's working directory). Returns the file content, truncated at maxChars (default 100,000) with a truncated flag, so large files do not flood the context.",
    inputSchema: {
      path: pathInput.describe("Path of the file to read, absolute or relative to the server's working directory"),
      maxChars: z.number().int().min(1).max(MAX_FILE_CHARS).default(100_000).describe("Maximum characters to return; the rest is cut and truncated is true")
    },
    outputSchema: {
      path: z.string().describe("Resolved absolute path"),
      content: z.string().describe("File content, possibly truncated"),
      totalChars: z.number().describe("Length of the whole file in characters"),
      truncated: z.boolean().describe("True when content was cut at maxChars")
    },
    annotations: { readOnlyHint: true, openWorldHint: false }
  },
  async ({ path: filePath, maxChars }) => {
    try {
      const validPath = await validatePath(filePath);
      const content = await fs.readFile(validPath, "utf-8");
      return ok({ path: validPath, content: content.slice(0, maxChars), totalChars: content.length, truncated: content.length > maxChars });
    } catch (error) {
      return fail(`Error reading file: ${error}`);
    }
  }
);

server.registerTool(
  "filesystem_write_file",
  {
    title: "Write file",
    description: "Write UTF-8 text to a file inside the allowed directories, creating it (and missing parent folders) or replacing its whole content. Use it to save generated drafts or configs; it overwrites without a backup. Returns the resolved path and bytes written.",
    inputSchema: {
      path: pathInput.describe("Path of the file to write, absolute or relative to the server's working directory"),
      content: z.string().max(MAX_FILE_CHARS).describe("Full text to write; replaces any existing content")
    },
    outputSchema: {
      path: z.string().describe("Resolved absolute path that was written"),
      bytes: z.number().describe("Bytes written")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
  },
  async ({ path: filePath, content }) => {
    try {
      const validPath = await validatePath(filePath);
      await fs.mkdir(path.dirname(validPath), { recursive: true });
      await fs.writeFile(validPath, content, "utf-8");
      return ok({ path: validPath, bytes: Buffer.byteLength(content, "utf-8") });
    } catch (error) {
      return fail(`Error writing file: ${error}`);
    }
  }
);

server.registerTool(
  "filesystem_list_directory",
  {
    title: "List directory",
    description: "List the files and folders directly inside one directory within the allowed directories (not recursive). Returns name and type per entry, up to limit (default 200, max 1000) with a truncated flag; page further with offset.",
    inputSchema: {
      path: pathInput.describe("Directory to list, absolute or relative to the server's working directory"),
      limit: z.number().int().min(1).max(1000).default(200).describe("Maximum entries to return"),
      offset: z.number().int().min(0).max(1_000_000).default(0).describe("Entries to skip, for paging past the first limit")
    },
    outputSchema: {
      path: z.string().describe("Resolved absolute directory path"),
      entries: z.array(z.object({
        name: z.string().describe("Entry name"),
        type: z.enum(["file", "directory"]).describe("Entry kind")
      })).describe("Entries in this page, sorted by name"),
      total: z.number().describe("Total entries in the directory"),
      truncated: z.boolean().describe("True when more entries follow this page")
    },
    annotations: { readOnlyHint: true, openWorldHint: false }
  },
  async ({ path: dirPath, limit, offset }) => {
    try {
      const validPath = await validatePath(dirPath);
      const all = (await fs.readdir(validPath, { withFileTypes: true }))
        .map((entry) => ({ name: entry.name, type: entry.isDirectory() ? "directory" as const : "file" as const }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return ok({ path: validPath, entries: all.slice(offset, offset + limit), total: all.length, truncated: offset + limit < all.length });
    } catch (error) {
      return fail(`Error listing directory: ${error}`);
    }
  }
);

server.registerTool(
  "filesystem_create_directory",
  {
    title: "Create directory",
    description: "Create a directory, including any missing parents, inside the allowed directories. Safe to repeat: an existing directory is left untouched. Use before writing several files into a new folder. Returns the resolved path; cheap, local only.",
    inputSchema: {
      path: pathInput.describe("Directory to create, absolute or relative to the server's working directory")
    },
    outputSchema: {
      path: z.string().describe("Resolved absolute directory path")
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async ({ path: dirPath }) => {
    try {
      const validPath = await validatePath(dirPath);
      await fs.mkdir(validPath, { recursive: true });
      return ok({ path: validPath });
    } catch (error) {
      return fail(`Error creating directory: ${error}`);
    }
  }
);

server.registerTool(
  "filesystem_delete_file",
  {
    title: "Delete file",
    description: "Permanently delete one file or one empty directory inside the allowed directories; there is no recycle bin and non-empty directories are refused. Use only when the user asked for the removal. Returns the resolved path that was deleted.",
    inputSchema: {
      path: pathInput.describe("File or empty directory to delete, absolute or relative to the server's working directory")
    },
    outputSchema: {
      path: z.string().describe("Resolved absolute path that was deleted"),
      type: z.enum(["file", "directory"]).describe("What was deleted")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
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
      return ok({ path: validPath, type: stat.isDirectory() ? "directory" as const : "file" as const });
    } catch (error) {
      return fail(`Error deleting: ${error}`);
    }
  }
);

server.registerTool(
  "filesystem_file_exists",
  {
    title: "Check path exists",
    description: "Check whether a file or directory exists inside the allowed directories, without reading it. Use it before read or write calls to avoid errors. Returns exists and, when present, whether it is a file or a directory; cheap, local only.",
    inputSchema: {
      path: pathInput.describe("Path to check, absolute or relative to the server's working directory")
    },
    outputSchema: {
      path: z.string().describe("The path as given"),
      exists: z.boolean().describe("True when the path exists"),
      type: z.enum(["file", "directory"]).optional().describe("Kind of entry, when it exists")
    },
    annotations: { readOnlyHint: true, openWorldHint: false }
  },
  async ({ path: filePath }) => {
    try {
      const validPath = await validatePath(filePath);
      const stat = await fs.stat(validPath);
      return ok({ path: filePath, exists: true, type: stat.isDirectory() ? "directory" as const : "file" as const });
    } catch {
      return ok({ path: filePath, exists: false });
    }
  }
);

async function main() {
  const configured = process.env.FILESYSTEM_ALLOWED_DIRS?.split(",") || [process.cwd()];
  allowedDirectories = await Promise.all(configured.map((dir) => fs.realpath(path.resolve(dir)).catch(() => path.resolve(dir))));

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
