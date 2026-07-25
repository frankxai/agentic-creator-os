#!/usr/bin/env node

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function walkFiles(path, predicate, files = []) {
  if (!existsSync(path)) return files

  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const fullPath = join(path, entry.name)
    if (entry.isDirectory()) {
      walkFiles(fullPath, predicate, files)
    } else if (entry.isFile() && predicate(entry.name, fullPath)) {
      files.push(fullPath)
    }
  }

  return files
}

function countTopLevel(path, predicate) {
  return readdirSync(path, { withFileTypes: true }).filter(predicate).length
}

function readCanonicalFiles() {
  return {
    readme: readFileSync(join(ROOT, 'README.md'), 'utf8'),
    quickstart: readFileSync(join(ROOT, 'QUICKSTART.md'), 'utf8'),
    contributing: readFileSync(join(ROOT, 'CONTRIBUTING.md'), 'utf8'),
    packageJson: readJson(join(ROOT, 'package.json')),
    packageLock: readJson(join(ROOT, 'package-lock.json')),
    plugin: readJson(join(ROOT, '.claude-plugin', 'plugin.json')),
    opencode: readFileSync(join(ROOT, 'opencode.json'), 'utf8'),
    install: readFileSync(join(ROOT, 'install.sh'), 'utf8'),
    rules: readJson(join(ROOT, '.claude', 'skill-rules.json')),
  }
}

function measureRepository(rules) {
  const skillModules = walkFiles(
    join(ROOT, '.claude', 'skills'),
    (name) => name === 'SKILL.md'
  ).length

  const topLevelCommands = countTopLevel(
    join(ROOT, '.claude', 'commands'),
    (entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'CLAUDE.md'
  )

  const topLevelAgents = countTopLevel(
    join(ROOT, '.claude', 'agents'),
    (entry) =>
      entry.isFile() &&
      (entry.name.endsWith('.md') || entry.name.endsWith('.json')) &&
      entry.name !== 'CLAUDE.md'
  )

  const installableShellHooks = countTopLevel(
    join(ROOT, '.claude', 'hooks'),
    (entry) => entry.isFile() && entry.name.endsWith('.sh')
  )

  const activationRules = Array.isArray(rules.activation_rules)
    ? rules.activation_rules.length
    : 0

  const installSkillGroups = countTopLevel(
    join(ROOT, '.claude', 'skills'),
    (entry) => entry.isDirectory()
  )

  const installCommandFiles = countTopLevel(
    join(ROOT, '.claude', 'commands'),
    (entry) => entry.isFile() && entry.name.endsWith('.md')
  )

  const installAgentFiles = countTopLevel(
    join(ROOT, '.claude', 'agents'),
    (entry) =>
      entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.json'))
  )

  return {
    skillModules,
    topLevelCommands,
    topLevelAgents,
    installableShellHooks,
    activationRules,
    installSkillGroups,
    installCommandFiles,
    installAgentFiles,
  }
}

function verifyVersion(canonical) {
  const installVersion = canonical.install.match(/^VERSION="([^"]+)"$/m)?.[1]
  assert.ok(installVersion, 'install.sh must declare VERSION')
  assert.equal(canonical.packageJson.version, canonical.plugin.version)
  assert.equal(canonical.packageJson.version, installVersion)
}

function verifyClaims(canonical, measured) {
  const expected = {
    skillModules: 176,
    topLevelCommands: 83,
    topLevelAgents: 69,
    installableShellHooks: 9,
    activationRules: 32,
  }

  for (const [key, value] of Object.entries(expected)) {
    assert.equal(
      measured[key],
      value,
      `${key} drifted: expected ${value}, measured ${measured[key]}`
    )
  }

  const requiredReadmeClaims = [
    'Skill modules | 176',
    'Top-level slash commands | 83',
    'Top-level agent profiles | 69',
    'Installable shell hooks | 9',
    'Activation rules | 32',
  ]

  for (const claim of requiredReadmeClaims) {
    assert.ok(canonical.readme.includes(claim), `README is missing measured claim: ${claim}`)
  }

  const stats = canonical.plugin.stats
  assert.deepEqual(
    {
      skillModules: stats.skillModules,
      topLevelCommands: stats.topLevelCommands,
      topLevelAgents: stats.topLevelAgents,
      installableShellHooks: stats.installableShellHooks,
      activationRules: stats.activationRules,
    },
    expected,
    '.claude-plugin/plugin.json stats drifted'
  )
}

