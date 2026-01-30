#!/usr/bin/env npx tsx
/**
 * ACOS v6.1 Skill Activation Hook
 *
 * Source: diet103/claude-code-infrastructure-showcase pattern
 * Implements: Confidence scoring, model routing, enforcement types
 *
 * Runs on UserPromptSubmit to detect and suggest relevant skills
 */

import * as readline from 'readline';

// Scoring weights (from claude-flow & diet103 patterns)
const SCORING_WEIGHTS = {
  keyword: 2,
  keywordPattern: 3,
  pathPattern: 4,
  directoryMatch: 5,
  intentPattern: 4,
  contentPattern: 5,
  commandTrigger: 6
};

// Confidence threshold for activation
const CONFIDENCE_THRESHOLD = 4;

// Model routing configuration
const MODEL_ROUTING = {
  haiku_keywords: ['status', 'check', 'list', 'deploy', 'format', 'lint'],
  haiku_commands: ['/mcp-status', '/inventory-status', '/nextjs-deploy', '/publish'],
  sonnet_keywords: ['write', 'create', 'implement', 'fix', 'build', 'test', 'article', 'music'],
  opus_keywords: ['architect', 'design', 'strategy', 'council', 'enterprise', 'complex', 'research', 'plan']
};

// Skill definitions with triggers
interface SkillDefinition {
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  model: 'haiku' | 'sonnet' | 'opus' | 'inherit';
  keywords: string[];
  intentPatterns: RegExp[];
  commandTriggers: string[];
  enforcement: 'always' | 'block' | 'warn' | 'suggest';
}

const SKILLS: SkillDefinition[] = [
  {
    name: 'model-routing',
    priority: 'critical',
    model: 'inherit',
    keywords: ['model', 'routing', 'cost', 'optimize', 'haiku', 'sonnet', 'opus'],
    intentPatterns: [/(which|what).*model/, /(optimize|reduce).*cost/],
    commandTriggers: [],
    enforcement: 'always'
  },
  {
    name: 'suno-ai-mastery',
    priority: 'high',
    model: 'sonnet',
    keywords: ['music', 'suno', 'track', 'song', 'lyrics', 'melody', 'beat', 'frequency', 'hz', 'audio'],
    intentPatterns: [/(create|make|produce|write).*(music|song|track)/, /(generate|craft).*lyrics/],
    commandTriggers: ['/create-music'],
    enforcement: 'suggest'
  },
  {
    name: 'content-strategy',
    priority: 'high',
    model: 'sonnet',
    keywords: ['blog', 'article', 'content', 'post', 'newsletter', 'seo', 'publish'],
    intentPatterns: [/(write|create|draft).*(blog|article|post)/, /(plan|strategy).*content/],
    commandTriggers: ['/article-creator', '/factory', '/publish'],
    enforcement: 'suggest'
  },
  {
    name: 'starlight-architecture',
    priority: 'critical',
    model: 'opus',
    keywords: ['architect', 'enterprise', 'system design', 'oracle', 'infrastructure', 'multi-agent'],
    intentPatterns: [/(design|architect|plan).*(system|architecture|infrastructure)/, /enterprise.*ai/i],
    commandTriggers: ['/starlight-architect'],
    enforcement: 'warn'
  },
  {
    name: 'council-deliberation',
    priority: 'critical',
    model: 'opus',
    keywords: ['council', 'deliberate', 'perspectives', 'should i', 'decision', 'strategy'],
    intentPatterns: [/(should|what|how).*(i|we).*(do|choose|decide)/, /multiple.*perspectives/],
    commandTriggers: ['/council'],
    enforcement: 'suggest'
  },
  {
    name: 'nextjs-react-expert',
    priority: 'high',
    model: 'sonnet',
    keywords: ['nextjs', 'react', 'component', 'page', 'route', 'server component', 'app router'],
    intentPatterns: [/(create|build|implement).*(component|page|route)/, /next.*js/i],
    commandTriggers: ['/nextjs-deploy', '/spec'],
    enforcement: 'suggest'
  },
  {
    name: 'spec-driven-development',
    priority: 'high',
    model: 'sonnet',
    keywords: ['spec', 'requirements', 'design doc', 'implementation plan', 'feature'],
    intentPatterns: [/(implement|build|create).*feature/, /(plan|design).*implementation/],
    commandTriggers: ['/spec'],
    enforcement: 'suggest'
  },
  {
    name: 'planning-with-files',
    priority: 'high',
    model: 'sonnet',
    keywords: ['plan', 'task', 'breakdown', 'implement', 'complex task', 'multi-step'],
    intentPatterns: [/(plan|break.*down|organize).*task/, /complex.*implementation/],
    commandTriggers: ['/planning-with-files'],
    enforcement: 'suggest'
  },
  {
    name: 'security-auditor',
    priority: 'critical',
    model: 'sonnet',
    keywords: ['security', 'vulnerability', 'owasp', 'audit', 'penetration', 'cve', 'credential'],
    intentPatterns: [/(check|scan|audit).*security/, /(find|detect).*vulnerabilit/],
    commandTriggers: [],
    enforcement: 'warn'
  },
  {
    name: 'agentic-orchestration',
    priority: 'high',
    model: 'opus',
    keywords: ['swarm', 'multi-agent', 'orchestrate', 'coordinate', 'parallel agents', 'ultrawork', 'consensus'],
    intentPatterns: [/(coordinate|orchestrate).*agent/, /multi.*agent/, /parallel.*execution/],
    commandTriggers: ['/council', '/starlight-intelligence'],
    enforcement: 'suggest'
  },
  {
    name: 'ui-ux-design-expert',
    priority: 'medium',
    model: 'sonnet',
    keywords: ['design', 'ux', 'ui', 'interface', 'component', 'layout', 'responsive', 'accessibility'],
    intentPatterns: [/(design|create|improve).*interface/, /(ux|ui).*pattern/i],
    commandTriggers: ['/ux-design'],
    enforcement: 'suggest'
  },
  {
    name: 'excellence-book-writing',
    priority: 'medium',
    model: 'opus',
    keywords: ['book', 'chapter', 'manuscript', 'novel', 'narrative', 'character'],
    intentPatterns: [/(write|create|draft).*(book|chapter|novel)/, /character.*development/],
    commandTriggers: ['/author-team'],
    enforcement: 'suggest'
  },
  {
    name: 'social-media-strategy',
    priority: 'medium',
    model: 'sonnet',
    keywords: ['social', 'linkedin', 'twitter', 'instagram', 'farcaster', 'thread'],
    intentPatterns: [/(create|write|generate).*social/, /(post|share).*linkedin/],
    commandTriggers: ['/generate-social'],
    enforcement: 'suggest'
  },
  {
    name: 'mcp-architecture',
    priority: 'medium',
    model: 'sonnet',
    keywords: ['mcp', 'model context protocol', 'mcp server', 'tool integration'],
    intentPatterns: [/(create|build|implement).*mcp/i, /model.*context.*protocol/i],
    commandTriggers: ['/mcp-status', '/automation-dev'],
    enforcement: 'suggest'
  }
];

