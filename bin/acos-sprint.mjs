#!/usr/bin/env node
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SPRINT_PATH = join(ROOT, '.acos', 'sprint.json')

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const BOLD = '\x1b[1m'
const NC = '\x1b[0m'

const WEDGE_TEMPLATE = `# Venture Wedge Spec
**Sprint ID:** {{sprintId}}

## 1. The Beachhead Market
*Define the highly specific customer segment we are targeting first.*
Provide detailed target persona demographics, motivations, and pain points.

## 2. The 10x Value Proposition
*Why is this feature/product 10 times better than the status quo for this specific customer?*
Explain the metrics of value increase or cost reduction.

## 3. Distribution Strategy
*How do we acquire the first 100 users for this feature without spending money?*
Identify specific channels, communities, or integrations.

## 4. Minimum Viable Metrics
*What are the core unit economics or conversion signals that validate this wedge?*
Define success targets.
`

const FALSIFIER_TEMPLATE = `# The Falsifier Spec
**Sprint ID:** {{sprintId}}

## 1. Core Hypothesis
*What must be true for this venture/sprint to succeed?*

## 2. Falsification Metrics
*What concrete, measurable data signal will prove our hypothesis wrong?*
- Metric: [e.g., Conversion Rate < 1.5%]
- Timeframe: [e.g., 7 days post-launch]

## 3. Disproof Conditions
*State the trigger that will result in the immediate rollback or pivot of this feature.*

## 4. Telemetry Plan
*Where and how are these signals tracked in code (e.g., Sentry, PostHog, Custom Events)?*
`

const SPEC_TEMPLATE = (title) => `# ${title} Spec
**Sprint ID:** {{sprintId}}

## 1. Scope & Requirements
Describe the details of this specification.

## 2. Deliverables
List the expected outcomes.
`

