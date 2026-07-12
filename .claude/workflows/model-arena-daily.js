export const meta = {
  name: 'model-arena-daily',
  description: 'Frontier Model Arena. Dispatches an evolving task bank to the top ~13 frontier models (Claude, GPT-5.5, Gemini, Grok, DeepSeek, Qwen, Kimi, Mistral, Gemma, gpt-oss) via OpenRouter, verifies mechanically, judges craft cross-family, and keeps a learning leaderboard. Detects new model releases from the registry. Durable sink: committed receipt + leaderboard + Slack DM.',
  whenToUse: 'Weekly frontier round (cadence moved from daily → weekly 2026-07-12: 13 models × N tasks is heavy work, and it now feeds a durable receipt + the public /research/model-arena page). Pass args.tasks to set round size, args.week to force rotation, args.date for the receipt name. Runs degraded (plan-only) if OPENROUTER_API_KEY is absent.',
  phases: [
    { title: 'Recall', detail: 'prior rounds from trajectory' },
    { title: 'Detect', detail: 'new registry models missing from the ring' },
    { title: 'Dispatch', detail: 'run the multi-provider arena via OpenRouter' },
    { title: 'Cross-check', detail: 'in-harness Claude tiers on one task (always verifiable)' },
    { title: 'Judge', detail: 'blind cross-family scoring of the craft task' },
    { title: 'Synthesize', detail: 'leaderboard delta + routing implications' },
    { title: 'Record', detail: 'persist round to trajectory memory' },
    { title: 'Commit', detail: 'commit receipt + leaderboard back to main' },
    { title: 'Notify', detail: 'Slack DM the standings + learnings' },
  ],
  acos: {
    tier: 'L99',
    cadence: 'weekly',
    portable: true,
    runtime: 'hybrid',
    composes: [],
    composedBy: [],
    estimatedCost: { min: 60000, max: 140000 },
  },
}

const JUDGE_SCHEMA = {
  type: 'object',
  required: ['winner', 'ranking'],
  properties: {
    winner: { type: 'string' },
    ranking: {
      type: 'array',
      items: {
        type: 'object',
        required: ['label', 'rank', 'note'],
        properties: {
          label: { type: 'string' },
          rank: { type: 'integer', minimum: 1 },
          note: { type: 'string' },
        },
      },
    },
    bannedWordLeak: { type: 'array', items: { type: 'string' } },
  },
}

const SYNTH_SCHEMA = {
  type: 'object',
  required: ['leader', 'routingImplications'],
  properties: {
    leader: { type: 'string' },
    biggestMover: { type: 'string' },
    saturatedAxes: { type: 'array', items: { type: 'string' } },
    routingImplications: {
      type: 'array',
      items: {
        type: 'object',
        required: ['lane', 'route', 'why'],
        properties: { lane: { type: 'string' }, route: { type: 'string' }, why: { type: 'string' } },
      },
    },
  },
}

const DETECT_SCHEMA = {
  type: 'object',
  required: ['missing'],
  properties: {
    missing: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'org'],
        properties: { id: { type: 'string' }, name: { type: 'string' }, org: { type: 'string' } },
      },
    },
    note: { type: 'string' },
  },
}

const DISPATCH_SCHEMA = {
  type: 'object',
  required: ['ok', 'mode'],
  properties: {
    ok: { type: 'boolean' },
    mode: { type: 'string' },
    leader: { type: 'string' },
    learnings: { type: 'array', items: { type: 'string' } },
    receipt: { type: 'string' },
    leaderboard: { type: 'string' },
    judgeNeeded: { type: 'boolean' },
  },
}

const date = args?.date || new Date().toISOString().slice(0, 10)
const roundSize = args?.tasks || 4

phase('Recall')
const priorRuns = await agent(
  `Run: node scripts/workflow-trajectory.mjs recall --workflow model-arena-daily --limit 6\n` +
  `Return JSON. Prior rounds show which axes have saturated and which models led — context, not a thumb on today's scale.`,
  { phase: 'Recall', model: 'haiku' }
).catch(() => ({ summary: 'cold start — no prior arena', lessonsLearned: [] }))
log(`Trajectory: ${priorRuns?.summary || 'cold start'}`)

