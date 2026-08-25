import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { startSynchronousApplication } from './utils/start-application.mjs';

void describe('benchmark application startup', () => {
  void it('returns the application after synchronous startup', () => {
    const events = [];
    const application = {
      start() {
        events.push('start');
      },
    };

    assert.equal(startSynchronousApplication(application), application);
    assert.deepEqual(events, ['start']);
  });

  void it('rejects asynchronous startup', () => {
    const application = { start: () => Promise.resolve() };
    assert.throws(
      () => startSynchronousApplication(application),
      /Benchmark application startup must remain synchronous/,
    );
  });
});
