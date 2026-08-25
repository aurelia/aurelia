import type { IContainer } from '@aurelia/kernel';
import {
  Aurelia,
  AppTask,
  CustomElement,
  type IAppRoot,
  IAppRoot as IAppRootKey,
  type IPlatform,
  refs,
} from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

interface Deferred<T = void> {
  readonly promise: Promise<T>;
  resolve(value: T): void;
  reject(reason: unknown): void;
}

interface RootHooks {
  activate?(): void | Promise<void>;
  deactivate?(): void | Promise<void>;
  dispose?(): void;
}

interface RootProbe {
  readonly root: IAppRoot;
  readonly host: HTMLElement;
  readonly calls: {
    activate: number;
    deactivate: number;
    dispose: number;
  };
}

describe('3-runtime-html/aurelia.async-lifecycle.spec.ts', function () {
  this.beforeEach(function () {
    refs.hideProp = false;
  });

  describe('overlapping start and stop', function () {
    it('serializes a stop requested while asynchronous start is pending', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const activation = createDeferred();
      const probe = createRootProbe(ctx, {
        activate() { return activation.promise; },
      });
      let startedEvents = 0;
      let stoppedEvents = 0;
      probe.host.addEventListener('au-started', () => { ++startedEvents; });
      probe.host.addEventListener('au-stopped', () => { ++stoppedEvents; });

      const start = au.start(probe.root);
      assert.instanceOf(start, Promise);
      const stop = au.stop();
      assert.instanceOf(stop, Promise);
      assert.notStrictEqual(stop, start, 'start and stop expose distinct completion boundaries');
      assert.strictEqual(probe.calls.deactivate, 0);

      activation.resolve();
      await start;

      assert.strictEqual(probe.calls.activate, 1);
      assert.strictEqual(probe.calls.deactivate, 0);
      assert.strictEqual(probe.calls.dispose, 0);
      assert.strictEqual(startedEvents, 1);
      assert.strictEqual(stoppedEvents, 0);
      assert.strictEqual(au.isRunning, true);
      assertPublished(ctx, au, probe);
      assert.strictEqual(au.stop(true), stop, 'later callers can request disposal at the start boundary');

      await stop;

      assert.strictEqual(probe.calls.deactivate, 1);
      assert.strictEqual(probe.calls.dispose, 1);
      assert.strictEqual(startedEvents, 1);
      assert.strictEqual(stoppedEvents, 1);
      assertIdle(au);
      assertUnpublished(ctx, probe.host);

      au.dispose();
    });

    it('reports a synchronous queued-stop failure on the stop boundary', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const activation = createDeferred();
      const error = Symbol('queued deactivation failed synchronously');
      const probe = createRootProbe(ctx, {
        activate() { return activation.promise; },
        deactivate() { throw error; },
      });

      const start = au.start(probe.root) as Promise<void>;
      const stop = au.stop(true) as Promise<void>;
      const stopFailure = captureRejection(stop);

      activation.resolve();
      await start;
      assert.strictEqual(await stopFailure, error);
      assert.strictEqual(au.stop(true), stop);
      assert.strictEqual(probe.calls.dispose, 0);
      assert.strictEqual(au.isStopping, true);
    });

    it('reports an asynchronous queued-stop failure on the stop boundary', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const activation = createDeferred();
      const deactivation = createDeferred();
      const error = Symbol('queued deactivation failed asynchronously');
      const probe = createRootProbe(ctx, {
        activate() { return activation.promise; },
        deactivate() { return deactivation.promise; },
      });

      const start = au.start(probe.root) as Promise<void>;
      const stop = au.stop(true) as Promise<void>;
      const stopFailure = captureRejection(stop);

      activation.resolve();
      await start;
      deactivation.reject(error);
      assert.strictEqual(await stopFailure, error);
      assert.strictEqual(au.stop(true), stop);
      assert.strictEqual(probe.calls.dispose, 0);
      assert.strictEqual(au.isStopping, true);
    });

    it('keeps a replacement stop separate from the preceding queued stop', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const activation = createDeferred();
      const calls: string[] = [];
      const rootA = createRootProbe(ctx, {
        activate() {
          calls.push('A:activate');
          return activation.promise;
        },
        deactivate() { calls.push('A:deactivate'); },
        dispose() { calls.push('A:dispose'); },
      });
      const rootB = createRootProbe(ctx, {
        activate() { calls.push('B:activate'); },
        deactivate() { calls.push('B:deactivate'); },
        dispose() { calls.push('B:dispose'); },
      });

      const startA = au.start(rootA.root) as Promise<void>;
      const stopA = au.stop() as Promise<void>;
      activation.resolve();
      await startA;

      const startB = au.start(rootB.root) as Promise<void>;
      const stopB = au.stop(true) as Promise<void>;
      assert.notStrictEqual(stopB, stopA);
      assert.notStrictEqual(stopB, startB);

      await startB;
      assert.deepStrictEqual(calls, ['A:activate', 'A:deactivate', 'B:activate']);
      assert.strictEqual(rootA.calls.dispose, 0);
      assert.strictEqual(rootB.calls.dispose, 0);
      assert.strictEqual(au.isRunning, true);
      assertPublished(ctx, au, rootB);

      await stopB;
      assert.deepStrictEqual(calls, [
        'A:activate',
        'A:deactivate',
        'B:activate',
        'B:deactivate',
        'B:dispose',
      ]);
      assertIdle(au);
      assertUnpublished(ctx, rootB.host);
      au.dispose();
    });

    it('keeps an au-started replacement separate from a synchronous reentrant stop', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const calls: string[] = [];
      let stopA!: Promise<void>;
      let startB!: Promise<void>;
      let stopB!: Promise<void>;
      const rootB = createRootProbe(ctx, {
        activate() { calls.push('B:activate'); },
        deactivate() { calls.push('B:deactivate'); },
        dispose() { calls.push('B:dispose'); },
      });
      const rootA = createRootProbe(ctx, {
        activate() {
          calls.push('A:activate');
          stopA = au.stop() as Promise<void>;
        },
        deactivate() { calls.push('A:deactivate'); },
      });
      rootA.host.addEventListener('au-started', () => {
        startB = au.start(rootB.root) as Promise<void>;
        stopB = au.stop(true) as Promise<void>;
      });

      assert.strictEqual(au.start(rootA.root), void 0);
      assert.instanceOf(stopA, Promise);
      assert.instanceOf(startB, Promise);
      assert.instanceOf(stopB, Promise);
      assert.notStrictEqual(stopB, stopA);
      assert.notStrictEqual(stopB, startB);

      await startB;
      assert.deepStrictEqual(calls, ['A:activate', 'A:deactivate', 'B:activate']);
      assert.strictEqual(rootB.calls.dispose, 0);
      assert.strictEqual(au.isRunning, true);
      assertPublished(ctx, au, rootB);

      await stopB;
      assert.deepStrictEqual(calls, [
        'A:activate',
        'A:deactivate',
        'B:activate',
        'B:deactivate',
        'B:dispose',
      ]);
      assertIdle(au);
      assertUnpublished(ctx, rootB.host);
      au.dispose();
    });

    it('records a stop requested synchronously from root activation', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const calls: string[] = [];
      let stopResult: void | Promise<void> = void 0;
      const au = new Aurelia(ctx.container);
      const App = CustomElement.define({ name: 'synchronous-reentrant-stop', template: 'running' }, class {
        public binding(): void {
          calls.push('binding');
          stopResult = au.stop(true);
        }
        public attached(): void { calls.push('attached'); }
        public detaching(): void { calls.push('detaching'); }
        public unbinding(): void { calls.push('unbinding'); }
        public dispose(): void { calls.push('dispose'); }
      });
      au.app({ host, component: App });

      const start = au.start();

      assert.strictEqual(start, void 0, 'synchronous activation keeps the direct start path');
      assert.instanceOf(stopResult, Promise, 'the re-entrant stop owns its queued teardown');
      assert.deepStrictEqual(calls, ['binding', 'attached']);
      assert.strictEqual(au.isRunning, true);

      await stopResult;

      assert.deepStrictEqual(calls, ['binding', 'attached', 'detaching', 'unbinding', 'dispose']);
      assertIdle(au);
      assertUnpublished(ctx, host);
      assert.strictEqual(host.textContent, '');
      au.dispose();
    });

    it('joins stop(true) across a queued replacement root transition', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const rootAStop = createDeferred();
      const calls: string[] = [];
      const rootA = createRootProbe(ctx, {
        activate() { calls.push('A:activate'); },
        deactivate() {
          calls.push('A:deactivate');
          return rootAStop.promise;
        },
        dispose() { calls.push('A:dispose'); },
      });
      const rootB = createRootProbe(ctx, {
        activate() { calls.push('B:activate'); },
        deactivate() { calls.push('B:deactivate'); },
        dispose() { calls.push('B:dispose'); },
      });

      await au.start(rootA.root);
      const rootAStopTransition = au.stop();
      assert.instanceOf(rootAStopTransition, Promise);
      const replacement = au.start(rootB.root);
      assert.instanceOf(replacement, Promise);
      const stop = au.stop(true);
      assert.instanceOf(stop, Promise);
      assert.notStrictEqual(stop, replacement, 'replacement start and stop have distinct boundaries');
      assert.deepStrictEqual(calls, ['A:activate', 'A:deactivate']);
      await assertPending(stop as Promise<void>, 'the replacement transition remains gated by A stopping');

      rootAStop.resolve();
      await replacement;

      assert.deepStrictEqual(calls, [
        'A:activate',
        'A:deactivate',
        'B:activate',
      ]);
      assert.strictEqual(rootB.calls.activate, 1);
      assert.strictEqual(rootB.calls.deactivate, 0);
      assert.strictEqual(rootB.calls.dispose, 0);
      assert.strictEqual(au.isRunning, true);
      assertPublished(ctx, au, rootB);

      await stop;

      assert.deepStrictEqual(calls, [
        'A:activate',
        'A:deactivate',
        'B:activate',
        'B:deactivate',
        'B:dispose',
      ]);
      assert.strictEqual(rootA.calls.dispose, 0, 'the implicit replacement stop does not dispose A');
      assert.strictEqual(rootB.calls.activate, 1);
      assert.strictEqual(rootB.calls.deactivate, 1);
      assert.strictEqual(rootB.calls.dispose, 1);
      assertIdle(au);
      assertUnpublished(ctx, rootB.host);
      au.dispose();
    });
  });

  describe('terminal root failures', function () {
    it('propagates a synchronous start failure without starting cleanup', function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const error = Symbol('activation failed');
      const probe = createRootProbe(ctx, {
        activate() { throw error; },
      });

      assert.strictEqual(captureThrow(() => au.start(probe.root)), error);
      assert.strictEqual(probe.calls.activate, 1);
      assert.strictEqual(probe.calls.deactivate, 0);
      assert.strictEqual(probe.calls.dispose, 0);
      assert.strictEqual(au.isStarting, true);
      assert.strictEqual(au.isRunning, false);
      assertPublished(ctx, au, probe);
      assert.strictEqual(captureThrow(() => au.start(probe.root)), error);
      assert.strictEqual(captureThrow(() => au.stop(true)), error);
    });

    it('keeps a requested stop on the same failed start operation', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const activation = createDeferred();
      const error = Symbol('activation failed');
      const probe = createRootProbe(ctx, {
        activate() { return activation.promise; },
      });

      const start = au.start(probe.root);
      assert.instanceOf(start, Promise);
      const stop = au.stop(true);
      assert.instanceOf(stop, Promise);
      assert.notStrictEqual(stop, start);

      const startFailure = captureRejection(start);
      const stopFailure = captureRejection(stop);

      activation.reject(error);
      assert.strictEqual(await startFailure, error);
      assert.strictEqual(await stopFailure, error);

      assert.strictEqual(probe.calls.deactivate, 0);
      assert.strictEqual(probe.calls.dispose, 0);
      assert.strictEqual(au.isStarting, true);
      assert.strictEqual(au.isRunning, false);
      assertPublished(ctx, au, probe);
      assert.strictEqual(au.start(probe.root), start, 'the failed operation remains terminal');
      assert.strictEqual(au.stop(true), stop, 'the queued stop preserves the failed operation');
    });

    it('propagates a failed stop without finalizing the application', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const deactivation = createDeferred();
      const error = Symbol('deactivation failed');
      const probe = createRootProbe(ctx, {
        deactivate() { return deactivation.promise; },
      });
      let stoppedEvents = 0;
      probe.host.addEventListener('au-stopped', () => { ++stoppedEvents; });
      await au.start(probe.root);

      const stop = au.stop(true);
      assert.instanceOf(stop, Promise);
      assert.strictEqual(au.stop(true), stop);
      deactivation.reject(error);
      await assertRejectsWith(stop, error);

      assert.strictEqual(probe.calls.dispose, 0);
      assert.strictEqual(stoppedEvents, 0);
      assert.strictEqual(au.isRunning, false);
      assert.strictEqual(au.isStopping, true);
      assertPublished(ctx, au, probe);
      assert.strictEqual(au.stop(true), stop, 'the failed operation remains terminal');
    });
  });

  describe('application task settlement', function () {
    it('reports a synchronous task failure without waiting for earlier asynchronous work', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const gate = createDeferred();
      const error = Symbol('second task failed');
      const lateError = Symbol('first task failed later');
      const calls: string[] = [];
      const App = CustomElement.define({ name: 'synchronous-app-task-failure', template: 'app' }, class {});
      const au = new Aurelia(ctx.container);
      au.register(
        AppTask.activating(() => {
          calls.push('first');
          return gate.promise;
        }),
        AppTask.activating(() => {
          calls.push('second');
          throw error;
        }),
        AppTask.activating(() => { calls.push('third'); }),
      ).app({ host, component: App });

      assert.strictEqual(captureThrow(() => au.start()), error);
      assert.deepStrictEqual(calls, ['first', 'second']);

      gate.reject(lateError);
      await Promise.resolve();
      assert.deepStrictEqual(calls, ['first', 'second']);
    });

    it('reports the first concurrent task rejection without waiting for siblings', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const first = createDeferred();
      const second = createDeferred();
      const firstError = Symbol('first task failed');
      const secondError = Symbol('second task failed');
      const App = CustomElement.define({ name: 'ordered-app-task-errors', template: 'app' }, class {});
      const au = new Aurelia(ctx.container);
      au.register(
        AppTask.activating(() => first.promise),
        AppTask.activating(() => second.promise),
      ).app({ host, component: App });

      const start = au.start();
      assert.instanceOf(start, Promise);
      await assertPending(start as Promise<void>, 'both tasks remain pending');

      second.reject(secondError);
      await assertRejectsWith(start, secondError);

      first.reject(firstError);
      await Promise.resolve();
    });

    it('does not treat a deactivating task failure as a stop veto', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const error = Symbol('deactivating task failed');
      const calls: string[] = [];
      const App = CustomElement.define({ name: 'terminal-deactivating-task', template: 'app' }, class {
        public detaching(): void { calls.push('component:detaching'); }
      });
      const au = new Aurelia(ctx.container);
      au.register(
        AppTask.deactivating(() => {
          calls.push('task:first');
          throw error;
        }),
        AppTask.deactivating(() => { calls.push('task:second'); }),
      ).app({ host, component: App });
      await au.start();

      assert.strictEqual(captureThrow(() => au.stop(true)), error);
      assert.deepStrictEqual(calls, ['task:first']);
      assert.strictEqual(au.isRunning, false);
      assert.strictEqual(au.isStopping, true);
      assert.strictEqual(host.textContent, 'app');
      assert.strictEqual(captureThrow(() => au.stop(true)), error);
    });
  });
});

