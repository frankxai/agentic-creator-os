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
export declare function createCast(params: {
    text: string;
    parentCastId?: string;
    channelId?: string;
    embeds?: Array<{
        type: "url" | "image" | "video" | "frame";
        url: string;
    }>;
    mentions?: number[];
    scheduledFor?: Date;
}): Promise<{
    success: boolean;
    cast?: Cast;
    error?: string;
}>;
export declare function createThread(params: {
    casts: string[];
    channelId?: string;
    scheduledFor?: Date;
}): Promise<{
    success: boolean;
    thread?: Cast[];
    error?: string;
}>;
export declare function createFrame(params: {
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
}): Promise<{
    success: boolean;
    frame?: Frame;
    error?: string;
}>;
export declare function getCastAnalytics(castId: string): Promise<{
    success: boolean;
    analytics?: Cast["metrics"];
    error?: string;
}>;
export declare function createChannel(params: {
    name: string;
    description: string;
    imageUrl?: string;
}): Promise<{
    success: boolean;
    channel?: Channel;
    error?: string;
}>;
export declare function postToChannel(params: {
    channelId: string;
    text: string;
    embeds?: Array<{
        type: "url" | "image" | "video" | "frame";
        url: string;
    }>;
}): Promise<{
    success: boolean;
    cast?: Cast;
    error?: string;
}>;
export declare function scheduleCast(params: {
    text: string;
    scheduledFor: Date;
    channelId?: string;
    embeds?: Array<{
        type: "url" | "image" | "video" | "frame";
        url: string;
    }>;
}): Promise<{
    success: boolean;
    cast?: Cast;
    error?: string;
}>;
export declare function deleteCast(castId: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function getScheduledCasts(): Cast[];
export declare function getAllCasts(limit?: number): Cast[];
export declare function getAllChannels(): Channel[];
export declare function getRateLimitStatus(): {
    casts: {
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
export declare const createCastSchema: {
    text: z.ZodString;
    parentCastId: z.ZodOptional<z.ZodString>;
    channelId: z.ZodOptional<z.ZodString>;
    embeds: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            image: "image";
            video: "video";
            url: "url";
            frame: "frame";
        }>;
        url: z.ZodString;
    }, z.core.$strip>>>;
    mentions: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
    scheduledFor: z.ZodOptional<z.ZodString>;
};
export declare const createThreadSchema: {
    casts: z.ZodArray<z.ZodString>;
    channelId: z.ZodOptional<z.ZodString>;
    scheduledFor: z.ZodOptional<z.ZodString>;
};
export declare const createFrameSchema: {
    castId: z.ZodString;
    imageUrl: z.ZodString;
    buttons: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        action: z.ZodEnum<{
            post: "post";
            post_redirect: "post_redirect";
            link: "link";
            mint: "mint";
        }>;
        target: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    inputText: z.ZodOptional<z.ZodString>;
    postUrl: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
};
export declare const getCastAnalyticsSchema: {
    castId: z.ZodString;
};
export declare const createChannelSchema: {
    name: z.ZodString;
    description: z.ZodString;
    imageUrl: z.ZodOptional<z.ZodString>;
};
export declare const postToChannelSchema: {
    channelId: z.ZodString;
    text: z.ZodString;
    embeds: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            image: "image";
            video: "video";
            url: "url";
            frame: "frame";
        }>;
        url: z.ZodString;
    }, z.core.$strip>>>;
};
export declare const scheduleCastSchema: {
    text: z.ZodString;
    scheduledFor: z.ZodString;
    channelId: z.ZodOptional<z.ZodString>;
    embeds: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            image: "image";
            video: "video";
            url: "url";
            frame: "frame";
        }>;
        url: z.ZodString;
    }, z.core.$strip>>>;
};
export declare const deleteCastSchema: {
    castId: z.ZodString;
};
//# sourceMappingURL=farcaster.d.ts.map