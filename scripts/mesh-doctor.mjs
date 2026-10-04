#!/usr/bin/env node
/**
 * ACOS mesh doctor — tells a router how much work this machine may take and
 * where the rest can go.
 *
 * Reads a mesh registry (harnesses, model CLIs, machines, memory, CI, cloud
 * routines; see docs/agent-os/MESH.md), measures this machine's zone from free
 * memory and disk, probes each member cheaply, and prints the rungs available
 * locally plus the reachable offload targets with their dispatch templates.
 *
 * Probes are in-process by default (PATH lookup, TCP connect, file age), so the
 * doctor itself costs almost nothing on a constrained machine. `--deep` adds
 * the subprocess probes a member declares (for example `gh auth status`).
 *
 * Usage:
 *   node scripts/mesh-doctor.mjs --mesh <mesh.json> [--json] [--deep]
 *
 * Exit 0 always unless the registry is invalid (exit 2): a red zone is a
 * routing fact, not an error.
 */
import { readFileSync, statSync, statfsSync, existsSync } from 'node:fs'
import { freemem, totalmem, homedir, platform } from 'node:os'
import { join, delimiter } from 'node:path'
import { connect } from 'node:net'
import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)
const flag = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined)
const MESH = flag('--mesh')
const JSON_OUT = args.includes('--json')
const DEEP = args.includes('--deep')
if (!MESH || MESH.startsWith('--')) { console.error('✗ --mesh <mesh.json> is required'); process.exit(2) }

const expand = (p) => p.replace(/^~(?=$|[\\/])/, homedir())
let mesh
try { mesh = JSON.parse(readFileSync(expand(MESH), 'utf8')) } catch (err) { console.error(`✗ cannot read mesh: ${err.message}`); process.exit(2) }

const KINDS = new Set(['harness', 'model-cli', 'router', 'machine', 'memory', 'ci', 'cloud', 'scheduler'])
for (const m of mesh.members || []) {
  if (!m.id || !KINDS.has(m.kind)) { console.error(`✗ member ${JSON.stringify(m.id)} needs an id and a kind in ${[...KINDS].join(', ')}`); process.exit(2) }
}

// ---- Zone: free memory and disk against the registry's thresholds ----

const GiB = 1024 ** 3
const ramFree = freemem() / GiB
let diskFree = null
try {
  const s = statfsSync(expand(mesh.zone?.diskPath || (platform() === 'win32' ? 'C:\\' : '/')))
  diskFree = (s.bavail * s.bsize) / GiB
} catch {}
const z = mesh.zone || {}
const green = z.green || { ramGiB: 6, diskGiB: 80 }
const yellow = z.yellow || { ramGiB: 4, diskGiB: 50 }
const meets = (t) => ramFree >= t.ramGiB && (diskFree === null || diskFree >= t.diskGiB)
const zone = meets(green) ? 'green' : meets(yellow) ? 'yellow' : 'red'
const caps = { green: 4, yellow: 2, red: 0, ...(z.localParallel || {}) }
const RUNGS = [
  ['R0', 'think: answer or reason inline'],
  ['R1', 'one General decides within its mandate'],
  ['R2', 'one bounded worker executes'],
  ['R3', 'parallel swarm of independent workers'],
  ['R4', 'queen: survey, gate, and ship a multi-repo batch'],
  ['R5', 'mesh: another harness, model family, machine, CI, or cloud routine'],
]
// Red keeps one local worker for small, verified edits; parallel work goes to the mesh.
const localRungs = zone === 'red' ? ['R0', 'R1', 'R2', 'R5'] : RUNGS.map(([r]) => r)

// ---- Probes ----

function onPath(bin) {
  const exts = platform() === 'win32' ? (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';') : ['']
  for (const dir of (process.env.PATH || '').split(delimiter)) {
    for (const ext of exts) {
      const p = join(dir, bin + ext.toLowerCase())
      const q = join(dir, bin + ext)
      if (existsSync(p) || existsSync(q)) return existsSync(p) ? p : q
    }
  }
  return null
}

