#!/usr/bin/env node

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, win32 } from 'node:path'
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
    claude: readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8'),
    contributing: readFileSync(join(ROOT, 'CONTRIBUTING.md'), 'utf8'),
    packageJson: readJson(join(ROOT, 'package.json')),
    packageLock: readJson(join(ROOT, 'package-lock.json')),
    plugin: readJson(join(ROOT, '.claude-plugin', 'plugin.json')),
    opencode: readJson(join(ROOT, 'opencode.json')),
    install: readFileSync(join(ROOT, 'install.sh'), 'utf8'),
    rules: readJson(join(ROOT, '.claude', 'skill-rules.json')),
  }
}

function measureRepository(rules) {
  const skillFiles = walkFiles(
    join(ROOT, '.claude', 'skills'),
    (name) => name === 'SKILL.md'
  )
  const emptySkillPaths = skillFiles
    .filter((path) => readFileSync(path).length === 0)
    .map((path) => path.slice(ROOT.length + 1).replaceAll('\\', '/'))
    .sort()

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
    skillFiles: skillFiles.length,
    nonEmptySkillModules: skillFiles.length - emptySkillPaths.length,
    emptySkillPlaceholders: emptySkillPaths.length,
    emptySkillPaths,
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
  const metrics = {
    nonEmptySkillModules: {
      expected: 174,
      readme: 'Non-empty skill modules | 174',
      quickstart: '174 non-empty skill modules',
      claude: '174 Non-empty Skill Modules',
    },
    emptySkillPlaceholders: {
      expected: 5,
      readme: 'Empty skill placeholders | 5',
      quickstart: '5 empty skill placeholders',
      claude: '5 tracked empty placeholders',
    },
    topLevelCommands: {
      expected: 85,
      readme: 'Top-level slash commands | 85',
      quickstart: '85 top-level slash-command definitions',
      claude: '85 Top-level Commands',
    },
    topLevelAgents: {
      expected: 69,
      readme: 'Top-level agent profiles | 69',
      quickstart: '69 top-level agent profiles',
      claude: '69 Top-level Agent Profiles',
    },
    installableShellHooks: {
      expected: 9,
      readme: 'Installable shell hooks | 9',
      quickstart: '9 installable shell hooks',
      claude: '9 Installable Shell Hooks',
    },
    activationRules: {
      expected: 32,
      readme: 'Activation rules | 32',
      quickstart: '32 activation rules',
      claude: 'provides 32 activation rules',
    },
  }

  const expected = Object.fromEntries(
    Object.entries(metrics).map(([key, metric]) => [key, metric.expected])
  )

  for (const [key, metric] of Object.entries(metrics)) {
    assert.equal(
      measured[key],
      metric.expected,
      `${key} drifted: expected ${metric.expected}, measured ${measured[key]}`
    )
    for (const document of ['readme', 'quickstart', 'claude']) {
      const claim = metric[document]
      assert.ok(
        canonical[document].includes(claim),
        `${document} is missing measured claim: ${claim}`
      )
    }
  }

  const stats = canonical.plugin.stats
  assert.deepEqual(
    {
      nonEmptySkillModules: stats.nonEmptySkillModules,
      emptySkillPlaceholders: stats.emptySkillPlaceholders,
      topLevelCommands: stats.topLevelCommands,
      topLevelAgents: stats.topLevelAgents,
      installableShellHooks: stats.installableShellHooks,
      activationRules: stats.activationRules,
    },
    expected,
    '.claude-plugin/plugin.json stats drifted'
  )
  assert.equal(
    stats.verifiedBy,
    'npm run verify:public-surface',
    '.claude-plugin/plugin.json verification command drifted'
  )

  assert.deepEqual(measured.emptySkillPaths, [
    '.claude/skills/nextjs-react-expert/SKILL.md',
    '.claude/skills/oracle-database-expert/SKILL.md',
    '.claude/skills/product-management-expert/SKILL.md',
    '.claude/skills/social-media-strategy/SKILL.md',
    '.claude/skills/video-production-workflow/SKILL.md',
  ])
}

