/**
 * Shared mesh logic for mesh-doctor, mesh-dispatch, and always-on-status:
 * registry loading, machine zone, and cheap member probes. One implementation,
 * so a guard can never mean one thing in the doctor and another in dispatch.
 */
import { readFileSync, statSync, statfsSync, existsSync } from 'node:fs'
import { freemem, totalmem, homedir, platform } from 'node:os'
import { join, delimiter, dirname } from 'node:path'
import { connect } from 'node:net'
import { execFileSync } from 'node:child_process'

export const GiB = 1024 ** 3
export const KINDS = new Set(['harness', 'model-cli', 'router', 'machine', 'memory', 'ci', 'cloud', 'scheduler'])

/** Expand a leading ~ to the home directory. */
export const expand = (p) => (typeof p === 'string' ? p.replace(/^~(?=$|[\\/])/, homedir()) : p)

/** Load and validate a mesh registry; throws with a readable message. */
export function loadMesh(path) {
  const mesh = JSON.parse(readFileSync(expand(path), 'utf8'))
  for (const m of mesh.members || []) {
    if (!m.id || !KINDS.has(m.kind)) throw new Error(`member ${JSON.stringify(m.id)} needs an id and a kind in ${[...KINDS].join(', ')}`)
  }
  return mesh
}

/** Zone from free memory and disk against the registry's thresholds (overridable for tests). */
export function measureZone(mesh, { ramFreeGiB } = {}) {
  const ramFree = ramFreeGiB ?? freemem() / GiB
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
  // One number per zone: concurrent local jobs (subagents or local CLIs). Red allows one small job.
  const caps = { green: 4, yellow: 2, red: 1, ...(z.localParallel || {}) }
  return {
    zone,
    ramFreeGiB: Number(ramFree.toFixed(2)),
    ramTotalGiB: Number((totalmem() / GiB).toFixed(2)),
    diskFreeGiB: diskFree === null ? null : Number(diskFree.toFixed(2)),
    localParallelCap: caps[zone],
    // Red keeps one local worker for small, verified edits; parallel work goes to the mesh.
    localRungs: zone === 'red' ? ['R0', 'R1', 'R2', 'R5'] : ['R0', 'R1', 'R2', 'R3', 'R4', 'R5'],
  }
}

/** Absolute path of an executable on PATH, or null. In-process: no subprocess. */
export function onPath(bin) {
  const exts = platform() === 'win32' ? (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';') : ['']
  for (const dir of (process.env.PATH || '').split(delimiter)) {
    if (!dir) continue
    for (const ext of exts) {
      for (const candidate of [join(dir, bin + ext.toLowerCase()), join(dir, bin + ext)]) {
        if (existsSync(candidate)) return candidate
      }
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

/**
 * JavaScript entry of an npm Windows shim (`<bin>.cmd` ending in `"%dp0%\node_modules\...\x.js" %*`),
 * or null. Spawning that entry with Node, detached, keeps the program's output; a detached cmd.exe loses it.
 */
export function npmShimEntry(cmdPath) {
  try {
    const m = readFileSync(cmdPath, 'utf8').match(/"%dp0%\\([^"]+?\.[cm]?js)"/i)
    if (!m) return null
    const entry = join(dirname(cmdPath), ...m[1].split('\\'))
    return existsSync(entry) ? entry : null
  } catch { return null }
}

/**
 * Resolve argv[0] to something spawnable WITHOUT a shell: a real executable, or an npm shim's
 * JavaScript entry run by this Node. Returns [file, args] or null. Registry text never reaches cmd.exe.
 */
export function resolveNoShell(argv) {
  const exe = onPath(argv[0])
  if (!exe) return null
  if (platform() === 'win32' && /\.(cmd|bat)$/i.test(exe)) {
    const entry = npmShimEntry(exe)
    return entry ? [process.execPath, [entry, ...argv.slice(1)]] : null
  }
  return [exe, argv.slice(1)]
}

/** execFileSync without a shell; throws when the program cannot be resolved safely. */
export function runNoShell(argv, options = {}) {
  const resolved = resolveNoShell(argv)
  if (!resolved) throw new Error(`${argv[0]} cannot be run without a shell`)
  return execFileSync(resolved[0], resolved[1], { ...options, shell: false })
}

export function fileAgeMinutes(path) {
  try { return (Date.now() - statSync(expand(path)).mtimeMs) / 60000 } catch { return null }
}

/** Probe one member. Cheap by default; `deep` adds the member's subprocess probe. */
export async function probeMember(m, { deep = false } = {}) {
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
  if (deep && p.cmd) {
    try {
      runNoShell(p.cmd, { stdio: 'ignore', timeout: p.timeoutMs || 15000 })
      out.detail.push(`${p.cmd.join(' ')} ok`)
    } catch {
      out.ok = false
      out.detail.push(`${p.cmd.join(' ')} failed`)
    }
  }
  if (!p.bin && !p.tcp && !p.file && !(deep && p.cmd)) out.detail.push('no cheap probe declared')
  // A recorded defect keeps a member down until a deep probe proves it fixed.
  if (m.knownIssue && !(deep && p.cmd && out.ok)) {
    out.ok = false
    out.detail.push(`known issue: ${m.knownIssue}`)
  }
  return { ...out, role: m.role, cost: m.cost, useWhen: m.useWhen, dispatch: m.dispatch, guard: m.guard }
}
