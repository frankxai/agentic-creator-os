export const meta = {
  name: 'research-pulse-daily',
  description: 'Daily lightweight research pulse — 3 parallel domain scans, synthesize to a 200-word brief. The cheap daily counterpart to research-fanout (which is heavy/weekly). Tags ship-worthy signals for the Friday newsletter queue.',
  whenToUse: 'Daily morning brief on AI / agent / creator-economy signals. Cost-disciplined: 3 scans + 1 synth = ~50-80k tokens. Output feeds research-fanout aggregation on Sunday.',
  phases: [
    { title: 'Scan', detail: '3 parallel domain scans' },
    { title: 'Synthesize', detail: 'daily pulse brief' },
  ],
  acos: {
    tier: 'L99',
    cadence: 'daily',
    portable: true,
    runtime: 'hybrid',
    composes: [],
    composedBy: ['research-fanout'],
    estimatedCost: { min: 50000, max: 100000 },
  },
}

const SCAN_SCHEMA = {
  type: 'object',
  required: ['domain', 'signals'],
  properties: {
    domain: { type: 'string' },
    signals: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'summary', 'novelty'],
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          sourceUrl: { type: 'string' },
          novelty: { type: 'integer', minimum: 1, maximum: 10 },
          shipWorthy: { type: 'boolean' },
        },
      },
    },
  },
}

const PULSE_SCHEMA = {
  type: 'object',
  required: ['leadSignal', 'brief', 'shipWorthyCount'],
  properties: {
    leadSignal: { type: 'string' },
    brief: { type: 'string' },
    shipWorthyCount: { type: 'integer' },
    queuedForFriday: { type: 'array', items: { type: 'object' } },
  },
}

const domains = [
  'New AI model releases + benchmarks worth citing today',
  'Agent architectures + MCP ecosystem updates from past 24h',
  'Creator-economy + AI-native creator tooling launches this week',
]

phase('Scan')
const scans = await parallel(domains.map(d => () =>
  agent(
    `Scan today's signals on: "${d}". Return 2-3 items. Mark shipWorthy=true if novelty >= 7 and worth newsletter spotlight. ` +
    `Be concise — daily pulse, not deep research. Set domain="${d}".`,
    { label: d.split(' ').slice(0, 2).join('-').toLowerCase(), phase: 'Scan', schema: SCAN_SCHEMA, model: 'sonnet' }
  )
))

const valid = scans.filter(Boolean)
const allSignals = valid.flatMap(s => s.signals ?? [])
const shipWorthy = allSignals.filter(s => s.shipWorthy)

log(`${valid.length}/${domains.length} scans returned · ${allSignals.length} signals · ${shipWorthy.length} ship-worthy`)

phase('Synthesize')
const pulse = await agent(
  `Synthesize ${allSignals.length} signals into a 200-word daily research pulse. ` +
  `Lead with the SINGLE most important signal of the day (1 sentence headline). ` +
  `Then 4-6 bullets, max 15 words each. Optimize for skimmability + signal density. ` +
  `Set shipWorthyCount=${shipWorthy.length}. Include the ship-worthy items in queuedForFriday for the newsletter pipeline. ` +
  `Signals: ${JSON.stringify(valid)}.`,
  { phase: 'Synthesize', schema: PULSE_SCHEMA, model: 'sonnet' }
)

return {
  date: args?.date,
  leadSignal: pulse.leadSignal,
  brief: pulse.brief,
  shipWorthyCount: pulse.shipWorthyCount,
  queuedForFriday: pulse.queuedForFriday,
  scansCompleted: valid.length,
  totalSignals: allSignals.length,
}
