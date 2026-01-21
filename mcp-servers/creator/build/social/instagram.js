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
const posts = new Map();
const stories = new Map();
const rateLimits = {
    posts: { limit: 25, remaining: 25, resetAt: Date.now() + 24 * 60 * 60 * 1000 },
    stories: { limit: 100, remaining: 100, resetAt: Date.now() + 24 * 60 * 60 * 1000 },
    reads: { limit: 200, remaining: 200, resetAt: Date.now() + 60 * 60 * 1000 }
};
function checkRateLimit(type) {
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
export async function createPost(params) {
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
    const post = {
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
export async function createStory(params) {
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
    const story = {
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
export async function getPostAnalytics(postId) {
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
    analytics.engagementRate =
        ((analytics.likes + analytics.comments + analytics.saves + analytics.shares) / analytics.reach) * 100;
    post.metrics = analytics;
    posts.set(postId, post);
    return { success: true, analytics };
}
export async function getStoryAnalytics(storyId) {
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
export async function schedulePost(params) {
    if (params.scheduledFor <= new Date()) {
        return { success: false, error: "Scheduled time must be in the future" };
    }
    return createPost(params);
}
export async function deletePost(postId) {
    const post = posts.get(postId);
    if (!post) {
        return { success: false, error: "Post not found" };
    }
    posts.delete(postId);
    return { success: true };
}
export function getScheduledPosts() {
    return Array.from(posts.values()).filter(p => p.status === "scheduled");
}
export function getAllPosts(limit = 50) {
    return Array.from(posts.values()).slice(0, limit);
}
export function getAllStories() {
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
export const createPostSchema = {
    caption: z.string().min(1).max(2200).describe("Post caption (max 2200 characters)"),
    mediaUrls: z.array(z.string().url()).min(1).max(10).describe("Media URLs (1-10 items)"),
    type: z.enum(["feed", "carousel", "reel"]).optional().describe("Post type"),
    location: z.string().optional().describe("Location tag"),
    tags: z.array(z.string()).optional().describe("Hashtags and mentions"),
    scheduledFor: z.string().optional().describe("ISO date string for scheduling")
};
export const createStorySchema = {
    mediaUrl: z.string().url().describe("Story media URL"),
    type: z.enum(["image", "video"]).describe("Media type"),
    link: z.string().url().optional().describe("Swipe-up link"),
    stickers: z.array(z.object({
        type: z.enum(["mention", "hashtag", "location", "poll", "question"]),
        data: z.any()
    })).optional().describe("Story stickers")
};
export const getPostAnalyticsSchema = {
    postId: z.string().describe("Post ID")
};
export const getStoryAnalyticsSchema = {
    storyId: z.string().describe("Story ID")
};
export const schedulePostSchema = {
    caption: z.string().min(1).max(2200).describe("Post caption"),
    mediaUrls: z.array(z.string().url()).min(1).max(10).describe("Media URLs"),
    scheduledFor: z.string().describe("ISO date string for scheduling"),
    type: z.enum(["feed", "carousel", "reel"]).optional().describe("Post type"),
    location: z.string().optional().describe("Location tag"),
    tags: z.array(z.string()).optional().describe("Hashtags and mentions")
};
export const deletePostSchema = {
    postId: z.string().describe("Post ID to delete")
};
//# sourceMappingURL=instagram.js.map