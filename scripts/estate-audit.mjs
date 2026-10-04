#!/usr/bin/env node
/**
 * ACOS estate audit — inventories every skill, agent, and command an operator's
 * harnesses can see, scores each one against docs/agent-os/ (AGENT-SPEC,
 * SKILL-SPEC), and reports shadowing, duplication, and dead weight.
 *
 * Read-only. Dependency-free. Machine paths come from flags or os.homedir() so
 * nothing personal is committed; report paths are printed relative to home (~).
 *
 * Usage:
 *   node scripts/estate-audit.mjs [--home <dir>] [--repos <dir>]... \
 *        [--json <out.json>] [--md <out.md>] [--min-score <n>]
 *
 * Scans: <home>/.claude/{skills,agents,commands}, installed Claude Code plugins
 * (installed_plugins.json), <home>/.agents/skills, <home>/.grok/{skills,agents},
 * and every git repo directly under each --repos dir.
 *
 * Exit 1 only when --min-score is given and the loadable average falls below it.
 */
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs'
import { join, basename, dirname, resolve, sep } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { homedir } from 'node:os'

const args = process.argv.slice(2)
const VALUE_FLAGS = new Set(['--home', '--repos', '--json', '--md', '--min-score'])
for (let i = 0; i < args.length; i++) {
  if (VALUE_FLAGS.has(args[i]) && (args[i + 1] === undefined || args[i + 1].startsWith('--'))) {
    console.error(`✗ ${args[i]} needs a value`)
    process.exit(2)
  }
}
const flag = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const flagAll = (name) => args.flatMap((a, i) => (a === name ? [args[i + 1]] : []))

const HOME = flag('--home') || homedir()
const REPO_DIRS = flagAll('--repos')
const JSON_OUT = flag('--json')
const MD_OUT = flag('--md')
const MIN_SCORE = flag('--min-score') ? Number(flag('--min-score')) : undefined

const PRUNE = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage', '.turbo',
  '.vercel', 'vendor', '.cache', '__pycache__', '.venv', 'venv', 'worktrees',
])
const NOT_ARTIFACTS = /^(readme|index|claude|agents|changelog|license|contributing)\.md$/i
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/
const TRIGGER = /\b(use (this |it )?(when|for|to|after|before|whenever|proactively)|when (the )?(user|frank|you|asked)|trigger|invoke[sd]?|auto-?invokes?|activates? (when|on)|should be used)/i
const OUTPUT_CONTRACT = /^#{1,3} .*(output|deliverable|return|report|done|verification|acceptance)/im

/** Absolute path with forward slashes; Windows comparisons ignore case. */
const posix = (p) => resolve(p).split(sep).join('/')
const fold = (p) => (process.platform === 'win32' ? p.toLowerCase() : p)
const HOME_POSIX = posix(HOME)
/** Print paths relative to home so reports never carry a personal home path. */
const tilde = (p) => {
  const q = posix(p)
  const under = fold(q) === fold(HOME_POSIX) || fold(q).startsWith(fold(HOME_POSIX) + '/')
  return under ? '~' + q.slice(HOME_POSIX.length) : q
}

function isDir(p) {
  try { return statSync(p).isDirectory() } catch { return false }
}

/** Directory entries with types, so walks never stat every file. */
function entries(dir) {
  try { return readdirSync(dir, { withFileTypes: true }) } catch { return [] }
}

function read(p) {
  try { return readFileSync(p, 'utf8') } catch { return '' }
}

/** Minimal frontmatter parser: top-level scalar keys, folded (>) and literal (|) blocks, inline lists. */
function frontmatter(text) {
  const m = text.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { fm: null, body: text }
  const fm = {}
  const lines = m[1].split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!kv) continue
    let [, key, val] = kv
    if (/^[>|][+-]?\s*$/.test(val) || val === '') {
      const block = []
      while (i + 1 < lines.length && (/^\s+/.test(lines[i + 1]) || lines[i + 1] === '')) block.push(lines[++i].trim())
      val = block.join(' ').trim()
    }
    fm[key] = unquote(val.trim())
  }
  return { fm, body: text.slice(m[0].length) }
}

