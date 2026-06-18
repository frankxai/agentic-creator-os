import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_DIR = path.resolve(__dirname, '..')
const VERSION = "15.0.0"

// Parse command line arguments
const args = process.argv.slice(2)
const getArgVal = (name) => {
  const arg = args.find(a => a.startsWith(`--${name}=`))
  return arg ? arg.split('=')[1] : null
}

const platform = getArgVal('platform') || 'generic'
const mode = getArgVal('mode') || 'standard'
const targetDir = path.resolve(getArgVal('target') || '.')

console.log(`\n🚀 Starting Agentic Creator OS Setup Engine v${VERSION}...`)
console.log(`Target Directory: ${targetDir}`)
console.log(`Platform Option:  ${platform}`)
console.log(`Mode Option:      ${mode}\n`)

// Ensure target dir exists
fs.mkdirSync(targetDir, { recursive: true })

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// 1. Install standard skills, agents, commands
function installStandardAssets() {
  console.log("Installing ACOS standard skills & agents...")
  
  // Skills
  const srcSkills = path.join(PROJECT_DIR, '.claude', 'skills')
  const destSkills = path.join(targetDir, '.claude', 'skills')
  if (fs.existsSync(srcSkills)) {
    copyDirRecursive(srcSkills, destSkills)
    console.log("✓ Copied ACOS skills pack.")
  }

  // Skill rules (auto-activation)
  const srcRules = path.join(PROJECT_DIR, '.claude', 'skill-rules.json')
  const destRules = path.join(targetDir, '.claude', 'skill-rules.json')
  if (fs.existsSync(srcRules)) {
    fs.copyFileSync(srcRules, destRules)
    console.log("✓ Installed skill auto-activation rules.")
  }

  // Commands
  const srcCommands = path.join(PROJECT_DIR, '.claude', 'commands')
  const destCommands = path.join(targetDir, '.claude', 'commands')
  if (fs.existsSync(srcCommands)) {
    copyDirRecursive(srcCommands, destCommands)
    console.log("✓ Copied slash commands.")
  }

  // Agents
  const srcAgents = path.join(PROJECT_DIR, '.claude', 'agents')
  const destAgents = path.join(targetDir, '.claude', 'agents')
  if (fs.existsSync(srcAgents)) {
    copyDirRecursive(srcAgents, destAgents)
    console.log("✓ Copied agent profiles.")
  }
}

// 2. Platform Specific logic
function configurePlatform() {
  if (platform === 'claude' || platform === 'all') {
    console.log("Configuring Claude Code harness...")
    fs.mkdirSync(path.join(targetDir, '.claude', 'acos'), { recursive: true })
  }

  if (platform === 'grok' || platform === 'all') {
    console.log("Configuring xAI Grok harness...")
    const grokDir = path.join(targetDir, '.grok')
    fs.mkdirSync(grokDir, { recursive: true })
    
    // Copy grok personal seeds from adapters/grok if exists, else write default seeds
    const seedDest = path.join(grokDir, 'skills')
    fs.mkdirSync(seedDest, { recursive: true })
    fs.writeFileSync(path.join(targetDir, 'GROK.md'), `# xAI Grok Harness v${VERSION}\n\nRunning Agentic Creator OS on Grok.`, 'utf-8')
    console.log("✓ Grok seeds and GROK.md created.")
  }

  if (platform === 'antigravity' || platform === 'agy' || platform === 'all') {
    console.log("Configuring Google Antigravity harness...")
    const agyDir = path.join(targetDir, '.antigravity')
    fs.mkdirSync(agyDir, { recursive: true })
    fs.writeFileSync(
      path.join(agyDir, 'instructions.md'),
      `# Antigravity-Native ACOS Operating Instructions v${VERSION}\n\nRunning ACOS on Antigravity/Gemini.`,
      'utf-8'
    )
    console.log("✓ Antigravity instructions created.")
  }

  if (platform === 'cursor' || platform === 'all') {
    console.log("Configuring Cursor rules...")
    fs.writeFileSync(path.join(targetDir, '.cursorrules'), `# Cursor Rules v${VERSION}\n\nRunning ACOS skills inside Cursor.`, 'utf-8')
    console.log("✓ .cursorrules created.")
  }

  if (platform === 'codex' || platform === 'all') {
    console.log("Configuring OpenAI Codex rules...")
    fs.mkdirSync(path.join(targetDir, '.codex'), { recursive: true })
    fs.writeFileSync(path.join(targetDir, '.codexrules'), `# Codex Rules v${VERSION}`, 'utf-8')
    console.log("✓ OpenAI Codex rules created.")
  }
}

// 3. Setup git hooks & overlays & database
function setupHooksAndOverlays() {
  const gitDir = path.join(targetDir, '.git')
  if (fs.existsSync(gitDir)) {
    console.log("Git repository detected. Installing combined pre-commit hook...")
    const hookDest = path.join(gitDir, 'hooks', 'pre-commit')
    const hookContent = `#!/usr/bin/env bash
# Combined ACOS Pre-commit hook v${VERSION}
PROJECT_DIR="\$(git rev-parse --show-toplevel)"
bash "\$PROJECT_DIR/bin/pre-commit-partition-gate.sh"
node "\$PROJECT_DIR/bin/pre-commit-sprint-gate.mjs"
`
    try {
      fs.writeFileSync(hookDest, hookContent, 'utf-8')
      fs.chmodSync(hookDest, '755')
      console.log("✓ Installed and configured git pre-commit hook.")
    } catch (e) {
      console.log(`⚠️ Failed to install pre-commit hook: ${e.message}`)
    }
  }

  // Initialize SQLite database
  console.log("Bootstrapping SQLite Trajectory Database (AgentDB)...")
  try {
    execSync(`node "${path.join(PROJECT_DIR, 'scripts', 'agentdb-init.mjs')}" --target="${targetDir}"`, { stdio: 'inherit' })
  } catch (e) {
    console.log(`⚠️ Failed to bootstrap AgentDB: ${e.message}`)
  }

  // Symlink .personal overlays if folder exists
  const personalSrc = path.join(PROJECT_DIR, '.personal')
  if (fs.existsSync(personalSrc)) {
    console.log("Personal partition folder found. Creating junctions...")
    const personalDest = path.join(targetDir, '.personal')
    if (!fs.existsSync(personalDest)) {
      try {
        fs.symlinkSync(personalSrc, personalDest, 'junction')
        console.log("✓ Symlinked .personal overlay folder.")
      } catch (e) {
        console.log(`⚠️ Symlink failed: ${e.message}`)
      }
    }
  }
}

// Execution
installStandardAssets()
configurePlatform()
setupHooksAndOverlays()

console.log(`\n🎉 ACOS v${VERSION} Setup Complete.\n`)
