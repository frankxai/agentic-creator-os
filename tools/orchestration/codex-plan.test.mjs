import test from 'node:test';
import assert from 'node:assert/strict';
import { codexPlan } from './codex-plan.mjs';
const request = { taskClass: 'feature', runtime: 'codex-cli', tools: ['shell'], prompt: 'Review the supplied fixture; preserve literal text.' };
const capabilities = [{ model: 'gpt-6-sol', runtime: 'codex-cli', provider: 'openai', available: true, verifiedAt: new Date().toISOString(), efforts: ['high'], tools: ['shell'], evidenceRef: 'fixture:probe' }];
test('Codex plan uses explicit model and effort with stdin and no permission overrides', () => {
  const p = codexPlan(request, capabilities);
  assert.equal(p.status, 'planned'); assert.equal(p.activation, 'not-executed');
  assert.deepEqual(p.args, ['exec', '--model', 'gpt-6-sol', '-c', 'model_reasoning_effort="high"', '-']);
  assert.equal(p.stdin, request.prompt); assert.equal(p.shell, false);
});
test('unsupported model and runtime do not launch or substitute', () => {
  assert.equal(codexPlan({ ...request, model: 'missing' }, capabilities).status, 'hold');
  assert.throws(() => codexPlan({ ...request, runtime: 'responses-api' }, capabilities), /codex-cli/);
});
test('prompt is never interpolated into command arguments', () => {
  const literal = 'a quoted argument with spaces and $characters';
  const p = codexPlan({ ...request, prompt: literal }, capabilities);
  assert.equal(p.stdin, literal); assert.ok(!p.args.some(a => a.includes(literal)));
});
