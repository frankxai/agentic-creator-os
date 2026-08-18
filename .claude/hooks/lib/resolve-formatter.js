'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Minimal portable project root finder.
 * Walks up from startDir looking for package.json or .git.
 */
function findProjectRoot(startDir) {
  let dir = path.resolve(startDir || process.cwd());
  const root = path.parse(dir).root;
  while (dir !== root) {
    if (
      fs.existsSync(path.join(dir, 'package.json')) ||
      fs.existsSync(path.join(dir, '.git'))
    ) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return startDir || process.cwd();
}

/**
 * Detect formatter (biome or prettier) based on config presence or package deps.
 */
function detectFormatter(projectRoot) {
  const root = projectRoot || process.cwd();
  const biomeConfig = path.join(root, 'biome.json');
  const biomeJsConfig = path.join(root, 'biome.config.js');
  if (fs.existsSync(biomeConfig) || fs.existsSync(biomeJsConfig)) {
    return 'biome';
  }
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (deps.biome || deps['@biomejs/biome'] || deps['biomejs']) return 'biome';
      if (deps.prettier) return 'prettier';
    } catch {}
  }
  const prettierrc = path.join(root, '.prettierrc');
  const prettierJs = path.join(root, 'prettier.config.js');
  const prettierCjs = path.join(root, 'prettier.config.cjs');
  if (fs.existsSync(prettierrc) || fs.existsSync(prettierJs) || fs.existsSync(prettierCjs)) {
    return 'prettier';
  }
  return null;
}

/**
 * Resolve a locally installed formatter to something directly spawnable.
 * Returns { bin: string, prefix: string[] } suitable for spawn, or null.
 *
 * No npx fallback by design: it costs seconds of resolution and opens a cmd.exe
 * console on Windows. And the extensionless node_modules/.bin entry is a shell
 * script Windows cannot spawn, while the .cmd shim needs `shell: true`, which
 * concatenates instead of escaping arguments (Node DEP0190). Resolving the
 * package's own JS entrypoint and running it under the current node avoids both.
 */
function resolveFormatterBin(projectRoot, formatter) {
  const root = projectRoot || process.cwd();

  const entrypoints = formatter === 'biome'
    ? ['@biomejs/biome/bin/biome']
    : ['prettier/bin/prettier.cjs', 'prettier/bin-prettier.js'];

  for (const entry of entrypoints) {
    try {
      return { bin: process.execPath, prefix: [require.resolve(entry, { paths: [root] })] };
    } catch {
      // Not installed under this root — try the next candidate.
    }
  }

  const exe = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? `${formatter}.exe` : formatter);
  if (fs.existsSync(exe)) {
    return { bin: exe, prefix: [] };
  }

  return null;
}

module.exports = { findProjectRoot, detectFormatter, resolveFormatterBin };
