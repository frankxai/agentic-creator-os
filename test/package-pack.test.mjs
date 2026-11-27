// Guards what `npm publish` would ship. Runs `npm pack --dry-run --json`
// against the repo root and checks the receipt, not the allowlist text.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

function packReceipt() {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const stdout = execFileSync(
    npm,
    ['pack', '--dry-run', '--json', '--ignore-scripts'],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }
  )
  const parsed = JSON.parse(stdout)
  assert.ok(Array.isArray(parsed) && parsed.length === 1, 'expected one pack result')
  return parsed[0]
}

const receipt = packReceipt()
const files = receipt.files.map((f) => f.path)

const FORBIDDEN = [
  { name: '.env files', re: /(^|\/)\.env($|\.)/ },
  { name: 'node_modules', re: /(^|\/)node_modules\// },
  { name: '.git', re: /(^|\/)\.git(\/|$)/ },
  { name: '.claude settings', re: /(^|\/)\.claude\/settings[^/]*$/ },
  { name: 'test fixtures', re: /(^|\/)(fixtures?|__fixtures__)\// },
  { name: 'private keys', re: /\.(pem|key|p12|pfx)$/i },
  { name: 'npm auth', re: /(^|\/)\.npmrc$/ },
]

test('packs under the scope we own', () => {
  assert.equal(pkg.name, '@frankxai/agentic-creator-os')
  assert.equal(receipt.name, pkg.name)
  assert.equal(receipt.version, pkg.version)
  assert.equal(pkg.publishConfig?.access, 'public')
  assert.equal(pkg.repository?.url, 'git+https://github.com/frankxai/agentic-creator-os.git')
})

test('every bin target exists, is executable, and ships', () => {
  const bins = Object.entries(pkg.bin ?? {})
  assert.ok(bins.length > 0, 'package.json declares no bin entries')
  for (const [cmd, target] of bins) {
    const rel = target.replace(/^\.\//, '')
    const abs = join(ROOT, rel)
    assert.ok(existsSync(abs), `bin ${cmd} -> ${target} does not exist`)
    if (process.platform !== 'win32') {
      assert.ok(statSync(abs).mode & 0o111, `bin ${cmd} -> ${target} is not executable`)
    }
    assert.ok(files.includes(rel), `bin ${cmd} -> ${target} is not in the packed file list`)
  }
})

test('no forbidden paths in the packed file list', () => {
  for (const { name, re } of FORBIDDEN) {
    const hits = files.filter((f) => re.test(f))
    assert.deepEqual(hits, [], `pack would ship ${name}: ${hits.join(', ')}`)
  }
})

test('pack ships the files the installer needs', () => {
  for (const required of ['package.json', 'README.md', 'install.sh', 'LICENSE']) {
    assert.ok(files.includes(required), `pack is missing ${required}`)
  }
})
