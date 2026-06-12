import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getAdapter } from "./adapters/index.js";
import { PlaywrightBrowserAdapter } from "./adapters/playwright-browser.js";
import dotenv from "dotenv";
dotenv.config();

const server = new McpServer({
  name: "starlight-social",
  version: "1.0.0"
});

function getActiveAdapterType(): string {
  return process.env.SOCIAL_PUBLISHER_TYPE || "local";
}

// 1. Get channels
server.registerTool(
  "get_channels",
  {
    title: "Get Publishing Channels",
    description: "Get list of authorized publishing channels for the active adapter",
    inputSchema: {}
  },
  async () => {
    try {
      const type = getActiveAdapterType();
      const adapter = getAdapter(type);
      const channels = await adapter.getChannels();
      return {
        content: [
          {
            type: "text",
            text: `Active publisher type: ${type.toUpperCase()}\n\nAuthorized channels:\n` +
              channels.map(c => `- [${c.id}] ${c.name} (${c.platform} -> @${c.profileName})`).join("\n")
          }
        ],
        structuredContent: { type, channels }
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error fetching channels: ${error.message || error}` }],
        isError: true
      };
    }
  }
);

// 2. Publish post
server.registerTool(
  "publish_post",
  {
    title: "Publish Post",
    description: "Publish a post to specified channel(s) through the active adapter",
    inputSchema: {
      text: z.string().describe("The post body content"),
      channels: z.array(z.string()).describe("List of channel IDs to publish to"),
      mediaPath: z.string().optional().describe("Optional local path or URL to image/video")
    }
  },
  async ({ text, channels, mediaPath }) => {
    try {
      const type = getActiveAdapterType();
      const adapter = getAdapter(type);
      
      console.log(`Publishing post via ${type} to channels: ${channels.join(", ")}...`);
      const results = await adapter.publish(text, channels, mediaPath);
      
      const successCount = results.filter(r => r.success).length;
      const summary = `Published to ${successCount}/${results.length} channels.\n\n` +
        results.map(r => r.success 
          ? `✅ [${r.platform}] Published. Post ID: ${r.postId}` 
          : `❌ [${r.platform}] Failed: ${r.error}`
        ).join("\n");

      return {
        content: [{ type: "text", text: summary }],
        structuredContent: { type, results }
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Publish failed: ${error.message || error}` }],
        isError: true
      };
    }
  }
);

// 3. Browser login helper (Playwright specific)
server.registerTool(
  "browser_login_helper",
  {
    title: "Browser Login Helper",
    description: "Launch a headful browser to log in manually and save session state for playwright automation",
    inputSchema: {
      platform: z.enum(["x", "threads", "linkedin", "bluesky", "instagram"]).describe("Platform to log in to")
    }
  },
  async ({ platform }) => {
    try {
      const browserAdapter = new PlaywrightBrowserAdapter();
      const message = await browserAdapter.launchLoginSession(platform);
      return {
        content: [{ type: "text", text: message }],
        structuredContent: { platform, success: true }
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Failed to launch login session: ${error.message || error}` }],
        isError: true
      };
    }
  }
);

// 4. Configure active engine
server.registerTool(
  "configure_engine",
  {
    title: "Configure Social Publisher Engine",
    description: "Temporarily change the active social publishing adapter type",
    inputSchema: {
      type: z.enum(["local", "blotato", "postiz", "playwright"]).describe("The adapter engine to set active")
    }
  },
  async ({ type }) => {
    process.env.SOCIAL_PUBLISHER_TYPE = type;
    return {
      content: [{ type: "text", text: `Social publisher engine changed to: ${type.toUpperCase()}` }],
      structuredContent: { activeEngine: type }
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
