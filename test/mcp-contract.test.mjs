// Every MCP server in mcp-servers/ must start and serve contract-clean tools.
// A committed build once contained a syntax error and another server declared no tools
// capability; both shipped unnoticed because nothing ever started the servers.
// The quality criteria mirror `mcp-doctor score` (frankxai/mcp-doctor, src/checker/score.ts),
// plus openWorldHint, which the score does not grade but agents rely on.
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
const MIN_DESCRIPTION = 80;
const COLLECTION_VERBS = new Set(['list', 'search', 'find', 'query', 'browse', 'all']);
const SIZE_PARAMS = new Set(['limit', 'page_size', 'pageSize', 'max_results', 'maxResults', 'per_page', 'perPage']);
const POSITION_PARAMS = new Set(['cursor', 'page', 'offset']);
const BOUNDED_FORMATS = new Set(['uuid', 'date', 'date-time', 'time', 'email', 'ipv4', 'ipv6', 'duration']);

// One offline, side-effect-free call per server: proves structuredContent is returned, validates
// against the declared outputSchema (the SDK client checks it), and is mirrored in the text block.
const SAMPLE_CALLS = {
  browser: { name: 'browser_close', arguments: {} },
  creator: { name: 'creator_list_clients', arguments: { limit: 5 } },
  database: { name: 'database_list_articles', arguments: { limit: 5 } },
  email: { name: 'email_list_templates', arguments: { limit: 10 } },
  evaluator: {
    name: 'evaluator_compare_content',
    arguments: { contentA: 'Short post.', contentB: 'A clearer, more specific post about shipping on time.', contentType: 'linkedin', metrics: ['readability'] },
  },
  filesystem: { name: 'filesystem_file_exists', arguments: { path: '.' } },
  website: { name: 'website_get_project_structure', arguments: { path: '.', maxEntries: 50 } },
};

const servers = readdirSync(serversDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(serversDir, entry.name, 'package.json')))
  .map((entry) => entry.name);

function words(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function patternBoundsLength(pattern) {
  return pattern.startsWith('^') && pattern.endsWith('$') && !/[*+]|\{\d+,\}/.test(pattern.replace(/\\./g, ''));
}

function bounded(schema) {
  if (schema.enum !== undefined || schema.const !== undefined) return true;
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  if (types.includes('string')) {
    return schema.maxLength !== undefined || BOUNDED_FORMATS.has(schema.format) || (schema.pattern !== undefined && patternBoundsLength(schema.pattern));
  }
  if (types.includes('integer') || types.includes('number')) return schema.maximum !== undefined || schema.exclusiveMaximum !== undefined;
  if (types.includes('array')) return schema.maxItems !== undefined && (schema.items === undefined || bounded(schema.items));
  if (types.includes('object')) return schema.additionalProperties === false && Object.values(schema.properties ?? {}).every(bounded);
  return types.includes('boolean') || types.includes('null');
}

function qualityFailures(tool, prefix) {
  const failures = [];
  const fail = (message) => failures.push(`${tool.name}: ${message}`);
  const hints = tool.annotations ?? {};
  const properties = tool.inputSchema?.properties ?? {};

  if (!tool.title?.trim()) fail('missing title');
  if (typeof hints.readOnlyHint !== 'boolean') fail('annotations.readOnlyHint must be set');
  if (typeof hints.openWorldHint !== 'boolean') fail('annotations.openWorldHint must be set');
  if (hints.readOnlyHint === false) {
    if (typeof hints.destructiveHint !== 'boolean') fail('writer needs annotations.destructiveHint');
    if (typeof hints.idempotentHint !== 'boolean') fail('writer needs annotations.idempotentHint');
  }
  if (!tool.name.startsWith(`${prefix}_`)) fail(`name must start with "${prefix}_"`);
  if ((tool.description ?? '').trim().length < MIN_DESCRIPTION) fail(`description under ${MIN_DESCRIPTION} characters`);
  if (Object.keys(properties).length === 0) {
    if (tool.inputSchema?.additionalProperties !== false) fail('no-input tool must set additionalProperties:false');
  }
  for (const [key, schema] of Object.entries(properties)) {
    if (!schema.description?.trim()) fail(`input ${key} has no description`);
    if (!bounded(schema)) fail(`input ${key} is unbounded`);
  }
  if (tool.outputSchema?.type !== 'object') fail('outputSchema (type object) is not declared');
  if (words(tool.name).some((word) => COLLECTION_VERBS.has(word))) {
    const pages = Object.entries(properties).some(([key, schema]) => POSITION_PARAMS.has(key) || (SIZE_PARAMS.has(key) && bounded(schema)));
    if (!pages) fail('list/search tool needs a bounded limit or a cursor');
  }
  return failures;
}

async function connect(name) {
  const entry = path.join(serversDir, name, 'build', 'index.js');
  assert.ok(existsSync(entry), `${name} has no build/index.js; run npm run build:all`);
  // A scratch cwd keeps servers that create local state (database: acos.db) out of the repo.
  const cwd = mkdtempSync(path.join(tmpdir(), `acos-${name}-`));
  const transport = new StdioClientTransport({ command: process.execPath, args: [entry], cwd, stderr: 'pipe' });
  let stderr = '';
  transport.stderr?.on('data', (chunk) => { stderr += chunk; });
  const client = new Client({ name: 'acos-contract-test', version: '0.0.0' });
  await client.connect(transport).catch((error) => { throw new Error(`${error.message}\n${stderr.slice(-1500)}`); });
  return client;
}

test('at least the known servers are present', () => {
  for (const name of ['browser', 'creator', 'database', 'email', 'evaluator', 'filesystem', 'website']) {
    assert.ok(servers.includes(name), `${name} is missing from mcp-servers/`);
  }
});

for (const name of servers) {
  test(`${name}: starts and serves contract-clean tools`, async (t) => {
    const client = await connect(name);
    try {
      const { tools } = await client.listTools();
      assert.ok(tools.length > 0, `${name} serves no tools`);

      await t.test('names are unique and well-formed', () => {
        const seen = new Set();
        for (const tool of tools) {
          assert.match(tool.name, TOOL_NAME, `${name}: tool name ${tool.name}`);
          assert.ok(!seen.has(tool.name), `${name}: duplicate tool ${tool.name}`);
          seen.add(tool.name);
          assert.equal(tool.inputSchema?.type, 'object', `${name}: ${tool.name} inputSchema.type`);
        }
      });

      await t.test('every tool meets the quality criteria', () => {
        assert.deepEqual(tools.flatMap((tool) => qualityFailures(tool, name)), []);
      });

      await t.test('results carry structuredContent mirrored as JSON text', async () => {
        const call = SAMPLE_CALLS[name];
        assert.ok(call, `${name}: add a side-effect-free sample call to SAMPLE_CALLS`);
        const result = await client.callTool(call);
        assert.notEqual(result.isError, true, `${call.name} failed: ${JSON.stringify(result.content)}`);
        assert.equal(typeof result.structuredContent, 'object', `${call.name} returned no structuredContent`);
        const text = result.content.find((block) => block.type === 'text');
        assert.ok(text, `${call.name} returned no text block`);
        assert.deepEqual(JSON.parse(text.text), result.structuredContent);
      });
    } finally {
      await client.close().catch(() => undefined);
    }
  });
}
