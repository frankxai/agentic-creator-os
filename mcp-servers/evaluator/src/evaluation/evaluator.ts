/**
 * Content Evaluation Engine
 * 
 * Provides comprehensive quality scoring for social media content
 * across multiple dimensions including readability, engagement potential,
 * brand voice consistency, and platform optimization.
 */

import { z } from 'zod';
import type { EvaluationResult, ContentScores, BrandVoice } from '../types/index.js';

// Evaluation dimensions and their weights
const DIMENSION_WEIGHTS = {
  readability: 0.20,
  engagement: 0.25,
  brandVoice: 0.20,
  platformOptimization: 0.20,
  seo: 0.10,
  authenticity: 0.05,
};

// Platform-specific character limits and optimization targets
const PLATFORM_SPECS = {
  twitter: {
    maxLength: 280,
    idealLength: { min: 71, max: 280 },
    hashtagLimit: 2,
    lineBreakLimit: 3,
  },
  linkedin: {
    maxLength: 3000,
    idealLength: { min: 1200, max: 2500 },
    hashtagLimit: 5,
    lineBreakLimit: 5,
  },
  instagram: {
    maxLength: 2200,
    idealLength: { min: 1000, max: 2000 },
    hashtagLimit: 30,
    lineBreakLimit: 0,
  },
  tiktok: {
    maxLength: 2200,
    idealLength: { min: 150, max: 500 },
    hashtagLimit: 5,
    lineBreakLimit: 0,
  },
  farcaster: {
    maxLength: 320,
    idealLength: { min: 100, max: 280 },
    hashtagLimit: 3,
    lineBreakLimit: 2,
  },
  blog: {
    maxLength: Infinity,
    idealLength: { min: 1500, max: 5000 },
    hashtagLimit: 0,
    lineBreakLimit: 10,
  },
  email: {
    maxLength: Infinity,
    idealLength: { min: 200, max: 500 },
    hashtagLimit: 0,
    lineBreakLimit: 5,
  },
  video: {
    maxLength: 5000,
    idealLength: { min: 100, max: 1000 },
    hashtagLimit: 5,
    lineBreakLimit: 0,
  },
};

export async function evaluateContent(args: {
  content: string;
  contentType: string;
  platform?: string;
  brandVoice?: BrandVoice;
  context?: {
    workflowId?: string;
    sessionId?: string;
    projectId?: string;
    source?: 'claude-code' | 'opencode' | 'gemini' | 'custom';
    timestamp?: string;
  };
  options?: {
    includeSuggestions?: boolean;
    strictMode?: boolean;
    benchmarkAgainst?: 'industry-average' | 'top-performers' | 'previous-outputs';
  };
}): Promise<EvaluationResult> {
  const { content, contentType, platform, brandVoice, options } = args;
  
  const scores: ContentScores = {
    overall: 0,
    readability: 0,
    engagement: 0,
    brandVoice: 0,
    platformOptimization: 0,
    seo: 0,
    authenticity: 0,
  };

  const suggestions: Array<{ area: string; issue: string; suggestion: string; impact: 'high' | 'medium' | 'low' }> = [];
  
  // Calculate readability score
  scores.readability = calculateReadabilityScore(content);
  if (scores.readability < 60) {
    suggestions.push({
      area: 'readability',
      issue: 'Content may be difficult to read',
      suggestion: 'Use shorter sentences (under 20 words) and simpler vocabulary',
      impact: 'high',
    });
  }

  // Calculate engagement score
  scores.engagement = calculateEngagementScore(content, contentType);
  if (scores.engagement < 50) {
    suggestions.push({
      area: 'engagement',
      issue: 'Low engagement potential detected',
      suggestion: 'Add a stronger hook, include a call-to-action, or ask a question',
      impact: 'high',
    });
  }

  // Calculate brand voice consistency
  if (brandVoice) {
    scores.brandVoice = calculateBrandVoiceScore(content, brandVoice);
    if (scores.brandVoice < 50) {
      suggestions.push({
        area: 'brand-voice',
        issue: 'Content may not match brand voice guidelines',
        suggestion: `Ensure tone is ${brandVoice.tone} and avoid off-brand keywords`,
        impact: 'medium',
      });
    }
  } else {
    scores.brandVoice = 75; // Default score when no brand voice specified
  }

  // Calculate platform optimization
  const platformSpec = PLATFORM_SPECS[contentType as keyof typeof PLATFORM_SPECS] || PLATFORM_SPECS.blog;
  scores.platformOptimization = calculatePlatformScore(content, platformSpec);
  if (scores.platformOptimization < 50) {
    suggestions.push({
      area: 'platform',
      issue: 'Content may not be optimized for platform',
      suggestion: `Adjust length to ${platformSpec.idealLength.min}-${platformSpec.idealLength.max} characters`,
      impact: 'medium',
    });
  }

  // Calculate SEO score
  scores.seo = calculateSeoScore(content);
  if (scores.seo < 40) {
    suggestions.push({
      area: 'seo',
      issue: 'SEO optimization could be improved',
      suggestion: 'Include relevant keywords naturally, add relevant hashtags',
      impact: 'low',
    });
  }

  // Calculate authenticity score
  scores.authenticity = calculateAuthenticityScore(content);
  if (scores.authenticity < 50) {
    suggestions.push({
      area: 'authenticity',
      issue: 'Content may feel generic or inauthentic',
      suggestion: 'Add personal stories, specific examples, or unique perspectives',
      impact: 'medium',
    });
  }

  // Calculate weighted overall score
  scores.overall = Math.round(
    (scores.readability * DIMENSION_WEIGHTS.readability) +
    (scores.engagement * DIMENSION_WEIGHTS.engagement) +
    (scores.brandVoice * DIMENSION_WEIGHTS.brandVoice) +
    (scores.platformOptimization * DIMENSION_WEIGHTS.platformOptimization) +
    (scores.seo * DIMENSION_WEIGHTS.seo) +
    (scores.authenticity * DIMENSION_WEIGHTS.authenticity)
  );

  // Add engagement prediction
  const engagementPrediction = predictEngagement(scores, content, contentType);

  // Add grade
  const grade = getGrade(scores.overall);

  return {
    scores,
    grade,
    engagementPrediction,
    suggestions: options?.includeSuggestions ? suggestions : [],
    metadata: {
      contentLength: content.length,
      wordCount: content.split(/\s+/).length,
      platform: platform || contentType,
      evaluatedAt: new Date().toISOString(),
      source: options?.benchmarkAgainst || 'industry-average',
    },
  };
}

