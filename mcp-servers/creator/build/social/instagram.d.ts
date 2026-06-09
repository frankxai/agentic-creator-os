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
export declare function createPost(params: {
    caption: string;
    mediaUrls: string[];
    type?: "feed" | "carousel" | "reel";
    location?: string;
    tags?: string[];
    scheduledFor?: Date;
}): Promise<{
    success: boolean;
    post?: InstagramPost;
    error?: string;
}>;
export declare function createStory(params: {
    mediaUrl: string;
    type: "image" | "video";
    link?: string;
    stickers?: Array<{
        type: "mention" | "hashtag" | "location" | "poll" | "question";
        data: any;
    }>;
}): Promise<{
    success: boolean;
    story?: InstagramStory;
    error?: string;
}>;
export declare function getPostAnalytics(postId: string): Promise<{
    success: boolean;
    analytics?: InstagramPost["metrics"];
    error?: string;
}>;
export declare function getStoryAnalytics(storyId: string): Promise<{
    success: boolean;
    analytics?: InstagramStory["metrics"];
    error?: string;
}>;
export declare function schedulePost(params: {
    caption: string;
    mediaUrls: string[];
    scheduledFor: Date;
    type?: "feed" | "carousel" | "reel";
    location?: string;
    tags?: string[];
}): Promise<{
    success: boolean;
    post?: InstagramPost;
    error?: string;
}>;
export declare function deletePost(postId: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function getScheduledPosts(): InstagramPost[];
export declare function getAllPosts(limit?: number): InstagramPost[];
export declare function getAllStories(): InstagramStory[];
export declare function getRateLimitStatus(): {
    posts: {
        resetIn: number;
        limit: number;
        remaining: number;
        resetAt: number;
    };
    stories: {
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
export declare const createPostSchema: {
    caption: z.ZodString;
    mediaUrls: z.ZodArray<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        feed: "feed";
        carousel: "carousel";
        reel: "reel";
    }>>;
    location: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    scheduledFor: z.ZodOptional<z.ZodString>;
};
export declare const createStorySchema: {
    mediaUrl: z.ZodString;
    type: z.ZodEnum<{
        image: "image";
        video: "video";
    }>;
    link: z.ZodOptional<z.ZodString>;
    stickers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            mention: "mention";
            hashtag: "hashtag";
            location: "location";
            poll: "poll";
            question: "question";
        }>;
        data: z.ZodAny;
    }, z.core.$strip>>>;
};
export declare const getPostAnalyticsSchema: {
    postId: z.ZodString;
};
export declare const getStoryAnalyticsSchema: {
    storyId: z.ZodString;
};
export declare const schedulePostSchema: {
    caption: z.ZodString;
    mediaUrls: z.ZodArray<z.ZodString>;
    scheduledFor: z.ZodString;
    type: z.ZodOptional<z.ZodEnum<{
        feed: "feed";
        carousel: "carousel";
        reel: "reel";
    }>>;
    location: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
};
export declare const deletePostSchema: {
    postId: z.ZodString;
};
//# sourceMappingURL=instagram.d.ts.map