#!/usr/bin/env node
/**
 * build-catalog.mjs — Agent Observatory catalog generator
 *
 * Scans the ACOS source of truth and emits a normalized, data-driven
 * catalog.json consumed by BOTH Observatory surfaces:
 *   - the public showcase on frankx.ai (committed copy in public/observatory/)
 *   - the localhost live monitor (tools/observatory/)
 *
 * Sources:
 *   .claude/agents/**.md      → agent nodes (YAML frontmatter: name, description, model, tools)
 *   skills/registry.json      → skill nodes + skill→skill dependency edges
 *   .claude/skill-rules.json  → skill auto-activation triggers (priority, keywords)
 *   .claude/agent-iam.json    → IAM profiles (rendered as the IAM matrix view)
 *   .claude/workflows/*.js     → workflow nodes + workflow→workflow compose edges
 *   commands (union of trigger.commands) → command nodes + skill→command edges
 *
 * Zero runtime dependencies — uses a minimal frontmatter parser so this can
 * run anywhere Node 18+ is present.
 *
 * Usage:
 *   node scripts/build-catalog.mjs [--out <path>]
 * Defaults to writing tools/observatory/public/catalog.json
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, relative, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const argv = process.argv.slice(2)
const outFlag = argv.indexOf('--out')
const OUT = outFlag !== -1 ? argv[outFlag + 1] : join(ROOT, 'tools/observatory/public/catalog.json')

// ---------------------------------------------------------------------------
// Minimal YAML frontmatter parser (handles the two ACOS agent schemas:
// `tools: A, B, C` comma lists and `key:\n  - item` block lists).
// ---------------------------------------------------------------------------
function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return {}
  const out = {}
  let key = null
  for (const line of m[1].split('\n')) {
    if (!line.trim()) continue
    const listItem = line.match(/^\s+-\s+(.*)$/)
    if (listItem && key) {
      if (!Array.isArray(out[key])) out[key] = []
      out[key].push(listItem[1].trim())
      continue
    }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (kv) {
      key = kv[1]
      let val = kv[2].trim()
      // strip matching surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      out[key] = val === '' ? null : val
    }
  }
  return out
}

function toToolList(val) {
  if (!val) return []
  if (Array.isArray(val)) return val
  return String(val).split(',').map((s) => s.trim()).filter(Boolean)
}

function normalizeTier(model) {
  const m = String(model || '').toLowerCase()
  if (m.includes('opus')) return 'opus'
  if (m.includes('haiku')) return 'haiku'
  if (m.includes('sonnet')) return 'sonnet'
  return 'sonnet' // sensible default — builders/writers
}

// ---------------------------------------------------------------------------
// Walk helpers
// ---------------------------------------------------------------------------
function walk(dir, predicate, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, predicate, acc)
    else if (predicate(full)) acc.push(full)
  }
  return acc
}

const nodes = []
const edges = []
const seenEdge = new Set()
function addEdge(source, target, rel) {
  const k = `${source}->${target}:${rel}`
  if (seenEdge.has(k) || source === target) return
  seenEdge.add(k)
  edges.push({ source, target, rel })
}

// ---------------------------------------------------------------------------
// 1. Agents — .claude/agents/**/*.md (skip CLAUDE.md / README.md docs)
// ---------------------------------------------------------------------------
const agentDir = join(ROOT, '.claude/agents')
const agentFiles = walk(agentDir, (f) => f.endsWith('.md') && !/\/(CLAUDE|README)\.md$/i.test(f))
const agentIds = new Set()
for (const file of agentFiles) {
  const raw = readFileSync(file, 'utf8')
  const fm = parseFrontmatter(raw)
  const rel = relative(agentDir, file)
  const sub = rel.includes('/') ? rel.split('/')[0] : 'core'
  const id = `agent:${rel.replace(/\.md$/, '')}`
  const name = fm.name || basename(file, '.md')
  agentIds.add(id)
  nodes.push({
    id,
    kind: 'agent',
    name,
    group: sub, // directory grouping: core, specialized, devops, consensus, ...
    tier: normalizeTier(fm.model),
    status: 'shipped', // a committed .md file is dispatchable
    tools: toToolList(fm.tools),
    mcpServers: toToolList(fm.mcpServers),
    description: (fm.description || '').slice(0, 400),
    file: relative(ROOT, file),
  })
}

