import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

// Load configuration
dotenv.config();

async function runCommentEngine() {
  console.log("\n========================================================");
  console.log("  🛰  SOVEREIGN COMMENT-TO-DM LINK ROUTING ENGINE");
  console.log("========================================================\n");

  const platform = process.argv[2] || "x";
  const postUrl = process.argv[3];

  if (!postUrl) {
    console.error("❌ Please provide a target post URL. Usage: node scripts/comment-dm-engine.mjs [x|threads|linkedin] [post-url]");
    process.exit(1);
  }

  const projectRoot = path.resolve("./");
  const linksDbPath = path.join(projectRoot, "private", "social", "links.json");
  const deliveryLogPath = path.join(projectRoot, "private", "social", "delivery-log.json");

  // Load link database
  let linksDb = {};
  try {
    const rawLinks = await fs.readFile(linksDbPath, "utf8");
    linksDb = JSON.parse(rawLinks);
  } catch (err) {
    console.error("❌ Could not read private/social/links.json. Run node scripts/install-social-suite.mjs first.");
    process.exit(1);
  }

  // Load delivery log
  let deliveryLog = [];
  try {
    const rawLog = await fs.readFile(deliveryLogPath, "utf8");
    deliveryLog = JSON.parse(rawLog);
  } catch {
    // Start empty
  }

  // Identify config key
  let activeConfig = null;
  let activeKey = "";
  for (const key of Object.keys(linksDb)) {
    if (postUrl.includes(key) || postUrl) {
      activeConfig = linksDb[key];
      activeKey = key;
      break;
    }
  }

  if (!activeConfig) {
    console.error(`❌ No link routing configuration found matching context/URL: ${postUrl}`);
    process.exit(1);
  }

  console.log(`🎯 Active Routing Configuration: [${activeKey}]`);
  console.log(`👉 Keyword Trigger: "${activeConfig.keyword}"`);
  console.log(`👉 Delivery Target: ${activeConfig.deliveryLink}`);

  // Fetch session path
  const sessionDir = path.join(projectRoot, "private", "auth", "browser-profile", platform.toLowerCase());
  try {
    await fs.access(sessionDir);
  } catch {
    console.error(`❌ Session directory for ${platform} does not exist at ${sessionDir}. Please run scripts/social-login.mjs first.`);
    process.exit(1);
  }

  console.log(`\n🌐 Launching browser context for ${platform}...`);
  const context = await chromium.launchPersistentContext(sessionDir, {
    headless: true,
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  try {
    const normPlatform = platform.toLowerCase();
    if (normPlatform === "x" || normPlatform === "twitter") {
      await crawlAndProcessX(page, postUrl, activeConfig, deliveryLog, deliveryLogPath);
    } else if (normPlatform === "threads") {
      await crawlAndProcessThreads(page, postUrl, activeConfig, deliveryLog, deliveryLogPath);
    } else if (normPlatform === "linkedin") {
      await crawlAndProcessLinkedIn(page, postUrl, activeConfig, deliveryLog, deliveryLogPath);
    } else {
      throw new Error(`Platform ${platform} not supported by DM engine.`);
    }
  } catch (err) {
    console.error("❌ Crawling sequence hit an error:", err.message || err);
    // Save error screenshot
    const errorScreenshotDir = path.join(projectRoot, "outputs", "errors");
    await fs.mkdir(errorScreenshotDir, { recursive: true });
    await page.screenshot({ path: path.join(errorScreenshotDir, `${platform}-crawl-error-${Date.now()}.png`) });
  } finally {
    await context.close();
    console.log("\n========================================================");
  }
}

// ============================================================================
// X / Twitter Platform Logic
// ============================================================================
async function crawlAndProcessX(page, postUrl, config, deliveryLog, logPath) {
  console.log(`💬 Navigating to X post: ${postUrl}...`);
  await page.goto(postUrl, { waitUntil: "networkidle" });

  const commentSelector = '[data-testid="tweet"]';
  await page.waitForSelector(commentSelector, { timeout: 15000 });
  const tweets = await page.$$(commentSelector);
  console.log(`🔍 Found ${tweets.length} comments on page...`);

  for (const tweet of tweets) {
    const textElement = await tweet.$('[data-testid="tweetText"]');
    const text = textElement ? await textElement.textContent() : "";

    const handleElement = await tweet.$('a[href^="/"][role="link"]');
    let handle = "";
    if (handleElement) {
      const href = await handleElement.getAttribute("href");
      handle = href ? href.replace("/", "") : "";
    }

    if (!handle || handle === "home" || handle === "explore") continue;

    if (text.toUpperCase().includes(config.keyword.toUpperCase())) {
      console.log(`\n✨ Match detected from commenter: @${handle} ("${text.trim().substring(0, 40)}...")`);

      const hasDelivered = deliveryLog.some(log => log.handle === handle && log.configKey === config.keyword);
      if (hasDelivered) {
        console.log(`  ℹ️ Link already sent to @${handle}. Skipping.`);
        continue;
      }

      console.log(`  🚀 Sending link message to @${handle}...`);
      try {
        await sendDirectMessageX(page, handle, config.dmTemplate.replace("{{link}}", config.deliveryLink));
        
        deliveryLog.push({
          handle,
          configKey: config.keyword,
          deliveryLink: config.deliveryLink,
          timestamp: new Date().toISOString()
        });
        await fs.writeFile(logPath, JSON.stringify(deliveryLog, null, 2));
        console.log(`  ✅ Delivery recorded for @${handle}`);
      } catch (err) {
        console.error(`  ❌ Failed to deliver message to @${handle}:`, err.message);
      }
    }
  }
}

async function sendDirectMessageX(page, handle, messageText) {
  await page.goto(`https://x.com/messages/compose?recipient=${handle}`, { waitUntil: "networkidle" });
  
  const dmEditor = 'div[role="textbox"][aria-label="Start a new message"]';
  await page.waitForSelector(dmEditor, { timeout: 10000 });
  await page.click(dmEditor);
  await page.fill(dmEditor, messageText);
  
  const sendButton = '[data-testid="dmComposerSendButton"]';
  await page.waitForSelector(sendButton, { timeout: 5000 });
  await page.click(sendButton);
  await page.waitForTimeout(2000);
}

// ============================================================================
// Threads Platform Logic (Sends DMs via connected Instagram web inbox)
// ============================================================================
async function crawlAndProcessThreads(page, postUrl, config, deliveryLog, logPath) {
  console.log(`💬 Navigating to Threads post: ${postUrl}...`);
  await page.goto(postUrl, { waitUntil: "networkidle" });

  const replySelector = 'div[role="article"]';
  await page.waitForSelector(replySelector, { timeout: 15000 });
  const replies = await page.$$(replySelector);
  console.log(`🔍 Found ${replies.length} replies on page...`);

  for (const reply of replies) {
    // Extract reply text
    const textElement = await reply.$('span');
    const text = textElement ? await textElement.textContent() : "";

    // Extract handle name
    const handleElement = await reply.$('a[href^="/@"]');
    let handle = "";
    if (handleElement) {
      const href = await handleElement.getAttribute("href");
      handle = href ? href.replace("/@", "") : "";
    }

    if (!handle || text === "") continue;

    if (text.toUpperCase().includes(config.keyword.toUpperCase())) {
      console.log(`\n✨ Match detected from commenter: @${handle} ("${text.trim().substring(0, 40)}...")`);

      const hasDelivered = deliveryLog.some(log => log.handle === handle && log.configKey === config.keyword);
      if (hasDelivered) {
        console.log(`  ℹ️ Link already sent to @${handle}. Skipping.`);
        continue;
      }

      console.log(`  🚀 Sending IG DM to @${handle}...`);
      try {
        await sendDirectMessageInstagram(page, handle, config.dmTemplate.replace("{{link}}", config.deliveryLink));
        
        deliveryLog.push({
          handle,
          configKey: config.keyword,
          deliveryLink: config.deliveryLink,
          timestamp: new Date().toISOString()
        });
        await fs.writeFile(logPath, JSON.stringify(deliveryLog, null, 2));
        console.log(`  ✅ Delivery recorded for @${handle}`);
      } catch (err) {
        console.error(`  ❌ Failed to deliver IG DM to @${handle}:`, err.message);
      }
    }
  }
}

async function sendDirectMessageInstagram(page, handle, messageText) {
  // Go to Instagram Direct Inbox
  await page.goto("https://www.instagram.com/direct/new/", { waitUntil: "networkidle" });

  // Type username in search bar
  const searchInput = 'input[placeholder="Search..."], input[name="queryBox"]';
  await page.waitForSelector(searchInput, { timeout: 10000 });
  await page.fill(searchInput, handle);
  await page.waitForTimeout(2000);

  // Select first match checkmark
  const searchResult = `div[role="dialog"] div:has-text("${handle}"), button:has-text("${handle}")`;
  await page.click(searchResult);
  await page.waitForTimeout(1000);

  // Click Next
  const nextButton = 'button:has-text("Chat"), div[role="dialog"] button:has-text("Next")';
  await page.click(nextButton);
  await page.waitForTimeout(3000);

  // Type message inside chat text area
  const messageBox = 'div[role="textbox"], textarea[placeholder="Message..."]';
  await page.waitForSelector(messageBox, { timeout: 10000 });
  await page.click(messageBox);
  await page.fill(messageBox, messageText);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);
}

// ============================================================================
// LinkedIn Platform Logic
// ============================================================================
async function crawlAndProcessLinkedIn(page, postUrl, config, deliveryLog, logPath) {
  console.log(`💬 Navigating to LinkedIn post: ${postUrl}...`);
  await page.goto(postUrl, { waitUntil: "networkidle" });

  const commentItemSelector = '.comments-comment-item';
  await page.waitForSelector(commentItemSelector, { timeout: 15000 });
  const comments = await page.$$(commentItemSelector);
  console.log(`🔍 Found ${comments.length} comments on page...`);

  for (const comment of comments) {
    const textElement = await comment.$('.comments-comment-item__main-content');
    const text = textElement ? await textElement.textContent() : "";

    const profileLinkElement = await comment.$('a.comments-post-meta__profile-link');
    let handle = "";
    if (profileLinkElement) {
      const href = await profileLinkElement.getAttribute("href");
      // Handle maps to profile slug in URL: linkedin.com/in/profile-slug
      handle = href ? href.split("/in/")[1]?.split("/")[0] : "";
    }

    if (!handle || text === "") continue;

    if (text.toUpperCase().includes(config.keyword.toUpperCase())) {
      console.log(`\n✨ Match detected from commenter: ${handle} ("${text.trim().substring(0, 40)}...")`);

      const hasDelivered = deliveryLog.some(log => log.handle === handle && log.configKey === config.keyword);
      if (hasDelivered) {
        console.log(`  ℹ️ Link already sent to ${handle}. Skipping.`);
        continue;
      }

      console.log(`  🚀 Navigating to profile and opening message dialog for ${handle}...`);
      try {
        await sendDirectMessageLinkedIn(page, handle, config.dmTemplate.replace("{{link}}", config.deliveryLink));
        
        deliveryLog.push({
          handle,
          configKey: config.keyword,
          deliveryLink: config.deliveryLink,
          timestamp: new Date().toISOString()
        });
        await fs.writeFile(logPath, JSON.stringify(deliveryLog, null, 2));
        console.log(`  ✅ Delivery recorded for ${handle}`);
      } catch (err) {
        console.error(`  ❌ Failed to deliver message to ${handle}:`, err.message);
      }
    }
  }
}

async function sendDirectMessageLinkedIn(page, profileSlug, messageText) {
  // Navigate to target user profile
  await page.goto(`https://www.linkedin.com/in/${profileSlug}/`, { waitUntil: "networkidle" });

  // Locate the message button
  const messageButton = 'button:has-text("Message"), .message-anywhere-button';
  await page.waitForSelector(messageButton, { timeout: 10000 });
  await page.click(messageButton);
  await page.waitForTimeout(3000);

  // Locate active message editor textbox on bottom right
  const editorBox = 'div[role="textbox"][aria-label="Write a message..."], .msg-form__contenteditable';
  await page.waitForSelector(editorBox, { timeout: 10000 });
  await page.click(editorBox);
  await page.fill(editorBox, messageText);
  await page.waitForTimeout(1000);

  // Click Send button
  const sendBtn = 'button.msg-form__send-button';
  await page.click(sendBtn);
  await page.waitForTimeout(2000);
}

runCommentEngine().catch(console.error);