function verifyLicenseTruth(canonical) {
  const license = readFileSync(join(ROOT, 'LICENSE'), 'utf8')
  const licensing = readFileSync(join(ROOT, 'LICENSING.md'), 'utf8')
  const notice = readFileSync(join(ROOT, 'NOTICE'), 'utf8')
  assert.match(license, /Apache License/)
  assert.match(license, /Version 2\.0/)
  assert.match(licensing, /Frank Riemer/)
  assert.match(licensing, /historical grants/)
  assert.match(notice, /Frank Riemer/)
  assert.equal(canonical.packageJson.license, 'Apache-2.0')
  assert.equal(canonical.plugin.license, 'Apache-2.0')
  assert.equal(canonical.packageLock.packages[''].license, 'Apache-2.0')
  assert.equal(canonical.packageJson.author, 'Frank Riemer <frank@frankx.ai>')
  for (const document of [canonical.readme, canonical.quickstart, canonical.contributing]) {
    assert.match(document, /Apache-2\.0/)
    assert.match(document, /LICENSING\.md/)
    assert.doesNotMatch(document, /no project-wide license file/i)
  }
}

function verifyMarketplaceTruth(canonical) {
  const marketplacePath = join(ROOT, '.claude-plugin', 'marketplace.json')
  const marketplace = readJson(marketplacePath)
  assert.equal(marketplace.name, 'frankx-creator')
  assert.equal(marketplace.plugins.length, 1)
  assert.equal(marketplace.plugins[0].name, 'creator-os-core')
  assert.equal(marketplace.plugins[0].source.path, './plugins/creator-os-core')

  const pluginRoot = join(ROOT, 'plugins', 'creator-os-core')
  const skillDirs = readdirSync(join(pluginRoot, 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
  assert.deepEqual(skillDirs, [
    'handoff-clean',
    'review-a-diff',
    'run-the-checks',
    'start-safely',
    'stated-voice',
  ])
  for (const skill of skillDirs) {
    const body = readFileSync(join(pluginRoot, 'skills', skill, 'SKILL.md'), 'utf8')
    assert.match(body, /^---\nname: /)
    assert.doesNotMatch(body, /C:\\Users\\|\/Users\/frank|starlight\/repos/)
  }
  assert.equal(existsSync(join(pluginRoot, 'commands', 'acos.md')), true)
  assert.match(canonical.readme, /claude plugin marketplace add frankxai\/agentic-creator-os/)
  assert.match(canonical.readme, /grok plugin install creator-os-core --trust/)
  assert.doesNotMatch(canonical.readme, /npx @frankx\/acos/)
  assert.doesNotMatch(canonical.readme, /not currently presented as a Claude marketplace installation/)
}

function verifyPortablePublicConfig(canonical) {
  for (const [name, server] of Object.entries(canonical.opencode.mcp ?? {})) {
    if (server.type !== 'local') continue

    assert.ok(Array.isArray(server.command), `local MCP ${name} must declare a command array`)
    for (const token of server.command) {
      assert.equal(typeof token, 'string', `local MCP ${name} command tokens must be strings`)
      assert.ok(
        !isAbsolute(token) && !win32.isAbsolute(token),
        `local MCP ${name} command contains an absolute path: ${token}`
      )
    }
  }
}

function smokeInstall(canonical, measured, symlinkFixtureOnly = false) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'acos-public-surface-'))
  const claudeHome = join(tempRoot, 'claude-home')
  const collisionHome = join(tempRoot, 'collision-home')
  const parentCollisionHome = join(tempRoot, 'parent-collision-home')
  const stateCollisionHome = join(tempRoot, 'state-collision-home')
  const linkedSourceHome = join(tempRoot, 'linked-source-home')
  const linkedSourceRoot = join(tempRoot, 'linked-source-repo')
  const linkedParentHome = join(tempRoot, 'linked-parent-home')
  const linkedParentRoot = join(tempRoot, 'linked-parent-repo')
  const outsideSkill = join(tempRoot, 'outside-skill')
  const outsideSkillsRoot = join(tempRoot, 'outside-skills-root')
  const firstAgent = readdirSync(join(ROOT, '.claude', 'agents'))
    .find((name) => name.endsWith('.md'))
  assert.ok(firstAgent, 'the installer needs a real agent collision fixture')

  const install = (home) => execFileSync('bash', [join(ROOT, 'install.sh'), '--platform=claude', '--minimal'], {
    cwd: ROOT,
    env: {
      ...process.env,
      HOME: tempRoot,
      CLAUDE_HOME: home,
    },
    stdio: 'pipe',
  })

  try {
    mkdirSync(join(linkedSourceRoot, '.claude', 'skills'), { recursive: true })
    mkdirSync(outsideSkill)
    writeFileSync(join(outsideSkill, 'SKILL.md'), 'foreign source must not install\n')
    copyFileSync(join(ROOT, 'install.sh'), join(linkedSourceRoot, 'install.sh'))
    symlinkSync(
      outsideSkill,
      join(linkedSourceRoot, '.claude', 'skills', 'linked-skill'),
      process.platform === 'win32' ? 'junction' : 'dir',
    )
    assert.throws(() => execFileSync('bash', [join(linkedSourceRoot, 'install.sh'), '--platform=claude', '--minimal'], {
      cwd: linkedSourceRoot,
      env: { ...process.env, HOME: tempRoot, CLAUDE_HOME: linkedSourceHome },
      stdio: 'pipe',
    }), /Command failed/, 'a linked skill source must stop before any profile write')
    assert.equal(existsSync(linkedSourceHome), false,
      'linked skill source must not create the destination profile')

    mkdirSync(join(outsideSkillsRoot, 'ordinary-skill'), { recursive: true })
    writeFileSync(join(outsideSkillsRoot, 'ordinary-skill', 'SKILL.md'), 'parent link must not install\n')
    mkdirSync(join(linkedParentRoot, '.claude'), { recursive: true })
    copyFileSync(join(ROOT, 'install.sh'), join(linkedParentRoot, 'install.sh'))
    symlinkSync(
      outsideSkillsRoot,
      join(linkedParentRoot, '.claude', 'skills'),
      process.platform === 'win32' ? 'junction' : 'dir',
    )
    assert.throws(() => execFileSync('bash', [join(linkedParentRoot, 'install.sh'), '--platform=claude', '--minimal'], {
      cwd: linkedParentRoot,
      env: { ...process.env, HOME: tempRoot, CLAUDE_HOME: linkedParentHome },
      stdio: 'pipe',
    }), /Command failed/, 'a linked skills parent must stop before any profile write')
    assert.equal(existsSync(linkedParentHome), false,
      'linked skills parent must not create the destination profile')

    if (symlinkFixtureOnly) return

    mkdirSync(parentCollisionHome)
    const blockedParent = join(parentCollisionHome, 'skills')
    writeFileSync(blockedParent, 'preexisting user file\n')
    assert.throws(() => install(parentCollisionHome), /Command failed/)
    assert.equal(readFileSync(blockedParent, 'utf8'), 'preexisting user file\n')
    assert.deepEqual(readdirSync(parentCollisionHome), ['skills'],
      'non-directory ancestor must stop installation before any profile writes')

    const blockedState = join(stateCollisionHome, 'acos', 'state.json')
    mkdirSync(blockedState, { recursive: true })
    assert.throws(() => install(stateCollisionHome), /Command failed/)
    assert.deepEqual(readdirSync(stateCollisionHome), ['acos'],
      'a state-file type collision must stop before any profile writes')
    assert.deepEqual(readdirSync(join(stateCollisionHome, 'acos')), ['state.json'])

    const collisionPath = join(collisionHome, 'agents', firstAgent)
    mkdirSync(dirname(collisionPath), { recursive: true })
    writeFileSync(collisionPath, 'preexisting user agent\n')
    assert.throws(() => install(collisionHome), /Command failed/)
    assert.equal(readFileSync(collisionPath, 'utf8'), 'preexisting user agent\n')
    assert.equal(existsSync(join(collisionHome, 'skills')), false,
      'collision preflight must stop before the first directory is written')

    install(claudeHome)

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

    install(claudeHome)
    const installedAgentPath = join(claudeHome, 'agents', firstAgent)
    writeFileSync(installedAgentPath, 'locally edited agent\n')
    assert.throws(() => install(claudeHome), /Command failed/)
    assert.equal(readFileSync(installedAgentPath, 'utf8'), 'locally edited agent\n')
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
const symlinkFixtureOnly = process.argv.includes('--symlink-fixture-only')
smokeInstall(canonical, measured, symlinkFixtureOnly)

if (symlinkFixtureOnly) {
  console.log('Claude source-symlink fixtures passed without profile writes')
} else console.log(
  JSON.stringify(
    {
      version: canonical.packageJson.version,
      ...measured,
      licenseFile: 'LICENSE',
      license: canonical.packageJson.license,
      marketplaceManifest: existsSync(join(ROOT, '.claude-plugin', 'marketplace.json')),
      claudeInstallSmoke: 'passed',
    },
    null,
    2
  )
)
