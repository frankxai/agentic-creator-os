#!/usr/bin/env node
'use strict';

/**
 * Omotenashi Kernel — Stop hook. The enforcement half KERNEL.md names and does not ship.
 *
 * Catches exactly one failure, the estate's most common: a turn that produced nothing
 * and ended in a naked question. Doctrine cannot enforce itself; the model that wrote
 * the status report is the same model asked to notice it wrote one.
 *
 * Deliberately narrow. It fires only when NO productive tool ran in the whole turn AND
 * the reply ends on a question mark — an unambiguous status-report-plus-bill. Anything
 * fuzzier would train Frank to disable it, which is worse than not having it.
 *
 * Kill switch: KERNEL_RECEIPT_OFF=1. Fires at most once per stop and once per session.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const WRITE_TOOLS = new Set([
  'Write', 'Edit', 'MultiEdit', 'NotebookEdit', 'Artifact', 'SendUserFile',
  'Agent', 'Task', 'Workflow', 'ScheduleWakeup', 'CronCreate',
]);

// Bash is how work gets done under auto mode, but `git status` is the failure itself.
// Only a command that mutates something counts as a made thing.
const MUTATING_BASH = /(^|[\s;&|])(sed\s+-i|tee\b|mkdir\b|touch\b|cp\b|mv\b|rm\b|install\b|curl\s+-[^|]*o\b)|>>?\s*[^\s|&]|git\s+(commit|add|apply|checkout\s+-b|worktree\s+add|push)|npm\s+(run|publish)|pnpm\s+(run|build|publish|i\b|add)|node\s+[^|]*\.(m?js|cjs)/;

function readTranscript(p) {
  try {
    return fs.readFileSync(p, 'utf-8').split('\n').filter(Boolean).map(l => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}

function contentArray(entry) {
  const c = entry && entry.message && entry.message.content;
  if (typeof c === 'string') return [{ type: 'text', text: c }];
  return Array.isArray(c) ? c : [];
}

/** A real user turn, not a tool_result envelope wearing the user role. */
function isHumanTurn(entry) {
  if (!entry || entry.type !== 'user') return false;
  const parts = contentArray(entry);
  return parts.length > 0 && !parts.some(p => p.type === 'tool_result');
}

function main() {
  if (process.env.KERNEL_RECEIPT_OFF === '1') return;

  let payload = {};
  try { payload = JSON.parse(fs.readFileSync(0, 'utf-8')); } catch { return; }
  if (payload.stop_hook_active) return; // already continuing from this hook; never loop

  const entries = readTranscript(payload.transcript_path);
  if (entries.length === 0) return;

  let start = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (isHumanTurn(entries[i])) { start = i; break; }
  }

  let produced = false;
  let lastText = '';
  for (const entry of entries.slice(start)) {
    for (const part of contentArray(entry)) {
      if (part.type === 'tool_use') {
        if (WRITE_TOOLS.has(part.name)) produced = true;
        if (part.name === 'Bash' || part.name === 'PowerShell') {
          const cmd = (part.input && (part.input.command || '')) || '';
          if (MUTATING_BASH.test(cmd)) produced = true;
        }
      }
      if (part.type === 'text' && entry.type === 'assistant' && part.text.trim()) {
        lastText = part.text;
      }
    }
  }
  if (produced) return;

  const tail = lastText.replace(/\s+$/, '').replace(/[`*_)\]"']+$/, '');
  if (!tail.endsWith('?')) return;

  // Once per session, so a genuinely blocked turn can still end.
  const marker = path.join(os.tmpdir(), `kernel-receipt-${payload.session_id || 'unknown'}`);
  try {
    if (fs.existsSync(marker)) return;
    fs.writeFileSync(marker, '1');
  } catch { /* if the marker cannot be written, prefer not firing at all */ return; }

  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: [
      'Kernel check: this turn made nothing and ended on a question — a status report with a bill attached.',
      '',
      'Before answering again, do the part that does not need Frank:',
      '- Answer your own question from the repo, the registries, or a subagent sweep (段取り).',
      '- If it is genuinely his call, build the thing under a stated assumption anyway, then put the decision last with your recommendation attached.',
      '- Irreversible or outward-facing work (push, publish, send, delete, money) still stops for confirmation — build up to that line, not past it.',
      '',
      'Then close with: made / verified / proposed.',
    ].join('\n'),
  }));
}

try { main(); } catch { /* a broken hook must never trap a session */ }
process.exit(0);
