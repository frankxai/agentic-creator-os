import test from 'node:test';import assert from 'node:assert/strict';
import {digest,validate,approved,usage,exportDecision} from './validate.mjs';
const p={content_id:'test',brand_id:'frankx',thesis:'Agent security requires layered controls',sources:[{id:'s',url:'https://owasp.org/www-project-top-10-for-large-language-model-applications/',retrieved_at:'2026-11-14',rights:'link-only'}],claims:[{text:'OWASP publishes LLM security guidance',source_id:'s',evidence:'Project homepage'}]};
const asset={channel:'linkedin',hash:'abc'},a={decision:'approved',reviewer_id:'human',channel:'linkedin',asset_hash:'abc',content_hash:digest(p),approved_at:'2026-11-14T00:00:00Z',expires_at:'2026-11-20T00:00:00Z'};
test('valid evidence',()=>assert.equal(validate(p).ok,true));
test('no sources',()=>assert.equal(validate({...p,sources:[]}).ok,false));
test('unsupported claim',()=>assert.equal(validate({...p,claims:[{text:'x',source_id:'bad'}]}).ok,false));
test('unsafe URL',()=>assert.equal(validate({...p,sources:[{...p.sources[0],url:'http://127.0.0.1'}]}).ok,false));
test('rights absent',()=>assert.equal(validate({...p,sources:[{...p.sources[0],rights:null}]}).ok,false));
// The fixture approval expires on 2026-11-20, so the clock is fixed; with Date.now() this test fails from that day on.
test('approval allows export only',()=>assert.deepEqual(exportDecision(p,asset,a,Date.parse('2026-11-15T00:00:00Z')),{export_allowed:true,publish_allowed:false}));
test('changed asset',()=>assert.equal(approved(p,{...asset,hash:'changed'},a,Date.parse('2026-11-15T00:00:00Z')),false));
test('changed content',()=>assert.equal(approved({...p,thesis:'changed'},asset,a,Date.parse('2026-11-15T00:00:00Z')),false));
test('channel mismatch',()=>assert.equal(approved(p,{...asset,channel:'instagram'},a,Date.parse('2026-11-15T00:00:00Z')),false));
test('expired approval',()=>assert.equal(approved(p,asset,a,Date.parse('2026-11-21T00:00:00Z')),false));
test('cost cap',()=>{const r=usage({provider:'fixture',model:'test',input_tokens:1000000,output_tokens:100000,input_rate:1,output_rate:2,budget:1});assert.equal(r.estimated_usd,1.2);assert.equal(r.budget_exceeded,true);assert.equal(r.billed_usd,null)});
test('invalid usage',()=>assert.throws(()=>usage({provider:'x',model:'y',input_tokens:-1,output_tokens:0,input_rate:1,output_rate:1,budget:1})));
test('absent asset binding cannot authorize export',()=>{
 const now=Date.parse('2026-11-15T00:00:00Z');
 const bare={decision:'approved',reviewer_id:'human',content_hash:digest(p),approved_at:'2026-11-14T00:00:00Z',expires_at:'2026-11-20T00:00:00Z'};
 assert.equal(approved(p,{},bare,now),false);
 assert.equal(approved(p,{channel:'linkedin'},{...bare,channel:'linkedin'},now),false);
 assert.equal(approved(p,{hash:'abc'},{...bare,asset_hash:'abc'},now),false);
 assert.equal(approved(p,asset,a,now),true);
});
