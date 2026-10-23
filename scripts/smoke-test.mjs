#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { mkdtempSync, cpSync, readFileSync, existsSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function run(cmd, options = {}) {
  console.log(`Running: ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...options });
}

const tempDir = mkdtempSync(join(tmpdir(), 'acos-smoke-'));
console.log(`Created temp directory: ${tempDir}`);

try {
  console.log('Copying repository...');
  cpSync(process.cwd(), tempDir, {
    recursive: true,
    filter: (source) => !source.match(/[\\/](node_modules|\.git)([\\/]|$)/),
  });

  // Ensure install.sh is executable
  chmodSync(join(tempDir, 'install.sh'), 0o755);

  console.log('\n--- Running Quickstart Commands ---\n');
  run('npm install', { cwd: tempDir });

  run('export CLAUDE_HOME="$(mktemp -d)" && ./install.sh --platform=claude --minimal', { cwd: tempDir, shell: '/bin/bash' });
  run('./install.sh --dry-run --platform=claude', { cwd: tempDir });
  run('export CLAUDE_HOME="$(mktemp -d)" && ./install.sh --platform=claude', { cwd: tempDir, shell: '/bin/bash' });

  run('node scripts/agent-os-init.mjs --name my-brand', { cwd: tempDir });
  run('node scripts/agent-compile.mjs --instance my-brand', { cwd: tempDir });
  run('node scripts/estate-audit.mjs --repos . --md audit.md', { cwd: tempDir });

  console.log('\n--- Verifying Manifest References ---\n');

  // The catalog might not be built in the new directory unless we explicitly build it (which isn't in the strict quickstart),
  // but let's build it since it's required for checking references.
  // Actually, wait! The task says "checks every skill/agent/command file referenced by the manifest exists".
  // If `tools/observatory/public/catalog.json` exists in the codebase (which it does), it will be copied over.
  // But just in case, we will run the command to build it if it doesn't exist.
  const catalogPath = join(tempDir, 'tools/observatory/public/catalog.json');
  if (!existsSync(catalogPath)) {
    run('npm run observatory:catalog', { cwd: tempDir });
  }

  if (!existsSync(catalogPath)) {
    throw new Error(`Catalog manifest not found at ${catalogPath}.`);
  }

  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  let missingFiles = 0;

  if (!catalog.nodes || !Array.isArray(catalog.nodes)) {
    throw new Error('Catalog is missing nodes array');
  }

  for (const node of catalog.nodes) {
    if (node.file) {
      const fullPath = join(tempDir, node.file);
      if (!existsSync(fullPath)) {
        console.error(`❌ Referenced file missing: ${node.file} (Kind: ${node.kind})`);
        missingFiles++;
      }
    }
  }

  if (missingFiles > 0) {
    throw new Error(`${missingFiles} files referenced by the manifest were missing.`);
  } else {
    console.log('✅ All files referenced by the manifest exist.');
  }

  console.log('\n✅ Smoke test passed successfully!');
} catch (err) {
  console.error('\n❌ Smoke test failed.');
  console.error(err.message);
  process.exitCode = 1;
} finally {
  console.log(`Cleaning up ${tempDir}...`);
  rmSync(tempDir, { recursive: true, force: true });
}
