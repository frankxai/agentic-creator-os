#!/usr/bin/env node
/**
 * install-hooks.mjs — wire the Observatory emitter into .claude/settings.json.
 *
 * Idempotent and reversible. Adds command hooks that fire emit-event.mjs on
 * PreToolUse, PostToolUse, SubagentStop, SessionStart and Stop. Each injected
 * hook is tagged by the substring `observatory/emit-event` so it can be cleanly
 * removed.
 *
 *   node tools/observatory/install-hooks.mjs            # install
 *   node tools/observatory/install-hooks.mjs --uninstall # remove
 *
 * A timestamped backup of settings.json is written before any change.
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const SETTINGS = join(ROOT, '.claude', 'settings.json')
const MARKER = 'observatory/emit-event'
const EMIT = '"$CLAUDE_PROJECT_DIR/tools/observatory/emit-event.mjs"'

const uninstall = process.argv.includes('--uninstall')

function emitCmd(event, extra = '') {
  return `node ${EMIT} --event ${event} --tool "$TOOL_NAME" --agent "$TOOL_INPUT_subagent_type" --success "$TOOL_SUCCESS" ${extra}2>/dev/null || true`
}
function group(event) {
  return {
    matcher: '.*',
    hooks: [{ type: 'command', command: emitCmd(event), timeout: 2000, continueOnError: true }],
  }
}
function bareGroup(event) {
  return { hooks: [{ type: 'command', command: emitCmd(event), timeout: 2000, continueOnError: true }] }
}

if (!existsSync(SETTINGS)) {
  console.error(`✗ ${SETTINGS} not found`)
  process.exit(1)
}

const settings = JSON.parse(readFileSync(SETTINGS, 'utf8'))
settings.hooks = settings.hooks || {}

// strip any previously-injected observatory hooks (clean slate for both modes)
const isOurs = (h) => h?.command?.includes(MARKER)
for (const event of Object.keys(settings.hooks)) {
  settings.hooks[event] = (settings.hooks[event] || [])
    .map((g) => ({ ...g, hooks: (g.hooks || []).filter((h) => !isOurs(h)) }))
    .filter((g) => (g.hooks || []).length > 0)
  if (settings.hooks[event].length === 0) delete settings.hooks[event]
}

if (!uninstall) {
  const add = (event, g) => {
    settings.hooks[event] = settings.hooks[event] || []
    settings.hooks[event].push(g)
  }
  add('PreToolUse', group('PreToolUse'))
  add('PostToolUse', group('PostToolUse'))
  add('SubagentStop', bareGroup('SubagentStop'))
  add('SessionStart', bareGroup('SessionStart'))
  add('Stop', bareGroup('Stop'))
}

copyFileSync(SETTINGS, `${SETTINGS}.bak-${Date.now()}`)
writeFileSync(SETTINGS, JSON.stringify(settings, null, 2) + '\n')

console.log(uninstall ? '✓ Observatory hooks removed.' : '✓ Observatory hooks installed.')
console.log('  Restart your Claude Code session for hook changes to take effect.')
