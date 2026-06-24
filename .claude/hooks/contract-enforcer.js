#!/usr/bin/env node

// NLAH Contract Enforcer — PostToolUse hook
// Tracks budget usage against active skill contracts and emits warnings.
// Reads contract from .acos/artifacts/{skill}/_active-contract.json
// Writes budget state to .acos/artifacts/{skill}/_budget-state.json

const fs = require('fs');
const path = require('path');

const ACOS_DIR = path.join(process.cwd(), '.acos', 'artifacts');
const BUDGET_THRESHOLDS = { warning: 0.7, urgent: 0.9, exceeded: 1.0 };

function findActiveContract() {
  if (!fs.existsSync(ACOS_DIR)) return null;
  const activeFile = path.join(ACOS_DIR, '_active-contract.json');
  if (!fs.existsSync(activeFile)) return null;
  try {
    return JSON.parse(fs.readFileSync(activeFile, 'utf8'));
  } catch { return null; }
}

function readBudgetState(skillName) {
  const stateFile = path.join(ACOS_DIR, '_budget-state.json');
  if (!fs.existsSync(stateFile)) {
    return { tool_calls: 0, file_edits: 0, child_agents: 0, started_at: new Date().toISOString() };
  }
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    return { tool_calls: 0, file_edits: 0, child_agents: 0, started_at: new Date().toISOString() };
  }
}

function writeBudgetState(state) {
  const stateFile = path.join(ACOS_DIR, '_budget-state.json');
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function getToolFromEnv() {
  return process.env.CLAUDE_TOOL_NAME || 'unknown';
}

function checkBudget(used, limit, name) {
  if (!limit) return null;
  const ratio = used / limit;
  if (ratio >= BUDGET_THRESHOLDS.exceeded) {
    return `[BUDGET EXCEEDED] ${name}: ${used}/${limit} — finalize artifacts and stop`;
  }
  if (ratio >= BUDGET_THRESHOLDS.urgent) {
    return `[BUDGET URGENT] ${name}: ${used}/${limit} — wrap up immediately`;
  }
  if (ratio >= BUDGET_THRESHOLDS.warning) {
    return `[BUDGET WARNING] ${name}: ${used}/${limit} — prioritize remaining work`;
  }
  return null;
}

function main() {
  const contract = findActiveContract();
  if (!contract || !contract.budget) {
    process.exit(0);
  }

  const tool = getToolFromEnv();
  const state = readBudgetState(contract.skill);

  state.tool_calls += 1;

  if (tool === 'Write' || tool === 'Edit') {
    state.file_edits += 1;
  }
  if (tool === 'Agent' || tool === 'Task') {
    state.child_agents += 1;
  }

  writeBudgetState(state);

  const budget = contract.budget;
  const warnings = [
    checkBudget(state.tool_calls, budget['max-tool-calls'], 'tool-calls'),
    checkBudget(state.file_edits, budget['max-file-edits'], 'file-edits'),
    checkBudget(state.child_agents, budget['max-child-agents'], 'child-agents'),
  ].filter(Boolean);

  if (budget['timeout-minutes'] && state.started_at) {
    const elapsed = (Date.now() - new Date(state.started_at).getTime()) / 60000;
    const timeWarning = checkBudget(elapsed, budget['timeout-minutes'], 'timeout');
    if (timeWarning) warnings.push(timeWarning);
  }

  if (warnings.length > 0) {
    console.log(warnings.join('\n'));
  }
}

main();
