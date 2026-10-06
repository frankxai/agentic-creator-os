// The visual check is the agents' eyes: it must actually render pages and catch
// what people would see. These tests render a fixture with deliberate defects in
// headless Chrome/Edge (skipped when no browser is installed; CI runners have one).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, statSync } from 'node:fs';
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