function calculateReadabilityScore(content: string): number {
  const words = content.split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  const syllables = countSyllables(content);
  
  if (words.length === 0 || sentences.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  // Flesch Reading Ease formula (simplified)
  const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  // Normalize to 0-100
  const normalizedScore = Math.max(0, Math.min(100, fleschScore));
  
  // Bonus for good paragraph structure
  const paragraphBonus = content.includes('\n\n') ? 10 : 0;
  
  return Math.round(Math.min(100, normalizedScore + paragraphBonus));
}

function calculateEngagementScore(content: string, contentType: string): number {
  let score = 50; // Base score
  
  // Check for hook elements
  const hasQuestion = content.includes('?');
  const hasNumbers = /\d+/.test(content);
  const hasStrongWords = / amazing|incredible|secret|truth|finally|warning|shocking/i.test(content);
  const hasCallToAction = /click|check|read|learn|save|share|comment|subscribe/i.test(content);
  const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(content);
  const hasHashtag = /#\w+/g.test(content);
  
  if (hasQuestion) score += 10;
  if (hasNumbers) score += 10;
  if (hasStrongWords) score += 10;
  if (hasCallToAction) score += 10;
  if (hasEmoji && ['instagram', 'tiktok'].includes(contentType)) score += 5;
  if (hasHashtag && ['twitter', 'instagram', 'tiktok'].includes(contentType)) score += 5;
  
  // Penalize for being too long
  const idealSpecs = PLATFORM_SPECS[contentType as keyof typeof PLATFORM_SPECS] || PLATFORM_SPECS.blog;
  if (content.length > idealSpecs.idealLength.max) {
    score -= Math.min(20, Math.floor((content.length - idealSpecs.idealLength.max) / 100));
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculateBrandVoiceScore(content: string, brandVoice: BrandVoice): number {
  let score = 70; // Base score
  
  // Check tone alignment
  const toneIndicators: Record<string, RegExp[]> = {
    professional: [/\b(furthermore|moreover|additionally|consequently|therefore|hence)\b/i],
    casual: [/\b(hey|guess what|sooo|pretty much|kinda|sorta)\b/i],
    authoritative: [/\b(must|need to|essential|critical|imperative|definitively)\b/i],
    friendly: [/\b(love|amazing|awesome|fantastic|great|happy|excited)\b/i],
    provocative: [/\b(controversial|unpopular|truth is|they don.t want|secret)\b/i],
  };
  
  const toneMatches = toneIndicators[brandVoice.tone]?.filter(regex => regex.test(content)).length || 0;
  score += Math.min(15, toneMatches * 5);
  
  // Check for personality keywords
  if (brandVoice.keywords?.length) {
    const keywordMatches = brandVoice.keywords.filter(kw => 
      new RegExp(`\\b${kw}\\b`, 'i').test(content)
    ).length;
    score += Math.min(10, keywordMatches * 3);
  }
  
  // Check for avoid keywords
  if (brandVoice.avoidKeywords?.length) {
    const avoidMatches = brandVoice.avoidKeywords.filter(kw => 
      new RegExp(`\\b${kw}\\b`, 'i').test(content)
    ).length;
    score -= Math.min(20, avoidMatches * 10);
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculatePlatformScore(content: string, spec: typeof PLATFORM_SPECS.twitter): number {
  let score = 70;
  
  // Length check
  if (content.length <= spec.idealLength.max && content.length >= spec.idealLength.min) {
    score += 15;
  } else if (content.length > spec.maxLength) {
    score -= 30;
  } else if (content.length < spec.idealLength.min) {
    score -= 10;
  }
  
  // Hashtag limit
  const hashtagCount = (content.match(/#\w+/g) || []).length;
  if (hashtagCount <= spec.hashtagLimit) {
    score += 10;
  } else {
    score -= Math.min(15, (hashtagCount - spec.hashtagLimit) * 3);
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculateSeoScore(content: string): number {
  let score = 50;
  
  const words = content.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  
  // Keyword density (ideal: 1-3%)
  const longContent = words.length > 50;
  if (longContent) {
    score += 15;
  }
  
  // Structure indicators
  if (content.includes('\n')) score += 10;
  if (/^#/.test(content)) score += 10; // Has heading
  
  // Call-to-action (good for engagement)
  if (/click here|learn more|read more/i.test(content)) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

function calculateAuthenticityScore(content: string): number {
  let score = 60;
  
  // Check for first-person singular
  const firstPersonCount = (content.match(/\b(I|me|my|mine|we|our|us)\b/gi) || []).length;
  if (firstPersonCount > 0) {
    score += Math.min(15, firstPersonCount * 3);
  }
  
  // Check for specific details (dates, numbers, names)
  const hasSpecificNumbers = /\b\d{4}\b|\b\d{1,3}(,\d{3})*\b/.test(content);
  const hasSpecificDates = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(st|nd|rd|th)?\b/i.test(content);
  
  if (hasSpecificNumbers) score += 10;
  if (hasSpecificDates) score += 5;
  
  // Check for conversational markers
  const hasConversationalMarkers = /\b(you know|right|honestly|actually|basically|literally)\b/i.test(content);
  if (hasConversationalMarkers) score += 5;
  
  // Penalty for generic phrases
  const genericPhrases = [
    'best in class',
    'world-class',
    'cutting-edge',
    'game-changing',
    'revolutionary',
    'leverage',
    'synergy',
  ];
  
  const genericMatches = genericPhrases.filter(phrase => 
    new RegExp(`\\b${phrase}\\b`, 'i').test(content)
  ).length;
  
  score -= Math.min(20, genericMatches * 7);
  
  return Math.max(0, Math.min(100, score));
}

function countSyllables(text: string): number {
  return text.toLowerCase().split(/\s+/).reduce((count, word) => {
    return count + word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').match(/[aeiouy]{1,2}/g)?.length || 1;
  }, 0);
}

function predictEngagement(scores: ContentScores, content: string, contentType: string): {
  predictedEngagement: 'low' | 'medium' | 'high' | 'viral';
  confidence: number;
  factors: string[];
} {
  const factors: string[] = [];
  let engagementScore = scores.engagement;
  
  // Content-type specific adjustments
  if (contentType === 'twitter' && content.length > 71 && content.length < 100) {
    engagementScore += 15;
    factors.push('Optimal tweet length (71-100 chars)');
  }
  
  if (contentType === 'linkedin' && scores.readability > 60) {
    engagementScore += 10;
    factors.push('High readability for professional content');
  }
  
  if (contentType === 'instagram' && content.includes('#')) {
    engagementScore += 10;
    factors.push('Hashtags included for discovery');
  }
  
  // Overall quality boost
  if (scores.overall > 80) {
    engagementScore += 10;
    factors.push('High overall quality');
  }
  
  // Authenticity bonus
  if (scores.authenticity > 70) {
    engagementScore += 10;
    factors.push('Authentic voice detected');
  }
  
  let predictedEngagement: 'low' | 'medium' | 'high' | 'viral';
  let confidence: number;
  
  if (engagementScore >= 85) {
    predictedEngagement = 'viral';
    confidence = 0.75;
  } else if (engagementScore >= 65) {
    predictedEngagement = 'high';
    confidence = 0.80;
  } else if (engagementScore >= 45) {
    predictedEngagement = 'medium';
    confidence = 0.70;
  } else {
    predictedEngagement = 'low';
    confidence = 0.60;
  }
  
  return { predictedEngagement, confidence, factors };
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 40) return 'D';
  return 'F';
}

export { PLATFORM_SPECS, DIMENSION_WEIGHTS };
