import { SocialAdapter, PublishResult, Channel } from "./index.js";
import dotenv from "dotenv";
dotenv.config();

export class Web3DirectAdapter implements SocialAdapter {
  private bskyUsername: string;
  private bskyAppPassword: string;
  private neynarApiKey: string;
  private farcasterSignerUuid: string;

  constructor() {
    this.bskyUsername = process.env.BLUESKY_USERNAME || "";
    this.bskyAppPassword = process.env.BLUESKY_APP_PASSWORD || "";
    this.neynarApiKey = process.env.FARCASTER_NEYNAR_API_KEY || "";
    this.farcasterSignerUuid = process.env.FARCASTER_SIGNER_UUID || "";
  }

  async getChannels(): Promise<Channel[]> {
    const channels: Channel[] = [];

    if (this.bskyUsername) {
      channels.push({
        id: "web3-bluesky",
        name: "Direct Bluesky Account",
        platform: "bluesky",
        profileName: this.bskyUsername
      });
    }

    if (this.farcasterSignerUuid) {
      channels.push({
        id: "web3-farcaster",
        name: "Direct Farcaster Account",
        platform: "farcaster",
        profileName: "farcaster_signer"
      });
    }

    return channels;
  }

  async publish(text: string, channels: string[], mediaPath?: string): Promise<PublishResult[]> {
    const results: PublishResult[] = [];

    for (const channelId of channels) {
      if (channelId === "web3-bluesky") {
        try {
          const postId = await this.publishToBluesky(text, mediaPath);
          results.push({
            success: true,
            platform: "bluesky",
            postId
          });
        } catch (error: any) {
          results.push({
            success: false,
            platform: "bluesky",
            error: error.message || String(error)
          });
        }
      } else if (channelId === "web3-farcaster") {
        try {
          const postId = await this.publishToFarcaster(text, mediaPath);
          results.push({
            success: true,
            platform: "farcaster",
            postId
          });
        } catch (error: any) {
          results.push({
            success: false,
            platform: "farcaster",
            error: error.message || String(error)
          });
        }
      } else {
        results.push({
          success: false,
          platform: "unknown",
          error: `Channel ${channelId} not supported by Web3 adapter`
        });
      }
    }

    return results;
  }

  /**
   * Direct AT Protocol XRPC publishing logic.
   * Completely sovereign and free.
   */
  private async publishToBluesky(text: string, mediaPath?: string): Promise<string> {
    if (!this.bskyUsername || !this.bskyAppPassword) {
      throw new Error("BLUESKY_USERNAME and BLUESKY_APP_PASSWORD are required for direct Bluesky posting.");
    }

    console.log(`[Web3Direct] Authenticating with Bluesky XRPC for ${this.bskyUsername}...`);
    
    // 1. Create a session
    const sessionRes = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: this.bskyUsername,
        password: this.bskyAppPassword
      })
    });

    if (!sessionRes.ok) {
      const errText = await sessionRes.text();
      throw new Error(`Bluesky auth failed (${sessionRes.status}): ${errText}`);
    }

    const sessionData = await sessionRes.json() as any;
    const accessJwt = sessionData.accessJwt;
    const did = sessionData.did;

    console.log(`[Web3Direct] Session created successfully. DID: ${did}. Publishing record...`);

    // 2. Create post record
    const postRecord: any = {
      text: text,
      createdAt: new Date().toISOString(),
      $type: "app.bsky.feed.post"
    };

    // Note: To support images directly on Bluesky, we would need to upload the blob
    // via `com.atproto.repo.uploadBlob` first, and then attach the returned link/ref inside the `embed` property.
    if (mediaPath) {
      console.log(`[Web3Direct] Media uploads for Bluesky require com.atproto.repo.uploadBlob integration. Skipping attachments and posting text-only.`);
    }

    const postRes = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessJwt}`
      },
      body: JSON.stringify({
        repo: did,
        collection: "app.bsky.feed.post",
        record: postRecord
      })
    });

    if (!postRes.ok) {
      const errText = await postRes.text();
      throw new Error(`Bluesky post creation failed (${postRes.status}): ${errText}`);
    }

    const postData = await postRes.json() as any;
    return postData.uri || "bsky-published";
  }

  /**
   * Direct Farcaster casting via Neynar API (standard 2026 developer gateway).
   */
  private async publishToFarcaster(text: string, mediaPath?: string): Promise<string> {
    if (!this.neynarApiKey || !this.farcasterSignerUuid) {
      throw new Error("FARCASTER_NEYNAR_API_KEY and FARCASTER_SIGNER_UUID are required for Farcaster posting.");
    }

    console.log(`[Web3Direct] Casting to Farcaster via Neynar Hub API...`);

    const payload: any = {
      signer_uuid: this.farcasterSignerUuid,
      text: text
    };

    if (mediaPath) {
      payload.embeds = [{ url: mediaPath }];
    }

    const response = await fetch("https://api.neynar.com/v2/farcaster/cast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": this.neynarApiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Farcaster casting failed (${response.status}): ${errText}`);
    }

    const data = await response.json() as any;
    return data.cast?.hash || "farcaster-cast-successful";
  }
}
