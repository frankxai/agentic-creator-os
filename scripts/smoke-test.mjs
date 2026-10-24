#!/usr/bin/env node
// ACOS smoke test: manifests point at real files, README quickstart names real scripts.
// No dependencies, no network. Usage: node scripts/smoke-test.mjs [repoRoot]
// Exit 0 when clean, exit 1 listing every problem found.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BUILTINS = new Set([
  'install', 'i', 'add', 'remove', 'rm', 'uninstall', 'update', 'up', 'upgrade', 'ci', 'test', 't',
  'start', 'stop', 'restart', 'run', 'exec', 'dlx', 'init', 'publish', 'pack', 'link', 'unlink',
  'audit', 'outdated', 'list', 'ls', 'why', 'store', 'config', 'env', 'create', 'import', 'prune',
  'rebuild', 'fetch', 'patch', 'setup', 'self-update', 'help', 'version', 'cache', 'dedupe',
]);
const FLAGS_WITH_VALUE = new Set(['--filter', '-F', '--dir', '-C', '--prefix']);
const COMPONENT_FIELDS = ['skills', 'agents', 'commands'];
const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})(.*)$/;

// CommonMark-style fence tracking. `state` is null outside a fence, else { char, len }.
// A closing fence uses the same character, is at least as long, and has no info string.
// Returns { state, isFenceLine }.
function fenceStep(state, line) {
  const m = FENCE_OPEN.exec(line);
  if (!m) return { state, isFenceLine: false };
  const char = m[1][0];
  const len = m[1].length;
  if (!state) {
    if (char === '`' && m[2].includes('`')) return { state, isFenceLine: false };
    return { state: { char, len }, isFenceLine: true };
  }
  if (char === state.char && len >= state.len && m[2].trim() === '') return { state: null, isFenceLine: true };
  return { state, isFenceLine: false };
}

const posix = (root, p) => path.relative(root, p).split(path.sep).join('/');

function readJson(file, problems, label) {
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      problems.push(`${label}: manifest is not a JSON object`);
      return null;
    }
    return parsed;
  } catch (err) {
    problems.push(`${label}: cannot read manifest (${err.message})`);
    return null;
  }
}

// Manifest fields may be a string, an array of strings, or an object of strings.
function pathsIn(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(pathsIn);
  if (value && typeof value === 'object') return Object.values(value).flatMap(pathsIn);
  return [];
}

function checkExplicitPaths(manifest, baseDir, root, label, problems) {
  for (const field of COMPONENT_FIELDS) {
    for (const ref of pathsIn(manifest[field])) {
      const target = path.resolve(baseDir, ref);
      if (!existsSync(target)) {
        problems.push(`${label}: ${field} path "${ref}" does not exist (${posix(root, target) || '.'})`);
      } else if (field === 'skills' && statSync(target).isDirectory()) {
        checkDeclaredSkillsDir(target, root, problems);
      }
    }
  }
}

// A manifest-declared skills path is either a single skill directory or a directory of skills.
function checkDeclaredSkillsDir(target, root, problems) {
  if (SKILL_MARKERS.some((m) => existsSync(path.join(target, m)))) {
    if (!existsSync(path.join(target, 'SKILL.md'))) {
      problems.push(`${posix(root, target)}: skill directory has no SKILL.md`);
    }
    return;
  }
  checkSkillEntries(target, root, problems, true);
}

function checkConventionalDirs(pluginDir, root, problems) {
  const skillsDir = path.join(pluginDir, 'skills');
  if (!existsSync(skillsDir)) return;
  checkSkillEntries(skillsDir, root, problems, true);
}

// Group-vs-skill is decided by structure. A directory holding SKILL.md, CLAUDE.md or
// skill.yaml is a skill and must have SKILL.md. A directory with none of those whose
// children include directories is a group (e.g. skills/technical/) and is searched one
// level down. Groups cannot nest: below a group, every directory is treated as a skill.
const SKILL_MARKERS = ['SKILL.md', 'CLAUDE.md', 'skill.yaml'];

function checkSkillEntries(dir, root, problems, allowGroups) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    const isSkill = SKILL_MARKERS.some((m) => existsSync(path.join(full, m)));
    if (isSkill) {
      if (!existsSync(path.join(full, 'SKILL.md'))) {
        problems.push(`${posix(root, full)}: skill directory has no SKILL.md`);
      }
      continue;
    }
    const hasSubdirs = readdirSync(full).some((c) => statSync(path.join(full, c)).isDirectory());
    if (allowGroups && hasSubdirs) {
      checkSkillEntries(full, root, problems, false);
    } else {
      problems.push(`${posix(root, full)}: skill directory has no SKILL.md`);
    }
  }
}

