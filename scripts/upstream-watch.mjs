#!/usr/bin/env node
/**
 * ACOS upstream watch — which frontier repositories moved since we last
 * reviewed them, so the Agent OS keeps absorbing what changes upstream.
 *
 * Reads agent-os/upstreams.json and asks the GitHub REST API for each repo's
 * latest release (or, without releases, the last push). Uses GITHUB_TOKEN or
 * GH_TOKEN when set; unauthenticated calls work for public repos within the
 * public rate limit. Reports only; never edits.
 *
 * Usage:
 *   node scripts/upstream-watch.mjs [--file agent-os/upstreams.json] [--md <out.md>] [--json]
 *
 * Exit 0 always (a moved upstream is a review prompt, not a failure); 2 on bad input.
 */
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const flag = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined)
const FILE = flag('--file') || join(ROOT, 'agent-os', 'upstreams.json')
const MD = flag('--md')
const JSON_OUT = args.includes('--json')

let reg
try { reg = JSON.parse(readFileSync(FILE, 'utf8')) } catch (err) { console.error(`✗ cannot read ${FILE}: ${err.message}`); process.exit(2) }
const reviewed = Date.parse(reg.reviewed)
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'acos-upstream-watch', ...(token ? { Authorization: `Bearer ${token}` } : {}) }

async function get(path) {
  const res = await fetch(`https://api.github.com/${path}`, { headers })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

const rows = []
for (const u of reg.upstreams || []) {
  try {
    const repo = await get(`repos/${u.repo}`)
    if (!repo) { rows.push({ ...u, state: 'missing', detail: 'not found or private' }); continue }
    const release = await get(`repos/${u.repo}/releases/latest`).catch(() => null)
    const when = release ? release.published_at : repo.pushed_at
    const label = release ? `release ${release.tag_name}` : 'push'
    const moved = Date.parse(when) > reviewed
    rows.push({ ...u, state: moved ? 'moved' : 'unchanged', detail: `${label} ${when.slice(0, 10)}`, url: release ? release.html_url : repo.html_url })
  } catch (err) {
    rows.push({ ...u, state: 'unknown', detail: err.message })
  }
}

const moved = rows.filter((r) => r.state === 'moved')
const md = [`## Upstream watch — reviewed ${reg.reviewed}`, '',
  `${moved.length} of ${rows.length} upstreams moved since the last review.`, '',
  '| Upstream | State | Latest | Review when | Feeds |', '| --- | --- | --- | --- | --- |',
  ...rows.map((r) => `| [${r.repo}](https://github.com/${r.repo}) | ${r.state} | ${r.detail} | ${r.watch} | ${(r.feeds || []).join(', ')} |`), ''].join('\n')

if (MD) (MD === process.env.GITHUB_STEP_SUMMARY ? appendFileSync : writeFileSync)(MD, md)
if (JSON_OUT) console.log(JSON.stringify({ reviewed: reg.reviewed, rows }, null, 2))
else if (!MD) console.log(md)
console.error(`upstream-watch: ${moved.length}/${rows.length} moved since ${reg.reviewed}`)
