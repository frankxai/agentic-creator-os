#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';

// pnpm subcommands that are not package scripts. `pnpm run <name>` and `pnpm <name>`
// resolve to scripts; these resolve to built-in commands.
const PNPM_BUILTINS = new Set([
    'install', 'i', 'add', 'remove', 'rm', 'update', 'up', 'run', 'exec', 'dlx', 'create',
    'init', 'link', 'unlink', 'list', 'ls', 'outdated', 'audit', 'store', 'fetch', 'pack',
    'publish', 'rebuild', 'prune', 'dedupe', 'import', 'why', 'env', 'setup', 'self-update',
]);

const failures = [];
const fail = (message) => failures.push(message);

// 1. Every file referenced by the catalog must exist. Missing inputs are failures, not passes.
const catalogPath = 'tools/observatory/public/catalog.json';
if (!existsSync(catalogPath)) {
    fail(`${catalogPath} not found`);
} else {
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
    if (!Array.isArray(catalog.nodes)) {
        fail(`${catalogPath} has no "nodes" array; catalog schema changed`);
    } else {
        for (const node of catalog.nodes) {
            if (node.file && !existsSync(node.file)) {
                fail(`Missing file referenced in catalog: ${node.file}`);
            }
        }
    }
}

// 2. Every `npm run` / `pnpm` command in the README quickstart must map to a package.json script.
if (!existsSync('README.md')) fail('README.md not found');
if (!existsSync('package.json')) fail('package.json not found');

if (existsSync('README.md') && existsSync('package.json')) {
    const readme = readFileSync('README.md', 'utf8');
    const scripts = Object.keys(JSON.parse(readFileSync('package.json', 'utf8')).scripts || {});
    const quickstart = readme.split(/^## Quick start\s*$/m)[1]?.split(/^## /m)[0];

    if (quickstart === undefined) {
        fail('README.md has no "## Quick start" section');
    } else {
        let inCodeBlock = false;
        for (const raw of quickstart.split(/\r?\n/)) {
            const line = raw.trim();
            if (line.startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                continue;
            }
            if (!inCodeBlock || !line || line.startsWith('#')) continue;

            const parts = line.split(/\s+/);
            let name;
            if (parts[0] === 'npm' && parts[1] === 'run') name = parts[2];
            else if (parts[0] === 'pnpm' && parts[1] === 'run') name = parts[2];
            else if (parts[0] === 'pnpm' && !PNPM_BUILTINS.has(parts[1])) name = parts[1];
            else continue;

            if (!name || !scripts.includes(name)) {
                fail(`Command shown in README quickstart does not map to a package.json script: ${line}`);
            }
        }
    }
}

for (const message of failures) console.error(message);
process.exit(failures.length ? 1 : 0);