function verifyLicenseTruth(canonical) {
  const rootLicenseFiles = readdirSync(ROOT).filter((name) =>
    /^licen[sc]e(?:\..+)?$/i.test(name)
  )

  assert.equal(rootLicenseFiles.length, 0, 'license gate must be updated when terms are published')
  assert.ok(!('license' in canonical.packageJson), 'package.json must not claim a license')
  assert.ok(!('license' in canonical.plugin), 'plugin.json must not claim a license')
  assert.ok(
    !('license' in canonical.packageLock.packages['']),
    'package-lock root metadata must not claim a license'
  )

  assert.match(canonical.readme, /No project-wide license file is published/)
  assert.match(canonical.quickstart, /no project-wide license file/)
  assert.match(canonical.contributing, /no project-wide license file/)
}

function verifyMarketplaceTruth(canonical) {
  const marketplacePath = join(ROOT, '.claude-plugin', 'marketplace.json')
  assert.equal(
    existsSync(marketplacePath),
    false,
    'marketplace gate must be updated when a marketplace manifest is added'
  )
  assert.match(canonical.readme, /not currently presented as a Claude marketplace installation/)
  assert.doesNotMatch(
    canonical.readme,
    /claude plugin marketplace add frankxai\/agentic-creator-os/
  )
}

function verifyPortablePublicConfig(canonical) {
  assert.doesNotMatch(canonical.opencode, /[A-Z]:[\\/]Users[\\/]/i)
  assert.doesNotMatch(canonical.opencode, /\/(?:Users|home)\/[^/]+\//)
}

function smokeInstall(canonical, measured) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'acos-public-surface-'))
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

    const installedSkillGroups = countTopLevel(
      join(claudeHome, 'skills'),
      (entry) => entry.isDirectory()
    )
    const installedCommandFiles = countTopLevel(
      join(claudeHome, 'commands'),
      (entry) => entry.isFile() && entry.name.endsWith('.md')
    )
    const installedAgentFiles = countTopLevel(
      join(claudeHome, 'agents'),
      (entry) =>
        entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.json'))
    )
    const installedShellHooks = countTopLevel(
      join(claudeHome, 'acos', 'hooks'),
      (entry) => entry.isFile() && entry.name.endsWith('.sh')
    )

    assert.equal(installedSkillGroups, measured.installSkillGroups)
    assert.equal(installedCommandFiles, measured.installCommandFiles)
    assert.equal(installedAgentFiles, measured.installAgentFiles)
    assert.equal(installedShellHooks, measured.installableShellHooks)
    assert.ok(existsSync(join(claudeHome, 'skill-rules.json')))
    assert.ok(existsSync(join(claudeHome, 'acos', 'hooks.json')))

    const state = readJson(join(claudeHome, 'acos', 'state.json'))
    assert.equal(state.version, canonical.packageJson.version)
  } finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
}

const canonical = readCanonicalFiles()
const measured = measureRepository(canonical.rules)

verifyVersion(canonical)
verifyClaims(canonical, measured)
verifyLicenseTruth(canonical)
verifyMarketplaceTruth(canonical)
verifyPortablePublicConfig(canonical)
smokeInstall(canonical, measured)

console.log(
  JSON.stringify(
    {
      version: canonical.packageJson.version,
      ...measured,
      licenseFile: null,
      marketplaceManifest: false,
      claudeInstallSmoke: 'passed',
    },
    null,
    2
  )
)