phase('Detect')
const newModels = await agent(
  `Detect frontier models that have shipped but aren't in the arena yet. Steps: ` +
  `(1) Read data/model-registry.json and list every model with status "ga". ` +
  `(2) Read scripts/model-arena/roster.json and list every registry_id. ` +
  `(3) Return the GA registry models whose id is NOT in the roster, as {missing: [{id, name, org}], note}. ` +
  `This is how the ring grows as new models release — flag them so a human adds an openrouter_slug and sets arena_active.`,
  { phase: 'Detect', schema: DETECT_SCHEMA, model: 'haiku' }
).catch(() => ({ missing: [], note: 'detect skipped' }))
log(`New-model detection: ${(newModels?.missing?.length ?? 0)} GA model(s) not yet in the ring`)

phase('Dispatch')
const runOut = await agent(
  `Run the multi-provider Model Arena and report its JSON output verbatim. ` +
  `Command: node scripts/model-arena/run.mjs --tasks ${roundSize} --date ${date}\n` +
  `If OPENROUTER_API_KEY is unset the runner returns mode:"plan" degraded:true — that is expected, not a failure; report it as-is. ` +
  `Return the parsed JSON (ok, mode, leader, learnings, receipt, leaderboard paths, judgeNeeded).`,
  { phase: 'Dispatch', schema: DISPATCH_SCHEMA, model: 'haiku' }
).catch((e) => ({ ok: false, error: String(e), mode: 'error' }))
log(`Arena dispatch: mode=${runOut?.mode} leader=${runOut?.leader ?? 'n/a'}`)

phase('Cross-check')
// Always-verifiable core: even if OpenRouter is down, the in-harness Claude tiers
// run. Same reasoning task the public arena uses; ground truth fixed by the harness.
const crossTask = 'Find the smallest positive integer divisible by every integer from 1 to 7 but NOT divisible by 8. Reply with ONLY the number.'
const tiers = ['opus', 'sonnet', 'haiku', 'fable']
const crossResponses = await parallel(tiers.map((t) => () =>
  agent(crossTask, { label: `harness:${t}`, phase: 'Cross-check', model: t }).catch(() => null)
))
const crossCheck = tiers.map((t, i) => ({ tier: t, answer: (crossResponses[i] || '').trim(), correct: /(^|\D)420(\D|$)/.test(crossResponses[i] || '') }))
log(`In-harness cross-check: ${crossCheck.filter((c) => c.correct).length}/${tiers.length} Claude tiers got the reasoning task`)

phase('Judge')
// Cross-family blind judge for the craft task (kills Claude-family bias).
const judge = runOut?.judgeNeeded
  ? await agent(
      `Blind-judge the craft task from this round's receipt (${runOut?.receipt || 'data/model-arena/runs/' + date + '.json'}). ` +
      `Read the receipt; find the judge-type task ("judgment-brand-voice") if its per-model outputs are present, otherwise judge is informational only. ` +
      `First MECHANICALLY reject any rewrite containing the banned hype words (unlock, seamless, supercharge, delve, elevate) or exceeding 25 words — list them in bannedWordLeak. ` +
      `Then rank the surviving rewrites on concreteness and whether they say something real. Use shuffled labels; do not favor any family. ` +
      `Return winner + ranking.`,
      { phase: 'Judge', schema: JUDGE_SCHEMA, model: 'opus' }
    ).catch(() => null)
  : null

phase('Synthesize')
const synth = await agent(
  `Synthesize this Model Arena round into routing guidance. Inputs: ` +
  `leaderboard=data/model-arena/leaderboard.json, this round's receipt, runner learnings=${JSON.stringify(runOut?.learnings || [])}, ` +
  `new models flagged=${JSON.stringify(newModels?.missing || [])}, cross-check=${JSON.stringify(crossCheck)}, ` +
  `craft-task judge verdict=${JSON.stringify(judge || 'not judged this round')}. ` +
  `Read the leaderboard, then return: leader (top pass-rate), biggestMover if any, saturatedAxes (from learnings), and 3-4 routingImplications ` +
  `{lane, route (which model), why} grounded in per-axis pass-rates — e.g. which model to route strict-JSON to, which for reasoning, which for cheap grounding. ` +
  `Be honest about small-n; this is directional.`,
  { phase: 'Synthesize', schema: SYNTH_SCHEMA, model: 'opus' }
)

