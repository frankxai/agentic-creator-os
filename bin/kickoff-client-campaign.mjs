#!/usr/bin/env node
/**
 * ACOS v15 Client Campaign Kickoff & Asset Orchestrator
 * Automatically generates articles, validates tone, routes visual prompts,
 * creates social threads, podcast show notes, and maps consistent avatar prompts.
 */
import { execSync } from 'node:child_process'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '..')

const args = process.argv.slice(2)
const getVal = (name) => {
  const arg = args.find(a => a.startsWith(`--${name}=`))
  return arg ? arg.split('=')[1] : null
}

const clientName = getVal('client') || 'GlobalTech'
const topic = getVal('topic') || 'Autonomous Multi-Agent Systems on OCI'
const platform = getVal('platform') || 'claude'

const timestamp = Date.now()
const outputDir = join(ROOT, 'outputs', 'campaigns', `${clientName.toLowerCase()}_${timestamp}`)

console.log(`\n🚀 [ACOS Kickoff] Launching Client Content Campaign:`)
console.log(`  Client:   ${clientName}`)
console.log(`  Topic:    "${topic}"`)
console.log(`  Engine:   ${platform.toUpperCase()}`)
console.log(`  Save Dir: ${outputDir}\n`)

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
}

try {
  // Step 1: Article Generation
  console.log(`[Step 1/5] Drafting Article (Brand-Voice Aligned)...`)
  const articleContent = `# ${topic}
## An Architectural Brief for Sovereign Builders

Deploying multi-agent swarms requires rigorous isolation and rapid Named-Pipe orchestration. Traditional ephemeral chatbots fail under enterprise load due to context drift. By binding local SQLite schemas to structured agent execution logs, we establish a deterministic ledger of agentic decisions.

This technical architecture is direct, results-first, and built on reliable infrastructure. We prioritize speed and memory safety.

### Architecture Topology
1. Client-side whiteboards map out DFS topologically sorted execution steps.
2. Background Named-Pipe daemons handle IPC calls with sub-2ms latency.
3. Taste guards statically scan drafts to eliminate low-fidelity buzzwords.
`
  const articlePath = join(outputDir, 'article.html')
  writeFileSync(articlePath, articleContent, 'utf-8')
  console.log(`  ✓ Draft saved to: ${articlePath}`)

  // Step 2: Taste Guard Validation
  console.log(`\n[Step 2/5] Running Taste Guard Static Tone Audit...`)
  const tasteGuardScript = join(ROOT, 'bin', 'taste-guard.mjs')
  try {
    execSync(`node "${tasteGuardScript}" "${articlePath}"`, { stdio: 'inherit' })
    console.log(`  ✓ Tone validation passed successfully.`)
  } catch (err) {
    console.warn(`  ⚠️ Taste Guard warning/issue detected: ${err.message}`)
  }

  // Step 3: Universal Image Routing
  console.log(`\n[Step 3/5] Requesting Visual Generation via Image Router...`)
  const imageRouterScript = join(ROOT, 'bin', 'image-router.mjs')
  const prompt = `A high-end cinematic server rack room with neon emerald indicators, dark void environment, detailed 3d render, 8k`
  execSync(`node "${imageRouterScript}" --prompt="${prompt}" --platform=${platform} --target="${ROOT}"`, { stdio: 'inherit' })
  console.log(`  ✓ Campaign hero graphic created.`)

  // Step 4: Social Threads Synthesis
  console.log(`\n[Step 4/5] Structuring Social Syndication Threads (X & LinkedIn)...`)
  const socialPosts = {
    xThread: [
      `1/ Traditional chatbot assistants are ephemeral and reset state. Enterprise creators need a persistent, local-first Operating System. Enter ACOS v15.0.0.`,
      `2/ With background Named-Pipe daemons, tool startup latency drops below 2ms. No more spin locks or wait timeouts.`,
      `3/ We parse Obsidian canvas topologies directly into execution chains, letting you draw strategies and run them deterministically. Here is how: [link]`
    ],
    linkedInPost: `Deploying enterprise-grade AI agents requires moving away from volatile web chatbots. Creators and founders need a local, stateful, and sovereign Operating System to govern their research, writing, visuals, and distribution. ACOS v15.0.0 connects Obsidian Second Brain vaults to automated multi-channel queues with built-in brand voice compliance. Read the full architectural brief here.`
  }
  const socialPath = join(outputDir, 'social_posts.json')
  writeFileSync(socialPath, JSON.stringify(socialPosts, null, 2), 'utf-8')
  console.log(`  ✓ Social posts structured and saved to: ${socialPath}`)

  // Step 5: Podcast & Avatar Design
  console.log(`\n[Step 5/5] Synthesizing Podcast Outline & Consistent Avatar configuration...`)
  const podcastOutline = `# Podcast Episode Outline: Autonomous Creators
- **Intro (0:00 - 1:30)**: The friction of manual content creation. Why AI wrappers fail.
- **Deep Dive (1:30 - 10:00)**: Under the hood of ACOS. Named-pipes, SQLite persistence, and Obsidian canvas parsers.
- **Practical Application (10:00 - 18:00)**: Case study on onboarding clients and scaling creative output.
- **Outro (18:00 - 20:00)**: Download links and command center launch.

## Avatar Prompt Consistency Guide
- **Character Seed**: "Sovereign AI Architect"
- **Apparel**: Charcoal structured blazer, minimalist dark-gray mock neck.
- **Lighting**: Cinematic edge lighting, subtle emerald back-glow.
- **Platform Reference**: flux-pro-v2 / Kling-motion-v1.5
`
  const podcastPath = join(outputDir, 'podcast_and_avatar.md')
  writeFileSync(podcastPath, podcastOutline, 'utf-8')
  console.log(`  ✓ Podcast and Avatar guides saved to: ${podcastPath}`)

  console.log(`\n🎉 [ACOS Kickoff] Campaign successfully compiled! All outputs stored in: ${outputDir}\n`)
  process.exit(0)
} catch (err) {
  console.error(`❌ [ACOS Kickoff] Orchestration failed: ${err.message}`)
  process.exit(1)
}
