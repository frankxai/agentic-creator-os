import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { selectSkills, hookContext } = require('../tools/gencreator-social/activation-core.cjs');
const rules = { activation_rules: [
  { skill: 'gencreator-review', priority: 'high', triggers: { keywords: ['review social drafts'], commands: ['/gencreator-review'], file_patterns: ['social/**/*.json'] } },
  { skill: 'gencreator-edition', priority: 'high', triggers: { keywords: ['social edition'], commands: ['/gencreator-edition'], exclude_keywords: ['do not create a social edition'] } },
  { skill: 'generic', priority: 'critical', triggers: { keywords: ['social', 'review'] } },
] };
test('explicit command wins over broad keywords without permission escalation', () => {
  const r = selectSkills(rules, { prompt: '/gencreator-review social edition', currentFile: '' });
  assert.equal(r.selected[0].skill, 'gencreator-review');
  assert.equal(r.authority, 'recommendation_only');
  assert.equal(r.agentSpawned, false);
});
test('recognizes slash command boundaries, exclusions and escaped literal keywords', () => {
  assert.equal(selectSkills(rules, { prompt: '/gencreator-reviewer' }).selected.length, 0);
  assert.equal(selectSkills(rules, { prompt: 'Do not create a social edition' }).selected.some(x=>x.skill==='gencreator-edition'), false);
  const literal = {activation_rules:[{skill:'safe',triggers:{keywords:['c++']}}]};
  assert.equal(selectSkills(literal,{prompt:'Use c++ here'}).selected.length,1);
  assert.equal(selectSkills(literal,{prompt:'Use c here'}).selected.length,0);
});
test('files use bounded glob matching and never substitute cwd for a current file', () => {
  assert.equal(selectSkills(rules,{prompt:'',currentFile:'social/week/draft.json'}).selected[0].skill,'gencreator-review');
  assert.equal(selectSkills(rules,{prompt:'',cwd:'social/week/draft.json'}).selected.length,0);
  assert.equal(selectSkills(rules,{prompt:'',currentFile:'social/draft.json'}).selected[0].skill,'gencreator-review');
  assert.equal(selectSkills(rules,{prompt:'',currentFile:'sociality/draft.json'}).selected.length,0);
  const exact={activation_rules:[{skill:'safe',triggers:{file_patterns:['social/**/draft.json']}}]};
  assert.equal(selectSkills(exact,{prompt:'',currentFile:'social/redraft.json'}).selected.length,0);
  assert.equal(selectSkills(exact,{prompt:'',currentFile:'social/week/draft.json'}).selected.length,1);
});
test('repeated glob stars fail with bounded matching instead of regex backtracking', () => {
  const registry={activation_rules:[{skill:'safe',triggers:{file_patterns:['*a'.repeat(90)+'z']}}]};
  assert.equal(selectSkills(registry,{prompt:'',currentFile:'a'.repeat(500)+'y'}).selected.length,0);
});
test('caps selection and context size and never echoes the prompt', () => {
  const many={activation_rules:Array.from({length:20},(_,i)=>({skill:'skill-'+i,triggers:{keywords:['social']}}))};
  const r=selectSkills(many,{prompt:'social PRIVATE CUSTOMER NOTE'});
  assert.equal(r.selected.length,3);
  assert.equal(r.omitted,17);
  const out=hookContext(r);
  assert.ok(out.hookSpecificOutput.additionalContext.length<=1800);
  assert.equal(JSON.stringify(out).includes('PRIVATE CUSTOMER'),false);
});
test('malformed rules, traversal names and unsupported trigger shapes are rejected', () => {
  assert.throws(()=>selectSkills({activation_rules:[{skill:'../../secrets',triggers:{keywords:['x']}}]},{prompt:'x'}));
  assert.throws(()=>selectSkills({activation_rules:'invalid'},{prompt:'x'}));
  assert.throws(()=>selectSkills(rules,{prompt:'x'.repeat(32769)}));
});
test('real hook reads canonical registry and outputs JSON for its registered command', () => {
  const run=spawnSync(process.execPath,['.claude/hooks/skill-activation-prompt.js'],{cwd:resolve('.'),input:JSON.stringify({prompt:'/gencreator-recover',cwd:'/untrusted/cwd'}),encoding:'utf8',env:{...process.env,CLAUDE_PROJECT_DIR:resolve('.')}});
  assert.equal(run.status,0);
  const result=JSON.parse(run.stdout);
  assert.match(result.hookSpecificOutput.additionalContext,/gencreator-recover/);
  assert.equal(result.hookSpecificOutput.additionalContext.includes('/untrusted'),false);
});
test('all six commands resolve their corresponding stage first', () => {
  const registry=JSON.parse(fs.readFileSync('.claude/skill-rules.json','utf8'));
  for(const stage of ['strategy','edition','review','deliver','learn','recover']) {
    assert.equal(selectSkills(registry,{prompt:'/gencreator-'+stage}).selected[0].skill,'gencreator-'+stage);
  }
});
test('main and short entries resolve GenCreator; stage aliases resolve the existing stages', () => {
  const registry=JSON.parse(fs.readFileSync('.claude/skill-rules.json','utf8'));
  for(const entry of ['/gencreator','/gc']) {
    assert.equal(selectSkills(registry,{prompt:entry+' plan a campaign'}).selected[0].skill,'gencreator');
  }
  for(const stage of ['strategy','edition','review','deliver','learn','recover']) {
    assert.equal(selectSkills(registry,{prompt:'/gc-'+stage}).selected[0].skill,'gencreator-'+stage);
    assert.match(fs.readFileSync('.claude/commands/gc-'+stage+'.md','utf8'),new RegExp('commands/gencreator-'+stage+'\\.md'));
    assert.match(fs.readFileSync('.agents/skills/gc-'+stage+'/SKILL.md','utf8'),new RegExp('skills/gencreator-'+stage+'/SKILL\\.md'));
  }
  assert.equal(selectSkills(registry,{prompt:'/gc-strategist'}).selected.length,0);
  assert.equal(selectSkills(registry,{prompt:'/gencreatorium'}).selected.length,0);
});
test('actual hook routes both mission entries and every short stage without spawning agents', () => {
  for(const command of ['/gencreator','/gc',...['strategy','edition','review','deliver','learn','recover'].map(s=>'/gc-'+s)]) {
    const run=spawnSync(process.execPath,['.claude/hooks/skill-activation-prompt.js'],{input:JSON.stringify({prompt:command}),encoding:'utf8',env:{...process.env,CLAUDE_PROJECT_DIR:resolve('.')}});
    assert.equal(run.status,0);
    const content=JSON.parse(run.stdout).hookSpecificOutput.additionalContext;
    assert.match(content,/\.claude\/skills\/gencreator/);
    if(command.startsWith('/gc-'))assert.ok(content.includes('gencreator-'+command.slice(4)+'/SKILL.md'));
    assert.match(content,/no skill has been read or executed/);
  }
});
test('installed wrapper finds reviewed resolver and its own registry when project has none', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'social-activation-'));
  try {
    const hooks=path.join(dir,'acos','hooks');fs.mkdirSync(hooks,{recursive:true});
    fs.copyFileSync('.claude/hooks/skill-activation-prompt.js',path.join(hooks,'skill-activation-prompt.js'));
    fs.copyFileSync('tools/gencreator-social/activation-core.cjs',path.join(hooks,'activation-core.cjs'));
    fs.copyFileSync('.claude/skill-rules.json',path.join(dir,'skill-rules.json'));
    const project=path.join(dir,'project');fs.mkdirSync(project);
    const run=spawnSync(process.execPath,[path.join(hooks,'skill-activation-prompt.js')],{input:JSON.stringify({prompt:'/gencreator-edition'}),encoding:'utf8',env:{...process.env,CLAUDE_PROJECT_DIR:project}});
    assert.equal(run.status,0);assert.match(JSON.parse(run.stdout).hookSpecificOutput.additionalContext,/gencreator-edition/);
    assert.equal(fs.existsSync(path.join(dir,'trajectories')),false);
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('malformed hook input returns a generic warning without copying private input', () => {
  const run=spawnSync(process.execPath,['.claude/hooks/skill-activation-prompt.js'],{input:'PRIVATE CUSTOMER INVALID JSON',encoding:'utf8',env:{...process.env,CLAUDE_PROJECT_DIR:resolve('.')}});
  assert.equal(run.status,0);assert.equal(run.stdout,'');assert.equal(run.stderr.includes('PRIVATE CUSTOMER'),false);
});
