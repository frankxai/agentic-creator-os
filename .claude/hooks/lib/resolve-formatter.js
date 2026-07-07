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
 * Resolve local or npx bin for the formatter.
 * Returns { bin: string, prefix: string[] } suitable for spawn.
 */
function resolveFormatterBin(projectRoot, formatter) {
  const root = projectRoot || process.cwd();
  const isBiome = formatter === 'biome';
  const binName = isBiome ? 'biome' : 'prettier';
  const local = path.join(root, 'node_modules', '.bin', binName);
  if (fs.existsSync(local)) {
    return { bin: local, prefix: [] };
  }
  // Fallback to npx (works cross platform)
  const npxPkg = isBiome ? '@biomejs/biome' : 'prettier';
  return { bin: 'npx', prefix: [npxPkg] };
}

module.exports = { findProjectRoot, detectFormatter, resolveFormatterBin };
