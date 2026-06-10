#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const WORKFLOWS_DIR = join(ROOT, '.claude', 'workflows')
const AGENTS_DIR = join(ROOT, '.claude', 'agents')

const REQUIRED_META_FIELDS = ['name', 'description', 'phases', 'acos']
const REQUIRED_ACOS_FIELDS = ['tier', 'cadence', 'portable', 'estimatedCost']

async function parseMeta(path) {
  const src = await readFile(path, 'utf8')
  const marker = 'export const meta = '
  const startIdx = src.indexOf(marker)
  if (startIdx === -1) return { _error: 'no meta block found', src }
  let depth = 0, i = startIdx + marker.length, started = false
  for (; i < src.length; i++) {
    if (src[i] === '{') { depth++; started = true }
    else if (src[i] === '}' && started) { depth--; if (depth === 0) { i++; break } }
  }
  const metaSrc = src.slice(startIdx + marker.length, i)
  try {
    return { meta: new Function(`return (${metaSrc})`)(), src }
  } catch (e) {
    return { _error: `meta parse: ${e.message}`, src }
  }
}

function extractAgentTypes(src) {
  const re = /agentType:\s*['"]([^'"]+)['"]/g
  const found = new Set()
  let m
  while ((m = re.exec(src)) !== null) found.add(m[1])
  return [...found]
}

function extractWorkflowCalls(src) {
  const re = /workflow\(\s*['"]([^'"]+)['"]/g
  const found = new Set()
  let m
  while ((m = re.exec(src)) !== null) found.add(m[1])
  return [...found]
}

function extractAgentCalls(src) {
  const re = /agent\s*\(/g
  let count = 0
  while (re.exec(src) !== null) count++
  return count
}

function validateMeta(meta) {
  const issues = []
  for (const f of REQUIRED_META_FIELDS) {
    if (meta[f] === undefined) issues.push(`missing meta.${f}`)
  }
  if (meta.acos) {
    for (const f of REQUIRED_ACOS_FIELDS) {
      if (meta.acos[f] === undefined) issues.push(`missing meta.acos.${f}`)
    }
    if (meta.acos.estimatedCost && (typeof meta.acos.estimatedCost.min !== 'number' || typeof meta.acos.estimatedCost.max !== 'number')) {
      issues.push('meta.acos.estimatedCost must have numeric min/max')
    }
  }
  if (meta.name && meta.name !== basename(meta._file ?? '', '.js')) {
    if (meta._file && meta.name !== basename(meta._file, '.js')) {
      issues.push(`meta.name "${meta.name}" should match filename ${meta._file}`)
    }
  }
  return issues
}

const workflowFiles = (await readdir(WORKFLOWS_DIR)).filter(f => f.endsWith('.js')).sort()
const agentFiles = new Set()

async function collectAgents(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = join(dir, e.name)
      if (e.isDirectory()) await collectAgents(full)
      else if (e.isFile() && e.name.endsWith('.md')) agentFiles.add(basename(e.name, '.md'))
    }
  } catch {}
}

await collectAgents(AGENTS_DIR)
await collectAgents(join(process.env.HOME ?? process.env.USERPROFILE ?? '', '.claude', 'agents'))

const workflowNames = new Set()
const results = []

for (const f of workflowFiles) {
  const parsed = await parseMeta(join(WORKFLOWS_DIR, f))
  if (parsed._error) {
    results.push({ file: f, status: 'parse-error', issues: [parsed._error] })
    continue
  }
  parsed.meta._file = f
  workflowNames.add(parsed.meta.name)
  const metaIssues = validateMeta(parsed.meta)
  const agentTypes = extractAgentTypes(parsed.src)
  const workflowCalls = extractWorkflowCalls(parsed.src)
  const agentCallCount = extractAgentCalls(parsed.src)
  results.push({
    file: f,
    name: parsed.meta.name,
    status: metaIssues.length ? 'meta-issues' : 'ok-meta',
    metaIssues,
    agentTypes,
    workflowCalls,
    agentCallCount,
    portable: parsed.meta.acos?.portable,
  })
}

// Cross-reference checks
for (const r of results) {
  r.crossRefIssues = []
  for (const wf of (r.workflowCalls ?? [])) {
    if (!workflowNames.has(wf)) {
      r.crossRefIssues.push(`composes unknown workflow: "${wf}"`)
    }
  }
  for (const at of (r.agentTypes ?? [])) {
    const slug = at.toLowerCase().replace(/\s+/g, '-')
    if (agentFiles.size > 0 && !agentFiles.has(at) && !agentFiles.has(slug)) {
      r.crossRefIssues.push(`agentType "${at}" not found in .claude/agents/ (looked for ${at}.md and ${slug}.md)`)
    }
  }
  if (!r.metaIssues?.length && !r.crossRefIssues.length) r.status = 'ok'
  else if (r.crossRefIssues.length) r.status = 'cross-ref-issues'
}

// Portability check: portable workflows should only compose portable workflows
const portableNames = new Set(results.filter(r => r.portable).map(r => r.name))
for (const r of results) {
  if (r.portable) {
    for (const wf of (r.workflowCalls ?? [])) {
      if (workflowNames.has(wf) && !portableNames.has(wf)) {
        r.crossRefIssues.push(`portable workflow composes non-portable: "${wf}"`)
        if (r.status === 'ok') r.status = 'cross-ref-issues'
      }
    }
  }
}

// Report
const mode = process.argv[2] ?? 'human'

if (mode === 'json') {
  console.log(JSON.stringify(results, null, 2))
} else {
  const okCount = results.filter(r => r.status === 'ok').length
  const issueCount = results.length - okCount
  console.log(`\nWorkflow validation: ${okCount}/${results.length} ok · ${issueCount} with issues\n`)
  for (const r of results) {
    const badge = r.status === 'ok' ? '✓' : '✗'
    console.log(`${badge} ${r.file} (${r.agentCallCount ?? 0} agent calls · ${(r.agentTypes ?? []).length} typed · ${(r.workflowCalls ?? []).length} composed)`)
    for (const i of (r.metaIssues ?? [])) console.log(`    META: ${i}`)
    for (const i of (r.crossRefIssues ?? [])) console.log(`    XREF: ${i}`)
  }
  console.log('')
  if (issueCount > 0) process.exit(1)
}
