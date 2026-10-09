import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { validateResearchPacket } from '../scripts/validate-research-packet.mjs';

// Synthetic fixtures: these demonstrate integrity checks, never provider facts.
const fixture = () => ({
  schema_version: '1.0.0', research_id: 'r1', article_content_id: 'a1',
  status: 'SOURCE_REVIEWED', authority: 'PREVIEW', as_of: '2026-10-09',
  brief: { question: 'Which recovery boundary?', decision: 'Select a durable runtime', contribution: 'Compare failure boundaries', strongest_objection: 'Persistence alone cannot guarantee delivery' },
  method: { mode: 'source_review', limitations: ['Not independently executed'], contrary_search: ['Inspected recovery exclusions'], coverage_gaps: [] },
  sources: [{ id: 's1', url: 'https://example.com/docs', title: 'Synthetic primary fixture', kind: 'documentation', published_at: null, updated_at: null, retrieved_at: '2026-10-09T20:00:00Z', reviewed: true, evidence_family: 'example', availability: 'preview', limitations: ['Synthetic fixture'] }],
  claims: [{ id: 'c1', text: 'Fixture documents a checkpoint API', type: 'fact', as_of: '2026-10-09', verdict: 'pass', references: [{ source_id: 's1', locator: '#checkpoint-api', support: 'direct' }], limitations: [], freshness_triggers: ['API changes'], contrary_evidence: [] }],
  experiments: [], media: [], blocked: [],
  publication_record: { canonical_url: 'https://example.com/research', title: 'Recovery boundaries', description: 'Synthetic dossier', author: 'author', reviewer: 'reviewer', reviewed_at: '2026-10-09T21:00:00Z', related_urls: ['https://example.com/research/runtime'], render_strategy: 'server_or_static' },
});
const invalid = (packet, pattern) => { const r = validateResearchPacket(packet); assert.equal(r.valid, false); assert.match(r.errors.join('\n'), pattern); };

test('source-review declarations pass without pretending an experiment ran', () => assert.deepEqual(validateResearchPacket(fixture()), { valid: true, errors: [] }));
test('unsupported and contextual-only facts cannot promote', () => {
  const p = fixture(); p.claims[0].verdict = 'blocked'; invalid(p, /unsupported claim/);
  p.claims[0].verdict = 'pass'; p.claims[0].references[0].support = 'contextual'; invalid(p, /fact requires direct/);
});
test('unknown IDs, duplicates, and missing locators are caught', () => {
  const p = fixture(); p.sources.push({ ...p.sources[0] }); p.claims[0].references[0] = { source_id: 'missing', support: 'direct' };
  invalid(p, /duplicate/); invalid(p, /unknown source/); invalid(p, /locator/);
});
test('uninspected sources and self-review fail promoted evidence', () => {
  const p = fixture(); p.sources[0].reviewed = false; p.publication_record.reviewer = p.publication_record.author;
  invalid(p, /not inspected/); invalid(p, /independent reviewer/);
});
test('reviewer identity cannot bypass independence with formatting or compatibility characters', () => {
  for (const reviewer of ['  RESEARCH   AUTHOR  ', 'Ｒｅｓｅａｒｃｈ Ａｕｔｈｏｒ', 'Research\tAuthor']) {
    const p = fixture(); p.publication_record.author = 'Research Author'; p.publication_record.reviewer = reviewer;
    invalid(p, /independent reviewer/);
  }
  const p = fixture(); p.publication_record.author = 'Research Author'; p.publication_record.reviewer = 'Independent Reviewer';
  assert.equal(validateResearchPacket(p).valid, true);
});
test('an experiment plan cannot be reported as an executed result', () => {
  const p = fixture(); p.status = 'EXPERIMENT_REPORTED'; p.method.mode = 'mixed'; invalid(p, /executed experiment required/);
  p.experiments.push({ id: 'e1', question: 'Checkpoint after crash?', artifact: 'outputs/run1.json', environment: 'Node 22, local fixture', command: 'node fixture.mjs', result: 'Recorded one resumed step', executed_at: '2026-10-09T20:00:00Z', limitations: ['One synthetic task'] });
  assert.equal(validateResearchPacket(p).valid, true);
  delete p.experiments[0].executed_at; invalid(p, /execution timestamp/);
});
test('provider embed permission never licenses rehosting', () => {
  const p = fixture(); p.media.push({ id: 'm1', kind: 'video', source_id: 's1', url: 'https://example.com/embed', publisher: 'Example publisher', captured_at: '2026-10-09T20:00:00Z', locator: '00:35', caption: 'Checkpoint demo', alt: 'Checkpoint demonstration', placement: 'recovery section', transformation: 'none', use: 'embed', rights_basis: 'provider_embed', rights_evidence: 'Verified publisher embed record' });
  assert.equal(validateResearchPacket(p).valid, true);
  p.media[0].use = 'rehost'; invalid(p, /rights basis does not permit/);
  p.media[0].rights_basis = 'unresolved'; invalid(p, /rights basis does not permit/);
});
test('contrary evidence requires a known locator and disclosed limitation', () => {
  const p = fixture(); p.claims[0].contrary_evidence.push({ source_id: 's1', locator: '#exclusions', effect: 'API excludes external side effects' });
  invalid(p, /disputed claim needs/); p.claims[0].limitations.push('External side effects excluded'); assert.equal(validateResearchPacket(p).valid, true);
});
test('malformed nested records fail cleanly and invalid calendar dates fail', () => {
  for (const value of [null, [], 'text', 42]) assert.equal(validateResearchPacket(value).valid, false);
  const p = fixture(); p.claims[0].references = [null]; p.method = null; invalid(p, /expected object/);
  const q = fixture(); q.as_of = '2026-02-30'; invalid(q, /as_of/);
  const r = fixture(); r.claims[0].references = { some: 'malformed' }; invalid(r, /required evidence/);
});
test('the unfilled template fails closed', () => {
  const p = JSON.parse(readFileSync(new URL('../templates/content/research-packet.json', import.meta.url), 'utf8'));
  invalid(p, /required text/);
});
test('CLI rejects malformed JSON or missing input without a stack trace', () => {
  const result = spawnSync(process.execPath, [new URL('../scripts/validate-research-packet.mjs', import.meta.url).pathname], { encoding: 'utf8' });
  assert.equal(result.status, 1); assert.equal(JSON.parse(result.stdout).valid, false); assert.equal(result.stderr, '');
  const malformed = spawnSync(process.execPath, [new URL('../scripts/validate-research-packet.mjs', import.meta.url).pathname, new URL('./research-packet.test.mjs', import.meta.url).pathname], { encoding: 'utf8' });
  assert.equal(malformed.status, 1); assert.equal(JSON.parse(malformed.stdout).valid, false); assert.equal(malformed.stderr, '');
});
