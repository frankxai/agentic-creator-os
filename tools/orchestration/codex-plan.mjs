import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { selectModel, requireValue } from './router.mjs';
const presets = JSON.parse(readFileSync(new URL('./presets.json', import.meta.url)));

export function codexPlan(request, capabilities, options = {}) {
  requireValue(request.runtime === 'codex-cli', 'This adapter plans codex-cli only');
  requireValue(typeof request.prompt === 'string' && request.prompt.trim(), 'Prompt is required');
  const selection = selectModel(request, capabilities, presets, options);
  if (selection.status === 'hold') return selection;
  requireValue(/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(selection.model), 'Invalid model selector');
  requireValue(/^[a-z]+$/.test(selection.effort), 'Invalid effort selector');
  // Pass as an argv array with shell:false. Prompt travels on stdin, not in shell text.
  return { status: 'planned', selection, executable: 'codex',
    args: ['exec', '--model', selection.model, '-c', `model_reasoning_effort="${selection.effort}"`, '-'],
    stdin: request.prompt, shell: false, activation: 'not-executed',
    requiredBeforeExecution: ['machine-admission', 'owned-worktree', 'sandbox-and-tool-policy', 'subscription-quota', 'artifact-verifier'],
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const input = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    console.log(JSON.stringify(codexPlan(input.request, input.capabilities), null, 2));
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
