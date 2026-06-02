export const meta = {
  name: 'tech-debt-triage',
  description: 'Code-smell scan + priority ranking. Parallel: complexity, duplication, outdated patterns, test gaps, doc gaps. Output: ranked findings in 3 buckets + concrete fix proposals for top items.',
  whenToUse: 'Quarterly per repo, or when planning a refactor sprint. Helps prioritize what to actually fix vs. defer.',
  phases: [
    { title: 'Scan', detail: '5 parallel lens scans' },
    { title: 'Rank', detail: 'impact × effort buckets' },
    { title: 'Propose', detail: 'concrete fixes for top items' },
  ],
  acos: {
    tier: 'L99',
    cadence: 'quarterly',
    portable: true,
    composes: [],
    composedBy: [],
    estimatedCost: { min: 100000, max: 350000 },
  },
}

const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['lens', 'findings'],
  properties: {
    lens: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'severity'],
        properties: {
          title: { type: 'string' },
          severity: { enum: ['low', 'med', 'high'] },
          file: { type: 'string' },
          line: { type: 'integer' },
          evidence: { type: 'string' },
        },
      },
    },
  },
}

const RANKED_SCHEMA = {
  type: 'object',
  required: ['doNow', 'planSprint', 'defer'],
  properties: {
    doNow: { type: 'array', items: { type: 'object' } },
    planSprint: { type: 'array', items: { type: 'object' } },
    defer: { type: 'array', items: { type: 'object' } },
  },
}

const PROPOSAL_SCHEMA = {
  type: 'object',
  required: ['item', 'approach'],
  properties: {
    item: { type: 'object' },
    approach: { type: 'string' },
    beforeSketch: { type: 'string' },
    afterSketch: { type: 'string' },
    effortEstimate: { type: 'string' },
    risk: { enum: ['low', 'med', 'high'] },
  },
}

const lenses = [
  { key: 'complexity', prompt: 'Cyclomatic complexity hotspots, deeply nested code, god functions (>100 lines), god classes (>500 lines)' },
  { key: 'duplication', prompt: 'Copy-pasted blocks across files, near-duplicate logic, repeated validation rules, parallel branching that could share code' },
  { key: 'outdated', prompt: 'Deprecated APIs, old idioms (callback-hell vs async/await, class components vs hooks), TODO/FIXME flags older than 6 months' },
  { key: 'test-gaps', prompt: 'Untested critical paths (auth, payments, data integrity), low coverage on recently-changed files, missing integration tests' },
  { key: 'doc-gaps', prompt: 'Missing README sections (setup/deploy/architecture), undocumented public APIs, stale comments contradicting code, missing CONTRIBUTING' },
]

phase('Scan')
const scans = await parallel(lenses.map(l => () =>
  agent(
    `Scan repo for tech debt through the lens: "${l.key}". Focus: ${l.prompt}. ` +
    `Return ranked findings with file:line refs and concrete evidence. Set lens="${l.key}".`,
    { label: l.key, phase: 'Scan', schema: FINDINGS_SCHEMA, model: 'sonnet' }
  )
))

const valid = scans.filter(Boolean)
const totalFindings = valid.reduce((sum, s) => sum + (s.findings?.length ?? 0), 0)
log(`${totalFindings} findings across ${valid.length} lenses`)

phase('Rank')
const ranked = await agent(
  `Rank tech debt findings by impact × effort. Output 3 buckets: ` +
  `doNow (high impact, low effort — under 4 hours), planSprint (high impact, medium-high effort — needs sprint planning), defer (low impact OR speculative). ` +
  `Each item: title, dimension, file:line, impact summary, effort estimate. ` +
  `Findings: ${JSON.stringify(valid)}.`,
  { phase: 'Rank', schema: RANKED_SCHEMA, model: 'opus' }
)

phase('Propose')
const topItems = (ranked.doNow ?? []).slice(0, 5)
const proposals = await parallel(topItems.map(item => () =>
  agent(
    `Propose a concrete fix for tech debt item: ${JSON.stringify(item)}. ` +
    `Include: approach (1 paragraph), before sketch (current code), after sketch (proposed code), effort estimate (hours), risk assessment. ` +
    `Read the actual file at ${item.file ?? 'unknown'} to anchor the proposal.`,
    { label: `propose:${(item.title ?? 'item').slice(0, 24)}`, phase: 'Propose', schema: PROPOSAL_SCHEMA, model: 'sonnet' }
  )
))

return {
  totalFindings,
  buckets: {
    doNow: ranked.doNow?.length ?? 0,
    planSprint: ranked.planSprint?.length ?? 0,
    defer: ranked.defer?.length ?? 0,
  },
  ranked,
  proposals: proposals.filter(Boolean),
}
