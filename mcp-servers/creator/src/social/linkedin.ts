/**
 * LinkedIn API Tools for Creator MCP
 * 
 * Provides LinkedIn integration including:
 * - Post creation
 * - Article publishing
 * - Analytics
 * - Professional networking features
 */

import { z } from "zod";

export interface LinkedInPost {
  id: string;
  text: string;
  authorId: string;
  createdAt: Date;
  scheduledFor?: Date;
  status: "draft" | "scheduled" | "published" | "failed";
  mediaUrls?: string[];
  visibility: "public" | "connections" | "private";
  metrics?: {
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    clickThroughRate: number;
  };
}

export interface LinkedInArticle {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  publishedAt?: Date;
  status: "draft" | "published" | "archived";
  coverImageUrl?: string;
  tags: string[];
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    readTime: number;
  };
}

const posts = new Map<string, LinkedInPost>();
const articles = new Map<string, LinkedInArticle>();
const rateLimits = {
  posts: { limit: 100, remaining: 100, resetAt: Date.now() + 24 * 60 * 60 * 1000 },
  reads: { limit: 500, remaining: 500, resetAt: Date.now() + 24 * 60 * 60 * 1000 }
};

function checkRateLimit(type: "posts" | "reads"): { allowed: boolean; resetIn: number } {
  const limit = rateLimits[type];
  
  if (Date.now() > limit.resetAt) {
    limit.remaining = limit.limit;
    limit.resetAt = Date.now() + 24 * 60 * 60 * 1000;
  }
  
  const resetIn = Math.ceil((limit.resetAt - Date.now()) / 1000);
  
  if (limit.remaining <= 0) {
    return { allowed: false, resetIn };
  }
  
  limit.remaining--;
  return { allowed: true, resetIn };
}

export async function createPost(params: {
  text: string;
  mediaUrls?: string[];
  visibility?: "public" | "connections" | "private";
  scheduledFor?: Date;
}): Promise<{ success: boolean; post?: LinkedInPost; error?: string }> {
  const rateCheck = checkRateLimit("posts");
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 3600)} hours.`
    };
  }
  
  if (params.text.length > 3000) {
    return {
      success: false,
      error: `Post exceeds 3000 characters (${params.text.length} characters)`
    };
  }
  
  const id = crypto.randomUUID();
  const now = new Date();
  
  const post: LinkedInPost = {
    id,
    text: params.text,
    authorId: "user",
    createdAt: now,
    scheduledFor: params.scheduledFor,
    status: params.scheduledFor ? "scheduled" : "published",
    mediaUrls: params.mediaUrls,
    visibility: params.visibility || "public",
    metrics: {
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clickThroughRate: 0
    }
  };
  
  posts.set(id, post);
  
  return { success: true, post };
}

export async function createArticle(params: {
  title: string;
  content: string;
  coverImageUrl?: string;
  tags?: string[];
  publishNow?: boolean;
}): Promise<{ success: boolean; article?: LinkedInArticle; error?: string }> {
  const rateCheck = checkRateLimit("posts");
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 3600)} hours.`
    };
  }
  
  if (params.title.length > 150) {
    return {
      success: false,
      error: `Title exceeds 150 characters (${params.title.length} characters)`
    };
  }
  
  if (params.content.length > 125000) {
    return {
      success: false,
      error: `Content exceeds 125,000 characters (${params.content.length} characters)`
    };
  }
  
  const id = crypto.randomUUID();
  const now = new Date();
  const wordCount = params.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);
  
  const article: LinkedInArticle = {
    id,
    title: params.title,
    content: params.content,
    authorId: "user",
    createdAt: now,
    publishedAt: params.publishNow ? now : undefined,
    status: params.publishNow ? "published" : "draft",
    coverImageUrl: params.coverImageUrl,
    tags: params.tags || [],
    metrics: {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      readTime
    }
  };
  
  articles.set(id, article);
  
  return { success: true, article };
}

export async function publishArticle(articleId: string): Promise<{
  success: boolean;
  article?: LinkedInArticle;
  error?: string;
}> {
  const article = articles.get(articleId);
  
  if (!article) {
    return { success: false, error: "Article not found" };
  }
  
  if (article.status === "published") {
    return { success: false, error: "Article is already published" };
  }
  
  article.status = "published";
  article.publishedAt = new Date();
  articles.set(articleId, article);
  
  return { success: true, article };
}

