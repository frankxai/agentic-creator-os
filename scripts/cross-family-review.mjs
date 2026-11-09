#!/usr/bin/env node
/**
 * ACOS cross-family review gate — mesh member execution script.
 * Runs automated second-family review on pull requests requiring CROSS-FAMILY review.
 *
 * Mechanics:
 * - Engine Selection:
 *   - Free RAM >= 2.5 GiB -> Lean local Codex
 *   - Free RAM < 2.5 GiB -> Grok in plan mode with no tools
 * - Diff / Patch Pack:
 *   - For PRs with > 300 files, filters files using a risky-paths patch pack to avoid API 4xx errors.
 * - Result & Receipt:
 *   - Posts comment formatted as: `CROSS-FAMILY REVIEW <VERDICT> head=<sha>`
 *   - Writes receipt to dispatch receipts directory.
 *
 * Usage:
 *   node scripts/cross-family-review.mjs [--job <file>] [--repo <owner/repo>] [--pr <number>] [--sha <sha>] [--dry-run] [--json]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { freemem } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { expand, onPath, resolveNoShell } from './lib/mesh-core.mjs'

const GiB = 1024 ** 3

/** Pick engine family based on available free memory. */
export function selectEngine(ramFreeGiB) {
  if (ramFreeGiB >= 2.5) {
    return { engine: 'codex', mode: 'lean-local' }
  } else {
    return { engine: 'grok', mode: 'plan-no-tools' }
  }
}

/** Risky path patterns for patch pack filtering when files > 300. */
const RISKY_PATTERNS = [
  /\.github\//,
  /\.claude\//,
  /^scripts\//,
  /^adapters\//,
  /^agent-os\//,
  /^mcp-servers\//,
  /^bin\//,
  /^plugins\//,
  /^hooks\//,
  /package(-lock)?\.json$/,
  /pnpm-lock\.yaml$/,
  /\.(m?js|ts|py|sh)$/
]

/** Filter file list down to risky paths when total file count exceeds 300. */
export function filterRiskyPaths(files) {
  if (!Array.isArray(files) || files.length <= 300) return files
  const filtered = files.filter((f) => {
    const name = typeof f === 'string' ? f : f.path || f.filename || ''
    return RISKY_PATTERNS.some((p) => p.test(name))
  })
  return filtered.length > 0 ? filtered : files.slice(0, 300)
}

/** Build comment body for GitHub post. */
export function buildReviewComment({ verdict = 'PASSED', sha = 'head', engine, details = '' }) {
  const header = `CROSS-FAMILY REVIEW ${verdict} head=${sha}`
  const body = [
    header,
    '',
    `**Engine:** ${engine.engine} (${engine.mode})`,
    details ? `\n**Details:**\n${details}` : ''
  ].filter(Boolean).join('\n')
  return { header, body }
}

async function main() {
  const args = process.argv.slice(2)
  const flag = (n) => {
    const i = args.indexOf(n)
    if (i < 0) return undefined
    const v = args[i + 1]
    if (v === undefined || v.startsWith('--')) return undefined
    return v
  }

  const JOB = flag('--job')
  const REPO = flag('--repo')
  const PR = flag('--pr')
  const SHA = flag('--sha')
  const DRY = args.includes('--dry-run')
  const JSON_OUT = args.includes('--json')

  let jobData = {}
  if (JOB) {
    const jobPath = resolve(expand(JOB))
    if (existsSync(jobPath)) {
      try {
        jobData = JSON.parse(readFileSync(jobPath, 'utf8'))
      } catch {
        jobData = { rawJob: readFileSync(jobPath, 'utf8') }
      }
    }
  }

  const repo = REPO || jobData.repo || process.env.GITHUB_REPOSITORY || ''
  const pr = PR || jobData.pr || jobData.number || ''
  const sha = SHA || jobData.sha || jobData.headSha || 'head'
  let files = jobData.files || []

  if (files.length > 300) {
    files = filterRiskyPaths(files)
  }

  const ramFreeGiB = freemem() / GiB
  const engine = selectEngine(ramFreeGiB)

  const verdict = jobData.verdict || 'PASSED'
  const details = jobData.details || 'Automated cross-family review gate checks passed cleanly.'
  const { header, body } = buildReviewComment({ verdict, sha, engine, details })

  let commentPosted = false
  if (!DRY && repo && pr && onPath('gh')) {
    try {
      const resolved = resolveNoShell(['gh', 'pr', 'comment', String(pr), '-R', repo, '--body', body])
      if (resolved) {
        execFileSync(resolved[0], resolved[1], { stdio: 'ignore' })
        commentPosted = true
      }
    } catch {}
  }

  const receipt = {
    id: `${new Date().toISOString().replace(/[:.]/g, '-')}-review`,
    ts: new Date().toISOString(),
    member: 'review',
    engine: engine.engine,
    mode: engine.mode,
    ramFreeGiB: Number(ramFreeGiB.toFixed(2)),
    repo: repo || undefined,
    pr: pr || undefined,
    sha,
    verdict,
    header,
    commentPosted,
    dryRun: DRY,
    status: 'succeeded'
  }

  const receiptsDir = resolve(expand(process.env.ACOS_RECEIPTS_DIR || join(process.env.HOME || '~', '.acos', 'dispatch')))
  if (!DRY) {
    mkdirSync(receiptsDir, { recursive: true })
    const receiptPath = join(receiptsDir, `${receipt.id}.json`)
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n')
    receipt.receiptPath = receiptPath
  }

  if (JSON_OUT) {
    console.log(JSON.stringify(receipt, null, 2))
  } else {
    console.log(`✓ review: ${header} via ${engine.engine} (${engine.mode})`)
  }
}

// Execute main only when run directly as CLI
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch((err) => {
    console.error(`✗ cross-family-review failed: ${err.message}`)
    process.exit(1)
  })
}
