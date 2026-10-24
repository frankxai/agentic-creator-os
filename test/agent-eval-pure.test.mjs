import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCrossFamily, normalizeModelFamily, parseScore, parseResultsTable, getLastPassingScores, getLatestCandidateScores, checkRegression, normalizeCaseName } from '../scripts/agent-eval.mjs';

test('agent-eval.mjs pure module logic', async (t) => {
  await t.test('normalizeModelFamily handles all supported families', () => {
    assert.equal(normalizeModelFamily('Claude-Opus'), 'anthropic');
    assert.equal(normalizeModelFamily('gpt-4o'), 'openai');
    assert.equal(normalizeModelFamily('Gemini Pro'), 'google');
    assert.equal(normalizeModelFamily('Llama-3'), 'meta');
    assert.equal(normalizeModelFamily('Mistral-Large'), 'mistral');
    assert.equal(normalizeModelFamily(''), 'unknown');
    assert.equal(normalizeModelFamily(null), 'unknown');
    assert.equal(normalizeModelFamily('Something Else'), 'something else');
  });

  await t.test('parseScore extracts numeric fractions, percentages, and decimals', () => {
    assert.deepEqual(parseScore('3/4'), { score: 0.75, raw: '3/4' });
    assert.deepEqual(parseScore(' 95% '), { score: 0.95, raw: '95%' });
    assert.deepEqual(parseScore('0.8'), { score: 0.8, raw: '0.8' });
    assert.deepEqual(parseScore('85'), { score: 0.85, raw: '85%' });
    assert.deepEqual(parseScore(0.5), { score: 0.5, raw: '0.5' });
    assert.deepEqual(parseScore(50), { score: 0.5, raw: '50' });
    assert.equal(parseScore('Not Graded'), null);
    assert.equal(parseScore(NaN), null);
    assert.equal(parseScore(null), null);
    assert.equal(parseScore(''), null);
    assert.equal(parseScore(' '), null);
    assert.equal(parseScore('not a number'), null);
  });

  await t.test('parseResultsTable extracts rows correctly', () => {
    const md = `
| Date       | Agent   | Case       | Instructions | Runner | Score |
|------------|---------|------------|--------------|--------|-------|
| 2024-01-01 | agent-a | case-1 (a) | prompt here  | claude | 4/4   |
`;
    const parsed = parseResultsTable(md);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].agent, 'agent-a');
    assert.equal(parsed[0].caseName, 'case-1');
    assert.equal(parsed[0].score, 1);
  });

  await t.test('parseResultsTable handles badly formatted rows', () => {
    const md = `
| Date | Agent | Case | Instructions | Runner | Score |
|---|---|---|---|---|---|
| 2024-01-01 |
| 2024-01-01 | agent-a | case-1 | prompt | claude | 4/4 | notes here |
| --- | --- | --- | --- | --- | --- |
| Date | Agent | Case | Instructions | Runner | Score |
    `;
    const parsed = parseResultsTable(md);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0].agent, 'agent-a');
    assert.equal(parsed[0].notes, 'notes here');

    assert.deepEqual(parseResultsTable(null), []);
    assert.deepEqual(parseResultsTable(''), []);
  });

  await t.test('getLastPassingScores filters out failed or missing scores', () => {
    const md = `
| Date       | Agent   | Case       | Instructions | Runner | Score |
|------------|---------|------------|--------------|--------|-------|
| 2024-01-01 | agent-a | case-1     | prompt here  | claude | 2/4   |
| 2024-01-02 | agent-a | case-1     | prompt here  | claude | 4/4   |
| 2024-01-03 | agent-b | case-2     | prompt here  | claude | Not Graded |
`;
    const scores = getLastPassingScores(md);
    assert.equal(scores.size, 1);
    const best = scores.get('agent-a:case-1');
    assert.equal(best.score, 1);
    assert.equal(best.raw, '4/4');
  });

  await t.test('checkRegression detects a drop in score', () => {
    const baseMap = new Map();
    baseMap.set('agent-a:case-1', { score: 1, raw: '4/4' });
    const candidates = [{ agent: 'agent-a', caseName: 'case-1', score: 0.5 }];

    const result = checkRegression(baseMap, candidates);
    assert.equal(result.pass, false);
    assert.equal(result.regressions.length, 1);
    assert.equal(result.regressions[0].diff, 0.5);

    const candidatesPass = [{ agent: 'agent-a', caseName: 'case-1', score: 1 }];
    const resultPass = checkRegression(baseMap, candidatesPass);
    assert.equal(resultPass.pass, true);
  });

  await t.test('checkRegression handles items not in baseline or with null scores', () => {
    const baseMap = new Map();
    const candidates = [
      { agent: 'agent-a', caseName: 'case-1', score: null },
      { agent: 'agent-b', caseName: 'case-2', score: 1 },
    ];

    const result = checkRegression(baseMap, candidates);
    assert.equal(result.pass, true);
    assert.equal(result.regressions.length, 0);
    assert.equal(result.checked.length, 0);
  });

  await t.test('getLatestCandidateScores extracts scores from md', () => {
    const md = `
| Date       | Agent   | Case       | Instructions | Runner | Score |
|------------|---------|------------|--------------|--------|-------|
| 2024-01-01 | agent-a | case-1     | prompt here  | claude | 2/4   |
`;
    const scores = getLatestCandidateScores(md);
    assert.equal(scores.length, 1);
    assert.equal(scores[0].agent, 'agent-a');
    assert.equal(scores[0].caseName, 'case-1');
    assert.equal(scores[0].score, '2/4');
  });

  await t.test('normalizeCaseName normalizes case names correctly', () => {
    assert.equal(normalizeCaseName('case-1 (a)'), 'case-1');
    assert.equal(normalizeCaseName('case-1'), 'case-1');
    assert.equal(normalizeCaseName('  case-1  '), 'case-1');
    assert.equal(normalizeCaseName(''), '');
    assert.equal(normalizeCaseName(null), '');
  });

  await t.test('validateCrossFamily enforces cross-family grading', () => {
    const valid = validateCrossFamily('Claude-Opus', 'gpt-4o');
    assert.equal(valid.valid, true);
    assert.equal(valid.runnerFamily, 'anthropic');
    assert.equal(valid.graderFamily, 'openai');

    const same = validateCrossFamily('Claude-Opus', 'Claude-Sonnet');
    assert.equal(same.valid, false);
    assert.match(same.reason, /Runner and grader are both from model family/);
  });
});
