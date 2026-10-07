#!/usr/bin/env node
/**
 * ACOS agent-os init — gives a new adopter a working instance in one command.
 *
 * Copies instances/_template/agent-os/ to instances/<name>/agent-os/, points the
 * overlay at the new instance, and prints the next four steps. Never overwrites:
 * an existing instance folder is left untouched.
 *
 * Usage:
 *   node scripts/agent-os-init.mjs --name <kebab-name>
 */
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const i = args.indexOf('--name')
const NAME = i >= 0 ? args[i + 1] : undefined
if (!NAME || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(NAME) || NAME === '_template') {
  console.error('✗ usage: agent-os-init.mjs --name <kebab-name>   (lowercase letters, digits, hyphens)')
  process.exit(2)
}

const src = join(ROOT, 'instances', '_template', 'agent-os')
const dest = join(ROOT, 'instances', NAME, 'agent-os')
if (existsSync(dest)) {
  console.error(`✗ instances/${NAME}/agent-os already exists; nothing was changed.`)
  process.exit(1)
}
cpSync(src, dest, { recursive: true })

const overlayPath = join(dest, 'overlay.json')
writeFileSync(overlayPath, readFileSync(overlayPath, 'utf8').replaceAll('instances/_template/', `instances/${NAME}/`))

console.log(`✓ Created instances/${NAME}/agent-os/

Next, about ten minutes in total:

  1. Write your company soul:   instances/${NAME}/agent-os/company-soul.md
     (who you are, registers, invariants, gates; agents read it before acting)

  2. Compile your Generals:     node scripts/agent-compile.mjs --instance ${NAME}
     → instances/${NAME}/agents/general-*.md  (copy to ~/.claude/agents to use them everywhere)

  3. Optional Domain Queens:    edit instances/${NAME}/agent-os/org/domain-queens.example.json, then
     node scripts/org-import.mjs --org instances/${NAME}/agent-os/org/domain-queens.example.json --instance ${NAME}
     node scripts/agent-compile.mjs --instance ${NAME}

  4. Measure your setup:        node scripts/estate-audit.mjs --repos <folder with your repos> --md audit.md

Guide: docs/agent-os/ADOPT.md`)
