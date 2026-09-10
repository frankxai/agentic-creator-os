#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function option(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const manifestPath = path.resolve(option('--manifest', path.join(repoRoot, 'instances', 'frankx', 'portability-manifest.json')));
const homeRoot = path.resolve(option('--home', os.homedir()));
const checkOnly = process.argv.includes('--check');
const dryRun = process.argv.includes('--dry-run');

function assertInside(parent, candidate, label) {
  const relative = path.relative(parent, candidate);
  if (relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))) return;
  throw new Error(`${label} escapes its allowed root: ${candidate}`);
}

async function listFiles(root, current = root) {
  const entries = await fs.readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(root, absolute));
    else if (entry.isFile()) files.push(path.relative(root, absolute).replaceAll('\\', '/'));
  }
  return files;
}

async function digest(root, expectedFiles = null) {
  const files = expectedFiles ?? await listFiles(root);
  const hash = createHash('sha256');
  for (const relative of files) {
    const absolute = path.join(root, ...relative.split('/'));
    hash.update(relative);
    hash.update('\0');
    hash.update(await fs.readFile(absolute));
    hash.update('\0');
  }
  return hash.digest('hex');
}

async function targetState(source, target) {
  try {
    const sourceFiles = await listFiles(source);
    const targetFiles = await listFiles(target);
    const missing = sourceFiles.filter((file) => !targetFiles.includes(file));
    const extra = targetFiles.filter((file) => !sourceFiles.includes(file));
    const sourceDigest = await digest(source, sourceFiles);
    const targetDigest = missing.length ? null : await digest(target, sourceFiles);
    return {
      exists: true,
      matches: missing.length === 0 && extra.length === 0 && sourceDigest === targetDigest,
      sourceDigest,
      targetDigest,
      missing,
      extra
    };
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return { exists: false, matches: false, sourceDigest: await digest(source), targetDigest: null, missing: [], extra: [] };
    }
    throw error;
  }
}

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.assets)) {
  throw new Error('Unsupported portability manifest schema.');
}

const results = [];
for (const asset of manifest.assets) {
  if (asset.status !== 'active') continue;
  for (const field of ['id', 'kind', 'source', 'license', 'trustTier']) {
    if (!asset[field]) throw new Error(`Asset is missing required field ${field}: ${JSON.stringify(asset)}`);
  }
  if (!asset.provenance?.origin) throw new Error(`Asset ${asset.id} is missing provenance.origin.`);
  if (!Array.isArray(asset.targets) || asset.targets.length === 0) throw new Error(`Asset ${asset.id} has no targets.`);

  const source = path.resolve(repoRoot, asset.source);
  assertInside(repoRoot, source, `Source for ${asset.id}`);
  const sourceStat = await fs.stat(source);
  if (!sourceStat.isDirectory()) throw new Error(`Only directory assets are supported: ${source}`);

  for (const relativeTarget of asset.targets) {
    if (path.isAbsolute(relativeTarget)) throw new Error(`Target must be home-relative: ${relativeTarget}`);
    const target = path.resolve(homeRoot, relativeTarget);
    assertInside(homeRoot, target, `Target for ${asset.id}`);
    let before = await targetState(source, target);

    if (!checkOnly && !dryRun && !before.matches) {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.cp(source, target, { recursive: true, force: true, errorOnExist: false });
    }

    const after = checkOnly || dryRun ? before : await targetState(source, target);
    results.push({
      asset: asset.id,
      kind: asset.kind,
      target,
      action: before.matches ? 'unchanged' : checkOnly ? 'drift' : dryRun ? 'would-sync' : after.matches ? 'synced' : 'attention-required',
      digest: after.sourceDigest,
      missing: after.missing,
      extra: after.extra
    });
  }
}

const failures = results.filter((result) => ['drift', 'attention-required'].includes(result.action));
const receipt = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  manifest: path.relative(repoRoot, manifestPath).replaceAll('\\', '/'),
  sourceOfTruth: manifest.sourceOfTruth,
  mode: checkOnly ? 'check' : dryRun ? 'dry-run' : 'sync',
  results
};

if (!checkOnly && !dryRun) {
  const receiptPath = path.join(homeRoot, '.agents', 'state', 'acos-portability.json');
  await fs.mkdir(path.dirname(receiptPath), { recursive: true });
  await fs.writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
}

console.log(JSON.stringify(receipt, null, 2));
if (failures.length) process.exitCode = 1;
