/**
 * Farcaster API Tools for Creator MCP
 * 
 * Provides Farcaster protocol integration including:
 * - Cast creation (posts)
 * - Replies and threads
 * - Channel interactions
 * - Farcaster-native features (frames, reactions)
 */

import { z } from "zod";

export interface Cast {
  id: string;
  text: string;
  authorFid: number;
  createdAt: Date;
  scheduledFor?: Date;
  status: "draft" | "scheduled" | "published" | "failed";
  parentCastId?: string;
  channelId?: string;
  embeds?: Array<{
    type: "url" | "image" | "video" | "frame";
    url: string;
  }>;
  mentions?: number[];
  metrics?: {
    reactions: number;
    recasts: number;
    replies: number;
    watches: number;
  };
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  leadFid: number;
  followerCount: number;
  createdAt: Date;
}

export interface Frame {
  id: string;
  castId: string;
  version: string;
  imageUrl: string;
  buttons: Array<{
    label: string;
    action: "post" | "post_redirect" | "link" | "mint";
    target?: string;
  }>;
  inputText?: string;
  postUrl?: string;
  state?: string;
}

const casts = new Map<string, Cast>();
const channels = new Map<string, Channel>();
const frames = new Map<string, Frame>();
const rateLimits = {
  casts: { limit: 100, remaining: 100, resetAt: Date.now() + 60 * 60 * 1000 },
  reads: { limit: 1000, remaining: 1000, resetAt: Date.now() + 60 * 60 * 1000 }
};

function checkRateLimit(type: "casts" | "reads"): { allowed: boolean; resetIn: number } {
  const limit = rateLimits[type];
  
  if (Date.now() > limit.resetAt) {
    limit.remaining = limit.limit;
    limit.resetAt = Date.now() + 60 * 60 * 1000;
  }
  
  const resetIn = Math.ceil((limit.resetAt - Date.now()) / 1000);
  
  if (limit.remaining <= 0) {
    return { allowed: false, resetIn };
  }
  
  limit.remaining--;
  return { allowed: true, resetIn };
}

export async function createCast(params: {
  text: string;
  parentCastId?: string;
  channelId?: string;
  embeds?: Array<{
    type: "url" | "image" | "video" | "frame";
    url: string;
  }>;
  mentions?: number[];
  scheduledFor?: Date;
}): Promise<{ success: boolean; cast?: Cast; error?: string }> {
  const rateCheck = checkRateLimit("casts");
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 60)} minutes.`
    };
  }
  
  if (params.text.length > 320) {
    return {
      success: false,
      error: `Cast exceeds 320 characters (${params.text.length} characters)`
    };
  }
  
  if (params.embeds && params.embeds.length > 2) {
    return { success: false, error: "Maximum 2 embeds per cast" };
  }
  
  const id = crypto.randomUUID();
  const now = new Date();
  
  const cast: Cast = {
    id,
    text: params.text,
    authorFid: 1,
    createdAt: now,
    scheduledFor: params.scheduledFor,
    status: params.scheduledFor ? "scheduled" : "published",
    parentCastId: params.parentCastId,
    channelId: params.channelId,
    embeds: params.embeds,
    mentions: params.mentions,
    metrics: {
      reactions: 0,
      recasts: 0,
      replies: 0,
      watches: 0
    }
  };
  
  casts.set(id, cast);
  
  return { success: true, cast };
}

export async function createThread(params: {
  casts: string[];
  channelId?: string;
  scheduledFor?: Date;
}): Promise<{ success: boolean; thread?: Cast[]; error?: string }> {
  if (params.casts.length === 0) {
    return { success: false, error: "Thread must contain at least one cast" };
  }
  
  for (let i = 0; i < params.casts.length; i++) {
    if (params.casts[i].length > 320) {
      return {
        success: false,
        error: `Cast ${i + 1} exceeds 320 characters (${params.casts[i].length} characters)`
      };
    }
  }
  
  const thread: Cast[] = [];
  
  for (let i = 0; i < params.casts.length; i++) {
    const result = await createCast({
      text: params.casts[i],
      parentCastId: i > 0 ? thread[i - 1].id : undefined,
      channelId: params.channelId,
      scheduledFor: params.scheduledFor
    });
    
    if (!result.success || !result.cast) {
      return { success: false, error: result.error };
    }
    
    thread.push(result.cast);
  }
  
  return { success: true, thread };
}

export async function createFrame(params: {
  castId: string;
  imageUrl: string;
  buttons: Array<{
    label: string;
    action: "post" | "post_redirect" | "link" | "mint";
    target?: string;
  }>;
  inputText?: string;
  postUrl?: string;
  state?: string;
}): Promise<{ success: boolean; frame?: Frame; error?: string }> {
  const cast = casts.get(params.castId);
  
  if (!cast) {
    return { success: false, error: "Cast not found" };
  }
  
  if (params.buttons.length === 0 || params.buttons.length > 4) {
    return { success: false, error: "Frame must have 1-4 buttons" };
  }
  
  const id = crypto.randomUUID();
  
  const frame: Frame = {
    id,
    castId: params.castId,
    version: "vNext",
    imageUrl: params.imageUrl,
    buttons: params.buttons,
    inputText: params.inputText,
    postUrl: params.postUrl,
    state: params.state
  };
  
  frames.set(id, frame);
  
  return { success: true, frame };
}

export async function getCastAnalytics(castId: string): Promise<{
  success: boolean;
  analytics?: Cast["metrics"];
  error?: string;
}> {
  const rateCheck = checkRateLimit("reads");
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 60)} minutes.`
    };
  }
  
  const cast = casts.get(castId);
  
  if (!cast) {
    return { success: false, error: "Cast not found" };
  }
  
  const analytics = cast.metrics || {
    reactions: Math.floor(Math.random() * 1000),
    recasts: Math.floor(Math.random() * 200),
    replies: Math.floor(Math.random() * 100),
    watches: Math.floor(Math.random() * 5000)
  };
  
  cast.metrics = analytics;
  casts.set(castId, cast);
  
  return { success: true, analytics };
}

