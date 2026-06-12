import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";

async function main() {
  const platform = process.argv[2];
  if (!platform) {
    console.error("Usage: node scripts/social-login.mjs [x|threads|linkedin|bluesky|instagram]");
    process.exit(1);
  }

  const targetPlatform = platform.toLowerCase();
  const sessionDir = path.resolve(`./private/auth/browser-profile/${targetPlatform}`);
  await fs.mkdir(sessionDir, { recursive: true });

  console.log(`\n🚀 Launching headful browser for ${targetPlatform.toUpperCase()}...`);
  console.log(`📁 Saving profile cookies/session to: ${sessionDir}\n`);
  console.log("👉 ACTION REQUIRED: Log in manually in the opened browser window.");
  console.log("👉 Once logged in successfully, simply close the browser window to save your session.\n");

  let loginUrl = "";
  switch (targetPlatform) {
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
      loginUrl = `https://google.com/search?q=${targetPlatform}+login`;
  }

  try {
    const context = await chromium.launchPersistentContext(sessionDir, {
      headless: false,
      viewport: null,
      args: ["--start-maximized"]
    });

    const page = await context.newPage();
    await page.goto(loginUrl);

    // Wait for the browser context to close (when the user closes the window)
    return new Promise((resolve) => {
      context.on("close", () => {
        console.log(`\n💾 Browser window closed. Session saved successfully for ${targetPlatform.toUpperCase()}!`);
        resolve(null);
      });
    });
  } catch (error) {
    console.error("Failed to run login session:", error);
    process.exit(1);
  }
}

main();
