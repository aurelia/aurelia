import type { IContainer } from '@aurelia/kernel';
import { queueAsyncTask } from '@aurelia/runtime';
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

describe('3-runtime-html/aurelia.lifecycle-recovery.spec.ts', function () {
  this.beforeEach(function () {
    refs.hideProp = false;
  });

  describe('failed start rollback', function () {
    it('rolls back a synchronous failure before throwing and can start a different root', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const activationError = Symbol('root A activation failed');
      const rootA = createRootProbe(ctx, {
        activate() { throw activationError; },
      });
      const rootB = createRootProbe(ctx);
      let rootAStarted = 0;
      let rootAStopped = 0;
      let rootBStarted = 0;
      rootA.host.addEventListener('au-started', () => { ++rootAStarted; });
      rootA.host.addEventListener('au-stopped', () => { ++rootAStopped; });
      rootB.host.addEventListener('au-started', () => { ++rootBStarted; });

      assert.strictEqual(captureThrow(() => au.start(rootA.root)), activationError);
      assert.strictEqual(rootA.calls.activate, 1);
      assert.strictEqual(rootA.calls.deactivate, 1, 'the failed root is rolled back by the failing start');
      assert.strictEqual(rootA.calls.dispose, 0, 'successful rollback leaves the root reusable');
      assertIdle(au);
      assertUnpublished(ctx, rootA.host);
      assert.strictEqual(rootAStarted, 0);
      assert.strictEqual(rootAStopped, 0, 'failed start rollback is not an explicit stop transition');

      await au.start(rootB.root);
      assert.strictEqual(rootA.calls.deactivate, 1, 'starting B does not defer or repeat cleanup of A');
      assert.strictEqual(rootB.calls.activate, 1);
      assert.strictEqual(rootBStarted, 1);
      assertPublished(ctx, au, rootB);

      await au.stop(true);
      au.dispose();
    });

    it('keeps root, provider, and host publication until an asynchronous rollback settles', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const activationError = void 0;
      const rollback = createDeferred();
      const root = createRootProbe(ctx, {
        activate() { return Promise.reject(activationError); },
        deactivate() {
          assert.strictEqual(au.isStarting, true);
          assert.strictEqual(Reflect.get(root.host, '$aurelia'), au);
          assert.strictEqual(ctx.container.get(IAppRootKey), root.root);
          assert.strictEqual(au.root, root.root);
          return rollback.promise;
        },
      });
      let startedEvents = 0;
      let stoppedEvents = 0;
      root.host.addEventListener('au-started', () => { ++startedEvents; });
      root.host.addEventListener('au-stopped', () => { ++stoppedEvents; });

      const start = au.start(root.root);
      assert.instanceOf(start, Promise);
      assert.strictEqual(au.start(root.root), start, 'the rollback remains part of the in-flight start');
      await waitFor(() => root.calls.deactivate === 1);

      assert.strictEqual(au.isStarting, true);
      assert.strictEqual(Reflect.get(root.host, '$aurelia'), au);
      assert.strictEqual(ctx.container.get(IAppRootKey), root.root);
      assert.strictEqual(captureThrow(() => au.dispose()) instanceof Error, true, 'dispose is rejected while rollback is pending');
      await assertPending(start as Promise<void>, 'start remains pending for compensating deactivation');

      rollback.resolve();
      await assertRejectsWith(start, activationError);
      assertIdle(au);
      assertUnpublished(ctx, root.host);
      assert.strictEqual(startedEvents, 0);
      assert.strictEqual(stoppedEvents, 0);

      au.dispose();
    });

    it('preserves a symbol from synchronous activation across asynchronous rollback', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const activationError = Symbol('sync activation failure');
      const rollback = createDeferred();
      const probe = createRootProbe(ctx, {
        activate() { throw activationError; },
        deactivate() { return rollback.promise; },
      });

      const start = au.start(probe.root);
      assert.instanceOf(start, Promise, 'async compensation makes the whole start transaction async');
      await assertPending(start as Promise<void>, 'start waits for asynchronous rollback');
      rollback.resolve();
      await assertRejectsWith(start, activationError);

      assertIdle(au);
      assertUnpublished(ctx, probe.host);
      au.dispose();
    });

    it('preserves undefined from asynchronous activation with synchronous rollback', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const probe = createRootProbe(ctx, {
        activate() { return Promise.reject(); },
      });

      const start = au.start(probe.root);
      assert.instanceOf(start, Promise);
      await assertRejectsWith(start, void 0);

      assert.strictEqual(probe.calls.deactivate, 1);
      assertIdle(au);
      assertUnpublished(ctx, probe.host);
      au.dispose();
    });

    it('allows disposal without a retry after successful rollback', function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const activationError = Symbol('abandoned start');
      const probe = createRootProbe(ctx, {
        activate() { throw activationError; },
      });

      assert.strictEqual(captureThrow(() => au.start(probe.root)), activationError);
      assert.strictEqual(probe.calls.deactivate, 1);
      assert.doesNotThrow(() => au.dispose());
    });

    it('aggregates rollback and quarantine failures and clears all publication', function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const activationError = Symbol('activation failed');
      const rollbackError = Symbol('rollback failed');
      const disposeError = Symbol('quarantine failed');
      const probe = createRootProbe(ctx, {
        activate() { throw activationError; },
        deactivate() { throw rollbackError; },
        dispose() { throw disposeError; },
      });

      const error = captureThrow(() => au.start(probe.root));
      assertAggregateErrors(error, [activationError, rollbackError, disposeError]);
      assert.strictEqual(probe.calls.deactivate, 1);
      assert.strictEqual(probe.calls.dispose, 1, 'failed rollback quarantines the root with best-effort disposal');
      assertIdle(au);
      assertUnpublished(ctx, probe.host);

      assert.doesNotThrow(() => au.dispose());
    });

    it('continues controller cleanup when a deactivating app task fails during start rollback', function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const activationError = Symbol('activated app task failed');
      const rollbackError = Symbol('deactivating app task failed');
      const calls: string[] = [];
      const App = CustomElement.define({
        name: 'failed-start-app-task-cleanup',
        template: 'running',
      }, class {
        public detaching(): void { calls.push('component:detaching'); }
        public unbinding(): void { calls.push('component:unbinding'); }
        public dispose(): void { calls.push('component:dispose'); }
      });
      const au = new Aurelia(ctx.container);
      au.register(
        AppTask.activated(() => { throw activationError; }),
        AppTask.deactivating(() => {
          calls.push('task:deactivating');
          throw rollbackError;
        }),
        AppTask.deactivated(() => { calls.push('task:deactivated'); }),
      ).app({ host, component: App });

      const error = captureThrow(() => au.start());

      assertAggregateErrors(error, [activationError, rollbackError]);
      assert.deepStrictEqual(calls, [
        'task:deactivating',
        'component:detaching',
        'component:unbinding',
        'task:deactivated',
        'component:dispose',
      ]);
      assert.strictEqual(host.textContent, '');
      assertIdle(au);
      assertUnpublished(ctx, host);
      assert.doesNotThrow(() => au.dispose());
    });

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
      const stop = au.stop(true);
      assert.strictEqual(stop, start, 'stop joins the in-flight start transaction');
      assert.strictEqual(probe.calls.deactivate, 0);

      activation.resolve();
      await start;

      assert.strictEqual(probe.calls.activate, 1);
      assert.strictEqual(probe.calls.deactivate, 1);
      assert.strictEqual(probe.calls.dispose, 1);
      assert.strictEqual(startedEvents, 1);
      assert.strictEqual(stoppedEvents, 1);
      assertIdle(au);
      assertUnpublished(ctx, probe.host);

      au.dispose();
    });

    it('records a stop requested synchronously from root activation before start publishes its promise', async function () {
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

      assert.strictEqual(stopResult, void 0, 'the re-entrant call has no stable promise until root.activate returns');
      assert.instanceOf(start, Promise, 'start owns the stop requested from its synchronous activation stack');
      await start;

      assert.deepStrictEqual(calls, ['binding', 'attached', 'detaching', 'unbinding', 'dispose']);
      assertIdle(au);
      assertUnpublished(ctx, host);
      assert.strictEqual(host.textContent, '');
      au.dispose();
    });

    it('honors stop(true) when the pending start fails', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const activation = createDeferred();
      const activationError = Symbol('pending start failed');
      const probe = createRootProbe(ctx, {
        activate() { return activation.promise; },
      });

      const start = au.start(probe.root);
      assert.instanceOf(start, Promise);
      assert.strictEqual(au.stop(true), start, 'stop joins the in-flight start transaction');

      activation.reject(activationError);
      await assertRejectsWith(start, activationError);

      assert.strictEqual(probe.calls.deactivate, 1, 'failed activation is rolled back');
      assert.strictEqual(probe.calls.dispose, 1, 'the queued stop(true) disposes after rollback');
      assertIdle(au);
      assertUnpublished(ctx, probe.host);
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
      assert.strictEqual(stop, replacement, 'stop joins the complete queued replacement transition');
      assert.deepStrictEqual(calls, ['A:activate', 'A:deactivate']);
      await assertPending(stop as Promise<void>, 'the replacement transition remains gated by A stopping');

      rootAStop.resolve();
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

    it('quarantines an app root after an asynchronous hydration-phase failure', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const hydration = createDeferred();
      const hydrationError = Symbol('hydrating app task failed');
      let disposeCalls = 0;
      const App = CustomElement.define({
        name: 'async-hydration-failure-app',
        template: 'content',
      }, class {
        public dispose(): void {
          ++disposeCalls;
        }
      });
      const au = new Aurelia(ctx.container);
      au.register(AppTask.hydrating(() => hydration.promise)).app({ host, component: App });
      const failedRoot = au.root;

      const start = au.start();
      assert.instanceOf(start, Promise);
      assertPublished(ctx, au, { root: failedRoot, host });

      hydration.reject(hydrationError);
      await assertRejectsWith(start, hydrationError);

      assert.strictEqual(disposeCalls, 1, 'a hydration failure disposes the partially constructed root');
      assertIdle(au);
      assertUnpublished(ctx, host);
      assert.match(String(captureThrow(() => au.start())), /AUR0770/, 'the quarantined root is not offered for retry');
      au.dispose();
    });

    it('continues failed-start cleanup when an asynchronous deactivating task rejects', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const activationError = Symbol('activation failed');
      const rollbackError = Symbol('asynchronous rollback failed');
      const calls: string[] = [];
      const App = CustomElement.define({ name: 'async-failed-start-cleanup', template: 'running' }, class {
        public detaching(): void { calls.push('component:detaching'); }
        public unbinding(): void { calls.push('component:unbinding'); }
        public dispose(): void { calls.push('component:dispose'); }
      });
      const au = new Aurelia(ctx.container);
      au.register(
        AppTask.activated(() => { throw activationError; }),
        AppTask.deactivating(() => Promise.reject(rollbackError)),
        AppTask.deactivated(() => { calls.push('task:deactivated'); }),
      ).app({ host, component: App });

      const error = await captureRejection(au.start());

      assertAggregateErrors(error, [activationError, rollbackError]);
      assert.deepStrictEqual(calls, [
        'component:detaching',
        'component:unbinding',
        'task:deactivated',
        'component:dispose',
      ]);
      assert.strictEqual(host.textContent, '');
      assertIdle(au);
      assertUnpublished(ctx, host);
      au.dispose();
    });

    it('disposes a never-started replacement when its preceding stop fails', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const stopGate = createDeferred();
      const stopError = Symbol('preceding stop failed');
      const disposeError = Symbol('queued root disposal failed');
      const rootA = createRootProbe(ctx, {
        deactivate() { return stopGate.promise; },
      });
      const hostB = ctx.createElement('div');
      let rootBDisposals = 0;
      const RootB = CustomElement.define({ name: 'never-started-replacement', template: 'B' }, class {
        public dispose(): void {
          ++rootBDisposals;
          throw disposeError;
        }
      });

      au.app({ host: hostB, component: RootB });
      await au.start(rootA.root);
      const precedingStop = au.stop();
      assert.instanceOf(precedingStop, Promise);
      const replacement = au.start();
      assert.instanceOf(replacement, Promise);
      assert.strictEqual(au.stop(true), replacement, 'the queued stop owns the never-started replacement');

      stopGate.reject(stopError);
      const error = await captureRejection(replacement);

      assertAggregateErrors(error, [stopError, disposeError]);
      assert.strictEqual(rootBDisposals, 1);
      assert.strictEqual(rootA.calls.deactivate, 1);
      assert.strictEqual(hostB.textContent, '', 'the replacement never reaches activation');
      assertIdle(au);
      assertUnpublished(ctx, rootA.host);
      assert.match(String(captureThrow(() => au.start())), /AUR0770/, 'the disposed next root is not offered again');
      au.dispose();
    });
  });

  describe('standalone root rollback', function () {
    it('preserves synchronous activation, rollback, and disposal failures in causal order', function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const activationError = Symbol('activation failed');
      const rollbackError = Symbol('rollback failed');
      const disposeError = Symbol('disposal failed');
      const component = {
        dispose() { throw disposeError; },
      };
      const container = ctx.container.createChild().register(
        AppTask.activated(() => { throw activationError; }),
        AppTask.deactivating(() => { throw rollbackError; }),
      );
      const au = new Aurelia(ctx.container);

      const error = captureThrow(() => au.enhance({ host, component, container }));

      assertAggregateErrors(error, [activationError, rollbackError, disposeError]);
      assert.strictEqual(host.textContent, '');
      au.dispose();
    });

    it('waits for successful asynchronous rollback before reporting a synchronous activation failure', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const rollback = createDeferred();
      const activationError = Symbol('activation failed');
      let disposeCalls = 0;
      const component = {
        dispose() { ++disposeCalls; },
      };
      const container = ctx.container.createChild().register(
        AppTask.activated(() => { throw activationError; }),
        AppTask.deactivating(() => rollback.promise),
      );
      const au = new Aurelia(ctx.container);

      const enhancement = au.enhance({ host, component, container });
      assert.instanceOf(enhancement, Promise);
      await assertPending(enhancement as Promise<IAppRoot>, 'standalone activation owns asynchronous rollback');

      rollback.resolve();
      await assertRejectsWith(enhancement as Promise<IAppRoot>, activationError);
      assert.strictEqual(disposeCalls, 1);
      au.dispose();
    });

    it('aggregates an asynchronous rollback rejection with the activation failure', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const activationError = Symbol('activation failed');
      const rollbackError = Symbol('rollback failed');
      let disposeCalls = 0;
      const component = {
        dispose() { ++disposeCalls; },
      };
      const container = ctx.container.createChild().register(
        AppTask.activated(() => { throw activationError; }),
        AppTask.deactivating(() => Promise.reject(rollbackError)),
      );
      const au = new Aurelia(ctx.container);

      const error = await captureRejection(au.enhance({ host, component, container }) as Promise<IAppRoot>);

      assertAggregateErrors(error, [activationError, rollbackError]);
      assert.strictEqual(disposeCalls, 1);
      au.dispose();
    });

    it('removes enhancement bindings and disposes after an activated app task rejects', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      host.innerHTML = '<button click.trigger="increment()">${message}</button>';
      const activationError = Symbol('activated app task failed');
      const calls: string[] = [];
      const component = {
        message: 'ready',
        clicks: 0,
        increment() { ++this.clicks; },
        detaching() { calls.push('detaching'); },
        unbinding() { calls.push('unbinding'); },
        dispose() { calls.push('dispose'); },
      };
      const container = ctx.container.createChild().register(
        AppTask.activated(() => Promise.reject(activationError)),
      );
      const au = new Aurelia(ctx.container);

      const enhancement = au.enhance({ host, component, container });
      assert.instanceOf(enhancement, Promise);
      await assertRejectsWith(enhancement as Promise<IAppRoot>, activationError);

      assert.deepStrictEqual(calls, ['detaching', 'unbinding', 'dispose']);
      const button = host.querySelector('button') as HTMLButtonElement;
      assert.strictEqual(button.textContent, 'ready', 'enhance retains the adopted DOM after rollback');
      button.click();
      assert.strictEqual(component.clicks, 0, 'rollback removes listeners installed by the failed enhancement');
      component.message = 'changed after rollback';
      await new Promise<void>(resolve => ctx.platform.setTimeout(resolve, 0));
      assert.strictEqual(button.textContent, 'ready', 'rollback removes bindings installed by the failed enhancement');
      au.dispose();
    });
  });

  describe('failed stop finalization', function () {
    it('reports asynchronous and synchronous deactivating task vetoes in registration order', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const asyncVeto = createDeferred();
      const asyncError = Symbol('first asynchronous veto');
      const syncError = Symbol('second synchronous veto');
      let shouldVeto = true;
      const App = CustomElement.define({ name: 'ordered-app-task-vetoes', template: 'running' }, class {});
      const au = new Aurelia(ctx.container);
      au.register(
        AppTask.deactivating(() => shouldVeto ? asyncVeto.promise : void 0),
        AppTask.deactivating(() => {
          if (shouldVeto) {
            throw syncError;
          }
        }),
      ).app({ host, component: App });
      await au.start();

      const stop = au.stop();
      assert.instanceOf(stop, Promise);
      await assertPending(stop as Promise<void>, 'the synchronous veto waits for the accepted asynchronous task');
      asyncVeto.reject(asyncError);
      const error = await captureRejection(stop);

      assertAggregateErrors(error, [asyncError, syncError]);
      assert.strictEqual(au.isRunning, true);
      assert.strictEqual(host.textContent, 'running');

      shouldVeto = false;
      await au.stop(true);
      au.dispose();
    });

    it('aggregates controller and deactivated-task failures after completing mandatory cleanup', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const controllerError = Symbol('controller cleanup failed');
      const taskError = Symbol('deactivated task failed');
      const calls: string[] = [];
      const App = CustomElement.define({ name: 'aggregate-stop-cleanup', template: 'running' }, class {
        public detaching(): void {
          calls.push('component:detaching');
          throw controllerError;
        }
        public unbinding(): void { calls.push('component:unbinding'); }
        public dispose(): void { calls.push('component:dispose'); }
      });
      const au = new Aurelia(ctx.container);
      au.register(AppTask.deactivated(() => {
        calls.push('task:deactivated');
        throw taskError;
      })).app({ host, component: App });
      await au.start();

      const error = await captureRejection(au.stop(true));

      assertAggregateErrors(error, [controllerError, taskError]);
      assert.deepStrictEqual(calls, [
        'component:detaching',
        'component:unbinding',
        'task:deactivated',
        'component:dispose',
      ]);
      assertIdle(au);
      assertUnpublished(ctx, host);
      au.dispose();
    });

    it('reports a task-queue failure after otherwise successful deactivation', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const taskGate = createDeferred();
      const taskError = Symbol('queued work failed');
      const probe = createRootProbe(ctx);
      await au.start(probe.root);
      void queueAsyncTask(() => taskGate.promise);

      const stop = au.stop(false);
      assert.instanceOf(stop, Promise);
      await assertPending(stop as Promise<void>, 'stop retains task-queue work accepted by the running app');
      taskGate.reject(taskError);
      await assertRejectsWith(stop, taskError);

      assert.strictEqual(probe.calls.deactivate, 1);
      assert.strictEqual(probe.calls.dispose, 0);
      assertIdle(au);
      assertUnpublished(ctx, probe.host);
      au.dispose();
    });

    it('aggregates deactivation and task-queue failures before finalizing stop', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const deactivationError = Symbol('deactivation failed');
      const taskError = Symbol('queued work failed');
      const taskGate = createDeferred();
      const probe = createRootProbe(ctx, {
        deactivate() { throw deactivationError; },
      });
      await au.start(probe.root);
      void queueAsyncTask(() => taskGate.promise);

      const stop = au.stop(true);
      assert.instanceOf(stop, Promise);
      await assertPending(stop as Promise<void>, 'failed deactivation still waits for task-queue quiescence');
      taskGate.reject(taskError);
      const error = await captureRejection(stop);

      assertAggregateErrors(error, [deactivationError, taskError]);
      assert.strictEqual(probe.calls.dispose, 1);
      assertIdle(au);
      assertUnpublished(ctx, probe.host);
      au.dispose();
    });

    it('aggregates a stop veto with task-queue failure while restoring the running app', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const vetoError = Symbol('stop vetoed');
      const taskError = Symbol('queued work failed');
      const taskGate = createDeferred();
      let shouldVeto = true;
      const App = CustomElement.define({ name: 'veto-with-task-error', template: 'running' }, class {});
      const au = new Aurelia(ctx.container);
      au.register(AppTask.deactivating(() => {
        if (shouldVeto) {
          throw vetoError;
        }
      })).app({ host, component: App });
      await au.start();
      void queueAsyncTask(() => taskGate.promise);

      const stop = au.stop();
      assert.instanceOf(stop, Promise);
      await assertPending(stop as Promise<void>, 'veto finalization waits for task-queue quiescence');
      taskGate.reject(taskError);
      const error = await captureRejection(stop);

      assertAggregateErrors(error, [vetoError, taskError]);
      assert.strictEqual(au.isRunning, true);
      assert.strictEqual(au.isStopping, false);
      assert.strictEqual(host.textContent, 'running');

      shouldVeto = false;
      await au.stop(true);
      au.dispose();
    });

    it('treats a failing deactivating app task as a recoverable stop veto', async function () {
      const ctx = TestContext.create();
      const host = ctx.createElement('div');
      const taskGate = createDeferred();
      const error = new Error('deactivating app task failed');
      const calls: string[] = [];
      let shouldVeto = true;
      let stoppedEvents = 0;

      const App = CustomElement.define({ name: 'app-task-stop-recovery', template: 'running' }, class {
        public detaching(): void {
          calls.push('component:detaching');
        }

        public unbinding(): void {
          calls.push('component:unbinding');
        }

        public dispose(): void {
          calls.push('component:dispose');
        }
      });
      const au = new Aurelia(ctx.container);
      au.register(
        AppTask.deactivating(() => {
          calls.push(shouldVeto ? 'task:veto' : 'task:allow');
          if (shouldVeto) {
            throw error;
          }
        }),
        AppTask.deactivating(() => {
          calls.push('task:sibling');
          if (shouldVeto) {
            return taskGate.promise;
          }
        }),
        AppTask.deactivated(() => { calls.push('task:deactivated'); }),
      ).app({ host, component: App });
      host.addEventListener('au-stopped', () => { ++stoppedEvents; });
      await au.start();
      const root = au.root;

      const stop = au.stop(true);
      assert.instanceOf(stop, Promise);
      await assertPending(stop as Promise<void>, 'the veto waits for accepted sibling tasks to quiesce');
      assert.deepStrictEqual(calls, ['task:veto', 'task:sibling']);

      taskGate.resolve();
      await assertRejectsWith(stop, error);

      assert.deepStrictEqual(calls, ['task:veto', 'task:sibling']);
      assert.strictEqual(host.textContent, 'running', 'the veto leaves the application DOM intact');
      assert.strictEqual(stoppedEvents, 0, 'a veto is not a completed stop transition');
      assert.strictEqual(au.isRunning, true);
      assert.strictEqual(au.isStopping, false);
      assertPublished(ctx, au, { root, host });

      shouldVeto = false;
      await au.stop(true);

      assert.deepStrictEqual(calls, [
        'task:veto',
        'task:sibling',
        'task:allow',
        'task:sibling',
        'component:detaching',
        'component:unbinding',
        'task:deactivated',
        'component:dispose',
      ]);
      assert.strictEqual(stoppedEvents, 1);
      assertIdle(au);
      assertUnpublished(ctx, host);
      au.dispose();
    });

    it('waits for task settlement after a synchronous stop failure and keeps stop(false) reusable', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const deactivationError = Symbol('sync deactivation failed');
      const taskGate = createDeferred();
      let shouldFail = true;
      const probe = createRootProbe(ctx, {
        deactivate() {
          if (shouldFail) {
            shouldFail = false;
            throw deactivationError;
          }
        },
      });
      let startedEvents = 0;
      let stoppedEvents = 0;
      probe.host.addEventListener('au-started', () => { ++startedEvents; });
      probe.host.addEventListener('au-stopped', () => { ++stoppedEvents; });
      await au.start(probe.root);
      void queueAsyncTask(() => taskGate.promise);

      const stop = au.stop(false);
      assert.instanceOf(stop, Promise, 'the failed stop still crosses the task-settlement boundary');
      assert.strictEqual(au.stop(false), stop, 'concurrent stops share the in-flight finalization');
      await assertPending(stop as Promise<void>, 'queued async work retains failed stop finalization');
      assert.strictEqual(au.isStopping, true);
      assertPublished(ctx, au, probe);

      taskGate.resolve();
      await assertRejectsWith(stop, deactivationError);
      assert.strictEqual(probe.calls.dispose, 0, 'stop(false) does not dispose after failure');
      assertIdle(au);
      assertUnpublished(ctx, probe.host);
      assert.strictEqual(stoppedEvents, 0, 'au-stopped remains success-only');

      await au.start(probe.root);
      assert.strictEqual(startedEvents, 2);
      await au.stop(true);
      assert.strictEqual(stoppedEvents, 1);
      au.dispose();
    });

    it('preserves undefined from an asynchronous stop failure and honors stop(true)', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const probe = createRootProbe(ctx, {
        deactivate() { return Promise.reject(); },
      });
      let stoppedEvents = 0;
      probe.host.addEventListener('au-stopped', () => { ++stoppedEvents; });
      await au.start(probe.root);

      const stop = au.stop(true);
      assert.instanceOf(stop, Promise);
      await assertRejectsWith(stop, void 0);

      assert.strictEqual(probe.calls.dispose, 1);
      assert.strictEqual(stoppedEvents, 0);
      assertIdle(au);
      assertUnpublished(ctx, probe.host);
      au.dispose();
    });

    it('aggregates deactivation and disposal failures without retaining poisoned state', async function () {
      const ctx = TestContext.create();
      const au = new Aurelia(ctx.container);
      const deactivationError = Symbol('deactivation failed');
      const disposeError = Symbol('dispose failed');
      const probe = createRootProbe(ctx, {
        deactivate() { return Promise.reject(deactivationError); },
        dispose() { throw disposeError; },
      });
      let stoppedEvents = 0;
      probe.host.addEventListener('au-stopped', () => { ++stoppedEvents; });
      await au.start(probe.root);

      const error = await captureRejection(au.stop(true));
      assertAggregateErrors(error, [deactivationError, disposeError]);
      assert.strictEqual(probe.calls.dispose, 1);
      assert.strictEqual(stoppedEvents, 0);
      assertIdle(au);
      assertUnpublished(ctx, probe.host);

      assert.doesNotThrow(() => au.dispose());
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

function assertAggregateErrors(error: unknown, expected: readonly unknown[]): void {
  assert.instanceOf(error, AggregateError);
  assert.deepStrictEqual((error as AggregateError).errors, expected);
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

async function waitFor(condition: () => boolean): Promise<void> {
  for (let i = 0; i < 20; ++i) {
    if (condition()) {
      return;
    }
    await Promise.resolve();
  }
  assert.fail('condition did not become true');
}
