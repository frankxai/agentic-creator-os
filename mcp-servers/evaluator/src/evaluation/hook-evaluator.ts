/**
 * Hook Evaluation Module
 * 
 * Specialized evaluation for social media hooks/openers.
 * Analyzes hook effectiveness based on psychological triggers,
 * curiosity gaps, and platform-specific optimization.
 */

import type { HookEvaluationResult } from '../types/index.js';

// Hook pattern categories and their effectiveness scores
const HOOK_PATTERNS = {
  contradiction: {
    patterns: [
      /\b(but|however|yet|although|despite|while)\b/i,
      /\b(misconception|myth|wrong|not|never|don't)\b/i,
    ],
    effectiveness: 85,
    description: 'Contradicts common beliefs or expectations',
  },
  question: {
    patterns: [
      /^\w+\s+\w+\?/,
      /^(what|why|how|when|where|who|is|are|can|do|does|would|could|should)\b/i,
    ],
    effectiveness: 80,
    description: 'Asks a compelling question',
  },
  promise: {
    patterns: [
      /\b(how to|way to|secret to|way to|steps?|method|technique|strategy)\b/i,
      /\b(this is|here's|here's how|learn how)\b/i,
    ],
    effectiveness: 75,
    description: 'Promises a specific outcome or benefit',
  },
  specificity: {
    patterns: [
      /\b\d{1,3}(,\d{3})*(\.\d+)?\b/, // Numbers
      /\b(\$|€|£)\d+/, // Money
      /\b(years?|months?|weeks?|days?|hours?)\b/i, // Time
    ],
    effectiveness: 82,
    description: 'Uses specific numbers or details',
  },
  controversy: {
    patterns: [
      /\b(unpopular|controversial|hot take|unpopular opinion|I'll say it)\b/i,
      /\b(they don't want you to know|they're hiding|secret truth)\b/i,
    ],
    effectiveness: 88,
    description: 'Creates controversy or insider information',
  },
  story: {
    patterns: [
      /\b(I once|I was|When I|My|We)\b/i,
      /\b(yesterday|today|last|this morning|that day)\b/i,
    ],
    effectiveness: 78,
    description: 'Sets up a personal story or anecdote',
  },
  authority: {
    patterns: [
      /\b(expert|professional|years?|hired|worked with|built|created|launched)\b/i,
      /\b(\d{2,}\+?)\s+\w+/, // Experience claims
    ],
    effectiveness: 72,
    description: 'Establishes authority or expertise',
  },
};

// Platform-specific hook optimization
const PLATFORM_HOOK_OPTIMIZATION = {
  twitter: {
    maxLength: 100,
    idealLength: { min: 40, max: 80 },
    style: 'punchy',
    requiredElements: ['curiosity gap'],
  },
  linkedin: {
    maxLength: 150,
    idealLength: { min: 60, max: 120 },
    style: 'professional',
    requiredElements: ['relevance'],
  },
  instagram: {
    maxLength: 125,
    idealLength: { min: 40, max: 100 },
    style: 'visual-friendly',
    requiredElements: ['emotional trigger'],
  },
  tiktok: {
    maxLength: 150,
    idealLength: { min: 20, max: 60 },
    style: 'energetic',
    requiredElements: ['shock value'],
  },
  farcaster: {
    maxLength: 320,
    idealLength: { min: 50, max: 150 },
    style: 'community',
    requiredElements: ['discussion starter'],
  },
};

export function evaluateHook(args: {
  hook: string;
  platform: string;
  category?: string;
  context?: {
    workflowId?: string;
    sessionId?: string;
    projectId?: string;
    source?: 'claude-code' | 'opencode' | 'gemini' | 'custom';
  };
}): HookEvaluationResult {
  const { hook, platform, category } = args;
  
  const scores = {
    overall: 0,
    curiosityGap: 0,
    specificity: 0,
    emotionalTrigger: 0,
    platformFit: 0,
    patternMatch: 0,
  };
  
  const suggestions: Array<{ type: string; issue: string; suggestion: string; impact: 'high' | 'medium' | 'low' }> = [];
  
  // Detect hook patterns
  const detectedPatterns = detectPatterns(hook);
  scores.patternMatch = calculatePatternScore(detectedPatterns, category);
  
  // Calculate curiosity gap score
  scores.curiosityGap = calculateCuriosityGap(hook);
  if (scores.curiosityGap < 50) {
    suggestions.push({
      type: 'curiosity-gap',
      issue: 'Hook lacks a strong curiosity gap',
      suggestion: 'Add an unexpected element or tease valuable information without revealing it',
      impact: 'high',
    });
  }
  
  // Calculate specificity score
  scores.specificity = calculateSpecificity(hook);
  if (scores.specificity < 40) {
    suggestions.push({
      type: 'specificity',
      issue: 'Hook could be more specific',
      suggestion: 'Add numbers, dates, or concrete details to increase credibility',
      impact: 'medium',
    });
  }
  
  // Calculate emotional trigger score
  scores.emotionalTrigger = calculateEmotionalTriggers(hook);
  if (scores.emotionalTrigger < 40) {
    suggestions.push({
      type: 'emotional',
      issue: 'Hook may not trigger strong emotions',
      suggestion: 'Use power words like: secret, shocking, amazing, dangerous, truth',
      impact: 'medium',
    });
  }
  
  // Calculate platform fit
  const platformOpt = PLATFORM_HOOK_OPTIMIZATION[platform as keyof typeof PLATFORM_HOOK_OPTIMIZATION] || PLATFORM_HOOK_OPTIMIZATION.twitter;
  scores.platformFit = calculatePlatformFit(hook, platformOpt);
  if (scores.platformFit < 50) {
    suggestions.push({
      type: 'platform',
      issue: `Hook may not be optimized for ${platform}`,
      suggestion: `Keep hook under ${platformOpt.idealLength.max} characters for ${platform}`,
      impact: 'medium',
    });
  }
  
  // Calculate weighted overall score
  scores.overall = Math.round(
    (scores.curiosityGap * 0.30) +
    (scores.specificity * 0.20) +
    (scores.emotionalTrigger * 0.20) +
    (scores.platformFit * 0.20) +
    (scores.patternMatch * 0.10)
  );
  
  // Determine category if not provided
  const detectedCategory = category || detectPrimaryCategory(detectedPatterns);
  
  // Generate engagement prediction
  const prediction = predictHookPerformance(scores, platform);
  
  return {
    scores,
    category: detectedCategory,
    engagementPrediction: prediction,
    suggestions,
    metadata: {
      hookLength: hook.length,
      wordCount: hook.split(/\s+/).length,
      platform,
      evaluatedAt: new Date().toISOString(),
      detectedPatterns: detectedPatterns.map(p => p.type),
    },
  };
}

function detectPatterns(hook: string): Array<{ type: string; match: string; index: number }> {
  const detected: Array<{ type: string; match: string; index: number }> = [];
  
  for (const [category, data] of Object.entries(HOOK_PATTERNS)) {
    for (const pattern of data.patterns) {
      const match = hook.match(pattern);
      if (match) {
        detected.push({
          type: category,
          match: match[0],
          index: match.index || 0,
        });
      }
    }
  }
  
  return detected;
}

function calculatePatternScore(detectedPatterns: Array<{ type: string }>, expectedCategory?: string): number {
  if (detectedPatterns.length === 0) return 30;
  
  let score = 50;
  
  // Bonus for pattern matches
  score += Math.min(30, detectedPatterns.length * 10);
  
  // Bonus if matches expected category
  if (expectedCategory && detectedPatterns.some(p => p.type === expectedCategory)) {
    score += 15;
  }
  
  return Math.min(100, score);
}

function calculateCuriosityGap(hook: string): number {
  let score = 50;
  
  // Check for incomplete statements
  if (/\b(this is|here's|here's why|that's why|which is why)\b/i.test(hook)) {
    score += 20;
  }
  
  // Check for list/teaser patterns
  if (/\d+\s+\w+(\s+\w+)*\s*(and|or|,)\s+\w+/i.test(hook)) {
    score += 15;
  }
  
  // Check for "what/why/how" without immediate answer
  const questionMatch = hook.match(/^(what|why|how|when|where|who)\s+(.+)\?$/i);
  if (questionMatch && questionMatch[2].length > 10) {
    score += 20;
  }
  
  // Penalty for complete statements
  if (/^\w+\s+\w+\s+(is|are|was|were)\s+.+\.$/i.test(hook)) {
    score -= 20;
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculateSpecificity(hook: string): number {
  let score = 40;
  
  // Check for numbers
  const numberMatches = hook.match(/\b\d{1,3}(,\d{3})*(\.\d+)?\b/g);
  if (numberMatches) {
    score += Math.min(25, numberMatches.length * 10);
  }
  
  // Check for time periods
  if (/\b(years?|months?|weeks?|days?|hours?|minutes?|seconds?)\b/i.test(hook)) {
    score += 15;
  }
  
  // Check for money
  if (/(\$|€|£)\d+/.test(hook)) {
    score += 15;
  }
  
  // Check for percentages
  if (/\d+(\.\d+)?%/.test(hook)) {
    score += 10;
  }
  
  return Math.min(100, score);
}

function calculateEmotionalTriggers(hook: string): number {
  const emotionalWords = [
    // Positive
    'amazing', 'incredible', 'fantastic', 'love', 'excited', 'thrilled', 'joy',
    // Negative/Fear
    'dangerous', 'warning', 'risk', 'mistake', 'failure', 'wrong', 'stop',
    // Surprise
    'shocking', 'surprise', 'unexpected', 'suddenly', 'finally',
    // Curiosity
    'secret', 'hidden', 'truth', 'what they', "they don't",
    // Urgency
    'now', 'today', 'immediately', 'limited', 'hurry', 'fast',
  ];
  
  const matches = emotionalWords.filter(word => 
    new RegExp(`\\b${word}\\b`, 'i').test(hook)
  );
  
  return Math.min(100, 40 + (matches.length * 10));
}

function calculatePlatformFit(hook: string, optimization: typeof PLATFORM_HOOK_OPTIMIZATION.twitter): number {
  let score = 70;
  
  // Length check
  if (hook.length >= optimization.idealLength.min && hook.length <= optimization.idealLength.max) {
    score += 20;
  } else if (hook.length > optimization.maxLength) {
    score -= 40;
  } else if (hook.length < optimization.idealLength.min) {
    score -= 10;
  }
  
  // Check for platform-appropriate style
  if (optimization.style === 'punchy') {
    if (hook.split(/[.!?]/).length > 1) score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

function detectPrimaryCategory(detectedPatterns: Array<{ type: string }>): string {
  const categoryCounts = detectedPatterns.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'statement';
}

function predictHookPerformance(scores: Record<string, number>, platform: string): {
  predicted: 'low' | 'medium' | 'high' | 'viral';
  confidence: number;
  factors: string[];
} {
  const factors: string[] = [];
  
  if (scores.curiosityGap >= 70) factors.push('Strong curiosity gap');
  if (scores.specificity >= 60) factors.push('Specific and credible');
  if (scores.emotionalTrigger >= 60) factors.push('Triggers emotions');
  if (scores.platformFit >= 70) factors.push('Platform-optimized');
  
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  
  let predicted: 'low' | 'medium' | 'high' | 'viral';
  let confidence: number;
  
  if (avgScore >= 80 && scores.curiosityGap >= 70) {
    predicted = 'viral';
    confidence = 0.70;
  } else if (avgScore >= 65) {
    predicted = 'high';
    confidence = 0.75;
  } else if (avgScore >= 45) {
    predicted = 'medium';
    confidence = 0.70;
  } else {
    predicted = 'low';
    confidence = 0.60;
  }
  
  return { predicted, confidence, factors };
}
