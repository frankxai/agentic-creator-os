#!/usr/bin/env node
/**
 * server.mjs — Agent Observatory live-monitor server (zero dependencies).
 *
 * Receives ActivityEvents from Claude Code hooks (via emit-event.mjs) and
 * streams them to the dashboard over Server-Sent Events. Uses only Node
 * built-ins so `npm run observatory` works in a fresh clone with no install.
 *
 * Endpoints:
 *   POST /events          ingest an ActivityEvent (from the hook emitter)
 *   GET  /stream          SSE stream of live events
 *   GET  /catalog         the generated catalog.json (agents/skills/...)
 *   GET  /events/recent   last N events (JSON) for backfill on load
 *   GET  /                the standalone dashboard (web/index.html)
 *
 * History is persisted to .claude-flow/observatory-events.jsonl and backfilled
 * on dashboard load so you see recent activity immediately.
 */

import http from 'node:http'
import { readFileSync, existsSync, appendFileSync, mkdirSync, createReadStream } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const PORT = process.env.OBSERVATORY_PORT || 4317
const CATALOG = join(__dirname, 'public', 'catalog.json')
const WEB_DIR = join(__dirname, 'web')
const HISTORY = join(ROOT, '.claude-flow', 'observatory-events.jsonl')
const RING = []
const RING_MAX = 500

const clients = new Set() // SSE response objects

function persist(event) {
  try {
    mkdirSync(dirname(HISTORY), { recursive: true })
    appendFileSync(HISTORY, JSON.stringify(event) + '\n')
  } catch {}
}

function broadcast(event) {
  RING.push(event)
  if (RING.length > RING_MAX) RING.shift()
  const frame = `data: ${JSON.stringify(event)}\n\n`
  for (const res of clients) {
    try {
      res.write(frame)
    } catch {
      clients.delete(res)
    }
  }
}

function loadHistory(limit = 100) {
  if (RING.length) return RING.slice(-limit)
  if (!existsSync(HISTORY)) return []
  try {
    const lines = readFileSync(HISTORY, 'utf8').trim().split('\n').filter(Boolean)
    return lines.slice(-limit).map((l) => JSON.parse(l))
  } catch {
    return []
  }
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors)
    return res.end()
  }

  // Ingest
  if (req.method === 'POST' && url.pathname === '/events') {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      try {
        const event = JSON.parse(body)
        event.received_at = new Date().toISOString()
        persist(event)
        broadcast(event)
      } catch {}
      res.writeHead(204, cors)
      res.end()
    })
    return
  }

  // SSE stream
  if (req.method === 'GET' && url.pathname === '/stream') {
    res.writeHead(200, {
      ...cors,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    res.write(`retry: 2000\n\n`)
    clients.add(res)
    const ping = setInterval(() => {
      try {
        res.write(': ping\n\n')
      } catch {}
    }, 25000)
    req.on('close', () => {
      clearInterval(ping)
      clients.delete(res)
    })
    return
  }

  if (req.method === 'GET' && url.pathname === '/events/recent') {
    const limit = Number(url.searchParams.get('limit') || 100)
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(loadHistory(limit)))
  }

  if (req.method === 'GET' && url.pathname === '/catalog') {
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' })
    return res.end(existsSync(CATALOG) ? readFileSync(CATALOG) : '{"nodes":[],"edges":[],"iam":{},"counts":{}}')
  }

  // Static dashboard
  if (req.method === 'GET') {
    const file = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\//, '')
    const full = join(WEB_DIR, file)
    if (full.startsWith(WEB_DIR) && existsSync(full)) {
      res.writeHead(200, { ...cors, 'Content-Type': MIME[extname(full)] || 'application/octet-stream' })
      return createReadStream(full).pipe(res)
    }
  }

  res.writeHead(404, cors)
  res.end('not found')
})

server.listen(PORT, () => {
  console.log(`\n  🛰  Agent Observatory — live monitor`)
  console.log(`     dashboard : http://localhost:${PORT}`)
  console.log(`     ingest    : POST http://localhost:${PORT}/events`)
  console.log(`     stream    : GET  http://localhost:${PORT}/stream (SSE)`)
  console.log(`\n  Waiting for Claude Code hook events…\n`)
})
