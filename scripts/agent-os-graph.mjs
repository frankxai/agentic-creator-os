#!/usr/bin/env node
/**
 * ACOS agent-os graph — builds the typed estate graph from agent specs and
 * brand team manifests, and validates it against docs/agent-os/ontology.json.
 *
 * Output is JSONL, one node or edge per line:
 *   {"type":"node","kind":"brand","id":"brand:acme","name":"Acme"}
 *   {"type":"edge","rel":"staffs","from":"brand:acme","to":"agent:general-cmo"}
 * Query it with grep, jq, or SQLite; no graph database required.
 *
 * Usage:
 *   node scripts/agent-os-graph.mjs [--brands <dir>] [--out <graph.jsonl>]
 *
 * --brands points at a folder of brand manifests (*.brand.json, see
 * docs/agent-os/ONTOLOGY.md). Brand manifests are usually private and live
 * outside this repo. Exit 1 on any ontology violation.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
for (const n of ['--brands', '--out']) {
  const i = args.indexOf(n)
  if (i >= 0 && (args[i + 1] === undefined || args[i + 1].startsWith('--'))) { console.error(`✗ ${n} needs a value`); process.exit(2) }
}
const flag = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined)
const BRANDS = flag('--brands')
const OUT = flag('--out')

const ontology = JSON.parse(readFileSync(join(ROOT, 'docs', 'agent-os', 'ontology.json'), 'utf8'))
const nodes = new Map()
const edges = []
const errors = []

const node = (kind, key, props = {}) => {
  const id = `${kind}:${key}`
  if (!ontology.kinds[kind]) errors.push(`unknown kind "${kind}" for ${id}`)
  nodes.set(id, { type: 'node', kind, id, ...(nodes.get(id) || {}), ...props })
  return id
}
const edge = (rel, from, to, props = {}) => edges.push({ type: 'edge', rel, from, to, ...props })

// Core: kernel, role modules, Generals.
const specDir = join(ROOT, 'agent-os', 'specs')
const specs = existsSync(specDir)
  ? readdirSync(specDir).filter((f) => f.endsWith('.agent.json')).map((f) => JSON.parse(readFileSync(join(specDir, f), 'utf8')))
  : []

for (const s of specs) {
  const agent = node('agent', s.id, { name: s.id, model: s.model, memory: s.memory, kindOfAgent: s.kind })
  const role = node('role', s.role, { name: s.role, general: s.kind === 'general' })
  const kernel = node('kernel', basename(s.kernel, '.md'), { path: s.kernel })
  edge('plays', agent, role)
  edge('inherits', agent, kernel)
  for (const m of s.modules) {
    const mod = node('module', basename(m, '.md'), { path: m })
    edge('stacks', agent, mod)
    edge('specialises', mod, role)
  }
  edge('remembers_in', agent, node('memory-scope', `${s.memory}:${s.id}`, { scope: s.memory }))
  if (s.evals) edge('verified_by', agent, node('eval', s.id, { path: s.evals }))
  for (const k of s.knowledge || []) edge('reads', agent, node('knowledge-source', k.id || k.source, { source: k.source }))
  if (s.kind === 'general' && s.role !== 'ceo') edge('reports_to', role, node('role', 'ceo'))
}

// Brand team manifests.
if (BRANDS) {
  if (!existsSync(BRANDS)) errors.push(`--brands folder not found: ${BRANDS}`)
  else for (const f of readdirSync(BRANDS).filter((x) => x.endsWith('.brand.json')).sort()) {
    let b
    try { b = JSON.parse(readFileSync(join(BRANDS, f), 'utf8')) } catch (err) { errors.push(`${f}: invalid JSON (${err.message})`); continue }
    const brand = node('brand', b.id, { name: b.name, status: b.status, door: !!b.door, domain: b.domain })
    if (b.register) edge('speaks_in', brand, node('register', b.register))
    if (b.soul) edge('identified_by', brand, node('soul', `${b.id}`, { path: b.soul }))
    for (const r of b.repos || []) edge('owns', brand, node('repo', r))
    // References must resolve to agents that already exist (a compiled spec or a specialist
    // declared in this manifest); creating them on the fly would hide typos as phantom agents.
    const ref = (id, where) => {
      const full = `agent:${id}`
      if (!nodes.has(full)) errors.push(`${f}: ${where} references unknown agent "${id}"`)
      return full
    }
    for (const [role, focus] of Object.entries(b.generals || {})) edge('staffs', brand, ref(`general-${role}`, `generals.${role}`), { focus })
    for (const a of b.specialists || []) {
      const agent = node('agent', a.id, { name: a.id, role: a.role })
      edge('staffs', brand, agent)
      if (a.role) edge('plays', agent, node('role', a.role, { name: a.role }))
      if (a.repo) edge('lives_in', agent, node('repo', a.repo))
    }
    for (const k of b.authority || []) {
      const ks = node('knowledge-source', `${b.id}/${k}`, { source: k, brand: b.id })
      for (const role of Object.keys(b.generals || {})) edge('reads', `agent:general-${role}`, ks)
    }
    for (const l of b.loops || []) {
      const loop = node('loop', l.id, { cadence: l.cadence, receipt: l.receipt })
      edge('runs', brand, loop)
      if (l.owner) edge('executed_by', loop, ref(l.owner, `loops.${l.id}.owner`))
      for (const g of [].concat(l.gate || [])) edge('gated_by', loop, node('human-gate', g))
    }
  }
}

// Validate every edge against the relation signatures.
for (const e of edges) {
  const sig = ontology.relations[e.rel]
  if (!sig) { errors.push(`unknown relation "${e.rel}"`); continue }
  const from = nodes.get(e.from)
  const to = nodes.get(e.to)
  if (!from) errors.push(`dangling edge ${e.rel}: ${e.from} does not exist`)
  if (!to) errors.push(`dangling edge ${e.rel}: ${e.to} does not exist`)
  if (from && from.kind !== sig[0]) errors.push(`${e.rel}: ${e.from} is a ${from.kind}, expected ${sig[0]}`)
  if (to && to.kind !== sig[1]) errors.push(`${e.rel}: ${e.to} is a ${to.kind}, expected ${sig[1]}`)
}

const lines = [...nodes.values(), ...edges].map((x) => JSON.stringify(x))
if (OUT) writeFileSync(OUT, lines.join('\n') + '\n')

const count = (xs, key) => xs.reduce((m, x) => ((m[x[key]] = (m[x[key]] || 0) + 1), m), {})
console.log(`agent-os-graph: ${nodes.size} nodes, ${edges.length} edges`)
console.log('  nodes:', JSON.stringify(count([...nodes.values()], 'kind')))
console.log('  edges:', JSON.stringify(count(edges, 'rel')))
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`)
  process.exit(1)
}
