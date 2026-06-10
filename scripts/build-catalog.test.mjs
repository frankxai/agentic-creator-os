/**
 * Tests for build-catalog.mjs — run with: node --test scripts/build-catalog.test.mjs
 *
 * Generates the catalog to a temp file and asserts the output is well-formed:
 * non-empty node kinds, valid edge references, unique ids, IAM present.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const GENERATOR = join(__dirname, 'build-catalog.mjs')

function generate() {
  const out = join(mkdtempSync(join(tmpdir(), 'acos-catalog-')), 'catalog.json')
  execFileSync('node', [GENERATOR, '--out', out], { stdio: 'pipe' })
  return JSON.parse(readFileSync(out, 'utf8'))
}

const catalog = generate()

test('has the expected top-level shape', () => {
  for (const key of ['generatedAt', 'version', 'counts', 'iam', 'nodes', 'edges']) {
    assert.ok(key in catalog, `missing key: ${key}`)
  }
  assert.ok(Array.isArray(catalog.nodes))
  assert.ok(Array.isArray(catalog.edges))
})

test('produces a substantial, multi-kind catalog', () => {
  assert.ok(catalog.counts.agent > 50, `expected >50 agents, got ${catalog.counts.agent}`)
  assert.ok(catalog.counts.skill > 20, `expected >20 skills, got ${catalog.counts.skill}`)
  assert.ok(catalog.counts.workflow >= 1)
  assert.equal(catalog.counts['iam-profile'], Object.keys(catalog.iam).length)
})

test('node ids are unique', () => {
  const ids = catalog.nodes.map((n) => n.id)
  assert.equal(new Set(ids).size, ids.length, 'duplicate node ids found')
})

test('every node has the required fields', () => {
  for (const n of catalog.nodes) {
    assert.ok(n.id && n.kind && typeof n.name === 'string', `bad node: ${JSON.stringify(n)}`)
    assert.ok(['agent', 'skill', 'command', 'workflow', 'iam-profile'].includes(n.kind))
  }
})

test('every edge references existing nodes (no orphans)', () => {
  const ids = new Set(catalog.nodes.map((n) => n.id))
  for (const e of catalog.edges) {
    assert.ok(ids.has(e.source), `edge source missing: ${e.source}`)
    assert.ok(ids.has(e.target), `edge target missing: ${e.target}`)
    assert.ok(['uses-skill', 'triggers', 'composes', 'governed-by'].includes(e.rel))
  }
})

test('agent names and descriptions are quote-stripped', () => {
  const sample = catalog.nodes.find((n) => n.kind === 'agent')
  assert.ok(sample)
  assert.ok(!sample.name.startsWith('"'), 'agent name still wrapped in quotes')
})
