#!/usr/bin/env node

// NLAH Artifact Manager — Stop hook
// Seals artifact manifests when a contracted skill session ends.
// Reads active contract from .acos/artifacts/_active-contract.json,
// verifies required outputs, writes the final manifest, and clears active state.

const fs = require('fs');
const path = require('path');

const ACOS_DIR = path.join(process.cwd(), '.acos', 'artifacts');
const ACTIVE_FILE = path.join(ACOS_DIR, '_active-contract.json');
const BUDGET_FILE = path.join(ACOS_DIR, '_budget-state.json');

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

  const outputs = (contract.contract?.['required-outputs'] || []).map(o => {
    const result = { name: o.name, type: o.type, optional: o.optional || false };
    if (o.pattern) {
      const resolved = o.pattern;
      result.path = resolved;
      try {
        result.exists = fs.existsSync(path.join(process.cwd(), resolved));
        if (result.exists) {
          const stat = fs.statSync(path.join(process.cwd(), resolved));
          result.size_bytes = stat.size;
        }
      } catch {
        result.exists = false;
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

  // Update the index
  const indexPath = path.join(ACOS_DIR, '_index.json');
  let index = [];
  try {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } catch {}
  index.push({
    skill: contract.skill,
    session_id: contract.sessionId,
    status: manifest.status,
    completed_at: manifest.completed_at,
    state_dir: stateDir,
  });
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  // Clear active state
  try { fs.unlinkSync(ACTIVE_FILE); } catch {}
  try { fs.unlinkSync(BUDGET_FILE); } catch {}

  console.log(`[NLAH] Sealed artifact manifest: ${manifest.status} (${outputs.filter(o => o.exists).length}/${outputs.length} outputs)`);
}

main();
