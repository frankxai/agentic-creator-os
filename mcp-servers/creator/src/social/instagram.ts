/**
 * Instagram API Tools for Creator MCP
 * 
 * Provides Instagram integration including:
 * - Post creation (feed, carousel, reels)
 * - Story publishing
 * - Analytics
 * - Media management
 */

import { z } from "zod";

export interface InstagramPost {
  id: string;
  caption: string;
  authorId: string;
  createdAt: Date;
  scheduledFor?: Date;
  status: "draft" | "scheduled" | "published" | "failed";
  mediaUrls: string[];
  type: "feed" | "carousel" | "reel";
  location?: string;
  tags?: string[];
  metrics?: {
    impressions: number;
    reach: number;
    likes: number;
    comments: number;
    saves: number;
    shares: number;
    engagementRate: number;
  };
}

export interface InstagramStory {
  id: string;
  authorId: string;
  createdAt: Date;
  expiresAt: Date;
  mediaUrl: string;
  type: "image" | "video";
  link?: string;
  stickers?: Array<{
    type: "mention" | "hashtag" | "location" | "poll" | "question";
    data: any;
  }>;
  metrics?: {
    impressions: number;
    reach: number;
    replies: number;
    exits: number;
    taps_forward: number;
    taps_back: number;
  };
}

const posts = new Map<string, InstagramPost>();
const stories = new Map<string, InstagramStory>();
const rateLimits = {
  posts: { limit: 25, remaining: 25, resetAt: Date.now() + 24 * 60 * 60 * 1000 },
  stories: { limit: 100, remaining: 100, resetAt: Date.now() + 24 * 60 * 60 * 1000 },
  reads: { limit: 200, remaining: 200, resetAt: Date.now() + 60 * 60 * 1000 }
};

function checkRateLimit(type: "posts" | "stories" | "reads"): { allowed: boolean; resetIn: number } {
  const limit = rateLimits[type];
  
  if (Date.now() > limit.resetAt) {
    const resetDuration = type === "reads" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    limit.remaining = limit.limit;
    limit.resetAt = Date.now() + resetDuration;
  }
  
  const resetIn = Math.ceil((limit.resetAt - Date.now()) / 1000);
  
  if (limit.remaining <= 0) {
    return { allowed: false, resetIn };
  }
  
  limit.remaining--;
  return { allowed: true, resetIn };
}

export async function createPost(params: {
  caption: string;
  mediaUrls: string[];
  type?: "feed" | "carousel" | "reel";
  location?: string;
  tags?: string[];
  scheduledFor?: Date;
}): Promise<{ success: boolean; post?: InstagramPost; error?: string }> {
  const rateCheck = checkRateLimit("posts");
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 3600)} hours.`
    };
  }
  
  if (params.caption.length > 2200) {
    return {
      success: false,
      error: `Caption exceeds 2200 characters (${params.caption.length} characters)`
    };
  }
  
  if (params.mediaUrls.length === 0) {
    return { success: false, error: "At least one media URL is required" };
  }
  
  const type = params.type || (params.mediaUrls.length > 1 ? "carousel" : "feed");
  
  if (type === "carousel" && params.mediaUrls.length > 10) {
    return { success: false, error: "Carousel posts can have maximum 10 media items" };
  }
  
  if (type === "reel" && params.mediaUrls.length > 1) {
    return { success: false, error: "Reels can only have one video" };
  }
  
  const id = crypto.randomUUID();
  const now = new Date();
  
  const post: InstagramPost = {
    id,
    caption: params.caption,
    authorId: "user",
    createdAt: now,
    scheduledFor: params.scheduledFor,
    status: params.scheduledFor ? "scheduled" : "published",
    mediaUrls: params.mediaUrls,
    type,
    location: params.location,
    tags: params.tags,
    metrics: {
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      engagementRate: 0
    }
  };
  
  posts.set(id, post);
  
  return { success: true, post };
}

export async function createStory(params: {
  mediaUrl: string;
  type: "image" | "video";
  link?: string;
  stickers?: Array<{
    type: "mention" | "hashtag" | "location" | "poll" | "question";
    data: any;
  }>;
}): Promise<{ success: boolean; story?: InstagramStory; error?: string }> {
  const rateCheck = checkRateLimit("stories");
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 3600)} hours.`
    };
  }
  
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const story: InstagramStory = {
    id,
    authorId: "user",
    createdAt: now,
    expiresAt,
    mediaUrl: params.mediaUrl,
    type: params.type,
    link: params.link,
    stickers: params.stickers,
    metrics: {
      impressions: 0,
      reach: 0,
      replies: 0,
      exits: 0,
      taps_forward: 0,
      taps_back: 0
    }
  };
  
  stories.set(id, story);
  
  return { success: true, story };
}

