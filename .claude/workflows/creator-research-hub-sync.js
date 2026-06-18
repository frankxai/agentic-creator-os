export const meta = {
  name: 'creator-research-hub-sync',
  description: 'Sync local Second Brain Obsidian/Notion vaults to public research hub, run quality/claims gates, and build catalog/RSS search index.',
  whenToUse: 'When updating or publishing your personal research hub (frankx.ai/research style) with validated second brain files.',
  phases: [
    { title: 'Scan Vault', detail: 'Read new markdown files from local vault' },
    { title: 'Claims Audit', detail: 'Validate marketing and links' },
    { title: 'Scaffold Hub', detail: 'Compile static research layouts' },
    { title: 'Generate Index', detail: 'Build catalog and RSS feed' },
  ],
  acos: {
    tier: 'L4',
    cadence: 'on-demand',
    portable: true,
    composes: [],
    composedBy: [],
    estimatedCost: { min: 50000, max: 120000, calibratedRuns: 0 },
  },
}

phase('Scan Vault')
const files = await agent(
  'Identify new and modified research notes from Obsidian/Notion vaults configured in qme-second-brain.',
  { label: 'vault-scanner', phase: 'Scan Vault', model: 'sonnet' }
)

phase('Claims Audit')
const auditResult = await agent(
  `Run integrity-guard: audit the files for unverified marketing claims, AI-slop words, ` +
  `and check all outbound link schemas. Files: ${JSON.stringify(files)}.`,
  { label: 'integrity-auditor', phase: 'Claims Audit', model: 'sonnet' }
)

phase('Scaffold Hub')
const templatesCompiled = await agent(
  `Scaffold the static Next.js/MDX layouts in app/research/ matching tags and categories. ` +
  `Audit Results: ${JSON.stringify(auditResult)}.`,
  { label: 'hub-compiler', phase: 'Scaffold Hub', model: 'sonnet' }
)

phase('Generate Index')
const indexResult = await agent(
  `Collect metadata, build catalog.json for static search, and generate XML RSS / llms.txt feeds.`,
  { label: 'index-generator', phase: 'Generate Index', model: 'sonnet' }
)

return { templatesCompiled, indexResult }