function tcp(hostPort, timeoutMs = 800) {
  const [host, port] = hostPort.split(':')
  return new Promise((resolve) => {
    const sock = connect({ host, port: Number(port) })
    const done = (ok) => { sock.destroy(); resolve(ok) }
    sock.setTimeout(timeoutMs, () => done(false))
    sock.once('connect', () => done(true))
    sock.once('error', () => done(false))
  })
}

function fileAgeMinutes(path) {
  try { return (Date.now() - statSync(expand(path)).mtimeMs) / 60000 } catch { return null }
}

async function probe(m) {
  const p = m.probe || {}
  const out = { id: m.id, kind: m.kind, ok: true, detail: [] }
  if (p.bin) {
    const found = onPath(p.bin)
    out.ok &&= !!found
    out.detail.push(found ? `${p.bin} on PATH` : `${p.bin} not on PATH`)
  }
  if (p.tcp) {
    const up = await tcp(p.tcp)
    out.ok &&= up
    out.detail.push(up ? `${p.tcp} listening` : `${p.tcp} closed`)
  }
  if (p.file) {
    const age = fileAgeMinutes(p.file)
    const fresh = age !== null && (p.maxAgeMinutes === undefined || age <= p.maxAgeMinutes)
    out.ok &&= fresh
    out.detail.push(age === null ? `${p.file} missing` : `${p.file} ${Math.round(age)} min old${fresh ? '' : ` (stale > ${p.maxAgeMinutes})`}`)
  }
  if (DEEP && p.cmd) {
    try {
      execFileSync(p.cmd[0], p.cmd.slice(1), { stdio: 'ignore', timeout: p.timeoutMs || 15000, shell: platform() === 'win32' })
      out.detail.push(`${p.cmd.join(' ')} ok`)
    } catch {
      out.ok = false
      out.detail.push(`${p.cmd.join(' ')} failed`)
    }
  }
  if (!p.bin && !p.tcp && !p.file && !(DEEP && p.cmd)) out.detail.push('no cheap probe declared')
  // A recorded defect keeps a member down until a deep probe proves it fixed.
  if (m.knownIssue && !(DEEP && p.cmd && out.ok)) {
    out.ok = false
    out.detail.push(`known issue: ${m.knownIssue}`)
  }
  return { ...out, role: m.role, cost: m.cost, useWhen: m.useWhen, dispatch: m.dispatch, guard: m.guard }
}

const results = await Promise.all((mesh.members || []).map(probe))
const reachable = results.filter((r) => r.ok)
const report = {
  machine: mesh.machine || 'this machine',
  zone,
  ramFreeGiB: Number(ramFree.toFixed(2)),
  ramTotalGiB: Number((totalmem() / GiB).toFixed(2)),
  diskFreeGiB: diskFree === null ? null : Number(diskFree.toFixed(2)),
  localParallelCap: caps[zone],
  localRungs,
  advice: zone === 'red'
    ? 'Red: think and decide locally; run at most one small local worker; send parallel or heavy work to the mesh.'
    : zone === 'yellow'
      ? `Yellow: up to ${caps.yellow} local workers; prefer the mesh for long or heavy jobs.`
      : `Green: up to ${caps.green} local workers.`,
  members: results,
}

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(`${report.machine}: zone ${zone.toUpperCase()} · RAM ${report.ramFreeGiB}/${report.ramTotalGiB} GiB free · disk ${report.diskFreeGiB ?? '?'} GiB free · local parallel cap ${report.localParallelCap}`)
  console.log(report.advice)
  console.log(`Local rungs: ${localRungs.join(' ')}`)
  console.log('')
  for (const r of results) console.log(`${r.ok ? '✓' : '✗'} ${r.id.padEnd(22)} ${r.kind.padEnd(10)} ${r.detail.join('; ')}`)
  console.log(`\n${reachable.length}/${results.length} mesh members reachable.`)
}
