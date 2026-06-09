import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { chromium } from "playwright";
let browser = null;
let page = null;
async function ensureBrowser() {
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
    version: "1.0.0"
});
server.registerTool("navigate", {
    title: "Navigate to URL",
    description: "Navigate to a URL and wait for page load",
    inputSchema: {
        url: z.string().url().describe("URL to navigate to"),
        waitUntil: z.enum(["load", "domcontentloaded", "networkidle"]).default("networkidle").describe("When to consider navigation complete")
    },
    annotations: {
        readOnlyHint: true
    }
}, async ({ url, waitUntil = "networkidle" }) => {
    try {
        const page = await ensureBrowser();
        await page.goto(url, { waitUntil: waitUntil });
        const title = await page.title();
        return {
            content: [{ type: "text", text: `Navigated to ${url}\nTitle: ${title}` }],
            structuredContent: { url, title }
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Navigation error: ${error}` }],
            isError: true
        };
    }
});
server.registerTool("get_page_content", {
    title: "Get Page Content",
    description: "Get the text content of the current page",
    inputSchema: {
        selector: z.string().optional().describe("CSS selector to extract specific element")
    },
    annotations: {
        readOnlyHint: true
    }
}, async ({ selector }) => {
    try {
        const page = await ensureBrowser();
        let content;
        let accessibilityTree;
        if (selector) {
            const element = await page.$(selector);
            content = await element?.textContent() || "";
        }
        else {
            content = await page.textContent("body") || "";
        }
        accessibilityTree = await page.accessibility.snapshot();
        const title = await page.title();
        return {
            content: [{ type: "text", text: `Title: ${title}\n\nContent:\n${content}` }],
            structuredContent: { title, content, accessibilityTree }
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error}` }],
            isError: true
        };
    }
});
server.registerTool("click", {
    title: "Click Element",
    description: "Click on an element by selector",
    inputSchema: {
        selector: z.string().describe("CSS selector of the element to click"),
        timeout: z.number().default(5000).describe("Timeout in milliseconds")
    },
    annotations: {
        destructiveHint: false
    }
}, async ({ selector, timeout = 5000 }) => {
    try {
        const page = await ensureBrowser();
        await page.click(selector, { timeout });
        return {
            content: [{ type: "text", text: `Clicked element: ${selector}` }],
            structuredContent: { selector }
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Click error: ${error}` }],
            isError: true
        };
    }
});
server.registerTool("fill_input", {
    title: "Fill Input",
    description: "Fill in an input field",
    inputSchema: {
        selector: z.string().describe("CSS selector of the input"),
        value: z.string().describe("Value to fill")
    },
    annotations: {
        destructiveHint: false
    }
}, async ({ selector, value }) => {
    try {
        const page = await ensureBrowser();
        await page.fill(selector, value);
        return {
            content: [{ type: "text", text: `Filled ${selector} with: ${value}` }],
            structuredContent: { selector, value }
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Fill error: ${error}` }],
            isError: true
        };
    }
});
server.registerTool("screenshot", {
    title: "Take Screenshot",
    description: "Take a screenshot of the current page",
    inputSchema: {
        path: z.string().optional().describe("Path to save screenshot (base64 if not provided)")
    },
    annotations: {
        readOnlyHint: true
    }
}, async ({ path }) => {
    try {
        const page = await ensureBrowser();
        const screenshot = await page.screenshot({ type: "png" });
        if (path) {
            await require("fs/promises").writeFile(path, screenshot);
            return {
                content: [{ type: "text", text: `Screenshot saved to ${path}` }],
                structuredContent: { path }
            };
        }
        const base64 = screenshot.toString("base64");
        return {
            content: [{ type: "text", text: `Screenshot (base64, ${base64.length} chars)` }],
            structuredContent: { screenshot: base64, format: "base64" }
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Screenshot error: ${error}` }],
            isError: true
        };
    }
});
server.registerTool("evaluate", {
    title: "Evaluate JavaScript",
    description: "Execute JavaScript in the page context",
    inputSchema: {
        script: z.string().describe("JavaScript code to execute")
    },
    annotations: {
        readOnlyHint: true
    }
}, async ({ script }) => {
    try {
        const page = await ensureBrowser();
        const result = await page.evaluate(script);
        return {
            content: [{ type: "text", text: `Result: ${JSON.stringify(result)}` }],
            structuredContent: { result }
        };
    }
    finally {
        return {
            content: [{ type: "text", text: `Evaluate error: ${error}` }],
            isError: true
        };
    }
});
server.registerTool("get_links", {
    title: "Get All Links",
    description: "Get all links on the current page",
    inputSchema: {},
    annotations: {
        readOnlyHint: true
    }
}, async () => {
    try {
        const page = await ensureBrowser();
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("a"))
                .map(a => ({
                href: a.href,
                text: a.textContent?.trim() || "",
                title: a.title || ""
            }))
                .filter(l => l.href);
        });
        return {
            content: [{ type: "text", text: `Found ${links.length} links` }],
            structuredContent: { links }
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error}` }],
            isError: true
        };
    }
});
server.registerTool("wait_for_selector", {
    title: "Wait for Selector",
    description: "Wait for an element to appear",
    inputSchema: {
        selector: z.string().describe("CSS selector to wait for"),
        timeout: z.number().default(10000).describe("Timeout in milliseconds")
    },
    annotations: {
        readOnlyHint: true
    }
}, async ({ selector, timeout = 10000 }) => {
    try {
        const page = await ensureBrowser();
        await page.waitForSelector(selector, { timeout });
        return {
            content: [{ type: "text", text: `Element found: ${selector}` }],
            structuredContent: { selector }
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Wait error: ${error}` }],
            isError: true
        };
    }
});
server.registerTool("close", {
    title: "Close Browser",
    description: "Close the browser instance",
    inputSchema: {},
    annotations: {
        destructiveHint: false
    }
}, async () => {
    try {
        if (page) {
            await page.close();
            page = null;
        }
        if (browser) {
            await browser.close();
            browser = null;
        }
        return {
            content: [{ type: "text", text: "Browser closed" }],
            structuredContent: {}
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Close error: ${error}` }],
            isError: true
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
//# sourceMappingURL=index.js.map