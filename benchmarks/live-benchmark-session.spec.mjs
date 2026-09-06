import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createLiveBenchmarkSession } from './live-benchmark-session.mjs';

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

const snapshot = key => ({ key, code: `${key}:minified`, profile: `${key}:profile` });

void describe('live benchmark session', () => {
  void it('keeps timing and profiling on one snapshot and coalesces pending rebuilds', async () => {
    const gate = deferred();
    const runs = [];
    const session = createLiveBenchmarkSession(async ({ base, candidate }) => {
      const timing = candidate.code;
      if (runs.length === 0) await gate.promise;
      runs.push({ base: base.key, timing, profiling: candidate.profile });
    }, assert.fail);

    const first = session.submit(snapshot('first'));
    void session.submit(snapshot('intermediate'));
    void session.submit(snapshot('latest'));
    gate.resolve();
    await first;
    assert.deepEqual(runs, [
      { base: 'first', timing: 'first:minified', profiling: 'first:profile' },
      { base: 'first', timing: 'latest:minified', profiling: 'latest:profile' },
    ]);
    await session.stop();
  });

  void it('discards an edited fixture and resets its baseline before the next run', async () => {
    const gate = deferred();
    const published = [];
    let firstSignal;
    const session = createLiveBenchmarkSession(async ({ base, candidate }, signal) => {
      if (candidate.key === 'old fixture') {
        firstSignal = signal;
        await gate.promise;
      }
      signal.throwIfAborted();
      published.push([base.key, candidate.key]);
    }, assert.fail);

    const first = session.submit(snapshot('old fixture'));
    void session.submit(snapshot('old pending'));
    session.invalidate();
    assert.equal(firstSignal.aborted, true);
    void session.submit(snapshot('new fixture'));
    gate.resolve();
    await first;
    assert.deepEqual(published, [['new fixture', 'new fixture']]);
    await session.stop();
  });

  void it('skips duplicate completed builds but retries a failed initial build', async () => {
    const errors = [];
    const runs = [];
    const session = createLiveBenchmarkSession(async ({ base, candidate }) => {
      runs.push([base.key, candidate.key]);
      if (runs.length === 1) throw new Error('broken fixture');
    }, error => errors.push(error.message));

    await session.submit(snapshot('same'));
    await session.submit(snapshot('same'));
    await session.submit(snapshot('same'));
    assert.deepEqual(errors, ['broken fixture']);
    assert.deepEqual(runs, [['same', 'same'], ['same', 'same']]);
    await session.stop();
  });

  void it('retains a working baseline after a failed candidate', async () => {
    const runs = [];
    const session = createLiveBenchmarkSession(async ({ base, candidate }) => {
      runs.push([base.key, candidate.key]);
      if (candidate.key === 'broken') throw new Error('broken candidate');
    }, error => assert.equal(error.message, 'broken candidate'));
    await session.submit(snapshot('base'));
    await session.submit(snapshot('broken'));
    await session.submit(snapshot('fixed'));
    assert.deepEqual(runs, [['base', 'base'], ['base', 'broken'], ['base', 'fixed']]);
    await session.stop();
  });

  void it('waits for active cleanup on stop and never starts pending work', async () => {
    const gate = deferred();
    let signal;
    let cleaned = false;
    const runs = [];
    const session = createLiveBenchmarkSession(async ({ candidate }, currentSignal) => {
      runs.push(candidate.key);
      signal = currentSignal;
      try {
        await gate.promise;
        signal.throwIfAborted();
      } finally {
        cleaned = true;
      }
    }, assert.fail);
    void session.submit(snapshot('active'));
    void session.submit(snapshot('pending'));
    const stopped = session.stop();
    assert.equal(signal.aborted, true);
    assert.equal(cleaned, false);
    gate.resolve();
    await stopped;
    await session.submit(snapshot('too late'));
    assert.equal(cleaned, true);
    assert.deepEqual(runs, ['active']);
  });
});
