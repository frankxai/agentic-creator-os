export const meta = {
  name: 'incident-postmortem',
  description: 'Post-incident analysis. Parallel evidence gathering (timeline + impact + context) → root cause + contributing factors → blameless postmortem markdown ready for team review.',
  whenToUse: 'After any production incident or near-miss. Output is a blameless postmortem ready for team review and action-item tracking.',
  phases: [
    { title: 'Gather', detail: 'parallel evidence collection' },
    { title: 'Analyze', detail: 'root cause + contributing factors' },
    { title: 'Compose', detail: 'postmortem doc' },
  ],
  acos: {
    tier: 'L99',
    cadence: 'per-incident',
    portable: true,
    composes: [],
    composedBy: [],
    estimatedCost: { min: 80000, max: 300000 },
  },
}

const TIMELINE_SCHEMA = {
  type: 'object',
  required: ['events'],
  properties: {
    events: {
      type: 'array',
      items: {
        type: 'object',
        required: ['when', 'what'],
        properties: {
          when: { type: 'string' },
          what: { type: 'string' },
          source: { type: 'string' },
        },
      },
    },
  },
}

const IMPACT_SCHEMA = {
  type: 'object',
  required: ['affectedSystems', 'severity'],
  properties: {
    affectedSystems: { type: 'array', items: { type: 'string' } },
    affectedUsers: { type: 'string' },
    duration: { type: 'string' },
    severity: { enum: ['low', 'med', 'high', 'critical'] },
  },
}

const CONTEXT_SCHEMA = {
  type: 'object',
  required: ['relatedItems'],
  properties: {
    relatedItems: {
      type: 'array',
      items: {
        type: 'object',
        required: ['kind', 'ref'],
        properties: {
          kind: { enum: ['commit', 'pr', 'issue', 'alert', 'deploy'] },
          ref: { type: 'string' },
          summary: { type: 'string' },
        },
      },
    },
  },
}

const RCA_SCHEMA = {
  type: 'object',
  required: ['rootCause', 'contributingFactors'],
  properties: {
    rootCause: { type: 'string' },
    contributingFactors: { type: 'array', items: { type: 'string' } },
    whyChain: { type: 'array', items: { type: 'string' } },
  },
}

const { incidentDate, summary } = args ?? {}
if (!incidentDate || !summary) {
  throw new Error('incident-postmortem requires args.incidentDate (YYYY-MM-DD) and args.summary')
}

phase('Gather')
const evidence = await parallel([
  () => agent(
    `Reconstruct timeline for incident on ${incidentDate}. Pull events from git log, deployment history, commit messages in the ±48h window. ` +
    `Return chronological events with source attribution (commit SHA, PR number, deploy ID).`,
    { label: 'timeline', phase: 'Gather', schema: TIMELINE_SCHEMA, model: 'sonnet' }
  ),
  () => agent(
    `Assess impact of incident on ${incidentDate}: "${summary}". ` +
    `Identify affected systems (from logs/commits), user impact estimate, duration, severity.`,
    { label: 'impact', phase: 'Gather', schema: IMPACT_SCHEMA, model: 'sonnet' }
  ),
  () => agent(
    `Find related items in the repo around ${incidentDate}: commits, PRs, issues, alerts, deploys in the ±48h window. ` +
    `Use git log + gh CLI if available.`,
    { label: 'context', phase: 'Gather', schema: CONTEXT_SCHEMA, model: 'sonnet' }
  ),
])

phase('Analyze')
const rca = await agent(
  `Root cause analysis for: "${summary}" on ${incidentDate}. Apply 5 Whys (whyChain array, 5 items deep). ` +
  `List contributing factors (process, technology, communication). ` +
  `Evidence: ${JSON.stringify(evidence.filter(Boolean))}.`,
  { phase: 'Analyze', schema: RCA_SCHEMA, model: 'opus' }
)

phase('Compose')
const postmortem = await agent(
  `Compose a blameless postmortem in markdown. Sections: ` +
  `## Summary · ## Timeline · ## Impact · ## Root Cause · ## Contributing Factors · ## What Went Well · ## Action Items (table: action | owner | due) · ## Lessons Learned. ` +
  `Tone: blameless, factual, future-focused. Avoid naming individuals. ` +
  `Incident: "${summary}" on ${incidentDate}. RCA: ${JSON.stringify(rca)}. Evidence: ${JSON.stringify(evidence)}.`,
  { phase: 'Compose', model: 'opus' }
)

return {
  incidentDate,
  summary,
  severity: evidence[1]?.severity ?? 'unknown',
  rootCause: rca.rootCause,
  contributingFactors: rca.contributingFactors,
  postmortem,
}
