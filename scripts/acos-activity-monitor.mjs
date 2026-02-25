#!/usr/bin/env node
/**
 * ACOS Activity Monitor
 * Real-time visualization of hook activations, skill triggers, and agent spawns
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const HOOK_LOG = path.join(process.env.HOME, '.claude/projects/-mnt-c-Users-Frank-FrankX/logs/hook-activity.jsonl')
const TRAJECTORY_DIR = path.join(process.cwd(), '.claude/trajectories')
const AUDIT_LOG = path.join(process.cwd(), '.claude-flow/audit.jsonl')

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
}

function readJsonLines(filePath) {
  if (!fs.existsSync(filePath)) return []
  return fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function formatTimestamp(isoString) {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

function getHookActivity(minutes = 60) {
  const cutoff = Date.now() - (minutes * 60 * 1000)
  const entries = readJsonLines(HOOK_LOG)

  return entries
    .filter(e => new Date(e.timestamp).getTime() > cutoff)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

function getTrajectoryActivity(minutes = 60) {
  if (!fs.existsSync(TRAJECTORY_DIR)) return []

  const cutoff = Date.now() - (minutes * 60 * 1000)
  const files = fs.readdirSync(TRAJECTORY_DIR)
    .filter(f => f.endsWith('.json') && f !== 'patterns.json')
    .map(f => {
      const filePath = path.join(TRAJECTORY_DIR, f)
      const stat = fs.statSync(filePath)
      if (stat.mtimeMs < cutoff) return null

      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        return {
          file: f,
          ...data,
          mtime: stat.mtimeMs
        }
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.mtime - a.mtime)

  return files
}

function getAuditActivity(minutes = 60) {
  const cutoff = Date.now() - (minutes * 60 * 1000)
  const entries = readJsonLines(AUDIT_LOG)

  return entries
    .filter(e => new Date(e.timestamp).getTime() > cutoff)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

function displayReport() {
  console.clear()
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}`)
  console.log(`${colors.bright}   ACOS ACTIVITY MONITOR${colors.reset} ${colors.dim}(last 60 minutes)${colors.reset}`)
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}\n`)

  // Hook Activity
  const hooks = getHookActivity(60)
  console.log(`${colors.bright}${colors.yellow}⚡ HOOK ACTIVATIONS${colors.reset} ${colors.dim}(${hooks.length} total)${colors.reset}`)

  if (hooks.length === 0) {
    console.log(`${colors.dim}  No hook activity in the last 60 minutes${colors.reset}\n`)
  } else {
    const hookCounts = {}
    hooks.forEach(h => {
      const key = `${h.hook}:${h.event}`
      hookCounts[key] = (hookCounts[key] || 0) + 1
    })

    Object.entries(hookCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([key, count]) => {
        const [hook, event] = key.split(':')
        console.log(`  ${colors.green}•${colors.reset} ${hook} ${colors.dim}(${event})${colors.reset} × ${colors.bright}${count}${colors.reset}`)
      })

    console.log(`\n${colors.dim}  Latest:${colors.reset}`)
    hooks.slice(0, 5).forEach(h => {
      console.log(`  ${colors.dim}${formatTimestamp(h.timestamp)}${colors.reset} ${colors.yellow}${h.hook}${colors.reset} → ${h.event}`)
    })
    console.log()
  }

  // Trajectory Activity
  const trajectories = getTrajectoryActivity(60)
  console.log(`${colors.bright}${colors.magenta}🧠 LEARNING TRAJECTORIES${colors.reset} ${colors.dim}(${trajectories.length} active)${colors.reset}`)

  if (trajectories.length === 0) {
    console.log(`${colors.dim}  No trajectory activity in the last 60 minutes${colors.reset}\n`)
  } else {
    trajectories.slice(0, 5).forEach(t => {
      const category = t.category || 'general'
      const success = t.success_rate ? `${(t.success_rate * 100).toFixed(0)}%` : 'N/A'
      const tools = t.tool_sequence ? t.tool_sequence.slice(0, 3).join(' > ') : 'unknown'

      console.log(`  ${colors.green}•${colors.reset} ${colors.magenta}${category}${colors.reset} ${colors.dim}(${success} success)${colors.reset}`)
      console.log(`    ${colors.dim}${tools}${colors.reset}`)
    })
    console.log()
  }

  // Audit Activity
  const audits = getAuditActivity(60)
  console.log(`${colors.bright}${colors.blue}📋 AUDIT LOG${colors.reset} ${colors.dim}(${audits.length} events)${colors.reset}`)

  if (audits.length === 0) {
    console.log(`${colors.dim}  No audit activity in the last 60 minutes${colors.reset}\n`)
  } else {
    audits.slice(0, 10).forEach(a => {
      let typeColor = colors.blue
      if (a.type === 'iam_violation') typeColor = colors.red
      if (a.type === 'config_change') typeColor = colors.yellow
      if (a.type === 'gate_decision') typeColor = colors.green

      console.log(`  ${typeColor}•${colors.reset} ${colors.dim}${formatTimestamp(a.timestamp)}${colors.reset} ${a.type} ${a.details ? colors.dim + '(' + (a.details.file || a.details.profile || '') + ')' + colors.reset : ''}`)
    })
    console.log()
  }

  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════════${colors.reset}`)
  console.log(`${colors.dim}Refreshing every 5 seconds... Press Ctrl+C to exit${colors.reset}\n`)
}

// Watch mode
if (process.argv.includes('--watch')) {
  displayReport()
  setInterval(displayReport, 5000)
} else {
  displayReport()
}
