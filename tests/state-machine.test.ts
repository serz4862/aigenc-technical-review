import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransition, assertTransition, resumeStatusFromHistory } from '../src/state-machine.ts';
import { PIPELINE_FORWARD } from '../src/types.ts';

test('original happy path is allowed', () => {
  for (let i = 0; i < PIPELINE_FORWARD.length - 1; i++) {
    assert.equal(canTransition(PIPELINE_FORWARD[i], PIPELINE_FORWARD[i + 1]), true);
  }
});
test('sending requires an approved state', () => {
  assert.equal(canTransition('DEMO_READY', 'SENT'), false);
  assert.equal(canTransition('PENDING_APPROVAL', 'SENT'), false);
  assert.throws(() => assertTransition('DISCOVERED', 'SENT'), {code: 'INVALID_PIPELINE_TRANSITION'});
});
test('review, rejection and rework transitions match original tests', () => {
  for (const [from, to] of [['PENDING_APPROVAL','REJECTED'], ['DEMO_READY','APPROVED'],
    ['DEMO_READY','REJECTED'], ['DEMO_READY','PERSONALIZED'], ['REJECTED','PERSONALIZED']] as const) {
    assert.equal(canTransition(from, to), true);
  }
});
test('failure resumes the last checkpoint and falls back conservatively', () => {
  assert.equal(resumeStatusFromHistory('FAILED', 'ENRICHED'), 'ENRICHED');
  assert.equal(resumeStatusFromHistory('FAILED', null), 'DISCOVERED');
  assert.equal(resumeStatusFromHistory('SKIPPED', 'VERIFIED'), 'VERIFIED');
  assert.equal(resumeStatusFromHistory('SCORED', 'QUALIFIED'), 'SCORED');
  assert.equal(canTransition('FAILED', 'ENRICHED'), true);
  assert.equal(canTransition('FAILED', 'SENT'), false);
});
test('review-added regression: retry does not restore a sent checkpoint', () => {
  assert.equal(resumeStatusFromHistory('FAILED', 'SENT'), 'DISCOVERED');
});
