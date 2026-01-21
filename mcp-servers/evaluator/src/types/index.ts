/**
 * Type Definitions for Agentic Creator OS Evaluator MCP Server
 */

export interface ContentScores {
  overall: number;
  readability: number;
  engagement: number;
  brandVoice: number;
  platformOptimization: number;
  seo: number;
  authenticity: number;
}

export interface BrandVoice {
  tone: 'professional' | 'casual' | 'authoritative' | 'friendly' | 'provocative';
  personality: string[];
  keywords?: string[];
  avoidKeywords?: string[];
}

export interface EvaluationResult {
  scores: ContentScores;
  grade: string;
  engagementPrediction: {
    predictedEngagement: 'low' | 'medium' | 'high' | 'viral';
    confidence: number;
    factors: string[];
  };
  suggestions: Array<{
    area: string;
    issue: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  metadata: {
    contentLength: number;
    wordCount: number;
    platform: string;
    evaluatedAt: string;
    source: string;
  };
}

export interface HookEvaluationResult {
  scores: {
    overall: number;
    curiosityGap: number;
    specificity: number;
    emotionalTrigger: number;
    platformFit: number;
    patternMatch: number;
  };
  category: string;
  engagementPrediction: {
    predicted: 'low' | 'medium' | 'high' | 'viral';
    confidence: number;
    factors: string[];
  };
  suggestions: Array<{
    type: string;
    issue: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  metadata: {
    hookLength: number;
    wordCount: number;
    platform: string;
    evaluatedAt: string;
    detectedPatterns: string[];
  };
}

export interface AuditEntry {
  id: string;
  type: 'content-evaluation' | 'hook-evaluation' | 'performance-tracking' | 'session-start' | 'session-end';
  source: 'claude-code' | 'opencode' | 'gemini' | 'custom';
  sessionId?: string;
  projectId?: string;
  workflowId?: string;
  contentType?: string;
  platform?: string;
  result?: any;
  timestamp: string;
  metadata?: {
    contentLength?: number;
    platformVersion?: string;
    mcpVersion?: string;
    [key: string]: any;
  };
}

export interface ContentMetrics {
  impressions?: number;
  engagement?: number;
  shares?: number;
  comments?: number;
  saves?: number;
  clicks?: number;
  conversions?: number;
  reach?: number;
  followerGrowth?: number;
}

export interface ComparisonResult {
  comparison: Record<string, {
    original: number;
    revised: number;
    improvement: number;
    percentageChange: string;
    winner: 'original' | 'revised' | 'tie';
  }>;
  summary: 'original' | 'revised';
  timestamp: string;
}

export interface ImprovementSuggestion {
  suggestions: Array<{
    area: string;
    issue: string;
    suggestion: string;
    impact: string;
  }>;
  priorityOrder: Array<{
    area: string;
    impact: string;
  }>;
  timestamp: string;
}

export interface MetricsSummary {
  totalEvaluations: number;
  averageScore: number;
  averageAccuracy: number;
  topPerformingContent: Array<{
    type: string;
    avgEngagement: number;
  }>;
  improvementTrend: 'improving' | 'declining' | 'stable';
  metricsByPlatform: Record<string, {
    count: number;
    avgEngagement: number;
  }>;
  metricsByType: Record<string, {
    count: number;
    avgScore: number;
  }>;
}
