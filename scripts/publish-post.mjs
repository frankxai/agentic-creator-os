import { getAdapter } from "../mcp-servers/social/build/adapters/index.js";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

async function main() {
  const type = process.env.SOCIAL_PUBLISHER_TYPE || "local";
  const postText = process.argv[2];
  const channelsArg = process.argv[3];
  const mediaPath = process.argv[4];

  if (!postText || !channelsArg) {
    console.log("\n📖 Social Posting CLI");
    console.log("Usage: node scripts/publish-post.mjs \"<text>\" \"<channels>\" [<mediaPath>]");
    console.log("Example: node scripts/publish-post.mjs \"Hello from ACOS Sovereign Distro!\" \"browser-x,browser-threads\"");
    console.log("\nSet SOCIAL_PUBLISHER_TYPE=local|blotato|postiz|playwright in your env to change engines.\n");
    process.exit(1);
  }

  const channels = channelsArg.split(",").map(c => c.trim());
  const adapter = getAdapter(type);

  console.log(`\n📢 Active Publisher Engine: ${type.toUpperCase()}`);
  console.log(`📢 Target Channels: ${channels.join(", ")}`);
  
  try {
    const results = await adapter.publish(postText, channels, mediaPath);
    console.log("\n📊 Execution Summary:");
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("\n❌ Error publishing post:", error);
  }
}

main();
