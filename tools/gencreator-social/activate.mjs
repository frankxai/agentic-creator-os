#!/usr/bin/env node
import { createRequire } from 'node:module';
import { readFileSync, lstatSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url);
const {selectSkills}=require('./activation-core.cjs');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
try{
  if(process.argv.length!==3)throw new Error('Use activate.mjs request.json');
  const file=resolve(process.argv[2]),stat=lstatSync(file);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size>65536)throw new Error('Invalid request file');
  const request=JSON.parse(readFileSync(file,'utf8'));
  const rules=JSON.parse(readFileSync(resolve(root,'.claude/skill-rules.json'),'utf8'));
  console.log(JSON.stringify(selectSkills(rules,request),null,2));
}catch{console.error(JSON.stringify({error:'Invalid activation request or registry; no capability executed'}));process.exitCode=2;}
