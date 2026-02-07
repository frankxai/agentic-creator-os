#!/usr/bin/env node
'use strict';

/**
 * ACOS PostToolUse Hook (async, fire-and-forget)
 * - Appends tool operations to _operations.jsonl
 * - Updates _active.json counters
 * - Tracks files modified for trajectory summary
 */

const fs = require('fs');
const path = require('path');

const TRAJ_DIR = path.join(__dirname, '..', 'trajectories');
const ACTIVE_META = path.join(TRAJ_DIR, '_active.json');
const ACTIVE_OPS = path.join(TRAJ_DIR, '_operations.jsonl');

function main() {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf-8'));

    if (!fs.existsSync(ACTIVE_META)) {
      process.exit(0);
      return;
    }

    const toolName = input.tool_name || 'unknown';
    const toolInput = input.tool_input || {};

    // Append operation to JSONL (atomic append, no race condition)
    const op = {
      t: toolName,
      ts: Date.now(),
      ...(toolInput.file_path ? { f: toolInput.file_path } : {}),
      ...(toolInput.command ? { c: toolInput.command.slice(0, 200) } : {}),
      ...(toolInput.pattern ? { p: toolInput.pattern.slice(0, 100) } : {}),
    };
    fs.appendFileSync(ACTIVE_OPS, JSON.stringify(op) + '\n');

    // Update counters in meta (best-effort, small race window is acceptable)
    try {
      const meta = JSON.parse(fs.readFileSync(ACTIVE_META, 'utf-8'));
      meta.toolCount = (meta.toolCount || 0) + 1;

      // Track files modified
      if (toolInput.file_path && ['Write', 'Edit', 'NotebookEdit'].includes(toolName)) {
        if (!meta.filesModified) meta.filesModified = [];
        const fp = toolInput.file_path;
        if (!meta.filesModified.includes(fp)) {
          meta.filesModified.push(fp);
        }
      }

      fs.writeFileSync(ACTIVE_META, JSON.stringify(meta, null, 2));
    } catch {
      // If meta read/write fails, just skip - operations.jsonl is the source of truth
    }

    process.exit(0);
  } catch {
    process.exit(0);
  }
}

main();
