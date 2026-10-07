#!/usr/bin/env node
/**
 * ACOS always-on status — what is running unattended, from receipts only.
 *
 * Reads the `alwaysOn` block of a mesh registry and reports each clock:
 *   ci        latest runs of a workflow (via the gh CLI)
 *   pulse     last receipt line of the scheduled estate pulse
 *   observers state of named scheduler jobs (Hermes-style jobs.json)
 *   routines  registry of cloud routines (live state needs a Claude session)
 *   machines  heartbeat age of other machines (from the mesh members)
 *   dispatch  recent mesh-dispatch receipts
 * A clock with no receipt is reported as NOT RUNNING. Nothing is inferred.
 *
 * Usage:
 *   node scripts/always-on-status.mjs --mesh <mesh.json> [--json] [--no-gh]
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { loadMesh, measureZone, probeMember, expand, onPath, fileAgeMinutes, runNoShell } from './lib/mesh-core.mjs'

const args = process.argv.slice(2)
const i = args.indexOf('--mesh')
const MESH = i >= 0 ? args[i + 1] : undefined
if (!MESH || MESH.startsWith('--')) { console.error('✗ --mesh <mesh.json> is required'); process.exit(2) }
const JSON_OUT = args.includes('--json')
const NO_GH = args.includes('--no-gh')

const mesh = loadMesh(MESH)
const ao = mesh.alwaysOn || {}
const rows = []
const add = (clock, what, state, evidence) => rows.push({ clock, what, state, evidence })
const days = (minutes) => (minutes / 1440).toFixed(1)
const readJson = (p) => JSON.parse(readFileSync(expand(p), 'utf8'))

// CI workflow runs.
// The registry is owner-edited code, but values still never reach a shell, and are validated first.
const SAFE_REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/
const SAFE_WORKFLOW = /^[A-Za-z0-9_.-]+\.ya?ml$/
if (ao.ci) {
  if (!SAFE_REPO.test(ao.ci.repo || '') || !SAFE_WORKFLOW.test(ao.ci.workflow || '')) add('ci', 'alwaysOn.ci', 'unknown', 'refused: repo or workflow is not a plain owner/name and file name')
  else if (NO_GH || !onPath('gh')) add('ci', `${ao.ci.repo} ${ao.ci.workflow}`, 'unknown', 'gh unavailable')
  else {
    try {
      const runs = JSON.parse(runNoShell(['gh', 'run', 'list', '-R', ao.ci.repo, '-w', ao.ci.workflow, '-L', '3', '--json', 'status,conclusion,createdAt,event,headBranch'],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20000 }))
      if (!runs.length) add('ci', `${ao.ci.repo} ${ao.ci.workflow}`, 'NOT RUNNING', 'no runs recorded')
      else {
        const last = runs[0]
        const scheduled = runs.some((r) => r.event === 'schedule')
        add('ci', `${ao.ci.repo} ${ao.ci.workflow}`, last.conclusion || last.status,
          `${runs.length} recent run(s); last ${last.createdAt} (${last.event} on ${last.headBranch})${scheduled ? '' : '; no scheduled run yet (starts after merge to the default branch)'}`)
      }
    } catch { add('ci', `${ao.ci.repo} ${ao.ci.workflow}`, 'unknown', 'gh run list failed (auth or network)') }
  }
}

// Scheduled pulse receipts.
if (ao.pulse) {
  const file = expand(ao.pulse.receipts)
  if (!existsSync(file)) add('pulse', 'estate pulse', 'NOT RUNNING', 'no receipt file')
  else {
    const lines = readFileSync(file, 'utf8').trim().split(/\r?\n/).filter(Boolean)
    const last = lines.length ? JSON.parse(lines[lines.length - 1]) : null
    if (!last) add('pulse', 'estate pulse', 'NOT RUNNING', 'receipt file empty')
    else {
      const ageDays = (Date.now() - Date.parse(last.ts)) / 86400000
      const stale = ao.pulse.maxAgeDays && ageDays > ao.pulse.maxAgeDays
      const t = last.totals || {}
      add('pulse', 'estate pulse', stale ? 'STALE' : last.status,
        `last ${last.ts} (${ageDays.toFixed(1)} days ago); ${lines.length} receipt(s); average ${t.loadableAverage ?? '?'}, dead ${t.deadSkills ?? '?'}, shadowed ${t.shadowedNames ?? '?'}`)
    }
  }
}

// Scheduler jobs.
if (ao.observers) {
  let jobs = []
  try { jobs = readJson(ao.observers.hermesJobs).jobs || [] } catch { add('observers', ao.observers.hermesJobs, 'unknown', 'jobs registry unreadable') }
  for (const name of ao.observers.names || []) {
    const j = jobs.find((x) => x.name === name)
    if (!j) add('observers', name, 'NOT RUNNING', 'not registered')
    else add('observers', name, j.enabled ? (j.last_status || 'scheduled (no run yet)') : 'disabled',
      `schedule ${j.schedule?.display || j.schedule_display}; last run ${j.last_run_at || 'never'}; next ${j.next_run_at || '?'}`)
  }
}

// Cloud routines (registry only; live state is read with RemoteTrigger from a Claude session).
if (ao.routines) {
  try {
    const reg = readJson(ao.routines.registry)
    for (const r of reg.routines || []) add('routines', r.name, r.enabled ? 'enabled' : 'disabled', `${r.cron} UTC (${r.local}); ${r.repos.join(', ')}; ${r.url}`)
  } catch { add('routines', ao.routines.registry, 'NOT RUNNING', 'registry missing') }
}

// Other machines.
for (const id of ao.machines || []) {
  const m = (mesh.members || []).find((x) => x.id === id)
  if (!m) { add('machines', id, 'unknown', 'not in mesh'); continue }
  const h = await probeMember(m)
  add('machines', id, h.ok ? 'fresh' : 'STALE', h.detail.join('; '))
}

// Recent dispatches.
const dir = expand(mesh.receiptsDir || '')
if (mesh.receiptsDir && existsSync(dir)) {
  const recent = readdirSync(dir).filter((f) => f.endsWith('.json')).sort().slice(-5)
    .map((f) => { try { return JSON.parse(readFileSync(join(dir, f), 'utf8')) } catch { return null } }).filter(Boolean)
  for (const r of recent) {
    const out = r.out && existsSync(r.out) ? `; output ${days(fileAgeMinutes(r.out))} days old` : ''
    add('dispatch', `${r.member} ${r.ts}`, r.status, `${r.reason || ''}${out}`.replace(/^; /, ''))
  }
}

const zone = measureZone(mesh)
const report = { generated: new Date().toISOString(), machine: mesh.machine, zone: zone.zone, ramFreeGiB: zone.ramFreeGiB, clocks: rows }
if (JSON_OUT) console.log(JSON.stringify(report, null, 2))
else {
  console.log(`Always-on status — ${mesh.machine || 'this machine'} zone ${zone.zone.toUpperCase()} (${zone.ramFreeGiB} GiB free) — ${report.generated}`)
  for (const r of rows) console.log(`${String(r.clock).padEnd(10)} ${String(r.state).padEnd(22)} ${r.what}\n${' '.repeat(11)}${r.evidence}`)
  const dark = rows.filter((r) => /NOT RUNNING|STALE/.test(r.state))
  const off = rows.filter((r) => r.state === 'disabled')
  const parts = []
  if (dark.length) parts.push(`${dark.length} clock(s) not running or stale`)
  if (off.length) parts.push(`${off.length} disabled (owner's switch)`)
  console.log(parts.length ? `\n${parts.join('; ')}.` : '\nEvery declared clock has a fresh receipt.')
}