/** YAML scalar quoting: double-quoted values follow JSON escapes, single quotes double up. */
function unquote(v) {
  if (/^".*"$/.test(v)) { try { return JSON.parse(v) } catch { return v.slice(1, -1) } }
  if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'")
  return v
}

const items = []

function record(kind, path, scope, extra = {}) {
  const text = read(path)
  const { fm, body } = frontmatter(text)
  const bodyLines = body.split(/\r?\n/).length
  const hash = createHash('sha1').update(body.replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 12)
  let mtime = null
  try { mtime = statSync(path).mtime.toISOString().slice(0, 10) } catch {}
  const dirName = basename(dirname(path))
  const name = (fm && fm.name) || (kind === 'skill' ? dirName : basename(path, '.md'))
  items.push({ kind, scope, path: tilde(path), name, fm, body, bodyLines, hash, mtime, dirName, ...extra })
}

// Why an artifact does not load. `nested` and `loose` sit inside a harness root but are
// never picked up; `outside` sits in a repo folder no harness reads (code, docs, archives).
const WHY = {
  nested: 'nested skill (Claude Code loads only <skills>/<name>/SKILL.md)',
  loose: 'loose .md in skills root (not a <name>/SKILL.md)',
  outside: 'outside a harness root (repo content, not loaded)',
}
const isDocName = (entry) => { const stem = entry.slice(0, -3); return stem === stem.toUpperCase() }
const skillExtras = (dir) => ({
  hasRefs: isDir(join(dir, 'references')) || isDir(join(dir, 'scripts')) || isDir(join(dir, 'reference')),
  hasEvals: isDir(join(dir, 'evals')) || existsSync(join(dir, 'evals.json')),
})

/** Skills root: <root>/<name>/SKILL.md loads; deeper SKILL.md and loose .md do not. */
function scanSkillsRoot(root, scope, harness = true) {
  if (!isDir(root)) return
  for (const d of entries(root)) {
    const entry = d.name
    const full = join(root, entry)
    if (d.isDirectory() || (d.isSymbolicLink() && isDir(full))) {
      if (existsSync(join(full, 'SKILL.md'))) {
        record('skill', join(full, 'SKILL.md'), scope, harness
          ? { loadable: true, ...skillExtras(full) }
          : { loadable: false, why: 'outside', ...skillExtras(full) })
      }
      walkNested(full, scope, 1, harness)
    } else if (entry.endsWith('.md') && !NOT_ARTIFACTS.test(entry) && !isDocName(entry)) {
      record('skill', full, scope, { loadable: false, why: harness ? 'loose' : 'outside' })
    }
  }
}

function walkNested(dir, scope, depth, harness) {
  if (depth > 5) return
  for (const d of entries(dir)) {
    const entry = d.name
    if (PRUNE.has(entry) || !d.isDirectory()) continue
    const full = join(dir, entry)
    if (existsSync(join(full, 'SKILL.md'))) {
      record('skill', join(full, 'SKILL.md'), scope, { loadable: false, why: harness ? 'nested' : 'outside', ...skillExtras(full) })
    }
    walkNested(full, scope, depth + 1, harness)
  }
}

function scanMdDir(root, kind, scope, harness = true, depth = 0) {
  if (!isDir(root) || depth > 3) return
  for (const d of entries(root)) {
    const entry = d.name
    if (PRUNE.has(entry)) continue
    const full = join(root, entry)
    if (d.isDirectory()) scanMdDir(full, kind, scope, harness, depth + 1)
    else if (entry.endsWith('.md') && !NOT_ARTIFACTS.test(entry)) {
      record(kind, full, scope, harness ? { loadable: true, nested: depth > 0 } : { loadable: false, why: 'outside' })
    }
  }
}

