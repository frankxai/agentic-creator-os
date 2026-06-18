#!/usr/bin/env node
/**
 * ACOS v15 Taste Guard & Design System compliance checker.
 * Scans content drafts and code files to block AI-slop patterns.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const BANNED_SLOP_TERMS = [
  'delve',
  'dive deep',
  'it\'s worth noting',
  'certainly',
  'absolutely',
  'unleash',
  'unlock the power of',
  'revolutionary',
  'game-changing',
  'in conclusion',
  'testament to',
  'pave the way',
  'not only... but also'
]

const APPROVED_BRAND_COLORS = [
  '#0a0a0b', // void
  '#111113', // space
  '#1a1a1f', // elevated
  '#10b981', // tech-primary (emerald-500)
  '#06b6d4', // tech-secondary (cyan-500)
  '#f59e0b', // soul-primary (amber-500)
  '#fbbf24', // soul-secondary (amber-400)
  '#ab47c7', // bridge-purple
  '#43bfe3'  // bridge-blue
]

const args = process.argv.slice(2)
const fileArg = args.find(a => !a.startsWith('--'))

if (!fileArg) {
  console.log(`\n🔒 [ACOS Taste Guard] Usage: node bin/taste-guard.mjs <file-path>\n`)
  process.exit(0)
}

const filePath = resolve(fileArg)

if (!existsSync(filePath)) {
  console.error(`❌ [ACOS Taste Guard] Target file not found: ${filePath}`)
  process.exit(1)
}

const content = readFileSync(filePath, 'utf-8')
let violations = 0

console.log(`\n🔒 [ACOS Taste Guard] Auditing: ${filePath}...`)

// 1. Audit copy slop terms
console.log(`[ACOS Taste Guard] Running Copy Tone scan...`)
for (const term of BANNED_SLOP_TERMS) {
  const regex = new RegExp(`\\b${term}\\b`, 'gi')
  const matches = content.match(regex)
  if (matches) {
    violations++
    console.error(`  ❌ \x1b[31mCopy Tone Violation: Banned AI-slop word found: "${term}" (${matches.length} matches)\x1b[0m`)
  }
}

// 2. Audit design color rules (if HTML/CSS/TSX file)
if (filePath.endsWith('.tsx') || filePath.endsWith('.html') || filePath.endsWith('.css')) {
  console.log(`[ACOS Taste Guard] Running Design System color compliance check...`)
  
  // Look for hex color definitions
  const hexRegex = /#([0-9a-fA-F]{3,8})\b/g
  let match
  const matches = []
  while ((match = hexRegex.exec(content)) !== null) {
    matches.push(match[0].toLowerCase())
  }

  // Remove duplicates
  const uniqueHexes = [...new Set(matches)]

  for (const hex of uniqueHexes) {
    // Check if it's not in the approved brand colors
    const isApproved = APPROVED_BRAND_COLORS.some(c => c === hex || c === expandHex(hex))
    if (!isApproved) {
      console.warn(`  ⚠️  \x1b[33mDesign System Warning: Non-brand color code found: "${hex}"\x1b[0m`)
    }
  }
}

// Helper to expand 3-digit hexes to 6-digits (e.g. #000 -> #000000)
function expandHex(hex) {
  if (hex.length === 4) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
  }
  return hex
}

if (violations > 0) {
  console.error(`\n❌ [ACOS Taste Guard] Audit Failed. Found ${violations} critical violation(s).\n`)
  process.exit(1)
} else {
  console.log(`\n✓ \x1b[32m[ACOS Taste Guard] Audit Passed! Compliance verified.\x1b[0m\n`)
  process.exit(0)
}
