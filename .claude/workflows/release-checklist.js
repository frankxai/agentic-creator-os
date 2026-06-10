export const meta = {
  name: 'release-checklist',
  description: 'Pre-release validation gate. Parallel: tests, changelog, version bumps, migration docs, rollback plan + composes dependency-audit. Optional pr-review-multi-perspective sub-call. Pass/fail verdict on whether to ship.',
  whenToUse: 'Before tagging a release, publishing a package, or cutting a release branch. Any repo with semver discipline benefits.',
  phases: [
    { title: 'Validate', detail: '5 parallel gates + deps subworkflow' },
    { title: 'Gate', detail: 'pass/fail verdict' },
  ],
  acos: {
    tier: 'L99',
    cadence: 'per-release',
    portable: true,
    composes: ['dependency-audit', 'pr-review-multi-perspective'],
    composedBy: [],
    estimatedCost: { min: 100000, max: 400000 },
  },
}

const GATE_SCHEMA = {
  type: 'object',
  required: ['gate', 'verdict', 'summary'],
  properties: {
    gate: { type: 'string' },
    verdict: { enum: ['pass', 'warn', 'fail'] },
    summary: { type: 'string' },
    blockers: { type: 'array', items: { type: 'string' } },
  },
}

const { version, fromTag = 'previous-tag', runPrReview = false } = args ?? {}

phase('Validate')
const gates = await parallel([
  () => agent(
    `Run the test suite (auto-detect: npm test / pnpm test / pytest / cargo test / go test). ` +
    `Report pass/fail + flaky-test list + coverage delta on files changed since ${fromTag}. Set gate="tests".`,
    { label: 'tests', phase: 'Validate', schema: GATE_SCHEMA, model: 'sonnet' }
  ),
  () => agent(
    `Check CHANGELOG.md (or equivalent) is updated for version ${version ?? '<unspecified>'}. ` +
    `Verify all PRs merged since ${fromTag} are mentioned. Set gate="changelog".`,
    { label: 'changelog', phase: 'Validate', schema: GATE_SCHEMA, model: 'sonnet' }
  ),
  () => agent(
    `Verify version consistency: package.json (+ lockfiles), version constants in source, README badges, docs site config. ` +
    `All should match ${version ?? '<derive from git tag intent>'}. Set gate="version".`,
    { label: 'version', phase: 'Validate', schema: GATE_SCHEMA, model: 'sonnet' }
  ),
  () => agent(
    `If breaking changes exist since ${fromTag}, verify migration guide at docs/migrations/ or MIGRATION.md. ` +
    `If no breaking changes, pass with note. Set gate="migration".`,
    { label: 'migration', phase: 'Validate', schema: GATE_SCHEMA, model: 'sonnet' }
  ),
  () => agent(
    `Verify rollback procedure. Are there destructive DB migrations? Irreversible config changes? Document the rollback steps. Set gate="rollback".`,
    { label: 'rollback', phase: 'Validate', schema: GATE_SCHEMA, model: 'sonnet' }
  ),
])

let depsAudit
try {
  depsAudit = await workflow('dependency-audit', { mode: 'release' })
} catch (e) {
  depsAudit = { error: e.message, criticalCount: 0, highCount: 0 }
}

let prReview = null
if (runPrReview) {
  try {
    prReview = await workflow('pr-review-multi-perspective', { baseRef: fromTag })
  } catch (e) {
    prReview = { error: e.message, mergeBlocking: false, confirmed: 0, critical: 0 }
  }
}

phase('Gate')
const allGates = [
  ...gates.filter(Boolean),
  {
    gate: 'dependencies',
    verdict: depsAudit.error ? 'warn' : ((depsAudit.criticalCount ?? 0) > 0 ? 'fail' : 'pass'),
    summary: depsAudit.error ?? `${depsAudit.criticalCount ?? 0} critical, ${depsAudit.highCount ?? 0} high`,
  },
]

if (prReview) {
  allGates.push({
    gate: 'pr-review',
    verdict: prReview.error ? 'warn' : (prReview.mergeBlocking ? 'fail' : 'pass'),
    summary: prReview.error ?? `${prReview.confirmed ?? 0} findings, ${prReview.critical ?? 0} critical`,
  })
}

const fails = allGates.filter(g => g.verdict === 'fail')
const warns = allGates.filter(g => g.verdict === 'warn')
const verdict = fails.length ? 'fail' : warns.length ? 'warn' : 'pass'

log(`Release verdict: ${verdict.toUpperCase()} — ${fails.length} fail, ${warns.length} warn, ${allGates.length - fails.length - warns.length} pass`)

return {
  version,
  fromTag,
  verdict,
  releasable: verdict !== 'fail',
  gates: allGates,
  blockers: fails.flatMap(g => g.blockers ?? []),
}
