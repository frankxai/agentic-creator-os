#!/usr/bin/env node

import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// Run verify-public-surface to get measured counts
const measuredString = execFileSync('node', [join(ROOT, 'scripts/verify-public-surface.mjs')]).toString()
const jsonMatch = measuredString.match(/\{\n[\s\S]*\n\}/)
if (!jsonMatch) {
  throw new Error("Could not parse JSON from verify-public-surface output")
}
const measured = JSON.parse(jsonMatch[0])

const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')

// 1. Literal promise
assert.match(readme, /ACOS is a public source repository of AI workflows that you can install locally/i, "Requires a literally true one-sentence promise")

// 2. Quickstart code block (Updated based on review)
const marketplace = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'))
const marketplaceName = marketplace.name
const pluginName = marketplace.plugins[0].name

const addMarketplaceCommand = `claude plugin marketplace add frankxai/agentic-creator-os`
const installPluginCommand = `claude plugin install ${pluginName}@${marketplaceName}`

assert.ok(readme.includes(addMarketplaceCommand), "Missing claude plugin marketplace add command")
assert.ok(readme.includes(installPluginCommand), "Missing claude plugin install command with correct exact names")

// 3. Counts match files on disk
const expectedList = [
  `${measured.nonEmptySkillModules} non-empty skill modules`,
  `${measured.topLevelCommands} top-level slash commands`,
  `${measured.topLevelAgents} top-level agent profiles`,
  `${measured.installableShellHooks} installable shell hooks`,
  `${measured.activationRules} activation rules`
]

for (const expected of expectedList) {
  assert.ok(readme.includes(expected), `README must contain exact string: "${expected}"`)
}

// Check counts in the table too
assert.match(readme, new RegExp(`\\| Non-empty skill modules \\| ${measured.nonEmptySkillModules} \\|`))
assert.match(readme, new RegExp(`\\| Empty skill placeholders \\| ${measured.emptySkillPlaceholders} \\|`))
assert.match(readme, new RegExp(`\\| Top-level slash commands \\| ${measured.topLevelCommands} \\|`))
assert.match(readme, new RegExp(`\\| Top-level agent profiles \\| ${measured.topLevelAgents} \\|`))
assert.match(readme, new RegExp(`\\| Installable shell hooks \\| ${measured.installableShellHooks} \\|`))
assert.match(readme, new RegExp(`\\| Activation rules \\| ${measured.activationRules} \\|`))

// 4. Verify every path on disk in README.md (Reviewer requested this dynamically)
const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
let match;
while ((match = markdownLinkRegex.exec(readme)) !== null) {
  let linkPath = match[2];
  if (!linkPath.startsWith('http') && !linkPath.startsWith('#')) {
    assert.ok(existsSync(join(ROOT, linkPath)), `Path in README does not exist: ${linkPath}`);
  }
}

console.log("README facts checked successfully.")
