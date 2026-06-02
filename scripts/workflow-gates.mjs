#!/usr/bin/env node
// Human-in-the-loop gate substrate for workflows.
// CLI: list / list --pending / check / create / approve / reject
// Workflows invoke `check` via Bash agent; operators use approve/reject.

import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const GATES_PATH = join(ROOT, 'data', 'workflow-gates.jsonl')

async function ensureFile() {
  await mkdir(dirname(GATES_PATH), { recursive: true })
  if (!existsSync(GATES_PATH)) await writeFile(GATES_PATH, '')
}

async function readGates() {
  await ensureFile()
  const raw = await readFile(GATES_PATH, 'utf8')
  return raw.split('\n').filter(Boolean).map((line, i) => {
    try { return JSON.parse(line) } catch { return { _parseError: true, line: i + 1 } }
  })
}

function genGateId() {
  // Deterministic-ish ID; CronCreate / workflow runtime forbids Math.random in workflow scripts
  // but this is the CLI, so it's fine
  return 'gate_' + Math.random().toString(36).slice(2, 10)
}

async function cmdList(args) {
  const gates = await readGates()
  const pendingOnly = args.includes('--pending')
  const filtered = pendingOnly ? gates.filter(g => g.status === 'pending') : gates
  if (!filtered.length) {
    console.log(pendingOnly ? 'No pending gates.' : 'No gates yet.')
    return
  }
  console.log(`\n${filtered.length} ${pendingOnly ? 'pending ' : ''}gate(s):\n`)
  for (const g of filtered) {
    const badge = g.status === 'pending' ? '○' : g.status === 'approved' ? '✓' : '✗'
    console.log(`${badge} ${g.gateId} · ${g.workflow}/${g.step} · ${g.title || '(no title)'}`)
    if (g.previewPath) console.log(`  preview: ${g.previewPath}`)
    if (g.status !== 'pending') console.log(`  decided: ${g.decidedAt} by ${g.decidedBy || 'unknown'}`)
    if (g.notes) console.log(`  notes: ${g.notes}`)
    console.log()
  }
}

async function cmdCheck(args) {
  const [runId, step] = args
  if (!runId || !step) {
    console.error('Usage: workflow-gates.mjs check <runId> <step>')
    process.exit(2)
  }
  const gates = await readGates()
  const gate = gates.find(g => g.runId === runId && g.step === step)
  if (!gate) {
    console.log(JSON.stringify({ found: false }))
    return
  }
  console.log(JSON.stringify({ found: true, ...gate }))
}

async function cmdCreate(args) {
  const params = parseArgs(args)
  const required = ['runId', 'workflow', 'step', 'title']
  for (const r of required) {
    if (!params[r]) {
      console.error(`Missing required: --${r}`)
      process.exit(2)
    }
  }
  const gateId = genGateId()
  // Use a passed-in timestamp from the caller (workflows can't generate Date.now)
  const createdAt = params.createdAt || new Date().toISOString()
  const gate = {
    gateId,
    runId: params.runId,
    workflow: params.workflow,
    step: params.step,
    title: params.title,
    summary: params.summary || '',
    previewPath: params.previewPath || null,
    approvalUrl: `/admin/workflow-gates/${gateId}`,
    status: 'pending',
    createdAt,
    decidedAt: null,
    decidedBy: null,
    decision: null,
    notes: null,
  }
  await appendFile(GATES_PATH, JSON.stringify(gate) + '\n')
  console.log(JSON.stringify({ created: true, gateId, ...gate }))
}

async function cmdApprove(args) {
  await flipStatus(args, 'approved')
}

async function cmdReject(args) {
  await flipStatus(args, 'rejected')
}

async function flipStatus(args, status) {
  const [gateId, ...rest] = args
  if (!gateId) {
    console.error(`Usage: workflow-gates.mjs ${status === 'approved' ? 'approve' : 'reject'} <gateId> [--notes "..."]`)
    process.exit(2)
  }
  const params = parseArgs(rest)
  const gates = await readGates()
  const idx = gates.findIndex(g => g.gateId === gateId)
  if (idx === -1) {
    console.error(`Gate not found: ${gateId}`)
    process.exit(1)
  }
  if (gates[idx].status !== 'pending') {
    console.error(`Gate ${gateId} already decided: ${gates[idx].status}`)
    process.exit(1)
  }
  gates[idx].status = status
  gates[idx].decision = status
  gates[idx].decidedAt = new Date().toISOString()
  gates[idx].decidedBy = params.by || process.env.USER || process.env.USERNAME || 'operator'
  gates[idx].notes = params.notes || null
  // Rewrite full file (small, so OK)
  const out = gates.map(g => JSON.stringify(g)).join('\n') + '\n'
  await writeFile(GATES_PATH, out)
  console.log(JSON.stringify({ updated: true, gateId, status, gate: gates[idx] }))
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
  list: cmdList,
  check: cmdCheck,
  create: cmdCreate,
  approve: cmdApprove,
  reject: cmdReject,
}

if (!cmd || !handlers[cmd]) {
  console.error(`
Workflow Gates CLI — human-in-the-loop substrate

Usage:
  workflow-gates.mjs list [--pending]
  workflow-gates.mjs check <runId> <step>
  workflow-gates.mjs create --runId X --workflow Y --step Z --title "..." [--summary "..."] [--previewPath path] [--createdAt iso]
  workflow-gates.mjs approve <gateId> [--notes "..."] [--by user]
  workflow-gates.mjs reject <gateId> [--notes "..."] [--by user]

Data file: ${GATES_PATH}
`)
  process.exit(cmd ? 2 : 0)
}

await handlers[cmd](rest)
