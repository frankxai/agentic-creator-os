import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
import * as moduleTools from 'node:module';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const STAGES = ['strategy', 'edition', 'review', 'deliver', 'learn', 'recover'];
const SIGNALS = ['sourceAvailable', 'editionAvailable', 'sourceRightsKnown', 'copyReviewed', 'creatorConfirmed', 'publisherReady', 'deliveryRequested', 'deliveryVerified', 'metricsAvailable', 'learningAccepted', 'packetInterrupted'];
const ACTIONS = {strategy: 'prepare_local_artifact', edition: 'prepare_local_artifact', review: 'inspect_local_artifact', deliver: 'prepare_unsent_delivery', learn: 'propose_learning', recover: 'recover_local_artifact'};
const OUTPUTS = {strategy: 'strategy.md and proposed-calendar.csv', edition: 'verified source-linked edition and editable copy', review: 'revision-bound findings and corrected copy', deliver: 'verified unsent destination packet', learn: 'comparable observations and next-experiment.md', recover: 'preserved original and verified replacement packet'};
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function keys(value, names, label) {
  if (!object(value) || Object.keys(value).some(key => !names.includes(key)) || names.some(key => !(key in value))) throw new Error(`Invalid ${label} fields`);
}
function digest(value, nullable = true) {
  if (!(nullable && value === null) && !(typeof value === 'string' && /^[a-f0-9]{64}$/.test(value))) throw new Error('Invalid revision digest');
}
function ref(value) {
  if (value === null) return;
  keys(value, ['id', 'revisionDigest'], 'owner reference');
  if (typeof value.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,119}$/.test(value.id)) throw new Error('Invalid owner reference');
  digest(value.revisionDigest, false);
}
export function validateContext(context) {
  keys(context, ['schema', 'dataKind', 'pack', 'mission', 'sourceDigest', 'editionDigest', 'reviewedEditionDigest', 'actorId', 'verifierActorId', 'requestedStage', 'signals', 'iteration', 'executed', 'writebacks'], 'context');
  if (context.schema !== 'gencreator.social-context.v1' || !['synthetic', 'supplied_data'].includes(context.dataKind)) throw new Error('Invalid context schema');
  ref(context.pack); ref(context.mission);
  for (const key of ['sourceDigest', 'editionDigest', 'reviewedEditionDigest']) digest(context[key]);
  for (const key of ['actorId', 'verifierActorId']) {
    if (key === 'verifierActorId' && context[key] === null) continue;
    if (typeof context[key] !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._:@-]{0,119}$/.test(context[key])) throw new Error('Invalid actor declaration');
  }
  if (!['auto', ...STAGES].includes(context.requestedStage)) throw new Error('Invalid stage');
  keys(context.signals, SIGNALS, 'signals');
  if (SIGNALS.some(key => typeof context.signals[key] !== 'boolean')) throw new Error('Signals must be boolean');
  keys(context.iteration, ['turnsUsed', 'costUnitsUsed', 'emptyRounds'], 'iteration');
  if (Object.values(context.iteration).some(value => !Number.isSafeInteger(value) || value < 0)) throw new Error('Invalid counters');
  for (const key of ['executed', 'writebacks']) {
    if (!Array.isArray(context[key]) || context[key].length > 7 || new Set(context[key]).size !== context[key].length || context[key].some(id => !['dispatch', ...STAGES].includes(id))) throw new Error('Invalid writeback declarations');
  }
  return context;
}

