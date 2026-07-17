#!/usr/bin/env node
/**
 * Smoke eval for meta-agent-quality-auditor, per its own spec (## 7. Smoke eval):
 * - Seed two fixture agent files: one passing all 9 checks, one failing every existential
 * - Run audit on the fixture dir
 * - Expected: clean agent scores 9/9 disqualified=false; bad agent scores <=4 disqualified=true
 * - Verify JSON schema matches contract
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { auditDirectory } from '../../../scripts/agent-quality-audit.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const AGENTS_FIXTURE_DIR = path.join(HERE, 'agents')
const REAL_FIXTURES_DIR = path.join(HERE, '..') // tests/fixtures/ — so fixture-clean-agent's own smoke.mjs resolves

let failures = []
function assert(cond, message) {
  if (!cond) failures.push(message)
}

const { results } = auditDirectory(AGENTS_FIXTURE_DIR, REAL_FIXTURES_DIR)

assert(results.length === 2, `expected 2 fixture files audited, got ${results.length}`)

const clean = results.find((r) => r.file === 'clean.md')
const bad = results.find((r) => r.file === 'bad.md')

assert(!!clean, 'clean.md not found in results')
assert(!!bad, 'bad.md not found in results')

if (clean) {
  assert(clean.score === 9, `clean.md expected score 9/9, got ${clean.score}/9 — fails: ${clean.fails.join('; ')}`)
  assert(clean.disqualified === false, `clean.md expected disqualified=false, got true — fails: ${clean.fails.join('; ')}`)
}

if (bad) {
  assert(bad.score <= 4, `bad.md expected score <=4, got ${bad.score}/9`)
  assert(bad.disqualified === true, 'bad.md expected disqualified=true, got false')
  assert(!bad.checks['1'].pass, 'bad.md expected to fail check 1 (frontmatter)')
  assert(!bad.checks['7'].pass, 'bad.md expected to fail check 7 (brand voice)')
  assert(!bad.checks['8'].pass, 'bad.md expected to fail check 8 (Arcanean leak)')
}

// JSON schema shape check — same contract shape main() writes to
// .frankx/machine/agent-quality-audit-<date>.json (spec ## 5. Outputs).
for (const r of results) {
  assert(typeof r.agent === 'string', `${r.file}: agent field missing/not a string`)
  assert(typeof r.score === 'number', `${r.file}: score field missing/not a number`)
  assert(typeof r.disqualified === 'boolean', `${r.file}: disqualified field missing/not a boolean`)
  assert(r.checks && typeof r.checks === 'object', `${r.file}: checks object missing`)
  assert(Array.isArray(r.fails), `${r.file}: fails field missing/not an array`)
}

if (failures.length) {
  console.error(`FAIL — meta-agent-quality-auditor smoke eval (${failures.length} assertion(s) failed)`)
  failures.forEach((f) => console.error(`  - ${f}`))
  process.exit(1)
}

console.log('PASS — meta-agent-quality-auditor smoke eval')
console.log(`  clean.md: ${clean.score}/9, disqualified=${clean.disqualified}`)
console.log(`  bad.md:   ${bad.score}/9, disqualified=${bad.disqualified}`)
