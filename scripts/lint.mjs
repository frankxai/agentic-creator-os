#!/usr/bin/env node
/**
 * ACOS lint — lightweight integrity checks for the skill substrate.
 *
 * Hard errors (exit 1): malformed JSON in registry.json or any skills/**.json.
 * Warnings (exit 0): SKILL.md files missing YAML frontmatter (name/description).
 *
 * Kept intentionally dependency-free so it runs under `npm run lint` in CI
 * without a node_modules install step beyond what build:all already provides.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

let errors = 0
let warnings = 0

function walk(dir, predicate, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue
    const full = join(dir, entry)
    const s = statSync(full)
    if (s.isDirectory()) walk(full, predicate, out)
    else if (predicate(entry)) out.push(full)
  }
  return out
}

// 1. registry.json must be valid JSON with the expected shape.
const registryPath = join(ROOT, 'skills', 'registry.json')
if (existsSync(registryPath)) {
  try {
    const reg = JSON.parse(readFileSync(registryPath, 'utf8'))
    for (const key of ['version', 'categories', 'skills']) {
      if (!(key in reg)) {
        console.error(`✗ registry.json missing required key: ${key}`)
        errors++
      }
    }
  } catch (err) {
    console.error(`✗ registry.json is not valid JSON: ${err.message}`)
    errors++
  }
} else {
  console.error('✗ skills/registry.json not found')
  errors++
}

// 2. Every JSON file under skills/ must parse.
for (const f of walk(join(ROOT, 'skills'), (n) => n.endsWith('.json'))) {
  try {
    JSON.parse(readFileSync(f, 'utf8'))
  } catch (err) {
    console.error(`✗ invalid JSON: ${f.replace(ROOT + '/', '')} — ${err.message}`)
    errors++
  }
}

// 3. SKILL.md frontmatter — warn only (pre-existing skills may lack it).
const skillMds = walk(join(ROOT, 'skills'), (n) => n === 'SKILL.md')
for (const f of skillMds) {
  const text = readFileSync(f, 'utf8')
  const rel = f.replace(ROOT + '/', '')
  if (!text.startsWith('---')) {
    console.warn(`⚠ ${rel}: missing YAML frontmatter`)
    warnings++
    continue
  }
  const fm = text.slice(3, text.indexOf('---', 3))
  if (!/\bname\s*:/.test(fm)) {
    console.warn(`⚠ ${rel}: frontmatter missing 'name'`)
    warnings++
  }
  if (!/\bdescription\s*:/.test(fm)) {
    console.warn(`⚠ ${rel}: frontmatter missing 'description'`)
    warnings++
  }
}

console.log(
  `\nACOS lint: ${skillMds.length} skills checked · ${errors} error(s) · ${warnings} warning(s)`
)

process.exit(errors > 0 ? 1 : 0)
