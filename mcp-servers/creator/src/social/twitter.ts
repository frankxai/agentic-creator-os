/**
 * Twitter/X API Tools for Creator MCP
 * 
 * Provides comprehensive Twitter/X integration including:
 * - Post creation (tweets, threads)
 * - Scheduling
 * - Analytics
 * - Rate limiting
 */

import { z } from "zod";

export interface Tweet {
  id: string;
  text: string;
  authorId: string;
  createdAt: Date;
  scheduledFor?: Date;
  status: "draft" | "scheduled" | "published" | "failed";
  mediaUrls?: string[];
  replyToId?: string;
  threadId?: string;
  metrics?: {
    impressions: number;
    likes: number;
    retweets: number;
    replies: number;
    engagementRate: number;
  };
}

export interface Thread {
  id: string;
  tweets: Tweet[];
  status: "draft" | "scheduled" | "published" | "partial";
  createdAt: Date;
  scheduledFor?: Date;
}

// In-memory storage (replace with persistent storage in production)
const tweets = new Map<string, Tweet>();
const threads = new Map<string, Thread>();
const rateLimits = {
  tweets: { limit: 50, remaining: 50, resetAt: Date.now() + 15 * 60 * 1000 },
  reads: { limit: 180, remaining: 180, resetAt: Date.now() + 15 * 60 * 1000 }
};

/**
 * Check and update rate limits
 */
function checkRateLimit(type: "tweets" | "reads"): { allowed: boolean; resetIn: number } {
  const limit = rateLimits[type];
  
  if (Date.now() > limit.resetAt) {
    limit.remaining = limit.limit;
    limit.resetAt = Date.now() + 15 * 60 * 1000;
  }
  
  const resetIn = Math.ceil((limit.resetAt - Date.now()) / 1000);
  
  if (limit.remaining <= 0) {
    return { allowed: false, resetIn };
  }
  
  limit.remaining--;
  return { allowed: true, resetIn };
}

/**
 * Post a tweet
 */
export async function postTweet(params: {
  text: string;
  mediaUrls?: string[];
  replyToId?: string;
  scheduledFor?: Date;
}): Promise<{ success: boolean; tweet?: Tweet; error?: string }> {
  const rateCheck = checkRateLimit("tweets");
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${rateCheck.resetIn} seconds.`
    };
  }
  
  // Validate tweet length (280 characters)
  if (params.text.length > 280) {
    return {
      success: false,
      error: `Tweet exceeds 280 characters (${params.text.length} characters)`
    };
  }
  
  const id = crypto.randomUUID();
  const now = new Date();
  
  const tweet: Tweet = {
    id,
    text: params.text,
    authorId: "user", // Replace with actual user ID
    createdAt: now,
    scheduledFor: params.scheduledFor,
    status: params.scheduledFor ? "scheduled" : "published",
    mediaUrls: params.mediaUrls,
    replyToId: params.replyToId,
    metrics: {
      impressions: 0,
      likes: 0,
      retweets: 0,
      replies: 0,
      engagementRate: 0
    }
  };
  
  tweets.set(id, tweet);
  
  return { success: true, tweet };
}

/**
 * Create a thread
 */
export async function createThread(params: {
  tweets: string[];
  scheduledFor?: Date;
}): Promise<{ success: boolean; thread?: Thread; error?: string }> {
  if (params.tweets.length === 0) {
    return { success: false, error: "Thread must contain at least one tweet" };
  }
  
  // Validate all tweets
  for (let i = 0; i < params.tweets.length; i++) {
    if (params.tweets[i].length > 280) {
      return {
        success: false,
        error: `Tweet ${i + 1} exceeds 280 characters (${params.tweets[i].length} characters)`
      };
    }
  }
  
  const threadId = crypto.randomUUID();
  const now = new Date();
  const threadTweets: Tweet[] = [];
  
  for (let i = 0; i < params.tweets.length; i++) {
    const tweetId = crypto.randomUUID();
    const tweet: Tweet = {
      id: tweetId,
      text: params.tweets[i],
      authorId: "user",
      createdAt: now,
      scheduledFor: params.scheduledFor,
      status: params.scheduledFor ? "scheduled" : "published",
      replyToId: i > 0 ? threadTweets[i - 1].id : undefined,
      threadId,
      metrics: {
        impressions: 0,
        likes: 0,
        retweets: 0,
        replies: 0,
        engagementRate: 0
      }
    };
    
    tweets.set(tweetId, tweet);
    threadTweets.push(tweet);
  }
  
  const thread: Thread = {
    id: threadId,
    tweets: threadTweets,
    status: params.scheduledFor ? "scheduled" : "published",
    createdAt: now,
    scheduledFor: params.scheduledFor
  };
  
  threads.set(threadId, thread);
  
  return { success: true, thread };
}

/**
 * Get tweet analytics
 */
export async function getTweetAnalytics(tweetId: string): Promise<{
  success: boolean;
  analytics?: Tweet["metrics"];
  error?: string;
}> {
  const rateCheck = checkRateLimit("reads");
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Resets in ${rateCheck.resetIn} seconds.`
    };
  }
  
  const tweet = tweets.get(tweetId);
  
  if (!tweet) {
    return { success: false, error: "Tweet not found" };
  }
  
  // Simulate analytics (in production, fetch from Twitter API)
  const analytics = tweet.metrics || {
    impressions: Math.floor(Math.random() * 10000),
    likes: Math.floor(Math.random() * 500),
    retweets: Math.floor(Math.random() * 100),
    replies: Math.floor(Math.random() * 50),
    engagementRate: 0
  };
  
  analytics.engagementRate = analytics.impressions > 0
    ? ((analytics.likes + analytics.retweets + analytics.replies) / analytics.impressions) * 100
    : 0;
  
  tweet.metrics = analytics;
  tweets.set(tweetId, tweet);
  
  return { success: true, analytics };
}