phase('Record')
const runId = args?.runId || `model-arena-${date}`
await agent(
  `Record this arena round so next week's Recall has real history. ` +
  `Run: node scripts/workflow-trajectory.mjs record --workflow model-arena-daily ` +
  `--runId ${runId} --outcome ${runOut?.ok ? 'success' : runOut?.mode === 'plan' ? 'partial' : 'failed'} ` +
  `--findings ${(synth.routingImplications || []).length} ` +
  `--summary "Round ${date}: leader ${synth.leader} — ${(synth.routingImplications?.[0]?.lane || '')}" ` +
  `--lessonsLearned "leader:${synth.leader}|saturated:${(synth.saturatedAxes || []).join(',')}|newModels:${(newModels?.missing || []).map((m) => m.id).join(',')}"\n` +
  `The command commits the trajectory file back to main — ignore a non-fatal push failure, report what it printed.`,
  { phase: 'Record', model: 'haiku' }
).catch(() => null)

phase('Commit')
// Durable sink #1: the receipt + leaderboard + evolved task bank are worthless
// if they die in the ephemeral CCR checkout. Commit them back to main.
await agent(
  `Commit this round's arena artifacts back to main so they survive the ephemeral checkout (durable-output-sink law). ` +
  `FIRST, if a judge verdict exists (${judge ? 'it does' : 'it does not this round'}), merge it into the receipt so the committed artifact isn't left with pass:null for the craft task: ` +
  `read data/model-arena/runs/${date}.json, add a top-level "judgeVerdict" field = ${JSON.stringify(judge || null)}, write it back. ` +
  `THEN stage ONLY these paths: data/model-arena/runs/${date}.json, data/model-arena/leaderboard.json, scripts/model-arena/tasks.json ` +
  `(tasks.json changed if a task saturated). Commit message: "chore(arena): frontier round ${date} — leader ${synth.leader}". ` +
  `Then push to the current branch. If nothing changed (degraded/plan run wrote no receipt), skip the commit and say so. ` +
  `Ignore a non-fatal push failure; report what git printed.`,
  { phase: 'Commit', model: 'haiku' }
).catch(() => null)

phase('Notify')
// Durable sink #2: Slack DM so the standings reach a human, not just run-history.
await agent(
  `Post a Slack DM to user U09CE1K62AY (Frank) with this week's Model Arena result. Use the Slack MCP tool (search for it if needed). Content: ` +
  `"**Model Arena — ${date}** (${runOut?.mode === 'plan' ? '🟡 degraded: no OPENROUTER_API_KEY, plan only' : '🟢 live'})\n` +
  `Leader: ${synth.leader}${synth.biggestMover ? ' · mover: ' + synth.biggestMover : ''}\n` +
  `${(newModels?.missing?.length ?? 0) > 0 ? '🆕 ' + newModels.missing.length + ' new GA model(s) to add: ' + newModels.missing.map((m) => m.name).join(', ') + '\n' : ''}` +
  `${(synth.saturatedAxes?.length ?? 0) > 0 ? '⚠️ saturated axes (harden): ' + synth.saturatedAxes.join(', ') + '\n' : ''}` +
  `Route: ${(synth.routingImplications || []).slice(0, 2).map((r) => r.lane + '→' + r.route).join(' · ')}\n` +
  `Receipt: data/model-arena/runs/${date}.json" ` +
  `If the Slack tool errors (not connected), don't fail the workflow — note it in your return.`,
  { phase: 'Notify', model: 'haiku' }
).catch(() => null)

return {
  date,
  mode: runOut?.mode,
  leader: synth.leader,
  routingImplications: synth.routingImplications,
  saturatedAxes: synth.saturatedAxes || [],
  newModelsToAdd: newModels?.missing || [],
  crossCheck,
  judge: judge || null,
  receipt: `data/model-arena/runs/${date}.json`,
}
