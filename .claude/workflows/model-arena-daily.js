export const meta = {
  name: 'model-arena-daily',
  description: 'Daily multi-tier model arena. Runs the same canonical prompt through Claude Opus / Sonnet / Haiku in parallel. Synthesizer ranks responses on depth, accuracy, specificity. Captures regression signal if a tier drops.',
  whenToUse: 'Daily intelligence on which Claude tier is best for each task type. Cost-disciplined by design: 3 generators + 1 judge = ~40-80k tokens. Pass args.prompt to override the default canonical prompt; pass args.topic to rotate weekly themes.',
  phases: [
    { title: 'Generate', detail: '3 parallel tier responses' },
    { title: 'Judge', detail: 'rank + regression check' },
  ],
  acos: {
    tier: 'L99',
    cadence: 'daily',
    portable: true,
    runtime: 'hybrid',
    composes: [],
    composedBy: [],
    estimatedCost: { min: 40000, max: 90000 },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['ranking', 'winner', 'observations'],
  properties: {
    ranking: {
      type: 'array',
      items: {
        type: 'object',
        required: ['tier', 'rank', 'strengths'],
        properties: {
          tier: { enum: ['opus', 'sonnet', 'haiku'] },
          rank: { type: 'integer', minimum: 1, maximum: 3 },
          strengths: { type: 'string' },
          weaknesses: { type: 'string' },
        },
      },
    },
    winner: { enum: ['opus', 'sonnet', 'haiku'] },
    observations: { type: 'string' },
    valueDelta: { type: 'string' },
  },
}

const ROTATING_TOPICS = [
  'Explain trade-offs of multi-agent orchestration vs single-agent reasoning for production AI. 250 words. Cite concrete examples.',
  'Design a token-efficient retrieval pattern for a knowledge base with 1M documents. 250 words. Include cache strategy.',
  'Compare React Server Components vs Client Components for a real-time dashboard. 250 words. Specific failure modes.',
  'When is a multi-step workflow better than a single Opus call? 250 words. Three concrete decision criteria.',
  'How would you architect a self-improving agent system that learns from its own runs? 250 words. Failure modes.',
  'Critique the prompt: "Be helpful and friendly." Improve it for a tier-2 support agent. 250 words.',
  'Explain how to prevent hallucinated function calls in tool-use agents. 250 words. Citation discipline.',
]

const dayOfWeek = args?.dayOfWeek ?? 0
const canonicalPrompt = args?.prompt ?? ROTATING_TOPICS[dayOfWeek % ROTATING_TOPICS.length]

phase('Generate')
const tiers = ['opus', 'sonnet', 'haiku']
const responses = await parallel(tiers.map(tier => () =>
  agent(canonicalPrompt, { label: `tier:${tier}`, phase: 'Generate', model: tier })
))

const valid = responses.map((r, i) => ({ tier: tiers[i], response: r })).filter(r => r.response)
log(`${valid.length}/${tiers.length} tier responses captured for prompt: "${canonicalPrompt.slice(0, 60)}..."`)

phase('Judge')
const verdict = await agent(
  `Compare these 3 Claude-tier responses to the prompt: "${canonicalPrompt}"\n\n` +
  valid.map(r => `## ${r.tier.toUpperCase()}\n${r.response}`).join('\n\n') +
  `\n\nJudge on: (1) accuracy of claims, (2) depth of analysis, (3) specificity (concrete examples vs generic), (4) signal-to-noise. ` +
  `Rank 1-3. Pick winner. Observations on what differentiates them today. ` +
  `valueDelta: is the Opus output materially better than Sonnet/Haiku, or is the cheaper tier good enough for this task class?`,
  { phase: 'Judge', schema: VERDICT_SCHEMA, model: 'opus' }
)

return {
  date: args?.date,
  prompt: canonicalPrompt,
  topicIndex: dayOfWeek % ROTATING_TOPICS.length,
  winner: verdict.winner,
  ranking: verdict.ranking,
  observations: verdict.observations,
  valueDelta: verdict.valueDelta,
  responsesCount: valid.length,
}
