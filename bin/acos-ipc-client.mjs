#!/usr/bin/env node
import net from 'node:net'
import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const IS_WIN = process.platform === 'win32'
const SOCKET_PATH = IS_WIN 
  ? `\\\\.\\pipe\\acosd-${os.userInfo().username}`
  : `/tmp/acosd-${os.userInfo().username}.sock`

export class AcosIpcClient {
  constructor() {
    this.socket = null
    this.responseResolvers = new Map()
    this.messageCounter = 0
  }

  async connect(retries = 3) {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(SOCKET_PATH)
      this.socket = socket

      socket.on('connect', () => {
        resolve()
      })

      socket.on('data', (data) => {
        const responses = data.toString().split('\n')
        for (const rawRes of responses) {
          if (!rawRes.trim()) continue
          try {
            const parsed = JSON.parse(rawRes)
            const resolver = this.responseResolvers.get(String(parsed.id))
            if (resolver) {
              resolver(parsed)
              this.responseResolvers.delete(String(parsed.id))
            }
          } catch (e) {
            // Failed to parse response, bypass
          }
        }
      })

      socket.on('error', async (err) => {
        if ((err.code === 'ENOENT' || err.code === 'ECONNREFUSED' || err.code === 'EPIPE') && retries > 0) {
          console.log('[acos-client] Daemon not running. Auto-spawning daemon...')
          await this.spawnDaemon()
          // Wait briefly for daemon startup
          await new Promise((r) => setTimeout(r, 200))
          this.connect(retries - 1).then(resolve).catch(reject)
        } else {
          reject(err)
        }
      })
    })
  }

  spawnDaemon() {
    return new Promise((resolve) => {
      const daemonScript = path.join(__dirname, 'acosd.mjs')
      const child = spawn('node', [daemonScript], {
        detached: true,
        stdio: 'ignore'
      })
      child.unref()
      resolve()
    })
  }

  async call(method, params) {
    if (!this.socket) throw new Error('Client not connected')
    const id = String(++this.messageCounter)

    return new Promise((resolve) => {
      this.responseResolvers.set(id, (response) => {
        if (response.error) {
          resolve({ success: false, error: response.error })
        } else {
          resolve({ success: true, result: response.result })
        }
      })

      this.socket.write(JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params
      }) + '\n')
    })
  }
}
