#!/usr/bin/env node
// Model Arena runner — dispatch evolving tasks to top frontier models via a
// gateway (OpenRouter), verify mechanically, rate with pairwise Elo, capture
// cost/latency/tokens, write a receipt, update the leaderboard, and run the
// learning loop (saturation → rotate/harden).
//
// Why a gateway: the Claude Code Agent/Workflow harness can only spawn Claude
// models (fable/opus/sonnet/haiku). Testing GPT-5 / Gemini / Grok / DeepSeek /
// Qwen / Kimi / Mistral head-to-head requires an external route. OpenRouter is
// the sanctioned one (OPENROUTER_API_KEY + OPENROUTER_BASE_URL, per CLAUDE.md).
//
// Method (premium, matches how LMArena/Chatbot-Arena rate models):
//   - Objective tasks self-verify mechanically (no LLM judge can launder a
//     constraint violation). Judge tasks defer to a cross-family blind judge in
//     the workflow layer.
//   - Per task, every ordered pair of models yields a win/loss/tie, which feeds
//     a persistent Elo rating — a far better signal than raw pass-rate when the
//     field is large and capability is saturated.
//   - Every dispatch records latency + tokens (+ cost when the gateway returns
//     it), so routing can optimize intelligence-per-dollar, not just accuracy.
//
// Modes:
//   node run.mjs                 dispatch live via OpenRouter (needs key)
//   node run.mjs --simulate      full pipeline with canned responses (no network) — for CI/verification
//   node run.mjs --plan          print the round plan only, no dispatch (also the auto-fallback when no key)
//   node run.mjs --check         validate roster + tasks structure and exit
//   flags: --tasks N (round size, default 4) · --week N (rotation seed) · --date YYYY-MM-DD · --concurrency N (default 6)

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const ROSTER_PATH = join(__dirname, 'roster.json')
const TASKS_PATH = join(__dirname, 'tasks.json')
const LEADERBOARD_PATH = join(ROOT, 'data', 'model-arena', 'leaderboard.json')
const RUNS_DIR = join(ROOT, 'data', 'model-arena', 'runs')

const ELO_START = 1000
const ELO_K = 24

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`)
  return i !== -1 && argv[i + 1] ? argv[i + 1] : def
}

const MODE = flag('simulate') ? 'simulate' : flag('check') ? 'check' : flag('plan') ? 'plan' : 'live'
const ROUND_SIZE = parseInt(opt('tasks', '4'), 10)
const CONCURRENCY = Math.max(1, parseInt(opt('concurrency', '6'), 10))

function isoWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
}

const readJson = async (p) => JSON.parse(await readFile(p, 'utf8'))

// ── Bounded-concurrency pool (zero-dep; keeps the runner portable) ─────────
async function pool(items, worker, concurrency) {
  const results = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++
      results[idx] = await worker(items[idx], idx)
    }
  })
  await Promise.all(runners)
  return results
}

// ── Mechanical verifiers ──────────────────────────────────────────────────
const PUNCT_RE = /[.,!?;:'"`~@#$%^&*()\[\]{}<>\/\\|+=_-]/
const firstJsonObject = (s) => {
  const start = s.indexOf('{')
  if (start === -1) return null
  let depth = 0, inString = false, escaped = false
  for (let i = start; i < s.length; i++) {
    const c = s[i]
    if (escaped) { escaped = false; continue }
    if (c === '\\') { escaped = true; continue }
    if (c === '"') { inString = !inString; continue }
    if (inString) continue
    if (c === '{') depth++
    else if (c === '}' && --depth === 0) return s.slice(start, i + 1)
  }
  return null
}
const allStringsLowercase = (v) => {
  if (typeof v === 'string') return v === v.toLowerCase()
  if (Array.isArray(v)) return v.every(allStringsLowercase)
  if (v && typeof v === 'object') return Object.values(v).every(allStringsLowercase)
  return true
}

