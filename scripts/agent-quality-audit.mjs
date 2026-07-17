#!/usr/bin/env node
/**
 * Deterministic executor for meta-agent-quality-auditor (.claude/agents/meta-agent-quality-auditor.md).
 * Zero LLM calls — pure regex / parse / file-existence, per the agent's own spec.
 *
 * The spec's declared dependencies (lib/voice/frankx-voice.ts, data/acos/agents.ts,
 * lib/acos/memory.mjs) don't exist in this repo yet. Checks 7/8 use the word lists
 * inlined in the spec directly rather than importing a module that isn't there.
 * Memory recall/persist (spec step 0 and step 6) is skipped — no memory.mjs to call —
 * and the catalog cross-reference (data/acos/agents.ts) is skipped as optional.
 */
import fs from 'node:fs'
import path from 'node:path'

const AGENTS_DIR = path.join(process.cwd(), '.claude', 'agents')
const EXCLUDE = new Set(['CLAUDE.md', 'README.md', 'PRODUCT_TEAMS.md'])
const FIXTURES_DIR = path.join(process.cwd(), 'tests', 'fixtures')

const DEFINITE_TELLS = [
  'delve', 'dive into', 'deep dive', "it's worth noting", 'certainly',
  'absolutely', 'in conclusion', 'in summary', 'navigate the landscape',
  'paradigm shift', 'world-class', 'best-in-class', 'cutting-edge',
  'bleeding-edge', 'seamless', 'seamlessly', 'effortless', 'effortlessly',
  'thought leader', 'synergy', 'synergies', 'innovative solution',
]

const ARCANEA_QUARANTINE = [
  'Guardian', 'Guardians', 'Gate', 'Gates', 'Realm', 'Realms', 'Seeker', 'Seekers',
  'Shinkami', 'Luminor', 'Arcanean', 'Mystic', 'Mystics', 'Sage', 'Sages',
  'Ascension', 'Awakened One',
]

const TEMPLATE_V2_SECTIONS = [
  'Purpose', 'Triggers', 'Inputs', 'Process', 'Outputs',
  'Integration', 'Smoke eval', 'Anti-patterns', 'Model choice', 'Voice check',
]

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  const block = m[1]
  const lines = block.split(/\r?\n/)
  const fields = {}
  let currentKey = null
  const listBuf = []
  const flushList = () => {
    if (currentKey && listBuf.length) fields[currentKey] = listBuf.join(', ')
    listBuf.length = 0
  }
  for (const line of lines) {
    const listItem = line.match(/^\s+-\s+(.+)$/)
    if (listItem && currentKey) {
      listBuf.push(listItem[1].trim())
      continue
    }
    flushList()
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (kv) {
      currentKey = kv[1]
      const value = kv[2].trim()
      if (value) fields[currentKey] = value
      // else: value is empty, may be a multi-line YAML list on following lines — leave
      // unset until flushList() collects it, so a genuinely-empty scalar (rare) still
      // reads as missing rather than silently passing.
    } else {
      currentKey = null
    }
  }
  flushList()
  return { fields, body: raw.slice(m[0].length) }
}

function stripCodeBlocks(text) {
  return text.replace(/```[\s\S]*?```/g, '')
}

