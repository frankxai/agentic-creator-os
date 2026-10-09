'use strict';
// Recommendations only. Never execute a skill, start an agent or write memory.
const PRIORITY = { critical: 4, high: 3, medium: 2, low: 1 };
const safeId = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value);
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function list(value, label) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 100 || value.some(x=>typeof x!=='string'||x.length>240||!x.trim())) throw new Error('Invalid '+label);
  return value;
}
function phrase(text, term) {
  return new RegExp('(?:^|[^a-z0-9_])'+escape(term)+'(?=$|[^a-z0-9_])','i').test(text);
}
function glob(pattern, file) {
  // Memoized matching bounds work by pattern length * file length, avoiding
  // exponential regex backtracking for repeated glob stars.
  pattern=pattern.toLowerCase();file=file.replace(/\\/g,'/').toLowerCase();
  const memo=new Map();
  function scanDirectories(i,j){
    const key='dir:'+i+':'+j;if(memo.has(key))return memo.get(key);
    const result=j<file.length&&((file[j]==='/'&&match(i+3,j+1))||scanDirectories(i,j+1));
    memo.set(key,Boolean(result));return Boolean(result);
  }
  function match(i,j){
    const key=i+':'+j;if(memo.has(key))return memo.get(key);
    let result;
    if(i===pattern.length)result=j===file.length;
    else if(pattern[i]==='*'&&pattern[i+1]==='*'){
      if(pattern[i+2]==='/')result=match(i+3,j)||scanDirectories(i,j);
      else result=match(i+2,j)||(j<file.length&&match(i,j+1));
    }else if(pattern[i]==='*')result=match(i+1,j)||(j<file.length&&file[j]!=='/'&&match(i,j+1));
    else if(pattern[i]==='?')result=j<file.length&&file[j]!=='/'&&match(i+1,j+1);
    else result=j<file.length&&pattern[i]===file[j]&&match(i+1,j+1);
    memo.set(key,Boolean(result));return Boolean(result);
  }
  return match(0,0);
}
function selectSkills(registry, input, limit=3) {
  if(!registry || !Array.isArray(registry.activation_rules) || registry.activation_rules.length>500) throw new Error('Invalid activation registry');
  if(!input || typeof input.prompt!=='string' || input.prompt.length>32768 || (input.currentFile!==undefined && (typeof input.currentFile!=='string'||input.currentFile.length>2048))) throw new Error('Invalid activation request');
  if(!Number.isInteger(limit)||limit<1||limit>5)throw new Error('Invalid activation limit');
  const candidates=[];
  const ids=new Set();
  for(const rule of registry.activation_rules){
    if(!rule||!safeId(rule.skill)||ids.has(rule.skill)||!rule.triggers||typeof rule.triggers!=='object'||Array.isArray(rule.triggers))throw new Error('Invalid activation rule');
    ids.add(rule.skill);
    const t=rule.triggers;
    const keywords=list(t.keywords,'keywords'), commands=list(t.commands,'commands'), patterns=list(t.file_patterns,'patterns'), exclusions=list(t.exclude_keywords,'exclusions');
    if(exclusions.some(x=>phrase(input.prompt,x)))continue;
    const reasons=[];
    for(const command of commands)if(new RegExp('(?:^|\\s)'+escape(command)+'(?=$|\\s)','i').test(input.prompt))reasons.push({type:'command',value:command});
    for(const keyword of keywords)if(phrase(input.prompt,keyword))reasons.push({type:'keyword',value:keyword});
    for(const pattern of patterns)if(input.currentFile&&glob(pattern,input.currentFile))reasons.push({type:'file',value:pattern});
    if(!reasons.length)continue;
    const score=(reasons.some(r=>r.type==='command')?100:0)+(reasons.some(r=>r.type==='keyword')?10:0)+(reasons.some(r=>r.type==='file')?5:0)+(PRIORITY[rule.priority]||1);
    candidates.push({skill:rule.skill,path:'.claude/skills/'+rule.skill+'/SKILL.md',score,reasons:reasons.slice(0,3)});
  }
  candidates.sort((a,b)=>b.score-a.score||a.skill.localeCompare(b.skill));
  return {schema:'acos.skill-activation.v1',selected:candidates.slice(0,limit),omitted:Math.max(0,candidates.length-limit),authority:'recommendation_only',agentSpawned:false,memoryWritten:false,skillsLoaded:false};
}
function hookContext(receipt) {
  if(!receipt.selected.length)return null;
  const lines=['ACOS capability selection. Read applicable repo instructions first. These are recommendations; no skill has been read or executed.'];
  for(const row of receipt.selected)lines.push(row.path+' — '+row.reasons.map(r=>r.type+': '+r.value).join('; '));
  lines.push('Load only the selected skills needed for the current job. Preserve host authority, brand/source policy and human delivery gates. Selection grants no tool access or permission to spawn agents, publish, spend or change memory.');
  let context=lines.join('\n');
  if(context.length>1800)context=context.slice(0,1770)+'\nSelection details truncated.';
  return {hookSpecificOutput:{hookEventName:'UserPromptSubmit',additionalContext:context}};
}
module.exports={selectSkills,hookContext};
