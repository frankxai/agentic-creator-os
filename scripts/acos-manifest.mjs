#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const rel = (...parts) => path.join(root, ...parts);
const readJson = (file) => JSON.parse(readFileSync(rel(file), 'utf8'));
const writeJson = (file, value) => {
  writeFileSync(rel(file), `${JSON.stringify(value, null, 2)}\n`);
};

const walkFiles = (dir, predicate) => {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath, predicate));
    } else if (predicate(fullPath, entry)) {
      results.push(path.relative(root, fullPath).split(path.sep).join('/'));
    }
  }
  return results.sort();
};

const topLevelDirs = (dir) => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
};

const topLevelFiles = (dir, predicate) => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && predicate(entry.name))
    .map((entry) => entry.name)
    .sort();
};

const countHookEntries = (hooksJson) => {
  if (!hooksJson?.hooks) return 0;
  return Object.values(hooksJson.hooks).reduce((sum, entries) => sum + entries.length, 0);
};

const buildManifest = () => {
  const pkg = readJson('package.json');
  const skillDirs = topLevelDirs(rel('.claude/skills'));
  const skills = skillDirs.filter((name) => existsSync(rel('.claude/skills', name, 'SKILL.md')));
  const commands = walkFiles(rel('.claude/commands'), (file) => file.endsWith('.md'));
  const agentDefinitions = topLevelFiles(rel('.claude/agents'), (name) => name.endsWith('.md') && !['CLAUDE.md', 'AGENT_PROTOCOL.md'].includes(name));
  const agentConfigFiles = topLevelFiles(rel('.claude/agents'), (name) => name.endsWith('.json'));
  const hookScripts = topLevelFiles(rel('.claude/hooks'), (name) => name.endsWith('.sh'));
  const skillRules = existsSync(rel('.claude/skill-rules.json')) ? readJson('.claude/skill-rules.json') : { activation_rules: [] };
  const hooksJson = existsSync(rel('.claude/hooks.json')) ? readJson('.claude/hooks.json') : { hooks: {} };
  const agentIam = existsSync(rel('.claude/agent-iam.json')) ? readJson('.claude/agent-iam.json') : { profiles: {} };
  const mcpServers = topLevelDirs(rel('mcp-servers')).filter((name) => existsSync(rel('mcp-servers', name, 'package.json')));

  return {
    name: pkg.name,
    version: pkg.version,
    description: 'Generated product manifest for the installable ACOS runtime. Do not edit by hand; run npm run manifest.',
    source: {
      runtime: '.claude',
      package: 'package.json',
      generator: 'scripts/acos-manifest.mjs'
    },
    stats: {
      skills: skills.length,
      skillDirectories: skillDirs.length,
      commands: commands.length,
      agents: agentDefinitions.length,
      agentConfigFiles: agentConfigFiles.length,
      hookScripts: hookScripts.length,
      hookConfigEntries: countHookEntries(hooksJson),
      activationRules: skillRules.activation_rules.length,
      iamProfiles: Object.keys(agentIam.profiles ?? {}).length,
      mcpServers: mcpServers.length
    },
    packageFiles: [
      '.claude/',
      '.claude-plugin/',
      'acos.manifest.json',
      'bin/',
      'departments/',
      'docs/',
      'install.sh',
      'mcp-servers/',
      'scripts/',
      'skills/',
      'templates/',
      'workflows/',
      'CLAUDE.md',
      'CREATOR_NEEDS.md',
      'README.md'
    ],
    inventory: {
      skills,
      supportSkillDirectories: skillDirs.filter((name) => !skills.includes(name)),
      commands,
      agentDefinitions: agentDefinitions.map((name) => `.claude/agents/${name}`),
      agentConfigFiles: agentConfigFiles.map((name) => `.claude/agents/${name}`),
      hookScripts: hookScripts.map((name) => `.claude/hooks/${name}`),
      mcpServers
    }
  };
};

const countPhrase = (manifest) => `${manifest.stats.skills} skills, ${manifest.stats.commands} commands, ${manifest.stats.agents} agents`;
const heroPhrase = (manifest) => `One install. Any coding agent. ${countPhrase(manifest)} — auto-activating.`;
const footerPhrase = (manifest) => `${manifest.stats.skills} Skills | ${manifest.stats.commands} Commands | ${manifest.stats.agents} Agents | ${manifest.stats.hookScripts} Hook Scripts | Multi-Platform | Self-Learning`;

