import { createServer } from 'node:http'
import { pathToFileURL } from 'node:url'
import { checkReceipt } from './check-receipt.mjs'

const tool = {
  name: 'check_practice_receipt',
  description: 'Check a Creator OS practice receipt. Yes means the fields match the public rules. It does not mean a person signed it.',
  inputSchema: {
    type: 'object',
    properties: { receipt: { type: 'object' } },
    required: ['receipt'],
    additionalProperties: false,
  },
}

function answer(id, result) {
  return { jsonrpc: '2.0', id, result }
}

function handleRpc(message) {
  if (!message || message.jsonrpc !== '2.0') return null
  if (message.method === 'initialize') {
    return answer(message.id, {
      protocolVersion: '2025-03-26',
      capabilities: { tools: {} },
      serverInfo: { name: 'creator-os-receipt', version: '1.0.0' },
    })
  }
  if (message.method === 'tools/list') return answer(message.id, { tools: [tool] })
  if (message.method === 'tools/call' && message.params?.name === tool.name) {
    const checked = checkReceipt(message.params.arguments?.receipt)
    return answer(message.id, {
      content: [{ type: 'text', text: JSON.stringify(checked) }],
      isError: !checked.yes,
    })
  }
  return { jsonrpc: '2.0', id: message.id ?? null, error: { code: -32601, message: 'Method not found' } }
}

export function createReceiptServer() {
  return createServer((request, response) => {
    if (request.method !== 'POST' || (request.url !== '/mcp' && request.url !== '/check')) {
      response.writeHead(404, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ verdict: 'no', errors: ['POST /check or POST /mcp'] }))
      return
    }
    const chunks = []
    request.on('data', (chunk) => chunks.push(chunk))
    request.on('end', () => {
      let body
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')) }
      catch { response.writeHead(400, { 'content-type': 'application/json' }); response.end(JSON.stringify({ verdict: 'no', errors: ['Invalid JSON'] })); return }
      if (request.url === '/check') {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify(checkReceipt(body.receipt ?? body)))
        return
      }
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(JSON.stringify(handleRpc(body)))
    })
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.RECEIPT_PORT ?? 8787)
  createReceiptServer().listen(port, '127.0.0.1')
}
