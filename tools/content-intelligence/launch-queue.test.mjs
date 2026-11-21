import test from 'node:test';import assert from 'node:assert/strict';import {prepareEdition,canExport,manychatPlan} from './launch-queue.mjs';
const e=prepareEdition({id:'CI-01',brand:'FrankX',source:'https://genai.owasp.org/',slides:[{headline:'One',body:'A'},{headline:'Two',body:'B'}]});
test('edition defaults to review',()=>assert.equal(e.state,'REVIEW_REQUIRED'));
test('no missing evidence',()=>assert.throws(()=>prepareEdition({id:'CI-02',brand:'FrankX',source:'',slides:[]})));
test('no unknown channel',()=>assert.throws(()=>prepareEdition({id:'CI-03',brand:'FrankX',source:'https://example.org',slides:[{headline:'A',body:'B'},{headline:'C',body:'D'}],channels:['tiktok']})));
test('no export without receipt',()=>assert.equal(canExport(e,null,'hash','instagram'),false));
test('approval binds revision and asset',()=>{const a={decision:'APPROVE',reviewer:'human',revision:e.revision,asset_hash:'hash',channel:'instagram',approved_at:'2026-11-15T00:00:00Z',expires_at:'2026-11-18T00:00:00Z'};assert.equal(canExport(e,a,'hash','instagram',Date.parse('2026-11-16T00:00:00Z')),true);assert.equal(canExport(e,a,'different','instagram',Date.parse('2026-11-16T00:00:00Z')),false)});
test('manychat disabled until connected approved post',()=>assert.equal(manychatPlan().enabled,false));
test('manychat never enables publication',()=>assert.equal(manychatPlan({connected:true,approved:true,postId:'x'}).publish_enabled,false));
test('an absent asset hash cannot authorize export',()=>{
 const now=Date.parse('2026-11-16T00:00:00Z');
 const a={decision:'APPROVE',reviewer:'human',revision:e.revision,channel:'instagram',approved_at:'2026-11-15T00:00:00Z',expires_at:'2999-01-01T00:00:00Z'};
 assert.equal(canExport(e,a,undefined,'instagram',now),false);
 assert.equal(canExport(e,{...a,asset_hash:''},'','instagram',now),false);
 assert.equal(canExport(e,{...a,asset_hash:'hash'},'hash','instagram',now),true);
});
test('evidence must be a real https URL and slides must be filled in',()=>{
 const ok=[{headline:'A',body:'B'},{headline:'C',body:'D'}];
 assert.throws(()=>prepareEdition({id:'CI-04',brand:'FrankX',source:'https://',slides:ok}),/invalid_evidence_or_slides/);
 assert.throws(()=>prepareEdition({id:'CI-05',brand:'FrankX',source:'https://example.org',slides:Array(2)}),/incomplete_slide/);
 assert.doesNotThrow(()=>prepareEdition({id:'CI-06',brand:'FrankX',source:'https://example.org',slides:ok}));
});