interface SkillMatch {
  skill: SkillDefinition;
  score: number;
  matchedKeywords: string[];
  matchedPatterns: string[];
}

function calculateSkillScore(prompt: string, skill: SkillDefinition): SkillMatch {
  const promptLower = prompt.toLowerCase();
  let score = 0;
  const matchedKeywords: string[] = [];
  const matchedPatterns: string[] = [];

  // Check keywords
  for (const keyword of skill.keywords) {
    if (promptLower.includes(keyword.toLowerCase())) {
      score += SCORING_WEIGHTS.keyword;
      matchedKeywords.push(keyword);
    }
  }

  // Check intent patterns
  for (const pattern of skill.intentPatterns) {
    if (pattern.test(promptLower)) {
      score += SCORING_WEIGHTS.intentPattern;
      matchedPatterns.push(pattern.toString());
    }
  }

  // Check command triggers
  for (const command of skill.commandTriggers) {
    if (promptLower.includes(command)) {
      score += SCORING_WEIGHTS.commandTrigger;
      matchedKeywords.push(command);
    }
  }

  // Always-active skills get boosted
  if (skill.enforcement === 'always') {
    score += 10;
  }

  return { skill, score, matchedKeywords, matchedPatterns };
}

function determineRecommendedModel(matches: SkillMatch[]): 'haiku' | 'sonnet' | 'opus' {
  // Check if any critical/high priority match requires opus
  for (const match of matches) {
    if (match.score >= CONFIDENCE_THRESHOLD && match.skill.model === 'opus') {
      return 'opus';
    }
  }

  // Check if any match requires sonnet
  for (const match of matches) {
    if (match.score >= CONFIDENCE_THRESHOLD && match.skill.model === 'sonnet') {
      return 'sonnet';
    }
  }

  return 'sonnet'; // Default
}

function formatOutput(matches: SkillMatch[], recommendedModel: string): string {
  const lines: string[] = [];

  // Group by priority
  const critical = matches.filter(m => m.score >= CONFIDENCE_THRESHOLD && m.skill.priority === 'critical');
  const high = matches.filter(m => m.score >= CONFIDENCE_THRESHOLD && m.skill.priority === 'high');
  const medium = matches.filter(m => m.score >= CONFIDENCE_THRESHOLD && m.skill.priority === 'medium');

  lines.push('SKILL SUGGESTIONS:');
  lines.push('');

  if (critical.length > 0) {
    for (const match of critical.slice(0, 2)) {
      const enforcement = match.skill.enforcement === 'warn' ? 'WARNING' : 'CRITICAL';
      lines.push(`${enforcement}: ${match.skill.name} (score: ${match.score}, model: ${match.skill.model})`);
    }
  }

  if (high.length > 0) {
    for (const match of high.slice(0, 2)) {
      lines.push(`Consider: ${match.skill.name}`);
    }
  }

  if (critical.length === 0 && high.length === 0 && medium.length > 0) {
    for (const match of medium.slice(0, 2)) {
      lines.push(`Consider: ${match.skill.name}`);
    }
  }

  return lines.join('\n');
}

async function main() {
  // Read prompt from stdin
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  let prompt = '';

  for await (const line of rl) {
    prompt += line + '\n';
  }

  prompt = prompt.trim();

  if (!prompt) {
    console.log('SKILL SUGGESTIONS:\n\nConsider: dev');
    return;
  }

  // Calculate scores for all skills
  const matches = SKILLS.map(skill => calculateSkillScore(prompt, skill))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score);

  // Determine recommended model
  const recommendedModel = determineRecommendedModel(matches);

  // Output suggestions
  console.log(formatOutput(matches, recommendedModel));
}

main().catch(console.error);
