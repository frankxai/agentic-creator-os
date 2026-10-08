#!/usr/bin/env node
// ACOS filesystem adapter. GenCreator's explicitly selected, pinned Producer
// remains the source/revision reviewer. This module performs no inference.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { lstatSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync, unlinkSync, rmdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const LIMIT = 2_000_000;
const FILES = ['content.md', 'edition.json', 'review.json', 'source.txt'];
const hash = value => createHash('sha256').update(value).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const digest = value => typeof value === 'string' && /^sha256:[a-f0-9]{64}$/.test(value);

function readRegular(path, limit = LIMIT) {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > limit) throw new Error('Expected a bounded regular file');
  const bytes = readFileSync(path);
  if (bytes.length > limit) throw new Error('File exceeds size limit');
  return bytes;
}

function parse(bytes) {
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new Error('Invalid UTF-8 JSON input'); }
}

function checkReview(review, edition) {
  const fields = ['schema', 'sourceDigest', 'artifacts', 'state', 'gaps', 'authority', 'semanticReview', 'identityVerified', 'published', 'externalWrites'];
  if (!object(review) || Object.keys(review).sort().join() !== fields.sort().join()
    || review.schema !== 'gencreator.local-review.v1'
    || !object(edition) || !object(edition.source) || typeof edition.source.text !== 'string'
    || review.sourceDigest !== 'sha256:' + hash(edition.source.text)
    || review.authority !== 'supplied_content_confirmation_only'
    || review.semanticReview !== 'required_separately'
    || review.identityVerified !== false || review.published !== false || review.externalWrites !== false
    || !['draft', 'content_confirmed'].includes(review.state)
    || !Array.isArray(review.gaps) || !review.gaps.every(x => typeof x === 'string')
    || !Array.isArray(edition.artifacts) || !Array.isArray(review.artifacts)
    || review.artifacts.length !== edition.artifacts.length
    || (review.state === 'content_confirmed') !== (review.gaps.length === 0)) throw new Error('Invalid Producer review response');
  const ids = new Set();
  for (const [index, artifact] of edition.artifacts.entries()) {
    const row = review.artifacts[index];
    if (!object(artifact) || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(artifact.id) || ids.has(artifact.id)
      || typeof artifact.content !== 'string' || typeof artifact.title !== 'string' || typeof artifact.channel !== 'string'
      || !object(row) || Object.keys(row).sort().join() !== 'digest,evidenceSpans,id'
      || row.id !== artifact.id || !digest(row.digest) || !Number.isSafeInteger(row.evidenceSpans) || row.evidenceSpans < 1) throw new Error('Invalid Producer review response');
    ids.add(artifact.id);
  }
}

function markdown(edition, review) {
  return `# ${edition.creator}: social edition\n\nAudience: ${edition.audience}\n\nState: ${review.state}. Publication: unsent. Identity verification: false.\n\nSource: ${edition.source.label}\nSource digest: ${review.sourceDigest}\n\nSemantic and voice review remain separate. Editing this file breaks the packet integrity check. Edit edition.json in a new revision and prepare a new packet.\n\n`
    + edition.artifacts.map((a, i) => `## ${a.title}\n\nChannel: ${a.channel}\nArtifact: ${a.id}\nRevision: ${review.artifacts[i].digest}\n\n${a.content}\n`).join('\n');
}

