import { digest, requireValue, selectModel, validatePlan } from './router.mjs';

// This library does not start processes, grant tools, merge, publish or move funds.
// Adapters own sandboxing, cooperative cancellation and artifact verification.
export async function runPlan(plan, options) {
  validatePlan(plan);
  const { catalog, presets, adapter, verify, signal, onCheckpoint = async () => {} } = options;
  requireValue(typeof adapter === 'function' && typeof verify === 'function', 'Execution and verification adapters are required');
  const admission = options.admission;
  requireValue(admission?.decision === 'allow' && Number.isInteger(admission.maxParallel) && admission.maxParallel >= 1, 'Execution admission is required');
  const concurrency = Math.min(2, admission.maxParallel);
  const timeoutMs = options.timeoutMs ?? 120_000;
  requireValue(Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 900_000, 'Invalid task timeout');
  const planDigest = digest({ plan, policy: presets });
  const receipt = { version: 1, planId: plan.id, planDigest, status: 'running', results: {}, events: [] };
  const now = options.now ?? Date.now();
  const selections = Object.fromEntries(plan.tasks.map(t => [t.id, selectModel(t.request, catalog, presets, { now })]));
  const holds = Object.entries(selections).filter(([, s]) => s.status === 'hold');
  if (holds.length) return { ...receipt, status: 'hold', holds };
  if (options.checkpoint) {
    const old = options.checkpoint;
    requireValue(old.version === 1 && old.planDigest === planDigest, 'Checkpoint does not match plan and policy');
    requireValue(old.results && typeof old.results === 'object' && !Array.isArray(old.results), 'Malformed checkpoint');
    for (const [id, result] of Object.entries(old.results)) {
      const task = plan.tasks.find(t => t.id === id);
      requireValue(task && result.status === 'verified' && result.selection.model === selections[id].model && result.selection.effort === selections[id].effort && result.selection.provider === selections[id].provider && result.selection.runtime === selections[id].runtime, 'Checkpoint task or selection changed');
      const checked = await verify(task, result.output, { resumed: true });
      assertVerified(task, checked, result.output.provider);
      receipt.results[id] = structuredClone(result);
    }
    for (const task of plan.tasks.filter(t => receipt.results[t.id])) requireValue(task.dependsOn.every(d => receipt.results[d]), 'Checkpoint missing dependency');
  }
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason ?? new Error('Cancelled'));
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  async function execute(task) {
    const selected = selections[task.id];
    const started = Date.now();
    const child = new AbortController();
    const cancel = () => child.abort(controller.signal.reason);
    controller.signal.addEventListener('abort', cancel, { once: true });
    if (controller.signal.aborted) cancel();
    let timer;
    try {
      const work = async () => {
        let feedback;
        const attempts = plan.pattern === 'refinement' ? 2 : 1;
        for (let attempt = 1; attempt <= attempts; attempt++) {
          child.signal.throwIfAborted();
          const input = { selection: selected, signal: child.signal, attempt, feedback,
            dependencies: Object.fromEntries(task.dependsOn.map(id => [id, receipt.results[id].output])) };
          const output = await adapter(structuredClone(task), input);
          child.signal.throwIfAborted();
          requireValue(output?.model === selected.model && output.provider === selected.provider && output.runtime === selected.runtime, 'Adapter reported a different model/provider/runtime');
          requireValue(Array.isArray(output.artifacts) && output.artifacts.length > 0 && output.artifacts.every(a => typeof a === 'string' && a.length), 'Adapter must return artifact references');
          const checked = await verify(task, output, { resumed: false, attempt, signal: child.signal });
          child.signal.throwIfAborted();
          receipt.events.push({ taskId: task.id, attempt, usage: output.usage ?? null, verified: checked?.passed === true });
          if (checked?.passed === true) {
            assertVerified(task, checked, output.provider);
            return { status: 'verified', selection: selected, output, verification: checked, attempts: attempt, elapsedMs: Date.now() - started };
          }
          requireValue(typeof checked?.feedback === 'string' && checked.feedback.length, 'Verifier must explain a failed check');
          feedback = checked.feedback;
        }
        throw new Error('Verification failed after bounded refinement');
      };
      const stopped = new Promise((_, reject) => {
        child.signal.addEventListener('abort', () => reject(child.signal.reason ?? new Error('Cancelled')), { once: true });
        timer = setTimeout(() => child.abort(new Error('Task timeout; adapter must stop owned work')), timeoutMs);
      });
      return await Promise.race([work(), stopped]);
    } finally {
      clearTimeout(timer);
      controller.signal.removeEventListener('abort', cancel);
    }
  }
  try {
    while (Object.keys(receipt.results).length < plan.tasks.length) {
      controller.signal.throwIfAborted();
      const ready = plan.tasks.filter(t => !receipt.results[t.id] && t.dependsOn.every(d => receipt.results[d]));
      const batch = ['parallel', 'manager'].includes(plan.pattern) ? ready.slice(0, concurrency) : ready.slice(0, 1);
      requireValue(batch.length > 0, 'No runnable task');
      const outcomes = await Promise.allSettled(batch.map(execute));
      let error;
      outcomes.forEach((o, i) => {
        if (o.status === 'fulfilled') receipt.results[batch[i].id] = o.value;
        else error ??= o.reason;
      });
      if (error) throw error;
      await onCheckpoint(structuredClone(receipt));
    }
    receipt.status = 'complete';
  } catch (error) {
    controller.abort(error);
    receipt.status = signal?.aborted ? 'cancelled' : 'failed';
    receipt.error = error instanceof Error ? error.message : String(error);
  } finally {
    signal?.removeEventListener('abort', abort);
  }
  await onCheckpoint(structuredClone(receipt));
  return receipt;
}

function assertVerified(task, checked, makerProvider) {
  requireValue(checked?.passed === true && Array.isArray(checked.evidenceRefs) && checked.evidenceRefs.length > 0 && checked.evidenceRefs.every(x => typeof x === 'string' && x.length), 'Verification needs passing evidence');
  if (task.risk === 'consequential') requireValue(typeof checked.reviewerProvider === 'string' && checked.reviewerProvider.length > 0 && checked.reviewerProvider !== makerProvider, 'Consequential work needs independent provider review');
}
