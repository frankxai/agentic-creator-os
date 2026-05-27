'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

function getClaudeDir() {
  return path.join(os.homedir(), '.claude');
}

function getLearnedSkillsDir() {
  return path.join(getClaudeDir(), 'learned-skills');
}

function getSessionsDir() {
  return path.join(getClaudeDir(), 'sessions');
}

function getTempDir() {
  return os.tmpdir();
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function appendFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, content, 'utf-8');
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

function readFile(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf-8');
}

function countInFile(filePath, pattern) {
  const content = readFile(filePath);
  if (!content) return 0;
  const re = typeof pattern === 'string' ? new RegExp(pattern, 'g') : pattern;
  const matches = content.match(re);
  return matches ? matches.length : 0;
}

function log(msg) {
  process.stderr.write(`${msg}\n`);
}

function getDateTimeString() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function getTimeString() {
  return new Date().toISOString().slice(11, 19);
}

function findFiles(dir, pattern) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir);
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  const regex = new RegExp(`^${escaped}$`);
  return entries
    .filter((name) => regex.test(name))
    .map((name) => ({ name, path: path.join(dir, name) }));
}

module.exports = {
  getClaudeDir,
  getLearnedSkillsDir,
  getSessionsDir,
  getTempDir,
  ensureDir,
  appendFile,
  writeFile,
  readFile,
  countInFile,
  log,
  getDateTimeString,
  getTimeString,
  findFiles,
};
