'use strict';

const fs = require('fs');
const path = require('path');

/** Sessions dir (portable, respects env or falls back to ~/.claude/sessions or equiv). */
function getSessionsDir() {
  if (process.env.CLAUDE_SESSIONS_DIR) return process.env.CLAUDE_SESSIONS_DIR;
  const home = process.env.HOME || process.env.USERPROFILE || process.cwd();
  return path.join(home, '.claude', 'sessions');
}

function getDateTimeString() {
  return new Date().toISOString();
}

function getTimeString() {
  return new Date().toLocaleTimeString();
}

/** Very lightweight find (no full glob dep). Matches simple *-pattern in dir. */
function findFiles(dir, pattern) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const re = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const name of fs.readdirSync(dir)) {
    if (re.test(name)) out.push({ path: path.join(dir, name) });
  }
  return out;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function appendFile(file, content) {
  fs.appendFileSync(file, content, 'utf8');
}

function log(msg) {
  console.log(msg);
}

module.exports = {
  getSessionsDir,
  getDateTimeString,
  getTimeString,
  findFiles,
  ensureDir,
  appendFile,
  log
};
