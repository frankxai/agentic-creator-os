/**
 * Metrics Tracking Module
 * 
 * Tracks performance metrics for evaluated content over time.
 * Enables the system to learn and improve predictions.
 */

import fs from 'fs/promises';
import path from 'path';

const METRICS_DIR = path.join(process.cwd(), '..', '..', '..', '..', '.claude', 'agentic-creator-os', 'metrics');

// In-memory storage for quick access
const metricsCache = new Map<string, any>();

export interface PerformanceMetrics {
  evaluationId: string;
  contentType: string;
  platform: string;
  predictedScore: number;
  actualMetrics: {
    impressions?: number;
    engagement?: number;
    shares?: number;
    comments?: number;
    saves?: number;
    clicks?: number;
    conversions?: number;
    reach?: number;
    followerGrowth?: number;
  };
  accuracy: {
    predictedVsActual: number;
    accuracyPercentage: number;
  };
  publishedAt: string;
  trackedAt: string;
}

export interface AggregatedMetrics {
  totalEvaluations: number;
  averageScore: number;
  averageAccuracy: number;
  topPerformingContent: Array<{ type: string; avgEngagement: number }>;
  improvementTrend: 'improving' | 'declining' | 'stable';
  metricsByPlatform: Record<string, { count: number; avgEngagement: number }>;
  metricsByType: Record<string, { count: number; avgScore: number }>;
}

