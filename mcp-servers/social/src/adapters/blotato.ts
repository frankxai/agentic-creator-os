import { SocialAdapter, PublishResult, Channel } from "./index.js";
import dotenv from "dotenv";
dotenv.config();

export class BlotatoAdapter implements SocialAdapter {
  private apiKey: string;
  private baseUrl = "https://backend.blotato.com/v2";

  constructor() {
    this.apiKey = process.env.BLOTATO_API_KEY || "";
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      "blotato-api-key": this.apiKey
    };
  }

  async getChannels(): Promise<Channel[]> {
    if (!this.apiKey) {
      throw new Error("BLOTATO_API_KEY environment variable is not configured.");
    }

    const response = await fetch(`${this.baseUrl}/users/me/accounts`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Blotato error fetching channels: ${response.statusText} (${response.status})`);
    }

    const data = await response.json() as any;
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((acc: any) => ({
      id: String(acc.id),
      name: acc.name || acc.platformName || "Blotato Account",
      platform: acc.provider || acc.platform || "unknown",
      profileName: acc.username || acc.name || ""
    }));
  }

  async publish(text: string, channels: string[], mediaPath?: string): Promise<PublishResult[]> {
    if (!this.apiKey) {
      throw new Error("BLOTATO_API_KEY environment variable is not configured.");
    }

    const results: PublishResult[] = [];
    
    for (const channelId of channels) {
      try {
        const payload = {
          accountId: parseInt(channelId),
          content: text,
          media: mediaPath ? [mediaPath] : [],
          publishNow: true
        };

        const response = await fetch(`${this.baseUrl}/posts`, {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          results.push({
            success: false,
            platform: "blotato",
            error: `API returned ${response.status}: ${errorText}`
          });
          continue;
        }

        const data = await response.json() as any;
        results.push({
          success: true,
          platform: "blotato",
          postId: String(data.postSubmissionId || data.id || "submitted")
        });
      } catch (error: any) {
        results.push({
          success: false,
          platform: "blotato",
          error: error.message || String(error)
        });
      }
    }

    return results;
  }
}
