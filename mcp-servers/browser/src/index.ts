import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { writeFile } from "fs/promises";
import { resolve } from "path";
import { chromium, type Browser, type Page } from "playwright";

let browser: Browser | null = null;
let page: Page | null = null;

async function ensureBrowser(): Promise<Page> {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  if (!page) {
    page = await browser.newPage();
  }
  return page;
}

const server = new McpServer({
  name: "browser",
  version: "1.1.0"
});

const selector = z.string().min(1).max(1000);
const timeout = (fallback: number) => z.number().int().min(100).max(120_000).default(fallback);

function ok<T extends Record<string, unknown>>(data: T) {
  const plain = JSON.parse(JSON.stringify(data)) as T;
  return { content: [{ type: "text" as const, text: JSON.stringify(plain, null, 2) }], structuredContent: plain };
}

function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

server.registerTool(
  "browser_navigate",
  {
    title: "Navigate to URL",
    description: "Open a URL in the shared headless Chromium page (launched on first use, ~1-2 s) and wait for it to load. Use it before reading, clicking or screenshotting a page. Returns the final URL after redirects, the page title and the HTTP status.",
    inputSchema: {
      url: z.string().url().max(2048).describe("Absolute http(s) URL to open"),
      waitUntil: z.enum(["load", "domcontentloaded", "networkidle"]).default("networkidle").describe("Load event to wait for; networkidle is slowest but waits for late requests"),
      timeout: timeout(30_000).describe("Milliseconds to wait before failing")
    },
    outputSchema: {
      url: z.string().describe("Final URL after redirects"),
      title: z.string().describe("Page title"),
      status: z.number().nullable().describe("HTTP status of the main response, or null for same-document navigation")
    },
    annotations: { readOnlyHint: true, openWorldHint: true }
  },
  async ({ url, waitUntil, timeout }) => {
    try {
      const current = await ensureBrowser();
      const response = await current.goto(url, { waitUntil, timeout });
      return ok({ url: current.url(), title: await current.title(), status: response?.status() ?? null });
    } catch (error) {
      return fail(`Navigation error: ${error}`);
    }
  }
);

server.registerTool(
  "browser_get_page_content",
  {
    title: "Get page content",
    description: "Read the visible text of the current page, or of the first element matching a CSS selector. Call browser_navigate first. Returns the title, URL and text cut at maxChars (default 20,000) with a truncated flag, so long pages stay affordable.",
    inputSchema: {
      selector: selector.optional().describe("CSS selector of the element to read; omit for the whole body"),
      maxChars: z.number().int().min(100).max(200_000).default(20_000).describe("Maximum characters of text to return")
    },
    outputSchema: {
      url: z.string().describe("Current page URL"),
      title: z.string().describe("Page title"),
      content: z.string().describe("Visible text, possibly truncated"),
      totalChars: z.number().describe("Length of the full text"),
      truncated: z.boolean().describe("True when content was cut at maxChars")
    },
    annotations: { readOnlyHint: true, openWorldHint: true }
  },
  async ({ selector, maxChars }) => {
    try {
      const current = await ensureBrowser();
      const text = selector
        ? (await current.$(selector).then((element) => element?.innerText())) ?? ""
        : await current.innerText("body");
      return ok({ url: current.url(), title: await current.title(), content: text.slice(0, maxChars), totalChars: text.length, truncated: text.length > maxChars });
    } catch (error) {
      return fail(`Error reading page: ${error}`);
    }
  }
);

server.registerTool(
  "browser_click",
  {
    title: "Click element",
    description: "Click the first element matching a CSS selector on the current page. A click can submit forms, buy, delete or post on the live site, so confirm intent first. Waits up to timeout for the element. Returns the selector and the URL after the click.",
    inputSchema: {
      selector: selector.describe("CSS selector of the element to click"),
      timeout: timeout(5000).describe("Milliseconds to wait for the element")
    },
    outputSchema: {
      selector: z.string().describe("Selector that was clicked"),
      url: z.string().describe("Page URL after the click")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true }
  },
  async ({ selector, timeout }) => {
    try {
      const current = await ensureBrowser();
      await current.click(selector, { timeout });
      return ok({ selector, url: current.url() });
    } catch (error) {
      return fail(`Click error: ${error}`);
    }
  }
);

