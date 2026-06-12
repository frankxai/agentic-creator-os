import { SocialAdapter, PublishResult, Channel } from "./index.js";
import dotenv from "dotenv";
dotenv.config();

export class PostizAdapter implements SocialAdapter {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.POSTIZ_API_KEY || "";
    this.apiUrl = process.env.POSTIZ_API_URL || "https://api.postiz.com/public/v1";
    if (this.apiUrl.endsWith("/")) {
      this.apiUrl = this.apiUrl.slice(0, -1);
    }
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`
    };
  }

  async getChannels(): Promise<Channel[]> {
    if (!this.apiKey) {
      throw new Error("POSTIZ_API_KEY environment variable is not configured.");
    }

    let response = await fetch(`${this.apiUrl}/integrations`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      response = await fetch(`${this.apiUrl}/channels`, {
        headers: this.getHeaders()
      });
    }

    if (!response.ok) {
      throw new Error(`Postiz error fetching integrations: ${response.statusText} (${response.status})`);
    }

    const data = await response.json() as any;
    const integrations = Array.isArray(data) ? data : data.integrations || data.data || [];
    
    return integrations.map((item: any) => ({
      id: String(item.id),
      name: item.name || item.platformName || "Postiz Integration",
      platform: item.type || item.provider || "unknown",
      profileName: item.profileName || item.username || ""
    }));
  }

  async publish(text: string, channels: string[], mediaPath?: string): Promise<PublishResult[]> {
    if (!this.apiKey) {
      throw new Error("POSTIZ_API_KEY environment variable is not configured.");
    }

    const results: PublishResult[] = [];
    
    const postsPayload = channels.map(channelId => ({
      integration: {
        id: channelId
      },
      value: [
        {
          content: text,
          image: mediaPath ? [mediaPath] : []
        }
      ]
    }));

    const payload = {
      type: "now",
      posts: postsPayload
    };

    try {
      const response = await fetch(`${this.apiUrl}/posts`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Postiz returned ${response.status}: ${errorText}`);
      }

      const data = await response.json() as any;
      
      for (const channelId of channels) {
        results.push({
          success: true,
          platform: "postiz",
          postId: String(data.id || "submitted")
        });
      }
    } catch (error: any) {
      for (const channelId of channels) {
        results.push({
          success: false,
          platform: "postiz",
          error: error.message || String(error)
        });
      }
    }

    return results;
  }
}
