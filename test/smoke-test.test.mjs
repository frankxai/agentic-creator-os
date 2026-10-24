// The smoke test is only worth having if it fails for the right reason.
// Each case builds a minimal fixture tree in os.tmpdir() and checks the exact exit code and diagnostic.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'smoke-test.mjs');
const made = [];
after(() => { for (const d of made) rmSync(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); });

const write = (root, rel, text) => {
  const file = path.join(root, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text);
};

function fixture(readmeCommands = 'npm run build\npnpm lint\nnpm install') {
  const root = mkdtempSync(path.join(tmpdir(), 'acos-smoke-'));
  made.push(root);
  write(root, '.claude-plugin/plugin.json', JSON.stringify({ name: 'fx', version: '1.0.0' }));
  write(root, '.claude-plugin/marketplace.json', JSON.stringify({
    name: 'fx-market',
    plugins: [{ name: 'core', source: './plugins/core', commands: ['./commands/go.md'] }],
  }));
  write(root, 'plugins/core/.claude-plugin/plugin.json', JSON.stringify({
    name: 'core', skills: './skills', agents: ['./agents/helper.md'],
  }));
  write(root, 'plugins/core/skills/alpha/SKILL.md', '# alpha\n');
  write(root, 'plugins/core/agents/helper.md', '# helper\n');
  write(root, 'plugins/core/commands/go.md', '# go\n');
  write(root, 'package.json', JSON.stringify({ scripts: { build: 'x', lint: 'y' } }));
  write(root, 'README.md', `# Fx\n\n## Quick start\n\n\`\`\`bash\n${readmeCommands}\n\`\`\`\n\n## Later\n\n\`\`\`bash\nnpm run not-in-quickstart\n\`\`\`\n`);
  return root;
}

// Returns { status, stdout, stderr }; only a numeric exit status is ever accepted by the assertions.
function runSmoke(root) {
  try {
    const stdout = execFileSync(process.execPath, [script, root], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { status: 0, stdout, stderr: '' };
  } catch (err) {
    if (typeof err.status !== 'number') throw err;
    return { status: err.status, stdout: String(err.stdout), stderr: String(err.stderr) };
  }
}

test('clean fixture exits 0', () => {
  const r = runSmoke(fixture());
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /smoke: ok/);
});

test('missing command file exits exactly 1 and names the path', () => {
  const root = fixture();
  rmSync(path.join(root, 'plugins/core/commands/go.md'));
  const r = runSmoke(root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /commands path "\.\/commands\/go\.md" does not exist \(plugins\/core\/commands\/go\.md\)/);
});

test('missing agent and skills directory are both reported in one run', () => {
  const root = fixture();
  rmSync(path.join(root, 'plugins/core/agents/helper.md'));
  rmSync(path.join(root, 'plugins/core/skills'), { recursive: true });
  const r = runSmoke(root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /agents path "\.\/agents\/helper\.md" does not exist/);
  assert.match(r.stderr, /skills path "\.\/skills" does not exist/);
  assert.match(r.stderr, /2 problem\(s\)/);
});

test('skill directory without SKILL.md exits 1', () => {
  const root = fixture();
  rmSync(path.join(root, 'plugins/core/skills/alpha/SKILL.md'));
  const r = runSmoke(root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /plugins\/core\/skills\/alpha: skill directory has no SKILL\.md/);
});

