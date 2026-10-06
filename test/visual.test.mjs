// The visual check is the agents' eyes: it must actually render pages and catch
// what people would see. These tests render a fixture with deliberate defects in
// headless Chrome/Edge (skipped when no browser is installed; CI runners have one).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(root, 'scripts', 'visual-check.mjs');
const fixture = pathToFileURL(path.join(root, 'test', 'fixtures', 'visual', 'broken.html')).href;

function run(extra) {
  const out = mkdtempSync(path.join(tmpdir(), 'acos-visual-test-'));
  const r = spawnSync(process.execPath, [script, '--url', fixture, '--out', out, '--themes', 'light', ...extra], { encoding: 'utf8', timeout: 120000 });
  return { r, out };
}

const probe = run(['--widths', '375']);
// Rendering needs a browser and Node 22+ (built-in WebSocket). Elsewhere these skip with the reason;
// the dedicated visual job in agent-os.yml runs them on Node 22 with Chrome, so a real regression still fails CI.
const cannotRender = probe.r.status === 2 && /(no Chrome, Edge, or Chromium|needs Node 22)/.test(probe.r.stderr) && probe.r.stderr.trim();

test('renders a screenshot and catches every deliberate defect at phone width', { skip: cannotRender }, () => {
  const { r, out } = probe;
  assert.equal(r.status, 0, r.stderr);
  const report = JSON.parse(readFileSync(path.join(out, 'report.json'), 'utf8'));
  assert.equal(report.verdict, 'fail');
  const run375 = report.results[0];
  assert.ok(existsSync(run375.screenshot) && statSync(run375.screenshot).size > 1000, 'a real PNG was written');
  const blocking = run375.blocking.join(' | ');
  assert.match(blocking, /console error/);
  assert.match(blocking, /scrolls sideways/);
  assert.match(blocking, /without alt/);
  assert.match(blocking, /without an accessible name/);
  assert.match(run375.warnings.join(' | '), /covered by another element at first view: "Covered action"/);
  // Findings name the element so the fix is obvious; a visually hidden skip link is never reported as covered.
  assert.match(blocking, /without an accessible name, e\.g\. button\.nav-close\.icon/);
  assert.doesNotMatch(run375.warnings.join(' | '), /Skip to main content/);
  // Links inside a closed <details> menu are not rendered: never count them as unnamed or small.
  assert.equal(run375.probe.unnamedControls, 1, run375.blocking.join(' | '));
  assert.doesNotMatch(blocking, /closed-menu-link/);
});

test('--gate fails the run when blocking findings exist', { skip: cannotRender }, () => {
  const { r } = run(['--widths', '1440', '--gate']);
  assert.equal(r.status, 1);
});

test('rejects input that is not an http(s) or file URL', () => {
  const r = spawnSync(process.execPath, [script, '--url', 'javascript:alert(1)'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
});

test('rejects width or theme sets with an invalid entry instead of rendering nothing', () => {
  for (const extra of [['--widths', 'bogus'], ['--widths', '375,bogus'], ['--widths', '50'], ['--themes', 'sepia'], ['--themes', '']]) {
    const r = spawnSync(process.execPath, [script, '--url', fixture, '--gate', ...extra], { encoding: 'utf8' });
    assert.equal(r.status, 2, `${extra.join(' ')} must be refused`);
    assert.match(r.stderr, /must be (integers|light)/);
  }
});

test('--gate fails when the main frame cannot be loaded', { skip: cannotRender }, () => {
  const missing = pathToFileURL(path.join(root, 'test', 'fixtures', 'visual', 'does-not-exist.html')).href;
  const out = mkdtempSync(path.join(tmpdir(), 'acos-visual-test-'));
  const r = spawnSync(process.execPath, [script, '--url', missing, '--out', out, '--widths', '375', '--themes', 'light', '--gate'], { encoding: 'utf8', timeout: 120000 });
  assert.equal(r.status, 1, r.stderr);
  const report = JSON.parse(readFileSync(path.join(out, 'report.json'), 'utf8'));
  assert.match(report.results[0].blocking.join(' | '), /navigation failed: net::ERR_FILE_NOT_FOUND/);
});

// The weekly watch's shell block, run as written in agent-os.yml with visual-check stubbed out:
// a URL from visual-watch.json must never become more than one argument or a CLI option.
function watchBlock() {
  const yml = readFileSync(path.join(root, '.github', 'workflows', 'agent-os.yml'), 'utf8').replace(/\r\n/g, '\n');
  const m = yml.match(/- name: Render the brand front doors\n {8}run: \|\n((?: {10}.*\n|\n)+?)\n {6}- /);
  assert.ok(m, 'visual-watch render step not found');
  return m[1].split('\n').map((l) => l.slice(10)).join('\n')
    .replace('node scripts/visual-check.mjs', 'printf "%s\\n" >"$RUNNER_TEMP/argv"')
    .replace(/test -s [^\n]*\n/, '').replace(/cat [^\n]*report\.md[^\n]*\n/, '');
}
function runWatch(sites) {
  const dir = mkdtempSync(path.join(tmpdir(), 'acos-watch-'));
  mkdirSync(path.join(dir, 'instances', 'frankx', 'agent-os'), { recursive: true });
  writeFileSync(path.join(dir, 'instances', 'frankx', 'agent-os', 'visual-watch.json'), JSON.stringify({ widths: '375', themes: 'light', sites }));
  const r = spawnSync('bash', ['-c', watchBlock()], { cwd: dir, encoding: 'utf8', env: { ...process.env, RUNNER_TEMP: dir, GITHUB_STEP_SUMMARY: path.join(dir, 'summary') } });
  const argvFile = path.join(dir, 'argv');
  return { r, argv: existsSync(argvFile) ? readFileSync(argvFile, 'utf8').split('\n').slice(0, -1) : null };
}

test('visual-watch passes each https URL as exactly one argument', { skip: process.platform === 'win32' && 'needs bash' }, () => {
  const { r, argv } = runWatch([{ url: 'https://a.example/' }, { url: 'https://b.example/x?y=1&z=2' }]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(argv, ['--url', 'https://a.example/', '--url', 'https://b.example/x?y=1&z=2', '--widths', '375', '--themes', 'light', '--out', `${path.dirname(argv.at(-1))}/visual-watch`]);
});

test('visual-watch rejects a URL that is not https or carries whitespace or newlines', { skip: process.platform === 'win32' && 'needs bash' }, () => {
  for (const url of ['https://a.example/\n--out\n/tmp/pwned', 'https://a.example/ --browser /bin/sh', 'http://a.example/', 'file:///etc/passwd', '--out']) {
    const { r, argv } = runWatch([{ url: 'https://ok.example/' }, { url }]);
    assert.notEqual(r.status, 0, `${JSON.stringify(url)} must be rejected`);
    assert.equal(argv, null, `${JSON.stringify(url)}: visual-check must not run`);
  }
});
