import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { preparePacket, verifyPacket } from '../tools/gencreator-social/packet.mjs';

// Protocol stub for the adapter tests. Real GenCreator semantic checks are a
// separately recorded integration run; this fixture cannot establish them.
const engine = `import sys,json,hashlib,time
e=json.load(open(sys.argv[2],encoding='utf-8'))
if e['creator']=='reject':
 print('PRIVATE INPUT',file=sys.stderr);sys.exit(2)
if e['creator']=='timeout':time.sleep(10)
def digest(s):return 'sha256:'+hashlib.sha256(s.encode('utf-8')).hexdigest()
r={'schema':'gencreator.local-review.v1','sourceDigest':digest(e['source']['text']),'artifacts':[{'id':a['id'],'digest':digest(a['content']),'evidenceSpans':len(a['evidence'])} for a in e['artifacts']],'state':'draft','gaps':['exact_revision_confirmation_missing'],'authority':'supplied_content_confirmation_only','semanticReview':'required_separately','identityVerified':False,'published':False,'externalWrites':False}
if e['creator']=='mismatch':r['sourceDigest']=digest('wrong source')
if e['creator']=='publish':r['published']=True
print(json.dumps(r))
`;
const hash = value => createHash('sha256').update(value).digest('hex');
function fixture(t, creator = 'Example creator') {
  const root = mkdtempSync(join(tmpdir(), 'acos-social-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = 'Keep the source.\r\nA creator can edit café scenes. 🎵';
  const edition = { schema: 'gencreator.local-edition.v1', creator, audience: 'Independent creators', source: { label: 'Owned note', text: source, rights: 'owned' }, artifacts: [{ id: 'post-1', channel: 'linkedin', title: 'Keep your source', content: 'Keep the source.\nEdit the draft in your own voice.', evidence: [{ start: 0, end: 16, quote: 'Keep the source.' }] }], confirmations: [] };
  const producerPath = join(root, 'edition.py');
  const editionPath = join(root, 'input.json');
  writeFileSync(producerPath, engine);
  writeFileSync(editionPath, JSON.stringify(edition, null, 2) + '\r\n');
  return { root, edition, options: { producerPath, producerDigest: hash(engine), editionPath, outputDir: join(root, 'packet') } };
}

test('exports exact input bytes, Unicode source and editable copy without publication', t => {
  const { options, edition } = fixture(t);
  const receipt = preparePacket(options);
  assert.equal(receipt.state, 'draft');
  assert.equal(receipt.published, false);
  assert.equal(receipt.identityVerified, false);
  assert.equal(readFileSync(join(options.outputDir, 'source.txt'), 'utf8'), edition.source.text);
  assert.deepEqual(readFileSync(join(options.outputDir, 'edition.json')), readFileSync(options.editionPath));
  assert.match(readFileSync(join(options.outputDir, 'content.md'), 'utf8'), /Edit the draft in your own voice/);
  assert.deepEqual(verifyPacket(options.outputDir), receipt);
});

test('refuses an unpinned or changed producer before creating output', t => {
  const { options } = fixture(t);
  assert.throws(() => preparePacket({ ...options, producerDigest: '0'.repeat(64) }), /Producer digest/);
  assert.equal(existsSync(options.outputDir), false);
});

test('preserves an interrupted packet and supports retry into a fresh directory', t => {
  const { options } = fixture(t);
  preparePacket(options);
  const original = readFileSync(join(options.outputDir, 'content.md'));
  rmSync(join(options.outputDir, 'receipt.json'));
  assert.throws(() => verifyPacket(options.outputDir));
  assert.throws(() => preparePacket(options), /already exists/);
  assert.deepEqual(readFileSync(join(options.outputDir, 'content.md')), original);
  const retry = { ...options, outputDir: join(options.outputDir, '..', 'retry') };
  preparePacket(retry);
  assert.equal(verifyPacket(retry.outputDir).published, false);
});

test('does not echo private engine errors or create an output on rejection', t => {
  const { options } = fixture(t, 'reject');
  assert.throws(() => preparePacket(options), error => !error.message.includes('PRIVATE') && /review failed/.test(error.message));
  assert.equal(existsSync(options.outputDir), false);
});

for (const creator of ['mismatch', 'publish']) {
  test(`rejects a mismatched or publishing engine response: ${creator}`, t => {
    const { options } = fixture(t, creator);
    assert.throws(() => preparePacket(options), /review response/);
    assert.equal(existsSync(options.outputDir), false);
  });
}

test('detects edited copy and unexpected files', t => {
  const { options } = fixture(t);
  preparePacket(options);
  writeFileSync(join(options.outputDir, 'content.md'), 'Changed');
  assert.throws(() => verifyPacket(options.outputDir), /integrity/);
  const retry = { ...options, outputDir: join(options.outputDir, '..', 'retry') };
  preparePacket(retry);
  writeFileSync(join(retry.outputDir, 'extra.txt'), 'Unexpected');
  assert.throws(() => verifyPacket(retry.outputDir), /file set/);
});

test('bounds reviewer execution and leaves no packet after timeout', t => {
  const { options } = fixture(t, 'timeout');
  assert.throws(() => preparePacket({ ...options, timeoutMs: 100 }), /review failed/);
  assert.equal(existsSync(options.outputDir), false);
});

test('refuses malformed UTF-8 before creating a packet', t => {
  const { options } = fixture(t);
  writeFileSync(options.editionPath, Buffer.from([0xff, 0xfe]));
  assert.throws(() => preparePacket(options), /Invalid UTF-8 JSON/);
  assert.equal(existsSync(options.outputDir), false);
});

test('refuses linked input and linked packet entries', t => {
  const { root, options } = fixture(t);
  const linked = join(root, 'linked.json');
  try { symlinkSync(options.editionPath, linked); }
  catch (error) {
    if (process.platform === 'win32' && error.code === 'EPERM') return t.skip('Windows symlink privilege unavailable');
    throw error;
  }
  assert.throws(() => preparePacket({ ...options, editionPath: linked }), /regular file/);
  preparePacket(options);
  rmSync(join(options.outputDir, 'source.txt'));
  symlinkSync(options.editionPath, join(options.outputDir, 'source.txt'));
  assert.throws(() => verifyPacket(options.outputDir), /regular file/);
});
