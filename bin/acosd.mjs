#!/usr/bin/env node
import net from 'node:net'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const IS_WIN = process.platform === 'win32'
const SOCKET_PATH = IS_WIN 
  ? `\\\\.\\pipe\\acosd-${os.userInfo().username}`
  : `/tmp/acosd-${os.userInfo().username}.sock`

export class AcosDaemon {
  constructor() {
    this.server = null
    this.activeTaskMetadata = {}
  }

  start() {
    // Cleanup stale Unix socket
    if (!IS_WIN && fs.existsSync(SOCKET_PATH)) {
      try { fs.unlinkSync(SOCKET_PATH) } catch (e) {}
    }

    this.server = net.createServer((socket) => {
      let buffer = ''
      
      socket.on('data', async (data) => {
        buffer += data.toString()
        const messages = buffer.split('\n')
        buffer = messages.pop() || ''

        for (const rawMsg of messages) {
          if (!rawMsg.trim()) continue
          try {
            const req = JSON.parse(rawMsg)
            const res = await this.handleRequest(req)
            socket.write(JSON.stringify(res) + '\n')
          } catch (err) {
            socket.write(JSON.stringify({
              jsonrpc: '2.0',
              error: { code: -32603, message: err.message }
            }) + '\n')
          }
        }
      })
    })

    this.server.listen(SOCKET_PATH, () => {
      console.log(`[acosd] Listening on: ${SOCKET_PATH}`)
    })
  }

  async handleRequest(req) {
    const { method, params, id } = req
    
    switch (method) {
      case 'initialize':
        this.activeTaskMetadata = params.metadata || {}
        return { jsonrpc: '2.0', result: { status: 'ready' }, id }

      case 'executeHook':
        const hookResult = await this.runHook(params.hookName, params.toolData)
        return { jsonrpc: '2.0', result: hookResult, id }

      case 'executeTool':
        const toolResult = await this.runTool(params.toolName, params.args)
        return { jsonrpc: '2.0', result: toolResult, id }

      case 'shutdown':
        setTimeout(() => process.exit(0), 100)
        return { jsonrpc: '2.0', result: { status: 'stopping' }, id }

      default:
        return { jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id }
    }
  }

  async runHook(hookName, toolData) {
    console.log(`[acosd] Running hook: ${hookName} for ${toolData.tool_name}`)
    
    if (hookName === 'PreToolUse' && toolData.tool_name === 'Write') {
      const filePath = toolData.tool_input?.file_path || ''
      if (this.activeTaskMetadata.task_domain === 'content' && filePath.endsWith('.ts')) {
        return {
          allowed: false,
          reason: 'Access Denied: Content agent not authorized to edit TS source code.'
        };
      }
    }
    return { allowed: true }
  }

  async runTool(toolName, args) {
    return { status: 'success', output: `Executed ${toolName} successfully.` }
  }
}

// Start if executed directly
if (process.argv[1] && (process.argv[1].endsWith('acosd.mjs') || process.argv[1].endsWith('acosd'))) {
  const daemon = new AcosDaemon()
  daemon.start()
}
