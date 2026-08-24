import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { queueTask } from '@aurelia/runtime';
import { startApplication } from './utils/start-application.mjs';

void describe('benchmark application startup', () => {
  void it('waits for queued work after synchronous startup', async () => {
    let taskRan = false;
    const application = {
      start() {
        queueTask(() => { taskRan = true; });
      },
    };

    assert.equal(await startApplication(application), application);
    assert.equal(taskRan, true);
  });

  void it('returns the application after asynchronous startup completes', async () => {
    const started = Promise.withResolvers();
    const application = { start: () => started.promise };
    const result = startApplication(application);

    assert.notEqual(result, application);
    started.resolve();
    assert.equal(await result, application);
  });
});