function createDeferred<T = void>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function createRootProbe(ctx: TestContext, hooks: RootHooks = {}): RootProbe {
  const host = ctx.createElement('div');
  const calls = { activate: 0, deactivate: 0, dispose: 0 };
  const root = {
    config: { host, component: {} },
    host,
    container: ctx.container as IContainer,
    platform: ctx.platform as IPlatform,
    controller: {},
    activate(): void | Promise<void> {
      ++calls.activate;
      return hooks.activate?.();
    },
    deactivate(): void | Promise<void> {
      ++calls.deactivate;
      return hooks.deactivate?.();
    },
    dispose(): void {
      ++calls.dispose;
      hooks.dispose?.();
    },
  } as unknown as IAppRoot;
  return { root, host, calls };
}

function captureThrow(action: () => unknown): unknown {
  let didThrow = false;
  let thrown: unknown;
  try {
    action();
  } catch (error) {
    didThrow = true;
    thrown = error;
  }
  assert.strictEqual(didThrow, true, 'operation throws');
  return thrown;
}

async function captureRejection(result: void | Promise<unknown>): Promise<unknown> {
  let didReject = false;
  let rejection: unknown;
  try {
    await result;
  } catch (error) {
    didReject = true;
    rejection = error;
  }
  assert.strictEqual(didReject, true, 'operation rejects');
  return rejection;
}

