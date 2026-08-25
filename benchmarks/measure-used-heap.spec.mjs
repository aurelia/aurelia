import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
/* eslint-disable import/extensions -- Node ESM requires the extension; browser pages serve this module directly. */
import { measureUsedJsHeapAfterGc } from './utils/measure-used-heap.js';
/* eslint-enable import/extensions */

void describe('after-GC used JS heap measurement', () => {
  void it('awaits two async major collections before reading bytes', async () => {
    const events = [];
    const bytes = await measureUsedJsHeapAfterGc({
      yieldTask: async () => { events.push('yield'); },
      collectGarbage: async options => {
        events.push(`gc:${options.type}:${options.execution}`);
        await Promise.resolve();
        events.push('gc-done');
      },
      readUsedJsHeap: () => {
        events.push('read');
        return 1234;
      },
    });

    assert.equal(bytes, 1234);
    assert.deepEqual(events, [
      'yield',
      'gc:major:async',
      'gc-done',
      'yield',
      'gc:major:async',
      'gc-done',
      'yield',
      'read',
    ]);
  });

  void it('rejects a missing GC hook and invalid heap readings', async () => {
    await assert.rejects(
      measureUsedJsHeapAfterGc({ collectGarbage: undefined }),
      /require Chrome with --js-flags=--expose-gc/,
    );
    for (const value of [-1, Number.NaN, undefined]) {
      await assert.rejects(
        measureUsedJsHeapAfterGc({
          yieldTask: async () => {},
          collectGarbage: () => {},
          readUsedJsHeap: () => value,
        }),
        /invalid used JS heap value/,
      );
    }
  });
});
