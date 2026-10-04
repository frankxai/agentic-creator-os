#!/usr/bin/env node
/**
 * ACOS org import — turns a domain org chart (schema starlight.domainQueens.v1:
 * one chief queen, domain queens, and domain generals with their swarms) into
 * Domain Queen agent specs for an instance.
 *
 * Each Domain General is a functional General plus domain context, so no agent
 * is generated per Domain General: the Queen's spec lists its Generals and the
 * functional General each one maps to, and the Queen delegates with that
 * context. The chief queen maps to the CEO General.
 *
 * Usage:
 *   node scripts/org-import.mjs --org <domain-queens.json> --instance <name> [--check]
 *
 * Writes instances/<name>/agent-os/specs/queen-<domain>.agent.json. Unknown
 * General titles fail the import (fail closed) until mapped in TITLE_TO_ROLE.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const flag = (n) => {
  const i = args.indexOf(n)
  if (i < 0) return undefined
  const v = args[i + 1]
  if (v === undefined || v.startsWith('--')) { console.error(`✗ ${n} needs a value`); process.exit(2) }
  return v
}
const ORG = flag('--org')
const INSTANCE = flag('--instance')
const CHECK = args.includes('--check')
if (!ORG || !INSTANCE) { console.error('✗ usage: org-import.mjs --org <domain-queens.json> --instance <name> [--check]'); process.exit(2) }

// Functional General each Domain General title maps to. Extend deliberately.
const TITLE_TO_ROLE = {
  'Revenue General': 'cfo',
  'Revenue Streams General': 'cfo',
  'Income Streams General': 'cfo',
  'Product General': 'cpo',
  'Product OS General': 'cpo',
  'Growth General': 'cmo',
  'Idea & Content General': 'cmo',
  'Creative General': 'cco',
  'World Engine General': 'cto',
  'Research General': 'caio',
  'Knowledge General': 'caio',
  'Control Plane General': 'coo',
  'Safety & Integrity General': 'cto',
}

const org = JSON.parse(readFileSync(ORG, 'utf8'))
if (org.schema !== 'starlight.domainQueens.v1') { console.error(`✗ unsupported org schema ${org.schema}`); process.exit(2) }

const coreRoles = new Set(readdirSync(join(ROOT, 'agent-os', 'specs')).filter((f) => f.startsWith('general-')).map((f) => f.slice(8, -11)))
const outDir = join(ROOT, 'instances', INSTANCE, 'agent-os', 'specs')
let errors = 0
let stale = 0
const specs = []

for (const d of org.domains || []) {
  const q = d.queen
  const generals = (q.generals || []).map((g) => {
    const role = TITLE_TO_ROLE[g.title]
    if (!role) { console.error(`✗ ${q.id}: no functional role mapped for "${g.title}" (add it to TITLE_TO_ROLE)`); errors++ }
    else if (!coreRoles.has(role)) { console.error(`✗ ${q.id}: "${g.title}" maps to ${role}, but agent-os/specs/general-${role}.agent.json does not exist`); errors++ }
    return { title: g.title, sourceId: g.id, role, agent: `general-${role}`, swarms: g.swarms || [] }
  })
  const agents = [...new Set(generals.map((g) => g.agent).filter(Boolean)), 'general-ceo']
  const titles = generals.map((g) => g.title.replace(/ General$/, '').toLowerCase()).join(', ')
  specs.push({
    id: `queen-${d.domain}`,
    version: '1.0.0',
    kind: 'queen',
    role: 'queen',
    description: `${q.title} — owns the ${d.domain} domain and staffs its Generals (${titles}). Use when work belongs to the ${d.domain} domain and needs routing to the right General, a domain pulse, or acceptance of a General's result. Escalates cross-domain work to the CEO General.`,
    model: 'opus',
    tools: ['Read', 'Grep', 'Glob', 'Skill', `Agent(${agents.join(', ')})`],
    memory: 'user',
    color: 'orange',
    kernel: 'agent-os/kernel/expertise-kernel.md',
    modules: ['agent-os/roles/queen.md'],
    requiredReading: ['CREATOR.md', 'AGENTS.md'],
    knowledge: [],
    org: { domain: d.domain, sourceId: q.id, source: 'starlight-swarm config/domain-queens.json', generals },
    evals: 'evals/agents/queen-domain',
  })
}

if (errors) process.exit(1)
if (!CHECK) mkdirSync(outDir, { recursive: true })
for (const s of specs) {
  const file = join(outDir, `${s.id}.agent.json`)
  const next = JSON.stringify(s, null, 2) + '\n'
  const prev = existsSync(file) ? readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null
  if (prev === next) continue
  if (CHECK) { console.error(`✗ stale: ${file.slice(ROOT.length + 1)}`); stale++; continue }
  writeFileSync(file, next)
}
if (CHECK && stale) process.exit(1)
console.log(`org-import: ${specs.length} Domain Queen spec(s) from ${org.domains.length} domain(s); chief queen ${org.chiefQueen?.id || '(none)'} → general-ceo`)
