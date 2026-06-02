export const meta = {
  name: 'repo-onboarding',
  description: 'Cold-start understanding of a repo. Parallel: architecture, data flow, dependencies, conventions, recent activity, gotchas. Synthesize into operating brief with first-task recommendations.',
  whenToUse: 'When joining a new repo, returning after a long absence, or onboarding a teammate. Also useful when an AI agent encounters an unfamiliar codebase.',
  phases: [
    { title: 'Scan', detail: '6 parallel lens scans' },
    { title: 'Synthesize', detail: 'operating brief' },
  ],
  acos: {
    tier: 'L99',
    cadence: 'on-demand',
    portable: true,
    composes: [],
    composedBy: [],
    estimatedCost: { min: 120000, max: 200000, calibratedRuns: 1, lastRun: { totalTokens: 395403, agentCount: 7, durationMs: 278571 } },
  },
}

const SCAN_SCHEMA = {
  type: 'object',
  required: ['lens', 'findings'],
  properties: {
    lens: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['topic', 'detail'],
        properties: {
          topic: { type: 'string' },
          detail: { type: 'string' },
          file: { type: 'string' },
        },
      },
    },
  },
}

const lenses = [
  { key: 'architecture', prompt: 'Layer model, key directories, framework (Next/Express/Django/Rails/etc.), routing, state management, API surface boundaries' },
  { key: 'data-flow', prompt: 'Where data enters (API/forms/uploads/webhooks), transforms, persists (DB/cache/files), exits (responses/events/exports)' },
  { key: 'dependencies', prompt: 'Top 10 prod deps from package.json/pyproject.toml/Cargo.toml/go.mod, build tools, test framework, lint setup' },
  { key: 'conventions', prompt: 'Naming patterns, file structure, commit message style, PR rules, branching strategy. Read .github/, CONTRIBUTING.md, recent merged PRs' },
  { key: 'recent-activity', prompt: 'Last 30 days via git log: hot files (most-changed), active authors, focus areas, open issues/PRs. Use git log --since=30.days' },
  { key: 'gotchas', prompt: 'TODO/FIXME/HACK/XXX comments, deprecated patterns flagged in code, known weirdness in README/CONTRIBUTING/docs' },
]

phase('Scan')
const scans = await parallel(lenses.map(l => () =>
  agent(
    `Scan this repo through the lens: "${l.key}". Focus: ${l.prompt}. ` +
    `Return concise findings with file paths as evidence. Set lens="${l.key}".`,
    { label: l.key, phase: 'Scan', schema: SCAN_SCHEMA, model: 'sonnet' }
  )
))

const valid = scans.filter(Boolean)
log(`${valid.length}/${lenses.length} lens scans returned`)

phase('Synthesize')
const brief = await agent(
  `Compose an operating brief from ${valid.length} lens scans. ` +
  `Markdown sections: ## Architecture · ## Data Flow · ## Stack · ## Conventions · ## Recent Activity · ## Gotchas · ## First-Task Recommendations (3 suggested PRs for someone new). ` +
  `Be concrete with file paths. Avoid generic advice. ` +
  `Scans: ${JSON.stringify(valid)}.`,
  { phase: 'Synthesize', model: 'opus' }
)

return { scansCompleted: valid.length, brief }
