#!/usr/bin/env npx tsx
/**
 * ACOS v6.1 Context Budget Tracker
 *
 * Source: claude-flow v3 context engineering patterns
 * Implements: Quality curve monitoring, budget enforcement, anti-drift detection
 *
 * Tracks context usage and warns when approaching limits
 */

import * as fs from 'fs';
import * as path from 'path';

// Context budget configuration (from claude-flow patterns)
const BUDGET_CONFIG = {
  // Quality curve thresholds
  quality_curve: {
    peak: { min: 0, max: 30 },        // 0-30% = peak quality
    good: { min: 30, max: 50 },       // 30-50% = good quality
    degrading: { min: 50, max: 70 },  // 50-70% = quality degrading
    refresh_trigger: 70               // 70%+ = trigger context refresh
  },

  // Budget allocation
  per_agent_budget: 0.3,              // 30% max per agent
  shared_memory_budget: 0.2,          // 20% for shared context
  total_session_limit: 0.7,           // 70% before warning

  // Anti-drift checkpoints
  checkpoints: [
    'after_research',
    'after_first_draft',
    'every_500_words',
    'before_publish'
  ]
};

// State file for tracking across calls
const STATE_FILE = path.join(process.env.HOME || '', '.claude', 'acos', 'context-state.json');

interface ContextState {
  session_id: string;
  start_time: number;
  tool_calls: number;
  estimated_tokens: number;
  checkpoints_hit: string[];
  last_checkpoint: string | null;
  drift_warnings: number;
  quality_phase: 'peak' | 'good' | 'degrading' | 'refresh';
}

function loadState(): ContextState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {
    // Ignore errors, return fresh state
  }

  return {
    session_id: Date.now().toString(),
    start_time: Date.now(),
    tool_calls: 0,
    estimated_tokens: 0,
    checkpoints_hit: [],
    last_checkpoint: null,
    drift_warnings: 0,
    quality_phase: 'peak'
  };
}

function saveState(state: ContextState): void {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    // Ignore errors
  }
}

function estimateTokens(toolName: string, inputSize: number): number {
  // Rough token estimates by tool type
  const toolMultipliers: Record<string, number> = {
    'Read': 0.5,      // File content
    'Write': 0.3,     // Output only
    'Edit': 0.2,      // Small changes
    'Bash': 0.4,      // Command output
    'Task': 1.5,      // Subagent context
    'Grep': 0.3,      // Search results
    'Glob': 0.1,      // File lists
    'WebFetch': 1.0,  // Web content
    'WebSearch': 0.5, // Search results
  };

  const multiplier = toolMultipliers[toolName] || 0.5;
  return Math.round(inputSize * multiplier / 4); // Rough char-to-token ratio
}

function determineQualityPhase(usagePercent: number): ContextState['quality_phase'] {
  const { quality_curve } = BUDGET_CONFIG;

  if (usagePercent < quality_curve.peak.max) return 'peak';
  if (usagePercent < quality_curve.good.max) return 'good';
  if (usagePercent < quality_curve.degrading.max) return 'degrading';
  return 'refresh';
}

function checkForDrift(state: ContextState, currentTask: string): boolean {
  // Simple drift detection: if we've been working for a while without checkpoints
  const timeSinceStart = Date.now() - state.start_time;
  const minutesElapsed = timeSinceStart / (1000 * 60);

  // Warning signs of drift:
  // 1. More than 20 tool calls without checkpoint
  // 2. More than 15 minutes without checkpoint
  // 3. Quality phase is degrading or refresh

  if (state.tool_calls > 20 && state.checkpoints_hit.length === 0) {
    return true;
  }

  if (minutesElapsed > 15 && state.checkpoints_hit.length === 0) {
    return true;
  }

  if (state.quality_phase === 'degrading' || state.quality_phase === 'refresh') {
    return true;
  }

  return false;
}

function formatOutput(state: ContextState, driftDetected: boolean): string {
  const lines: string[] = [];

  // Quality phase indicator
  const phaseEmoji = {
    peak: '',
    good: '',
    degrading: '',
    refresh: ''
  };

  lines.push(`Context checkpoint: ${phaseEmoji[state.quality_phase]} Quality phase: ${state.quality_phase.toUpperCase()}`);

  if (state.quality_phase === 'degrading') {
    lines.push('Context quality degrading. Consider summarizing progress.');
  }

  if (state.quality_phase === 'refresh') {
    lines.push('REFRESH RECOMMENDED: Context at limit. Spawn fresh context or /clear.');
  }

  if (driftDetected) {
    lines.push('DRIFT WARNING: Task may be diverging. Review original goal.');
    state.drift_warnings++;
  }

  return lines.join('\n');
}

async function main() {
  // Get tool info from environment (set by Claude Code hooks)
  const toolName = process.env.TOOL_NAME || 'unknown';
  const toolInput = process.env.TOOL_INPUT || '';

  // Load state
  const state = loadState();

  // Update state
  state.tool_calls++;
  state.estimated_tokens += estimateTokens(toolName, toolInput.length);

  // Estimate usage percent (assume 100k context window)
  const usagePercent = (state.estimated_tokens / 100000) * 100;
  state.quality_phase = determineQualityPhase(usagePercent);

  // Check for drift
  const driftDetected = checkForDrift(state, toolInput);

  // Save state
  saveState(state);

  // Output
  console.log(formatOutput(state, driftDetected));
}

main().catch(console.error);
