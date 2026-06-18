#!/usr/bin/env node
import { DatabaseSync } from 'node:sqlite'
import { join, dirname, resolve } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2)
const targetArg = args.find(a => a.startsWith('--target='))
const targetVal = targetArg ? targetArg.split('=')[1] : null
const targetDir = targetVal ? resolve(targetVal) : join(__dirname, '..')
const DB_DIR = join(targetDir, '.acos')
const DB_PATH = join(DB_DIR, 'agentdb.db')

console.log(`Initializing AgentDB SQLite Database...`)
console.log(`Database File: ${DB_PATH}`)

if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true })
}

try {
  const db = new DatabaseSync(DB_PATH)

  // 1. Trajectories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trajectories (
      id TEXT PRIMARY KEY,
      sprint_id TEXT,
      workflow_type TEXT,
      intent_tags TEXT,
      started_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      ended_at TEXT,
      quality_score REAL DEFAULT 0.0,
      verdict TEXT DEFAULT 'pending',
      topology TEXT
    );
  `)

  // 2. Steps table
  db.exec(`
    CREATE TABLE IF NOT EXISTS steps (
      id TEXT PRIMARY KEY,
      trajectory_id TEXT,
      step_number INTEGER,
      agent_role TEXT,
      tool_name TEXT,
      tool_args TEXT,
      tool_response TEXT,
      prompt_context TEXT,
      response_content TEXT,
      latency_ms INTEGER,
      input_tokens INTEGER,
      output_tokens INTEGER,
      FOREIGN KEY (trajectory_id) REFERENCES trajectories(id) ON DELETE CASCADE
    );
  `)

  // 3. Experience replay table
  db.exec(`
    CREATE TABLE IF NOT EXISTS experience_replay (
      id TEXT PRIMARY KEY,
      intent_pattern TEXT UNIQUE,
      trajectory_id TEXT,
      frequency_used INTEGER DEFAULT 1,
      last_replay_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      FOREIGN KEY (trajectory_id) REFERENCES trajectories(id)
    );
  `)

  // 4. Sync manifest ledger table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_manifest (
      file_path TEXT PRIMARY KEY,
      sha256_hash TEXT NOT NULL,
      last_synced_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      sync_status TEXT DEFAULT 'synced',
      repo_origin TEXT
    );
  `)

  console.log(`✓ AgentDB tables initialized successfully.`)
} catch (err) {
  console.error(`❌ AgentDB Initialization failed: ${err.message}`)
  process.exit(1)
}
