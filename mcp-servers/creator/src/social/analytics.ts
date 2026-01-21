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

export async function getAggregatedAnalytics(params: {
  startDate: Date;
  endDate: Date;
  platforms?: Array<"twitter" | "linkedin" | "instagram" | "farcaster">;
}): Promise<{ success: boolean; analytics?: AggregatedAnalytics; error?: string }> {
  const platforms = params.platforms || ["twitter", "linkedin", "instagram", "farcaster"];
  const platformMetrics: PlatformMetrics[] = [];
  
  let totalPosts = 0;
  let totalImpressions = 0;
  let totalEngagements = 0;
  
  for (const platform of platforms) {
    const metrics: PlatformMetrics = {
      platform,
      totalPosts: Math.floor(Math.random() * 100),
      totalImpressions: Math.floor(Math.random() * 100000),
      totalEngagements: Math.floor(Math.random() * 5000),
      avgEngagementRate: Math.random() * 10,
      topPost: {
        id: crypto.randomUUID(),
        text: `Top post on ${platform}`,
        engagementRate: Math.random() * 15
      }
    };
    
    platformMetrics.push(metrics);
    totalPosts += metrics.totalPosts;
    totalImpressions += metrics.totalImpressions;
    totalEngagements += metrics.totalEngagements;
  }
  
  const bestPlatform = platformMetrics.reduce((best, current) => 
    current.avgEngagementRate > best.avgEngagementRate ? current : best
  , platformMetrics[0]);
  
  const recommendations = generateRecommendations(platformMetrics);
  
  const analytics: AggregatedAnalytics = {
    period: {
      start: params.startDate,
      end: params.endDate
    },
    platforms: platformMetrics,
    totals: {
      posts: totalPosts,
      impressions: totalImpressions,
      engagements: totalEngagements,
      avgEngagementRate: totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0
    },
    bestPerformingPlatform: bestPlatform.platform,
    recommendations
  };
  
  return { success: true, analytics };
}

function generateRecommendations(metrics: PlatformMetrics[]): string[] {
  const recommendations: string[] = [];
  
  const sortedByEngagement = [...metrics].sort((a, b) => 
    b.avgEngagementRate - a.avgEngagementRate
  );
  
  if (sortedByEngagement.length > 0) {
    const best = sortedByEngagement[0];
    recommendations.push(
      `Focus more on ${best.platform} - it has the highest engagement rate at ${best.avgEngagementRate.toFixed(2)}%`
    );
  }
  
  const lowPerformers = metrics.filter(m => m.avgEngagementRate < 2);
  if (lowPerformers.length > 0) {
    recommendations.push(
      `Consider improving content strategy for: ${lowPerformers.map(p => p.platform).join(", ")}`
    );
  }
  
  const highImpressionLowEngagement = metrics.filter(
    m => m.totalImpressions > 10000 && m.avgEngagementRate < 3
  );
  if (highImpressionLowEngagement.length > 0) {
    recommendations.push(
      `High reach but low engagement on ${highImpressionLowEngagement[0].platform} - try more interactive content`
    );
  }
  
  return recommendations;
}

export async function compareContentPerformance(params: {
  platforms: Array<"twitter" | "linkedin" | "instagram" | "farcaster">;
  contentTypes?: string[];
}): Promise<{ success: boolean; performance?: ContentPerformance[]; error?: string }> {
  const performance: ContentPerformance[] = [];
  
  for (const platform of params.platforms) {
    performance.push({
      contentType: "text",
      platform,
      avgEngagementRate: Math.random() * 10,
      postCount: Math.floor(Math.random() * 100),
      bestTime: {
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][Math.floor(Math.random() * 5)],
        hour: Math.floor(Math.random() * 24)
      }
    });
    
    performance.push({
      contentType: "media",
      platform,
      avgEngagementRate: Math.random() * 15,
      postCount: Math.floor(Math.random() * 50),
      bestTime: {
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][Math.floor(Math.random() * 5)],
        hour: Math.floor(Math.random() * 24)
      }
    });
  }
  
  return { success: true, performance };
}

export async function getBestPostingTimes(params: {
  platform: "twitter" | "linkedin" | "instagram" | "farcaster";
  timezone?: string;
}): Promise<{ 
  success: boolean; 
  times?: Array<{ dayOfWeek: string; hour: number; score: number }>; 
  error?: string 
}> {
  const times = [
    { dayOfWeek: "Monday", hour: 9, score: 8.5 },
    { dayOfWeek: "Monday", hour: 12, score: 7.2 },
    { dayOfWeek: "Tuesday", hour: 10, score: 9.1 },
    { dayOfWeek: "Wednesday", hour: 14, score: 8.8 },
    { dayOfWeek: "Thursday", hour: 11, score: 9.3 },
    { dayOfWeek: "Friday", hour: 15, score: 7.9 }
  ];
  
  return { success: true, times };
}

export async function getEngagementTrends(params: {
  platform: "twitter" | "linkedin" | "instagram" | "farcaster";
  days: number;
}): Promise<{
  success: boolean;
  trends?: Array<{ date: Date; impressions: number; engagements: number; rate: number }>;
  error?: string;
}> {
  const trends = [];
  const now = new Date();
  
  for (let i = params.days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const impressions = Math.floor(Math.random() * 10000) + 1000;
    const engagements = Math.floor(Math.random() * 500) + 50;
    
    trends.push({
      date,
      impressions,
      engagements,
      rate: (engagements / impressions) * 100
    });
  }
  
  return { success: true, trends };
}

export const getAggregatedAnalyticsSchema = {
  startDate: z.string().describe("Start date (ISO format)"),
  endDate: z.string().describe("End date (ISO format)"),
  platforms: z.array(z.enum(["twitter", "linkedin", "instagram", "farcaster"]))
    .optional()
    .describe("Platforms to include")
};

export const compareContentPerformanceSchema = {
  platforms: z.array(z.enum(["twitter", "linkedin", "instagram", "farcaster"]))
    .describe("Platforms to compare"),
  contentTypes: z.array(z.string()).optional().describe("Content types to analyze")
};

export const getBestPostingTimesSchema = {
  platform: z.enum(["twitter", "linkedin", "instagram", "farcaster"])
    .describe("Platform to analyze"),
  timezone: z.string().optional().describe("Timezone (e.g., 'America/New_York')")
};

export const getEngagementTrendsSchema = {
  platform: z.enum(["twitter", "linkedin", "instagram", "farcaster"])
    .describe("Platform to analyze"),
  days: z.number().min(1).max(90).describe("Number of days to analyze")
};
