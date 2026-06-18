#!/usr/bin/env node
/**
 * package-acos.mjs — Packages Agentic Creator OS folders into zip archives
 * for local distribution and GitHub Releases.
 *
 * Output packages:
 *   - dist/acos-complete.zip
 *   - dist/acos-skills-pack.zip
 *   - dist/acos-agents-pack.zip
 *   - dist/acos-hooks-pack.zip
 *
 * Requires tar/bsdtar to be available in PATH.
 */

import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const TMP = join(DIST, 'tmp');

function log(msg) {
  console.log(`[Packager] ${msg}`);
}

function runCommand(cmd, cwd) {
  log(`Running: ${cmd}`);
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
  } catch (err) {
    console.error(`✗ Command failed: ${cmd}`);
    throw err;
  }
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function main() {
  log('Starting packaging process...');

  // 1. Clean and create output directories
  if (existsSync(DIST)) {
    log('Cleaning existing dist directory...');
    rmSync(DIST, { recursive: true, force: true });
  }
  ensureDir(DIST);
  ensureDir(TMP);

  // 2. Prepare acos-complete files
  log('Preparing complete package files...');
  const completeTmp = join(TMP, 'acos-complete');
  ensureDir(completeTmp);

  const completeFiles = [
    '.claude',
    '.grok',
    'skills',
    'workflows',
    'templates',
    'bin',
    'scripts',
    'docs',
    'install.sh',
    'package.json',
    'README.md',
    'CLAUDE.md',
    'AGENTS.md',
    'BRANCH_AUDIT.md',
    'CONNECTORS.md',
    'CONTRIBUTING.md',
    'CREATOR_NEEDS.md',
    'QUICKSTART.md',
    'USAGE_GUIDE.md'
  ];

  for (const item of completeFiles) {
    const src = join(ROOT, item);
    if (existsSync(src)) {
      cpSync(src, join(completeTmp, item), { recursive: true });
    }
  }

  // 3. Prepare standalone packs
  log('Preparing skill pack files...');
  const skillsTmp = join(TMP, 'skills-pack');
  ensureDir(skillsTmp);
  if (existsSync(join(ROOT, '.claude/skills'))) {
    cpSync(join(ROOT, '.claude/skills'), skillsTmp, { recursive: true });
  }

  log('Preparing agent pack files...');
  const agentsTmp = join(TMP, 'agents-pack');
  ensureDir(agentsTmp);
  if (existsSync(join(ROOT, '.claude/agents'))) {
    cpSync(join(ROOT, '.claude/agents'), agentsTmp, { recursive: true });
  }

  log('Preparing hook pack files...');
  const hooksTmp = join(TMP, 'hooks-pack');
  ensureDir(hooksTmp);
  if (existsSync(join(ROOT, '.claude/hooks'))) {
    cpSync(join(ROOT, '.claude/hooks'), hooksTmp, { recursive: true });
  }

  // 4. Archive using tar (cross-platform zip creation)
  log('Archiving complete package...');
  runCommand('tar -a -c -f ../../acos-complete.zip *', completeTmp);

  log('Archiving skill pack...');
  runCommand('tar -a -c -f ../../acos-skills-pack.zip *', skillsTmp);

  log('Archiving agent pack...');
  runCommand('tar -a -c -f ../../acos-agents-pack.zip *', agentsTmp);

  log('Archiving hook pack...');
  runCommand('tar -a -c -f ../../acos-hooks-pack.zip *', hooksTmp);

  // 5. Clean up temporary directory
  log('Cleaning up temporary directories...');
  rmSync(TMP, { recursive: true, force: true });

  log('✔ Packaging completed successfully! Archives generated in dist/');
}

main();
