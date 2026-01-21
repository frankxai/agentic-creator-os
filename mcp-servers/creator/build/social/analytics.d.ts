import { z } from "zod";
export interface PlatformMetrics {
    platform: "twitter" | "linkedin" | "instagram" | "farcaster";
    totalPosts: number;
    totalImpressions: number;
    totalEngagements: number;
    avgEngagementRate: number;
    topPost?: {
        id: string;
        text: string;
        engagementRate: number;
    };
}
export interface AggregatedAnalytics {
    period: {
        start: Date;
        end: Date;
    };
    platforms: PlatformMetrics[];
    totals: {
        posts: number;
        impressions: number;
        engagements: number;
        avgEngagementRate: number;
    };
    bestPerformingPlatform: string;
    recommendations: string[];
}
export interface ContentPerformance {
    contentType: string;
    platform: string;
    avgEngagementRate: number;
    postCount: number;
    bestTime?: {
        dayOfWeek: string;
        hour: number;
    };
}
export declare function getAggregatedAnalytics(params: {
    startDate: Date;
    endDate: Date;
    platforms?: Array<"twitter" | "linkedin" | "instagram" | "farcaster">;
}): Promise<{
    success: boolean;
    analytics?: AggregatedAnalytics;
    error?: string;
}>;
export declare function compareContentPerformance(params: {
    platforms: Array<"twitter" | "linkedin" | "instagram" | "farcaster">;
    contentTypes?: string[];
}): Promise<{
    success: boolean;
    performance?: ContentPerformance[];
    error?: string;
}>;
export declare function getBestPostingTimes(params: {
    platform: "twitter" | "linkedin" | "instagram" | "farcaster";
    timezone?: string;
}): Promise<{
    success: boolean;
    times?: Array<{
        dayOfWeek: string;
        hour: number;
        score: number;
    }>;
    error?: string;
}>;
export declare function getEngagementTrends(params: {
    platform: "twitter" | "linkedin" | "instagram" | "farcaster";
    days: number;
}): Promise<{
    success: boolean;
    trends?: Array<{
        date: Date;
        impressions: number;
        engagements: number;
        rate: number;
    }>;
    error?: string;
}>;
export declare const getAggregatedAnalyticsSchema: {
    startDate: z.ZodString;
    endDate: z.ZodString;
    platforms: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        twitter: "twitter";
        linkedin: "linkedin";
        instagram: "instagram";
        farcaster: "farcaster";
    }>>>;
};
export declare const compareContentPerformanceSchema: {
    platforms: z.ZodArray<z.ZodEnum<{
        twitter: "twitter";
        linkedin: "linkedin";
        instagram: "instagram";
        farcaster: "farcaster";
    }>>;
    contentTypes: z.ZodOptional<z.ZodArray<z.ZodString>>;
};
export declare const getBestPostingTimesSchema: {
    platform: z.ZodEnum<{
        twitter: "twitter";
        linkedin: "linkedin";
        instagram: "instagram";
        farcaster: "farcaster";
    }>;
    timezone: z.ZodOptional<z.ZodString>;
};
export declare const getEngagementTrendsSchema: {
    platform: z.ZodEnum<{
        twitter: "twitter";
        linkedin: "linkedin";
        instagram: "instagram";
        farcaster: "farcaster";
    }>;
    days: z.ZodNumber;
};
//# sourceMappingURL=analytics.d.ts.map