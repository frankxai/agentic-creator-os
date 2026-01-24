/**
 * Notion API Integration for Content Management
 *
 * Provides tools for creating and managing Notion pages, databases,
 * and content synchronization.
 */

import { z } from "zod";

// Notion API configuration
interface NotionConfig {
  apiKey: string;
  workspaceId?: string;
}

const getConfig = (): NotionConfig => ({
  apiKey: process.env.NOTION_API_KEY || "",
});

// Notion API base URL
const NOTION_API_BASE = "https://api.notion.com/v1";

/**
 * Make authenticated request to Notion API
 */
async function notionRequest(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: object
): Promise<any> {
  const config = getConfig();

  if (!config.apiKey) {
    throw new Error("NOTION_API_KEY not configured. Set it in environment variables.");
  }

  const response = await fetch(`${NOTION_API_BASE}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Notion API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new page in Notion
 */
export async function createNotionPage(args: {
  parentId: string;
  title: string;
  content: string;
  properties?: Record<string, any>;
}): Promise<any> {
  const { parentId, title, content, properties = {} } = args;

  const page = await notionRequest("/pages", "POST", {
    parent: { page_id: parentId },
    icon: { emoji: "📝" },
    properties: {
      title: {
        title: [{ text: { content: title } }]
      },
      ...properties
    },
    children: contentToNotionBlocks(content)
  });

  return {
    success: true,
    pageId: page.id,
    url: page.url,
    message: `Created Notion page: ${title}`
  };
}

/**
 * Create a new database in Notion
 */
export async function createNotionDatabase(args: {
  parentId: string;
  title: string;
  properties: Record<string, any>;
}): Promise<any> {
  const { parentId, title, properties } = args;

  const database = await notionRequest("/databases", "POST", {
    parent: { page_id: parentId },
    title: [{ text: { content: title } }],
    properties: Object.entries(properties).reduce((acc, [key, type]) => ({
      ...acc,
      [key]: getNotionPropertyType(type as string)
    }), {})
  });

  return {
    success: true,
    databaseId: database.id,
    url: database.url,
    message: `Created Notion database: ${title}`
  };
}

/**
 * Query a Notion database
 */
export async function queryNotionDatabase(args: {
  databaseId: string;
  filter?: object;
  sorts?: object[];
}): Promise<any> {
  const { databaseId, filter, sorts } = args;

  const result = await notionRequest(`/databases/${databaseId}/query`, "POST", {
    filter,
    sorts: sorts || [{ direction: "descending", property: "created_time" }]
  });

  return {
    success: true,
    results: result.results,
    hasMore: result.has_more,
    message: `Found ${result.results.length} items in database`
  };
}

/**
 * Add a page to a database
 */
export async function addToNotionDatabase(args: {
  databaseId: string;
  title: string;
  content?: string;
  properties?: Record<string, any>;
}): Promise<any> {
  const { databaseId, title, content = "", properties = {} } = args;

  const page = await notionRequest("/pages", "POST", {
    parent: { database_id: databaseId },
    icon: { emoji: "📄" },
    properties: {
      Name: {
        title: [{ text: { content: title } }]
      },
      ...properties
    },
    children: content ? contentToNotionBlocks(content) : []
  });

  return {
    success: true,
    pageId: page.id,
    url: page.url,
    message: `Added page "${title}" to database`
  };
}

/**
 * Get page content from Notion
 */
export async function getNotionPage(pageId: string): Promise<any> {
  const page = await notionRequest(`/pages/${pageId}`);
  const blocks = await notionRequest(`/blocks/${pageId}/children`);

  return {
    success: true,
    page: {
      id: page.id,
      title: getPageTitle(page),
      url: page.url,
      createdAt: page.created_time,
      lastEdited: page.last_edited_time
    },
    blocks: blocks.results,
    content: notionBlocksToMarkdown(blocks.results),
    message: `Retrieved page: ${getPageTitle(page)}`
  };
}

/**
 * Update page content
 */
export async function updateNotionPage(args: {
  pageId: string;
  content?: string;
  properties?: Record<string, any>;
}): Promise<any> {
  const { pageId, content, properties } = args;

  // Update properties if provided
  if (properties) {
    await notionRequest(`/pages/${pageId}`, "PATCH", { properties });
  }

  // Update content (append blocks)
  if (content) {
    await notionRequest(`/blocks/${pageId}/children`, "PATCH", {
      children: contentToNotionBlocks(content)
    });
  }

  return {
    success: true,
    message: `Updated page: ${pageId}`
  };
}

/**
 * Search Notion pages
 */
export async function searchNotionPages(query: string): Promise<any> {
  const result = await notionRequest("/search", "POST", {
    query,
    sort: { direction: "descending", timestamp: "last_edited_time" }
  });

  return {
    success: true,
    results: result.results.map((page: any) => ({
      id: page.id,
      title: getPageTitle(page),
      url: page.url,
      type: page.object
    })),
    message: `Found ${result.results.length} results for "${query}"`
  };
}

/**
 * Convert markdown content to Notion blocks
 */
function contentToNotionBlocks(content: string): any[] {
  const blocks: any[] = [];
  const paragraphs = content.split("\n\n");

  for (const paragraph of paragraphs) {
    if (paragraph.startsWith("# ")) {
      blocks.push({
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: paragraph.slice(2) } }]
        }
      });
    } else if (paragraph.startsWith("## ")) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: paragraph.slice(3) } }]
        }
      });
    } else if (paragraph.startsWith("### ")) {
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ type: "text", text: { content: paragraph.slice(4) } }]
        }
      });
    } else if (paragraph.startsWith("- ")) {
      const items = paragraph.split("\n").map(line => ({
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: line.slice(2) } }]
        }
      }));
      blocks.push(...items);
    } else if (paragraph.match(/^\d+\. /)) {
      const items = paragraph.split("\n").map((line, i) => ({
        type: "numbered_list_item",
        numbered_list_item: {
          rich_text: [{ type: "text", text: { content: line.replace(/^\d+\. /, "") } }]
        }
      }));
      blocks.push(...items);
    } else if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: paragraph.slice(2, -2) },
            annotations: { bold: true }
          }]
        }
      });
    } else if (paragraph) {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: paragraph } }]
        }
      });
    }
  }

  return blocks;
}

/**
 * Convert Notion blocks to markdown
 */
function notionBlocksToMarkdown(blocks: any[]): string {
  let markdown = "";

  for (const block of blocks) {
    switch (block.type) {
      case "heading_1":
        markdown += `# ${getBlockText(block.heading_1?.rich_text)}\n\n`;
        break;
      case "heading_2":
        markdown += `## ${getBlockText(block.heading_2?.rich_text)}\n\n`;
        break;
      case "heading_3":
        markdown += `### ${getBlockText(block.heading_3?.rich_text)}\n\n`;
        break;
      case "paragraph":
        markdown += `${getBlockText(block.paragraph?.rich_text)}\n\n`;
        break;
      case "bulleted_list_item":
        markdown += `- ${getBlockText(block.bulleted_list_item?.rich_text)}\n`;
        break;
      case "numbered_list_item":
        markdown += `1. ${getBlockText(block.numbered_list_item?.rich_text)}\n`;
        break;
      case "to_do":
        const checked = block.to_do?.checked ? "[x]" : "[ ]";
        markdown += `${checked} ${getBlockText(block.to_do?.rich_text)}\n`;
        break;
      case "code":
        markdown += `\`\`\`${block.code?.language || ""}\n${getBlockText(block.code?.rich_text)}\n\`\`\`\n\n`;
        break;
      case "quote":
        markdown += `> ${getBlockText(block.quote?.rich_text)}\n\n`;
        break;
      case "divider":
        markdown += "---\n\n";
        break;
    }
  }

  return markdown;
}

