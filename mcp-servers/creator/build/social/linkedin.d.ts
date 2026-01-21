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
export declare function createPost(params: {
    text: string;
    mediaUrls?: string[];
    visibility?: "public" | "connections" | "private";
    scheduledFor?: Date;
}): Promise<{
    success: boolean;
    post?: LinkedInPost;
    error?: string;
}>;
export declare function createArticle(params: {
    title: string;
    content: string;
    coverImageUrl?: string;
    tags?: string[];
    publishNow?: boolean;
}): Promise<{
    success: boolean;
    article?: LinkedInArticle;
    error?: string;
}>;
export declare function publishArticle(articleId: string): Promise<{
    success: boolean;
    article?: LinkedInArticle;
    error?: string;
}>;
export declare function getPostAnalytics(postId: string): Promise<{
    success: boolean;
    analytics?: LinkedInPost["metrics"];
    error?: string;
}>;
export declare function getArticleAnalytics(articleId: string): Promise<{
    success: boolean;
    analytics?: LinkedInArticle["metrics"];
    error?: string;
}>;
export declare function schedulePost(params: {
    text: string;
    scheduledFor: Date;
    mediaUrls?: string[];
    visibility?: "public" | "connections" | "private";
}): Promise<{
    success: boolean;
    post?: LinkedInPost;
    error?: string;
}>;
export declare function deletePost(postId: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function deleteArticle(articleId: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function getScheduledPosts(): LinkedInPost[];
export declare function getAllPosts(limit?: number): LinkedInPost[];
export declare function getAllArticles(limit?: number): LinkedInArticle[];
export declare function getRateLimitStatus(): {
    posts: {
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
    text: z.ZodString;
    mediaUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    visibility: z.ZodOptional<z.ZodEnum<{
        public: "public";
        connections: "connections";
        private: "private";
    }>>;
    scheduledFor: z.ZodOptional<z.ZodString>;
};
export declare const createArticleSchema: {
    title: z.ZodString;
    content: z.ZodString;
    coverImageUrl: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    publishNow: z.ZodOptional<z.ZodBoolean>;
};
export declare const publishArticleSchema: {
    articleId: z.ZodString;
};
export declare const getPostAnalyticsSchema: {
    postId: z.ZodString;
};
export declare const getArticleAnalyticsSchema: {
    articleId: z.ZodString;
};
export declare const schedulePostSchema: {
    text: z.ZodString;
    scheduledFor: z.ZodString;
    mediaUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    visibility: z.ZodOptional<z.ZodEnum<{
        public: "public";
        connections: "connections";
        private: "private";
    }>>;
};
export declare const deletePostSchema: {
    postId: z.ZodString;
};
export declare const deleteArticleSchema: {
    articleId: z.ZodString;
};
//# sourceMappingURL=linkedin.d.ts.map