function checkPluginEntry(entry, root, problems) {
  const label = `.claude-plugin/marketplace.json plugin "${entry.name ?? '?'}"`;
  if (typeof entry.source !== 'string') {
    problems.push(`${label}: source is not a local path string`);
    return;
  }
  const pluginDir = path.resolve(root, entry.source);
  if (!existsSync(pluginDir)) {
    problems.push(`${label}: source "${entry.source}" does not exist`);
    return;
  }
  checkExplicitPaths(entry, pluginDir, root, label, problems);
  const pluginJson = path.join(pluginDir, '.claude-plugin', 'plugin.json');
  const jsonLabel = posix(root, pluginJson);
  if (existsSync(pluginJson)) {
    const manifest = readJson(pluginJson, problems, jsonLabel);
    if (manifest) checkExplicitPaths(manifest, pluginDir, root, jsonLabel, problems);
  } else {
    problems.push(`${jsonLabel}: plugin manifest is missing`);
  }
  checkConventionalDirs(pluginDir, root, problems);
}

function checkManifests(root, problems) {
  const rootPlugin = path.join(root, '.claude-plugin', 'plugin.json');
  const market = path.join(root, '.claude-plugin', 'marketplace.json');
  if (existsSync(rootPlugin)) {
    const manifest = readJson(rootPlugin, problems, '.claude-plugin/plugin.json');
    if (manifest) checkExplicitPaths(manifest, root, root, '.claude-plugin/plugin.json', problems);
    checkConventionalDirs(root, root, problems);
  } else {
    problems.push('.claude-plugin/plugin.json: file is missing');
  }
  if (!existsSync(market)) {
    problems.push('.claude-plugin/marketplace.json: file is missing');
    return;
  }
  const catalog = readJson(market, problems, '.claude-plugin/marketplace.json');
  if (!catalog) return;
  if (!Array.isArray(catalog.plugins) || catalog.plugins.length === 0) {
    problems.push('.claude-plugin/marketplace.json: "plugins" is missing or empty');
    return;
  }
  for (const entry of catalog.plugins) checkPluginEntry(entry, root, problems);
}

function quickstartSection(readme) {
  const lines = readme.split(/\r?\n/);
  const start = lines.findIndex((l) => /^#{1,6}\s+quick\s*start\b/i.test(l));
  if (start === -1) return null;
  const level = lines[start].match(/^#+/)[0].length;
  const out = [];
  let fence = null;
  for (let i = start + 1; i < lines.length; i++) {
    const step = fenceStep(fence, lines[i]);
    fence = step.state;
    const h = fence || step.isFenceLine ? null : lines[i].match(/^(#{1,6})\s/);
    if (h && h[1].length <= level) break;
    out.push(lines[i]);
  }
  return out;
}

function fencedCommandLines(sectionLines) {
  const commands = [];
  let fence = null;
  let pending = '';
  for (const raw of sectionLines) {
    const step = fenceStep(fence, raw);
    fence = step.state;
    if (step.isFenceLine) { pending = ''; continue; }
    if (!fence) continue;
    const line = pending + raw.trim();
    pending = '';
    if (line.endsWith('\\')) { pending = `${line.slice(0, -1)} `; continue; }
    const cleaned = line.replace(/^\$\s+/, '');
    if (cleaned === '' || cleaned.startsWith('#')) continue;
    commands.push(cleaned);
  }
  return commands;
}

function scriptNameOf(segment) {
  const tokens = segment.trim().split(/\s+/);
  const tool = tokens[0];
  if (tool !== 'npm' && tool !== 'pnpm') return null;
  let i = 1;
  while (i < tokens.length && tokens[i].startsWith('-')) i += FLAGS_WITH_VALUE.has(tokens[i]) ? 2 : 1;
  const verb = tokens[i];
  if (!verb) return null;
  if (verb === 'run' || verb === 'run-script') {
    i++;
    while (i < tokens.length && tokens[i].startsWith('-')) i++;
    return tokens[i] ?? null;
  }
  // npm needs "run"; pnpm built-ins are not scripts.
  if (tool === 'npm' || BUILTINS.has(verb)) return null;
  return verb;
}

function checkReadme(root, problems) {
  const readmePath = path.join(root, 'README.md');
  if (!existsSync(readmePath)) { problems.push('README.md: file is missing'); return; }
  const section = quickstartSection(readFileSync(readmePath, 'utf8'));
  if (!section) { problems.push('README.md: no "Quick start" section found'); return; }
  const pkgPath = path.join(root, 'package.json');
  if (!existsSync(pkgPath)) { problems.push('package.json: file is missing'); return; }
  const pkg = readJson(pkgPath, problems, 'package.json');
  if (!pkg) return;
  const scripts = pkg.scripts ?? {};
  for (const command of fencedCommandLines(section)) {
    for (const segment of command.split(/&&|\|\||;|\|/)) {
      const name = scriptNameOf(segment);
      if (name && !Object.hasOwn(scripts, name)) {
        problems.push(`README.md quickstart: "${segment.trim()}" names script "${name}" which is not in package.json scripts`);
      }
    }
  }
}

export function smoke(root) {
  const problems = [];
  checkManifests(root, problems);
  checkReadme(root, problems);
  return [...new Set(problems)];
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const defaultRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  const root = path.resolve(process.argv[2] ?? defaultRoot);
  const problems = smoke(root);
  if (problems.length > 0) {
    console.error(`smoke: ${problems.length} problem(s)`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log('smoke: ok');
}
