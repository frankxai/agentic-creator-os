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
import { loadMesh, measureZone, probeMember } from './lib/mesh-core.mjs'

const args = process.argv.slice(2)
const flag = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined)
const MESH = flag('--mesh')
const JSON_OUT = args.includes('--json')
const DEEP = args.includes('--deep')
if (!MESH || MESH.startsWith('--')) { console.error('✗ --mesh <mesh.json> is required'); process.exit(2) }

let mesh
try { mesh = loadMesh(MESH) } catch (err) { console.error(`✗ cannot read mesh: ${err.message}`); process.exit(2) }

const zone = measureZone(mesh)
const results = await Promise.all((mesh.members || []).map((m) => probeMember(m, { deep: DEEP })))
const advice = zone.zone === 'red'
  ? 'Red: think and decide locally; run at most one small local worker; send parallel or heavy work to the mesh.'
  : zone.zone === 'yellow'
    ? `Yellow: up to ${zone.localParallelCap} local workers; prefer the mesh for long or heavy jobs.`
    : `Green: up to ${zone.localParallelCap} local workers.`
const report = { machine: mesh.machine || 'this machine', ...zone, advice, members: results }

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(`${report.machine}: zone ${zone.zone.toUpperCase()} · RAM ${zone.ramFreeGiB}/${zone.ramTotalGiB} GiB free · disk ${zone.diskFreeGiB ?? '?'} GiB free · local parallel cap ${zone.localParallelCap}`)
  console.log(advice)
  console.log(`Local rungs: ${zone.localRungs.join(' ')}`)
  console.log('')
  for (const r of results) console.log(`${r.ok ? '✓' : '✗'} ${r.id.padEnd(22)} ${r.kind.padEnd(10)} ${r.detail.join('; ')}`)
  console.log(`\n${results.filter((r) => r.ok).length}/${results.length} mesh members reachable.`)
}
