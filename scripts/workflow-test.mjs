#!/usr/bin/env node
// Smoke fixture runner for portable workflows.
// Reads .claude/workflows/__fixtures__/<workflow>.json fixtures and validates them
// against the workflow's declared meta + schemas — WITHOUT invoking the live Workflow runtime.
// This is the cheap pre-flight check that lives in merge:gate. Catches regressions
// when workflow files evolve without breaking the deterministic contract.

import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const WORKFLOWS_DIR = join(ROOT, '.claude', 'workflows')
const FIXTURES_DIR = join(WORKFLOWS_DIR, '__fixtures__')

async function parseMeta(path) {
  const src = await readFile(path, 'utf8')
  const marker = 'export const meta = '
  const startIdx = src.indexOf(marker)
  if (startIdx === -1) return null
  let depth = 0, i = startIdx + marker.length, started = false
  for (; i < src.length; i++) {
    if (src[i] === '{') { depth++; started = true }
    else if (src[i] === '}' && started) { depth--; if (depth === 0) { i++; break } }
  }
  const metaSrc = src.slice(startIdx + marker.length, i)
  try {
    return { meta: new Function(`return (${metaSrc})`)(), src }
  } catch (e) {
    return { _error: e.message }
  }
}

// Lightweight JSON Schema validator (handles enum, type, required, properties — enough for our schemas)
function validateValue(value, schema, path = '') {
  const errors = []
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path || '<value>'}: expected one of [${schema.enum.join(', ')}], got ${JSON.stringify(value)}`)
  }
  if (schema.type === 'string' && typeof value !== 'string') {
    errors.push(`${path || '<value>'}: expected string, got ${typeof value}`)
  }
  if (schema.type === 'integer' && (!Number.isInteger(value))) {
    errors.push(`${path || '<value>'}: expected integer, got ${typeof value}`)
  }
  if (schema.type === 'number' && typeof value !== 'number') {
    errors.push(`${path || '<value>'}: expected number, got ${typeof value}`)
  }
  if (schema.type === 'boolean' && typeof value !== 'boolean') {
    errors.push(`${path || '<value>'}: expected boolean, got ${typeof value}`)
  }
  if (schema.type === 'array') {
    if (!Array.isArray(value)) errors.push(`${path || '<value>'}: expected array, got ${typeof value}`)
    else if (schema.items) value.forEach((item, i) => errors.push(...validateValue(item, schema.items, `${path}[${i}]`)))
  }
  if (schema.type === 'object' && schema.properties) {
    if (typeof value !== 'object' || value === null) errors.push(`${path || '<value>'}: expected object, got ${typeof value}`)
    else {
      for (const r of (schema.required || [])) {
        if (!(r in value)) errors.push(`${path}.${r}: required field missing`)
      }
      for (const [k, v] of Object.entries(value)) {
        if (schema.properties[k]) errors.push(...validateValue(v, schema.properties[k], `${path}.${k}`))
      }
    }
  }
  return errors
}

function extractSchemas(src) {
  const schemas = {}
  const re = /const\s+(\w+_SCHEMA)\s*=\s*(\{[\s\S]*?\n\})/g
  let m
  while ((m = re.exec(src)) !== null) {
    try {
      schemas[m[1]] = new Function(`return (${m[2]})`)()
    } catch {}
  }
  return schemas
}

async function loadFixture(workflowName) {
  const fixturePath = join(FIXTURES_DIR, `${workflowName}.json`)
  if (!existsSync(fixturePath)) return null
  try {
    return JSON.parse(await readFile(fixturePath, 'utf8'))
  } catch (e) {
    return { _error: `fixture parse: ${e.message}` }
  }
}

async function testWorkflow(workflowFile) {
  const wfName = basename(workflowFile, '.js')
  const fullPath = join(WORKFLOWS_DIR, workflowFile)
  const parsed = await parseMeta(fullPath)
  if (!parsed?.meta) return { name: wfName, status: 'parse-error' }

  const fixture = await loadFixture(wfName)
  if (!fixture) return { name: wfName, status: 'no-fixture', portable: parsed.meta.acos?.portable }
  if (fixture._error) return { name: wfName, status: 'fixture-error', issue: fixture._error }

  const schemas = extractSchemas(parsed.src)
  const issues = []

  // Validate args shape
  if (fixture.args !== undefined && parsed.meta.acos?.argsSchema) {
    issues.push(...validateValue(fixture.args, parsed.meta.acos.argsSchema, 'args'))
  }

  // Validate each expectedOutput[*] against the named schema if provided
  if (fixture.expectedOutputs) {
    for (const [schemaName, sampleOutput] of Object.entries(fixture.expectedOutputs)) {
      if (!schemas[schemaName]) {
        issues.push(`expectedOutputs.${schemaName}: schema not found in workflow source`)
        continue
      }
      issues.push(...validateValue(sampleOutput, schemas[schemaName], `expectedOutputs.${schemaName}`))
    }
  }

  return {
    name: wfName,
    status: issues.length ? 'fail' : 'pass',
    portable: parsed.meta.acos?.portable,
    fixtureFields: Object.keys(fixture),
    schemasChecked: Object.keys(fixture.expectedOutputs || {}),
    issues,
  }
}

const workflowFiles = (await readdir(WORKFLOWS_DIR)).filter(f => f.endsWith('.js')).sort()
const results = []
for (const f of workflowFiles) results.push(await testWorkflow(f))

const mode = process.argv[2] ?? 'human'

if (mode === 'json') {
  console.log(JSON.stringify(results, null, 2))
} else {
  const pass = results.filter(r => r.status === 'pass').length
  const fail = results.filter(r => r.status === 'fail').length
  const missing = results.filter(r => r.status === 'no-fixture')
  const missingPortable = missing.filter(r => r.portable).length
  console.log(`\nWorkflow smoke tests: ${pass} pass · ${fail} fail · ${missing.length} no-fixture (${missingPortable} portable)\n`)
  for (const r of results) {
    const badge = r.status === 'pass' ? '✓' : r.status === 'fail' ? '✗' : r.status === 'no-fixture' ? '·' : '?'
    const tag = r.portable ? '[portable]' : '[local]   '
    console.log(`${badge} ${tag} ${r.name}${r.schemasChecked?.length ? ` · ${r.schemasChecked.length} schema(s) checked` : ''}`)
    for (const i of (r.issues || [])) console.log(`    ${i}`)
  }
  console.log()
  if (fail > 0) process.exit(1)
  // Warn (don't fail) for portable workflows missing fixtures — they're required for the product
  if (missingPortable > 0) {
    console.error(`WARN: ${missingPortable} portable workflow(s) lack fixtures. Required for commercial launch.`)
  }
}