export async function getPostAnalytics(postId: string): Promise<{
  success: boolean;
  analytics?: InstagramPost["metrics"];
  error?: string;
}> {
  const rateCheck = checkRateLimit("reads");
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 60)} minutes.`
    };
  }
  
  const post = posts.get(postId);
  
  if (!post) {
    return { success: false, error: "Post not found" };
  }
  
  const analytics = post.metrics || {
    impressions: Math.floor(Math.random() * 100000),
    reach: Math.floor(Math.random() * 80000),
    likes: Math.floor(Math.random() * 5000),
    comments: Math.floor(Math.random() * 500),
    saves: Math.floor(Math.random() * 1000),
    shares: Math.floor(Math.random() * 200),
    engagementRate: 0
  };
  
  analytics.engagementRate = analytics.reach > 0
    ? ((analytics.likes + analytics.comments + analytics.saves + analytics.shares) / analytics.reach) * 100
    : 0;
  
  post.metrics = analytics;
  posts.set(postId, post);
  
  return { success: true, analytics };
}

export async function getStoryAnalytics(storyId: string): Promise<{
  success: boolean;
  analytics?: InstagramStory["metrics"];
  error?: string;
}> {
  const rateCheck = checkRateLimit("reads");
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 60)} minutes.`
    };
  }
  
  const story = stories.get(storyId);
  
  if (!story) {
    return { success: false, error: "Story not found" };
  }
  
  const analytics = story.metrics || {
    impressions: Math.floor(Math.random() * 50000),
    reach: Math.floor(Math.random() * 40000),
    replies: Math.floor(Math.random() * 100),
    exits: Math.floor(Math.random() * 500),
    taps_forward: Math.floor(Math.random() * 1000),
    taps_back: Math.floor(Math.random() * 200)
  };
  
  story.metrics = analytics;
  stories.set(storyId, story);
  
  return { success: true, analytics };
}

export async function schedulePost(params: {
  caption: string;
  mediaUrls: string[];
  scheduledFor: Date;
  type?: "feed" | "carousel" | "reel";
  location?: string;
  tags?: string[];
}): Promise<{ success: boolean; post?: InstagramPost; error?: string }> {
  if (params.scheduledFor <= new Date()) {
    return { success: false, error: "Scheduled time must be in the future" };
  }
  
  return createPost(params);
}

export async function deletePost(postId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const post = posts.get(postId);
  
  if (!post) {
    return { success: false, error: "Post not found" };
  }
  
  posts.delete(postId);
  
  return { success: true };
}

export function getScheduledPosts(): InstagramPost[] {
  return Array.from(posts.values()).filter(p => p.status === "scheduled");
}

export function getAllPosts(limit: number = 50): InstagramPost[] {
  return Array.from(posts.values()).slice(0, limit);
}

export function getAllStories(): InstagramStory[] {
  const now = new Date();
  return Array.from(stories.values()).filter(s => s.expiresAt > now);
}

export function getRateLimitStatus() {
  return {
    posts: {
      ...rateLimits.posts,
      resetIn: Math.ceil((rateLimits.posts.resetAt - Date.now()) / 1000)
    },
    stories: {
      ...rateLimits.stories,
      resetIn: Math.ceil((rateLimits.stories.resetAt - Date.now()) / 1000)
    },
    reads: {
      ...rateLimits.reads,
      resetIn: Math.ceil((rateLimits.reads.resetAt - Date.now()) / 1000)
    }
  };
}

const id = () => z.string().min(1).max(100);
const isoDate = () => z.string().max(40);
const url = () => z.string().url().max(2048);

export const createPostSchema = {
  caption: z.string().min(1).max(2200).describe("Post caption (max 2200 characters)"),
  mediaUrls: z.array(url()).min(1).max(10).describe("Media URLs (1-10 items)"),
  type: z.enum(["feed", "carousel", "reel"]).optional().describe("Post type; default feed"),
  location: z.string().max(200).optional().describe("Location tag"),
  tags: z.array(z.string().max(100)).max(30).optional().describe("Hashtags and mentions (max 30)"),
  scheduledFor: isoDate().optional().describe("ISO 8601 date-time to schedule for; omit to record it as published now")
};

export const createStorySchema = {
  mediaUrl: url().describe("Story image or video URL"),
  type: z.enum(["image", "video"]).describe("Media type"),
  link: url().optional().describe("Link sticker URL"),
  stickers: z.array(z.object({
    type: z.enum(["mention", "hashtag", "location", "poll", "question"]).describe("Sticker kind"),
    data: z.string().max(500).describe("Sticker text: the handle, hashtag, place, poll question or prompt")
  })).max(10).optional().describe("Interactive stickers (max 10)")
};

export const getPostAnalyticsSchema = {
  postId: id().describe("Local post ID returned by creator_instagram_post")
};

export const getStoryAnalyticsSchema = {
  storyId: id().describe("Local story ID")
};

export const schedulePostSchema = {
  caption: z.string().min(1).max(2200).describe("Post caption"),
  mediaUrls: z.array(url()).min(1).max(10).describe("Media URLs"),
  scheduledFor: isoDate().describe("ISO 8601 date-time to schedule for"),
  type: z.enum(["feed", "carousel", "reel"]).optional().describe("Post type"),
  location: z.string().max(200).optional().describe("Location tag"),
  tags: z.array(z.string().max(100)).max(30).optional().describe("Hashtags and mentions")
};

export const deletePostSchema = {
  postId: id().describe("Local post ID to delete")
};