server.registerTool(
  "browser_fill_input",
  {
    title: "Fill input",
    description: "Type a value into the input, textarea or contenteditable matching a CSS selector, replacing what was there. It does not submit; use browser_click on the submit button for that. Returns the selector and the number of characters filled.",
    inputSchema: {
      selector: selector.describe("CSS selector of the field to fill"),
      value: z.string().max(100_000).describe("Text to put in the field")
    },
    outputSchema: {
      selector: z.string().describe("Selector that was filled"),
      length: z.number().describe("Characters filled")
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  async ({ selector, value }) => {
    try {
      const current = await ensureBrowser();
      await current.fill(selector, value);
      return ok({ selector, length: value.length });
    } catch (error) {
      return fail(`Fill error: ${error}`);
    }
  }
);

server.registerTool(
  "browser_screenshot",
  {
    title: "Take screenshot",
    description: "Capture a PNG of the current page viewport (or the full page). With path it writes the file, overwriting any file there; without path it returns base64 PNG data, which is large (often 100k+ characters), so prefer a path.",
    inputSchema: {
      path: z.string().max(4096).optional().describe("File path to save the PNG to; omit to receive base64 data instead"),
      fullPage: z.boolean().default(false).describe("Capture the whole scrollable page instead of the viewport")
    },
    outputSchema: {
      path: z.string().optional().describe("Absolute path of the saved PNG, when path was given"),
      screenshot: z.string().optional().describe("Base64 PNG data, when no path was given"),
      format: z.literal("png").describe("Image format"),
      bytes: z.number().describe("Size of the PNG in bytes")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true }
  },
  async ({ path, fullPage }) => {
    try {
      const current = await ensureBrowser();
      const png = await current.screenshot({ type: "png", fullPage });
      if (path) {
        const target = resolve(path);
        await writeFile(target, png);
        return ok({ path: target, format: "png" as const, bytes: png.length });
      }
      return ok({ screenshot: png.toString("base64"), format: "png" as const, bytes: png.length });
    } catch (error) {
      return fail(`Screenshot error: ${error}`);
    }
  }
);

server.registerTool(
  "browser_evaluate",
  {
    title: "Evaluate JavaScript",
    description: "Run a JavaScript expression in the current page and return its JSON-serialisable result. The script runs with the page's privileges and can change the page or send requests, so treat it as a write. Returns the result value.",
    inputSchema: {
      script: z.string().min(1).max(50_000).describe("JavaScript expression or IIFE evaluated in the page; its result must be JSON-serialisable")
    },
    outputSchema: {
      result: z.unknown().describe("The script's return value")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true }
  },
  async ({ script }) => {
    try {
      const current = await ensureBrowser();
      const result = await current.evaluate(script);
      return ok({ result: result === undefined ? null : result });
    } catch (error) {
      return fail(`Evaluate error: ${error}`);
    }
  }
);

server.registerTool(
  "browser_get_links",
  {
    title: "Get page links",
    description: "Collect the links (<a href>) on the current page with their text and title attribute, in document order. Use it to discover where to navigate next. Returns up to limit links (default 100, max 1000) and the total found on the page.",
    inputSchema: {
      limit: z.number().int().min(1).max(1000).default(100).describe("Maximum links to return")
    },
    outputSchema: {
      links: z.array(z.object({
        href: z.string().describe("Absolute link URL"),
        text: z.string().describe("Link text"),
        title: z.string().describe("title attribute, or empty")
      })).describe("Links in document order"),
      total: z.number().describe("Links found on the page")
    },
    annotations: { readOnlyHint: true, openWorldHint: true }
  },
  async ({ limit }) => {
    try {
      const current = await ensureBrowser();
      const links = await current.$$eval("a[href]", (anchors) => anchors.map((a) => ({
        href: (a as HTMLAnchorElement).href,
        text: a.textContent?.trim() || "",
        title: (a as HTMLAnchorElement).title || ""
      })));
      return ok({ links: links.slice(0, limit), total: links.length });
    } catch (error) {
      return fail(`Error collecting links: ${error}`);
    }
  }
);

server.registerTool(
  "browser_wait_for_selector",
  {
    title: "Wait for selector",
    description: "Wait until an element matching a CSS selector is visible on the current page, for pages that render content after load. Returns found true with the selector, or an error when timeout passes first. Costs up to timeout milliseconds.",
    inputSchema: {
      selector: selector.describe("CSS selector to wait for"),
      timeout: timeout(10_000).describe("Milliseconds to wait before failing")
    },
    outputSchema: {
      selector: z.string().describe("Selector that appeared"),
      found: z.boolean().describe("True when the element became visible")
    },
    annotations: { readOnlyHint: true, openWorldHint: true }
  },
  async ({ selector, timeout }) => {
    try {
      const current = await ensureBrowser();
      await current.waitForSelector(selector, { timeout });
      return ok({ selector, found: true });
    } catch (error) {
      return fail(`Wait error: ${error}`);
    }
  }
);

server.registerTool(
  "browser_close",
  {
    title: "Close browser",
    description: "Close the shared headless Chromium page and browser to free memory (~100-300 MB). Safe to call when nothing is open. The next browser tool call starts a fresh browser without cookies or history. Returns whether a browser was open.",
    inputSchema: z.object({}).strict(),
    outputSchema: {
      closed: z.boolean().describe("True when a browser was open and is now closed")
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async () => {
    try {
      const wasOpen = browser !== null;
      if (page) {
        await page.close();
        page = null;
      }
      if (browser) {
        await browser.close();
        browser = null;
      }
      return ok({ closed: wasOpen });
    } catch (error) {
      return fail(`Close error: ${error}`);
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