const replaceAll = (file, replacements) => {
  const target = rel(file);
  let text = readFileSync(target, 'utf8');
  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }
  text = text.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '');
  writeFileSync(target, text);
};

const syncPackage = (manifest) => {
  const pkg = readJson('package.json');
  pkg.description = `The installable Agentic Creator OS runtime for Claude Code, Cursor, Windsurf, and Gemini: ${countPhrase(manifest)}, ${manifest.stats.hookScripts} hook scripts.`;
  pkg.files = manifest.packageFiles;
  pkg.scripts = {
    ...pkg.scripts,
    manifest: 'node scripts/acos-manifest.mjs sync',
    lint: 'node scripts/acos-manifest.mjs lint',
    typecheck: 'npm run build:all',
    smoke: 'node scripts/acos-manifest.mjs smoke',
    check: 'npm run lint && npm run typecheck && npm run smoke'
  };
  writeJson('package.json', pkg);
};

const syncPlugin = (manifest) => {
  const plugin = readJson('.claude-plugin/plugin.json');
  plugin.version = manifest.version;
  plugin.stats = {
    skills: manifest.stats.skills,
    commands: manifest.stats.commands,
    agents: manifest.stats.agents,
    hooks: manifest.stats.hookScripts,
    activationRules: manifest.stats.activationRules,
    iamProfiles: manifest.stats.iamProfiles,
    source: 'acos.manifest.json',
    note: 'Manifest reflects the packaged .claude runtime surface.'
  };
  if (plugin.intelligence) plugin.intelligence.version = `v${manifest.version}`;
  writeJson('.claude-plugin/plugin.json', plugin);
};

