#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');
const corePath=fs.existsSync(path.join(__dirname,'activation-core.cjs')) ? path.join(__dirname,'activation-core.cjs') : path.resolve(__dirname,'../../tools/gencreator-social/activation-core.cjs');
try{
  const {selectSkills,hookContext}=require(corePath);
  // The host environment selects the project. A payload's cwd cannot select policy.
  const root=process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname,'../..');
  const ownRoot=path.resolve(__dirname,'../..');
  const candidates=[path.join(root,'.claude','skill-rules.json'),path.join(root,'skill-rules.json'),path.join(ownRoot,'skill-rules.json')];
  const rulesPath=candidates.find(p=>fs.existsSync(p));
  if(!rulesPath)throw new Error('Missing registry');
  const fd=fs.openSync(rulesPath,'r'),stat=fs.fstatSync(fd);
  if(!stat.isFile()||stat.size>1_000_000){fs.closeSync(fd);throw new Error('Invalid registry');}
  const rules=JSON.parse(fs.readFileSync(fd,'utf8'));fs.closeSync(fd);
  const buffer=Buffer.alloc(65537);let length=0;
  while(length<buffer.length){const n=fs.readSync(0,buffer,length,buffer.length-length,null);if(n===0)break;length+=n;}
  if(length>65536)throw new Error('Oversized input');
  const payload=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer.subarray(0,length)));
  const receipt=selectSkills(rules,{prompt:payload.prompt,currentFile:payload.current_file||''});
  const output=hookContext(receipt);
  if(output)process.stdout.write(JSON.stringify(output)+'\n');
}catch{
  // Routing failure does not veto the user's task or weaken security gates.
  process.stderr.write('ACOS activation unavailable; use explicit skills.\n');
}
