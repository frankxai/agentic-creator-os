#!/usr/bin/env node
/**
 * emit-event.mjs — Agent Observatory hook emitter.
 *
 * Invoked by Claude Code hooks. Packages an ActivityEvent and POSTs it to the
 * local Observatory server. Designed to NEVER block or fail Claude Code:
 *   - hard 800ms timeout
 *   - all errors swallowed (exit 0 always)
 *   - no output on the happy path
 *
 * Usage (from a hook command):
 *   node tools/observatory/emit-event.mjs --event PreToolUse \
 *     --tool "$TOOL_NAME" --agent "$TOOL_INPUT_subagent_type" --success "$TOOL_SUCCESS"
 *
 * Falls back to environment variables when flags are absent.
 */

const PORT = process.env.OBSERVATORY_PORT || 4317
const URL = `http://127.0.0.1:${PORT}/events`

function flag(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1]
  return fallback
}

const event = {
  source_app: 'acos',
  session_id: flag('session', process.env.CLAUDE_SESSION_ID || process.env.SESSION_ID || 'local'),
  hook_event_type: flag('event', 'PreToolUse'),
  tool_name: flag('tool', process.env.TOOL_NAME || ''),
  agent_id: flag('agent', process.env.TOOL_INPUT_subagent_type || ''),
  timestamp: new Date().toISOString(),
  payload: {
    file: process.env.TOOL_INPUT_file_path || undefined,
    command: process.env.TOOL_INPUT_command || undefined,
    success: flag('success', process.env.TOOL_SUCCESS || undefined),
  },
}

const ctrl = new AbortController()
const t = setTimeout(() => ctrl.abort(), 800)

try {
  await fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(event),
    signal: ctrl.signal,
  })
} catch {
  // server not running / unreachable — that's fine, monitoring is optional
} finally {
  clearTimeout(t)
  process.exit(0)
}
