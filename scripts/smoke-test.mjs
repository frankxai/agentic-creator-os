#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

let failed = false;

// 1. Read marketplace/plugin manifests and assert referenced paths exist on disk
const catalogPath = 'tools/observatory/public/catalog.json';
if (existsSync(catalogPath)) {
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
    if (catalog.nodes) {
        for (const node of catalog.nodes) {
            if (node.file && !existsSync(node.file)) {
                console.error(`Missing file referenced in catalog: ${node.file}`);
                failed = true;
            }
        }
    }
} else {
    console.error("tools/observatory/public/catalog.json not found");
    failed = true;
}

// 2. Assert every command shown in README quickstart code blocks maps to a script in package.json
const readmePath = 'README.md';
const pkgPath = 'package.json';

if (existsSync(readmePath) && existsSync(pkgPath)) {
    const readme = readFileSync(readmePath, 'utf8');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const scripts = Object.keys(pkg.scripts || {});

    const quickstartSection = readme.split('## Quick start')[1]?.split('## ')[0];
    if (quickstartSection) {
        const lines = quickstartSection.split('\n');
        let inCodeBlock = false;
        for (const line of lines) {
            if (line.startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                continue;
            }
            if (inCodeBlock && line.trim() && !line.trim().startsWith('#')) {
                const cmdStr = line.trim();
                // Filter only for commands that could be mapped to package scripts
                // Assuming only commands starting with `npm run` or `pnpm` would map to package.json scripts.
                if (cmdStr.startsWith('npm run ') || cmdStr.startsWith('pnpm ')) {
                    let cmdName = cmdStr.split(' ')[2];
                    if (cmdStr.startsWith('pnpm ')) {
                        cmdName = cmdStr.split(' ')[1];
                    }
                    if (cmdName && !scripts.includes(cmdName)) {
                        console.error(`Command shown in README quickstart does not map to a package.json script: ${cmdStr}`);
                        failed = true;
                    }
                } else if (cmdStr.startsWith('node ')) {
                    // node scripts may also run a script directly, but they don't map to package.json script names directly.
                } else {
                    // For example, 'git clone', 'cd', './install.sh', 'claude plugin'
                    // We assume the prompt meant "npm run" commands or we just skip non-npm commands since they cannot map to package.json
                }
            }
        }
    }
}

if (failed) {
    process.exit(1);
} else {
    process.exit(0);
}
