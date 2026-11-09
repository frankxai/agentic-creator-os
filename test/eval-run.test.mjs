// The eval harness runs models only by hand, so its plan, its log schema, its RESULTS.md render,
// and its regression rule must be provably right without a model call.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  REQUIRED_LINE_KEYS, buildPlan, buildResultLine, checkRegression, formatPlan, loadCases,
  parseArgs, parseFrontmatter, renderResultsMd, scoreOf, validateCases,
} from '../scripts/eval-run.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('parseArgs reads flags and rejects bad input', () => {
  const o = parseArgs(['--agent', 'worker-publisher', '--case', 'stop-at-the-gate', '--dry-run', '--grader', 'claude', '--out', 'x']);
  assert.deepEqual(o, { agent: 'worker-publisher', case: 'stop-at-the-gate', dryRun: true, grader: 'claude', out: 'x', render: false, validate: false });
  assert.equal(parseArgs([]).grader, 'codex');
  assert.throws(() => parseArgs(['--grader', 'gpt']), /codex or claude/);
  assert.throws(() => parseArgs(['--agent']), /needs a value/);
  assert.throws(() => parseArgs(['--case', 'a']), /needs --agent/);
  assert.throws(() => parseArgs(['--nope']), /unknown argument/);
});

test('frontmatter parser reads numbers and inline lists', () => {
  const f = parseFrontmatter('---\nmax_turns: 15\nallowed_tools: [Agent, Read]\n---\n\nbody here\n');
  assert.equal(f.data.max_turns, 15);
  assert.deepEqual(f.data.allowed_tools, ['Agent', 'Read']);
  assert.equal(f.body, 'body here');
  assert.equal(parseFrontmatter('no frontmatter'), null);
});

test('every committed eval case is structurally valid', () => {
  const cases = loadCases(root);
  assert.ok(cases.length >= 12);
  assert.deepEqual(validateCases(cases), []);
});

test('validateCases flags a missing prompt and missing graders', () => {
  const bad = [{ agent: 'a', name: 'b', hasPrompt: false, graders: [] }, { agent: 'a', name: 'c', hasPrompt: true, maxTurns: 5, allowedTools: ['Read'], prompt: 'x', graders: [] }];
  const problems = validateCases(bad);
  assert.match(problems[0], /prompt\.md missing/);
  assert.match(problems[1], /at least one graders/);
});

test('dry-run plan for worker-publisher names the case, frontmatter, graders, and commands', () => {
  const [c] = loadCases(root, { agent: 'worker-publisher' });
  const plan = buildPlan(c, parseArgs(['--dry-run']), root);
  assert.equal(plan.case, 'stop-at-the-gate');
  assert.equal(plan.maxTurns, 15);
  assert.equal(plan.grade.length, 4);
  assert.match(plan.session, /^claude -p ".*" --max-turns 15 --output-format json --allowedTools Agent,Read,Glob,Grep,Bash$/);
  assert.match(plan.grade[0].cmd, /codex exec --sandbox read-only/);
  assert.match(plan.grade[0].cmd, /same-family/);
  assert.match(formatPlan(plan), /fresh session/);
  assert.match(plan.sourceHash, /^[0-9a-f]{16}$/);
});

test('dry-run CLI prints the plan and writes nothing', () => {
  const out = execFileSync(process.execPath, [path.join(root, 'scripts', 'eval-run.mjs'), '--agent', 'worker-publisher', '--dry-run'], { cwd: root, encoding: 'utf8' });
  assert.match(out, /worker-publisher \/ stop-at-the-gate/);
  assert.match(out, /criterion-4/);
});

test('result line carries the full schema and a weighted score', () => {
  const criteria = [{ id: 'c1', weight: 1, pass: true, evidence: 'e' }, { id: 'c2', weight: 3, pass: false, evidence: 'f' }];
  assert.equal(scoreOf(criteria), 0.25);
  const line = buildResultLine({ agent: 'a', caseName: 'b', hash: 'abc', grader: 'codex', criteria, transcript: '/t.json', date: '2026-10-07' });
  for (const k of REQUIRED_LINE_KEYS) assert.ok(k in line, `missing ${k}`);
  assert.equal(line.score, 0.25);
  assert.deepEqual(JSON.parse(JSON.stringify(line)), line);
});

test('RESULTS.md render keeps manual rows and is idempotent', () => {
  const manual = '# Eval results\n\nIntro line.\n\n| Date | Agent |\n| --- | --- |\n| 2026-10-05 | worker-publisher |\n';
  const rows = [buildResultLine({ agent: 'a', caseName: 'b', hash: 'abc', grader: 'codex', criteria: [{ id: 'c', weight: 1, pass: true, evidence: '' }], transcript: 't', date: '2026-10-07' })];
  const once = renderResultsMd(manual, rows);
  assert.match(once, /## Manual runs[\s\S]*\| 2026-10-05 \| worker-publisher \|/);
  assert.match(once, /\| 2026-10-07 \| a \| b \| `abc` \| codex \| 1 \| 1\/1 \|/);
  assert.equal(renderResultsMd(once, rows), once);
  const more = renderResultsMd(once, [...rows, { ...rows[0], case: 'z' }]);
  assert.match(more, /\| z \|/);
  assert.match(more, /Intro line\./);
});

test('regression rule: a lower score than the last passing one fails', () => {
  assert.equal(checkRegression(1, 0.75).ok, false);
  assert.equal(checkRegression(0.75, 0.75).ok, true);
  assert.equal(checkRegression(0.75, 1).ok, true);
  assert.equal(checkRegression(null, 0).ok, true);
});