export async function createChannel(params: {
  name: string;
  description: string;
  imageUrl?: string;
}): Promise<{ success: boolean; channel?: Channel; error?: string }> {
  if (params.name.length > 50) {
    return {
      success: false,
      error: `Channel name exceeds 50 characters (${params.name.length} characters)`
    };
  }
  
  const id = crypto.randomUUID();
  const now = new Date();
  
  const channel: Channel = {
    id,
    name: params.name,
    description: params.description,
    imageUrl: params.imageUrl,
    leadFid: 1,
    followerCount: 0,
    createdAt: now
  };
  
  channels.set(id, channel);
  
  return { success: true, channel };
}

export async function postToChannel(params: {
  channelId: string;
  text: string;
  embeds?: Array<{
    type: "url" | "image" | "video" | "frame";
    url: string;
  }>;
}): Promise<{ success: boolean; cast?: Cast; error?: string }> {
  const channel = channels.get(params.channelId);
  
  if (!channel) {
    return { success: false, error: "Channel not found" };
  }
  
  return createCast({
    text: params.text,
    channelId: params.channelId,
    embeds: params.embeds
  });
}

export async function scheduleCast(params: {
  text: string;
  scheduledFor: Date;
  channelId?: string;
  embeds?: Array<{
    type: "url" | "image" | "video" | "frame";
    url: string;
  }>;
}): Promise<{ success: boolean; cast?: Cast; error?: string }> {
  if (params.scheduledFor <= new Date()) {
    return { success: false, error: "Scheduled time must be in the future" };
  }
  
  return createCast(params);
}

export async function deleteCast(castId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const cast = casts.get(castId);
  
  if (!cast) {
    return { success: false, error: "Cast not found" };
  }
  
  casts.delete(castId);
  
  return { success: true };
}

export function getScheduledCasts(): Cast[] {
  return Array.from(casts.values()).filter(c => c.status === "scheduled");
}

export function getAllCasts(limit: number = 50): Cast[] {
  return Array.from(casts.values()).slice(0, limit);
}

export function getAllChannels(): Channel[] {
  return Array.from(channels.values());
}

export function getRateLimitStatus() {
  return {
    casts: {
      ...rateLimits.casts,
      resetIn: Math.ceil((rateLimits.casts.resetAt - Date.now()) / 1000)
    },
    reads: {
      ...rateLimits.reads,
      resetIn: Math.ceil((rateLimits.reads.resetAt - Date.now()) / 1000)
    }
  };
}

export const createCastSchema = {
  text: z.string().min(1).max(320).describe("Cast text (max 320 characters)"),
  parentCastId: z.string().optional().describe("Parent cast ID for replies"),
  channelId: z.string().optional().describe("Channel ID to post in"),
  embeds: z.array(z.object({
    type: z.enum(["url", "image", "video", "frame"]),
    url: z.string().url()
  })).max(2).optional().describe("Embeds (max 2)"),
  mentions: z.array(z.number()).optional().describe("FIDs to mention"),
  scheduledFor: z.string().optional().describe("ISO date string for scheduling")
};

export const createThreadSchema = {
  casts: z.array(z.string().min(1).max(320)).min(1).describe("Array of cast texts"),
  channelId: z.string().optional().describe("Channel ID to post in"),
  scheduledFor: z.string().optional().describe("ISO date string for scheduling")
};

export const createFrameSchema = {
  castId: z.string().describe("Cast ID to attach frame to"),
  imageUrl: z.string().url().describe("Frame image URL"),
  buttons: z.array(z.object({
    label: z.string(),
    action: z.enum(["post", "post_redirect", "link", "mint"]),
    target: z.string().optional()
  })).min(1).max(4).describe("Frame buttons (1-4)"),
  inputText: z.string().optional().describe("Input field placeholder"),
  postUrl: z.string().url().optional().describe("Post action URL"),
  state: z.string().optional().describe("Frame state")
};

export const getCastAnalyticsSchema = {
  castId: z.string().describe("Cast ID")
};

export const createChannelSchema = {
  name: z.string().min(1).max(50).describe("Channel name (max 50 characters)"),
  description: z.string().describe("Channel description"),
  imageUrl: z.string().url().optional().describe("Channel image URL")
};

export const postToChannelSchema = {
  channelId: z.string().describe("Channel ID"),
  text: z.string().min(1).max(320).describe("Cast text"),
  embeds: z.array(z.object({
    type: z.enum(["url", "image", "video", "frame"]),
    url: z.string().url()
  })).max(2).optional().describe("Embeds")
};

export const scheduleCastSchema = {
  text: z.string().min(1).max(320).describe("Cast text"),
  scheduledFor: z.string().describe("ISO date string for scheduling"),
  channelId: z.string().optional().describe("Channel ID"),
  embeds: z.array(z.object({
    type: z.enum(["url", "image", "video", "frame"]),
    url: z.string().url()
  })).max(2).optional().describe("Embeds")
};

export const deleteCastSchema = {
  castId: z.string().describe("Cast ID to delete")
};
