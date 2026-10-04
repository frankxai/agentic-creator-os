// The Agent OS compiles agents from specs, so the compiled files, the typed
// graph, and the eval coverage can drift silently. These tests keep them honest:
// compiled agents are fresh, the graph obeys the ontology, every General carries
// least-privilege tools, a native memory scope, eval cases, and an A grade.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = (script, args = []) => execFileSync(process.execPath, [path.join(root, 'scripts', script), ...args], { cwd: root, encoding: 'utf8' });
const specs = readdirSync(path.join(root, 'agent-os', 'specs'))
  .filter((f) => f.endsWith('.agent.json'))
  .map((f) => JSON.parse(readFileSync(path.join(root, 'agent-os', 'specs', f), 'utf8')));

test('compiled core and instance agents are fresh', () => {
  assert.doesNotThrow(() => run('agent-compile.mjs', ['--check']));
  assert.doesNotThrow(() => run('agent-compile.mjs', ['--check', '--instance', 'frankx']));
});

test('agent-os graph obeys the ontology', () => {
  const out = run('agent-os-graph.mjs');
  assert.match(out, /agent-os-graph: \d+ nodes, \d+ edges/);
});

test('brand manifests resolve to real agents; typos fail instead of becoming phantom agents', () => {
  const fixtures = path.join(root, 'test', 'fixtures', 'agent-os');
  assert.match(run('agent-os-graph.mjs', ['--brands', path.join(fixtures, 'brands-valid')]), /nodes/);
  assert.throws(
    () => run('agent-os-graph.mjs', ['--brands', path.join(fixtures, 'brands-invalid')]),
    (err) => err.status === 1 && /unknown agent "general-cmoo"/.test(err.stderr) && /unknown agent "nobody-here"/.test(err.stderr),
  );
});

test('every compiled General declares tools, model, and a native memory scope', () => {
  for (const spec of specs) {
    for (const dir of ['.claude/agents', 'instances/frankx/agents']) {
      const file = path.join(root, dir, `${spec.id}.md`);
      assert.ok(existsSync(file), `${dir}/${spec.id}.md missing`);
      const fm = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
      assert.ok(fm, `${spec.id}: no frontmatter`);
      assert.match(fm[1], new RegExp(`^name: ${spec.id}$`, 'm'));
      assert.match(fm[1], /^description: ".*Use (when|for).*"$/m);
      assert.match(fm[1], /^tools: \S/m);
      assert.match(fm[1], /^model: (opus|sonnet|haiku|inherit)$/m);
      assert.match(fm[1], /^memory: (user|project|local)$/m);
    }
  }
});

test('every spec has at least one eval case with graders', () => {
  for (const spec of specs) {
    const dir = path.join(root, spec.evals);
    assert.ok(existsSync(dir), `${spec.id}: eval folder ${spec.evals} missing`);
    const cases = readdirSync(dir).filter((c) => existsSync(path.join(dir, c, 'prompt.md')));
    assert.ok(cases.length > 0, `${spec.id}: no eval case with prompt.md`);
    for (const c of cases) {
      const prompt = readFileSync(path.join(dir, c, 'prompt.md'), 'utf8').replace(/\r\n/g, '\n');
      assert.match(prompt, /^---\nmax_turns: \d+\nallowed_tools: \[.*\bAgent\b.*\]\n---\n/, `${spec.id}/${c}: prompt.md frontmatter`);
      assert.match(prompt, new RegExp(`\\b${spec.id}\\b`), `${spec.id}/${c}: prompt must name the agent under test`);
      const graders = path.join(dir, c, 'graders');
      assert.ok(existsSync(graders) && readdirSync(graders).length > 0, `${spec.id}/${c}: no graders`);
      for (const g of readdirSync(graders)) {
        const body = readFileSync(path.join(graders, g), 'utf8').replace(/\r\n/g, '\n');
        assert.match(body, /^---\ntype: (llm|regex|tool_used|tool_order|file_exists|baseline)\nweight: \d+(\.\d+)?\n---\n+\S/, `${spec.id}/${c}/${g}: grader frontmatter`);
      }
    }
  }
});

test('every General scores grade A on the estate audit', () => {
  const out = path.join(mkdtempSync(path.join(tmpdir(), 'acos-audit-')), 'audit.json');
  run('estate-audit.mjs', ['--home', root, '--json', out]);
  const audit = JSON.parse(readFileSync(out, 'utf8'));
  for (const spec of specs) {
    const item = audit.items.find((i) => i.kind === 'agent' && i.name === spec.id && i.scope === 'claude-user');
    assert.ok(item, `${spec.id} not found by the audit`);
    assert.ok(item.score >= 85, `${spec.id} scored ${item.score}: ${item.findings.join('; ')}`);
  }
});