/**
 * Get thread analytics
 */
export async function getThreadAnalytics(threadId: string): Promise<{
  success: boolean;
  analytics?: {
    totalImpressions: number;
    totalLikes: number;
    totalRetweets: number;
    totalReplies: number;
    avgEngagementRate: number;
    tweetCount: number;
  };
  error?: string;
}> {
  const thread = threads.get(threadId);
  
  if (!thread) {
    return { success: false, error: "Thread not found" };
  }
  
  let totalImpressions = 0;
  let totalLikes = 0;
  let totalRetweets = 0;
  let totalReplies = 0;
  let totalEngagement = 0;
  
  for (const tweet of thread.tweets) {
    if (tweet.metrics) {
      totalImpressions += tweet.metrics.impressions;
      totalLikes += tweet.metrics.likes;
      totalRetweets += tweet.metrics.retweets;
      totalReplies += tweet.metrics.replies;
      totalEngagement += tweet.metrics.engagementRate;
    }
  }
  
  const analytics = {
    totalImpressions,
    totalLikes,
    totalRetweets,
    totalReplies,
    avgEngagementRate: totalEngagement / thread.tweets.length,
    tweetCount: thread.tweets.length
  };
  
  return { success: true, analytics };
}

/**
 * Schedule a tweet
 */
export async function scheduleTweet(params: {
  text: string;
  scheduledFor: Date;
  mediaUrls?: string[];
}): Promise<{ success: boolean; tweet?: Tweet; error?: string }> {
  if (params.scheduledFor <= new Date()) {
    return { success: false, error: "Scheduled time must be in the future" };
  }
  
  return postTweet(params);
}

/**
 * Delete a tweet
 */
export async function deleteTweet(tweetId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const tweet = tweets.get(tweetId);
  
  if (!tweet) {
    return { success: false, error: "Tweet not found" };
  }
  
  tweets.delete(tweetId);
  
  return { success: true };
}

/**
 * Get scheduled tweets
 */
export function getScheduledTweets(): Tweet[] {
  return Array.from(tweets.values()).filter(t => t.status === "scheduled");
}

/**
 * Get all tweets
 */
export function getAllTweets(limit: number = 50): Tweet[] {
  return Array.from(tweets.values()).slice(0, limit);
}

/**
 * Get all threads
 */
export function getAllThreads(limit: number = 20): Thread[] {
  return Array.from(threads.values()).slice(0, limit);
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus() {
  return {
    tweets: {
      ...rateLimits.tweets,
      resetIn: Math.ceil((rateLimits.tweets.resetAt - Date.now()) / 1000)
    },
    reads: {
      ...rateLimits.reads,
      resetIn: Math.ceil((rateLimits.reads.resetAt - Date.now()) / 1000)
    }
  };
}

// Zod schemas for validation
const id = () => z.string().min(1).max(100);
const isoDate = () => z.string().max(40);
const url = () => z.string().url().max(2048);

export const postTweetSchema = {
  text: z.string().min(1).max(280).describe("Tweet text (max 280 characters)"),
  mediaUrls: z.array(url()).max(4).optional().describe("Media URLs to attach (max 4)"),
  replyToId: id().optional().describe("Local tweet ID this replies to"),
  scheduledFor: isoDate().optional().describe("ISO 8601 date-time to schedule for; omit to record it as published now")
};

export const createThreadSchema = {
  tweets: z.array(z.string().min(1).max(280)).min(1).max(25).describe("Tweet texts in thread order (1-25, max 280 characters each)"),
  scheduledFor: isoDate().optional().describe("ISO 8601 date-time to schedule the thread for")
};

export const getTweetAnalyticsSchema = {
  tweetId: id().describe("Local tweet ID returned by creator_twitter_post or creator_twitter_thread")
};

export const getThreadAnalyticsSchema = {
  threadId: id().describe("Local thread ID")
};

export const scheduleTweetSchema = {
  text: z.string().min(1).max(280).describe("Tweet text"),
  scheduledFor: isoDate().describe("ISO 8601 date-time to schedule for"),
  mediaUrls: z.array(url()).max(4).optional().describe("Media URLs (max 4)")
};

export const deleteTweetSchema = {
  tweetId: id().describe("Local tweet ID to delete")
};
