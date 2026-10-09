import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {propose, validateContext, loadKernel} from '../tools/gencreator-social/propose.mjs';

const graph = JSON.parse(fs.readFileSync(new URL('../workflows/social-media/content-loop.json', import.meta.url)));
const hash = 'a'.repeat(64);
const context = () => ({
  schema: 'gencreator.social-context.v1', dataKind: 'synthetic',
  pack: {id: 'test-pack', revisionDigest: hash}, mission: {id: 'test-mission', revisionDigest: hash},
  sourceDigest: hash, editionDigest: hash, reviewedEditionDigest: null,
  actorId: 'maker', verifierActorId: null, requestedStage: 'auto',
  signals: {sourceAvailable: true, editionAvailable: false, sourceRightsKnown: false, copyReviewed: false, creatorConfirmed: false, publisherReady: false, deliveryRequested: false, deliveryVerified: false, metricsAvailable: false, learningAccepted: false, packetInterrupted: false},
  iteration: {turnsUsed: 0, costUnitsUsed: 0, emptyRounds: 0}, executed: [], writebacks: [],
});
// Protocol stub tests the adapter only. It does not establish SIS semantics.
const protocol = (evaluation = {}) => ({
  compileLoopGraph: () => ({ok: true}),
  evaluateLoopGraph: (_graph, input) => ({ok: true, halted: false, route: ['dispatch', input.facts.stage], costUnits: 1, issues: [], ...evaluation}),
});
test('routes available source to a finished edition proposal without executing', () => {
  const result = propose(context(), protocol(), graph);
  assert.equal(result.stage, 'edition'); assert.equal(result.status, 'proposed');
  assert.equal(result.jobExecuted, false); assert.equal(result.published, false);
});
test('interruption takes precedence; missing source routes strategy', () => {
  const c = context(); c.signals.packetInterrupted = true;
  assert.equal(propose(c, protocol(), graph).stage, 'recover');
  c.signals.packetInterrupted = false; c.signals.sourceAvailable = false;
  assert.equal(propose(c, protocol(), graph).stage, 'strategy');
});
test('existing edition requires review', () => {
  const c = context(); c.signals.editionAvailable = true;
  assert.equal(propose(c, protocol(), graph).stage, 'review');
});
test('missing profile or mission prevents managed admission', () => {
  const c = context(); c.pack = null; c.mission = null;
  const result = propose(c, protocol(), graph);
  assert.equal(result.status, 'held'); assert.equal(result.gaps.length, 2);
});
test('explicit delivery holds unknown rights, current review, confirmation and readiness', () => {
  const c = context(); c.requestedStage = 'deliver'; c.signals.editionAvailable = true;
  const result = propose(c, protocol(), graph);
  assert.equal(result.status, 'held'); assert.equal(result.gaps.length, 4);
});
test('revision drift and missing checker cannot be declared reviewed', () => {
  const c = context(); c.signals.copyReviewed = true; c.reviewedEditionDigest = 'b'.repeat(64);
  const result = propose(c, protocol(), graph);
  assert.ok(result.warnings.includes('review-revision-stale'));
  assert.ok(result.warnings.includes('checker-declaration-missing'));
});
test('a stale review requests current review or recovery without blocking the repair itself', () => {
  const c=context();c.signals.editionAvailable=true;c.signals.copyReviewed=true;c.reviewedEditionDigest='b'.repeat(64);
  const result=propose(c,protocol(),graph);
  assert.equal(result.stage,'review');assert.equal(result.status,'proposed');
  c.signals.packetInterrupted=true;
  assert.equal(propose(c,protocol(),graph).status,'proposed');
});
test('compatible declarations propose unsent delivery, then observed learning, then idle', () => {
  const c = context(); Object.assign(c.signals, {editionAvailable: true, sourceRightsKnown: true, copyReviewed: true, creatorConfirmed: true, publisherReady: true, deliveryRequested: true});
  c.reviewedEditionDigest = hash; c.verifierActorId = 'checker';
  assert.equal(propose(c, protocol(), graph).stage, 'deliver');
  c.signals.deliveryVerified = true; c.signals.metricsAvailable = true;
  assert.equal(propose(c, protocol(), graph).stage, 'learn');
  c.signals.learningAccepted = true;
  assert.equal(propose(c, protocol(), graph).haltReason, 'nothing-useful-pending');
});
test('preserves SIS same-actor/writeback refusal and does not fabricate executions', () => {
  const c = context();
  const kernel = protocol({ok: false, issues: ['same-actor verification is rejected']});
  const result = propose(c, kernel, graph);
  assert.equal(result.status, 'held'); assert.match(result.gaps[0], /same-actor/);
  const inspecting = {compileLoopGraph: () => ({ok: true}), evaluateLoopGraph: (_g, input) => {assert.deepEqual(input.executed, []); return {ok: false, halted: false, route: [], costUnits: 0, issues: ['write-back required']};}};
  assert.equal(propose(c, inspecting, graph).status, 'held');
});
test('honors SIS turns/cost brakes and adds prospective cost and router empty-round limits', () => {
  for (const reason of ['max-turns', 'max-cost', 'silence']) assert.equal(propose(context(), protocol({ok: false, halted: true, haltReason: reason}), graph).haltReason, reason);
  const c = context(); c.iteration.costUnitsUsed = graph.brakes.maxCostUnits;
  assert.equal(propose(c, protocol(), graph).haltReason, 'prospective-cost');
  c.iteration.costUnitsUsed = 0; c.iteration.emptyRounds = 3;
  assert.equal(propose(c, protocol(), graph).haltReason, 'empty-rounds');
});
test('rejects malformed projections, external actions, unsafe counters and unknown fields', () => {
  const c = context(); c.requestedStage = 'publish'; assert.throws(() => validateContext(c));
  c.requestedStage = 'auto'; c.iteration.turnsUsed = -1; assert.throws(() => validateContext(c));
  c.iteration.turnsUsed = Infinity; assert.throws(() => validateContext(c));
  c.iteration.turnsUsed = 0; c.extra = true; assert.throws(() => validateContext(c));
});
test('refuses rejected graph compilation', () => {
  assert.throws(() => propose(context(), {...protocol(), compileLoopGraph: () => ({ok: false})}, graph), /SIS rejected/);
});
test('loads only the selected module bytes and rejects a different pin before execution', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'social-kernel-'));
  try {
    const file = path.join(dir, 'protocol.mjs');
    const source = 'export const compileLoopGraph=()=>({ok:true}); export const evaluateLoopGraph=()=>({ok:true});';
    fs.writeFileSync(file, source);
    const pin = crypto.createHash('sha256').update(source).digest('hex');
    assert.equal(typeof (await loadKernel(file, pin)).evaluateLoopGraph, 'function');
    await assert.rejects(loadKernel(file, hash), /digest differs/);
  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
});