// ---------------------------------------------------------------------------
// 2. Skills — skills/registry.json (+ skill-rules.json for triggers/priority)
// ---------------------------------------------------------------------------
const skillNodeId = (name) => `skill:${name}`
const commandIds = new Set()
function ensureCommand(cmd) {
  const name = cmd.replace(/^\//, '')
  const id = `command:${name}`
  if (!commandIds.has(id)) {
    commandIds.add(id)
    nodes.push({ id, kind: 'command', name: `/${name}`, group: 'command', description: '' })
  }
  return id
}

let skillRules = { activation_rules: [] }
try {
  skillRules = JSON.parse(readFileSync(join(ROOT, '.claude/skill-rules.json'), 'utf8'))
} catch {}
const ruleBySkill = new Map()
for (const r of skillRules.activation_rules || []) ruleBySkill.set(r.skill, r)

let registry = { skills: {} }
try {
  registry = JSON.parse(readFileSync(join(ROOT, 'skills/registry.json'), 'utf8'))
} catch {}

// Canonical skill set = every .claude/skills/*/SKILL.md directory, enriched
// with registry.json metadata when the directory name matches a registry key.
const skillsDir = join(ROOT, '.claude/skills')
const skillMdFiles = walk(skillsDir, (f) => /\/SKILL\.md$/i.test(f))
const skillIds = new Set()
const skillNamesSeen = new Set()
function addSkill(name, fromRegistry, fm) {
  const id = skillNodeId(name)
  if (skillNamesSeen.has(name)) return
  skillNamesSeen.add(name)
  skillIds.add(id)
  const s = fromRegistry || {}
  const rule = ruleBySkill.get(name)
  nodes.push({
    id,
    kind: 'skill',
    name,
    group: s.category || 'skill',
    status: 'shipped',
    priority: rule?.priority || null,
    keywords: s.triggers?.keywords || rule?.triggers?.keywords || [],
    description: s.description || fm?.description || '',
    _deps: s.dependencies || [],
    _commands: [...(s.triggers?.commands || []), ...(rule?.triggers?.commands || [])],
  })
}
// 1. directory-backed skills (canonical) — only top-level .claude/skills/<name>/SKILL.md
//    (ignore nested SKILL.md belonging to bundled sub-skills / templates)
for (const file of skillMdFiles) {
  if (dirname(dirname(file)) !== skillsDir) continue
  const name = basename(dirname(file))
  const fm = parseFrontmatter(readFileSync(file, 'utf8'))
  addSkill(name, registry.skills?.[name], fm)
}
// 2. registry-only skills not present as a directory (declared but mirrored elsewhere)
for (const [name, s] of Object.entries(registry.skills || {})) addSkill(name, s)
// skill→skill dependency edges + skill→command trigger edges
for (const n of nodes.filter((x) => x.kind === 'skill')) {
  for (const dep of n._deps || []) {
    if (skillIds.has(skillNodeId(dep))) addEdge(n.id, skillNodeId(dep), 'uses-skill')
  }
  for (const cmd of n._commands || []) addEdge(n.id, ensureCommand(cmd), 'triggers')
  delete n._deps
  delete n._commands
}
// commands referenced only in skill-rules
for (const r of skillRules.activation_rules || []) {
  for (const cmd of r.triggers?.commands || []) {
    if (skillIds.has(skillNodeId(r.skill))) addEdge(skillNodeId(r.skill), ensureCommand(cmd), 'triggers')
  }
}

// ---------------------------------------------------------------------------
// 3. Workflows — .claude/workflows/*.js  (parse the `export const meta = {...}`)
// ---------------------------------------------------------------------------
const wfDir = join(ROOT, '.claude/workflows')
const wfFiles = walk(wfDir, (f) => f.endsWith('.js'))
const wfIds = new Set()
const wfMeta = []
for (const file of wfFiles) {
  const raw = readFileSync(file, 'utf8')
  // Best-effort extraction without importing (avoids side effects).
  const nameM = raw.match(/name:\s*['"]([^'"]+)['"]/)
  const descM = raw.match(/description:\s*['"]([^'"]+)['"]/)
  const tierM = raw.match(/tier:\s*['"]([^'"]+)['"]/)
  const composes = [...raw.matchAll(/composes:\s*\[([^\]]*)\]/g)].map((x) => x[1])
  const composedBy = [...raw.matchAll(/composedBy:\s*\[([^\]]*)\]/g)].map((x) => x[1])
  const name = nameM ? nameM[1] : basename(file, '.js')
  const id = `workflow:${name}`
  wfIds.add(id)
  const parseList = (s) => (s || '').split(',').map((t) => t.replace(/['"\s]/g, '')).filter(Boolean)
  wfMeta.push({ id, composes: parseList(composes[0]), composedBy: parseList(composedBy[0]) })
  nodes.push({
    id,
    kind: 'workflow',
    name,
    group: 'workflow',
    tierLabel: tierM ? tierM[1] : null,
    status: 'shipped',
    description: descM ? descM[1] : '',
    file: relative(ROOT, file),
  })
}
for (const w of wfMeta) {
  for (const c of w.composes) addEdge(w.id, `workflow:${c}`, 'composes')
  for (const c of w.composedBy) addEdge(`workflow:${c}`, w.id, 'composes')
}

// ---------------------------------------------------------------------------
// 4. IAM profiles — kept as a structured block for the matrix view
// ---------------------------------------------------------------------------
let iam = { profiles: {} }
try {
  iam = JSON.parse(readFileSync(join(ROOT, '.claude/agent-iam.json'), 'utf8'))
} catch {}
for (const [name, p] of Object.entries(iam.profiles || {})) {
  nodes.push({
    id: `iam:${name}`,
    kind: 'iam-profile',
    name,
    group: 'iam',
    description: p.description || '',
    allowedTools: p.allowedTools || [],
    deniedTools: p.deniedTools || [],
  })
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------
const counts = nodes.reduce((acc, n) => {
  acc[n.kind] = (acc[n.kind] || 0) + 1
  return acc
}, {})

const catalog = {
  generatedAt: new Date().toISOString(),
  version: '1.0.0',
  source: 'agentic-creator-os',
  counts: { ...counts, edges: edges.length },
  iam: iam.profiles || {},
  nodes,
  edges,
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(catalog, null, 2))
console.log(`✓ catalog written → ${relative(ROOT, OUT)}`)
console.log(`  ${JSON.stringify(counts)} · ${edges.length} edges`)
