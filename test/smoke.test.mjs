import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const script = readFileSync('scripts/smoke-test.mjs', 'utf8');

// Builds a throwaway repo, runs the smoke script in it, returns { status, stderr }.
function run({ readme = '## Quick start\n\n```bash\nnpm run fake\n```\n## Next', pkg = { scripts: { fake: 'echo hi' } }, catalog = { nodes: [] } } = {}) {
    const dir = mkdtempSync(join(tmpdir(), 'acos-smoke-'));
    try {
        if (readme !== null) writeFileSync(join(dir, 'README.md'), readme);
        if (pkg !== null) writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg));
        if (catalog !== null) {
            mkdirSync(join(dir, 'tools/observatory/public'), { recursive: true });
            writeFileSync(join(dir, 'tools/observatory/public/catalog.json'), JSON.stringify(catalog));
        }
        mkdirSync(join(dir, 'scripts'));
        writeFileSync(join(dir, 'scripts/smoke-test.mjs'), script);
        const r = spawnSync('node', ['scripts/smoke-test.mjs'], { cwd: dir, encoding: 'utf8' });
        return { status: r.status, stderr: r.stderr };
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
}

test('passes on a consistent repo', () => {
    assert.strictEqual(run().status, 0);
});

test('fails when a catalog node references a missing file', () => {
    const r = run({ catalog: { nodes: [{ file: 'missing.md' }] } });
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /Missing file referenced in catalog: missing\.md/);
});

test('fails when the catalog has no nodes array', () => {
    const r = run({ catalog: {} });
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /no "nodes" array/);
});

test('fails when README.md or package.json is missing', () => {
    assert.match(run({ readme: null }).stderr, /README\.md not found/);
    assert.match(run({ pkg: null }).stderr, /package\.json not found/);
});

test('fails when the README has no Quick start section', () => {
    const r = run({ readme: '# Title\n\nno quickstart here' });
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /no "## Quick start" section/);
});

test('"pnpm run <script>" is checked against the script name, not "run"', () => {
    const readme = '## Quick start\n\n```bash\npnpm run build\n```\n';
    assert.strictEqual(run({ readme, pkg: { scripts: { build: 'x' } } }).status, 0);
    assert.strictEqual(run({ readme, pkg: { scripts: {} } }).status, 1);
});

test('pnpm built-ins are not treated as package scripts', () => {
    const readme = '## Quick start\n\n```bash\npnpm install\npnpm add left-pad\n```\n';
    assert.strictEqual(run({ readme, pkg: { scripts: {} } }).status, 0);
});

test('an unknown "pnpm <name>" command fails', () => {
    const readme = '## Quick start\n\n```bash\npnpm nope\n```\n';
    const r = run({ readme, pkg: { scripts: {} } });
    assert.strictEqual(r.status, 1);
    assert.match(r.stderr, /pnpm nope/);
});
