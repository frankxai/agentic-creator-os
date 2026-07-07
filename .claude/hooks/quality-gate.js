#!/usr/bin/env node
/**
 * Quality Gate Hook
 *
 * Runs lightweight quality checks after file edits.
 * - Targets one file when file_path is provided
 * - Falls back to no-op when language/tooling is unavailable
 *
 * For JS/TS files with Biome, this hook is skipped because
 * post-edit-format.js already runs `biome check --write`.
 * This hook still handles .json/.md files for Biome, and all
 * Prettier / Go / Python checks.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const MAX_STDIN = 1024 * 1024;

// Inlined minimal portable resolve-formatter (self-contained, no missing lib)
function findProjectRoot(startDir) {
  let dir = path.resolve(startDir || process.cwd());
  const root = path.parse(dir).root;
  while (dir !== root) {
    if (fs.existsSync(path.join(dir, 'package.json')) || fs.existsSync(path.join(dir, '.git'))) return dir;
    dir = path.dirname(dir);
  }
  return startDir || process.cwd();
}
function detectFormatter(projectRoot) {
  const root = projectRoot || process.cwd();
  if (fs.existsSync(path.join(root, 'biome.json')) || fs.existsSync(path.join(root, 'biome.config.js'))) return 'biome';
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (deps.biome || deps['@biomejs/biome']) return 'biome';
      if (deps.prettier) return 'prettier';
    } catch {}
  }
  if (fs.existsSync(path.join(root, '.prettierrc')) || fs.existsSync(path.join(root, 'prettier.config.js'))) return 'prettier';
  return null;
}
function resolveFormatterBin(projectRoot, formatter) {
  const root = projectRoot || process.cwd();
  const isBiome = formatter === 'biome';
  const binName = isBiome ? 'biome' : 'prettier';
  const local = path.join(root, 'node_modules', '.bin', binName);
  if (fs.existsSync(local)) return { bin: local, prefix: [] };
  const npxPkg = isBiome ? '@biomejs/biome' : 'prettier';
  return { bin: 'npx', prefix: [npxPkg] };
}

/**
 * Execute a command synchronously, returning the spawnSync result.
 *
 * @param {string} command - Executable path or name
 * @param {string[]} args - Arguments to pass
 * @param {string} [cwd] - Working directory (defaults to process.cwd())
 * @returns {import('child_process').SpawnSyncReturns<string>}
 */
function exec(command, args, cwd = process.cwd()) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: process.env,
    timeout: 15000
  });
}

/**
 * Write a message to stderr for logging.
 *
 * @param {string} msg - Message to log
 */
function log(msg) {
  process.stderr.write(`${msg}\n`);
}

/**
 * Run quality-gate checks for a single file based on its extension.
 * Skips JS/TS files when Biome is configured (handled by post-edit-format).
 *
 * @param {string} filePath - Path to the edited file
 */
function maybeRunQualityGate(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return;
  }

  // Resolve to absolute path so projectRoot-relative comparisons work
  filePath = path.resolve(filePath);

  const ext = path.extname(filePath).toLowerCase();
  const fix = String(process.env.ECC_QUALITY_GATE_FIX || '').toLowerCase() === 'true';
  const strict = String(process.env.ECC_QUALITY_GATE_STRICT || '').toLowerCase() === 'true';

  if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md'].includes(ext)) {
    const projectRoot = findProjectRoot(path.dirname(filePath));
    const formatter = detectFormatter(projectRoot);

    if (formatter === 'biome') {
      // JS/TS already handled by post-edit-format via `biome check --write`
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        return;
      }

      // .json / .md — still need quality gate
      const resolved = resolveFormatterBin(projectRoot, 'biome');
      if (!resolved) return;
      const args = [...resolved.prefix, 'check', filePath];
      if (fix) args.push('--write');
      const result = exec(resolved.bin, args, projectRoot);
      if (result.status !== 0 && strict) {
        log(`[QualityGate] Biome check failed for ${filePath}`);
      }
      return;
    }

    if (formatter === 'prettier') {
      const resolved = resolveFormatterBin(projectRoot, 'prettier');
      if (!resolved) return;
      const args = [...resolved.prefix, fix ? '--write' : '--check', filePath];
      const result = exec(resolved.bin, args, projectRoot);
      if (result.status !== 0 && strict) {
        log(`[QualityGate] Prettier check failed for ${filePath}`);
      }
      return;
    }

    // No formatter configured — skip
    return;
  }

  if (ext === '.go') {
    if (fix) {
      const r = exec('gofmt', ['-w', filePath]);
      if (r.status !== 0 && strict) {
        log(`[QualityGate] gofmt failed for ${filePath}`);
      }
    } else if (strict) {
      const r = exec('gofmt', ['-l', filePath]);
      if (r.status !== 0) {
        log(`[QualityGate] gofmt failed for ${filePath}`);
      } else if (r.stdout && r.stdout.trim()) {
        log(`[QualityGate] gofmt check failed for ${filePath}`);
      }
    }
    return;
  }

  if (ext === '.py') {
    const args = ['format'];
    if (!fix) args.push('--check');
    args.push(filePath);
    const r = exec('ruff', args);
    if (r.status !== 0 && strict) {
      log(`[QualityGate] Ruff check failed for ${filePath}`);
    }
  }
}

/**
 * Core logic — exported so run-with-flags.js can call directly.
 *
 * @param {string} rawInput - Raw JSON string from stdin
 * @returns {string} The original input (pass-through)
 */
function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const filePath = String(input.tool_input?.file_path || '');
    maybeRunQualityGate(filePath);
  } catch {
    // Ignore parse errors.
  }
  return rawInput;
}

// ── stdin entry point (backwards-compatible) ────────────────────
if (require.main === module) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    if (raw.length < MAX_STDIN) {
      const remaining = MAX_STDIN - raw.length;
      raw += chunk.substring(0, remaining);
    }
  });

  process.stdin.on('end', () => {
    const result = run(raw);
    process.stdout.write(result);
  });
}

module.exports = { run };
