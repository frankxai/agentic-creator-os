/**
 * Starlight Distribution MVP — platform-neutral, review-first orchestration.
 * No TikTok credentials, scraping, synthetic engagement or publishing side effects.
 */
import { randomUUID } from 'node:crypto';

export const ACCOUNTS = Object.freeze([
  { id: 'arcanea', handle: '@arcanea.ai', role: 'original-world', enabled: true },
  { id: 'frankx', handle: null, role: 'creator-perspective', enabled: false },
  { id: 'starlight', handle: null, role: 'technical-breakdown', enabled: false },
  { id: 'gencreator', handle: null, role: 'production-process', enabled: false }
]);

export const STATES = Object.freeze(['draft', 'in_review', 'approved', 'exported', 'published', 'rejected']);
const transitions = {
  draft: ['in_review', 'rejected'],
  in_review: ['approved', 'rejected', 'draft'],
  approved: ['exported', 'draft'],
  exported: ['published', 'draft'],
  published: [],
  rejected: ['draft']
};
const actions = new Set(['crosspost', 'comment', 'share', 'reply']);
const safeText = (s, limit) => typeof s === 'string' && s.trim().length > 0 && s.length <= limit;
export function createDraft({ sourceUrl, accountId, action = 'crosspost', caption, rationale, assetRightsConfirmed = false }) {
  if (!/^https:\/\/(www\.)?tiktok\.com\/@[\w.]+\/video\/\d+\/?(?:\?.*)?$/.test(sourceUrl ?? '')) throw Error('Valid TikTok video URL required');
  if (!ACCOUNTS.some(a => a.id === accountId)) throw Error('Unknown account');
  if (!actions.has(action)) throw Error('Unknown action');
  if (!safeText(caption, 2200) || !safeText(rationale, 500)) throw Error('Caption and audience-specific rationale required');
  if (action === 'crosspost' && !assetRightsConfirmed) throw Error('Confirm media and audio reuse rights');
  return { id: randomUUID(), sourceUrl, accountId, action, caption: caption.trim(), rationale: rationale.trim(),
    assetRightsConfirmed, status: 'draft', history: [{ status: 'draft', at: new Date().toISOString() }] };
}
export function transition(item, next, actor, note = '') {
  if (!STATES.includes(next) || !transitions[item.status]?.includes(next)) throw Error('Invalid transition');
  if (!safeText(actor, 120)) throw Error('Named actor required');
  if (next === 'approved' && actor.startsWith('agent:')) throw Error('Human approval required');
  if (next === 'published' && (!safeText(note, 500) || !/^https:\/\//.test(note))) throw Error('Publication URL receipt required');
  return { ...item, status: next, history: [...item.history, { status: next, actor, note, at: new Date().toISOString() }] };
}
export function analyticsSnapshot({ views, likes, comments, shares, profileVisits, followersGained }) {
  const values = { views, likes, comments, shares, profileVisits, followersGained };
  if (Object.values(values).some(v => !Number.isSafeInteger(v) || v < 0)) throw Error('Metrics must be nonnegative integers');
  return { ...values, engagementRate: views ? (likes + comments + shares) / views : null,
    followConversion: profileVisits ? followersGained / profileVisits : null,
    capturedAt: new Date().toISOString(), provenance: 'manual-import' };
}
export function exportApproved(item) {
  if (item.status !== 'approved') throw Error('Only approved items may be exported');
  return { accountId: item.accountId, action: item.action, caption: item.caption,
    sourceUrl: item.sourceUrl, rationale: item.rationale, requiresManualPlatformAction: true };
}
