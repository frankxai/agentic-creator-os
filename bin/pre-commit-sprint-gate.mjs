#!/usr/bin/env node
/**
 * ACOS v14 Role-Based Directory Isolation pre-commit hook.
 * Integrates into Husky/Git Hooks.
 */
import { execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPRINT_PATH = join(__dirname, '..', '.acos', 'sprint.json')

if (!existsSync(SPRINT_PATH)) {
  console.log('[ACOS Gate] No active sprint state. Skipping boundaries check.')
  process.exit(0)
}

const sprintState = JSON.parse(readFileSync(SPRINT_PATH, 'utf-8'))
const currentPhase = sprintState.phase
const roles = sprintState.roles

// Determine committer role
let activeRole = process.env.ACOS_ROLE
if (!activeRole) {
  // Fallback: Infer from git branch names (e.g., agent/dev/feature -> Engineer)
  try {
    const branchName = execSync('git branch --show-current').toString().trim()
    if (branchName.includes('dev') || branchName.includes('engineer')) {
      activeRole = 'Engineer'
    } else if (branchName.includes('design')) {
      activeRole = 'Designer'
    } else if (branchName.includes('pm') || branchName.includes('product')) {
      activeRole = 'PM'
    } else if (branchName.includes('qa') || branchName.includes('test')) {
      activeRole = 'QA'
    } else {
      activeRole = 'CEO' // Default to operator
    }
  } catch (e) {
    activeRole = 'CEO'
  }
}

console.log(`[ACOS Gate] Current Phase: ${currentPhase} | Committing as: ${activeRole}`)

// Get list of staged files
let stagedFiles = []
try {
  stagedFiles = execSync('git diff --cached --name-only')
    .toString()
    .split('\n')
    .map(f => f.trim())
    .filter(f => f.length > 0)
} catch (e) {
  console.log('[ACOS Gate] Not a git repository or no staged files. Skipping checks.')
  process.exit(0)
}

// 1. Phase-to-Directory Gate Boundaries
for (const file of stagedFiles) {
  // Restrict code modifications outside of BUILD phase
  if (currentPhase === 'THINK' || currentPhase === 'PLAN') {
    if (file.startsWith('src/') || file.startsWith('app/') || file.startsWith('lib/')) {
      console.error(`\x1b[31m[ACOS Violation] Cannot modify source code files during ${currentPhase} phase: ${file}\x1b[0m`)
      process.exit(1)
    }
  }

  if (currentPhase === 'BUILD') {
    // Lock specifications during BUILD phase
    if (file.includes('specs/') || file.includes('think/')) {
      console.error(`\x1b[31m[ACOS Violation] Specs are frozen during the BUILD phase: ${file}\x1b[0m`)
      process.exit(1)
    }
  }

  if (currentPhase === 'QA') {
    // Lock source code during QA phase (only test plans and evidence can change)
    if (file.startsWith('src/') || file.startsWith('app/') || file.startsWith('lib/')) {
      console.error(`\x1b[31m[ACOS Violation] Codebase is locked during QA phase. Rollback to BUILD to make changes: ${file}\x1b[0m`)
      process.exit(1)
    }
  }

  // 2. Role-to-Directory Permission Gates
  if (activeRole === 'PM') {
    // PM can only modify specs/think docs
    if (!file.includes('specs/') && !file.includes('think/')) {
      console.error(`\x1b[31m[ACOS Role Violation] PM role cannot modify code or assets: ${file}\x1b[0m`)
      process.exit(1)
    }
  }

  if (activeRole === 'Designer') {
    // Designer can only touch design specs, design assets, and styling files
    const allowed = file.includes('design-spec.md') || file.includes('public/images/') || file.includes('tailwind.config.js')
    if (!allowed) {
      console.error(`\x1b[31m[ACOS Role Violation] Designer role is restricted to design spec and assets: ${file}\x1b[0m`)
      process.exit(1)
    }
  }

  if (activeRole === 'QA') {
    // QA can only touch test specs and logs
    if (!file.includes('qa-plan.md') && !file.includes('tests/') && !file.includes('qa/')) {
      console.error(`\x1b[31m[ACOS Role Violation] QA role can only commit tests and evidence: ${file}\x1b[0m`)
      process.exit(1)
    }
  }
}

console.log('\x1b[32m[ACOS Gate] Commit permissions verified successfully.\x1b[0m')
process.exit(0)
