#!/usr/bin/env node
'use strict';

const fs = require('fs');

const MAX_STDIN = 1024 * 1024;

function readStdin() {
  const fd = 0;
  const chunks = [];
  let size = 0;
  const buffer = Buffer.alloc(8192);

  while (size < MAX_STDIN) {
    let bytesRead = 0;
    try {
      bytesRead = fs.readSync(fd, buffer, 0, buffer.length, null);
    } catch {
      break;
    }
    if (!bytesRead) break;
    chunks.push(Buffer.from(buffer.subarray(0, bytesRead)));
    size += bytesRead;
  }

  return Buffer.concat(chunks).toString('utf8');
}

function parsePayload(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function collectText(value, out = []) {
  if (value == null) return out;
  if (typeof value === 'string') {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectText(item, out);
    return out;
  }
  if (typeof value === 'object') {
    for (const item of Object.values(value)) collectText(item, out);
  }
  return out;
}

const raw = readStdin();
const payload = parsePayload(raw);
const haystack = (payload ? collectText(payload).join('\n') : raw).slice(0, MAX_STDIN);

const blockers = [
  { name: 'private key block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'OpenAI-style secret token', re: /\bsk-[A-Za-z0-9_-]{24,}\b/ },
  { name: 'GitHub token', re: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{30,}\b/ },
  { name: 'Slack token', re: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { name: 'Stripe secret key', re: /\bsk_(live|test)_[A-Za-z0-9]{20,}\b/ },
  { name: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
];

const hit = blockers.find((rule) => rule.re.test(haystack));

if (hit) {
  console.error(`secret-guard blocked PreToolUse: ${hit.name}`);
  console.error('Refusing to run a tool call that appears to contain a live secret value.');
  process.exit(2);
}

process.exit(0);

