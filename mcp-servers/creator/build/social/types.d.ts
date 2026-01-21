export interface BasePost {
    id: string;
    authorId: string;
    createdAt: Date;
    scheduledFor?: Date;
    status: "draft" | "scheduled" | "published" | "failed";
}
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    resetAt: number;
}
export interface AnalyticsMetrics {
    impressions: number;
    engagements: number;
    engagementRate: number;
}
//# sourceMappingURL=types.d.ts.map