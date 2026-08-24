import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { completeApplicationStart } from './utils/complete-application-start.mjs';

const onResolve = (value, callback) => value instanceof Promise ? value.then(callback) : callback(value);

void describe('benchmark application startup', () => {
  void it('waits for queued work after synchronous startup', async () => {
    const events = [];
    const application = {
      start() {
        events.push('start');
      },
    };
    const tasksSettled = () => {
      events.push('settle');
      return Promise.resolve();
    };

    assert.equal(await completeApplicationStart(application, onResolve, tasksSettled), application);
    assert.deepEqual(events, ['start', 'settle']);
  });

  void it('returns the application after asynchronous startup completes', async () => {
    const started = Promise.withResolvers();
    let lifecycleComplete = false;
    const application = { start: () => started.promise };
    const tasksSettled = () => {
      assert.equal(lifecycleComplete, true);
      return Promise.resolve();
    };
    const result = completeApplicationStart(application, onResolve, tasksSettled);

    assert.notEqual(result, application);
    lifecycleComplete = true;
    started.resolve();
    assert.equal(await result, application);
  });
});
