'use strict';

const fs = require('fs');
const path = require('path');

function findProjectRoot(startDir) {
  let cur = path.resolve(startDir || process.cwd());
  const root = path.parse(cur).root;
  while (cur && cur !== root) {
    if (
      fs.existsSync(path.join(cur, 'package.json')) ||
      fs.existsSync(path.join(cur, '.git')) ||
      fs.existsSync(path.join(cur, 'pyproject.toml')) ||
      fs.existsSync(path.join(cur, 'go.mod')) ||
      fs.existsSync(path.join(cur, 'Cargo.toml'))
    ) {
      return cur;
    }
    cur = path.dirname(cur);
  }
  return startDir || process.cwd();
}

function detectFormatter(projectRoot) {
  if (!projectRoot) return null;

  const biomeConfigs = ['biome.json', 'biome.jsonc'];
  for (const f of biomeConfigs) {
    if (fs.existsSync(path.join(projectRoot, f))) return 'biome';
  }

  const prettierConfigs = [
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.js',
    '.prettierrc.cjs',
    '.prettierrc.yaml',
    '.prettierrc.yml',
    'prettier.config.js',
    'prettier.config.cjs',
  ];
  for (const f of prettierConfigs) {
    if (fs.existsSync(path.join(projectRoot, f))) return 'prettier';
  }

  const pkgPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const json = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const deps = {
        ...(json.dependencies || {}),
        ...(json.devDependencies || {}),
      };
      if (deps['@biomejs/biome']) return 'biome';
      if (deps['prettier']) return 'prettier';
      if (json.prettier) return 'prettier';
    } catch {
      // ignore parse errors
    }
  }

  return null;
}

function resolveFormatterBin(projectRoot, name) {
  if (!projectRoot || !name) return null;

  const localBin = path.join(projectRoot, 'node_modules', '.bin', name);
  const localBinCmd = `${localBin}.cmd`;
  if (fs.existsSync(localBin) || fs.existsSync(localBinCmd)) {
    return {
      bin: fs.existsSync(localBinCmd) ? localBinCmd : localBin,
      prefix: [],
    };
  }

  return { bin: 'npx', prefix: ['--no-install', name] };
}

module.exports = { findProjectRoot, detectFormatter, resolveFormatterBin };
