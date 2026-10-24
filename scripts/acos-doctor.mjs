#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// 1. Get version from package.json
const pkgPath = join(ROOT, 'package.json');
let version = 'unknown';
if (existsSync(pkgPath)) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  version = pkg.version || 'unknown';
}

// 2. Get counts from verify-public-surface
let counts = null;
try {
  const measuredString = execFileSync('node', [join(ROOT, 'scripts/verify-public-surface.mjs')]).toString();
  const jsonMatch = measuredString.match(/\{\n[\s\S]*\n\}/);
  if (jsonMatch) {
    counts = JSON.parse(jsonMatch[0]);
  }
} catch (err) {
  // If it fails, counts remains null
}

// 3. Get hook status
const hooksPath = join(ROOT, '.claude/hooks.json');
let hookStatus = { totalEvents: 0, totalHooks: 0 };
if (existsSync(hooksPath)) {
  const hooksData = JSON.parse(readFileSync(hooksPath, 'utf8'));
  if (hooksData.hooks) {
    hookStatus.totalEvents = Object.keys(hooksData.hooks).length;
    hookStatus.totalHooks = Object.values(hooksData.hooks).reduce((acc, hooks) => acc + hooks.length, 0);
  }
}

console.log(`=== ACOS Doctor MVP ===`);
console.log(`Version: ${version}`);
console.log(`\n--- Verified Public Surface Counts ---`);
if (counts) {
  console.log(`Non-empty skill modules: ${counts.nonEmptySkillModules}`);
  console.log(`Top-level slash commands: ${counts.topLevelCommands}`);
  console.log(`Top-level agent profiles: ${counts.topLevelAgents}`);
  console.log(`Installable shell hooks: ${counts.installableShellHooks}`);
  console.log(`Activation rules: ${counts.activationRules}`);
} else {
  console.log('Error: Could not retrieve counts.');
}

console.log(`\n--- Hook Status ---`);
console.log(`Configured hook events: ${hookStatus.totalEvents}`);
console.log(`Total active hooks: ${hookStatus.totalHooks}`);
