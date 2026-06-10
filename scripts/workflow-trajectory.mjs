#!/usr/bin/env node
// Trajectory memory for workflows — write/read run metadata so workflows learn across invocations.
// Pattern from Karpathy AutoResearch + IBM Research arxiv 2603.10600.
// Workflows call `recall` at start to inject prior context; `record` at end to persist outcome.

import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const TRAJ_PATH = join(ROOT, 'data', 'workflow-trajectories.jsonl')

async function ensureFile() {
  await mkdir(dirname(TRAJ_PATH), { recursive: true })
  if (!existsSync(TRAJ_PATH)) await writeFile(TRAJ_PATH, '')
}

async function readAll() {
  await ensureFile()
  const raw = await readFile(TRAJ_PATH, 'utf8')
  return raw.split('\n').filter(Boolean).map(line => {
    try { return JSON.parse(line) } catch { return null }
  }).filter(Boolean)
}

async function cmdRecall(args) {
  const params = parseArgs(args)
  if (!params.workflow) {
    console.error('Usage: workflow-trajectory.mjs recall --workflow X [--limit 3]')
    process.exit(2)
  }
  const limit = parseInt(params.limit || '3', 10)
  const all = await readAll()
  const matches = all
    .filter(t => t.workflow === params.workflow)
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
    .slice(0, limit)
  if (!matches.length) {
    console.log(JSON.stringify({ priorRuns: [], summary: 'No prior runs of this workflow.' }))
    return
  }
  const summary = matches.map((t, i) => {
    const status = t.outcome === 'success' ? '✓' : t.outcome === 'failed' ? '✗' : '⚠'
    return `${i + 1}. ${status} ${t.completedAt?.slice(0, 10)} · ${t.summary || 'no summary'}` +
      (t.tokens ? ` · ${Math.round(t.tokens / 1000)}k tok` : '') +
      (t.findings ? ` · ${t.findings} findings` : '') +
      (t.notes ? `\n   NOTE: ${t.notes}` : '')
  }).join('\n')
  console.log(JSON.stringify({
    priorRuns: matches,
    summary,
    lessonsLearned: matches.flatMap(t => t.lessonsLearned || []).slice(0, 5),
  }))
}

async function cmdRecord(args) {
  const params = parseArgs(args)
  const required = ['workflow', 'runId', 'outcome']
  for (const r of required) {
    if (!params[r]) {
      console.error(`Missing required: --${r}`)
      process.exit(2)
    }
  }
  const record = {
    workflow: params.workflow,
    runId: params.runId,
    completedAt: params.completedAt || new Date().toISOString(),
    outcome: params.outcome, // success | failed | warned | partial
    summary: params.summary || '',
    tokens: params.tokens ? parseInt(params.tokens, 10) : null,
    agentCount: params.agentCount ? parseInt(params.agentCount, 10) : null,
    durationMs: params.durationMs ? parseInt(params.durationMs, 10) : null,
    findings: params.findings ? parseInt(params.findings, 10) : null,
    notes: params.notes || null,
    lessonsLearned: params.lessonsLearned ? params.lessonsLearned.split('|').map(s => s.trim()) : [],
  }
  await appendFile(TRAJ_PATH, JSON.stringify(record) + '\n')
  console.log(JSON.stringify({ recorded: true, ...record }))
}

async function cmdStats(args) {
  const all = await readAll()
  const byWorkflow = {}
  for (const t of all) {
    byWorkflow[t.workflow] = byWorkflow[t.workflow] || { runs: 0, success: 0, failed: 0, warned: 0, totalTokens: 0 }
    byWorkflow[t.workflow].runs++
    byWorkflow[t.workflow][t.outcome] = (byWorkflow[t.workflow][t.outcome] || 0) + 1
    if (t.tokens) byWorkflow[t.workflow].totalTokens += t.tokens
  }
  console.log('\nWorkflow trajectory stats:\n')
  console.log('| Workflow | Runs | ✓ | ✗ | ⚠ | Total tokens | Success rate |')
  console.log('|---|---|---|---|---|---|---|')
  for (const [wf, s] of Object.entries(byWorkflow).sort()) {
    const rate = s.runs ? Math.round((s.success / s.runs) * 100) : 0
    console.log(`| ${wf} | ${s.runs} | ${s.success} | ${s.failed} | ${s.warned} | ${Math.round(s.totalTokens / 1000)}k | ${rate}% |`)
  }
  console.log()
}

function parseArgs(args) {
  const out = {}
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true
      out[key] = val
    }
  }
  return out
}

const [, , cmd, ...rest] = process.argv

const handlers = {
  recall: cmdRecall,
  record: cmdRecord,
  stats: cmdStats,
}

if (!cmd || !handlers[cmd]) {
  console.error(`
Workflow Trajectory Memory — every run learns from prior runs

Usage:
  workflow-trajectory.mjs recall --workflow X [--limit 3]
    → returns JSON {priorRuns, summary, lessonsLearned} for injection into workflow system prompt

  workflow-trajectory.mjs record --workflow X --runId Y --outcome <success|failed|warned|partial>
    [--summary "..."] [--tokens N] [--agentCount N] [--durationMs N] [--findings N]
    [--notes "..."] [--lessonsLearned "lesson1|lesson2|..."]

  workflow-trajectory.mjs stats
    → table of run counts + success rates per workflow

Data file: ${TRAJ_PATH}
Pattern source: Karpathy AutoResearch (results.tsv ratchet) + IBM Research arxiv 2603.10600
`)
  process.exit(cmd ? 2 : 0)
}

await handlers[cmd](rest)
