#!/usr/bin/env node
/**
 * PreCompact Hook - Save state before context compaction
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs before Claude compacts context, giving you a chance to
 * preserve important state that might get lost in summarization.
 */

const path = require('path');

// Inlined minimal utils (self-contained, no missing lib)
function getSessionsDir() {
  return process.env.CLAUDE_SESSIONS_DIR || path.join(process.env.HOME || process.env.USERPROFILE || process.cwd(), '.claude', 'sessions');
}
function getDateTimeString() { return new Date().toISOString(); }
function getTimeString() { return new Date().toLocaleTimeString(); }
function findFiles(dir, pattern) {
  const out = [];
  if (!require('fs').existsSync(dir)) return out;
  const re = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const name of require('fs').readdirSync(dir)) if (re.test(name)) out.push({path: path.join(dir, name)});
  return out;
}
function ensureDir(dir) { if (!require('fs').existsSync(dir)) require('fs').mkdirSync(dir, {recursive: true}); }
function appendFile(f, c) { require('fs').appendFileSync(f, c, 'utf8'); }
function log(m) { console.log(m); }

async function main() {
  const sessionsDir = getSessionsDir();
  const compactionLog = path.join(sessionsDir, 'compaction-log.txt');

  ensureDir(sessionsDir);

  // Log compaction event with timestamp
  const timestamp = getDateTimeString();
  appendFile(compactionLog, `[${timestamp}] Context compaction triggered\n`);

  // If there's an active session file, note the compaction
  const sessions = findFiles(sessionsDir, '*-session.tmp');

  if (sessions.length > 0) {
    const activeSession = sessions[0].path;
    const timeStr = getTimeString();
    appendFile(activeSession, `\n---\n**[Compaction occurred at ${timeStr}]** - Context was summarized\n`);
  }

  log('[PreCompact] State saved before compaction');
  process.exit(0);
}

main().catch(err => {
  console.error('[PreCompact] Error:', err.message);
  process.exit(0);
});