// Facts are a projection supplied by an owner. This does not authenticate them.
export function propose(context, kernel, graph) {
  validateContext(context);
  const compiled = kernel.compileLoopGraph(graph);
  if (!compiled.ok) throw new Error('SIS rejected the content graph');
  const s = context.signals;
  const revisionCurrent = context.editionDigest !== null && context.reviewedEditionDigest === context.editionDigest;
  const reviewed = s.copyReviewed && revisionCurrent;
  let stage = context.requestedStage;
  if (stage === 'auto') stage = s.packetInterrupted ? 'recover' : !s.sourceAvailable ? 'strategy' : !s.editionAvailable ? 'edition' : !reviewed || !s.creatorConfirmed ? 'review' : s.deliveryRequested && !s.deliveryVerified ? 'deliver' : s.deliveryVerified && s.metricsAvailable && !s.learningAccepted ? 'learn' : null;
  const gaps = [];
  const warnings = [];
  if (!context.pack) gaps.push('creator-pack-reference-missing');
  if (!context.mission) gaps.push('mission-reference-missing');
  if (stage && stage !== 'strategy' && (!s.sourceAvailable || !context.sourceDigest)) gaps.push('source-revision-missing');
  if (stage && ['review', 'deliver', 'learn'].includes(stage) && (!s.editionAvailable || !context.editionDigest)) gaps.push('edition-revision-missing');
  if (stage === 'deliver') {
    if (!s.sourceRightsKnown) gaps.push('source-rights-unknown');
    if (!reviewed) gaps.push('current-copy-review-missing');
    if (!s.creatorConfirmed) gaps.push('creator-confirmation-missing');
    if (!s.publisherReady) gaps.push('publisher-readiness-unknown');
  }
  if (stage === 'learn' && (!s.deliveryVerified || !s.metricsAvailable)) gaps.push('verified-delivery-or-observations-missing');
  if (s.copyReviewed && !revisionCurrent) warnings.push('review-revision-stale');
  if (s.copyReviewed && !context.verifierActorId) {
    warnings.push('checker-declaration-missing');
    if (stage === 'deliver') gaps.push('checker-declaration-missing');
  }
  const evaluation = kernel.evaluateLoopGraph(graph, {
    facts: {stage: stage ?? '', emptyRounds: context.iteration.emptyRounds, writebacks: context.writebacks},
    actorId: context.actorId, verifierActorId: context.verifierActorId ?? undefined,
    turnsUsed: context.iteration.turnsUsed, costUsed: context.iteration.costUnitsUsed,
    executed: context.executed, proposedAction: stage ? ACTIONS[stage] : undefined,
  });
  let haltReason = evaluation.haltReason ?? null;
  // These product limits also cover router graphs; SIS applies empty rounds to converge.
  if (!haltReason && context.iteration.emptyRounds >= graph.brakes.emptyRoundsToStop) haltReason = 'empty-rounds';
  if (!haltReason && context.iteration.costUnitsUsed + evaluation.costUnits > graph.brakes.maxCostUnits) haltReason = 'prospective-cost';
  if (!haltReason && !stage) haltReason = 'nothing-useful-pending';
  if (!evaluation.ok && !evaluation.halted) gaps.push(...evaluation.issues);
  const ready = gaps.length === 0 && haltReason === null && evaluation.ok;
  return {
    schema: 'gencreator.social-proposal.v1', dataKind: context.dataKind,
    authority: 'proposal_only', published: false, jobExecuted: false, identityVerified: false,
    graphId: graph.id, parentWorkflow: graph.projection ?? null,
    ownerReferences: {pack: context.pack, mission: context.mission},
    sourceDigest: context.sourceDigest, editionDigest: context.editionDigest,
    stage, command: stage ? `/gencreator-${stage}` : null,
    skill: stage ? `.claude/skills/gencreator-${stage}/SKILL.md` : null,
    deliverable: stage ? OUTPUTS[stage] : null,
    status: ready ? 'proposed' : haltReason ? 'halted' : 'held', gaps, warnings, haltReason,
    evaluation, counterPersistence: 'existing mission owner must record actual work and counters',
    factProvenance: 'caller declarations; digests are not identity or semantic proof',
  };
}

function readBounded(filename, limit) {
  const stat = fs.lstatSync(filename);
  if (stat.isSymbolicLink() || !stat.isFile() || stat.size > limit) throw new Error('Invalid input file');
  const fd = fs.openSync(filename, 'r');
  try {
    const opened = fs.fstatSync(fd);
    if (!opened.isFile() || opened.size > limit) throw new Error('Invalid input size');
    const bytes = Buffer.alloc(limit + 1);
    let length = 0;
    while (length < bytes.length) {
      const count = fs.readSync(fd, bytes, length, bytes.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length > limit) throw new Error('Input grew beyond limit');
    return bytes.subarray(0, length);
  } finally { fs.closeSync(fd); }
}
export async function loadKernel(filename, expectedDigest) {
  digest(expectedDigest, false);
  const bytes = readBounded(filename, 128_000);
  if (sha(bytes) !== expectedDigest) throw new Error('SIS module digest differs');
  let source = new TextDecoder('utf-8', {fatal: true}).decode(bytes);
  if (path.extname(filename) === '.ts') {
    if (typeof moduleTools.stripTypeScriptTypes !== 'function') throw new Error('TypeScript kernel needs Node with stripTypeScriptTypes or a reviewed compiled JS module');
    source = moduleTools.stripTypeScriptTypes(source, {mode: 'strip'});
  }
  // Explicitly selected, pinned code executes here. This is not a sandbox.
  const kernel = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  if (typeof kernel.compileLoopGraph !== 'function' || typeof kernel.evaluateLoopGraph !== 'function') throw new Error('Invalid SIS exports');
  return kernel;
}
async function main(args) {
  if (args.length !== 5 || args[1] !== '--sis-module' || args[3] !== '--sis-sha256') throw new Error('Usage: propose.mjs context.json --sis-module reviewed-file --sis-sha256 sha256');
  const context = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(readBounded(args[0], 65_536)));
  validateContext(context);
  const graph = JSON.parse(readBounded(path.join(ROOT, 'workflows/social-media/content-loop.json'), 65_536).toString('utf8'));
  const kernel = await loadKernel(args[2], args[4]);
  const result = propose(context, kernel, graph);
  result.kernel = {sha256: args[4], sourceSelection: 'explicit reviewed local module'};
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(() => {
    process.stderr.write('Content proposal refused; check context, reviewed SIS module and pin.\n');
    process.exitCode = 2;
  });
}
