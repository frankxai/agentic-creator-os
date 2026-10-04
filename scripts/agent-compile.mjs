#!/usr/bin/env node
/**
 * ACOS agent compiler — builds Claude Code subagents from agent specs.
 *
 *   spec (agent-os/specs/*.agent.json)
 *   + role module(s) (agent-os/roles/*.md)
 *   + Expertise Kernel (agent-os/kernel/expertise-kernel.md)
 *   + optional instance overlay (instances/<name>/agent-os/overlay.json)
 *   = .claude/agents/<id>.md            (core, brand-neutral)
 *     instances/<name>/agents/<id>.md   (with --instance <name>)
 *
 * The compiled file is generated. Edit the spec, module, kernel, or overlay and
 * recompile. Pattern credit: the kernel + module + spec compile step of
 * Arcanea's Luminor Kernel, generalised and stripped of brand mythology.
 *
 * Usage:
 *   node scripts/agent-compile.mjs                 # compile core specs
 *   node scripts/agent-compile.mjs --instance frankx
 *   node scripts/agent-compile.mjs --check [--instance frankx]   # exit 1 if stale
 *
 * Dependency-free so it runs in CI without an install step.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const KEBAB_NAME = /^[a-z0-9]+([-_][a-z0-9]+)*$/

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const CHECK = args.includes('--check')
const INSTANCE = args.includes('--instance') ? args[args.indexOf('--instance') + 1] : null
if (args.includes('--instance') && (!INSTANCE || INSTANCE.startsWith('--') || !KEBAB_NAME.test(INSTANCE))) {
  console.error('✗ --instance needs an instance folder name (instances/<name>)')
  process.exit(2)
}

const SPEC_DIR = join(ROOT, 'agent-os', 'specs')
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/
const MEMORY_SCOPES = new Set(['user', 'project', 'local'])
const REQUIRED = ['id', 'version', 'role', 'description', 'model', 'tools', 'memory', 'kernel', 'modules']

let errors = 0
const fail = (msg) => { console.error(`✗ ${msg}`); errors++ }
const readRel = (rel) => {
  const p = join(ROOT, rel)
  if (!existsSync(p)) { fail(`missing file ${rel}`); return '' }
  return readFileSync(p, 'utf8').trim()
}

/** Drop frontmatter, a leading H1, and a leading blockquote so stacked documents read as sections of one prompt. */
const asSection = (md) => md
  .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n+/, '')
  .replace(/^# .*\r?\n+/, '')
  .replace(/^>.*\r?\n(>.*\r?\n)*\r?\n?/, '')
  .trim()

function validate(spec, file) {
  for (const key of REQUIRED) if (spec[key] === undefined) fail(`${file}: missing "${key}"`)
  if (spec.id && !KEBAB.test(spec.id)) fail(`${file}: id "${spec.id}" is not kebab-case`)
  if (spec.description && (spec.description.length < 50 || spec.description.length > 1024)) fail(`${file}: description must be 50-1024 chars`)
  if (spec.description && !/\buse (when|for)\b/i.test(spec.description)) fail(`${file}: description needs a "Use when" / "Use for" trigger`)
  if (spec.memory && !MEMORY_SCOPES.has(spec.memory)) fail(`${file}: memory must be user, project, or local`)
  if (spec.tools && (!Array.isArray(spec.tools) || spec.tools.length === 0)) fail(`${file}: tools must be a non-empty list (least privilege)`)
  // ACOS agent convention (docs/AGENT_CONTRIBUTION_GUIDE.md): 3-7 kebab-case capabilities and a priority.
  if (!Array.isArray(spec.capabilities) || spec.capabilities.length < 3 || spec.capabilities.length > 7 || !spec.capabilities.every((c) => KEBAB.test(c))) fail(`${file}: capabilities must be 3-7 kebab-case entries`)
  if (!['high', 'medium', 'low'].includes(spec.priority)) fail(`${file}: priority must be high, medium, or low`)
}

function loadOverlay() {
  if (!INSTANCE) return null
  const path = join(ROOT, 'instances', INSTANCE, 'agent-os', 'overlay.json')
  if (!existsSync(path)) { fail(`instance overlay not found: instances/${INSTANCE}/agent-os/overlay.json`); return null }
  return JSON.parse(readFileSync(path, 'utf8'))
}

function compile(spec, overlay) {
  const extra = (overlay && overlay.agents && overlay.agents[spec.id]) || {}
  const shared = (overlay && overlay.all) || {}
  const tools = [...new Set([...spec.tools, ...(shared.extraTools || []), ...(extra.extraTools || [])])]
  const reading = [...new Set([...(spec.requiredReading || []), ...(shared.requiredReading || []), ...(extra.requiredReading || [])])]
  const knowledge = [...(spec.knowledge || []), ...(shared.knowledge || []), ...(extra.knowledge || [])]
  const overlayDocs = [...(shared.overlayFiles || []), ...(extra.overlayFiles || [])]
  const skillMap = [...(spec.skillMap || []), ...(shared.skillMap || []), ...(extra.skillMap || [])]

  const fm = [
    '---',
    `name: ${spec.id}`,
    `description: ${JSON.stringify(spec.description)}`,
    ...(spec.capabilities ? ['capabilities:', ...spec.capabilities.map((c) => `  - ${c}`)] : []),
    ...(spec.priority ? [`priority: ${spec.priority}`] : []),
    `tools: ${tools.join(', ')}`,
    `model: ${spec.model}`,
    `memory: ${spec.memory}`,
  ]
  if (spec.color) fm.push(`color: ${spec.color}`)
  if (spec.skills && spec.skills.length) fm.push(`skills: ${spec.skills.join(', ')}`)
  fm.push('---')

  const src = [spec.__source, ...spec.modules, spec.kernel, ...overlayDocs]
  const tick = (s) => '`' + s + '`'
  const orgTable = spec.org
    ? [`## Your Generals (${spec.org.domain})`, '',
        `Imported from ${spec.org.source} (${spec.org.sourceId}). Delegate with the Agent tool to the functional General and open the brief with the domain context in this table.`, '',
        '| Domain General | Spawn | Swarms it owns |', '| --- | --- | --- |',
        ...spec.org.generals.map((g) => `| ${g.title} | ${tick(g.agent)} | ${g.swarms.join(', ')} |`),
        `| Cross-domain or capital | ${tick('general-ceo')} | escalation |`, '']
    : []
  const body = [
    `<!-- GENERATED by scripts/agent-compile.mjs from ${src.join(', ')}. Edit those sources and recompile; do not edit this file. -->`,
    '',
    `# ${spec.id}`,
    '',
    `Spec version ${spec.version}. Role: ${spec.role}.`,
    '',
    '## Required reading',
    '',
    'Read these before acting, when they exist in the working repository:',
    '',
    ...reading.map((r) => `- \`${r}\``),
    '',
    ...(skillMap.length
      ? ['## Skills to reach for', '', 'Invoke these with the Skill tool before improvising a procedure.', '', '| Skill | Use when |', '| --- | --- |',
          ...skillMap.map((s) => `| \`${s.skill}\` | ${s.when} |`), '']
      : []),
    ...orgTable,
    ...spec.modules.map((m) => asSection(readRel(m))),
    '',
    '# Expertise Kernel',
    '',
    asSection(readRel(spec.kernel)),
  ]
  for (const doc of overlayDocs) body.push('', '# Instance overlay', '', asSection(readRel(doc)))
  if (knowledge.length) {
    body.push('', '## Knowledge sources', '', '| Source | What it is for | Review every |', '| --- | --- | --- |')
    for (const k of knowledge) body.push(`| \`${k.source}\` | ${k.purpose || ''} | ${k.review || 'quarter'} |`)
  }
  body.push('', '## Memory scope', '', `Agent memory: \`${spec.memory}\` scope (Claude Code \`memory:\` frontmatter). Shared memory tags: \`agent:${spec.id}\`, \`role:${spec.role}\`, plus \`brand:<id>\` for the brand in play.`)
  if (spec.evals) body.push('', `Evals live in \`${spec.evals}\`. A change to this agent's sources is not done until they pass.`)
  return fm.join('\n') + '\n\n' + body.join('\n').replace(/\n{3,}/g, '\n\n') + '\n'
}

const overlay = loadOverlay()
const outDir = INSTANCE ? join(ROOT, 'instances', INSTANCE, 'agents') : join(ROOT, '.claude', 'agents')
// Core specs compile everywhere; an instance's own specs (for example Domain Queens) compile only into that instance.
const INSTANCE_SPEC_DIR = INSTANCE ? join(ROOT, 'instances', INSTANCE, 'agent-os', 'specs') : null
const specFiles = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.agent.json')).sort().map((f) => join(dir, f)) : [])
const specPaths = [...specFiles(SPEC_DIR), ...(INSTANCE_SPEC_DIR ? specFiles(INSTANCE_SPEC_DIR) : [])]
const specs = specPaths.map((p) => p.slice(p.lastIndexOf(sep) + 1))
let stale = 0
let written = 0
const MARKER = '<!-- GENERATED by scripts/agent-compile.mjs'
const lf = (s) => s.replace(/\r\n/g, '\n')
const compiledIds = new Set()

for (const path of specPaths) {
  const file = path.slice(ROOT.length + 1).split(sep).join('/')
  let spec
  try { spec = JSON.parse(readFileSync(path, 'utf8')) } catch (err) { fail(`${file}: invalid JSON (${err.message})`); continue }
  spec.__source = file
  const before = errors
  validate(spec, file)
  if (errors > before) continue
  compiledIds.add(spec.id)
  const out = join(outDir, `${spec.id}.md`)
  const next = compile(spec, overlay)
  const prev = existsSync(out) ? lf(readFileSync(out, 'utf8')) : null
  if (prev === next) continue
  if (CHECK) { console.error(`✗ stale: ${out.slice(ROOT.length + 1)}`); stale++; continue }
  mkdirSync(outDir, { recursive: true })
  writeFileSync(out, next)
  written++
}

// A compiled agent whose spec was deleted or renamed still loads as a live agent. Never
// delete it silently (archive, don't erase): fail so a human removes or re-specs it.
if (existsSync(outDir)) {
  for (const f of readdirSync(outDir).filter((x) => x.endsWith('.md'))) {
    const id = f.slice(0, -3)
    if (compiledIds.has(id) || specs.includes(`${id}.agent.json`)) continue
    if (readFileSync(join(outDir, f), 'utf8').includes(MARKER)) fail(`orphan: ${join(outDir, f).slice(ROOT.length + 1)} has no spec in agent-os/specs/ (remove it or restore its spec)`)
  }
}

if (errors) process.exit(1)
if (CHECK && stale) { console.error(`agent-compile: ${stale} compiled agent(s) stale — run node scripts/agent-compile.mjs${INSTANCE ? ` --instance ${INSTANCE}` : ''}`); process.exit(1) }
console.log(`agent-compile: ${specs.length} spec(s), ${written} written${CHECK ? ', all fresh' : ''} → ${outDir.slice(ROOT.length + 1)}`)