function scanHarnessDir(base, scope) {
  scanSkillsRoot(join(base, 'skills'), scope)
  scanMdDir(join(base, 'agents'), 'agent', scope)
  scanMdDir(join(base, 'commands'), 'command', scope)
}

// 1. Claude Code user scope.
scanHarnessDir(join(HOME, '.claude'), 'claude-user')

// 2. Installed Claude Code plugins (active install path only, not every cached version).
const installed = join(HOME, '.claude', 'plugins', 'installed_plugins.json')
if (existsSync(installed)) {
  try {
    const reg = JSON.parse(read(installed))
    for (const [id, installs] of Object.entries(reg.plugins || {})) {
      for (const inst of [].concat(installs)) {
        if (inst && inst.installPath) scanHarnessDir(inst.installPath, `plugin:${id}`)
      }
    }
  } catch (err) {
    console.error(`! installed_plugins.json unreadable: ${err.message}`)
  }
}

// 3. Cross-harness catalogs.
scanSkillsRoot(join(HOME, '.agents', 'skills'), 'agents-catalog')
scanHarnessDir(join(HOME, '.grok'), 'grok-user')

// 4. Repos. Harness roots load: <repo>/.claude/{skills,agents,commands}, <repo>/.agents/skills,
// and plugin roots (a folder with .claude-plugin/plugin.json). Any other skills/agents/commands
// folder up to depth 4 is inventoried as `outside` so it never inflates scores or shadowing.
function scanRepo(repo) {
  const scope = `repo:${basename(repo)}`
  const roots = new Set()
  const harness = (base) => {
    for (const sub of ['skills', 'agents', 'commands']) roots.add(join(base, sub))
    scanHarnessDir(base, scope)
  }
  harness(join(repo, '.claude'))
  roots.add(join(repo, '.agents', 'skills'))
  scanSkillsRoot(join(repo, '.agents', 'skills'), scope)
  const visit = (dir, depth) => {
    if (depth > 4) return
    for (const d of entries(dir)) {
      const entry = d.name
      if (PRUNE.has(entry) || !d.isDirectory()) continue
      const full = join(dir, entry)
      if (roots.has(full)) continue
      if (existsSync(join(full, '.claude-plugin', 'plugin.json'))) { harness(full); visit(full, depth + 1); continue }
      if (entry === 'skills') { roots.add(full); scanSkillsRoot(full, scope, false) }
      else if (entry === 'agents') { roots.add(full); scanMdDir(full, 'agent', scope, false) }
      else if (entry === 'commands') { roots.add(full); scanMdDir(full, 'command', scope, false) }
      else visit(full, depth + 1)
    }
  }
  visit(repo, 0)
}

