import fs from "fs/promises";
import path from "path";

async function runInstallation() {
  console.log("\n========================================================");
  console.log("  🛰  SOVEREIGN SOCIAL MEDIA SUITE: INSTALLER");
  console.log("========================================================\n");

  const projectRoot = path.resolve("./");
  console.log(`📁 Project Root: ${projectRoot}`);

  // Define paths
  const paths = {
    privateAuth: path.join(projectRoot, "private", "auth", "browser-profile"),
    privateSocial: path.join(projectRoot, "private", "social"),
    privateVoice: path.join(projectRoot, "private", "voice"),
    outputs: path.join(projectRoot, "outputs", "errors"),
    visionOutputs: path.join(projectRoot, "outputs", "vision-screenshots")
  };

  // 1. Create directories
  console.log("🛠  Scaffolding directory layout...");
  for (const [key, dirPath] of Object.entries(paths)) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`  ✅ Created: ${path.relative(projectRoot, dirPath)}`);
    } catch (err) {
      console.error(`  ❌ Failed creating ${key} at ${dirPath}:`, err.message);
    }
  }

  // 2. Scaffold private/social/links.json (ManyChat replacement)
  const linksJsonPath = path.join(paths.privateSocial, "links.json");
  const defaultLinks = {
    "faceless-youtube-ai-tools-2026": {
      "keyword": "SYSTEM",
      "deliveryLink": "https://frankx.ai/blog/faceless-youtube-ai-tools-2026",
      "dmTemplate": "Here is the Starlight system map for building faceless AI channels in 2026: {{link}}"
    }
  };

  try {
    await fs.writeFile(linksJsonPath, JSON.stringify(defaultLinks, null, 2), { flag: "wx" });
    console.log("  ✅ Scaffolded default: private/social/links.json");
  } catch (err) {
    if (err.code === "EEXIST") {
      console.log("  ℹ️  Skipped: private/social/links.json already exists.");
    } else {
      console.error("  ❌ Failed writing links.json:", err.message);
    }
  }

  // 3. Scaffold private/voice/style-guide.json (Personal voice training config)
  const styleGuidePath = path.join(paths.privateVoice, "style-guide.json");
  const defaultStyleGuide = {
    "name": "Operator Private Voice",
    "tone": "Warm, direct, technical, builder-focused. Never use sales-heavy pitches or corporate jargon.",
    "rules": {
      "paragraphs": "Keep under 3 sentences per block. Use double line breaks between paragraphs.",
      "bannedWords": ["delve", "testament", "revolutionize", "thrilled", "excited", "game changer", "insane"],
      "formatting": "Minimize emojis (max 2 per post). Use unicode symbols for highlights if necessary."
    },
    "voiceSample": "Writing is thinking. The bottleneck is never the tools — it is knowing which tools, in which order, to build systems of leverage."
  };

  try {
    await fs.writeFile(styleGuidePath, JSON.stringify(defaultStyleGuide, null, 2), { flag: "wx" });
    console.log("  ✅ Scaffolded default: private/voice/style-guide.json");
  } catch (err) {
    if (err.code === "EEXIST") {
      console.log("  ℹ️  Skipped: private/voice/style-guide.json already exists.");
    } else {
      console.error("  ❌ Failed writing style-guide.json:", err.message);
    }
  }

  // 4. Scaffold private/auth/credentials.env
  const credentialsPath = path.join(projectRoot, "private", "auth", "credentials.env");
  const defaultEnv = `# Web3 direct credentials
BLUESKY_USERNAME=your_username.bsky.social
BLUESKY_APP_PASSWORD=your_app_password
FARCASTER_NEYNAR_API_KEY=your_key
FARCASTER_SIGNER_UUID=your_uuid
`;

  try {
    await fs.writeFile(credentialsPath, defaultEnv, { flag: "wx" });
    console.log("  ✅ Scaffolded default: private/auth/credentials.env");
  } catch (err) {
    if (err.code === "EEXIST") {
      console.log("  ℹ️  Skipped: private/auth/credentials.env already exists.");
    } else {
      console.error("  ❌ Failed writing credentials.env:", err.message);
    }
  }

  console.log("\n--------------------------------------------------------");
  console.log("🏁 INSTALLATION PROCESS COMPLETE!");
  console.log("--------------------------------------------------------");
  console.log("Next steps to set up your environment:");
  console.log("  1. Update credentials in private/auth/credentials.env");
  console.log("  2. Map your comment-to-DM triggers in private/social/links.json");
  console.log("  3. Run the login session helper to cache browser cookie states:");
  console.log("     node scripts/social-login.mjs <x | threads | linkedin>");
  console.log("========================================================\n");
}

runInstallation();
