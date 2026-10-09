#!/usr/bin/env node
// Integrity only: declared evidence and rights still need independent inspection.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const meaningful = (v) => typeof v === 'string' && v.trim().length > 0 && !/^(replace[ -]|blocked$)/i.test(v);
const date = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const timestamp = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(v) && date(v.slice(0, 10)) && !Number.isNaN(Date.parse(v));
const https = (v) => { try { return meaningful(v) && new URL(v).protocol === 'https:'; } catch { return false; } };
const normalizedIdentity = (v) => typeof v === 'string' ? v.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase() : '';

export function validateResearchPacket(packet) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const strings = (v, path, nonempty = false) => {
    check(Array.isArray(v) && (!nonempty || v.length > 0) && v.every(meaningful), `${path}: expected ${nonempty ? 'nonempty ' : ''}string array`);
  };
  const fields = (v, path, names) => {
    check(object(v), `${path}: expected object`);
    for (const name of names) check(meaningful(v?.[name]), `${path}.${name}: required text`);
  };
  const records = (v, path) => {
    check(Array.isArray(v), `${path}: expected array`);
    const seen = new Set();
    return (Array.isArray(v) ? v : []).filter((item, i) => {
      check(object(item), `${path}[${i}]: expected object`);
      if (!object(item)) return false;
      check(meaningful(item.id), `${path}[${i}].id: required text`);
      check(!seen.has(item.id), `${path}[${i}].id: duplicate ${item.id}`);
      seen.add(item.id);
      return true;
    });
  };
  if (!object(packet)) return { valid: false, errors: ['packet: expected object'] };
  fields(packet, 'packet', ['research_id', 'article_content_id']);
  check(packet.schema_version === '1.0.0', 'schema_version: expected 1.0.0');
  check(['SEED', 'SOURCE_REVIEWED', 'EXPERIMENT_REPORTED', 'HOLD'].includes(packet.status), 'status: unknown research state');
  check(['DRAFT', 'PREVIEW', 'PUBLISH', 'DISTRIBUTE'].includes(packet.authority), 'authority: unknown authority');
  check(date(packet.as_of), 'as_of: expected YYYY-MM-DD');
  fields(packet.brief, 'brief', ['question', 'decision', 'contribution', 'strongest_objection']);
  check(object(packet.method), 'method: expected object');
  check(['source_review', 'original_experiment', 'mixed'].includes(packet.method?.mode), 'method.mode: unknown mode');
  strings(packet.method?.limitations, 'method.limitations', true);
  strings(packet.method?.contrary_search, 'method.contrary_search', true);
  strings(packet.method?.coverage_gaps, 'method.coverage_gaps');
  strings(packet.blocked, 'blocked');
  const promoted = ['SOURCE_REVIEWED', 'EXPERIMENT_REPORTED'].includes(packet.status);
  if (promoted) check(packet.blocked?.length === 0, 'blocked: promoted packet has blockers');

  const sources = records(packet.sources, 'sources');
  const sourceIds = new Set(sources.map((s) => s.id));
  if (promoted) check(sources.length > 0, 'sources: promoted packet requires inspected evidence');
  for (const source of sources) {
    const p = `source:${source.id}`;
    fields(source, p, ['title', 'evidence_family']);
    check(https(source.url), `${p}.url: expected HTTPS URL`);
    check(['documentation', 'paper', 'repository', 'release', 'dataset', 'official_video', 'observation', 'secondary'].includes(source.kind), `${p}.kind: unknown kind`);
    check(['ga', 'preview', 'beta', 'experimental', 'proposed', 'unknown', 'not_applicable'].includes(source.availability), `${p}.availability: unknown availability`);
    for (const key of ['published_at', 'updated_at']) check(source[key] === null || date(source[key]), `${p}.${key}: expected date or null`);
    check(timestamp(source.retrieved_at), `${p}.retrieved_at: expected ISO timestamp`);
    if (promoted) check(source.reviewed === true, `${p}.reviewed: source was not inspected`);
    else check(typeof source.reviewed === 'boolean', `${p}.reviewed: expected boolean`);
    strings(source.limitations, `${p}.limitations`);
  }
  const reference = (ref, path) => {
    fields(ref, path, ['source_id', 'locator']);
    check(sourceIds.has(ref?.source_id), `${path}.source_id: unknown source`);
  };
  const claims = records(packet.claims, 'claims');
  if (promoted) check(claims.length > 0, 'claims: promoted packet requires material claims');
  for (const claim of claims) {
    const p = `claim:${claim.id}`;
    fields(claim, p, ['text']);
    check(['fact', 'first_party', 'inference', 'opinion', 'forecast', 'community_signal'].includes(claim.type), `${p}.type: unknown type`);
    check(date(claim.as_of), `${p}.as_of: expected YYYY-MM-DD`);
    check(['pass', 'revise', 'blocked'].includes(claim.verdict), `${p}.verdict: unknown verdict`);
    if (promoted) check(claim.verdict === 'pass', `${p}.verdict: unsupported claim prevents promotion`);
    strings(claim.limitations, `${p}.limitations`);
    strings(claim.freshness_triggers, `${p}.freshness_triggers`, true);
    check(Array.isArray(claim.references) && claim.references.length > 0, `${p}.references: required evidence`);
    const refs = Array.isArray(claim.references) ? claim.references : [];
    const contrary = Array.isArray(claim.contrary_evidence) ? claim.contrary_evidence : [];
    for (const [i, ref] of refs.entries()) {
      reference(ref, `${p}.references[${i}]`);
      check(['direct', 'derived', 'contextual', 'contested'].includes(ref?.support), `${p}.references[${i}].support: unknown relationship`);
    }
    if (promoted && ['fact', 'first_party'].includes(claim.type)) check(refs.some((r) => ['direct', 'derived'].includes(r?.support)), `${p}: fact requires direct or derived support`);
    check(Array.isArray(claim.contrary_evidence), `${p}.contrary_evidence: expected array`);
    for (const [i, ref] of contrary.entries()) {
      reference(ref, `${p}.contrary_evidence[${i}]`);
      fields(ref, `${p}.contrary_evidence[${i}]`, ['effect']);
    }
    if (promoted && (contrary.length || refs.some((r) => r?.support === 'contested'))) check(Array.isArray(claim.limitations) && claim.limitations.length > 0, `${p}: disputed claim needs explicit limitations`);
  }
  const experiments = records(packet.experiments, 'experiments');
  for (const exp of experiments) {
    fields(exp, `experiment:${exp.id}`, ['question', 'artifact', 'environment', 'command', 'result']);
    check(timestamp(exp.executed_at), `experiment:${exp.id}.executed_at: required execution timestamp`);
    strings(exp.limitations, `experiment:${exp.id}.limitations`, true);
  }
  if (packet.status === 'SOURCE_REVIEWED') {
    check(packet.method?.mode === 'source_review', 'SOURCE_REVIEWED: expected source_review method');
    check(experiments.length === 0, 'SOURCE_REVIEWED: executed experiments require EXPERIMENT_REPORTED');
  }
  if (packet.status === 'EXPERIMENT_REPORTED') {
    check(['original_experiment', 'mixed'].includes(packet.method?.mode), 'EXPERIMENT_REPORTED: expected original or mixed method');
    check(experiments.length > 0, 'EXPERIMENT_REPORTED: executed experiment required');
  }
  for (const asset of records(packet.media, 'media')) {
    const p = `media:${asset.id}`;
    fields(asset, p, ['publisher', 'locator', 'caption', 'alt', 'placement', 'transformation', 'rights_evidence']);
    check(sourceIds.has(asset.source_id), `${p}.source_id: unknown source`);
    check(https(asset.url), `${p}.url: expected HTTPS URL`);
    check(timestamp(asset.captured_at), `${p}.captured_at: expected ISO timestamp`);
    check(['screenshot', 'graphic', 'video', 'original_diagram'].includes(asset.kind), `${p}.kind: unknown kind`);
    const allowedRights = { rehost: ['permission', 'license'], embed: ['provider_embed', 'permission', 'license'], link: ['link_only', 'permission', 'license'], original: ['original'] };
    check(Object.hasOwn(allowedRights, asset.use ?? ''), `${p}.use: unknown use`);
    check(['permission', 'license', 'provider_embed', 'link_only', 'original', 'unresolved'].includes(asset.rights_basis), `${p}.rights_basis: unknown basis`);
    const rights = Object.hasOwn(allowedRights, asset.use ?? '') ? allowedRights[asset.use] : [];
    if (promoted || asset.rights_basis !== 'unresolved') check(rights.includes(asset.rights_basis), `${p}: rights basis does not permit this use`);
  }
  const pub = packet.publication_record;
  check(object(pub), 'publication_record: expected object');
  if (promoted) {
    fields(pub, 'publication_record', ['title', 'description', 'author', 'reviewer']);
    check(https(pub?.canonical_url), 'publication_record.canonical_url: expected HTTPS URL');
    check(normalizedIdentity(pub?.author) !== normalizedIdentity(pub?.reviewer), 'publication_record.reviewer: independent reviewer required');
    check(timestamp(pub?.reviewed_at), 'publication_record.reviewed_at: expected ISO timestamp');
  }
  check(pub?.render_strategy === 'server_or_static', 'publication_record.render_strategy: essential evidence requires server/static HTML');
  check(Array.isArray(pub?.related_urls) && pub.related_urls.every(https), 'publication_record.related_urls: expected HTTPS URLs');
  return { valid: errors.length === 0, errors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let result;
  try {
    if (!process.argv[2]) throw new Error('Pass a research packet JSON path.');
    result = validateResearchPacket(JSON.parse(readFileSync(process.argv[2], 'utf8')));
  } catch (error) { result = { valid: false, errors: [error.message] }; }
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.valid ? 0 : 1;
}
