import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Try to load env files from various potential workspace locations
const potentialPaths = [
  path.resolve("./private/auth/credentials.env"),
  path.resolve("../private/auth/credentials.env"),
  path.resolve("../../private/auth/credentials.env"),
  path.resolve("./.env"),
  path.resolve("../.env")
];

for (const envPath of potentialPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
dotenv.config();

const server = new McpServer({
  name: "starlight-manychat",
  version: "1.0.0"
});

const MANYCHAT_API_BASE = "https://api.manychat.com";

function getApiKey(): string {
  const key = process.env.MANYCHAT_API_KEY || process.env.MANYCHAT_TOKEN;
  if (!key) {
    throw new Error("ManyChat API Key (MANYCHAT_API_KEY) is not set in credentials.env or system environment.");
  }
  return key;
}

async function requestManyChat(endpoint: string, method: "GET" | "POST", body?: any) {
  const token = getApiKey();
  const url = `${MANYCHAT_API_BASE}${endpoint}`;
  
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json() as any;

  if (!response.ok || data.status === "error") {
    throw new Error(data.message || `ManyChat API error: ${response.statusText} (${response.status})`);
  }

  return data;
}

// 1. Get subscriber details
server.registerTool(
  "get_subscriber_info",
  {
    title: "Get Subscriber Details",
    description: "Fetch subscriber details, tags, and custom fields by ManyChat subscriber ID",
    inputSchema: {
      subscriberId: z.union([z.string(), z.number()]).describe("Unique identifier of the subscriber")
    }
  },
  async ({ subscriberId }) => {
    try {
      const endpoint = `/fb/subscriber/getInfo?subscriber_id=${subscriberId}`;
      const response = await requestManyChat(endpoint, "GET");
      return {
        content: [
          {
            type: "text",
            text: `Subscriber Info for ID ${subscriberId}:\n` + JSON.stringify(response.data, null, 2)
          }
        ],
        structuredContent: response
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message || error}` }],
        isError: true
      };
    }
  }
);

// 2. Set Custom Field by Name
server.registerTool(
  "update_subscriber_field_by_name",
  {
    title: "Update Subscriber Custom Field By Name",
    description: "Update a specific custom field value for a subscriber using the human-readable field name",
    inputSchema: {
      subscriberId: z.union([z.string(), z.number()]).describe("ManyChat subscriber ID"),
      fieldName: z.string().describe("The name of the custom field (e.g., 'SYSTEM_LINK')"),
      fieldValue: z.any().describe("The value to assign to the field")
    }
  },
  async ({ subscriberId, fieldName, fieldValue }) => {
    try {
      const endpoint = "/fb/subscriber/setCustomFieldByName";
      const payload = {
        subscriber_id: Number(subscriberId),
        field_name: fieldName,
        field_value: fieldValue
      };
      const response = await requestManyChat(endpoint, "POST", payload);
      return {
        content: [
          {
            type: "text",
            text: `Successfully updated field "${fieldName}" to "${fieldValue}" for subscriber ${subscriberId}.`
          }
        ],
        structuredContent: response
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message || error}` }],
        isError: true
      };
    }
  }
);

// 3. Set Custom Field by ID
server.registerTool(
  "update_subscriber_field_by_id",
  {
    title: "Update Subscriber Custom Field By ID",
    description: "Update a specific custom field value for a subscriber using the field's unique numeric ID",
    inputSchema: {
      subscriberId: z.union([z.string(), z.number()]).describe("ManyChat subscriber ID"),
      fieldId: z.number().describe("The numeric ID of the custom field"),
      fieldValue: z.any().describe("The value to assign to the field")
    }
  },
  async ({ subscriberId, fieldId, fieldValue }) => {
    try {
      const endpoint = "/fb/subscriber/setCustomField";
      const payload = {
        subscriber_id: Number(subscriberId),
        field_id: fieldId,
        field_value: fieldValue
      };
      const response = await requestManyChat(endpoint, "POST", payload);
      return {
        content: [
          {
            type: "text",
            text: `Successfully updated field ID ${fieldId} to "${fieldValue}" for subscriber ${subscriberId}.`
          }
        ],
        structuredContent: response
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message || error}` }],
        isError: true
      };
    }
  }
);

// 4. Trigger flow for subscriber
server.registerTool(
  "trigger_flow",
  {
    title: "Trigger ManyChat Flow",
    description: "Sends/triggers a specific ManyChat flow (automation sequence) to a subscriber",
    inputSchema: {
      subscriberId: z.union([z.string(), z.number()]).describe("ManyChat subscriber ID"),
      flowNs: z.string().describe("The namespace or flow ID to execute (e.g. 'content_delivery_flow')")
    }
  },
  async ({ subscriberId, flowNs }) => {
    try {
      const endpoint = "/fb/sending/sendFlow";
      const payload = {
        subscriber_id: Number(subscriberId),
        flow_ns: flowNs
      };
      const response = await requestManyChat(endpoint, "POST", payload);
      return {
        content: [
          {
            type: "text",
            text: `Successfully triggered flow "${flowNs}" for subscriber ${subscriberId}.`
          }
        ],
        structuredContent: response
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message || error}` }],
        isError: true
      };
    }
  }
);

// 5. Get all custom fields
server.registerTool(
  "get_custom_fields",
  {
    title: "Get Custom Fields",
    description: "Retrieve all Custom User Fields (CUFs) defined for the page to map field names to IDs",
    inputSchema: {}
  },
  async () => {
    try {
      const endpoint = "/fb/page/getCustomFields";
      const response = await requestManyChat(endpoint, "GET");
      
      const fieldsText = response.data.map((f: any) => `- [ID: ${f.id}] name: "${f.name}", type: "${f.type}", description: "${f.description || ''}"`).join("\n");
      
      return {
        content: [
          {
            type: "text",
            text: `ManyChat Custom Fields for this account:\n\n${fieldsText}`
          }
        ],
        structuredContent: response
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message || error}` }],
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