/** origin URL normalised to owner/name, or null for local-only repos. */
function originOf(repo) {
  try {
    const url = execFileSync('git', ['-C', repo, 'config', '--get', 'remote.origin.url'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    return url.replace(/\.git$/, '').replace(/^.*[:/]([^/]+\/[^/]+)$/, '$1').toLowerCase()
  } catch { return null }
}

function branchOf(repo) {
  try {
    return execFileSync('git', ['-C', repo, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch { return '' }
}

// Several local folders often point at one remote (worktrees, flagship clones, sync copies).
// Scan one canonical folder per remote, chosen deterministically: the folder whose name
// matches the remote, else one on main/master, else the first by path.
const clones = []
const byOrigin = new Map()
for (const parent of REPO_DIRS) {
  if (!isDir(parent)) continue
  for (const d of entries(parent)) {
    const repo = join(parent, d.name)
    if (d.name.startsWith('.') || !d.isDirectory() || !existsSync(join(repo, '.git'))) continue
    const origin = originOf(repo) || `local:${repo}`
    if (!byOrigin.has(origin)) byOrigin.set(origin, [])
    byOrigin.get(origin).push(repo)
  }
}
for (const [origin, unsorted] of byOrigin) {
  const repos = [...unsorted].sort()
  const remoteName = origin.split('/').pop()
  const canonical = repos.find((r) => basename(r).toLowerCase() === remoteName)
    || (repos.length > 1 && repos.find((r) => ['main', 'master'].includes(branchOf(r))))
    || repos[0]
  scanRepo(canonical)
  for (const r of repos) if (r !== canonical) clones.push({ folder: tilde(r), sameRemoteAs: tilde(canonical), origin })
}

// ---- Scoring (rules are documented in docs/agent-os/SKILL-SPEC.md and AGENT-SPEC.md) ----

function scoreSkill(it) {
  const f = []
  const fm = it.fm
  const desc = (fm && fm.description) || ''
  const routing = desc + ' ' + ((fm && fm.when_to_use) || '')
  let s = 0
  if (fm) s += 20; else f.push('S1 no frontmatter')
  if (fm && KEBAB.test(it.name) && it.name.length <= 64) s += 10; else f.push('S2 name not kebab-case <=64')
  if (it.loadable && it.name === it.dirName) s += 5; else if (it.loadable) f.push('S2b name != directory')
  if (desc.length >= 50 && desc.length <= 1024) s += 20
  else if (desc.length > 0) { s += 8; f.push(desc.length > 1024 ? 'S3 description >1024 chars' : 'S3 description <50 chars') }
  else f.push('S3 no description')
  if (TRIGGER.test(routing)) s += 15; else f.push('S4 description lacks a when-to-use trigger')
  if (it.bodyLines <= 500) s += 10; else f.push('S5 body >500 lines (move depth to references/)')
  if (it.bodyLines <= 200 || it.hasRefs) s += 10; else f.push('S6 long body without references/ or scripts/')
  if (!/\{\{|TODO|TBD|lorem ipsum/i.test(desc)) s += 5; else f.push('S7 placeholder in description')
  if (it.hasEvals || /^#{1,3} .*\b(verif\w*|evals?|tests?|testing|quality gate|checklist)\b/im.test(it.body)) s += 5; else f.push('S8 no verification/eval section')
  return { score: s, findings: f }
}

function scoreAgent(it) {
  const f = []
  const fm = it.fm
  const desc = (fm && fm.description) || ''
  let s = 0
  if (fm) s += 20; else f.push('A1 no frontmatter')
  if (fm && fm.name && KEBAB.test(fm.name)) s += 10; else f.push('A2 name missing or not kebab-case')
  if (desc.length >= 50) s += 15; else f.push('A3 description <50 chars')
  if (TRIGGER.test(desc)) s += 10; else f.push('A3b description lacks a when-to-use trigger')
  if (fm && fm.tools) s += 15; else f.push('A4 tools not declared (inherits everything)')
  if (fm && fm.model) s += 5; else f.push('A5 model not declared')
  if (OUTPUT_CONTRACT.test(it.body)) s += 10; else f.push('A6 no output/done contract heading')
  if (it.bodyLines >= 15 && it.bodyLines <= 400) s += 10; else f.push(it.bodyLines < 15 ? 'A7 body <15 lines (stub)' : 'A7 body >400 lines')
  if (fm && (fm.memory || fm.skills || /^#{1,3} .*(required reading|knowledge|sources|memory)/im.test(it.body))) s += 5
  else f.push('A8 no memory scope, preloaded skills, or knowledge sources')
  return { score: s, findings: f }
}

function scoreCommand(it) {
  const f = []
  let s = 0
  if (it.fm && it.fm.description) s += 40; else f.push('C1 no description frontmatter')
  if (it.bodyLines >= 10) s += 30; else f.push('C2 body <10 lines (stub)')
  if (/^\s*(\d+\.|#{2,3} )/m.test(it.body)) s += 30; else f.push('C3 no steps or sections')
  return { score: s, findings: f }
}

for (const it of items) {
  const r = it.kind === 'skill' ? scoreSkill(it) : it.kind === 'agent' ? scoreAgent(it) : scoreCommand(it)
  it.score = r.score
  it.findings = r.findings
  if (!it.loadable) it.findings.unshift(`NOT-LOADED ${WHY[it.why]}`)
}

// ---- Cross-cutting: shadowing and duplication ----

const loadable = items.filter((i) => i.loadable)
const byName = new Map()
for (const it of loadable) {
  const key = `${it.kind}:${it.name.toLowerCase()}`
  if (!byName.has(key)) byName.set(key, [])
  byName.get(key).push(it)
}
const shadowed = [...byName.entries()]
  .filter(([, v]) => new Set(v.map((x) => x.scope)).size > 1)
  .map(([k, v]) => ({ key: k, scopes: [...new Set(v.map((x) => x.scope))], paths: v.map((x) => x.path) }))
  .sort((a, b) => b.scopes.length - a.scopes.length)

const byHash = new Map()
for (const it of items) {
  if (it.body.trim().length < 200) continue
  if (!byHash.has(it.hash)) byHash.set(it.hash, [])
  byHash.get(it.hash).push(it)
}
const duplicates = [...byHash.values()].filter((v) => v.length > 1)
  .map((v) => ({ name: v[0].name, kind: v[0].kind, copies: v.length, paths: v.map((x) => x.path) }))
  .sort((a, b) => b.copies - a.copies)

// ---- Aggregates ----

const grade = (s) => (s >= 85 ? 'A' : s >= 70 ? 'B' : s >= 50 ? 'C' : 'D')
const avg = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0)

const scopes = new Map()
for (const it of items) {
  const s = scopes.get(it.scope) || { scope: it.scope, skills: 0, deadSkills: 0, agents: 0, commands: 0, outside: 0, scores: [] }
  if (it.loadable) {
    s[`${it.kind}s`]++
    s.scores.push(it.score)
  } else if (it.why === 'outside') s.outside++
  else s.deadSkills++
  scopes.set(it.scope, s)
}
const scopeRows = [...scopes.values()]
  .map((s) => ({ ...s, avg: avg(s.scores), total: s.skills + s.agents + s.commands, scores: undefined }))
  .sort((a, b) => b.total - a.total || b.deadSkills - a.deadSkills)

const findingCounts = {}
for (const it of loadable) for (const f of it.findings) {
  const code = f.split(' ')[0]
  findingCounts[code] = findingCounts[code] || { code, example: f, count: 0 }
  findingCounts[code].count++
}

const totals = {
  generated: new Date().toISOString().slice(0, 10),
  scopes: scopeRows.length,
  loadableSkills: loadable.filter((i) => i.kind === 'skill').length,
  deadSkills: items.filter((i) => !i.loadable && i.why !== 'outside').length,
  agents: loadable.filter((i) => i.kind === 'agent').length,
  commands: loadable.filter((i) => i.kind === 'command').length,
  outsideHarness: items.filter((i) => i.why === 'outside').length,
  loadableAverage: avg(loadable.map((i) => i.score)),
  grades: loadable.reduce((g, i) => ((g[grade(i.score)] = (g[grade(i.score)] || 0) + 1), g), {}),
  shadowedNames: shadowed.length,
  duplicateClusters: duplicates.length,
  duplicateCopies: duplicates.reduce((a, d) => a + d.copies - 1, 0),
  cloneFoldersSkipped: clones.length,
}

const slim = items.map(({ body, fm, ...rest }) => ({
  ...rest,
  description: fm && fm.description ? fm.description.slice(0, 300) : '',
  tools: fm && fm.tools ? fm.tools : undefined,
  model: fm && fm.model ? fm.model : undefined,
  grade: grade(rest.score),
}))

if (JSON_OUT) {
  writeFileSync(JSON_OUT, JSON.stringify({ totals, scopes: scopeRows, clones, shadowed, duplicates, findings: Object.values(findingCounts), items: slim }, null, 2))
}

// ---- Markdown scorecard ----

const md = []
md.push(`# Estate agent audit — ${totals.generated}`, '')
md.push('Generated by `scripts/estate-audit.mjs`. Do not hand-edit numbers; re-run the script.', '')
md.push('## Totals', '')
md.push('| Measure | Value |', '| --- | --- |')
md.push(`| Scopes scanned | ${totals.scopes} |`)
md.push(`| Loadable skills | ${totals.loadableSkills} |`)
md.push(`| Dead skill files inside harness roots (never loaded) | ${totals.deadSkills} |`)
md.push(`| Loadable agents | ${totals.agents} |`)
md.push(`| Loadable commands | ${totals.commands} |`)
md.push(`| Files outside harness roots (inventoried, not scored) | ${totals.outsideHarness} |`)
md.push(`| Average score (loadable) | ${totals.loadableAverage}/100 |`)
md.push(`| Grades A/B/C/D | ${['A', 'B', 'C', 'D'].map((g) => totals.grades[g] || 0).join(' / ')} |`)
md.push(`| Names loadable in more than one scope | ${totals.shadowedNames} |`)
md.push(`| Exact-duplicate clusters (extra copies) | ${totals.duplicateClusters} (${totals.duplicateCopies}) |`)
md.push(`| Clone/worktree folders skipped (same remote) | ${totals.cloneFoldersSkipped} |`, '')
md.push('## By scope', '')
md.push('| Scope | Skills | Dead | Agents | Commands | Outside | Avg |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: |')
for (const s of scopeRows) md.push(`| ${s.scope} | ${s.skills} | ${s.deadSkills} | ${s.agents} | ${s.commands} | ${s.outside} | ${s.avg} |`)
md.push('', '## Most common findings (loadable artifacts)', '')
md.push('| Rule | Count | Example |', '| --- | ---: | --- |')
for (const f of Object.values(findingCounts).sort((a, b) => b.count - a.count).slice(0, 20)) md.push(`| ${f.code} | ${f.count} | ${f.example} |`)
md.push('', '## Shadowed names (same name loadable from several scopes)', '')
for (const s of shadowed.slice(0, 40)) md.push(`- \`${s.key}\` — ${s.scopes.join(', ')}`)
md.push('', '## Clone and worktree folders skipped', '')
for (const c of clones) md.push(`- ${c.folder} → same remote as ${c.sameRemoteAs}`)
md.push('', '## Largest duplicate clusters', '')
for (const d of duplicates.slice(0, 25)) md.push(`- ${d.kind} \`${d.name}\` × ${d.copies}: ${d.paths.slice(0, 4).join(' · ')}${d.paths.length > 4 ? ' …' : ''}`)
md.push('', '## Lowest-scoring loadable artifacts', '')
md.push('| Score | Kind | Name | Scope | Top finding |', '| ---: | --- | --- | --- | --- |')
for (const it of [...loadable].sort((a, b) => a.score - b.score).slice(0, 30)) md.push(`| ${it.score} | ${it.kind} | ${it.name} | ${it.scope} | ${it.findings[0] || ''} |`)
md.push('')

if (MD_OUT) writeFileSync(MD_OUT, md.join('\n'))
else console.log(md.join('\n'))

console.error(`estate-audit: ${totals.loadableSkills} skills (+${totals.deadSkills} dead), ${totals.agents} agents, ${totals.commands} commands loadable across ${totals.scopes} scopes (${totals.outsideHarness} files outside harness roots); avg ${totals.loadableAverage}/100`)

if (MIN_SCORE !== undefined && totals.loadableAverage < MIN_SCORE) process.exit(1)
