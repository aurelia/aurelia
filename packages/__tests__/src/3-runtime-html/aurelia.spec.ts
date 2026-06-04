import { Aurelia, CustomElement } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('3-runtime-html/aurelia.spec.ts', function () {
  it('returns promises from start and stop', async function () {
    const ctx = TestContext.create();
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement('div');
    const App = CustomElement.define({ name: 'app', template: '' }, class {});

    au.app({ host, component: App });

    const startPromise = au.start();
    assert.instanceOf(startPromise, Promise, 'start promise');
    await startPromise;

    const stopPromise = au.stop();
    assert.instanceOf(stopPromise, Promise, 'stop promise');
    await stopPromise;

    const alreadyStoppedPromise = au.stop();
    assert.instanceOf(alreadyStoppedPromise, Promise, 'already stopped promise');
    await alreadyStoppedPromise;

    au.dispose();
  });

  it('reuses in-flight promises during async start and stop', async function () {
    const ctx = TestContext.create();
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement('div');
    const startGate = createGate();
    const stopGate = createGate();
    let attachedCount = 0;
    let detachingCount = 0;
    const App = CustomElement.define({ name: 'app', template: '' }, class {
      public attached(): Promise<void> {
        attachedCount++;
        return startGate.promise;
      }

      public detaching(): Promise<void> {
        detachingCount++;
        return stopGate.promise;
      }
    });

    au.app({ host, component: App });

    const startPromise = au.start();
    const duplicateStartPromise = au.start();
    assert.strictEqual(duplicateStartPromise, startPromise, 'start promise');
    assert.strictEqual(attachedCount, 1, 'attached count before start resolves');

    startGate.resolve();
    await startPromise;
    assert.strictEqual(au.isRunning, true, 'is running after start');

    const stopPromise = au.stop();
    const duplicateStopPromise = au.stop();
    assert.strictEqual(duplicateStopPromise, stopPromise, 'stop promise');
    assert.strictEqual(detachingCount, 1, 'detaching count before stop resolves');

    const restartPromise = au.start();
    assert.instanceOf(restartPromise, Promise, 'restart promise');
    assert.strictEqual(attachedCount, 1, 'restart waits for stop before attaching again');

    stopGate.resolve();
    await Promise.all([stopPromise, restartPromise]);
    assert.strictEqual(attachedCount, 2, 'attached count after restart');
    assert.strictEqual(au.isRunning, true, 'is running after restart');

    await au.stop();
    au.dispose();
  });
});

function createGate(): { promise: Promise<void>; resolve(): void } {
  let resolve!: () => void;
  const promise = new Promise<void>(r => { resolve = r; });
  return { promise, resolve };
}
