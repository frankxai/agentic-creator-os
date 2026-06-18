#!/usr/bin/env node
/**
 * ACOS v15 Obsidian Canvas (.canvas) file parser.
 * Reads Obsidian JSON canvases and compiles them into sequential content strategies.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const fileArg = args.find(a => !a.startsWith('--'))

if (!fileArg) {
  console.log(`\n🎨 [ACOS Canvas Parser] Usage: node bin/canvas-parser.mjs <obsidian-canvas-file.canvas>\n`)
  process.exit(0)
}

const canvasPath = resolve(fileArg)

if (!existsSync(canvasPath)) {
  console.error(`❌ [ACOS Canvas Parser] Target canvas not found: ${canvasPath}`)
  process.exit(1)
}

try {
  const rawData = readFileSync(canvasPath, 'utf-8')
  const canvas = JSON.parse(rawData)
  
  const nodes = canvas.nodes || []
  const edges = canvas.edges || []

  console.log(`\n🎨 [ACOS Canvas Parser] Analyzing: ${canvasPath}`)
  console.log(`  Nodes: ${nodes.length} | Connections: ${edges.length}`)

  // Create node lookup maps
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const incoming = new Map(nodes.map(n => [n.id, []]))
  const outgoing = new Map(nodes.map(n => [n.id, []]))

  for (const edge of edges) {
    incoming.get(edge.toNode)?.push(edge.fromNode)
    outgoing.get(edge.fromNode)?.push(edge.toNode)
  }

  // Find root nodes (no incoming edges)
  const roots = nodes.filter(n => incoming.get(n.id)?.length === 0)

  console.log(`\n🚀 [ACOS Canvas Parser] Compiled Content Workflow Strategy:`)

  // Trace pathways using simple DFS/Topological trace
  const visited = new Set()
  const workflowSteps = []

  function trace(nodeId) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    const node = nodeMap.get(nodeId)
    if (!node) return

    workflowSteps.push(node)

    const nextNodes = outgoing.get(nodeId) || []
    for (const nextId of nextNodes) {
      trace(nextId)
    }
  }

  for (const root of roots) {
    trace(root.id)
  }

  // Print execution sequence
  workflowSteps.forEach((step, idx) => {
    const typeLabel = step.type ? step.type.toUpperCase() : 'TEXT'
    let summary = ''
    if (step.type === 'text') {
      summary = step.text?.split('\n')[0] || ''
    } else if (step.type === 'file') {
      summary = `File Link: ${step.file}`
    } else if (step.type === 'group') {
      summary = `Group: ${step.label || 'Unnamed Group'}`
    }

    console.log(`  Step ${idx + 1} [${typeLabel}]: ${summary}`)
  })

  console.log(`\n✓ [ACOS Canvas Parser] Build successful. Workflow ready for creator execution.\n`)
  process.exit(0)
} catch (err) {
  console.error(`❌ [ACOS Canvas Parser] Parsing failed: ${err.message}`)
  process.exit(1)
}
