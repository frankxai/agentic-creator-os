import test from 'node:test';
import assert from 'node:assert/strict';
import { createDraft, transition, analyticsSnapshot, exportApproved, ACCOUNTS } from './distribution.mjs';
const args = { sourceUrl: 'https://www.tiktok.com/@arcanea.ai/video/123456789', accountId: 'frankx', caption: 'How we made this world', rationale: 'Creator process angle', assetRightsConfirmed: true };
test('registry defaults unknown accounts to disabled', () => assert.equal(ACCOUNTS.filter(a => a.enabled).length, 1));
test('requires media rights', () => assert.throws(() => createDraft({ ...args, assetRightsConfirmed: false }), /rights/));
test('rejects unknown accounts and malformed URLs', () => { assert.throws(() => createDraft({...args, accountId:'bot'})); assert.throws(() => createDraft({...args, sourceUrl:'https://evil.test'})); });
test('human review and receipt are mandatory', () => {
  const draft = createDraft(args);
  assert.throws(() => exportApproved(draft));
  const review = transition(draft, 'in_review', 'agent:planner');
  assert.throws(() => transition(review, 'approved', 'agent:planner'), /Human/);
  const approved = transition(review, 'approved', 'frank');
  assert.equal(exportApproved(approved).requiresManualPlatformAction, true);
  const exported = transition(approved, 'exported', 'frank');
  assert.throws(() => transition(exported, 'published', 'frank'), /receipt/);
  assert.equal(transition(exported, 'published', 'frank', 'https://www.tiktok.com/@frank/video/123').status, 'published');
});
test('metrics preserve zero denominators', () => {
  assert.equal(analyticsSnapshot({views:0,likes:0,comments:0,shares:0,profileVisits:0,followersGained:0}).engagementRate, null);
  assert.throws(() => analyticsSnapshot({views:-1,likes:0,comments:0,shares:0,profileVisits:0,followersGained:0}));
});
