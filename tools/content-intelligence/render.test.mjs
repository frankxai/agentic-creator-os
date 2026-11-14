import test from 'node:test';import assert from 'node:assert/strict';import {renderSlide,renderPackage} from './render.mjs';
const p={content_id:'agent-security-001',brand_id:'FrankX',thesis:'Agent security is a system property',sources:[{id:'owasp',url:'https://owasp.org/www-project-top-10-for-large-language-model-applications/',retrieved_at:'2026-11-14',rights:'link-only'}],claims:[{text:'OWASP publishes guidance on LLM application risks',source_id:'owasp',evidence:'OWASP project page'}]};
test('svg dimensions and content',()=>{const s=renderSlide({headline:'Security is not a prompt',body:'Controls belong at the tool boundary'});assert.match(s,/width="1080" height="1350"/);assert.match(s,/Security is not a prompt/)});
test('escape XML injection',()=>{const s=renderSlide({headline:'A < B & C'});assert.match(s,/A &lt; B &amp; C/);assert.doesNotMatch(s,/< B/)});
test('valid source-backed package',()=>assert.equal(renderPackage(p,[{headline:'Security is a system property'},{headline:'Verify the tool boundary'}],'linkedin').length,2));
test('invalid evidence denied',()=>assert.throws(()=>renderPackage({...p,sources:[]},[{headline:'One'},{headline:'Two'}],'instagram')));
test('unsupported channel denied',()=>assert.throws(()=>renderSlide({headline:'One',channel:'tiktok'})));
test('overflow denied',()=>assert.throws(()=>renderSlide({headline:'word '.repeat(60)})));
