// Mesh guards are only real if they are enforced in code. These tests run the
// doctor, dispatcher, status report, init, and template compile against fixtures:
// refusals leave receipts, a dispatched job really runs, and nothing needs a
// network, a secret, or another machine.
import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';

const made = [];
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); });

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = (name) => path.join(root, 'scripts', name);
const node = (args, opts = {}) => spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', ...opts });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fixture() {
  const dir = mkdtempSync(path.join(tmpdir(), 'acos-mesh-'));
  made.push(dir);
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

async function settled(receiptFile) {
  for (let i = 0; i < 100; i++) {
    const r = JSON.parse(readFileSync(receiptFile, 'utf8'));
    if (r.status !== 'started') return r;
    await sleep(100);
  }
  return JSON.parse(readFileSync(receiptFile, 'utf8'));
}

test('a job that exits non-zero ends as failed with its exit code, never as started or success', async () => {
  const { meshPath, receipts, job } = fixture();
  const mesh = JSON.parse(readFileSync(meshPath, 'utf8'));
  mesh.members.push({ id: 'crasher', kind: 'harness', probe: { bin: 'node' }, run: { mode: 'argv', argv: ['node', '-e', 'process.exit(7)'], local: true } });
  writeFileSync(meshPath, JSON.stringify(mesh));
  const bad = node([script('mesh-dispatch.mjs'), '--mesh', meshPath, '--member', 'crasher', '--job', job, '--json']);
  assert.equal(bad.status, 0, bad.stderr);
  const failed = await settled(path.join(receipts, `${JSON.parse(bad.stdout).id}.json`));
  assert.equal(failed.status, 'failed');
  assert.equal(failed.exitCode, 7);
  assert.ok(failed.endedAt);
  const good = node([script('mesh-dispatch.mjs'), '--mesh', meshPath, '--member', 'echo', '--job', job, '--json']);
  const ok = await settled(path.join(receipts, `${JSON.parse(good.stdout).id}.json`));
  assert.equal(ok.status, 'succeeded');
  assert.equal(ok.exitCode, 0);
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

function sleeperMesh(meshPath, cap) {
  const mesh = JSON.parse(readFileSync(meshPath, 'utf8'));
  mesh.zone.localParallel = { green: cap, yellow: cap, red: cap };
  mesh.members.push({ id: 'sleeper', kind: 'harness', probe: { bin: 'node' }, run: { mode: 'argv', argv: ['node', '-e', 'setTimeout(function () {}, 8000)'], local: true } });
  writeFileSync(meshPath, JSON.stringify(mesh));
}
const dispatchAsync = (args) => new Promise((done) => {
  const child = spawn(process.execPath, [script('mesh-dispatch.mjs'), ...args], { cwd: root });
  let stdout = '';
  child.stdout.on('data', (d) => { stdout += d; });
  child.on('close', (status) => done({ status, stdout }));
});
const killAll = (results) => { for (const r of results) { try { process.kill(JSON.parse(r.stdout).pid); } catch { /* refused or gone */ } } };

test('concurrent dispatches cannot overrun the zone cap: count and launch are atomic', async () => {
  const { meshPath, job } = fixture();
  sleeperMesh(meshPath, 1);
  const results = await Promise.all(Array.from({ length: 6 }, () => dispatchAsync(['--mesh', meshPath, '--member', 'sleeper', '--job', job, '--json'])));
  try {
    assert.equal(results.filter((r) => r.status === 0).length, 1, results.map((r) => r.stdout).join('\n'));
    assert.equal(results.filter((r) => r.status === 3).length, 5);
  } finally {
    killAll(results);
  }
});

test('a stale dispatch lock from a crashed run is cleared', () => {
  const { meshPath, receipts, job } = fixture();
  mkdirSync(receipts, { recursive: true });
  const lock = path.join(receipts, '.dispatch.lock');
  writeFileSync(lock, '');
  const old = new Date(Date.now() - 120000);
  utimesSync(lock, old, old);
  const r = node([script('mesh-dispatch.mjs'), '--mesh', meshPath, '--member', 'echo', '--job', job, '--json']);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(existsSync(lock), false, 'the lock is released after the receipt is written');
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
  made.push(dir);
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
  made.push(dir);
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
const HOSTILE_IDS = ['../x', '..', 'a/b', 'a\\b', '', 'Upper', 'http://evil.com', 'malicious.com', '<script>'];

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
    const tmp = mkdtempSync(path.join(tmpdir(), 'acos-org-'));
    made.push(tmp);
    const out = path.join(tmp, 'specs');
    const r = node([script('org-import.mjs'), '--org', org, '--instance', bad, '--out', out]);
    assert.equal(r.status, 2, `--instance ${JSON.stringify(bad)}: ${r.stderr}`);
    assert.equal(existsSync(out), false, `--instance ${JSON.stringify(bad)} wrote specs`);
  }
  const base = JSON.parse(readFileSync(org, 'utf8'));
  for (const bad of HOSTILE_IDS) {
    const dir = mkdtempSync(path.join(tmpdir(), 'acos-org-'));
    made.push(dir);
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

test('cross-family review selects engine based on free RAM and filters risky paths when files > 300', async () => {
  const { selectEngine, filterRiskyPaths, buildReviewComment } = await import(new URL('../scripts/cross-family-review.mjs', import.meta.url));

  assert.deepEqual(selectEngine(3.0), { engine: 'codex', mode: 'lean-local' });
  assert.deepEqual(selectEngine(2.5), { engine: 'codex', mode: 'lean-local' });
  assert.deepEqual(selectEngine(2.0), { engine: 'grok', mode: 'plan-no-tools' });

  const smallFiles = Array.from({ length: 10 }, (_, i) => `file${i}.txt`);
  assert.equal(filterRiskyPaths(smallFiles).length, 10);

  const largeFiles = Array.from({ length: 350 }, (_, i) => (i < 5 ? `.github/workflows/w${i}.yml` : `docs/doc${i}.md`));
  const filtered = filterRiskyPaths(largeFiles);
  assert.ok(filtered.length < 350, 'filtered list should be smaller than 350');
  assert.ok(filtered.some((f) => f.startsWith('.github/')), 'should keep risky paths like .github/');

  const comment = buildReviewComment({ verdict: 'PASSED', sha: 'abc1234', engine: { engine: 'codex', mode: 'lean-local' } });
  assert.equal(comment.header, 'CROSS-FAMILY REVIEW PASSED head=abc1234');
});

test('cross-family review CLI executes dry run and writes receipt when run', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'acos-review-'));
  made.push(dir);
  const receiptsDir = path.join(dir, 'dispatch');
  const job = path.join(dir, 'job.json');
  writeFileSync(job, JSON.stringify({ repo: 'frankxai/agentic-creator-os', pr: 98, sha: 'd8ca548', verdict: 'PASSED' }));

  const dry = node([script('cross-family-review.mjs'), '--job', job, '--dry-run', '--json']);
  assert.equal(dry.status, 0, dry.stderr);
  const dryOut = JSON.parse(dry.stdout);
  assert.equal(dryOut.member, 'review');
  assert.equal(dryOut.verdict, 'PASSED');
  assert.equal(dryOut.sha, 'd8ca548');
  assert.equal(dryOut.header, 'CROSS-FAMILY REVIEW PASSED head=d8ca548');

  const run = node([script('cross-family-review.mjs'), '--job', job, '--json'], { env: { ...process.env, ACOS_RECEIPTS_DIR: receiptsDir } });
  assert.equal(run.status, 0, run.stderr);
  const runOut = JSON.parse(run.stdout);
  assert.ok(runOut.receiptPath);
  assert.ok(existsSync(runOut.receiptPath));
  const receipt = JSON.parse(readFileSync(runOut.receiptPath, 'utf8'));
  assert.equal(receipt.header, 'CROSS-FAMILY REVIEW PASSED head=d8ca548');
});

test('dispatching review mesh member runs cross-family review via mesh-dispatch', async () => {
  const { meshPath, job } = fixture();
  const mesh = JSON.parse(readFileSync(meshPath, 'utf8'));
  mesh.members.push({
    id: 'review',
    kind: 'model-cli',
    probe: { bin: 'node' },
    run: { mode: 'argv', argv: ['node', script('cross-family-review.mjs'), '--job', '{job}', '--repo', '{repo}'], local: true, minRamGiB: 0.01 }
  });
  writeFileSync(meshPath, JSON.stringify(mesh));

  const reviewJob = path.join(path.dirname(job), 'review-job.json');
  writeFileSync(reviewJob, JSON.stringify({ repo: 'frankxai/agentic-creator-os', pr: 98, sha: 'd8ca548', verdict: 'PASSED' }));

  const r = node([script('mesh-dispatch.mjs'), '--mesh', meshPath, '--member', 'review', '--job', reviewJob, '--repo', 'frankxai/agentic-creator-os', '--json']);
  assert.equal(r.status, 0, r.stderr);
  const receipt = JSON.parse(r.stdout);
  assert.equal(receipt.member, 'review');
  assert.equal(receipt.status, 'started');

  const settledReceipt = await settled(path.join(path.dirname(receipt.job), 'dispatch', `${receipt.id}.json`));
  assert.equal(settledReceipt.status, 'succeeded');
  assert.equal(settledReceipt.exitCode, 0);
});

test('all mesh temp directories are registered for cleanup', () => {
  assert.ok(made.length >= 20, `expected at least 20 temp entries in made, got ${made.length}`);
  for (const d of made) {
    assert.ok(existsSync(d), `temp entry ${d} must exist during test execution before after() cleanup`);
  }
});
