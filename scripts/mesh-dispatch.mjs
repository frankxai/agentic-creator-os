#!/usr/bin/env node
/**
 * ACOS mesh dispatch — sends one bounded job to one mesh member, with the
 * member's guards enforced in code and a receipt written for every attempt.
 *
 * A member is dispatchable when its registry entry has a `run` block:
 *   { "mode": "argv",     "argv": [...], "stdin": "job" | null, "local": true, "minRamGiB": 2.5, "maxConcurrent": 2 }
 *   { "mode": "envelope", "argv": [...base], "local": false }   job file is JSON: taskId, summary,
 *                                                              instructions[], acceptance[], evidence[], priority
 *   { "mode": "session" }                                      cloud routines: run from a Claude session
 * argv placeholders: {job} (job file path), {cwd}, {repo}.
 *
 * Guards, in order: member exists and is dispatchable; the cheap probe passes
 * (known issues stay down); free RAM meets minRamGiB for local members; running
 * receipts for this member stay under maxConcurrent. A refusal is a receipt too.
 *
 * Usage:
 *   node scripts/mesh-dispatch.mjs --mesh <mesh.json> --member <id> --job <file>
 *        [--cwd <dir>] [--repo <owner/name>] [--dry-run] [--json]
 *
 * Exit 0 when dispatched or dry-run, 3 when refused by a guard, 2 on bad input.
 */
import { writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync, openSync, closeSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { loadMesh, measureZone, probeMember, expand, resolveNoShell } from './lib/mesh-core.mjs'

const args = process.argv.slice(2)
const VALUE_FLAGS = ['--mesh', '--member', '--job', '--cwd', '--repo']
for (const n of VALUE_FLAGS) {
  const i = args.indexOf(n)
  if (i >= 0 && (args[i + 1] === undefined || args[i + 1].startsWith('--'))) { console.error(`✗ ${n} needs a value`); process.exit(2) }
}
const flag = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined)
const MESH = flag('--mesh')
const MEMBER = flag('--member')
const JOB = flag('--job')
const CWD = resolve(flag('--cwd') || process.cwd())
const REPO = flag('--repo') || ''
const DRY = args.includes('--dry-run')
const JSON_OUT = args.includes('--json')
if (!MESH || !MEMBER || !JOB) { console.error('✗ usage: mesh-dispatch.mjs --mesh <mesh.json> --member <id> --job <file> [--cwd d] [--repo o/n] [--dry-run]'); process.exit(2) }

let mesh
try { mesh = loadMesh(MESH) } catch (err) { console.error(`✗ cannot read mesh: ${err.message}`); process.exit(2) }
const jobPath = resolve(expand(JOB))
if (!existsSync(jobPath)) { console.error(`✗ job file not found: ${JOB}`); process.exit(2) }

const receiptsDir = expand(mesh.receiptsDir || join('~', '.acos', 'dispatch'))
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const id = `${stamp}-${MEMBER}`
const zone = measureZone(mesh)
const receipt = { id, ts: new Date().toISOString(), member: MEMBER, job: jobPath, cwd: CWD, repo: REPO || undefined, zone: zone.zone, ramFreeGiB: zone.ramFreeGiB, dryRun: DRY }

function finish(status, extra = {}, code = 0) {
  Object.assign(receipt, { status, ...extra })
  if (!DRY) {
    mkdirSync(receiptsDir, { recursive: true })
    writeFileSync(join(receiptsDir, `${id}.json`), JSON.stringify(receipt, null, 2) + '\n')
  }
  if (JSON_OUT) console.log(JSON.stringify(receipt, null, 2))
  else console.log(`${status === 'refused' ? '✗' : '✓'} ${MEMBER}: ${status}${extra.reason ? ` — ${extra.reason}` : ''}${extra.out ? `\n  output → ${extra.out}` : ''}${DRY ? '' : `\n  receipt → ${join(receiptsDir, `${id}.json`)}`}`)
  process.exit(code)
}

const member = (mesh.members || []).find((m) => m.id === MEMBER)
if (!member) finish('refused', { reason: `no member "${MEMBER}" in the mesh` }, 3)
const run = member.run
if (!run) finish('refused', { reason: `member "${MEMBER}" has no run block (not dispatchable from a script)` }, 3)
if (run.mode === 'session') finish('refused', { reason: `"${MEMBER}" runs from a Claude session (RemoteTrigger run <routine id>), not from this script` }, 3)

