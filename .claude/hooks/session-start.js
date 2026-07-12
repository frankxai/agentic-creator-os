#!/usr/bin/env node
'use strict';

/**
 * ACOS Session Start Hook
 * - Creates active trajectory for the session
 * - Checks reasoning bank for similar past trajectories
 * - Returns context with suggestions and skill profile hints
 */

const fs = require('fs');
const path = require('path');

// Trajectories belong to the PROJECT being worked on, not the plugin install
// dir — keep in sync across all ACOS hooks.
const TRAJ_DIR = path.join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), '.claude', 'trajectories');
const ACTIVE_META = path.join(TRAJ_DIR, '_active.json');
const ACTIVE_OPS = path.join(TRAJ_DIR, '_operations.jsonl');
const PROFILES_DIR = path.join(__dirname, '..', 'skills', 'profiles');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadCompletedTrajectories(limit = 20) {
  ensureDir(TRAJ_DIR);
  return fs.readdirSync(TRAJ_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('_') && f !== 'patterns.json')
    .slice(-limit)
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(TRAJ_DIR, f), 'utf-8')); }
      catch { return null; }
    })
    .filter(Boolean);
}

function loadPatterns() {
  const pf = path.join(TRAJ_DIR, 'patterns.json');
  if (!fs.existsSync(pf)) return [];
  try { return JSON.parse(fs.readFileSync(pf, 'utf-8')); }
  catch { return []; }
}

function getRecentStats(trajectories) {
  if (trajectories.length === 0) return null;
  const recent = trajectories.slice(-10);
  const avgSuccess = recent.reduce((s, t) => s + (t.successScore || 0), 0) / recent.length;
  const types = {};
  recent.forEach(t => {
    const type = t.type || 'unknown';
    if (!types[type]) types[type] = 0;
    types[type]++;
  });
  return {
    total: trajectories.length,
    recentAvgSuccess: (avgSuccess * 100).toFixed(0),
    topTypes: Object.entries(types).sort((a, b) => b[1] - a[1]).slice(0, 3)
  };
}

function getActiveProfiles() {
  if (!fs.existsSync(PROFILES_DIR)) return [];
  return fs.readdirSync(PROFILES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(PROFILES_DIR, f), 'utf-8'));
        return d.name || f.replace('.json', '');
      } catch { return null; }
    })
    .filter(Boolean);
}

function main() {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf-8'));
    const sessionId = input.session_id || `session_${Date.now()}`;
    const source = input.source || 'startup';

    ensureDir(TRAJ_DIR);

    // Create active trajectory
    const trajectory = {
      id: `traj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sessionId,
      source,
      startedAt: new Date().toISOString(),
      promptCount: 0,
      toolCount: 0,
      filesModified: [],
      type: 'auto',
      task: null // Set from first meaningful prompt
    };

    fs.writeFileSync(ACTIVE_META, JSON.stringify(trajectory, null, 2));
    // Clear operations log
    fs.writeFileSync(ACTIVE_OPS, '');

    // Build context
    const ctx = [];
    const trajectories = loadCompletedTrajectories();
    const patterns = loadPatterns();
    const stats = getRecentStats(trajectories);
    const profiles = getActiveProfiles();

    // Telemetry-only: this hook records session context; it must never inject
    // behavioral directives (output styles, formats) into the conversation.

    // Add trajectory learning context
    const projectName = path.basename(process.env.CLAUDE_PROJECT_DIR || 'unknown');
    ctx.push(`# [${projectName}] recent context, ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`);
    ctx.push('');

    if (stats) {
      ctx.push(`ACOS Learning: ${stats.total} past trajectories, ${stats.recentAvgSuccess}% avg success.`);
      if (stats.topTypes.length > 0) {
        ctx.push(`Recent work: ${stats.topTypes.map(([t, c]) => `${t}(${c})`).join(', ')}`);
      }
    } else {
      ctx.push('No previous sessions found for this project yet.');
    }

    if (patterns.length > 0) {
      const top = patterns.sort((a, b) => (b.avgSuccess || 0) - (a.avgSuccess || 0)).slice(0, 3);
      ctx.push(`\nTop patterns: ${top.map(p => `"${p.sequence}" (${(p.avgSuccess * 100).toFixed(0)}% success, ${p.count}x)`).join('; ')}`);
    }

    const output = {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: ctx.join('\n')
      }
    };

    console.log(JSON.stringify(output));
    process.exit(0);
  } catch (err) {
    // Silent fail - don't break session
    process.exit(0);
  }
}

main();
