import { z } from "zod";
export interface ScheduledContent {
    id: string;
    platform: "twitter" | "linkedin" | "instagram" | "farcaster";
    type: "post" | "thread" | "article" | "story" | "cast";
    content: any;
    scheduledFor: Date;
    status: "pending" | "published" | "failed" | "cancelled";
    createdAt: Date;
    publishedAt?: Date;
    error?: string;
}
export interface ScheduleConflict {
    time: Date;
    platform: string;
    existingContent: ScheduledContent[];
    reason: string;
}
export declare function scheduleContent(params: {
    platform: "twitter" | "linkedin" | "instagram" | "farcaster";
    type: "post" | "thread" | "article" | "story" | "cast";
    content: any;
    scheduledFor: Date;
    checkConflicts?: boolean;
}): Promise<{
    success: boolean;
    scheduled?: ScheduledContent;
    conflicts?: ScheduleConflict[];
    error?: string;
}>;
export declare function checkScheduleConflicts(params: {
    platform: string;
    scheduledFor: Date;
    windowMinutes: number;
}): ScheduleConflict[];
export declare function bulkSchedule(params: {
    posts: Array<{
        platform: "twitter" | "linkedin" | "instagram" | "farcaster";
        type: "post" | "thread" | "article" | "story" | "cast";
        content: any;
        scheduledFor: Date;
    }>;
    autoResolveConflicts?: boolean;
    conflictGapMinutes?: number;
}): Promise<{
    success: boolean;
    scheduled?: ScheduledContent[];
    failed?: Array<{
        index: number;
        error: string;
    }>;
}>;
export declare function publishScheduledContent(contentId: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function cancelScheduledContent(contentId: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function rescheduleContent(params: {
    contentId: string;
    newScheduledFor: Date;
}): Promise<{
    success: boolean;
    scheduled?: ScheduledContent;
    error?: string;
}>;
export declare function getScheduledContent(params?: {
    platform?: "twitter" | "linkedin" | "instagram" | "farcaster";
    status?: "pending" | "published" | "failed" | "cancelled";
    startDate?: Date;
    endDate?: Date;
}): ScheduledContent[];
export declare function getUpcomingContent(hours?: number): ScheduledContent[];
export declare function processScheduledQueue(): Promise<{
    processed: number;
    published: number;
    failed: number;
}>;
export declare const scheduleContentSchema: {
    platform: z.ZodEnum<{
        twitter: "twitter";
        linkedin: "linkedin";
        instagram: "instagram";
        farcaster: "farcaster";
    }>;
    type: z.ZodEnum<{
        thread: "thread";
        post: "post";
        article: "article";
        story: "story";
        cast: "cast";
    }>;
    content: z.ZodAny;
    scheduledFor: z.ZodString;
    checkConflicts: z.ZodOptional<z.ZodBoolean>;
};
export declare const bulkScheduleSchema: {
    posts: z.ZodArray<z.ZodObject<{
        platform: z.ZodEnum<{
            twitter: "twitter";
            linkedin: "linkedin";
            instagram: "instagram";
            farcaster: "farcaster";
        }>;
        type: z.ZodEnum<{
            thread: "thread";
            post: "post";
            article: "article";
            story: "story";
            cast: "cast";
        }>;
        content: z.ZodAny;
        scheduledFor: z.ZodString;
    }, z.core.$strip>>;
    autoResolveConflicts: z.ZodOptional<z.ZodBoolean>;
    conflictGapMinutes: z.ZodOptional<z.ZodNumber>;
};
export declare const cancelScheduledContentSchema: {
    contentId: z.ZodString;
};
export declare const rescheduleContentSchema: {
    contentId: z.ZodString;
    newScheduledFor: z.ZodString;
};
export declare const getScheduledContentSchema: {
    platform: z.ZodOptional<z.ZodEnum<{
        twitter: "twitter";
        linkedin: "linkedin";
        instagram: "instagram";
        farcaster: "farcaster";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        published: "published";
        failed: "failed";
        pending: "pending";
        cancelled: "cancelled";
    }>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
};
export declare const getUpcomingContentSchema: {
    hours: z.ZodOptional<z.ZodNumber>;
};
//# sourceMappingURL=scheduler.d.ts.map