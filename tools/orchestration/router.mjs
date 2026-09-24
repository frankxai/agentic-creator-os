import { createHash } from 'node:crypto';

export const taskClasses = ['extraction', 'debugging', 'feature', 'architecture', 'security', 'research'];
export const patterns = ['single', 'sequential', 'parallel', 'manager', 'refinement'];
export const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}
export function fresh(date, now, maxAgeMs = 86_400_000) {
  const age = now - Date.parse(date);
  return Number.isFinite(age) && age >= 0 && age <= maxAgeMs;
}

// Availability is supplied by a harness probe, never inferred from a model name.
export function selectModel(request, catalog, presets, { now = Date.now() } = {}) {
  requireValue(taskClasses.includes(request.taskClass), 'Unknown task class');
  requireValue(typeof request.runtime === 'string', 'Runtime is required');
  requireValue(Array.isArray(request.tools), 'Required tools must be explicit');
  requireValue(Array.isArray(catalog), 'Capability catalog must be an array');
  const preset = presets.routes[request.taskClass];
  requireValue(preset, 'No task preset');
  const wanted = request.model ?? preset.model;
  const effort = request.effort ?? preset.effort;
  // A caller-selected model is binding. Fallbacks are an explicit ordered policy.
  const candidates = request.allowFallback === true ? [wanted, ...(request.fallbacks ?? [])] : [wanted];
  for (const model of [...new Set(candidates)]) {
    const matches = catalog.filter(c => c.model === model && c.runtime === request.runtime);
    requireValue(matches.length <= 1, 'Ambiguous capability identity');
    const c = matches[0];
    if (!c || c.available !== true || !fresh(c.verifiedAt, now)) continue;
    if (!Array.isArray(c.efforts) || !c.efforts.includes(effort)) continue;
    if (!Array.isArray(c.tools) || !request.tools.every(t => c.tools.includes(t))) continue;
    if (typeof c.provider !== 'string' || !c.provider || !c.evidenceRef) continue;
    if (request.independentOf && c.provider === request.independentOf) continue;
    return {
      status: 'selected', model, effort, provider: c.provider, runtime: c.runtime,
      wasFallback: model !== wanted, reason: model === wanted ? 'Requested candidate is available' : 'Explicit fallback policy',
      evidenceStatus: 'provisional-unranked', capabilityEvidence: c.evidenceRef,
      capabilityVerifiedAt: c.verifiedAt, policyVersion: presets.version,
    };
  }
  return { status: 'hold', reason: 'No fresh, available model satisfies the requested runtime, effort, tools and reviewer independence', requestedModel: wanted, effort };
}

export function validatePlan(plan) {
  requireValue(plan?.version === 1 && patterns.includes(plan.pattern), 'Invalid plan version or pattern');
  requireValue(typeof plan.id === 'string' && plan.id.length > 0, 'Plan id is required');
  requireValue(Array.isArray(plan.tasks) && plan.tasks.length > 0 && plan.tasks.length <= 4, 'Plan needs 1–4 bounded tasks');
  const ids = new Set();
  const paths = [];
  for (const t of plan.tasks) {
    requireValue(typeof t.id === 'string' && /^[a-z][a-z0-9-]*$/.test(t.id) && !['constructor', 'prototype'].includes(t.id) && !ids.has(t.id), 'Duplicate or unsafe task id');
    ids.add(t.id);
    for (const k of ['objective', 'repo', 'artifact', 'stopCondition', 'verification']) requireValue(typeof t[k] === 'string' && t[k].trim(), `Missing task ${k}`);
    requireValue(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(t.repo) && !t.repo.endsWith('/..'), 'Repository must be owner/name');
    requireValue(['read', 'write'].includes(t.access), 'Task access must be read or write');
    requireValue(['ordinary', 'consequential'].includes(t.risk), 'Task risk is required');
    requireValue(Array.isArray(t.inputRefs) && Array.isArray(t.ownedPaths) && Array.isArray(t.dependsOn), 'Missing handoff arrays');
    requireValue(t.inputRefs.every(x => typeof x === 'string' && x.length > 0), 'Invalid input references');
    requireValue(new Set(t.dependsOn).size === t.dependsOn.length, 'Duplicate dependency');
    requireValue(t.access !== 'write' || t.ownedPaths.length > 0, 'Writer needs owned paths');
    for (const path of t.ownedPaths) {
      requireValue(typeof path === 'string' && /^[a-zA-Z0-9_.@/ -]+$/.test(path) && !path.startsWith('/') && !path.split('/').some(p => p === '..' || p === '.' || !p), 'Owned paths must be normalized repository-relative paths');
      if (t.access === 'write') {
        const key = `${t.repo}/${path}`.toLowerCase();
        requireValue(!paths.some(p => key === p || key.startsWith(`${p}/`) || p.startsWith(`${key}/`)), 'Conflicting writer ownership');
        paths.push(key);
      }
    }
  }
  const complete = new Set();
  while (complete.size < ids.size) {
    const ready = plan.tasks.filter(t => !complete.has(t.id) && t.dependsOn.every(d => complete.has(d)));
    requireValue(ready.length > 0, 'Unknown dependency or dependency cycle');
    ready.forEach(t => complete.add(t.id));
  }
  if (plan.pattern === 'single') requireValue(plan.tasks.length === 1, 'Single pattern requires one task');
  if (plan.pattern === 'parallel') requireValue(plan.tasks.every(t => t.dependsOn.length === 0), 'Parallel tasks must be independent');
  if (plan.pattern === 'manager') {
    const last = plan.tasks.at(-1);
    requireValue(plan.tasks.length >= 2 && plan.tasks.length <= 3 && plan.tasks.slice(0, -1).every(t => !t.dependsOn.length) && last.dependsOn.length === plan.tasks.length - 1 && plan.tasks.slice(0, -1).every(t => last.dependsOn.includes(t.id)), 'Manager requires one or two workers followed by synthesis');
  }
  if (plan.pattern === 'refinement') requireValue(plan.tasks.length === 1, 'Refinement has one implementer and a verifier callback');
  return plan;
}