function verify(task, textRaw) {
  const text = (textRaw ?? '').trim()
  const v = task.verifier
  if (!text) return { pass: false, note: 'empty response' }
  switch (v.type) {
    case 'numeric': {
      const nums = text.match(/-?\d+/g)
      if (!nums) return { pass: false, note: 'no number in reply' }
      const last = parseInt(nums[nums.length - 1], 10)
      return { pass: last === v.expected, note: `final number=${last} expected=${v.expected}` }
    }
    case 'exact': {
      const norm = (s) => (v.case_insensitive ? s.toLowerCase() : s).replace(/\s+/g, ' ').trim()
      return { pass: norm(text) === norm(v.expected), note: `exact match` }
    }
    case 'contains': {
      const hay = v.case_insensitive ? text.toLowerCase() : text
      const needle = v.case_insensitive ? v.expected.toLowerCase() : v.expected
      return { pass: hay.includes(needle), note: `contains "${v.expected}"` }
    }
    case 'not_contains': {
      const hay = text.toLowerCase()
      const hit = (v.banned || []).find((b) => hay.includes(b.toLowerCase()))
      return { pass: !hit, note: hit ? `banned term "${hit}" present` : 'no banned terms' }
    }
    case 'regex':
      return { pass: new RegExp(v.pattern, v.flags || '').test(text), note: `regex ${v.pattern}` }
    case 'word_count': {
      const words = text.split(/\s+/).filter(Boolean)
      const okCount = words.length === v.count
      const okLower = !v.lowercase || words.every((w) => w === w.toLowerCase())
      const okPunct = !v.no_punct || !PUNCT_RE.test(text)
      return { pass: okCount && okLower && okPunct, note: `words=${words.length}/${v.count} lower=${okLower} punct-clean=${okPunct}` }
    }
    case 'json_schema': {
      const raw = firstJsonObject(text)
      if (!raw) return { pass: false, note: 'no JSON object found' }
      let obj
      try { obj = JSON.parse(raw) } catch { return { pass: false, note: 'JSON parse failed' } }
      const c = v.constraints || {}
      const hasKeys = (v.required || []).every((k) => k in obj)
      const okTags = c.tags_length == null || (Array.isArray(obj.tags) && obj.tags.length === c.tags_length)
      const okLower = !c.all_strings_lowercase || allStringsLowercase(obj)
      const okProse = !c.no_extra_prose || (text.startsWith('{') && text.endsWith('}'))
      return { pass: hasKeys && okTags && okLower && okProse, note: `keys=${hasKeys} tags=${okTags} lower=${okLower} clean=${okProse}` }
    }
    case 'judge':
      return { pass: null, note: 'needs cross-family judge' }
    default:
      return { pass: false, note: `unknown verifier ${v.type}` }
  }
}

// ── Simulated responses (exercise pass AND fail paths, no network) ─────────
function cannedResponse(task, correct) {
  const v = task.verifier
  if (!correct) {
    if (v.type === 'json_schema') return '{"Name": "X", "tags": ["a", "b"]}'
    if (v.type === 'word_count') return 'one two three four five six'
    if (v.type === 'numeric') return String((v.expected ?? 0) + 1)
    if (v.type === 'judge') return 'Our seamless platform unlocks synergies.'
    return 'incorrect placeholder answer'
  }
  switch (v.type) {
    case 'numeric': return String(v.expected)
    case 'contains': return v.expected
    case 'exact': return v.expected
    case 'word_count': return 'one two three four five'.split(' ').slice(0, v.count).join(' ')
    case 'json_schema': return '{"name": "starlight", "tags": ["telemetry", "receipts", "arena"]}'
    case 'not_contains': return 'a clean compliant answer'
    case 'judge': return 'It removes hype and states the concrete mechanism plainly.'
    default: return 'ok'
  }
}

