#!/usr/bin/env node

// NLAH Artifact Manager — Stop hook
// Seals artifact manifests when a contracted skill session ends.
// Reads active contract from .acos/artifacts/_active-contract-{sid}.json,
// verifies required outputs (with glob support), writes the final manifest,
// and clears active state.

const fs = require('fs');
const path = require('path');

const ACOS_DIR = path.join(process.cwd(), '.acos', 'artifacts');
const SESSION_ID = process.env.ACOS_SESSION_ID || process.env.CLAUDE_SESSION_ID || 'default';
const ACTIVE_FILE = path.join(ACOS_DIR, `_active-contract-${SESSION_ID}.json`);
const BUDGET_FILE = path.join(ACOS_DIR, `_budget-state-${SESSION_ID}.json`);

function globMatch(pattern, cwd) {
  if (!pattern.includes('*') && !pattern.includes('?')) {
    const full = path.join(cwd, pattern);
    if (fs.existsSync(full)) {
      const stat = fs.statSync(full);
      return [{ path: pattern, size: stat.size }];
    }
    return [];
  }

  const parts = pattern.split('/');
  let dirs = [cwd];
  let relPaths = [''];

  for (const part of parts) {
    const nextDirs = [];
    const nextRels = [];
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      const rel = relPaths[i];
      if (!fs.existsSync(dir)) continue;
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
      catch { continue; }
      for (const entry of entries) {
        if (matchSegment(part, entry.name)) {
          nextDirs.push(path.join(dir, entry.name));
          nextRels.push(rel ? `${rel}/${entry.name}` : entry.name);
        }
      }
    }
    dirs = nextDirs;
    relPaths = nextRels;
  }

  return dirs.map((d, i) => {
    try {
      const stat = fs.statSync(d);
      return { path: relPaths[i], size: stat.size };
    } catch { return null; }
  }).filter(Boolean);
}

function matchSegment(pattern, name) {
  if (pattern === '*') return true;
  const re = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
  return re.test(name);
}

function main() {
  if (!fs.existsSync(ACTIVE_FILE)) {
    process.exit(0);
  }

  let contract;
  try {
    contract = JSON.parse(fs.readFileSync(ACTIVE_FILE, 'utf8'));
  } catch {
    process.exit(0);
  }

  const stateDir = contract.stateDir;
  if (!stateDir || !fs.existsSync(stateDir)) {
    process.exit(0);
  }

  let budget = { tool_calls: 0, file_edits: 0, child_agents: 0 };
  try {
    budget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
  } catch {}

  const cwd = process.cwd();
  const outputs = (contract.contract?.['required-outputs'] || []).map(o => {
    const result = { name: o.name, type: o.type, optional: o.optional || false };
    if (o.pattern) {
      result.path = o.pattern;
      const matches = globMatch(o.pattern, cwd);
      result.exists = matches.length > 0;
      if (result.exists) {
        result.matched_files = matches.map(m => m.path);
        result.size_bytes = matches.reduce((sum, m) => sum + m.size, 0);
      }
    } else {
      const artifactPath = path.join(stateDir, 'outputs', o.name);
      result.exists = fs.existsSync(artifactPath);
      if (result.exists) {
        try {
          result.size_bytes = fs.statSync(artifactPath).size;
        } catch {}
      }
    }
    return result;
  });

  const requiredMet = outputs
    .filter(o => !o.optional)
    .every(o => o.exists);

  const budgetLimits = contract.contract?.budget || {};
  const manifest = {
    skill: contract.skill,
    session_id: contract.sessionId,
    contract_version: '1.0',
    started_at: budget.started_at || null,
    completed_at: new Date().toISOString(),
    status: requiredMet ? 'completed' : 'partial',
    required_outputs: outputs,
    completion_conditions_met: requiredMet,
    budget_usage: {
      tool_calls: {
        used: budget.tool_calls || 0,
        limit: budgetLimits['max-tool-calls'] || null,
      },
      file_edits: {
        used: budget.file_edits || 0,
        limit: budgetLimits['max-file-edits'] || null,
      },
      child_agents: {
        used: budget.child_agents || 0,
        limit: budgetLimits['max-child-agents'] || null,
      },
    },
    parent_session: null,
    child_sessions: [],
  };

  const manifestPath = path.join(stateDir, contract.contract?.artifacts?.manifest || 'artifact-manifest.json');
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const indexPath = path.join(ACOS_DIR, '_index.json');
  let index = [];
  try {
    const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    if (Array.isArray(data)) {
      index = data;
    }
  } catch {}
  index.push({
    skill: contract.skill,
    session_id: contract.sessionId,
    status: manifest.status,
    completed_at: manifest.completed_at,
    state_dir: stateDir,
  });
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  try { fs.unlinkSync(ACTIVE_FILE); } catch {}
  try { fs.unlinkSync(BUDGET_FILE); } catch {}

  console.log(`[NLAH] Sealed artifact manifest: ${manifest.status} (${outputs.filter(o => o.exists).length}/${outputs.length} outputs)`);
}

main();
