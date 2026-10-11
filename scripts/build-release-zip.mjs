#!/usr/bin/env node
/**
 * ACOS release packager — builds release zip archive in dist/ based on package.json
 * SSOT version and verifies clean installation on an isolated profile.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const version = pkg.version

assert.ok(version, 'package.json must declare a version')

const distDir = join(ROOT, 'dist')
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

const zipFilename = `agentic-creator-os-v${version}.zip`
const zipPath = join(distDir, zipFilename)

if (existsSync(zipPath)) {
  rmSync(zipPath, { force: true })
}

const filesToInclude = [
  'install.sh',
  'package.json',
  'package-lock.json',
  'CLAUDE.md',
  'README.md',
  'QUICKSTART.md',
  'LICENSING.md',
  'LICENSE',
  'NOTICE',
  'opencode.json',
  '.claude',
  '.claude-plugin',
  'bin',
  'skills',
  'mcp-servers',
  'docs',
]

console.log(`Creating release zip archive: ${zipFilename}...`)
execFileSync('zip', ['-rq', zipPath, ...filesToInclude], {
  cwd: ROOT,
  stdio: 'pipe',
})

assert.ok(existsSync(zipPath), `Release zip file was not created at ${zipPath}`)
const stat = statSync(zipPath)
console.log(`✓ Release zip created successfully (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`)

// Clean profile installation verification
console.log('Verifying clean profile installation in isolated environment...')
const tempRoot = mkdtempSync(join(tmpdir(), 'acos-clean-profile-'))
const claudeHome = join(tempRoot, 'claude-home')

try {
  execFileSync('bash', [join(ROOT, 'install.sh'), '--platform=claude', '--minimal'], {
    cwd: ROOT,
    env: {
      ...process.env,
      HOME: tempRoot,
      CLAUDE_HOME: claudeHome,
    },
    stdio: 'pipe',
  })

  assert.ok(existsSync(join(claudeHome, 'skill-rules.json')), 'skill-rules.json missing in clean profile')
  assert.ok(existsSync(join(claudeHome, 'acos', 'state.json')), 'acos/state.json missing in clean profile')

  const state = JSON.parse(readFileSync(join(claudeHome, 'acos', 'state.json'), 'utf8'))
  assert.equal(state.version, version, `Installed state version (${state.version}) does not match package.json SSOT (${version})`)

  console.log('✓ Clean profile installation verified successfully')
} finally {
  rmSync(tempRoot, { recursive: true, force: true })
}

console.log(`Release package complete: ${zipPath}`)
