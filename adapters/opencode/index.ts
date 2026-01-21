/**
 * OpenCode Integration Adapter
 * 
 * Provides OpenCode-specific adaptations including:
 * - Session source detection
 * - OpenCode-specific skill triggers
 * - OpenCode command patterns
 * - Integration with OpenCode's MCP system
 */

import { logSession, createEvaluationLogger } from '../logging/audit.js';

// Detect if running in OpenCode
export function isOpenCode(): boolean {
  // Check environment variable
  if (process.env.OPENCODE_SESSION === 'true') {
    return true;
  }
  
  // Check process.argv for OpenCode indicators
  if (process.argv.some(arg => arg.includes('opencode'))) {
    return true;
  }
  
  // Check for OpenCode-specific environment
  if (process.env.IDE_TYPE === 'opencode' || process.env.VSCODE_PID?.toString().includes('opencode')) {
    return true;
  }
  
  return false;
}

// Get current session source
export function getSessionSource(): 'claude-code' | 'opencode' | 'gemini' | 'custom' {
  if (isOpenCode()) {
    return 'opencode';
  }
  
  // Check for other IDEs
  if (process.env.CLAUDE_CODE === 'true') {
    return 'claude-code';
  }
  
  if (process.env.GEMINI_CLI === 'true') {
    return 'gemini';
  }
  
  return 'custom';
}

// OpenCode-specific command patterns
export const OPENCODE_PATTERNS = {
  // Skill triggers
  skill: /^skill:(\w+)(?:,\s*(.+))?/i,
  
  // Workflow triggers  
  workflow: /^run\s+(\w+(?:-\w+)*)(?:\s+for\s+(.+))?/i,
  
  // Evaluation triggers
  evaluate: /^(?:evaluate|check|score)\s+(?:this\s+)?(.+)/i,
  
  // Template triggers
  template: /^use\s+(\w+(?:-\w+)*)\s+template(?:\s+for\s+(.+))?/i,
};

// Parse OpenCode commands
export function parseOpenCodeCommand(input: string): {
  type: 'skill' | 'workflow' | 'evaluate' | 'template' | 'unknown';
  action: string;
  params: Record<string, string>;
} {
  // Check skill pattern
  const skillMatch = input.match(OPENCODE_PATTERNS.skill);
  if (skillMatch) {
    return {
      type: 'skill',
      action: skillMatch[1],
      params: {
        prompt: skillMatch[2] || '',
      },
    };
  }
  
  // Check workflow pattern
  const workflowMatch = input.match(OPENCODE_PATTERNS.workflow);
  if (workflowMatch) {
    return {
      type: 'workflow',
      action: workflowMatch[1],
      params: {
        context: workflowMatch[2] || '',
      },
    };
  }
  
  // Check evaluate pattern
  const evaluateMatch = input.match(OPENCODE_PATTERNS.evaluate);
  if (evaluateMatch) {
    return {
      type: 'evaluate',
      action: 'content',
      params: {
        content: evaluateMatch[1],
      },
    };
  }
  
  // Check template pattern
  const templateMatch = input.match(OPENCODE_PATTERNS.template);
  if (templateMatch) {
    return {
      type: 'template',
      action: templateMatch[1],
      params: {
        context: templateMatch[2] || '',
      },
    };
  }
  
  return {
    type: 'unknown',
    action: input,
    params: {},
  };
}

// OpenCode-specific logger
export function createOpenCodeLogger(sessionId: string, projectId: string) {
  return createEvaluationLogger('opencode');
}

// OpenCode skill mappings
export const OPENCODE_SKILL_MAPPINGS: Record<string, string> = {
  // Content skills
  'create': 'content',
  'write': 'content',
  'draft': 'content',
  
  // Marketing skills
  'market': 'marketing',
  'promote': 'marketing',
  'distribute': 'marketing',
  
  // Development skills
  'build': 'dev',
  'create website': 'dev',
  'deploy': 'dev',
  
  // Design skills
  'design': 'design',
  'visual': 'design',
  
  // Business skills
  'analyze': 'business',
  'audit': 'business',
  'plan': 'business',
};

// Map OpenCode commands to skills
export function mapToSkill(command: string): string | null {
  const normalized = command.toLowerCase().trim();
  
  for (const [pattern, skill] of Object.entries(OPENCODE_SKILL_MAPPINGS)) {
    if (normalized.includes(pattern)) {
      return skill;
    }
  }
  
  return null;
}

// OpenCode-specific session management
let currentSessionId: string | null = null;
let currentProjectId: string | null = null;

export function initializeSession(sessionId: string, projectId: string): void {
  currentSessionId = sessionId;
  currentProjectId = projectId;
  
  // Log session start
  if (isOpenCode()) {
    logSession({
      sessionId,
      project: projectId,
      source: 'opencode',
      action: 'start',
    });
  }
}

export function endSession(): void {
  if (currentSessionId && currentProjectId) {
    logSession({
      sessionId: currentSessionId,
      project: currentProjectId,
      source: 'opencode',
      action: 'end',
    });
    
    currentSessionId = null;
    currentProjectId = null;
  }
}

// OpenCode context provider
export interface OpenCodeContext {
  sessionId: string | null;
  projectId: string | null;
  source: 'opencode';
  isOpenCode: boolean;
}

export function getOpenCodeContext(): OpenCodeContext {
  return {
    sessionId: currentSessionId,
    projectId: currentProjectId,
    source: 'opencode',
    isOpenCode: isOpenCode(),
  };
}

// Process OpenCode input and route to appropriate handler
export async function processOpenCodeInput(
  input: string,
  handlers: {
    skill?: (skill: string, params: Record<string, string>) => Promise<any>;
    workflow?: (workflow: string, params: Record<string, string>) => Promise<any>;
    evaluate?: (content: string) => Promise<any>;
    template?: (template: string, params: Record<string, string>) => Promise<any>;
    unknown?: (input: string) => Promise<any>;
  }
): Promise<any> {
  const parsed = parseOpenCodeCommand(input);
  
  switch (parsed.type) {
    case 'skill':
      if (handlers.skill) {
        return handlers.skill(parsed.action, parsed.params);
      }
      break;
      
    case 'workflow':
      if (handlers.workflow) {
        return handlers.workflow(parsed.action, parsed.params);
      }
      break;
      
    case 'evaluate':
      if (handlers.evaluate) {
        return handlers.evaluate(parsed.params.content);
      }
      break;
      
    case 'template':
      if (handlers.template) {
        return handlers.template(parsed.action, parsed.params);
      }
      break;
      
    default:
      if (handlers.unknown) {
        return handlers.unknown(input);
      }
  }
  
  return null;
}
