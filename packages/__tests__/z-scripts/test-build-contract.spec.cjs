'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { describe, it } = require('node:test');
const {
  createTestBuildStatusReporter,
  isCurrentTestBuildReady,
  readTestBuildToken,
  removeOrphanedSpecOutputs,
  removeTestBuildMarker,
  writeTestBuildMarker,
} = require('./test-build-contract.cjs');

describe('compiled test build contract', () => {
  it('requires the marker from the current dev invocation', () => {
    const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aurelia-test-build-'));
    try {
      assert.equal(isCurrentTestBuildReady(testRoot, 'current'), false);
      writeTestBuildMarker(testRoot, 'previous');
      assert.equal(isCurrentTestBuildReady(testRoot, 'current'), false);
      writeTestBuildMarker(testRoot, 'current');
      assert.equal(isCurrentTestBuildReady(testRoot, 'current'), true);
      removeTestBuildMarker(testRoot);
      assert.equal(isCurrentTestBuildReady(testRoot, 'current'), false);
    } finally {
      fs.rmSync(testRoot, { recursive: true, force: true });
    }
  });

  it('keeps direct runners compatible when no orchestrator token is present', () => {
    assert.equal(readTestBuildToken({}), void 0);
    assert.equal(isCurrentTestBuildReady('unused', void 0), true);
    assert.throws(
      () => readTestBuildToken({ AURELIA_TEST_BUILD_TOKEN: '\n' }),
      /non-empty printable token/,
    );
  });

  it('publishes readiness only after a zero-error watch compilation', () => {
    const messages = [];
    let invalidationCount = 0;
    let readyCount = 0;
    const report = createTestBuildStatusReporter({
      format: diagnostic => `status:${diagnostic.code}`,
      invalidate: () => invalidationCount++,
      markReady: () => readyCount++,
      startCodes: [6031, 6032],
      successCode: 6194,
      write: message => messages.push(message),
    });

    report({ code: 6031 }, '\n', {}, void 0);
    report({ code: 6194 }, '\n', {}, 0);
    report({ code: 6032 }, '\n', {}, void 0);
    report({ code: 6193 }, '\n', {}, 1);
    report({ code: 6032 }, '\n', {}, void 0);
    report({ code: 6194 }, '\n', {}, 0);

    assert.deepEqual(messages, [
      'status:6031',
      'status:6194',
      'status:6032',
      'status:6193',
      'status:6032',
      'status:6194',
    ]);
    assert.equal(invalidationCount, 3);
    assert.equal(readyCount, 2);
  });

  it('removes outputs for specs no longer in the current compiler program', () => {
    const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aurelia-test-orphans-'));
    const activeSource = path.join(testRoot, 'src', 'router', 'active.spec.ts');
    const activeOutput = path.join(testRoot, 'dist', 'router', 'active.spec.js');
    const orphanOutput = path.join(testRoot, 'dist', 'router', 'renamed.spec.js');
    const orphanDeclaration = path.join(testRoot, 'dist', 'types', 'router', 'renamed.spec.d.ts');
    const nestedTypesOrphan = path.join(testRoot, 'dist', 'router', 'types', 'nested.spec.js');
    const helperOutput = path.join(testRoot, 'dist', 'router', 'helper.js');
    try {
      for (const file of [
        activeSource,
        activeOutput,
        `${activeOutput}.map`,
        orphanOutput,
        `${orphanOutput}.map`,
        orphanDeclaration,
        `${orphanDeclaration}.map`,
        nestedTypesOrphan,
        `${nestedTypesOrphan}.map`,
        helperOutput,
      ]) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, '');
      }

      removeOrphanedSpecOutputs(testRoot, [activeSource]);

      assert.equal(fs.existsSync(activeOutput), true);
      assert.equal(fs.existsSync(`${activeOutput}.map`), true);
      assert.equal(fs.existsSync(orphanOutput), false);
      assert.equal(fs.existsSync(`${orphanOutput}.map`), false);
      assert.equal(fs.existsSync(orphanDeclaration), false);
      assert.equal(fs.existsSync(`${orphanDeclaration}.map`), false);
      assert.equal(fs.existsSync(nestedTypesOrphan), false);
      assert.equal(fs.existsSync(`${nestedTypesOrphan}.map`), false);
      assert.equal(fs.existsSync(helperOutput), true);
    } finally {
      fs.rmSync(testRoot, { recursive: true, force: true });
    }
  });
});
