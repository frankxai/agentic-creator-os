#!/usr/bin/env node
'use strict';

// Shared, dependency-free hooks. No package installs, shell evaluation, network,
// trajectory scans, or raw prompt/content logging on the critical path.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const MAX_INPUT = 1024 * 1024;
const MAX_FILES = 4;
const QUALITY_BUDGET_MS = 3500;

function clean(value, limit = 512) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, limit)
    : undefined;
}

function projectRoot(input) {
  return typeof input.cwd === 'string' && path.isAbsolute(input.cwd)
    ? path.resolve(input.cwd) : process.cwd();
}

function changedFiles(input) {
  const tool = input.tool_input || {};
  const files = [tool.file_path, tool.path].filter(v => typeof v === 'string');
  if (input.tool_name === 'apply_patch' && typeof tool.command === 'string') {
    for (const line of tool.command.split('\n')) {
      const match = /^\*\*\* (?:Add File|Update File|Move to): (.+)\r?$/.exec(line);
      if (match) files.push(match[1].trim());
      if (files.length >= 40) break;
    }
  }
  return [...new Set(files)].slice(0, 40);
}

function appendReceipt(input, kind, details = {}) {
  const now = new Date();
  const root = process.env.STARLIGHT_HOOK_LOG_ROOT || path.join(os.homedir(), '.starlight', 'logs', 'hooks');
  const receipt = {
    at: now.toISOString(), harness: clean(process.env.STARLIGHT_HARNESS || 'codex', 30), kind,
    sessionId: clean(input.session_id, 100), turnId: clean(input.turn_id, 100),
    toolUseId: clean(input.tool_use_id, 100), cwd: clean(projectRoot(input), 1024), ...details,
  };
  try {
    fs.mkdirSync(root, { recursive: true });
    fs.appendFileSync(path.join(root, `events-${now.toISOString().slice(0, 10)}.jsonl`), JSON.stringify(receipt) + '\n');
  } catch {
    // Telemetry never blocks authorized work; the doctor checks log writability.
  }
}

function routeHint(prompt) {
  if (typeof prompt !== 'string') return null;
  const p = prompt.slice(0, 16000).toLowerCase();
  const routes = [];
  if (/\bgstack\b|\/(?:qa|design-review|office-hours|canary)\b/.test(p)) {
    routes.push('For gstack workflows, read the relevant installed gstack skill on demand; use the Starlight capability-loading policy for runtime paths and verification.');
  }
  if (/\b(?:mcp|harness|multi.agent|swarm)\b/.test(p)) {
    routes.push('Use the existing shared tool plane for common reads; admit task-specific services and parallel workers only when needed and machine headroom permits.');
  }
  return routes.length ? routes.slice(0, 2).join(' ') : null;
}

function findPackageRoot(file, boundary) {
  let dir = path.dirname(file);
  while (within(boundary, dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    if (dir === boundary) break;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function within(root, candidate) {
  const rel = path.relative(root, candidate);
  return !rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel);
}

function formatterFor(file, cwd) {
  const pkgRoot = findPackageRoot(file, cwd);
  if (!pkgRoot) return null;
  let pkg;
  try { pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8')); }
  catch { return null; }
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const candidates = [];
  if (deps['@biomejs/biome']) candidates.push(['biome', '@biomejs/biome', 'biome']);
  if (deps.prettier) candidates.push(['prettier', 'prettier', 'prettier']);
  for (const [name, moduleName, binName] of candidates) {
    // Read the installed package directly. Never run npx or resolve globally.
    const moduleRoot = path.join(pkgRoot, 'node_modules', moduleName);
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'package.json'), 'utf8'));
      const relative = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[binName];
      if (typeof relative !== 'string') continue;
      const entry = path.resolve(moduleRoot, relative);
      if (!within(moduleRoot, entry) || !fs.existsSync(entry)) continue;
      return { name, entry, cwd: pkgRoot };
    } catch { /* Missing local tool is advisory, not a reason to install. */ }
  }
  return null;
}

function qualityCheck(input, run = spawnSync) {
  const started = Date.now();
  const cwd = projectRoot(input);
  const results = [];
  for (const raw of changedFiles(input).slice(0, MAX_FILES)) {
    const file = path.resolve(cwd, raw);
    const remaining = QUALITY_BUDGET_MS - (Date.now() - started);
    if (remaining < 100) break;
    if (!within(cwd, file) || !/\.(?:[cm]?[jt]sx?|json|md|mdx|css|html)$/.test(file)) continue;
    let realFile;
    try {
      realFile = fs.realpathSync(file);
      if (!fs.statSync(realFile).isFile() || !within(fs.realpathSync(cwd), realFile)) continue;
    } catch { continue; }
    const formatter = formatterFor(file, cwd);
    if (!formatter) continue;
    const args = [formatter.entry, formatter.name === 'biome' ? 'format' : '--check', realFile];
    const result = run(process.execPath, args, {
      cwd: formatter.cwd, timeout: remaining, encoding: 'utf8', windowsHide: true,
      maxBuffer: 64 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
    });
    results.push({ file: clean(raw, 1024), formatter: formatter.name, exit: result.status,
      timedOut: result.error?.code === 'ETIMEDOUT' });
  }
  return { durationMs: Date.now() - started, checks: results };
}

function handle(mode, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  if (mode === 'post') {
    const quality = qualityCheck(input);
    appendReceipt(input, 'post', { tool: clean(input.tool_name, 100),
      files: changedFiles(input).map(file => clean(file, 1024)), ...quality });
    const failed = quality.checks.filter(r => r.exit !== 0);
    return failed.length ? { systemMessage: `Local formatting check needs attention for ${failed.length} file(s). See the hook receipt; no automatic edits were made.` } : null;
  }
  if (!['start', 'prompt', 'compact', 'stop'].includes(mode)) throw new Error('Unknown hook mode');
  appendReceipt(input, mode);
  const hint = mode === 'prompt' ? routeHint(input.prompt) : null;
  return hint ? { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: hint } } : null;
}

function main() {
  let size = 0, oversized = false;
  const chunks = [];
  process.stdin.on('data', chunk => {
    size += chunk.length;
    if (size > MAX_INPUT) { oversized = true; chunks.length = 0; }
    else if (!oversized) chunks.push(chunk);
  });
  process.stdin.on('end', () => {
    if (oversized) return;
    try {
      const output = handle(process.argv[2], JSON.parse(Buffer.concat(chunks).toString('utf8')));
      if (output) process.stdout.write(JSON.stringify(output));
    } catch { process.stderr.write('Starlight advisory hook skipped invalid input.\n'); }
  });
}

if (require.main === module) main();
module.exports = { handle, routeHint, changedFiles, formatterFor, qualityCheck, within, MAX_INPUT };
