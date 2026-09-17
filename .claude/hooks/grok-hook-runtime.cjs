#!/usr/bin/env node
'use strict';
// Translate Grok's camelCase envelope for the shared Starlight runtime.
const path = require('node:path');
const os = require('node:os');
const {spawnSync} = require('node:child_process');
const shared = require('./codex-hook-runtime.cjs');
function normalize(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('Invalid hook envelope');
  return {...input, session_id: input.session_id ?? input.sessionId,
    tool_use_id: input.tool_use_id ?? input.toolUseId,
    tool_name: input.tool_name ?? input.toolName,
    tool_input: input.tool_input ?? input.toolInput ?? {}};
}
function guard(input, runner = spawnSync, script = path.join(os.homedir(), '.grok', 'hooks', 'secret-guard.cjs')) {
  if (input.toolInputTruncated) return {decision:'deny', reason:'Secret check needs the complete tool input.'};
  const result = runner(process.execPath, [script], {input:JSON.stringify(input),
    encoding:'utf8',timeout:2000,maxBuffer:65536,windowsHide:true});
  if (result.error || result.status !== 0) return {decision:'deny', reason:result.status === 2
    ? 'The existing secret guard detected credential-like content.' : 'The secret guard could not complete; repair it before retrying.'};
  return {decision:'defer'};
}
function handle(mode, raw, runner) {
  const input = normalize(raw);
  if (mode === 'secret') return guard(input, runner);
  const output = shared.handle(mode, input);
  if (mode === 'post' && output?.systemMessage) return {additionalContext:output.systemMessage};
  return null;
}
function main() {
  process.env.STARLIGHT_HARNESS = 'grok';
  const chunks=[];let size=0,oversized=false;
  process.stdin.on('data',c=>{size+=c.length;if(size>shared.MAX_INPUT){oversized=true;chunks.length=0;}else if(!oversized)chunks.push(c);});
  process.stdin.on('end',()=>{
    const mode=process.argv[2];let output;
    try {if(oversized)throw Error('Oversized input');output=handle(mode,JSON.parse(Buffer.concat(chunks).toString('utf8')));}
    catch {if(mode==='secret')output={decision:'deny',reason:'Secret check received invalid or oversized input.'};}
    if(output)process.stdout.write(JSON.stringify(output));
    if(output?.decision==='deny')process.exitCode=2;
  });
}
if(require.main===module)main();
module.exports={normalize,guard,handle};
