import { SocialAdapter, PublishResult, Channel } from "./index.js";
import { chromium, BrowserContext, Page } from "playwright";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

export class PlaywrightBrowserAdapter implements SocialAdapter {
  private baseSessionDir: string;

  constructor() {
    this.baseSessionDir = process.env.BROWSER_SESSION_PATH || path.resolve("./private/auth/browser-profile");
  }

  private getSessionPath(platform: string): string {
    return path.join(this.baseSessionDir, platform.toLowerCase());
  }

  async getChannels(): Promise<Channel[]> {
    // Return the available browser automation channels
    return [
      { id: "browser-x", name: "Sovereign X Profile", platform: "x", profileName: "browser_session" },
      { id: "browser-threads", name: "Sovereign Threads Profile", platform: "threads", profileName: "browser_session" },
      { id: "browser-linkedin", name: "Sovereign LinkedIn Profile", platform: "linkedin", profileName: "browser_session" },
      { id: "browser-bluesky", name: "Sovereign Bluesky Profile", platform: "bluesky", profileName: "browser_session" }
    ];
  }

  /**
   * Helper tool to launch headful browser so the user can log in manually once.
   */
  async launchLoginSession(platform: string): Promise<string> {
    const sessionDir = this.getSessionPath(platform);
    await fs.mkdir(sessionDir, { recursive: true });

    console.log(`Starting login session for ${platform} in headful mode...`);
    console.log(`Profile directory: ${sessionDir}`);

    const context = await chromium.launchPersistentContext(sessionDir, {
      headless: false,
      viewport: null,
      args: ["--start-maximized"]
    });

    const page = await context.newPage();
    
    // Navigate to target login URL
    let loginUrl = "";
    switch (platform.toLowerCase()) {
      case "x":
      case "twitter":
        loginUrl = "https://x.com/login";
        break;
      case "threads":
        loginUrl = "https://www.threads.net/login";
        break;
      case "linkedin":
        loginUrl = "https://www.linkedin.com/login";
        break;
      case "bluesky":
        loginUrl = "https://bsky.app/";
        break;
      case "instagram":
        loginUrl = "https://www.instagram.com/accounts/login/";
        break;
      default:
        loginUrl = `https://google.com/search?q=${platform}+login`;
    }

    await page.goto(loginUrl);

    return `Browser launched. Please log in to ${platform} manually in the opened browser window.\nOnce logged in, close the browser window to save your session session cookies.`;
  }

  async publish(text: string, channels: string[], mediaPath?: string): Promise<PublishResult[]> {
    const results: PublishResult[] = [];

    for (const channelId of channels) {
      const platform = channelId.replace("browser-", "").toLowerCase();
      try {
        const result = await this.publishToPlatform(platform, text, mediaPath);
        results.push(result);
      } catch (error: any) {
        results.push({
          success: false,
          platform,
          error: error.message || String(error)
        });
      }
    }

    return results;
  }