const health = await probeMember(member)
if (!health.ok) finish('refused', { reason: `member is down: ${health.detail.join('; ')}` }, 3)
if (run.local && run.minRamGiB && zone.ramFreeGiB < run.minRamGiB) {
  finish('refused', { reason: `needs ${run.minRamGiB} GiB free RAM, ${zone.ramFreeGiB} GiB available (zone ${zone.zone}); offload to a remote member instead` }, 3)
}

function alive(pid) {
  try { process.kill(pid, 0); return true } catch { return false }
}
if (run.maxConcurrent && existsSync(receiptsDir)) {
  const running = readdirSync(receiptsDir).filter((f) => f.endsWith(`-${MEMBER}.json`))
    .map((f) => { try { return JSON.parse(readFileSync(join(receiptsDir, f), 'utf8')) } catch { return null } })
    .filter((r) => r && r.status === 'started' && r.pid && alive(r.pid))
  if (running.length >= run.maxConcurrent) finish('refused', { reason: `${running.length} ${MEMBER} job(s) already running (max ${run.maxConcurrent})` }, 3)
}
// The zone cap counts every running local job, whichever member it went to.
if (run.local) {
  const runningLocal = existsSync(receiptsDir)
    ? readdirSync(receiptsDir).filter((f) => f.endsWith('.json'))
      .map((f) => { try { return JSON.parse(readFileSync(join(receiptsDir, f), 'utf8')) } catch { return null } })
      .filter((r) => r && r.status === 'started' && r.local && r.pid && alive(r.pid)).length
    : 0
  if (runningLocal >= zone.localParallelCap) {
    finish('refused', { reason: `zone ${zone.zone} allows ${zone.localParallelCap} local job(s) and ${runningLocal} running; offload to a remote member` }, 3)
  }
}
receipt.local = !!run.local

// ---- Build the command ----

const fill = (s) => s.replaceAll('{job}', jobPath).replaceAll('{cwd}', CWD).replaceAll('{repo}', REPO)
let argv
if (run.mode === 'argv') {
  if (run.argv.some((a) => a.includes('{repo}')) && !REPO) finish('refused', { reason: `"${MEMBER}" needs --repo owner/name` }, 3)
  argv = run.argv.map(fill)
} else if (run.mode === 'envelope') {
  let env
  try { env = JSON.parse(readFileSync(jobPath, 'utf8')) } catch (err) { console.error(`✗ envelope job must be JSON: ${err.message}`); process.exit(2) }
  if (!env.taskId || !/^[a-z0-9][a-z0-9._-]{2,79}$/.test(env.taskId) || !env.summary) { console.error('✗ envelope job needs taskId (a-z0-9._-, 3-80 chars) and summary'); process.exit(2) }
  argv = [...run.argv.map(fill), '--task-id', env.taskId, '--summary', env.summary, '--priority', env.priority || 'normal',
    ...(env.instructions || []).flatMap((x) => ['--instruction', x]),
    ...(env.acceptance || []).flatMap((x) => ['--acceptance', x]),
    ...(env.evidence || []).flatMap((x) => ['--evidence-required', x])]
} else {
  finish('refused', { reason: `unknown run mode "${run.mode}"` }, 3)
}

// Resolve without a shell: a real executable, or an npm shim's JavaScript entry run by Node.
// A shim that is not a recognisable npm shim is refused (a cmd.exe fallback would expand %VARS%).
const resolved = resolveNoShell(argv)
if (!resolved) finish('refused', { reason: `${argv[0]} is not on PATH or cannot be run without a shell` }, 3)
const [file, fileArgs] = resolved
receipt.command = [argv[0], ...argv.slice(1).map((a) => (a.length > 120 ? `${a.slice(0, 117)}...` : a))]
receipt.launch = file === process.execPath && argv[0] !== 'node' ? 'npm-shim-entry' : 'direct'

if (DRY) finish('dry-run', { resolved: file, stdin: run.stdin === 'job' ? 'job file' : 'none' })

// ---- Launch in the background; output goes next to the receipt ----

mkdirSync(receiptsDir, { recursive: true })
const out = join(receiptsDir, `${id}.out.txt`)
const fd = openSync(out, 'a')
// Windows cannot spawn .cmd shims directly, and a detached cmd.exe loses the output of the Node
// program an npm shim starts; resolveNoShell already turned such a shim into Node + its JS entry.
const stdio = [run.stdin === 'job' ? 'pipe' : 'ignore', fd, fd]
const child = spawn(file, fileArgs, { cwd: CWD, detached: true, windowsHide: true, stdio, shell: false })
if (run.stdin === 'job') {
  child.stdin.end(readFileSync(jobPath))
}
child.unref()
closeSync(fd)
finish('started', { pid: child.pid, out })
