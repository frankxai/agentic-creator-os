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
/**
 * Post a tweet
 */
export declare function postTweet(params: {
    text: string;
    mediaUrls?: string[];
    replyToId?: string;
    scheduledFor?: Date;
}): Promise<{
    success: boolean;
    tweet?: Tweet;
    error?: string;
}>;
/**
 * Create a thread
 */
export declare function createThread(params: {
    tweets: string[];
    scheduledFor?: Date;
}): Promise<{
    success: boolean;
    thread?: Thread;
    error?: string;
}>;
/**
 * Get tweet analytics
 */
export declare function getTweetAnalytics(tweetId: string): Promise<{
    success: boolean;
    analytics?: Tweet["metrics"];
    error?: string;
}>;
/**
 * Get thread analytics
 */
export declare function getThreadAnalytics(threadId: string): Promise<{
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
}>;
/**
 * Schedule a tweet
 */
export declare function scheduleTweet(params: {
    text: string;
    scheduledFor: Date;
    mediaUrls?: string[];
}): Promise<{
    success: boolean;
    tweet?: Tweet;
    error?: string;
}>;
/**
 * Delete a tweet
 */
export declare function deleteTweet(tweetId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Get scheduled tweets
 */
export declare function getScheduledTweets(): Tweet[];
/**
 * Get all tweets
 */
export declare function getAllTweets(limit?: number): Tweet[];
/**
 * Get all threads
 */
export declare function getAllThreads(limit?: number): Thread[];
/**
 * Get rate limit status
 */
export declare function getRateLimitStatus(): {
    tweets: {
        resetIn: number;
        limit: number;
        remaining: number;
        resetAt: number;
    };
    reads: {
        resetIn: number;
        limit: number;
        remaining: number;
        resetAt: number;
    };
};
export declare const postTweetSchema: {
    text: z.ZodString;
    mediaUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    replyToId: z.ZodOptional<z.ZodString>;
    scheduledFor: z.ZodOptional<z.ZodString>;
};
export declare const createThreadSchema: {
    tweets: z.ZodArray<z.ZodString>;
    scheduledFor: z.ZodOptional<z.ZodString>;
};
export declare const getTweetAnalyticsSchema: {
    tweetId: z.ZodString;
};
export declare const getThreadAnalyticsSchema: {
    threadId: z.ZodString;
};
export declare const scheduleTweetSchema: {
    text: z.ZodString;
    scheduledFor: z.ZodString;
    mediaUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
};
export declare const deleteTweetSchema: {
    tweetId: z.ZodString;
};
//# sourceMappingURL=twitter.d.ts.map