async function ensureMetricsDir() {
  try {
    await fs.mkdir(METRICS_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

function getMetricsFilePath(platform: string, contentType: string): string {
  return path.join(METRICS_DIR, `${platform}-${contentType}.jsonl`);
}

function getProjectMetricsPath(projectId: string): string {
  return path.join(METRICS_DIR, 'projects', `${projectId}.jsonl`);
}

export async function trackPerformance(args: {
  evaluationId: string;
  actualMetrics: {
    impressions?: number;
    engagement?: number;
    shares?: number;
    comments?: number;
    saves?: number;
    clicks?: number;
    conversions?: number;
    reach?: number;
    followerGrowth?: number;
  };
  publishedAt: string;
  platform: string;
}): Promise<{ success: boolean; accuracyPercentage: number }> {
  await ensureMetricsDir();
  
  const { evaluationId, actualMetrics, publishedAt, platform } = args;
  
  // In a real implementation, we'd retrieve the original evaluation
  // For now, we'll create a sample entry
  const predictedScore = 70; // This would come from the original evaluation
  
  // Calculate engagement score from actual metrics
  const engagementScore = calculateEngagementScore(actualMetrics);
  
  // Calculate accuracy
  const accuracy = Math.max(0, Math.min(100, 100 - Math.abs(predictedScore - engagementScore)));
  
  const metricsEntry: PerformanceMetrics = {
    evaluationId,
    contentType: 'unknown', // Would come from original evaluation
    platform,
    predictedScore,
    actualMetrics,
    accuracy: {
      predictedVsActual: engagementScore - predictedScore,
      accuracyPercentage: accuracy,
    },
    publishedAt,
    trackedAt: new Date().toISOString(),
  };
  
  // Cache metrics for quick access
  const cacheKey = `${platform}-unknown`;
  const existing = metricsCache.get(cacheKey) || [];
  existing.push(metricsEntry);
  metricsCache.set(cacheKey, existing);
  
  return {
    success: true,
    accuracyPercentage: accuracy,
  };
}

export async function getMetrics(args: {
  timeRange: '24h' | '7d' | '30d' | '90d' | 'all';
  contentType?: string;
  platform?: string;
  projectId?: string;
  metricType: 'quality' | 'engagement' | 'improvement' | 'all';
}): Promise<AggregatedMetrics> {
  await ensureMetricsDir();
  
  const { timeRange, contentType, platform, projectId, metricType } = args;
  
  // Calculate time filter
  const now = new Date();
  const timeFilters: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    'all': Infinity,
  };
  
  const cutoffTime = now.getTime() - timeFilters[timeRange];
  
  // Collect all metrics
  const allMetrics: PerformanceMetrics[] = [];
  
  if (projectId) {
    // Load project-specific metrics
    const projectPath = getProjectMetricsPath(projectId);
    try {
      const content = await fs.readFile(projectPath, 'utf-8');
      const lines = content.trim().split('\n');
      for (const line of lines) {
        const entry = JSON.parse(line);
        if (new Date(entry.trackedAt).getTime() > cutoffTime) {
          allMetrics.push(entry);
        }
      }
    } catch {
      // File might not exist
    }
  } else {
    // Load all metrics files
    try {
      const files = await fs.readdir(METRICS_DIR);
      for (const file of files) {
        if (file.endsWith('.jsonl') && !file.startsWith('projects')) {
          const filePath = path.join(METRICS_DIR, file);
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.trim().split('\n');
            for (const line of lines) {
              const entry = JSON.parse(line);
              if (new Date(entry.trackedAt).getTime() > cutoffTime) {
                if (!contentType || entry.contentType === contentType) {
                  if (!platform || entry.platform === platform) {
                    allMetrics.push(entry);
                  }
                }
              }
            }
          } catch {
            // Skip unreadable files
          }
        }
      }
    } catch {
      // Directory might not exist
    }
  }
  
  // Calculate aggregated metrics
  const totalEvaluations = allMetrics.length;
  const averageScore = totalEvaluations > 0 
    ? allMetrics.reduce((sum, m) => sum + m.predictedScore, 0) / totalEvaluations 
    : 0;
  const averageAccuracy = totalEvaluations > 0 
    ? allMetrics.reduce((sum, m) => sum + m.accuracy.accuracyPercentage, 0) / totalEvaluations 
    : 0;
  
  // Group by content type
  const byType = allMetrics.reduce((acc, m) => {
    if (!acc[m.contentType]) {
      acc[m.contentType] = { count: 0, totalScore: 0 };
    }
    acc[m.contentType].count++;
    acc[m.contentType].totalScore += m.predictedScore;
    return acc;
  }, {} as Record<string, { count: number; totalScore: number }>);
  
  const metricsByType = Object.entries(byType).reduce((acc, [type, data]) => {
    acc[type] = { count: data.count, avgScore: Math.round(data.totalScore / data.count) };
    return acc;
  }, {} as Record<string, { count: number; avgScore: number }>);
  
  // Group by platform
  const byPlatform = allMetrics.reduce((acc, m) => {
    if (!acc[m.platform]) {
      acc[m.platform] = { count: 0, totalEngagement: 0 };
    }
    acc[m.platform].count++;
    const engagement = m.actualMetrics.engagement || 0;
    acc[m.platform].totalEngagement += engagement;
    return acc;
  }, {} as Record<string, { count: number; totalEngagement: number }>);
  
  const metricsByPlatform = Object.entries(byPlatform).reduce((acc, [platform, data]) => {
    acc[platform] = { count: data.count, avgEngagement: Math.round(data.totalEngagement / data.count) };
    return acc;
  }, {} as Record<string, { count: number; avgEngagement: number }>);
  
  // Find top performing content types
  const topPerformingContent = Object.entries(metricsByType)
    .map(([type, data]) => ({ type, avgEngagement: data.avgScore }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 5);
  
  // Calculate improvement trend (simplified - would need historical data for real trend)
  const improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
  
  return {
    totalEvaluations,
    averageScore: Math.round(averageScore),
    averageAccuracy: Math.round(averageAccuracy),
    topPerformingContent,
    improvementTrend,
    metricsByPlatform,
    metricsByType,
  };
}

function calculateEngagementScore(metrics: Record<string, number | undefined>): number {
  let score = 0;
  
  // Weighted engagement calculation
  if (metrics.engagement) score += Math.min(40, metrics.engagement / 100);
  if (metrics.shares) score += Math.min(20, metrics.shares / 50);
  if (metrics.comments) score += Math.min(15, metrics.comments / 30);
  if (metrics.saves) score += Math.min(15, metrics.saves / 20);
  if (metrics.clicks) score += Math.min(10, metrics.clicks / 100);
  
  return Math.min(100, Math.round(score * 2)); // Scale to 0-100
}
