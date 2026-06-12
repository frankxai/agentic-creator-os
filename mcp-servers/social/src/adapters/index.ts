export interface PublishResult {
  success: boolean;
  platform: string;
  postId?: string;
  error?: string;
}

export interface Channel {
  id: string;
  name: string;
  platform: string;
  profileName: string;
}

export interface SocialAdapter {
  publish(text: string, channels: string[], mediaPath?: string): Promise<PublishResult[]>;
  getChannels(): Promise<Channel[]>;
}

import { BlotatoAdapter } from "./blotato.js";
import { PostizAdapter } from "./postiz.js";
import { PlaywrightBrowserAdapter } from "./playwright-browser.js";
import { LocalStagingAdapter } from "./local-staging.js";

export function getAdapter(type: string): SocialAdapter {
  const normalizedType = type.toLowerCase();
  switch (normalizedType) {
    case "blotato":
      return new BlotatoAdapter();
    case "postiz":
      return new PostizAdapter();
    case "playwright":
    case "browser":
      return new PlaywrightBrowserAdapter();
    case "local":
    case "staging":
    default:
      return new LocalStagingAdapter();
  }
}
