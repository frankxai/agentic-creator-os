#!/usr/bin/env node
'use strict';

/**
 * Omotenashi Kernel — SessionStart injection.
 *
 * The kernel doctrine already lives in CLAUDE.md. What it lacked was the
 * ba-wo-yomu half: an agent told to "read the actual state" still opens blind
 * and burns its first three turns orienting. This hook pre-satisfies that by
 * injecting live estate state at turn zero, so the first turn can build.
 *
 * Hard rules: never crash a session, never call the network, stay under ~300ms.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const HOME = os.homedir();
const STARLIGHT = path.join(HOME, 'starlight');

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

function hoursSince(iso) {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? Math.round((Date.now() - t) / 3600000) : null;
}

function git(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf-8', timeout: 2500, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch { return ''; }
}

/** A POSIX-style cwd (/c/Users/...) is not a path Node can chdir to on Windows. */
function resolveCwd(candidate) {
  const tries = [];
  if (candidate) {
    tries.push(candidate);
    const m = /^\/([a-zA-Z])\/(.*)$/.exec(candidate);
    if (m) tries.push(`${m[1].toUpperCase()}:\\${m[2].replace(/\//g, '\\')}`);
  }
  tries.push(process.cwd());
  return tries.find(p => { try { return fs.statSync(p).isDirectory(); } catch { return false; } }) || process.cwd();
}

/**
 * Where the session actually is, and how much uncommitted work is in front of it.
 *
 * Tracked-modified and untracked are reported separately on purpose. A single "1484 dirty"
 * on the estate root reads as 1484 edited files when the real number is 22 modified and
 * ~1463 never-added — a decision made on the merged figure is a decision made wrong.
 */
function worktreeLine(cwd) {
  const top = git(['rev-parse', '--show-toplevel'], cwd);
  if (!top) return null;

  const bits = [`${path.basename(top)} on ${git(['branch', '--show-current'], cwd) || 'DETACHED HEAD'}`];

  const modified = git(['status', '--porcelain', '--untracked-files=no'], cwd).split('\n').filter(Boolean).length;
  if (modified) bits.push(`${modified} modified`);

  const untracked = git(['ls-files', '--others', '--exclude-standard'], cwd).split('\n').filter(Boolean).length;
  if (untracked) bits.push(`${untracked} untracked`);

  if (git(['rev-parse', '--abbrev-ref', '@{u}'], cwd)) {
    const ahead = git(['rev-list', '--count', '@{u}..HEAD'], cwd);
    if (ahead && ahead !== '0') bits.push(`${ahead} unpushed`);
  } else {
    bits.push('NO UPSTREAM (local-only branch — deletable, push costs no CI)');
  }
  return bits.join(' · ');
}

/** Admission control: the estate opens ~4 PRs/day and merges ~0. */
function prBudgetLine() {
  const b = readJson(path.join(STARLIGHT, 'logs', 'digests', 'pr-budget.json'));
  if (!b) return 'PR budget: FILE MISSING — treat every repo as over budget.';
  const age = hoursSince(b.generatedAt);
  const stale = age === null || age > 48;
  const over = Object.entries(b.repos || {})
    .filter(([, v]) => v.overBudget)
    .sort((a, b2) => b2[1].open - a[1].open)
    .slice(0, 5)
    .map(([k, v]) => `${k}(${v.open})`);
  const head = `PR budget: ${b.totals?.open ?? '?'} open / ${b.totals?.drafts ?? '?'} draft across ${b.totals?.repos ?? '?'} repos, cap ${b.budget ?? 10}`;
  const agePart = stale ? ` — STALE (${age ?? '?'}h): treat as over budget` : ` (${age}h old)`;
  return head + agePart + (over.length ? `\n  over budget: ${over.join(' ')}` : '');
}

/**
 * Storage mode gates worktrees, clones and multi-agent fan-out.
 *
 * Two authorities disagree by design and both are right about different things:
 * `posture.storageState` measures against a 30%-free target, while the CLAUDE.md
 * GiB bands govern the actual "may I clone" decision. Report both, name which one
 * binds. `mode` at the top level is the SCAN mode ("quick"/"deep") and is not a
 * storage state at all — reading it was how this line first shipped wrong.
 */
function storageLine() {
  const s = readJson(path.join(HOME, '.starlight', 'storage-intelligence', 'latest.json'));
  if (!s) return null;
  const free = Number(s.machine && s.machine.freeGiB);
  if (!Number.isFinite(free)) return null;

  const band = free >= 285 ? 'OPEN' : free >= 80 ? 'BOUNDED' : free >= 50 ? 'TIGHT' : 'CRITICAL';
  const posture = (s.posture && s.posture.storageState) ? String(s.posture.storageState).toUpperCase() : null;
  const pct = s.machine.freePercent;

  let line = `Storage: ${free.toFixed(1)} GiB free`;
  if (Number.isFinite(Number(pct))) line += ` (${Number(pct).toFixed(1)}%)`;
  line += ` → ${band} governs clones/worktrees`;
  if (posture && posture !== band) line += `; registry posture ${posture} is vs the 30% target, not the gate`;
  if (band === 'CRITICAL' || band === 'TIGHT') line += '. NO new worktrees or clones this session.';
  const age = hoursSince(s.generatedAt);
  if (age !== null && age > 72) line += ` [scan ${age}h old]`;
  return line;
}

const CONTRACT = `## Kernel: default-on this session

Every turn ends with a made thing, never a status report. 段取り dandori (do the prep
yourself, never hand setup back as a question) · おもてなし omotenashi (serve the interest,
bring the adjacent fix, say plainly when the target is wrong) · 見立て mitate (a name or
fragment handed to you is a decision, not a query — build with it) · 場を読む ba wo yomu
(read the real state; the block below is that read, already done).

Escalation ladder — "massive action" means moving DOWN this list, not typing faster:
  1. Independent reads in ONE message (parallel tool calls), never sequential probing.
  2. Delegate a read-heavy sweep to a subagent; keep the conclusion, drop the file dumps.
  3. Write the artifact. A session that produced a plan and no better artifact failed.
  4. One quality pass whose only job is raising quality. No first draft ships.
  5. Adversarial review by a different context before Frank sees it. He is not the QA layer.

Confirm before: push · publish · send · delete · money. Everything else, just do it.
Close with: made / verified / proposed.`;

function main() {
  const parts = [CONTRACT, ''];
  const state = ['## Live state (read at session open — do not re-probe these)'];

  let cwd = null;
  try {
    const raw = fs.readFileSync(0, 'utf-8');
    if (raw) {
      const payload = JSON.parse(raw);
      if (payload && payload.cwd) cwd = payload.cwd;
    }
  } catch { /* no stdin, or not JSON — the resolver falls back to process.cwd() */ }
  cwd = resolveCwd(cwd);

  const lines = [worktreeLine(cwd), prBudgetLine(), storageLine()].filter(Boolean);
  if (lines.length) {
    state.push(...lines.map(l => '- ' + l));
    parts.push(state.join('\n'));
  }
  process.stdout.write(parts.join('\n'));
}

try { main(); } catch { /* a broken hook must never block a session */ }
process.exit(0);
