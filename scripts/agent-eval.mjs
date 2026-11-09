#!/usr/bin/env node
/**
 * Agent OS eval harness v2 script.
 * Fresh-session execution context, cross-family grading validation,
 * RESULTS.md parsing, and regression gate checking.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_RESULTS_PATH = join(ROOT, 'evals', 'agents', 'RESULTS.md');

export function normalizeModelFamily(family) {
  if (!family) return 'unknown';
  const f = String(family).toLowerCase().trim();
  if (/anthropic|claude|opus|sonnet|haiku/.test(f)) return 'anthropic';
  if (/openai|codex|gpt/.test(f)) return 'openai';
  if (/google|gemini/.test(f)) return 'google';
  if (/meta|llama/.test(f)) return 'meta';
  if (/mistral/.test(f)) return 'mistral';
  return f;
}

export function validateCrossFamily(runnerFamily, graderFamily) {
  const r = normalizeModelFamily(runnerFamily);
  const g = normalizeModelFamily(graderFamily);
  if (r === 'unknown' || g === 'unknown') return { valid: false, reason: `Unrecognized model family: runner="${runnerFamily}", grader="${graderFamily}"` };
  if (r === g) return { valid: false, reason: `Runner and grader are both from model family '${r}'. Cross-family grading requires different model families.` };
  return { valid: true, runnerFamily: r, graderFamily: g };
}

export function parseScore(scoreStr) {
  if (scoreStr === null || scoreStr === undefined) return null;
  if (typeof scoreStr === 'number') return Number.isNaN(scoreStr) ? null : { score: scoreStr <= 1 ? scoreStr : scoreStr / 100, raw: `${scoreStr}` };
  const s = String(scoreStr).trim();
  if (/not graded/i.test(s)) return null;
  const frac = s.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (frac && parseFloat(frac[2]) > 0) return { score: parseFloat(frac[1]) / parseFloat(frac[2]), raw: `${frac[1]}/${frac[2]}` };
  const pct = s.match(/^(\d+(?:\.\d+)?)%/);
  if (pct) return { score: parseFloat(pct[1]) / 100, raw: `${pct[1]}%` };
  const num = s.match(/^(\d+(?:\.\d+)?)/);
  if (num) { const v = parseFloat(num[1]); return { score: v <= 1 ? v : v / 100, raw: v <= 1 ? `${v}` : `${v}%` }; }
  return null;
}

export function normalizeCaseName(caseName) {
  return caseName ? caseName.replace(/\s*\([^)]*\)/g, '').trim() : '';
}

export function parseResultsTable(mdContent) {
  if (!mdContent) return [];
  const entries = [];
  for (const line of mdContent.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) continue;
    const cols = line.split('|').map((c) => c.trim()).slice(1, -1);
    if (cols.length < 6) continue;
    const [date, agent, rawCase, instructions, runner, rawScore, notes = ''] = cols;
    if (date.startsWith('---') || date.toLowerCase() === 'date') continue;
    const parsed = parseScore(rawScore);
    entries.push({ date, agent, rawCase, caseName: normalizeCaseName(rawCase), instructions, runner, scoreText: rawScore, scoreObj: parsed, score: parsed ? parsed.score : null, notes });
  }
  return entries;
}

export function getLastPassingScores(mdContent) {
  const lastScores = new Map();
  for (const e of parseResultsTable(mdContent)) {
    if (!e.agent || !e.caseName || e.score === null) continue;
    const key = `${e.agent}:${e.caseName}`;
    const existing = lastScores.get(key);
    if (!existing || e.score >= existing.score) lastScores.set(key, { agent: e.agent, caseName: e.caseName, score: e.score, raw: e.scoreText, date: e.date, instructions: e.instructions });
  }
  return lastScores;
}

export function getLatestCandidateScores(mdContent) {
  const latestScores = new Map();
  for (const e of parseResultsTable(mdContent)) {
    if (!e.agent || !e.caseName || e.score === null) continue;
    latestScores.set(`${e.agent}:${e.caseName}`, { agent: e.agent, caseName: e.caseName, score: e.scoreText, scoreObj: e.scoreObj, raw: e.scoreText });
  }
  return Array.from(latestScores.values());
}

export function checkRegression(lastScoresMap, candidateScores) {
  const regressions = [], checked = [];
  for (const item of candidateScores) {
    const key = `${item.agent}:${normalizeCaseName(item.caseName)}`;
    const cand = parseScore(typeof item.score === 'number' ? `${item.score}` : item.score);
    if (!cand) continue;
    const base = lastScoresMap.get(key);
    if (base) {
      checked.push({ key, baseline: base.score, candidate: cand.score });
      if (cand.score < base.score - 1e-6) regressions.push({ agent: item.agent, caseName: item.caseName, baselineScore: base.score, baselineRaw: base.raw, candidateScore: cand.score, candidateRaw: cand.raw, diff: base.score - cand.score });
    }
  }
  return { pass: regressions.length === 0, regressions, checked };
}

export function runFreshSession(agentId, caseName, options = {}) {
  const rootDir = options.rootDir || ROOT;
  const specPath = join(rootDir, 'agent-os', 'specs', `${agentId}.agent.json`);
  const promptPath = join(rootDir, 'evals', 'agents', agentId, caseName, 'prompt.md');
  if (!existsSync(specPath)) throw new Error(`Agent spec not found: ${specPath}`);
  if (!existsSync(promptPath)) throw new Error(`Eval case prompt not found: ${promptPath}`);
  const r = spawnSync(process.execPath, ['-e', `
    const fs = require('fs');
    const spec = JSON.parse(fs.readFileSync(${JSON.stringify(specPath)}, 'utf8'));
    const prompt = fs.readFileSync(${JSON.stringify(promptPath)}, 'utf8');
    console.log(JSON.stringify({ freshSession: true, agent: spec.id, caseName: ${JSON.stringify(caseName)}, specVersion: spec.version, promptLength: prompt.length }));
  `], { cwd: rootDir, encoding: 'utf8', env: { ...process.env, ...options.env } });
  if (r.status !== 0) throw new Error(`Fresh session execution failed: ${r.stderr}`);
  return JSON.parse(r.stdout.trim());
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  const resPath = flag('--results') || DEFAULT_RESULTS_PATH;

  if (args.includes('--verify-cross-family')) {
    const res = validateCrossFamily(flag('--runner'), flag('--grader'));
    if (!res.valid) { console.error(`✗ Cross-family grading check failed: ${res.reason}`); process.exit(1); }
    console.log(`✓ Cross-family grading check passed: runner family '${res.runnerFamily}' vs grader family '${res.graderFamily}'`);
    process.exit(0);
  }

  if (args.includes('--check-regression') || args.includes('--gate')) {
    if (!existsSync(resPath)) { console.error(`✗ Results file not found: ${resPath}`); process.exit(1); }
    const md = readFileSync(resPath, 'utf8');
    const inputScores = flag('--scores');
    let candidate = inputScores ? JSON.parse(inputScores) : getLatestCandidateScores(md);
    const reg = checkRegression(getLastPassingScores(md), candidate);
    if (!reg.pass) {
      console.error(`✗ REGRESSION GATE FAILED: ${reg.regressions.length} regression(s) detected:`);
      for (const r of reg.regressions) console.error(`  - ${r.agent}/${r.caseName}: score dropped from ${r.baselineRaw} to ${r.candidateRaw}`);
      process.exit(1);
    }
    console.log(`✓ REGRESSION GATE PASSED: ${reg.checked.length} case(s) maintained or improved score.`);
    process.exit(0);
  }

  const agent = flag('--run');
  if (agent) {
    const caseName = flag('--case') || 'default';
    const crossCheck = validateCrossFamily(flag('--runner') || 'anthropic', flag('--grader') || 'openai');
    if (!crossCheck.valid) { console.error(`✗ ${crossCheck.reason}`); process.exit(1); }
    const res = runFreshSession(agent, caseName, { rootDir: ROOT });
    console.log(`✓ Fresh session run completed for ${agent}/${caseName}:`, res);
    process.exit(0);
  }

  console.log('Usage: node scripts/agent-eval.mjs [--check-regression|--verify-cross-family|--run <agent>]');
  process.exit(0);
}