// Brand-gate / voice-auditor agents necessarily document the banned-word list
// in their own spec (e.g. "## 10. Voice check — No Arcanean mythology. No
// Guardians, Gates, Realms, Seekers."). That's the agent stating the rule, not
// violating it. Strip the Voice-check section and any line that reads as a
// rule-definition/negation about the terms themselves, so only genuine usage
// (e.g. "Luminor Router:" used as an actual functional heading) still trips
// the check. This is a heuristic, not perfect — spot-checked against the
// false positives found in the first raw run (9 meta-* agents + 2 brand-gate
// agents, all via their Voice-check / rule-definition sections).
function stripSelfReferentialVoiceText(text) {
  const noVoiceSection = text.replace(/##\s*(\d+\.?\s*)?Voice check[\s\S]*?(?=\n##\s|\n$)/i, '')
  const ruleDefinitionLine = /^\s*[-*]?\s*(no\s|never\s|does not\s|hard fail|scan\b|quarantine|banned|stays in|check\s*\d+\s*[—-])/i
  return noVoiceSection
    .split(/\r?\n/)
    .filter((line) => !ruleDefinitionLine.test(line))
    .join('\n')
}

function check1_frontmatter(fm) {
  if (!fm) return { pass: false, detail: 'no frontmatter block found' }
  const { name, description, tools, model } = fm.fields
  if (!name || !description || !tools || !model) {
    return { pass: false, detail: 'missing one of name/description/tools/model' }
  }
  if (!['haiku', 'sonnet', 'opus'].includes(model)) {
    return { pass: false, detail: `model "${model}" not in haiku/sonnet/opus` }
  }
  return { pass: true }
}

function check2_triggers(fm) {
  const desc = fm?.fields?.description || ''
  if (desc.length < 50) return { pass: false, detail: `description ${desc.length} chars, need >=50` }
  const patterns = [/auto-invoke/i, /auto-fire/i, /use when/i, /trigger/i, /\bsays\b/i, /\w+\/\*\*/, /when \d+\s*[≥>=]/i]
  const hit = patterns.some((p) => p.test(desc))
  return hit ? { pass: true } : { pass: false, detail: 'no trigger-pattern language found in description' }
}

function check3_toolsMinimal(fm, body) {
  const toolsStr = fm?.fields?.tools || ''
  const declared = toolsStr.split(',').map((t) => t.trim()).filter(Boolean)
  if (declared.length === 0) return { pass: false, detail: 'no tools declared' }
  const processMatch = body.match(/##\s*4\.?\s*Process([\s\S]*?)(?=\n##\s|\n$)/i)
  const processText = processMatch ? processMatch[1] : body
  const unreferenced = declared.filter((t) => !new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(processText))
  return unreferenced.length === 0
    ? { pass: true }
    : { pass: false, detail: `declared-but-unreferenced in Process: ${unreferenced.join(', ')}` }
}

function check4_sections(body) {
  const found = TEMPLATE_V2_SECTIONS.filter((s) => new RegExp(`##\\s*(\\d+\\.?\\s*)?${s}`, 'i').test(body))
  return found.length >= 8
    ? { pass: true }
    : { pass: false, detail: `only ${found.length}/10 sections found (need >=8): missing ${TEMPLATE_V2_SECTIONS.filter((s) => !found.includes(s)).join(', ')}` }
}

function check5_memoryContract(body) {
  const processMatch = body.match(/##\s*4\.?\s*Process([\s\S]*?)(?=\n##\s|\n$)/i)
  const processText = processMatch ? processMatch[1] : body
  const hasRecall = /memory\.mjs\s+recall/i.test(processText)
  const hasRemember = /memory\.mjs\s+remember/i.test(processText)
  return hasRecall && hasRemember
    ? { pass: true }
    : { pass: false, detail: `recall=${hasRecall} remember=${hasRemember}` }
}

function check6_antiPatterns(body) {
  const m = body.match(/##\s*(\d+\.?\s*)?Anti-patterns([\s\S]*?)(?=\n##\s|\n$)/i)
  if (!m) return { pass: false, detail: 'no Anti-patterns section found' }
  const bullets = m[2].split(/\r?\n/).map((l) => l.trim()).filter((l) => /^[-*]\s+/.test(l))
  const negated = bullets.filter((b) => /^[-*]\s+(does not|never|refuses to|doesn't)/i.test(b))
  return negated.length >= 4
    ? { pass: true }
    : { pass: false, detail: `${negated.length}/${bullets.length} bullets are negation-form, need >=4 negated` }
}

function check7_brandVoice(raw, fm) {
  const bodyNoFrontmatter = fm ? raw.slice(raw.indexOf('---', 3) + 3) : raw
  const clean = stripSelfReferentialVoiceText(stripCodeBlocks(bodyNoFrontmatter)).toLowerCase()
  const hits = DEFINITE_TELLS.filter((phrase) => clean.includes(phrase.toLowerCase()))
  return hits.length === 0 ? { pass: true } : { pass: false, detail: `banned phrases: ${hits.join(', ')}` }
}

function check8_arcaneaLeak(raw, fm) {
  const name = fm?.fields?.name || ''
  if (name.startsWith('arcanea-')) return { pass: true }
  const bodyNoFrontmatter = fm ? raw.slice(raw.indexOf('---', 3) + 3) : raw
  const clean = stripSelfReferentialVoiceText(stripCodeBlocks(bodyNoFrontmatter))
  const hits = ARCANEA_QUARANTINE.filter((word) => new RegExp(`\\b${word}\\b`).test(clean))
  return hits.length === 0 ? { pass: true } : { pass: false, detail: `quarantined terms: ${hits.join(', ')}` }
}

function check9_smokeFixture(fm, fixturesDir) {
  const ref = fm?.fields?.name
  if (!ref) return { pass: false, detail: 'no name in frontmatter to resolve fixture path' }
  const fixturePath = path.join(fixturesDir, ref, 'smoke.mjs')
  return fs.existsSync(fixturePath) ? { pass: true } : { pass: false, detail: `missing tests/fixtures/${ref}/smoke.mjs` }
}

function auditFile(filename, agentsDir, fixturesDir) {
  const filePath = path.join(agentsDir, filename)
  const raw = fs.readFileSync(filePath, 'utf8')
  const fm = parseFrontmatter(raw)
  const body = fm ? fm.body : raw

  const checks = {
    1: check1_frontmatter(fm),
    2: check2_triggers(fm),
    3: check3_toolsMinimal(fm, body),
    4: check4_sections(body),
    5: check5_memoryContract(body),
    6: check6_antiPatterns(body),
    7: check7_brandVoice(raw, fm),
    8: check8_arcaneaLeak(raw, fm),
    9: check9_smokeFixture(fm, fixturesDir),
  }

  const score = Object.values(checks).filter((c) => c.pass).length
  const disqualified = !checks[1].pass || !checks[7].pass || !checks[8].pass
  const fails = Object.entries(checks).filter(([, c]) => !c.pass).map(([n, c]) => `#${n}:${c.detail}`)

  return {
    agent: fm?.fields?.name || filename.replace(/\.md$/, ''),
    file: filename,
    score,
    disqualified,
    checks,
    fails,
  }
}

// Pure core: audits a directory of agent .md files against a fixtures directory.
// No file writes, no process.cwd() dependency — safe to import from a smoke test
// against a fixture directory without polluting real docs/acos or .frankx reports.
export function auditDirectory(agentsDir, fixturesDir, excludeSet = EXCLUDE) {
  const files = fs.readdirSync(agentsDir)
    .filter((f) => f.endsWith('.md') && !excludeSet.has(f))
    .sort()

  const results = files.map((f) => auditFile(f, agentsDir, fixturesDir))
  const bucket = (s) => (s <= 4 ? '0-4' : s <= 6 ? '5-6' : s <= 8 ? '7-8' : '9')
  const distribution = { '0-4': 0, '5-6': 0, '7-8': 0, '9': 0 }
  results.forEach((r) => distribution[bucket(r.score)]++)

  const disqualifiedList = results.filter((r) => r.disqualified)
  const meanScore = results.length ? results.reduce((a, r) => a + r.score, 0) / results.length : 0

  const priorityOrder = [...results].sort((a, b) => {
    const rank = (r) => (r.disqualified ? 0 : r.score < 5 ? 1 : r.score <= 6 ? 2 : r.score <= 8 ? 3 : 4)
    return rank(a) - rank(b) || a.score - b.score
  })

  return { results, distribution, disqualifiedList, meanScore, priorityOrder, l99: results.filter((r) => r.score === 9) }
}

function main() {
  const { results, distribution, disqualifiedList, meanScore, priorityOrder, l99 } =
    auditDirectory(AGENTS_DIR, FIXTURES_DIR)

  const date = new Date().toISOString().slice(0, 10)
  const lines = []
  lines.push(`ACOS Agent Quality Audit — ${date}`)
  lines.push('')
  lines.push('Summary')
  lines.push(`- Audited:        ${results.length} files`)
  lines.push(`- Disqualified:   ${disqualifiedList.length} (existential check fail — must fix before next ship)`)
  lines.push(`- Score <=4:      ${distribution['0-4']}`)
  lines.push(`- Score 5-6:      ${distribution['5-6']}`)
  lines.push(`- Score 7-8:      ${distribution['7-8']}`)
  lines.push(`- Score 9:        ${distribution['9']}`)
  lines.push(`- Mean score:     ${meanScore.toFixed(2)}/9`)
  lines.push('')
  lines.push('Disqualified (must fix first):')
  if (disqualifiedList.length === 0) lines.push('  (none)')
  disqualifiedList.forEach((r) => lines.push(`  • ${r.agent}  [${r.fails.join('; ')}]`))
  lines.push('')
  lines.push('Priority queue (score ascending, disqualified first):')
  priorityOrder.filter((r) => r.score < 9 || r.disqualified).forEach((r) => {
    lines.push(`  ${r.score}/9  ${r.agent}${r.disqualified ? '  [DISQUALIFIED]' : ''}  [fails: ${r.fails.join('; ') || 'none'}]`)
  })
  lines.push('')
  lines.push('L99-ready (score 9/9):')
  if (l99.length === 0) lines.push('  (none yet)')
  l99.forEach((r) => lines.push(`  • ${r.agent}`))
  lines.push('')
  lines.push('Note: check #9 (smoke fixture) fails for every agent — tests/fixtures/ does not exist in this repo yet.')
  lines.push('Note: checks #5 (memory contract) reflect whether memory.mjs calls are documented in Process — lib/acos/memory.mjs itself does not exist yet, so these are aspirational references, not verified-functional ones.')

  const report = lines.join('\n')
  console.log(report)

  const json = {
    status: 'ready',
    agent: 'meta-agent-quality-auditor',
    outcome: {
      audited: results.length,
      disqualified: disqualifiedList.length,
      score_distribution: distribution,
      mean_score: Number(meanScore.toFixed(3)),
      l99_ready_count: l99.length,
      report_path: `docs/acos/agent-quality-audit-${date}.md`,
    },
    results,
  }

  fs.mkdirSync(path.join(process.cwd(), 'docs', 'acos'), { recursive: true })
  fs.mkdirSync(path.join(process.cwd(), '.frankx', 'machine'), { recursive: true })
  fs.writeFileSync(path.join(process.cwd(), 'docs', 'acos', `agent-quality-audit-${date}.md`), report + '\n')
  fs.writeFileSync(path.join(process.cwd(), '.frankx', 'machine', `agent-quality-audit-${date}.json`), JSON.stringify(json, null, 2) + '\n')

  console.log('\n' + JSON.stringify(json))
}

// Only run the CLI (which writes real report files) when this file is executed
// directly — e.g. `npm run agents:quality`. When imported for auditDirectory()
// (the smoke test does this), importing must not trigger the full CLI run.
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
