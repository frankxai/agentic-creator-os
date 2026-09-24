import assert from 'node:assert/strict'
import test from 'node:test'
import { checkReceipt } from './check-receipt.mjs'

const good = {
  schema: 'creator-os.practice-receipt.v1',
  skill: 'run-the-checks',
  finishedAt: '2026-09-24T15:42:08Z',
  outcome: 'pass',
  command: 'node scripts/verify-public-surface.mjs',
  summary: 'Public surface check passed.',
}

test('a complete practice receipt is yes and unsigned', () => {
  const result = checkReceipt(good)
  assert.equal(result.yes, true)
  assert.equal(result.verdict, 'yes')
  assert.equal(result.signed, false)
})

test('a secret or an extra signature claim is no', () => {
  assert.equal(checkReceipt({ ...good, command: 'export API_KEY=sk-live' }).yes, false)
  assert.equal(checkReceipt({ ...good, signed: true }).yes, false)
  assert.equal(checkReceipt({ ...good, skill: 'ship-the-company' }).yes, false)
})