/**
 * Get text content from rich_text array
 */
function getBlockText(richText: any[]): string {
  return richText?.map((t: any) => t.plain_text || t.text?.content || "").join("") || "";
}

/**
 * Get page title from Notion page
 */
function getPageTitle(page: any): string {
  const titleProp = page.properties?.title || page.properties?.Name;
  if (titleProp?.title?.[0]?.plain_text) {
    return titleProp.title[0].plain_text;
  }
  return "Untitled";
}

/**
 * Get Notion property type for database creation
 */
function getNotionPropertyType(type: string): object {
  switch (type.toLowerCase()) {
    case "title":
      return { title: {} };
    case "rich_text":
    case "text":
      return { rich_text: {} };
    case "number":
      return { number: {} };
    case "select":
      return { select: { options: [] } };
    case "multi_select":
      return { multi_select: { options: [] } };
    case "date":
      return { date: {} };
    case "checkbox":
      return { checkbox: {} };
    case "url":
      return { url: {} };
    case "email":
      return { email: {} };
    default:
      return { rich_text: {} };
  }
}

// Schema definitions for tools
export const notionSchemas = {
  create_notion_page: {
    name: "create_notion_page",
    title: "Create Notion Page",
    description: "Create a new page in Notion with markdown content",
    inputSchema: {
      type: "object",
      properties: {
        parentId: {
          type: "string",
          description: "Parent page ID to create under"
        },
        title: {
          type: "string",
          description: "Page title"
        },
        content: {
          type: "string",
          description: "Page content in markdown format"
        }
      },
      required: ["parentId", "title"]
    }
  },

  create_notion_database: {
    name: "create_notion_database",
    title: "Create Notion Database",
    description: "Create a new database in Notion",
    inputSchema: {
      type: "object",
      properties: {
        parentId: {
          type: "string",
          description: "Parent page ID to create under"
        },
        title: {
          type: "string",
          description: "Database title"
        },
        properties: {
          type: "object",
          description: "Database properties (title, rich_text, number, select, date, checkbox, url)"
        }
      },
      required: ["parentId", "title", "properties"]
    }
  },

  query_notion_database: {
    name: "query_notion_database",
    title: "Query Notion Database",
    description: "Query a Notion database and return results",
    inputSchema: {
      type: "object",
      properties: {
        databaseId: {
          type: "string",
          description: "Database ID to query"
        }
      },
      required: ["databaseId"]
    }
  },

  add_to_notion_database: {
    name: "add_to_notion_database",
    title: "Add to Notion Database",
    description: "Add a new item to a Notion database",
    inputSchema: {
      type: "object",
      properties: {
        databaseId: {
          type: "string",
          description: "Database ID"
        },
        title: {
          type: "string",
          description: "Item title"
        },
        content: {
          type: "string",
          description: "Item content in markdown (optional)"
        }
      },
      required: ["databaseId", "title"]
    }
  },

  get_notion_page: {
    name: "get_notion_page",
    title: "Get Notion Page",
    description: "Retrieve a Notion page and its content",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "Page ID to retrieve"
        }
      },
      required: ["pageId"]
    }
  },

  update_notion_page: {
    name: "update_notion_page",
    title: "Update Notion Page",
    description: "Update a Notion page's content or properties",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "Page ID to update"
        },
        content: {
          type: "string",
          description: "New content in markdown (appends to existing)"
        }
      },
      required: ["pageId"]
    }
  },

  search_notion_pages: {
    name: "search_notion_pages",
    title: "Search Notion Pages",
    description: "Search Notion pages and databases",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query"
        }
      },
      required: ["query"]
    }
  }
};
