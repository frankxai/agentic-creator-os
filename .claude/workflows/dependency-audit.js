export const meta = {
  name: 'dependency-audit',
  description: 'Dependency health audit. Parallel: security CVEs, license compliance, outdated versions, bundle size, supply-chain risk, dead deps. Ranked action list with impact × effort.',
  whenToUse: 'Monthly per repo, before major releases, or when adding a significant new dependency. Surface critical security findings immediately.',
  phases: [
    { title: 'Scan', detail: '6 parallel lens scans' },
    { title: 'Rank', detail: 'impact × effort ranking' },
  ],
  acos: {
    tier: 'L99',
    cadence: 'monthly',
    portable: true,
    composes: [],
    composedBy: ['release-checklist'],
    estimatedCost: { min: 40000, max: 150000 },
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
        required: ['title', 'severity', 'package'],
        properties: {
          title: { type: 'string' },
          severity: { enum: ['low', 'med', 'high', 'critical'] },
          package: { type: 'string' },
          version: { type: 'string' },
          recommendation: { type: 'string' },
        },
      },
    },
  },
}

const RANKED_SCHEMA = {
  type: 'object',
  required: ['actions', 'criticalCount', 'highCount'],
  properties: {
    actions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['priority', 'action', 'package'],
        properties: {
          priority: { type: 'integer', minimum: 1, maximum: 5 },
          action: { type: 'string' },
          package: { type: 'string' },
          impact: { type: 'string' },
          effort: { enum: ['small', 'med', 'large'] },
        },
      },
    },
    criticalCount: { type: 'integer' },
    highCount: { type: 'integer' },
  },
}

const lenses = [
  { key: 'security', prompt: 'Known CVEs, supply chain attack signals (typosquatting, unusual postinstall scripts, recent ownership change). Run `npm audit` / `pnpm audit` / `pip audit` / `cargo audit` if available.' },
  { key: 'license', prompt: 'License compatibility (GPL contamination risk for proprietary use, missing licenses, unclear licenses for prod deps). Read package.json and node_modules/*/package.json.' },
  { key: 'freshness', prompt: 'Outdated packages (major versions behind), abandoned deps (no commits in 12+ months), breaking-change risk for upgrades.' },
  { key: 'size', prompt: 'Bundle size impact for client-facing deps. Identify heavy deps (>100KB minified+gzipped) and propose lighter alternatives.' },
  { key: 'dead-deps', prompt: 'Dependencies declared in package.json but not actually imported in src/. Also flag single-import deps that could be inlined.' },
  { key: 'supply-chain', prompt: 'Provenance signals: deps without GitHub repos, deps with single maintainer, transitive deps with high blast radius.' },
]

const mode = args?.mode ?? 'audit'

phase('Scan')
const scans = await parallel(lenses.map(l => () =>
  agent(
    `Audit deps through the lens: "${l.key}". ${l.prompt} ` +
    `Read package.json and lockfile (pnpm-lock.yaml / package-lock.json / yarn.lock). Return ranked findings. Set lens="${l.key}".`,
    { label: l.key, phase: 'Scan', schema: FINDINGS_SCHEMA, model: 'sonnet' }
  )
))

const valid = scans.filter(Boolean)
const totalFindings = valid.reduce((sum, s) => sum + (s.findings?.length ?? 0), 0)
log(`${totalFindings} findings across ${valid.length} lenses`)

phase('Rank')
const ranked = await agent(
  `Rank all dependency findings by impact × effort. Top 10 actions. ` +
  `Each action: priority (1=now, 5=can wait), action (verb + object), package, impact summary, effort (small/med/large). ` +
  `Count critical and high severities. Findings: ${JSON.stringify(valid)}.`,
  { phase: 'Rank', schema: RANKED_SCHEMA, model: 'opus' }
)

return {
  mode,
  totalFindings,
  criticalCount: ranked.criticalCount ?? 0,
  highCount: ranked.highCount ?? 0,
  actions: ranked.actions ?? [],
  shippable: (ranked.criticalCount ?? 0) === 0,
}