// ── Gateway dispatch (OpenRouter) with retry + telemetry ───────────────────
async function dispatchOpenRouter(slug, prompt, key, base) {
  const started = Date.now()
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 60000)
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: slug,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 600,
        usage: { include: true }, // ask OpenRouter to attach cost + token usage
      }),
      signal: ctrl.signal,
    })
    const latencyMs = Date.now() - started
    if (!res.ok) return { error: `HTTP ${res.status}`, text: null, latencyMs, usage: null }
    const data = await res.json()
    const u = data?.usage || {}
    return {
      text: data?.choices?.[0]?.message?.content ?? '',
      error: null,
      latencyMs,
      usage: { promptTokens: u.prompt_tokens ?? null, completionTokens: u.completion_tokens ?? null, costUsd: u.cost ?? null },
    }
  } catch (e) {
    return { error: e.name === 'AbortError' ? 'timeout' : e.message, text: null, latencyMs: Date.now() - started, usage: null }
  } finally {
    clearTimeout(timer)
  }
}

const RETRYABLE = /timeout|HTTP 5\d\d|HTTP 429/
async function dispatchWithRetry(slug, prompt, key, base, tries = 3) {
  let last
  for (let attempt = 0; attempt < tries; attempt++) {
    last = await dispatchOpenRouter(slug, prompt, key, base)
    if (!last.error || !RETRYABLE.test(last.error)) return last
    if (attempt < tries - 1) await sleep(500 * 2 ** attempt) // 0.5s, 1s backoff
  }
  return last
}

