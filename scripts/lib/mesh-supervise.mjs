#!/usr/bin/env node
/**
 * Background supervisor for mesh-dispatch: runs one job (no shell), then records
 * how it ended in the job's receipt, so a launch is never mistaken for a success.
 *
 *   node mesh-supervise.mjs <receipt.json> <file> [args...]
 *
 * stdio is inherited from the dispatcher (job on stdin, output to the .out.txt).
 * The receipt moves from "started" to "succeeded" (exit 0) or "failed" (non-zero
 * exit, signal, or spawn error) with exitCode, signal and endedAt. SIGTERM and
 * SIGINT are passed on to the job.
 */
import { spawn } from 'node:child_process'
import { readFileSync, renameSync, writeFileSync } from 'node:fs'

const [receiptPath, file, ...fileArgs] = process.argv.slice(2)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function record(result) {
  // The dispatcher writes the "started" receipt just after launching this process; wait for it (up to 30 s).
  for (let i = 0; i < 600; i++) {
    let receipt = null
    try { receipt = JSON.parse(readFileSync(receiptPath, 'utf8')) } catch {}
    if (receipt && receipt.status === 'started') {
      Object.assign(receipt, result, { endedAt: new Date().toISOString() })
      writeFileSync(`${receiptPath}.tmp`, JSON.stringify(receipt, null, 2) + '\n')
      renameSync(`${receiptPath}.tmp`, receiptPath)
      return
    }
    await sleep(50)
  }
}

let done = false
const end = async (result) => {
  if (done) return
  done = true
  await record(result)
  process.exit(result.status === 'succeeded' ? 0 : 1)
}

const child = spawn(file, fileArgs, { stdio: 'inherit', windowsHide: true, shell: false })
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => child.kill(sig))
child.on('error', (err) => end({ status: 'failed', exitCode: null, signal: null, error: err.message }))
child.on('exit', (code, signal) => end({ status: code === 0 ? 'succeeded' : 'failed', exitCode: code, signal }))