const syncDocs = (manifest) => {
  const stats = manifest.stats;
  replaceAll('README.md', [
    [/\*One install\. Any coding agent\..*\*/u, `*${heroPhrase(manifest)}*`],
    [/version-[0-9]+\.[0-9]+\.[0-9]+-cyan/u, `version-${manifest.version}-cyan`],
    [/\| \*\*Skills\*\* \| Domain knowledge modules that load automatically \| .* \|/u, `| **Skills** | Domain knowledge modules that load automatically | ${stats.skills} |`],
    [/\| \*\*Commands\*\* \| Reusable workflows triggered via slash commands \| .* \|/u, `| **Commands** | Reusable workflows triggered via slash commands | ${stats.commands} |`],
    [/\| \*\*Agents\*\* \| Specialized personas with distinct expertise \| .* \|/u, `| **Agents** | Specialized personas with distinct expertise | ${stats.agents} |`],
    [/\| \*\*Safety Hooks\*\* \| Circuit breaker, audit trail, IAM, self-modify gate \| .* \|/u, `| **Safety Hooks** | Circuit breaker, audit trail, IAM, self-modify gate | ${stats.hookScripts} |`],
    [/Commands \([0-9]+\+?\)\s+Skills \([0-9]+\+?\)\s+Agents \([0-9]+\+?\)/u, `Commands (${stats.commands})  Skills (${stats.skills})  Agents (${stats.agents})`],
    [/### Commands \([0-9]+\+?\)/u, `### Commands (${stats.commands})`],
    [/### Skills \([0-9]+\+? Auto-Activating\)/u, `### Skills (${stats.skills} Auto-Activating)`],
    [/skill-rules\.json .* [0-9]+ pattern rules/u, `skill-rules.json -> ${stats.activationRules} pattern rules`],
    [/### Agents \([0-9]+\+? Specialized\)/u, `### Agents (${stats.agents} Specialized)`],
    [/commands\/\s+# [0-9]+\+? slash commands/u, `commands/           # ${stats.commands} slash commands`],
    [/skills\/\s+# [0-9]+\+? auto-activating skills/u, `skills/             # ${stats.skills} auto-activating skills`],
    [/agents\/\s+# [0-9]+\+? specialized agents/u, `agents/             # ${stats.agents} specialized agents`],
    [/hooks\/\s+# v[0-9]+ safety hooks/u, `hooks/              # ${stats.hookScripts} safety hook scripts`],
    [/skill-rules\.json\s+# [0-9]+ auto-activation rules/u, `skill-rules.json    # ${stats.activationRules} auto-activation rules`],
    [/package\.json\s+# v[0-9]+\.[0-9]+\.[0-9]+/u, `package.json            # v${manifest.version}`],
    [/├── [0-9]+\+? commands routed through \/acos/u, `├── ${stats.commands} commands routed through /acos`],
    [/├── [0-9]+\+? agents aligned to Starlight council/u, `├── ${stats.agents} agents aligned to Starlight council`],
    [/├── [0-9]+\+? auto-activating skills/u, `├── ${stats.skills} auto-activating skills`],
    [/\*\*Agentic Creator OS v[0-9.]+\*\*/u, `**Agentic Creator OS v${manifest.version}**`],
    [/\*[0-9]+\+? Skills \| [0-9]+\+? Commands \| [0-9]+\+? Agents \| .*?\*/u, `*${footerPhrase(manifest)}*`]
  ]);

  replaceAll('CLAUDE.md', [
    [/- \*\*[0-9]+\+? Commands\*\* —/u, `- **${stats.commands} Commands** —`],
    [/- \*\*[0-9]+\+? Skills\*\* —/u, `- **${stats.skills} Skills** —`],
    [/- \*\*[0-9]+\+? Specialized Agents\*\* —/u, `- **${stats.agents} Specialized Agents** —`],
    [/Skills load automatically via `\.claude\/skill-rules\.json` — [0-9]+ pattern rules:/u, `Skills load automatically via \`.claude/skill-rules.json\` — ${stats.activationRules} pattern rules:`],
    [/## Available Commands \([0-9]+\+?\)/u, `## Available Commands (${stats.commands})`],
    [/\*ACOS v[0-9.]+ — Autonomous Intelligence\*/u, `*ACOS v${manifest.version} — Autonomous Intelligence*`]
  ]);

  replaceAll('docs/README.md', [
    [/\| \*\*Skills\*\* \| Domain knowledge modules \| .* \|/u, `| **Skills** | Domain knowledge modules | ${stats.skills} |`],
    [/\| \*\*Agents\*\* \| Specialized AI personas \| .* \|/u, `| **Agents** | Specialized AI personas | ${stats.agents} |`],
    [/\| \*\*Workflows\*\* \| Orchestrated pipelines \| .* \|/u, `| **Commands** | Slash-command workflows | ${stats.commands} |`],
    [/\*\*Current\*\*: .*/u, `**Current**: ${manifest.version} (from acos.manifest.json)`]
  ]);

  replaceAll('docs/getting-started.md', [
    [/Claude will list the [0-9]+\+? skills organized by category:/u, `Claude can use the ${stats.skills} packaged skills organized by category:`],
    [/├── skills\/\s+# All skill files/u, `├── .claude/skills/        # ${stats.skills} packaged skill modules`],
    [/├── workflows\/\s+# Orchestrated pipelines/u, `├── .claude/commands/      # ${stats.commands} slash-command workflows`],
    [/├── departments\/\s+# Agent team configurations/u, `├── .claude/agents/        # ${stats.agents} agent definitions`]
  ]);
};

const sync = () => {
  const manifest = buildManifest();
  writeJson('acos.manifest.json', manifest);
  syncPackage(manifest);
  syncPlugin(manifest);
  syncDocs(manifest);
  writeJson('acos.manifest.json', buildManifest());
  console.log(`Synced ACOS manifest: ${countPhrase(manifest)}, ${manifest.stats.hookScripts} hook scripts.`);
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const lint = () => {
  const expected = buildManifest();
  const actual = readJson('acos.manifest.json');
  assert(JSON.stringify(actual.stats) === JSON.stringify(expected.stats), 'acos.manifest.json stats are stale. Run npm run manifest.');
  assert(actual.version === expected.version, 'acos.manifest.json version does not match package.json.');

  const pkg = readJson('package.json');
  for (const requiredPath of ['.claude/', '.claude-plugin/', 'acos.manifest.json', 'scripts/', 'install.sh']) {
    assert(pkg.files.includes(requiredPath), `package.json files is missing ${requiredPath}.`);
  }

  const plugin = readJson('.claude-plugin/plugin.json');
  assert(plugin.version === actual.version, '.claude-plugin/plugin.json version is stale.');
  assert(plugin.stats.skills === actual.stats.skills, '.claude-plugin/plugin.json skills count is stale.');
  assert(plugin.stats.commands === actual.stats.commands, '.claude-plugin/plugin.json commands count is stale.');
  assert(plugin.stats.agents === actual.stats.agents, '.claude-plugin/plugin.json agents count is stale.');
  assert(plugin.stats.hooks === actual.stats.hookScripts, '.claude-plugin/plugin.json hook count is stale.');

  const readme = readFileSync(rel('README.md'), 'utf8');
  assert(readme.includes(heroPhrase(actual)), 'README hero count phrase is stale.');
  assert(readme.includes(footerPhrase(actual)), 'README footer count phrase is stale.');
  assert(readme.includes(`package.json            # v${actual.version}`), 'README package version is stale.');

  const claudeMd = readFileSync(rel('CLAUDE.md'), 'utf8');
  assert(claudeMd.includes(`**${actual.stats.commands} Commands**`), 'CLAUDE.md command count is stale.');
  assert(claudeMd.includes(`**${actual.stats.skills} Skills**`), 'CLAUDE.md skill count is stale.');
  assert(claudeMd.includes(`**${actual.stats.agents} Specialized Agents**`), 'CLAUDE.md agent count is stale.');

  const rules = readJson('.claude/skill-rules.json').activation_rules;
  const missingSkills = [...new Set(rules.map((rule) => rule.skill).filter((skill) => !existsSync(rel('.claude/skills', skill, 'SKILL.md'))))];
  assert(missingSkills.length === 0, `activation rules reference missing skills: ${missingSkills.join(', ')}`);

  console.log(`ACOS lint passed: ${countPhrase(actual)}, ${actual.stats.activationRules} activation rules.`);
};

const smoke = () => {
  lint();

  const packOutput = execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: root, encoding: 'utf8' });
  const pack = JSON.parse(packOutput)[0];
  const files = new Set(pack.files.map((file) => file.path));
  for (const requiredFile of ['acos.manifest.json', 'install.sh', 'package.json', '.claude-plugin/plugin.json']) {
    assert(files.has(requiredFile), `npm pack is missing ${requiredFile}.`);
  }
  assert([...files].some((file) => file.startsWith('.claude/skills/')), 'npm pack is missing .claude/skills/.');
  assert([...files].some((file) => file.startsWith('.claude/commands/')), 'npm pack is missing .claude/commands/.');
  assert([...files].some((file) => file.startsWith('.claude/agents/')), 'npm pack is missing .claude/agents/.');

  const temp = mkdtempSync(path.join(tmpdir(), 'acos-smoke-'));
  try {
    const claudeHome = path.join(temp, 'claude-home');
    const result = spawnSync('bash', [rel('install.sh'), '--platform=claude', '--skills-only'], {
      cwd: root,
      env: { ...process.env, CLAUDE_HOME: claudeHome },
      encoding: 'utf8'
    });
    assert(result.status === 0, `installer smoke failed:\n${result.stdout}\n${result.stderr}`);
    const installedSkills = topLevelDirs(path.join(claudeHome, 'skills')).filter((name) => existsSync(path.join(claudeHome, 'skills', name, 'SKILL.md')));
    assert(installedSkills.length === readJson('acos.manifest.json').stats.skills, `installer copied ${installedSkills.length} skills, expected ${readJson('acos.manifest.json').stats.skills}.`);
    assert(!existsSync(path.join(claudeHome, 'commands')) || topLevelDirs(path.join(claudeHome, 'commands')).length === 0, 'skills-only install unexpectedly copied command directories.');
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }

  console.log('ACOS smoke passed: npm tarball and skills-only installer are aligned.');
};

const command = process.argv[2] ?? 'lint';

try {
  if (command === 'sync') sync();
  else if (command === 'lint') lint();
  else if (command === 'smoke') smoke();
  else throw new Error(`Unknown command: ${command}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
