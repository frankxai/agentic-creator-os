export const meta = {
  name: 'creator-viral-cascade',
  description: 'Viral Outlier Analysis & Multi-Channel Content Cascade. Analyzes hook structures via Sandcastles, grabs personal context from Second Brain, and syndicates drafts to Postiz/Buffer.',
  whenToUse: 'When adapting high-CTR outlier content structures into branded assets and syndicating them across X, LinkedIn, Threads, and YouTube Shorts.',
  phases: [
    { title: 'Analyze Outlier', detail: 'Sandcastles.ai outlier geometry analysis' },
    { title: 'Contextualize', detail: 'Retrieves personal brain contexts' },
    { title: 'Drafting Swarm', detail: 'Brand voice co-authoring' },
    { title: 'Distribute', detail: 'Postiz & Buffer payloads generation' },
  ],
  acos: {
    tier: 'L3',
    cadence: 'on-demand',
    portable: true,
    composes: [],
    composedBy: [],
    estimatedCost: { min: 80000, max: 150000, calibratedRuns: 0 },
  },
}

phase('Analyze Outlier')
const outlierAnalysis = await agent(
  'Scan Sandcastles.ai performance metrics and outline the target video outlier. ' +
  'Analyze hooks, retention anchors, CTR curves, and pacing geometry.',
  { label: 'outlier-analyzer', phase: 'Analyze Outlier', model: 'sonnet' }
)

phase('Contextualize')
const brainContext = await agent(
  'Sync with Qme.ai and Obsidian/Notion vaults to retrieve matching personal stories, ' +
  'technical samples, and audience-style profiles matching this topic.',
  { label: 'brain-query', phase: 'Contextualize', model: 'sonnet' }
)

phase('Drafting Swarm')
const draftedContent = await agent(
  `Co-author 5 high-CTR hook variations and a complete video script. ` +
  `Apply brand-voice guidelines and integrate the brain context. ` +
  `Outlier Analysis: ${JSON.stringify(outlierAnalysis)}. ` +
  `Brain Context: ${JSON.stringify(brainContext)}.`,
  { label: 'script-drafting', phase: 'Drafting Swarm', model: 'opus' }
)

phase('Distribute')
const syndicationPayload = await agent(
  `Convert the script into platform-native formats: an X thread, a LinkedIn post, ` +
  `and a YouTube Shorts adaptation. Generate JSON payloads for Postiz and Buffer queues. ` +
  `Drafted Content: ${JSON.stringify(draftedContent)}.`,
  { label: 'distribution-cascade', phase: 'Distribute', model: 'sonnet' }
)

return { syndicationPayload }