  private async publishToPlatform(platform: string, text: string, mediaPath?: string): Promise<PublishResult> {
    const sessionDir = this.getSessionPath(platform);
    
    // Check if session directory exists
    try {
      await fs.access(sessionDir);
    } catch {
      throw new Error(`Profile session for ${platform} does not exist. Run the login helper first.`);
    }

    console.log(`Launching headless browser for ${platform}...`);
    const context = await chromium.launchPersistentContext(sessionDir, {
      headless: true,
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();
    let success = false;
    let errorMsg = "";

    try {
      if (platform === "x" || platform === "twitter") {
        await this.postToX(page, text, mediaPath);
        success = true;
      } else if (platform === "threads") {
        await this.postToThreads(page, text, mediaPath);
        success = true;
      } else if (platform === "linkedin") {
        await this.postToLinkedIn(page, text, mediaPath);
        success = true;
      } else if (platform === "bluesky") {
        await this.postToBluesky(page, text, mediaPath);
        success = true;
      } else {
        throw new Error(`Platform ${platform} not supported via Playwright adapter.`);
      }
    } catch (err: any) {
      errorMsg = err.message || String(err);
      // Capture error screenshot for debugging
      const errorScreenshotDir = path.resolve("./outputs/errors");
      await fs.mkdir(errorScreenshotDir, { recursive: true });
      await page.screenshot({ path: path.join(errorScreenshotDir, `${platform}-error-${Date.now()}.png`) });
    } finally {
      await context.close();
    }

    return {
      success,
      platform,
      postId: success ? `sovereign-browser-${Date.now()}` : undefined,
      error: success ? undefined : errorMsg
    };
  }

  private async postToX(page: Page, text: string, mediaPath?: string) {
    await page.goto("https://x.com/compose/post", { waitUntil: "networkidle" });
    
    // Verify we are logged in by checking if login page redirect occurred
    if (page.url().includes("login")) {
      throw new Error("X session expired. Please re-run the login helper.");
    }

    const editorSelector = '[data-testid="tweetTextarea_0"]';
    await page.waitForSelector(editorSelector, { timeout: 15000 });
    await page.click(editorSelector);
    await page.fill(editorSelector, text);

    if (mediaPath) {
      const fileInputSelector = 'input[data-testid="fileInput"]';
      await page.waitForSelector(fileInputSelector, { timeout: 5000 });
      const fullPath = path.resolve(mediaPath);
      await page.setInputFiles(fileInputSelector, fullPath);
      await page.waitForTimeout(3000); // Wait for upload preview
    }

    const postBtnSelector = '[data-testid="tweetButton"]';
    await page.waitForSelector(postBtnSelector, { timeout: 5000 });
    await page.click(postBtnSelector);
    
    // Wait for the composer to close or feed redirect
    await page.waitForTimeout(5000);
  }

  private async postToThreads(page: Page, text: string, mediaPath?: string) {
    await page.goto("https://www.threads.net/", { waitUntil: "networkidle" });
    
    if (page.url().includes("login")) {
      throw new Error("Threads session expired. Please re-run the login helper.");
    }

    // Threads composer on the home page bottom bar or navigation item
    const startThreadButton = 'div:has-text("Start a thread"), [role="button"]:has-text("Start a thread")';
    await page.waitForSelector(startThreadButton, { timeout: 15000 });
    await page.click(startThreadButton);

    const editorSelector = 'div[role="textbox"]';
    await page.waitForSelector(editorSelector, { timeout: 5000 });
    await page.click(editorSelector);
    await page.fill(editorSelector, text);

    if (mediaPath) {
      // Look for hidden file inputs
      const fileInputSelector = 'input[type="file"]';
      const fullPath = path.resolve(mediaPath);
      await page.setInputFiles(fileInputSelector, fullPath);
      await page.waitForTimeout(3000);
    }

    const postBtnSelector = 'button:has-text("Post")';
    await page.waitForSelector(postBtnSelector, { timeout: 5000 });
    await page.click(postBtnSelector);
    await page.waitForTimeout(5000);
  }

  private async postToLinkedIn(page: Page, text: string, mediaPath?: string) {
    await page.goto("https://www.linkedin.com/feed/", { waitUntil: "networkidle" });
    
    if (page.url().includes("login")) {
      throw new Error("LinkedIn session expired. Please re-run the login helper.");
    }

    const shareBoxTrigger = 'button:has-text("Start a post"), .share-box-feed-entry__trigger';
    await page.waitForSelector(shareBoxTrigger, { timeout: 15000 });
    await page.click(shareBoxTrigger);

    const editorSelector = 'div[role="textbox"]';
    await page.waitForSelector(editorSelector, { timeout: 5000 });
    await page.click(editorSelector);
    await page.fill(editorSelector, text);

    if (mediaPath) {
      // Click media add button inside modal
      const addMediaBtn = 'button[aria-label="Add media"]';
      await page.waitForSelector(addMediaBtn, { timeout: 5000 });
      await page.click(addMediaBtn);

      const fileInputSelector = 'input[type="file"]';
      const fullPath = path.resolve(mediaPath);
      await page.setInputFiles(fileInputSelector, fullPath);
      
      const doneBtn = 'button:has-text("Next"), button:has-text("Done")';
      await page.waitForSelector(doneBtn, { timeout: 5000 });
      await page.click(doneBtn);
      await page.waitForTimeout(2000);
    }

    const postBtn = 'button:has-text("Post"), .share-actions__post-action';
    await page.waitForSelector(postBtn, { timeout: 5000 });
    await page.click(postBtn);
    await page.waitForTimeout(5000);
  }

  private async postToBluesky(page: Page, text: string, mediaPath?: string) {
    await page.goto("https://bsky.app/", { waitUntil: "networkidle" });

    // Look for New Post compose trigger
    const newPostSelector = '[aria-label="New Post"], a[href="/intent/compose"]';
    await page.waitForSelector(newPostSelector, { timeout: 15000 });
    await page.click(newPostSelector);

    const editorSelector = 'div[role="textbox"]';
    await page.waitForSelector(editorSelector, { timeout: 5000 });
    await page.click(editorSelector);
    await page.fill(editorSelector, text);

    if (mediaPath) {
      const fileInputSelector = 'input[type="file"]';
      const fullPath = path.resolve(mediaPath);
      await page.setInputFiles(fileInputSelector, fullPath);
      await page.waitForTimeout(2000);
    }

    const postBtn = 'button:has-text("Publish"), [data-testid="composerPublishBtn"]';
    await page.waitForSelector(postBtn, { timeout: 5000 });
    await page.click(postBtn);
    await page.waitForTimeout(5000);
  }
}
