import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseProfileIterations,
  parseProfileMode,
  summarizeCpuProfile,
} from './live-profile-utils.mjs';

void describe('live CPU profile utilities', () => {
  void it('validates modes and selects workload defaults', () => {
    assert.equal(parseProfileMode(undefined), undefined);
    assert.equal(parseProfileMode('startup'), 'startup');
    assert.equal(parseProfileMode('refresh'), 'refresh');
    assert.throws(() => parseProfileMode('mixed'), /Expected startup or refresh/u);
    assert.equal(parseProfileIterations(undefined, 'startup'), 1);
    assert.equal(parseProfileIterations(undefined, 'refresh'), 50);
    assert.equal(parseProfileIterations('7', 'refresh'), 7);
    assert.throws(() => parseProfileIterations('0', 'refresh'), /positive integer/u);
  });

  void it('ranks self and inclusive time and selects bundle frames', () => {
    const summary = summarizeCpuProfile({
      nodes: [
        { id: 1, callFrame: { functionName: '(root)', url: '', lineNumber: -1, columnNumber: -1 }, children: [2] },
        { id: 2, callFrame: { functionName: 'bind', url: 'http://localhost/live-results/profile/app.js', lineNumber: 9, columnNumber: 4 }, children: [3] },
        { id: 3, callFrame: { functionName: 'setValue', url: 'http://localhost/live-results/profile/app.js', lineNumber: 19, columnNumber: 2 } },
      ],
      samples: [2, 3, 3],
      timeDeltas: [1000, 2000, 3000],
    }, '/live-results/profile/app.js');

    assert.equal(summary.sampledMilliseconds, 6);
    assert.equal(summary.sampleCount, 3);
    assert.deepEqual(summary.topFunctions.map(frame => frame.functionName), ['setValue', 'bind']);
    assert.equal(summary.topFunctions[0].selfMilliseconds, 5);
    assert.equal(summary.topFunctions[0].totalMilliseconds, 5);
    assert.equal(summary.topFunctions[1].selfMilliseconds, 1);
    assert.equal(summary.topFunctions[1].totalMilliseconds, 6);
    assert.equal(summary.topBundleFunctions.length, 2);
  });
});
