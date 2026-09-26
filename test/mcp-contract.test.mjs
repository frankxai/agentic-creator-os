// Every MCP server in mcp-servers/ must start and serve contract-clean tools.
// A committed build once contained a syntax error and another server declared no tools
// capability; both shipped unnoticed because nothing ever started the servers.
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serversDir = path.join(root, 'mcp-servers');
const TOOL_NAME = /^[a-z][a-z0-9_]{0,63}$/;
const servers = readdirSync(serversDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(serversDir, entry.name, 'package.json')))
  .map((entry) => entry.name);

test('at least the known servers are present', () => {
  for (const name of ['browser', 'creator', 'database', 'email', 'evaluator', 'filesystem', 'website']) {
    assert.ok(servers.includes(name), `${name} is missing from mcp-servers/`);
  }
});

for (const name of servers) {
  test(`${name}: starts and serves contract-clean tools`, async () => {
    const entry = path.join(serversDir, name, 'build', 'index.js');
    assert.ok(existsSync(entry), `${name} has no build/index.js; run npm run build:all`);

    // A scratch cwd keeps servers that create local state (database: acos.db) out of the repo.
    const cwd = mkdtempSync(path.join(tmpdir(), `acos-${name}-`));
    const transport = new StdioClientTransport({ command: process.execPath, args: [entry], cwd, stderr: 'pipe' });
    let stderr = '';
    transport.stderr?.on('data', (chunk) => { stderr += chunk; });
    const client = new Client({ name: 'acos-contract-test', version: '0.0.0' });
    try {
      await client.connect(transport).catch((error) => { throw new Error(`${error.message}\n${stderr.slice(-1500)}`); });
      const { tools } = await client.listTools();
      assert.ok(tools.length > 0, `${name} serves no tools`);
      const seen = new Set();
      for (const tool of tools) {
        assert.match(tool.name, TOOL_NAME, `${name}: tool name ${tool.name}`);
        assert.ok(!seen.has(tool.name), `${name}: duplicate tool ${tool.name}`);
        seen.add(tool.name);
        assert.ok((tool.description ?? '').trim().length >= 20, `${name}: ${tool.name} needs a description of at least 20 characters`);
        assert.equal(tool.inputSchema?.type, 'object', `${name}: ${tool.name} inputSchema.type`);
      }
    } finally {
      await client.close().catch(() => undefined);
    }
  });
}
