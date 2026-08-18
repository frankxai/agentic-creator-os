#!/usr/bin/env node
'use strict';

/**
 * ACOS Stop Hook
 * - Finalizes active trajectory
 * - Scores outcomes from explicit artifact and verification evidence
 * - Extracts only verified patterns from operation sequences
 * - Saves to trajectories/ for reasoning bank
 */

const fs = require('fs');
const path = require('path');

const TRAJ_DIR = path.join(__dirname, '..', 'trajectories');
const ACTIVE_META = path.join(TRAJ_DIR, '_active.json');
const ACTIVE_OPS = path.join(TRAJ_DIR, '_operations.jsonl');
const PATTERNS_FILE = path.join(TRAJ_DIR, 'patterns.json');

function loadOperations() {
  if (!fs.existsSync(ACTIVE_OPS)) return [];
  const lines = fs.readFileSync(ACTIVE_OPS, 'utf-8').trim().split('\n').filter(Boolean);
  return lines.map(l => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
}

function detectType(meta, ops) {
  const tools = ops.map(o => o.t);
  const files = (meta.filesModified || []).join(' ').toLowerCase();
  const cmds = ops.filter(o => o.c).map(o => o.c).join(' ').toLowerCase();

  if (cmds.includes('git push') || cmds.includes('git commit')) return 'deployment';
  if (files.includes('content/blog') || files.includes('.mdx')) return 'content_creation';
  if (files.includes('app/') || files.includes('components/')) return 'code_development';
  if (cmds.includes('suno') || files.includes('music')) return 'music_production';
  if (files.includes('.claude/') || files.includes('agents/')) return 'skill_execution';
  return 'general';
}

function hasEvidence(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Evaluate whether a trajectory contains enough outcome evidence to teach the
 * reasoning bank. Tool count, file count, commits, and pushes are activity
 * signals only; they never prove correctness or user value.
 */
function evaluateOutcomeEvidence(meta, _ops = []) {
  const verification = meta.verification || {};
  const checks = Array.isArray(verification.checks) ? verification.checks : [];
  const failedChecks = checks.filter(check => check?.status === 'failed');
  const passedChecks = checks.filter(check =>
    check?.status === 'passed' && hasEvidence(check.evidence)
  );
  const artifactEvidence =
    (Array.isArray(meta.filesModified) && meta.filesModified.length > 0) ||
    (Array.isArray(meta.artifactPaths) && meta.artifactPaths.length > 0);
  const acceptancePassed =
    verification.acceptance?.status === 'passed' &&
    hasEvidence(verification.acceptance?.evidence);
  const verifierPassed =
    verification.independentVerifier?.verdict === 'pass' &&
    hasEvidence(verification.independentVerifier?.evidence);
  const independentRequired =
    verification.independentRequired === true ||
    ['high', 'critical'].includes(String(meta.riskLevel || '').toLowerCase());

  if (failedChecks.length > 0) {
    return {
      score: artifactEvidence ? 0.2 : 0.15,
      evidenceStatus: 'failed',
      eligibleForLearning: false,
      reasons: failedChecks.map(check => `failed:${check.name || 'unnamed-check'}`)
    };
  }

  let score = 0.1;
  if (artifactEvidence) score += 0.15;
  if (passedChecks.length > 0) score += 0.35;
  if (acceptancePassed) score += 0.15;
  if (verifierPassed) score += 0.15;
  score = Math.min(1, Number(score.toFixed(2)));

  const reasons = [];
  if (!artifactEvidence) reasons.push('missing-artifact-evidence');
  if (passedChecks.length === 0) reasons.push('missing-passed-check-evidence');
  if (independentRequired && !verifierPassed) reasons.push('missing-independent-verifier');

  if (independentRequired && !verifierPassed) {
    return {
      score: Math.min(score, 0.49),
      evidenceStatus: 'partial',
      eligibleForLearning: false,
      reasons
    };
  }

  const verified = artifactEvidence && passedChecks.length > 0;
  return {
    score,
    evidenceStatus: verified ? 'verified' : (checks.length > 0 ? 'partial' : 'unverified'),
    eligibleForLearning: verified && score >= 0.6,
    reasons
  };
}

function autoScore(meta, ops) {
  return evaluateOutcomeEvidence(meta, ops).score;
}

function buildSequence(ops) {
  // Build a simplified operation sequence for pattern matching
  const simplified = [];
  let lastTool = null;
  for (const op of ops) {
    if (op.t !== lastTool) {
      simplified.push(op.t);
      lastTool = op.t;
    }
  }
  // Keep only first 10 unique steps
  return simplified.slice(0, 10).join(' > ');
}

function extractPatterns(trajectory, ops) {
  const sequence = buildSequence(ops);
  if (!sequence || sequence.split(' > ').length < 2) return;

  let patterns = [];
  if (fs.existsSync(PATTERNS_FILE)) {
    try { patterns = JSON.parse(fs.readFileSync(PATTERNS_FILE, 'utf-8')); }
    catch { patterns = []; }
  }

  const existing = patterns.find(p => p.sequence === sequence);
  if (existing) {
    existing.count++;
    existing.avgSuccess = (existing.avgSuccess * (existing.count - 1) + trajectory.successScore) / existing.count;
    existing.lastSeen = new Date().toISOString();
  } else {
    patterns.push({
      sequence,
      type: trajectory.type,
      count: 1,
      avgSuccess: trajectory.successScore,
      discoveredAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    });
  }

  // Keep top 50 patterns
  patterns.sort((a, b) => (b.count * b.avgSuccess) - (a.count * a.avgSuccess));
  patterns = patterns.slice(0, 50);

  fs.writeFileSync(PATTERNS_FILE, JSON.stringify(patterns, null, 2));
}

function main() {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf-8'));

    // Don't re-finalize if already in a stop hook continuation
    if (input.stop_hook_active) {
      process.exit(0);
      return;
    }

    if (!fs.existsSync(ACTIVE_META)) {
      process.exit(0);
      return;
    }

    const meta = JSON.parse(fs.readFileSync(ACTIVE_META, 'utf-8'));
    const ops = loadOperations();

    // Skip trivial sessions (< 3 operations)
    if (ops.length < 3) {
      // Clean up without saving
      try { fs.unlinkSync(ACTIVE_META); } catch {}
      try { fs.unlinkSync(ACTIVE_OPS); } catch {}
      process.exit(0);
      return;
    }

    const outcome = evaluateOutcomeEvidence(meta, ops);

    // Finalize trajectory
    const trajectory = {
      ...meta,
      type: detectType(meta, ops),
      completedAt: new Date().toISOString(),
      duration: Date.now() - new Date(meta.startedAt).getTime(),
      operationCount: ops.length,
      successScore: outcome.score,
      evidenceStatus: outcome.evidenceStatus,
      eligibleForLearning: outcome.eligibleForLearning,
      evidenceReasons: outcome.reasons,
      toolBreakdown: {},
      critique: `Auto-finalized: evidence=${outcome.evidenceStatus}, learning=${outcome.eligibleForLearning ? 'eligible' : 'quarantined'}`
    };

    // Tool usage breakdown
    ops.forEach(op => {
      trajectory.toolBreakdown[op.t] = (trajectory.toolBreakdown[op.t] || 0) + 1;
    });

    // Save completed trajectory
    const filename = `${trajectory.type}_${trajectory.id}.json`;
    fs.writeFileSync(path.join(TRAJ_DIR, filename), JSON.stringify(trajectory, null, 2));

    // Extract patterns
    if (trajectory.eligibleForLearning) {
      extractPatterns(trajectory, ops);
    }

    // Clean up active files
    try { fs.unlinkSync(ACTIVE_META); } catch {}
    try { fs.unlinkSync(ACTIVE_OPS); } catch {}

    process.exit(0);
  } catch {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  autoScore,
  evaluateOutcomeEvidence
};
