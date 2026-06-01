export const meta = {
  name: 'pr-review-multi-perspective',
  description: 'Multi-perspective PR review with adversarial verification. Pipeline: 6 dimensions reviewed in parallel → each finding adversarially verified by an independent agent → synthesis. Only confirmed findings surface.',
  whenToUse: 'Before merging any non-trivial PR. Skip for typo fixes or single-line config tweaks. Especially valuable for shared components, API surfaces, or anything user-facing.',
  phases: [
    { title: 'Discover', detail: 'parse diff' },
    { title: 'Review', detail: '6 parallel lens reviews' },
    { title: 'Verify', detail: 'adversarial check per finding' },
    { title: 'Synthesize', detail: 'confirmed findings only' },
  ],
  acos: {
    tier: 'L99',
    cadence: 'per-pr',
    portable: true,
    composes: [],
    composedBy: ['release-checklist'],
    estimatedCost: { min: 80000, max: 350000 },
  },
}

const DIFF_SCHEMA = {
  type: 'object',
  required: ['files', 'summary'],
  properties: {
    files: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, additions: { type: 'integer' }, deletions: { type: 'integer' } } } },
    summary: { type: 'string' },
  },
}

const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['dimension', 'findings'],
  properties: {
    dimension: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'severity'],
        properties: {
          title: { type: 'string' },
          severity: { enum: ['low', 'med', 'high', 'critical'] },
          file: { type: 'string' },
          line: { type: 'integer' },
          evidence: { type: 'string' },
          suggestion: { type: 'string' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['refuted', 'reason'],
  properties: {
    refuted: { type: 'boolean' },
    reason: { type: 'string' },
    confidence: { type: 'integer', minimum: 1, maximum: 10 },
  },
}

const dimensions = [
  { key: 'correctness', prompt: 'logic bugs, edge cases, null handling, off-by-one, race conditions' },
  { key: 'security', prompt: 'OWASP top 10, secret leaks, auth bypass, input validation, SSRF, XSS, SQLi' },
  { key: 'performance', prompt: 'N+1 queries, render-blocking ops, bundle bloat, memory leaks, unbounded loops' },
  { key: 'a11y', prompt: 'WCAG 2.2 keyboard nav, ARIA, color contrast, screen-reader paths, focus traps' },
  { key: 'tests', prompt: 'missing coverage on new logic, brittle assertions, slow tests, isolation issues' },
  { key: 'maintainability', prompt: 'complexity hotspots, naming, duplication, dead code, leaky abstractions' },
]

const baseRef = args?.baseRef ?? 'main'

phase('Discover')
const diff = await agent(
  `Get the PR diff: run \`git diff ${baseRef}...HEAD --stat\` then \`git diff ${baseRef}...HEAD --name-only\`. ` +
  `Return file list with line counts and one-sentence summary of the change.`,
  { schema: DIFF_SCHEMA, model: 'haiku' }
)

log(`Diff: ${diff.files?.length ?? 0} files changed`)
if (!diff.files?.length) {
  return { skipped: true, reason: 'empty diff', baseRef }
}

phase('Review')
const reviewed = await pipeline(
  dimensions,
  d => agent(
    `Review the PR through the ${d.key} lens. Focus on: ${d.prompt}. ` +
    `Files changed: ${JSON.stringify(diff.files)}. ` +
    `Read each changed file. Return prioritized findings with file:line refs. Set dimension="${d.key}".`,
    { label: `review:${d.key}`, phase: 'Review', schema: FINDINGS_SCHEMA, model: 'sonnet' }
  ),
  (review, d) => parallel((review?.findings ?? []).map(f => () =>
    agent(
      `Adversarially verify this finding: ${JSON.stringify(f)}. ` +
      `Try to REFUTE it. Default refuted=true if you cannot independently confirm the issue. ` +
      `Read the actual code at ${f.file ?? 'no path given'} to verify.`,
      { label: `verify:${d.key}:${(f.file ?? 'general').slice(0, 24)}`, phase: 'Verify', schema: VERDICT_SCHEMA, model: 'sonnet' }
    ).then(v => ({ ...f, dimension: d.key, verdict: v }))
  ))
)

phase('Synthesize')
const all = reviewed.flat().filter(Boolean)
const confirmed = all.filter(f => f.verdict?.refuted === false)
const critical = confirmed.filter(f => f.severity === 'critical')
const high = confirmed.filter(f => f.severity === 'high')

log(`${all.length} candidates · ${confirmed.length} confirmed (${critical.length} crit, ${high.length} high) · ${all.length - confirmed.length} refuted`)

const sevOrder = { critical: 0, high: 1, med: 2, low: 3 }
return {
  baseRef,
  totalReviewed: all.length,
  confirmed: confirmed.length,
  refuted: all.length - confirmed.length,
  critical: critical.length,
  high: high.length,
  mergeBlocking: critical.length + high.length > 0,
  findings: confirmed.sort((a, b) => (sevOrder[a.severity] ?? 99) - (sevOrder[b.severity] ?? 99)),
}
