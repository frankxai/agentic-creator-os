// Mesh guards are only real if they are enforced in code. These tests run the
// doctor, dispatcher, status report, init, and template compile against fixtures:
// refusals leave receipts, a dispatched job really runs, and nothing needs a
// network, a secret, or another machine.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = (name) => path.join(root, 'scripts', name);
const node = (args, opts = {}) => spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', ...opts });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fixture() {
  const dir = mkdtempSync(path.join(tmpdir(), 'acos-mesh-'));
  const receipts = path.join(dir, 'dispatch');
  const pulse = path.join(dir, 'pulse.jsonl');
  writeFileSync(pulse, JSON.stringify({ ts: new Date().toISOString(), status: 'ok', totals: { loadableAverage: 80, deadSkills: 1, shadowedNames: 2 } }) + '\n');
  const echo = [process.execPath, '-e', 'process.stdin.pipe(process.stdout)'];
  const mesh = {
    schema: 'acos.mesh.v1',
    machine: 'fixture',
    receiptsDir: receipts,
    zone: { green: { ramGiB: 0, diskGiB: 0 }, yellow: { ramGiB: 0, diskGiB: 0 } },
    alwaysOn: { pulse: { receipts: pulse, maxAgeDays: 8 } },
    members: [
      { id: 'echo', kind: 'harness', probe: { bin: 'node' }, run: { mode: 'argv', argv: ['node', ...echo.slice(1)], stdin: 'job', local: true, minRamGiB: 0.01, maxConcurrent: 5 } },
      { id: 'hungry', kind: 'model-cli', probe: { bin: 'node' }, run: { mode: 'argv', argv: ['node', '-v'], local: true, minRamGiB: 99999 } },
      { id: 'broken', kind: 'router', knownIssue: 'missing dependency', probe: { bin: 'node' }, run: { mode: 'argv', argv: ['node', '-v'] } },
      { id: 'cloud', kind: 'cloud', run: { mode: 'session' } },
    ],
  };
  const meshPath = path.join(dir, 'mesh.json');
  writeFileSync(meshPath, JSON.stringify(mesh, null, 2));
  const job = path.join(dir, 'job.md');
  writeFileSync(job, 'hello from the mesh test\n');
  return { dir, meshPath, receipts, job };
}

test('mesh doctor reports a zone and probes members in-process', () => {
  const { meshPath } = fixture();
  const out = JSON.parse(execFileSync(process.execPath, [script('mesh-doctor.mjs'), '--mesh', meshPath, '--json'], { encoding: 'utf8' }));
  assert.equal(out.zone, 'green');
  assert.equal(out.members.find((m) => m.id === 'echo').ok, true);
  assert.equal(out.members.find((m) => m.id === 'broken').ok, false, 'known issues stay down without a deep probe');
});

test('dispatch guards refuse in code and leave a receipt for every refusal', () => {
  const { meshPath, receipts, job } = fixture();
  for (const [member, why] of [['hungry', /needs 99999 GiB/], ['broken', /member is down/], ['cloud', /Claude session/], ['nobody', /no member/]]) {
    const r = node([script('mesh-dispatch.mjs'), '--mesh', meshPath, '--member', member, '--job', job, '--json']);
    assert.equal(r.status, 3, `${member} should be refused`);
    assert.match(JSON.parse(r.stdout).reason, why);
  }
  assert.equal(readdirSync(receipts).filter((f) => f.endsWith('.json')).length, 4);
});

test('dry run resolves the command without running it or writing a receipt', () => {
  const { meshPath, receipts, job } = fixture();
  const r = node([script('mesh-dispatch.mjs'), '--mesh', meshPath, '--member', 'echo', '--job', job, '--dry-run', '--json']);
  assert.equal(r.status, 0);
  assert.equal(JSON.parse(r.stdout).status, 'dry-run');
  assert.equal(existsSync(receipts), false);
});

test('a dispatched job really runs in the background and its output lands next to the receipt', async () => {
  const { meshPath, job } = fixture();
  const r = node([script('mesh-dispatch.mjs'), '--mesh', meshPath, '--member', 'echo', '--job', job, '--json']);
  assert.equal(r.status, 0, r.stderr);
  const receipt = JSON.parse(r.stdout);
  assert.equal(receipt.status, 'started');
  assert.ok(receipt.pid > 0);
  for (let i = 0; i < 50 && !readFileSync(receipt.out, 'utf8').includes('hello'); i++) await sleep(100);
  assert.match(readFileSync(receipt.out, 'utf8'), /hello from the mesh test/);
});

test('an npm Windows shim resolves to its JavaScript entry (background output is kept)', async () => {
  const { npmShimEntry } = await import(new URL('../scripts/lib/mesh-core.mjs', import.meta.url));
  const dir = mkdtempSync(path.join(tmpdir(), 'acos-shim-'));
  const entryDir = path.join(dir, 'node_modules', '@x', 'tool', 'bin');
  execFileSync(process.execPath, ['-e', `require('fs').mkdirSync(${JSON.stringify(entryDir)}, { recursive: true })`]);
  writeFileSync(path.join(entryDir, 'tool.js'), 'console.log(1)\n');
  const shim = path.join(dir, 'tool.cmd');
  writeFileSync(shim, '@ECHO off\r\nendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\node_modules\\@x\\tool\\bin\\tool.js" %*\r\n');
  assert.equal(npmShimEntry(shim), path.join(entryDir, 'tool.js'));
  writeFileSync(shim, '@ECHO off\r\necho not an npm shim\r\n');
  assert.equal(npmShimEntry(shim), null);
});

test('always-on status reads receipts only and marks missing clocks as not running', () => {
  const { meshPath } = fixture();
  const out = JSON.parse(execFileSync(process.execPath, [script('always-on-status.mjs'), '--mesh', meshPath, '--json', '--no-gh'], { encoding: 'utf8' }));
  const pulse = out.clocks.find((c) => c.clock === 'pulse');
  assert.equal(pulse.state, 'ok');
  assert.match(pulse.evidence, /average 80/);
});

test('a new adopter instance compiles from the template, out of tree', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'acos-adopt-'));
  const org = path.join(root, 'instances', '_template', 'agent-os', 'org', 'domain-queens.example.json');
  execFileSync(process.execPath, [script('org-import.mjs'), '--org', org, '--instance', '_template', '--out', path.join(dir, 'specs')], { encoding: 'utf8' });
  execFileSync(process.execPath, [script('agent-compile.mjs'), '--instance', '_template', '--instance-specs', path.join(dir, 'specs'), '--out', path.join(dir, 'agents')], { encoding: 'utf8' });
  const agents = readdirSync(path.join(dir, 'agents'));
  assert.ok(agents.includes('general-ceo.md') && agents.some((f) => f.startsWith('queen-')), agents.join(', '));
  const init = node([script('agent-os-init.mjs'), '--name', 'frankx']);
  assert.equal(init.status, 1, 'init must refuse an existing instance');
});