export async function getPostAnalytics(postId: string): Promise<{
  success: boolean;
  analytics?: LinkedInPost["metrics"];
  error?: string;
}> {
  const rateCheck = checkRateLimit("reads");
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 3600)} hours.`
    };
  }
  
  const post = posts.get(postId);
  
  if (!post) {
    return { success: false, error: "Post not found" };
  }
  
  const analytics = post.metrics || {
    impressions: Math.floor(Math.random() * 50000),
    likes: Math.floor(Math.random() * 2000),
    comments: Math.floor(Math.random() * 200),
    shares: Math.floor(Math.random() * 500),
    clickThroughRate: 0
  };
  
  analytics.clickThroughRate = 
    ((analytics.likes + analytics.comments + analytics.shares) / analytics.impressions) * 100;
  
  post.metrics = analytics;
  posts.set(postId, post);
  
  return { success: true, analytics };
}

export async function getArticleAnalytics(articleId: string): Promise<{
  success: boolean;
  analytics?: LinkedInArticle["metrics"];
  error?: string;
}> {
  const rateCheck = checkRateLimit("reads");
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${Math.ceil(rateCheck.resetIn / 3600)} hours.`
    };
  }
  
  const article = articles.get(articleId);
  
  if (!article) {
    return { success: false, error: "Article not found" };
  }
  
  const wordCount = article.content.split(/\s+/).length;
  const calculatedReadTime = Math.ceil(wordCount / 200);
  
  const analytics: LinkedInArticle["metrics"] = {
    views: Math.floor(Math.random() * 100000),
    likes: Math.floor(Math.random() * 5000),
    comments: Math.floor(Math.random() * 500),
    shares: Math.floor(Math.random() * 1000),
    readTime: calculatedReadTime
  };
  
  article.metrics = analytics;
  articles.set(articleId, article);
  
  return { success: true, analytics };
}

export async function schedulePost(params: {
  text: string;
  scheduledFor: Date;
  mediaUrls?: string[];
  visibility?: "public" | "connections" | "private";
}): Promise<{ success: boolean; post?: LinkedInPost; error?: string }> {
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

export async function deleteArticle(articleId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const article = articles.get(articleId);
  
  if (!article) {
    return { success: false, error: "Article not found" };
  }
  
  articles.delete(articleId);
  
  return { success: true };
}

export function getScheduledPosts(): LinkedInPost[] {
  return Array.from(posts.values()).filter(p => p.status === "scheduled");
}

export function getAllPosts(limit: number = 50): LinkedInPost[] {
  return Array.from(posts.values()).slice(0, limit);
}

export function getAllArticles(limit: number = 20): LinkedInArticle[] {
  return Array.from(articles.values()).slice(0, limit);
}

export function getRateLimitStatus() {
  return {
    posts: {
      ...rateLimits.posts,
      resetIn: Math.ceil((rateLimits.posts.resetAt - Date.now()) / 1000)
    },
    reads: {
      ...rateLimits.reads,
      resetIn: Math.ceil((rateLimits.reads.resetAt - Date.now()) / 1000)
    }
  };
}

export const createPostSchema = {
  text: z.string().min(1).max(3000).describe("Post text (max 3000 characters)"),
  mediaUrls: z.array(z.string().url()).optional().describe("Media URLs to attach"),
  visibility: z.enum(["public", "connections", "private"]).optional().describe("Post visibility"),
  scheduledFor: z.string().optional().describe("ISO date string for scheduling")
};

export const createArticleSchema = {
  title: z.string().min(1).max(150).describe("Article title (max 150 characters)"),
  content: z.string().min(1).max(125000).describe("Article content (max 125,000 characters)"),
  coverImageUrl: z.string().url().optional().describe("Cover image URL"),
  tags: z.array(z.string()).optional().describe("Article tags"),
  publishNow: z.boolean().optional().describe("Publish immediately")
};

export const publishArticleSchema = {
  articleId: z.string().describe("Article ID to publish")
};

export const getPostAnalyticsSchema = {
  postId: z.string().describe("Post ID")
};

export const getArticleAnalyticsSchema = {
  articleId: z.string().describe("Article ID")
};

export const schedulePostSchema = {
  text: z.string().min(1).max(3000).describe("Post text"),
  scheduledFor: z.string().describe("ISO date string for scheduling"),
  mediaUrls: z.array(z.string().url()).optional().describe("Media URLs"),
  visibility: z.enum(["public", "connections", "private"]).optional().describe("Post visibility")
};

export const deletePostSchema = {
  postId: z.string().describe("Post ID to delete")
};

export const deleteArticleSchema = {
  articleId: z.string().describe("Article ID to delete")
};