export function preparePacket({ editionPath, producerPath, producerDigest, outputDir, python = 'python', timeoutMs = 10_000 }) {
  if (typeof producerDigest !== 'string' || !/^[a-f0-9]{64}$/.test(producerDigest)) throw new Error('Producer digest must be an explicit SHA-256');
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 60_000) throw new Error('Invalid review timeout');
  const engine = readRegular(resolve(producerPath), 1_000_000);
  if (hash(engine) !== producerDigest) throw new Error('Producer digest mismatch; review the new revision before pinning');
  const raw = readRegular(resolve(editionPath));
  const edition = parse(raw);
  // Feed the exact pinned engine bytes on stdin and review a stable input copy.
  // Explicit interpreter/argv with shell:false avoids shell expansion of paths.
  const temporary = mkdtempSync(join(tmpdir(), 'acos-social-review-'));
  const snapshot = join(temporary, 'edition.json');
  let review;
  try {
    writeFileSync(snapshot, raw, { flag: 'wx', mode: 0o600 });
    const result = spawnSync(python, ['-c', 'import sys; exec(compile(sys.stdin.buffer.read(), "<pinned-gencreator-producer>", "exec"))', 'review', snapshot], {
      input: engine, encoding: 'utf8', shell: false, windowsHide: true,
      timeout: timeoutMs, maxBuffer: 512_000,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
    });
    if (result.error || result.status !== 0) throw new Error('Producer review failed; inspect the contract locally');
    review = parse(Buffer.from(result.stdout, 'utf8'));
    checkReview(review, edition);
  } finally {
    // Delete only the two exact temporary paths created by this invocation.
    try { unlinkSync(snapshot); } catch { /* preserve unexpected failure */ }
    try { rmdirSync(temporary); } catch { /* preserve unexpected failure */ }
  }
  const output = resolve(outputDir);
  try { mkdirSync(output, { mode: 0o700 }); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('Output already exists; preserve it and choose a new directory');
    throw new Error('Cannot create output directory; its parent must exist');
  }
  const contents = { 'edition.json': raw, 'source.txt': edition.source.text, 'review.json': json(review), 'content.md': markdown(edition, review) };
  const receipt = {
    schema: 'acos.gencreator-social-packet.v1', producerSha256: producerDigest,
    inputSha256: hash(raw), sourceDigest: review.sourceDigest, state: review.state,
    identityVerified: false, published: false, externalWrites: false,
    files: Object.fromEntries(FILES.map(name => [name, hash(contents[name])])),
  };
  try {
    for (const name of FILES) writeFileSync(join(output, name), contents[name], { flag: 'wx', mode: 0o600 });
    // A complete receipt is written last. Partial packets are never overwritten.
    writeFileSync(join(output, 'receipt.json'), json(receipt), { flag: 'wx', mode: 0o600 });
  } catch { throw new Error('Incomplete packet preserved; retry into a new directory'); }
  return receipt;
}

export function verifyPacket(directory) {
  const root = resolve(directory);
  const stat = lstatSync(root);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Expected a regular packet directory');
  const names = readdirSync(root).sort();
  if (names.join() !== [...FILES, 'receipt.json'].sort().join()) throw new Error('Unexpected packet file set or incomplete packet');
  const receipt = parse(readRegular(join(root, 'receipt.json'), 32_000));
  const receiptFields = ['schema', 'producerSha256', 'inputSha256', 'sourceDigest', 'state', 'identityVerified', 'published', 'externalWrites', 'files'];
  if (!object(receipt) || Object.keys(receipt).sort().join() !== receiptFields.sort().join()
    || receipt.schema !== 'acos.gencreator-social-packet.v1' || !/^[a-f0-9]{64}$/.test(receipt.producerSha256)
    || receipt.identityVerified !== false || receipt.published !== false || receipt.externalWrites !== false
    || !object(receipt.files) || Object.keys(receipt.files).sort().join() !== FILES.join()) throw new Error('Invalid packet receipt');
  const bytes = Object.fromEntries(FILES.map(name => [name, readRegular(join(root, name), 8_000_000)]));
  for (const name of FILES) if (hash(bytes[name]) !== receipt.files[name]) throw new Error('Packet integrity check failed');
  const edition = parse(bytes['edition.json']);
  const review = parse(bytes['review.json']);
  checkReview(review, edition);
  if (receipt.inputSha256 !== hash(bytes['edition.json']) || receipt.sourceDigest !== review.sourceDigest || receipt.state !== review.state
    || !bytes['source.txt'].equals(Buffer.from(edition.source.text)) || !bytes['content.md'].equals(Buffer.from(markdown(edition, review)))) throw new Error('Packet integrity check failed');
  return receipt;
}

function main(args) {
  if (args[0] === 'verify' && args.length === 2) return verifyPacket(args[1]);
  const allowed = new Set(['--edition', '--producer', '--producer-sha256', '--out', '--python']);
  if (args.shift() !== 'prepare' || args.length % 2) throw new Error('Use prepare --edition file --producer edition.py --producer-sha256 hash --out new-dir [--python python3], or verify packet-dir');
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!allowed.has(args[i]) || args[i] in options || args[i + 1].startsWith('--')) throw new Error('Invalid or duplicate option');
    options[args[i]] = args[i + 1];
  }
  if (['--edition', '--producer', '--producer-sha256', '--out'].some(key => !options[key])) throw new Error('Missing required option');
  return preparePacket({ editionPath: options['--edition'], producerPath: options['--producer'], producerDigest: options['--producer-sha256'], outputDir: options['--out'], python: options['--python'] || 'python' });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { process.stdout.write(json(main(process.argv.slice(2)))); }
  catch (error) {
    // OS/JSON failures can contain private paths or input; return a generic code.
    const safe = error instanceof Error && !('code' in error) ? error.message : 'Packet operation failed; inspect local paths and permissions';
    process.stderr.write(json({ error: safe }));
    process.exitCode = 2;
  }
}