// ── Elo update (pairwise, per task) ────────────────────────────────────────
const expected = (ra, rb) => 1 / (1 + 10 ** ((rb - ra) / 400))
function updateEloForTask(ratings, scored) {
  // scored: [{model, pass}] with pass ∈ {true,false} (judge/null already excluded)
  for (let i = 0; i < scored.length; i++) {
    for (let j = i + 1; j < scored.length; j++) {
      const a = scored[i], b = scored[j]
      const sa = a.pass === b.pass ? 0.5 : a.pass ? 1 : 0
      const ra = ratings[a.model] ?? ELO_START
      const rb = ratings[b.model] ?? ELO_START
      const ea = expected(ra, rb)
      ratings[a.model] = ra + ELO_K * (sa - ea)
      ratings[b.model] = rb + ELO_K * ((1 - sa) - (1 - ea))
    }
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
const roster = await readJson(ROSTER_PATH)
const taskBank = await readJson(TASKS_PATH)
const activeModels = roster.models.filter((m) => m.arena_active && m.openrouter_slug)
const activeTasks = taskBank.tasks.filter((t) => t.state === 'active')

if (MODE === 'check') {
  const errs = []
  if (activeModels.length < 2) errs.push(`only ${activeModels.length} arena-active models with slugs`)
  if (activeTasks.length < 1) errs.push('no active tasks')
  for (const t of taskBank.tasks) if (!t.verifier?.type) errs.push(`task ${t.id} missing verifier.type`)
  console.log(JSON.stringify({ mode: 'check', activeModels: activeModels.length, activeTasks: activeTasks.length, errors: errs }, null, 2))
  process.exit(errs.length ? 1 : 0)
}

// Rotate: pick ROUND_SIZE active tasks, seeded by week, preferring non-saturated.
const week = parseInt(opt('week', String(isoWeek())), 10)
const rotated = [...activeTasks].sort((a, b) => a.id.localeCompare(b.id))
const offset = week % Math.max(rotated.length, 1)
const roundTasks = [...rotated.slice(offset), ...rotated.slice(0, offset)].slice(0, ROUND_SIZE)

const date = opt('date', new Date().toISOString().slice(0, 10))
const key = process.env.OPENROUTER_API_KEY
const base = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
const effectiveMode = MODE === 'live' && !key ? 'plan' : MODE

const plan = {
  date, week, mode: effectiveMode, concurrency: CONCURRENCY,
  models: activeModels.map((m) => m.name),
  tasks: roundTasks.map((t) => ({ id: t.id, axis: t.axis, verifier: t.verifier.type })),
  judgeNeeded: roundTasks.some((t) => t.verifier.type === 'judge'),
}

if (effectiveMode === 'plan') {
  const reason = MODE === 'live' ? 'no OPENROUTER_API_KEY — plan only (degraded)' : 'plan mode'
  console.log(JSON.stringify({ ...plan, degraded: MODE === 'live', reason }, null, 2))
  process.exit(0)
}

// Dispatch every (task, model) pair with bounded concurrency.
const jobs = []
for (const task of roundTasks) for (const m of activeModels) jobs.push({ task, m })
const dispatched = await pool(jobs, async ({ task, m }, idx) => {
  let text, error = null, latencyMs = null, usage = null
  if (effectiveMode === 'simulate') {
    text = cannedResponse(task, activeModels.indexOf(m) % 2 === 0) // even models "pass"
    latencyMs = 200 + activeModels.indexOf(m) * 25
    usage = { promptTokens: 40, completionTokens: 20, costUsd: 0 }
  } else {
    const r = await dispatchWithRetry(m.openrouter_slug, task.prompt, key, base)
    text = r.text; error = r.error; latencyMs = r.latencyMs; usage = r.usage
  }
  const scored = error ? { pass: false, note: `dispatch error: ${error}` } : verify(task, text)
  return { taskId: task.id, axis: task.axis, model: m.name, org: m.org, pass: scored.pass, note: scored.note, error, chars: (text || '').length, latencyMs, usage }
}, CONCURRENCY)
const results = dispatched

// ── Leaderboard update (pass-rate + Elo + cost/latency telemetry) ──────────
let leaderboard
try { leaderboard = await readJson(LEADERBOARD_PATH) }
catch { leaderboard = { _description: 'Model Arena standings — pass-rate + pairwise Elo + cost/latency, updated by scripts/model-arena/run.mjs. Directional (small-n), not statistics.', rounds: 0, updated: null, models: {} } }

leaderboard.rounds = (leaderboard.rounds || 0) + 1
leaderboard.updated = date
leaderboard.models ||= {}

// Elo: seed ratings from prior leaderboard, update pairwise per task, persist.
const ratings = {}
for (const m of activeModels) ratings[m.name] = leaderboard.models[m.name]?.elo ?? ELO_START
for (const task of roundTasks) {
  const scored = results.filter((r) => r.taskId === task.id && r.pass !== null)
  if (scored.length >= 2) updateEloForTask(ratings, scored)
}

for (const m of activeModels) {
  const mine = results.filter((r) => r.model === m.name && r.pass !== null)
  const passes = mine.filter((r) => r.pass).length
  const all = results.filter((r) => r.model === m.name)
  const lat = all.map((r) => r.latencyMs).filter((x) => x != null)
  const tokens = all.reduce((s, r) => s + (r.usage?.completionTokens || 0) + (r.usage?.promptTokens || 0), 0)
  const cost = all.reduce((s, r) => s + (r.usage?.costUsd || 0), 0)
  const rec = leaderboard.models[m.name] || { org: m.org, elo: ELO_START, rounds: 0, scored: 0, passes: 0, passRate: 0, totalTokens: 0, totalCostUsd: 0, byAxis: {} }
  rec.org = m.org
  rec.elo = Math.round(ratings[m.name])
  rec.rounds += 1
  rec.scored += mine.length
  rec.passes += passes
  rec.passRate = rec.scored ? +(rec.passes / rec.scored).toFixed(3) : 0
  rec.totalTokens = (rec.totalTokens || 0) + tokens
  rec.totalCostUsd = +((rec.totalCostUsd || 0) + cost).toFixed(4)
  if (lat.length) rec.lastAvgLatencyMs = Math.round(lat.reduce((a, b) => a + b, 0) / lat.length)
  rec.byAxis ||= {}
  for (const r of mine) {
    const ax = (rec.byAxis[r.axis] ||= { scored: 0, passes: 0 })
    ax.scored += 1; ax.passes += r.pass ? 1 : 0
  }
  leaderboard.models[m.name] = rec
}

// ── Learning loop: per-task saturation ─────────────────────────────────────
const learnings = []
for (const task of roundTasks) {
  const scored = results.filter((r) => r.taskId === task.id && r.pass !== null)
  if (!scored.length) continue
  const passRate = +(scored.filter((r) => r.pass).length / scored.length).toFixed(3)
  const bankTask = taskBank.tasks.find((t) => t.id === task.id)
  bankTask.history.push({ date, passRate })
  const recent = bankTask.history.slice(-taskBank.saturation_rounds)
  if (recent.length >= taskBank.saturation_rounds && recent.every((h) => h.passRate >= taskBank.saturation_threshold)) {
    bankTask.state = 'saturated'
    learnings.push(`Task "${task.id}" (${task.axis}) SATURATED — field passes at ≥${taskBank.saturation_threshold} across ${taskBank.saturation_rounds} rounds. Rotate out; harden this axis with a tougher task.`)
  }
}
taskBank._updated = date
await writeFile(TASKS_PATH, JSON.stringify(taskBank, null, 2) + '\n')

// ── Receipt (durable output) ───────────────────────────────────────────────
await mkdir(RUNS_DIR, { recursive: true })
const rankedByElo = Object.entries(leaderboard.models)
  .filter(([, r]) => r.rounds > 0)
  .sort(([, a], [, b]) => (b.elo ?? 0) - (a.elo ?? 0))
const receipt = {
  date, week, mode: effectiveMode, concurrency: CONCURRENCY,
  models: activeModels.map((m) => ({ name: m.name, org: m.org, slug: m.openrouter_slug })),
  tasks: roundTasks.map((t) => ({ id: t.id, axis: t.axis, verifier: t.verifier.type, prompt: t.prompt })),
  results,
  standings: rankedByElo.map(([name, r]) => ({ name, elo: r.elo, passRate: r.passRate, totalTokens: r.totalTokens, totalCostUsd: r.totalCostUsd, lastAvgLatencyMs: r.lastAvgLatencyMs })),
  learnings,
  leaderByElo: rankedByElo[0]?.[0] ?? null,
  caveats: [
    'n=1 per (task,model) per round — directional signal, not statistics.',
    'Elo is seeded from prior rounds and updated pairwise per task; early ratings are volatile until several rounds accumulate.',
    'Mechanical verifiers score objective tasks; judge tasks are scored cross-family in the workflow layer and merged into the receipt there.',
    'openrouter_slug values must be verified against openrouter.ai/models; a bad slug is recorded as a dispatch error, not a fail of the model.',
    'Cost/token telemetry depends on the gateway returning usage; it is best-effort and 0 when absent (e.g. simulate mode).',
    'This measures model-via-OpenRouter (temperature 0), not model-in-Claude-Code-harness. The workflow keeps a separate in-harness Claude cross-check.',
  ],
}
const receiptPath = join(RUNS_DIR, `${date}.json`)
await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n')
await mkdir(dirname(LEADERBOARD_PATH), { recursive: true })
await writeFile(LEADERBOARD_PATH, JSON.stringify(leaderboard, null, 2) + '\n')

console.log(JSON.stringify({
  ok: true, mode: effectiveMode, date,
  modelsRun: activeModels.length, tasksRun: roundTasks.length,
  scored: results.filter((r) => r.pass !== null).length,
  judgeNeeded: plan.judgeNeeded,
  leader: receipt.leaderByElo,
  learnings,
  receipt: `data/model-arena/runs/${date}.json`,
  leaderboard: 'data/model-arena/leaderboard.json',
}, null, 2))