test('README quickstart script missing from package.json exits 1 with the script name', () => {
  const r = runSmoke(fixture('npm run build\npnpm run ghost\npnpm phantom'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /script "ghost" which is not in package\.json scripts/);
  assert.match(r.stderr, /script "phantom" which is not in package\.json scripts/);
  assert.doesNotMatch(r.stderr, /not-in-quickstart/);
  assert.doesNotMatch(r.stderr, /script "build"/);
});

test('built-in commands and comments are ignored', () => {
  const r = runSmoke(fixture('pnpm install\nnpm ci\nnpm test\nnpm start\n# npm run commented-out\nnpm install && npm run lint'));
  assert.equal(r.status, 0, r.stderr);
});

test('shell comment inside a code fence does not end the Quick start section', () => {
  const r = runSmoke(fixture('# Install dependencies\npnpm run ghost'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /script "ghost" which is not in package\.json scripts/);
});

test('pnpm -w is a boolean flag, so the script after it is still checked', () => {
  const r = runSmoke(fixture('pnpm -w phantom'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /script "phantom" which is not in package\.json scripts/);
  assert.equal(runSmoke(fixture('pnpm -w build')).status, 0);
});

test('root plugin skills directory without SKILL.md exits 1', () => {
  const root = fixture();
  write(root, 'skills/example/notes.md', 'no skill file\n');
  const r = runSmoke(root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /skills\/example: skill directory has no SKILL\.md/);
});

test('group folder with a valid nested skill passes', () => {
  const root = fixture();
  write(root, 'skills/grouped/inner/SKILL.md', '# inner\n');
  write(root, 'skills/flat/SKILL.md', '# flat\n');
  const r = runSmoke(root);
  assert.equal(r.status, 0, r.stderr);
});

test('group folder with a nested skill lacking SKILL.md exits 1 naming the nested path only', () => {
  const root = fixture();
  write(root, 'skills/grouped/good/SKILL.md', '# good\n');
  write(root, 'skills/grouped/bad/skill.yaml', 'name: bad\n');
  write(root, 'skills/grouped/bad/CLAUDE.md', '# bad\n');
  const r = runSmoke(root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /skills\/grouped\/bad: skill directory has no SKILL\.md/);
  assert.doesNotMatch(r.stderr, /skills\/grouped: /);
  assert.match(r.stderr, /1 problem\(s\)/);
});

test('flat skill with only skill.yaml still fails', () => {
  const root = fixture();
  write(root, 'skills/flat/skill.yaml', 'name: flat\n');
  const r = runSmoke(root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /skills\/flat: skill directory has no SKILL\.md/);
});

test('manifest-declared custom skills directory is checked for SKILL.md', () => {
  const root = fixture();
  write(root, 'plugins/core/.claude-plugin/plugin.json', JSON.stringify({ name: 'core', skills: './custom' }));
  write(root, 'plugins/core/custom/ok/SKILL.md', '# ok\n');
  write(root, 'plugins/core/custom/bad/skill.yaml', 'name: bad\n');
  const r = runSmoke(root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /plugins\/core\/custom\/bad: skill directory has no SKILL\.md/);
  assert.doesNotMatch(r.stderr, /custom\/ok/);
});

test('null or non-object manifests are reported, not skipped', () => {
  for (const rel of ['.claude-plugin/plugin.json', '.claude-plugin/marketplace.json']) {
    for (const body of ['null', '[]', '"text"']) {
      const root = fixture();
      write(root, rel, body);
      const r = runSmoke(root);
      assert.equal(r.status, 1, `${rel} = ${body}`);
      assert.match(r.stderr, new RegExp(`${rel.replace(/[.\/]/g, '\$&')}: manifest is not a JSON object`));
    }
  }
});

test('fence tracking honours delimiter type and length', () => {
  const cases = {
    'shorter backtick fence does not close a longer one': ['````bash', '```', '# comment', 'pnpm run ghost', '````'],
    'tilde fence does not close a backtick fence': ['```bash', '~~~', '# comment', 'pnpm run ghost', '```'],
  };
  for (const [name, body] of Object.entries(cases)) {
    const root = fixture();
    write(root, 'README.md', ['# Fx', '', '## Quick start', '', ...body, '', '## Later', ''].join(String.fromCharCode(10)));
    const r = runSmoke(root);
    assert.equal(r.status, 1, name);
    assert.match(r.stderr, /script "ghost" which is not in package.json scripts/, name);
  }
});

test('inline shell comments are stripped before splitting operators', () => {
  const r = runSmoke(fixture('npm run build # example && pnpm ghost'));
  assert.equal(r.status, 0, r.stderr);
  const quoted = runSmoke(fixture('echo "a # b" && pnpm phantom'));
  assert.equal(quoted.status, 1);
  assert.match(quoted.stderr, /script "phantom" which is not in package\.json scripts/);
});

test('non-object marketplace plugin entry is reported and the run continues', () => {
  const root = fixture();
  write(root, '.claude-plugin/marketplace.json', JSON.stringify({
    name: 'fx-market',
    plugins: [null, { name: 'gone', source: './plugins/gone' }],
  }));
  write(root, 'README.md', '## Quick start\n\n```bash\npnpm ghost\n```\n');
  const r = runSmoke(root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /plugins\[0\] is not an object/);
  assert.match(r.stderr, /plugin "gone": source "\.\/plugins\/gone" does not exist/);
  assert.match(r.stderr, /script "ghost" which is not in package\.json scripts/);
  assert.match(r.stderr, /3 problem\(s\)/);
});

test('operators inside quotes do not split commands and quoted script names are unquoted', () => {
  const clean = runSmoke(fixture('echo "x && pnpm ghost"\nnpm run "build"\nnpm run \'lint\' && echo \'a;b\''));
  assert.equal(clean.status, 0, clean.stderr);
  const bad = runSmoke(fixture('npm run "ghost"'));
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /script "ghost" which is not in package\.json scripts/);
});

test('a skills path that is a file is reported and the README check still runs', () => {
  const root = fixture();
  rmSync(path.join(root, 'plugins/core/skills'), { recursive: true });
  write(root, 'plugins/core/skills', 'not a directory\n');
  write(root, 'README.md', '## Quick start\n\n```bash\npnpm ghost\n```\n');
  const r = runSmoke(root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /cannot read plugins\/core\/skills: not a directory/);
  assert.match(r.stderr, /script "ghost" which is not in package\.json scripts/);
});

test('a dangling skills symlink is reported and the README check still runs', (t) => {
  const root = fixture();
  rmSync(path.join(root, 'plugins/core/skills'), { recursive: true });
  try {
    symlinkSync(path.join(root, 'nowhere'), path.join(root, 'plugins/core/skills'), 'junction');
  } catch (err) {
    if (err.code === 'EPERM' || err.code === 'EACCES') { t.skip(`cannot create symlinks here: ${err.code}`); return; }
    throw err;
  }
  write(root, 'README.md', '## Quick start\n\n```bash\npnpm ghost\n```\n');
  const r = runSmoke(root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /cannot read plugins\/core\/skills: ENOENT/);
  assert.match(r.stderr, /script "ghost" which is not in package\.json scripts/);
});