function ensureSprintDir() {
  const dir = dirname(SPRINT_PATH)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function readSprint() {
  if (!existsSync(SPRINT_PATH)) {
    return null
  }
  try {
    return JSON.parse(readFileSync(SPRINT_PATH, 'utf-8'))
  } catch (e) {
    console.error(`${RED}Error parsing sprint state file: ${e.message}${NC}`)
    process.exit(1)
  }
}

function writeSprint(state) {
  ensureSprintDir()
  writeFileSync(SPRINT_PATH, JSON.stringify(state, null, 2), 'utf-8')
}

// v14 Physical Artifact Validator
function verifyPhaseArtifacts(phase, sprintId) {
  const sprintDir = join(ROOT, '.acos', 'sprints', sprintId)
  
  if (phase === 'THINK') {
    const wedgePath = join(sprintDir, 'think', 'venture-wedge.md')
    const falsifierPath = join(sprintDir, 'think', 'falsifier.md')
    
    if (!existsSync(wedgePath)) {
      return { valid: false, error: `Missing YC Venture Wedge spec: ${wedgePath}` }
    }
    if (!existsSync(falsifierPath)) {
      return { valid: false, error: `Missing YC Falsifier spec: ${falsifierPath}` }
    }
    
    // Check for slop / empty placeholders
    const wedgeContent = readFileSync(wedgePath, 'utf-8')
    if (wedgeContent.includes('placeholder') || wedgeContent.trim().length < 100) {
      return { valid: false, error: 'Venture Wedge spec contains placeholders or is too short.' }
    }
  }
  
  if (phase === 'PLAN') {
    const specs = ['product-spec.md', 'design-spec.md', 'technical-spec.md', 'qa-plan.md']
    for (const spec of specs) {
      const specPath = join(sprintDir, 'specs', spec)
      if (!existsSync(specPath)) {
        return { valid: false, error: `Missing Plan Spec artifact: ${spec}` }
      }
    }
  }

  if (phase === 'QA') {
    const reportPath = join(sprintDir, 'qa', 'report.json')
    if (!existsSync(reportPath)) {
      return { valid: false, error: `Missing QA Report: ${reportPath}` }
    }
    try {
      const report = JSON.parse(readFileSync(reportPath, 'utf-8'))
      if (report.passed === false) {
        return { valid: false, error: 'QA Report indicates test suite failures.' }
      }
    } catch (e) {
      return { valid: false, error: `Failed to parse QA Report JSON: ${e.message}` }
    }
  }

  return { valid: true }
}

const handlers = {
  init(args) {
    const sprintId = args[0] || `sprint-${new Date().toISOString().slice(0, 10)}`
    
    // Create directories
    const sprintDir = join(ROOT, '.acos', 'sprints', sprintId)
    mkdirSync(join(sprintDir, 'think'), { recursive: true })
    mkdirSync(join(sprintDir, 'specs'), { recursive: true })
    mkdirSync(join(sprintDir, 'qa'), { recursive: true })

    // Generate YC specs
    writeFileSync(join(sprintDir, 'think', 'venture-wedge.md'), WEDGE_TEMPLATE.replace('{{sprintId}}', sprintId), 'utf-8')
    writeFileSync(join(sprintDir, 'think', 'falsifier.md'), FALSIFIER_TEMPLATE.replace('{{sprintId}}', sprintId), 'utf-8')

    // Generate plan specs
    writeFileSync(join(sprintDir, 'specs', 'product-spec.md'), SPEC_TEMPLATE('Product').replace('{{sprintId}}', sprintId), 'utf-8')
    writeFileSync(join(sprintDir, 'specs', 'design-spec.md'), SPEC_TEMPLATE('Design').replace('{{sprintId}}', sprintId), 'utf-8')
    writeFileSync(join(sprintDir, 'specs', 'technical-spec.md'), SPEC_TEMPLATE('Technical').replace('{{sprintId}}', sprintId), 'utf-8')
    writeFileSync(join(sprintDir, 'specs', 'qa-plan.md'), SPEC_TEMPLATE('QA Plan').replace('{{sprintId}}', sprintId), 'utf-8')

    const state = {
      sprintId,
      phase: 'THINK',
      roles: {
        CEO: 'operator',
        PM: 'acos-pm',
        Designer: 'acos-designer',
        Engineer: 'acos-engineer',
        QA: 'acos-qa'
      },
      gates: {
        THINK: { approved: false, signedBy: null, signedAt: null, notes: null },
        PLAN: { approved: false, signedBy: [], signedAt: null, notes: null },
        BUILD: { approved: false, signedBy: null, signedAt: null, notes: null },
        QA: { approved: false, signedBy: null, signedAt: null, notes: null }
      },
      history: [
        { event: 'init', phase: 'THINK', timestamp: new Date().toISOString() }
      ]
    }
    writeSprint(state)
    console.log(`${GREEN}Initialized sprint ${BOLD}${sprintId}${NC} in THINK phase. Scaffolding created.`)
  },

  status() {
    const state = readSprint()
    if (!state) {
      console.log(`${YELLOW}No active sprint found. Initialize one using: acos-sprint.mjs init [name]${NC}`)
      return
    }

    console.log(`\n${CYAN}${BOLD}=== SPRINT STATE: ${state.sprintId} ===${NC}`)
    console.log(`Active Phase:      ${BOLD}${state.phase}${NC}`)
    console.log(`\n${BOLD}Role Assignments:${NC}`)
    for (const [r, name] of Object.entries(state.roles)) {
      console.log(`  - ${r.padEnd(10)}: ${name || '(unassigned)'}`)
    }

    console.log(`\n${BOLD}Phase Gates:${NC}`)
    for (const [p, gate] of Object.entries(state.gates)) {
      const badge = gate.approved ? `${GREEN}✓ APPROVED${NC}` : `${RED}○ PENDING${NC}`
      const details = gate.signedBy ? ` (Signed by: ${Array.isArray(gate.signedBy) ? gate.signedBy.join(', ') : gate.signedBy})` : ''
      console.log(`  - ${p.padEnd(10)}: ${badge}${details}`)
    }

    console.log(`\n${BOLD}Next steps for phase ${state.phase}:${NC}`)
    switch (state.phase) {
      case 'THINK':
        console.log(`  - CEO must sign off: acos-sprint.mjs sign CEO --approve`)
        console.log(`  - Create and populate:`)
        console.log(`    .acos/sprints/${state.sprintId}/think/venture-wedge.md`)
        console.log(`    .acos/sprints/${state.sprintId}/think/falsifier.md`)
        break
      case 'PLAN':
        console.log(`  - CEO, Engineer, and Designer must sign off:`)
        console.log(`    acos-sprint.mjs sign CEO --approve`)
        console.log(`    acos-sprint.mjs sign Engineer --approve`)
        console.log(`    acos-sprint.mjs sign Designer --approve`)
        console.log(`  - Populate specifications in .acos/sprints/${state.sprintId}/specs/`)
        break
      case 'BUILD':
        console.log(`  - Engineer must sign off: acos-sprint.mjs sign Engineer --approve`)
        break
      case 'QA':
        console.log(`  - QA must sign off: acos-sprint.mjs sign QA --approve`)
        console.log(`  - Create E2E proof: .acos/sprints/${state.sprintId}/qa/report.json`)
        break
      case 'SHIP':
        console.log(`  - Sprint complete! Clean worktree, sync changes, and build catalog release.`)
        break
    }
    console.log()
  },

  assign(args) {
    const [role, name] = args
    if (!role || !name) {
      console.error(`Usage: acos-sprint.mjs assign <CEO|PM|Designer|Engineer|QA> <agent-name>`)
      process.exit(2)
    }
    const state = readSprint()
    if (!state) {
      console.error(`${RED}No active sprint found.${NC}`)
      process.exit(1)
    }
    if (!(role in state.roles)) {
      console.error(`${RED}Invalid role. Choose from: CEO, PM, Designer, Engineer, QA${NC}`)
      process.exit(1)
    }
    state.roles[role] = name
    writeSprint(state)
    console.log(`${GREEN}Assigned role ${BOLD}${role}${NC} to ${BOLD}${name}${NC}`)
  },

  sign(args) {
    const role = args[0]
    if (!role) {
      console.error(`Usage: acos-sprint.mjs sign <CEO|PM|Designer|Engineer|QA> [--approve|--reject] [--notes "..."]`)
      process.exit(2)
    }
    const approve = args.includes('--approve')
    const reject = args.includes('--reject')
    if (!approve && !reject) {
      console.error(`Must specify --approve or --reject`)
      process.exit(2)
    }

    const state = readSprint()
    if (!state) {
      console.error(`${RED}No active sprint found.${NC}`)
      process.exit(1)
    }

    if (!(role in state.roles)) {
      console.error(`${RED}Invalid role. Choose from: CEO, PM, Designer, Engineer, QA${NC}`)
      process.exit(1)
    }

    const currentPhase = state.phase
    const notesIdx = args.indexOf('--notes')
    const notes = notesIdx !== -1 ? args[notesIdx + 1] : null
    const actor = state.roles[role] || 'unknown'

    if (currentPhase === 'THINK') {
      if (role !== 'CEO') {
        console.error(`${RED}Only CEO can sign off THINK phase.${NC}`)
        process.exit(1)
      }
      state.gates.THINK = {
        approved: approve,
        signedBy: actor,
        signedAt: new Date().toISOString(),
        notes
      }
    } else if (currentPhase === 'PLAN') {
      if (!['CEO', 'Engineer', 'Designer'].includes(role)) {
        console.error(`${RED}Only CEO, Engineer, and Designer sign off PLAN phase.${NC}`)
        process.exit(1)
      }
      let signedList = state.gates.PLAN.signedBy || []
      if (!Array.isArray(signedList)) signedList = [signedList]
      if (approve) {
        if (!signedList.includes(role)) {
          signedList.push(role)
        }
      } else {
        signedList = signedList.filter(r => r !== role)
      }
      state.gates.PLAN = {
        approved: signedList.length === 3,
        signedBy: signedList,
        signedAt: new Date().toISOString(),
        notes
      }
    } else if (currentPhase === 'BUILD') {
      if (role !== 'Engineer') {
        console.error(`${RED}Only Engineer can sign off BUILD phase.${NC}`)
        process.exit(1)
      }
      state.gates.BUILD = {
        approved: approve,
        signedBy: actor,
        signedAt: new Date().toISOString(),
        notes
      }
    } else if (currentPhase === 'QA') {
      if (role !== 'QA') {
        console.error(`${RED}Only QA can sign off QA phase.${NC}`)
        process.exit(1)
      }
      state.gates.QA = {
        approved: approve,
        signedBy: actor,
        signedAt: new Date().toISOString(),
        notes
      }
    } else {
      console.error(`${RED}No gate to sign in phase ${currentPhase}.${NC}`)
      process.exit(1)
    }

    state.history.push({
      event: approve ? 'approve' : 'reject',
      phase: currentPhase,
      role,
      actor,
      timestamp: new Date().toISOString()
    })

    writeSprint(state)
    console.log(`${GREEN}Recorded signature for role ${BOLD}${role}${NC} (${approve ? 'APPROVED' : 'REJECTED'}).`)
  },

  advance() {
    const state = readSprint()
    if (!state) {
      console.error(`${RED}No active sprint found.${NC}`)
      process.exit(1)
    }

    const currentPhase = state.phase
    let canAdvance = false

    switch (currentPhase) {
      case 'THINK':
        canAdvance = state.gates.THINK.approved
        break
      case 'PLAN':
        canAdvance = state.gates.PLAN.approved
        break
      case 'BUILD':
        canAdvance = state.gates.BUILD.approved
        break
      case 'QA':
        canAdvance = state.gates.QA.approved
        break
      case 'SHIP':
        console.log(`${YELLOW}Sprint is already in SHIP phase.${NC}`)
        return
    }

    if (!canAdvance) {
      console.error(`${RED}Cannot advance phase. Current phase ${currentPhase} gate is not approved.${NC}`)
      process.exit(1)
    }

    // v14 Automated Verification Check
    const verification = verifyPhaseArtifacts(currentPhase, state.sprintId)
    if (!verification.valid) {
      console.error(`${RED}Gate Blocked: ${verification.error}${NC}`)
      process.exit(1)
    }

    const phases = ['THINK', 'PLAN', 'BUILD', 'QA', 'SHIP']
    const nextIdx = phases.indexOf(currentPhase) + 1
    const nextPhase = phases[nextIdx]

    state.phase = nextPhase
    state.history.push({
      event: 'advance',
      phase: nextPhase,
      timestamp: new Date().toISOString()
    })

    writeSprint(state)
    console.log(`${GREEN}Sprint advanced to ${BOLD}${nextPhase}${NC} phase. Artifacts verified.`)
  },

  rollback(args) {
    const targetPhase = args[0]
    if (!targetPhase) {
      console.error(`Usage: acos-sprint.mjs rollback <THINK|PLAN|BUILD|QA>`)
      process.exit(2)
    }

    const state = readSprint()
    if (!state) {
      console.error(`${RED}No active sprint found.${NC}`)
      process.exit(1)
    }

    const phases = ['THINK', 'PLAN', 'BUILD', 'QA', 'SHIP']
    if (!phases.includes(targetPhase) || targetPhase === 'SHIP') {
      console.error(`${RED}Invalid rollback phase target.${NC}`)
      process.exit(1)
    }

    const targetIdx = phases.indexOf(targetPhase)
    const currentIdx = phases.indexOf(state.phase)

    if (targetIdx >= currentIdx) {
      console.error(`${RED}Cannot rollback to a phase that is current or succeeding.${NC}`)
      process.exit(1)
    }

    // Reset gates from targetPhase onwards
    state.phase = targetPhase
    for (let i = targetIdx; i < phases.length - 1; i++) {
      const p = phases[i]
      if (p === 'PLAN') {
        state.gates[p] = { approved: false, signedBy: [], signedAt: null, notes: null }
      } else {
        state.gates[p] = { approved: false, signedBy: null, signedAt: null, notes: null }
      }
    }

    state.history.push({
      event: 'rollback',
      phase: targetPhase,
      timestamp: new Date().toISOString()
    })

    writeSprint(state)
    console.log(`${GREEN}Sprint rolled back to ${BOLD}${targetPhase}${NC} phase. Succeeding gates reset.`)
  }
}

const [, , cmd, ...rest] = process.argv

if (!cmd || !handlers[cmd]) {
  console.error(`
ACOS Stateful Gating CLI — v14.0.0

Usage:
  acos-sprint.mjs init [sprint-name]
  acos-sprint.mjs status
  acos-sprint.mjs assign <CEO|PM|Designer|Engineer|QA> <agent-name>
  acos-sprint.mjs sign <CEO|PM|Designer|Engineer|QA> [--approve|--reject] [--notes "..."]
  acos-sprint.mjs advance
  acos-sprint.mjs rollback <THINK|PLAN|BUILD|QA>
`)
  process.exit(cmd ? 2 : 0)
}

handlers[cmd](rest)
