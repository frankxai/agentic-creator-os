import test from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

test('smoke-test.mjs exits 1 when a referenced file is missing', () => {
    let tempDir;
    try {
        tempDir = mkdtempSync(join(tmpdir(), 'acos-smoke-test-'));

        // Create mock README and package.json
        writeFileSync(join(tempDir, 'README.md'), '## Quick start\n\n```bash\nnpm run fake\n```\n## Verified public surface');
        writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ scripts: { fake: "echo hello" } }));

        // Create mock catalog
        mkdirSync(join(tempDir, 'tools/observatory/public'), { recursive: true });
        const catalog = {
            nodes: [
                { file: "existing.md" },
                { file: "missing.md" }
            ]
        };
        writeFileSync(join(tempDir, 'tools/observatory/public/catalog.json'), JSON.stringify(catalog));
        writeFileSync(join(tempDir, 'existing.md'), 'content');

        // Copy the script
        mkdirSync(join(tempDir, 'scripts'), { recursive: true });
        const scriptContent = readFileSync('scripts/smoke-test.mjs', 'utf8');
        writeFileSync(join(tempDir, 'scripts/smoke-test.mjs'), scriptContent);

        try {
            execSync('node scripts/smoke-test.mjs', { cwd: tempDir, stdio: 'pipe' });
            assert.fail('Expected script to exit with code 1');
        } catch (error) {
            assert.strictEqual(error.status, 1, 'Script should exit with code 1');
            assert.ok(error.stderr.toString().includes('Missing file referenced in catalog: missing.md'), 'Should print missing file error');
        }
    } finally {
        if (tempDir) {
            rmSync(tempDir, { recursive: true, force: true });
        }
    }
});
