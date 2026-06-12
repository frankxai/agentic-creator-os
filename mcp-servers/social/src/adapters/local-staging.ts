import { SocialAdapter, PublishResult, Channel } from "./index.js";
import fs from "fs/promises";
import path from "path";

export class LocalStagingAdapter implements SocialAdapter {
  async getChannels(): Promise<Channel[]> {
    return [
      { id: "local-x", name: "Local X Profile", platform: "x", profileName: "local_operator" },
      { id: "local-linkedin", name: "Local LinkedIn Profile", platform: "linkedin", profileName: "local_operator" },
      { id: "local-threads", name: "Local Threads Profile", platform: "threads", profileName: "local_operator" }
    ];
  }

  async publish(text: string, channels: string[], mediaPath?: string): Promise<PublishResult[]> {
    const results: PublishResult[] = [];
    const stagingDir = path.resolve("./outputs/staging-social");
    await fs.mkdir(stagingDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = path.join(stagingDir, `post-${timestamp}.json`);
    
    await fs.writeFile(filePath, JSON.stringify({ text, channels, mediaPath, timestamp }, null, 2));
    
    for (const channelId of channels) {
      results.push({
        success: true,
        platform: channelId.split("-")[1] || "unknown",
        postId: `staged-${timestamp}-${channelId}`
      });
    }
    
    return results;
  }
}
