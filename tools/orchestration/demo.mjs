import { readFileSync } from 'node:fs';
import { runPlan } from './runtime.mjs';
const presets = JSON.parse(readFileSync(new URL('./presets.json', import.meta.url)));
const task = id => ({ id, objective: `Inspect ${id}`, repo: 'example/project', access: 'read', risk: 'ordinary', ownedPaths: [], inputRefs: ['fixture:example'], artifact: 'findings', stopCondition: 'Return evidence', verification: 'Fixture contract check', dependsOn: [], request: { taskClass: 'extraction', runtime: 'demo', tools: [] } });
const plan = { version: 1, id: 'community-demo', pattern: 'manager', tasks: [task('source-a'), task('source-b'), { ...task('synthesis'), dependsOn: ['source-a', 'source-b'] }] };
const receipt = await runPlan(plan, {
  presets, admission: { decision: 'allow', maxParallel: 1 },
  catalog: [{ model: 'gpt-6-luna', provider: 'fixture', runtime: 'demo', available: true, verifiedAt: new Date().toISOString(), efforts: ['medium'], tools: [], evidenceRef: 'fixture:not-a-live-model' }],
  adapter: async (task, { selection }) => ({ model: selection.model, provider: selection.provider, runtime: selection.runtime, artifacts: [`fixture:${task.id}`] }),
  verify: async () => ({ passed: true, evidenceRefs: ['fixture:contract-check-only'] }),
});
console.log(JSON.stringify({ mode: 'dry-run-fixture', liveModelInvocations: 0, receipt }, null, 2));
