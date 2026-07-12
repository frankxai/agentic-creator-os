#!/usr/bin/env node
// Single source of truth for ACOS asset counts.
// Usage:
//   node scripts/generate-stats.mjs          -> rewrites STATS.md from disk
//   node scripts/generate-stats.mjs --check  -> exits 1 if STATS.md is stale,
//                                               a SKILL.md is empty, or a
//                                               skill-rules target is missing
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => path.join(root, p);

function walk(dir, filter) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
}

const skills = [
  ...walk(rel('.claude/skills'), (p) => p.endsWith('SKILL.md')),
  ...walk(rel('skills'), (p) => p.endsWith('SKILL.md')),
];
const commands = fs.existsSync(rel('.claude/commands'))
  ? fs.readdirSync(rel('.claude/commands')).filter((f) => f.endsWith('.md'))
  : [];
const agents = fs.existsSync(rel('.claude/agents'))
  ? fs.readdirSync(rel('.claude/agents')).filter((f) => f.endsWith('.md'))
  : [];
const hooksJson = JSON.parse(fs.readFileSync(rel('hooks/hooks.json'), 'utf-8'));
const hookCount = Object.values(hooksJson.hooks ?? {}).flat()
  .flatMap((m) => m.hooks ?? []).length;

const stats = {
  skills: skills.length,
  commands: commands.length,
  agents: agents.length,
  hooks: hookCount,
  generated: 'by scripts/generate-stats.mjs — do not edit by hand',
};

const md = `# ACOS Asset Stats

<!-- GENERATED FILE — run \`node scripts/generate-stats.mjs\` to refresh. CI fails if stale. -->

| Asset | Count | Where |
|---|---|---|
| Skills | ${stats.skills} | \`.claude/skills/\` + \`skills/\` (SKILL.md) |
| Commands | ${stats.commands} | \`.claude/commands/*.md\` |
| Agents | ${stats.agents} | \`.claude/agents/*.md\` |
| Wired hooks | ${stats.hooks} | \`hooks/hooks.json\` |
`;

const errors = [];

// Gate 1: empty skills
for (const s of skills) if (fs.statSync(s).size === 0) errors.push(`empty SKILL.md: ${path.relative(root, s)}`);

// Gate 2: every skill-rules activation target must exist
const rules = JSON.parse(fs.readFileSync(rel('.claude/skill-rules.json'), 'utf-8'));
for (const r of rules.activation_rules ?? []) {
  const exists = fs.existsSync(rel(`.claude/skills/${r.skill}`)) || fs.existsSync(rel(`skills/${r.skill}`));
  if (!exists) errors.push(`skill-rules.json references missing skill: ${r.skill}`);
}

if (process.argv.includes('--check')) {
  const current = fs.existsSync(rel('STATS.md')) ? fs.readFileSync(rel('STATS.md'), 'utf-8') : '';
  if (current !== md) errors.push('STATS.md is stale — run `node scripts/generate-stats.mjs` and commit');
  if (errors.length) {
    for (const e of errors) console.error(`FAIL: ${e}`);
    process.exit(1);
  }
  console.log(`OK: ${stats.skills} skills, ${stats.commands} commands, ${stats.agents} agents, ${stats.hooks} hooks — all gates pass`);
} else {
  fs.writeFileSync(rel('STATS.md'), md);
  console.log(`Wrote STATS.md: ${stats.skills} skills, ${stats.commands} commands, ${stats.agents} agents, ${stats.hooks} hooks`);
  if (errors.length) {
    for (const e of errors) console.error(`WARN: ${e}`);
  }
}
