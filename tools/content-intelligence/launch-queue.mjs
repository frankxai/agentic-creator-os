import { createHash } from 'node:crypto';

export const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isEvidenceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function prepareEdition({ id, brand, source, slides, channels = ['instagram', 'linkedin'] }) {
  if (!/^CI-\d{2}$/.test(id) || !['FrankX', 'Starlight'].includes(brand)) {
    throw Error('invalid_identity');
  }
  if (!isEvidenceUrl(source) || !Array.isArray(slides) || slides.length < 2 || slides.length > 10) {
    throw Error('invalid_evidence_or_slides');
  }
  if (!Array.from(slides).every(slide => hasText(slide?.headline) && hasText(slide?.body))) {
    throw Error('incomplete_slide');
  }
  if (!Array.isArray(channels) || !channels.length
      || !Array.from(channels).every(channel => ['instagram', 'linkedin'].includes(channel))) {
    throw Error('unsupported_channel');
  }
  const content = structuredClone({ id, brand, source, slides, channels });
  return { ...content, revision: sha(content), state: 'REVIEW_REQUIRED', approval: null, published: false };
}

export function canExport(edition, receipt, assetHash, channel, now = Date.now()) {
  if (!edition || !['REVIEW_REQUIRED', 'APPROVED_FOR_EXPORT'].includes(edition.state)) return false;
  if (!receipt || receipt.decision !== 'APPROVE' || !hasText(receipt.reviewer)) return false;
  if (!hasText(assetHash) || !hasText(channel) || !Number.isFinite(now)) return false;

  try {
    const current = prepareEdition(edition);
    return edition.revision === current.revision
      && receipt.revision === current.revision
      && receipt.asset_hash === assetHash
      && receipt.channel === channel
      && current.channels.includes(channel)
      && Date.parse(receipt.approved_at) <= now
      && Date.parse(receipt.expires_at) > now;
  } catch {
    return false;
  }
}

export function manychatPlan({ connected = false, approved = false, postId = null, keyword = 'AGENT' } = {}) {
  return {
    provider: 'manychat', keyword, post_id: postId, enabled: Boolean(connected && approved && postId),
    publish_enabled: false, events: ['comment', 'dm_delivery', 'click', 'consent', 'download'], require_opt_in: true,
  };
}
