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

test('the zone cap refuses another local job while one is running, whichever member it targets', () => {
  const { dir, meshPath, job } = fixture();
  const mesh = JSON.parse(readFileSync(meshPath, 'utf8'));
  mesh.zone.localParallel = { green: 1, yellow: 1, red: 1 };
  mesh.members.push({ id: 'sleeper', kind: 'harness', probe: { bin: 'node' }, run: { mode: 'argv', argv: ['node', '-e', 'setTimeout(function () {}, 8000)'], local: true } });
  writeFileSync(meshPath, JSON.stringify(mesh));
  const first = node([script('mesh-dispatch.mjs'), '--mesh', meshPath, '--member', 'sleeper', '--job', job, '--json']);
  assert.equal(first.status, 0, first.stderr);
  const pid = JSON.parse(first.stdout).pid;
  try {
    const second = node([script('mesh-dispatch.mjs'), '--mesh', meshPath, '--member', 'echo', '--job', job, '--json']);
    assert.equal(second.status, 3);
    assert.match(JSON.parse(second.stdout).reason, /allows 1 local job/);
  } finally {
    try { process.kill(pid); } catch { /* already gone */ }
  }
  assert.ok(dir);
});

test('free disk that cannot be read is never green: the zone is unknown and local dispatch is refused', () => {
  const { dir, meshPath, receipts, job } = fixture();
  const mesh = JSON.parse(readFileSync(meshPath, 'utf8'));
  mesh.zone.diskPath = path.join(dir, 'no-such-disk');
  writeFileSync(meshPath, JSON.stringify(mesh));
  const doctor = JSON.parse(execFileSync(process.execPath, [script('mesh-doctor.mjs'), '--mesh', meshPath, '--json'], { encoding: 'utf8' }));
  assert.equal(doctor.zone, 'unknown');
  assert.equal(doctor.diskFreeGiB, null);
  assert.equal(doctor.localParallelCap, 0);
  const r = node([script('mesh-dispatch.mjs'), '--mesh', meshPath, '--member', 'echo', '--job', job, '--json']);
  assert.equal(r.status, 3, r.stderr);
  assert.match(JSON.parse(r.stdout).reason, /zone unknown allows 0 local job/);
  assert.equal(readdirSync(receipts).filter((f) => f.endsWith('.out.txt')).length, 0, 'nothing was launched');
});

test('registry values never reach a shell: an unsafe CI repo is refused before gh runs', () => {
  const { meshPath } = fixture();
  const mesh = JSON.parse(readFileSync(meshPath, 'utf8'));
  mesh.alwaysOn.ci = { repo: 'owner/repo & calc', workflow: 'agent-os.yml' };
  writeFileSync(meshPath, JSON.stringify(mesh));
  const out = JSON.parse(execFileSync(process.execPath, [script('always-on-status.mjs'), '--mesh', meshPath, '--json', '--no-gh'], { encoding: 'utf8' }));
  assert.match(out.clocks.find((c) => c.clock === 'ci').evidence, /refused/);
  const src = readFileSync(script('mesh-dispatch.mjs'), 'utf8') + readFileSync(script('always-on-status.mjs'), 'utf8') + readFileSync(path.join(root, 'scripts', 'lib', 'mesh-core.mjs'), 'utf8');
  assert.doesNotMatch(src, /shell:\s*(true|process\.platform|platform\(\))/, 'no shell-enabled spawn in the mesh scripts');
  assert.doesNotMatch(src, /spawn(Sync)?\(\s*['"]cmd\.exe/, 'no cmd.exe fallback');
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

test('the reusable audit action runs the scanner on the calling repository without secrets', () => {
  const action = readFileSync(path.join(root, '.github', 'actions', 'agent-os-audit', 'action.yml'), 'utf8');
  assert.match(action, /using: composite/);
  assert.match(action, /node \.acos-agent-os\/scripts\/estate-audit\.mjs --home "\$GITHUB_WORKSPACE"/);
  assert.doesNotMatch(action, /secrets\./, 'the action must not need secrets');
  assert.match(action, /MIN_SCORE: \$\{\{ inputs\.min-score \}\}/, 'inputs reach the shell through env, not inline interpolation');
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

test('ids that become path segments are refused before any file is written', () => {
  const { dir, meshPath, receipts, job } = fixture();
  const r = node([script('mesh-dispatch.mjs'), '--mesh', meshPath, '--member', '../../escape', '--job', job, '--json']);
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /--member must be a mesh id/);
  assert.equal(existsSync(receipts) ? readdirSync(receipts).length : 0, 0, 'no receipt may be written');
  assert.equal(existsSync(path.join(dir, '..', 'escape.json')), false);
  const org = path.join(root, 'instances', '_template', 'agent-os', 'org', 'domain-queens.example.json');
  const o = node([script('org-import.mjs'), '--org', org, '--instance', '../escape', '--check']);
  assert.equal(o.status, 2, o.stderr);
  assert.match(o.stderr, /--instance must be a plain id/);
});

// Every id that names a file must be a plain id; the same hostile set is refused at each entry point.
const HOSTILE_IDS = ['../x', '..', 'a/b', 'a\\b', '', 'Upper'];

test('mesh-dispatch refuses every hostile --member before a receipt is written', () => {
  for (const bad of HOSTILE_IDS) {
    const { dir, meshPath, receipts, job } = fixture();
    const r = node([script('mesh-dispatch.mjs'), '--mesh', meshPath, '--member', bad, '--job', job, '--json']);
    assert.equal(r.status, 2, `--member ${JSON.stringify(bad)}: ${r.stderr}`);
    assert.equal(existsSync(receipts), false, `--member ${JSON.stringify(bad)} wrote into receipts`);
    assert.deepEqual(readdirSync(dir).sort(), ['job.md', 'mesh.json', 'pulse.jsonl'], `--member ${JSON.stringify(bad)} wrote a file`);
  }
});

test('org-import refuses every hostile --instance and domain before a spec is written', () => {
  const org = path.join(root, 'instances', '_template', 'agent-os', 'org', 'domain-queens.example.json');
  for (const bad of HOSTILE_IDS) {
    const out = path.join(mkdtempSync(path.join(tmpdir(), 'acos-org-')), 'specs');
    const r = node([script('org-import.mjs'), '--org', org, '--instance', bad, '--out', out]);
    assert.equal(r.status, 2, `--instance ${JSON.stringify(bad)}: ${r.stderr}`);
    assert.equal(existsSync(out), false, `--instance ${JSON.stringify(bad)} wrote specs`);
  }
  const base = JSON.parse(readFileSync(org, 'utf8'));
  for (const bad of HOSTILE_IDS) {
    const dir = mkdtempSync(path.join(tmpdir(), 'acos-org-'));
    const hostile = structuredClone(base);
    hostile.domains[0].domain = bad;
    const orgPath = path.join(dir, 'org.json');
    writeFileSync(orgPath, JSON.stringify(hostile));
    const out = path.join(dir, 'specs');
    const r = node([script('org-import.mjs'), '--org', orgPath, '--instance', '_template', '--out', out]);
    assert.equal(r.status, 1, `domain ${JSON.stringify(bad)}: ${r.stderr}`);
    assert.match(r.stderr, /must be a plain id/);
    assert.equal(existsSync(out), false, `domain ${JSON.stringify(bad)} wrote specs`);
    assert.deepEqual(readdirSync(dir), ['org.json'], `domain ${JSON.stringify(bad)} wrote outside specs`);
  }
});