async function assertRejectsWith(result: void | Promise<unknown>, expected: unknown): Promise<void> {
  assert.strictEqual(await captureRejection(result), expected, 'original rejection identity');
}

function assertIdle(au: Aurelia): void {
  assert.strictEqual(au.isRunning, false);
  assert.strictEqual(au.isStarting, false);
  assert.strictEqual(au.isStopping, false);
}

function assertPublished(ctx: TestContext, au: Aurelia, probe: Pick<RootProbe, 'root' | 'host'>): void {
  assert.strictEqual(Reflect.get(probe.host, '$aurelia'), au);
  assert.strictEqual(ctx.container.get(IAppRootKey), probe.root);
  assert.strictEqual(au.root, probe.root);
}

function assertUnpublished(ctx: TestContext, host: HTMLElement): void {
  assert.strictEqual(Reflect.get(host, '$aurelia'), void 0);
  let didThrow = false;
  try {
    ctx.container.get(IAppRootKey);
  } catch {
    didThrow = true;
  }
  assert.strictEqual(didThrow, true, 'IAppRoot is unavailable outside a live transition');
}

async function assertPending(promise: Promise<unknown>, message: string): Promise<void> {
  let settled = false;
  void promise.then(
    () => { settled = true; },
    () => { settled = true; },
  );
  await Promise.resolve();
  assert.strictEqual(settled, false, message);
}
