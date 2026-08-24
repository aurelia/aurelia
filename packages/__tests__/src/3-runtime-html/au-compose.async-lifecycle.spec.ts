import {
  AuCompose,
  customElement,
  CustomElement,
  type ICustomElementController,
  type IHydratedController,
} from '@aurelia/runtime-html';
import { runTasks, tasksSettled } from '@aurelia/runtime';
import type { ICompositionController } from '@aurelia/runtime-html/dist/types/resources/custom-elements/au-compose';
import { assert, createFixture } from '@aurelia/testing';

class Deferred<T = void> {
  public readonly promise: Promise<T>;
  public resolve!: (value: T | PromiseLike<T>) => void;
  public reject!: (reason?: unknown) => void;

  public constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

describe('3-runtime-html/au-compose.async-lifecycle.spec.ts', function () {
  describe('model-only async activation', function () {
    for (const flushMode of ['sync', 'async'] as const) {
      it(`serializes model-only activate calls with flush-mode=${flushMode}`, async function () {
        const first = new Deferred();
        const second = new Deferred();
        const calls: string[] = [];
        const completed: string[] = [];
        let constructorCount = 0;

        const ModelComponent = CustomElement.define({
          name: `model-update-${flushMode}`,
          template: '',
        }, class {
          public constructor() {
            constructorCount++;
          }

          public activate(model: string): void | Promise<void> {
            calls.push(model);
            if (model === 'first') {
              return first.promise.then(() => { completed.push(model); });
            }
            if (model === 'second') {
              return second.promise.then(() => { completed.push(model); });
            }
          }
        });

        const fixture = createFixture(
          `<au-compose component.bind="component" model.bind="model" flush-mode="${flushMode}" composing.bind="composing" composition.bind="composition"></au-compose>`,
          class App {
            public component = ModelComponent;
            public model = 'initial';
            public composing: void | Promise<void>;
            public composition: ICompositionController | undefined;
          },
          [ModelComponent],
        );
        const { component } = fixture;
        await tasksSettled();

        const initialComposition = component.composition;
        assert.notStrictEqual(initialComposition, void 0);
        assert.strictEqual(constructorCount, 1);
        assert.deepStrictEqual(calls, ['initial']);
        assert.strictEqual(component.composing, void 0);

        component.model = 'first';
        await tasksSettled();
        const firstOperation = component.composing;
        assert.instanceOf(firstOperation, Promise);
        assert.deepStrictEqual(calls, ['initial', 'first']);

        component.model = 'second';
        await tasksSettled();
        const allOperations = component.composing;
        assert.instanceOf(allOperations, Promise);
        assert.notStrictEqual(allOperations, firstOperation);
        assert.deepStrictEqual(calls, ['initial', 'first'], 'the second activate call waits for the first');

        first.resolve();
        await firstOperation;
        assert.deepStrictEqual(completed, ['first']);
        assert.deepStrictEqual(calls, ['initial', 'first', 'second']);

        second.resolve();
        await allOperations;
        await tasksSettled();

        assert.deepStrictEqual(completed, ['first', 'second']);
        assert.strictEqual(component.composing, void 0);
        assert.strictEqual(component.composition, initialComposition);
        assert.strictEqual(constructorCount, 1);

        component.model = 'synchronous';
        await tasksSettled();
        assert.deepStrictEqual(calls, ['initial', 'first', 'second', 'synchronous']);
        assert.strictEqual(component.composing, void 0, 'a synchronous update keeps the synchronous fast path');
        assert.strictEqual(component.composition, initialComposition);

        await fixture.stop(true);
      });
    }

    it('reports a rejected model update without poisoning later updates', async function () {
      const first = new Deferred();
      const third = new Deferred();
      const calls: string[] = [];
      const error = new Error('model update failed');
      const laterError = new Error('later model update failed');

      const ModelComponent = CustomElement.define({
        name: 'rejecting-model-update',
        template: '',
      }, class {
        public activate(model: string): void | Promise<void> {
          calls.push(model);
          if (model === 'first') {
            return first.promise;
          }
          if (model === 'third') {
            return third.promise;
          }
        }
      });

      const fixture = createFixture(
        '<au-compose component.bind="component" model.bind="model" composing.bind="composing" composition.bind="composition"></au-compose>',
        class App {
          public component = ModelComponent;
          public model = 'initial';
          public composing: void | Promise<void>;
          public composition: ICompositionController | undefined;
        },
        [ModelComponent],
      );
      const { component } = fixture;
      await tasksSettled();

      const initialComposition = component.composition;
      component.model = 'first';
      await tasksSettled();
      const rejectedOperation = component.composing as Promise<void>;
      assert.instanceOf(rejectedOperation, Promise);
      const observedRejection = rejectedOperation.catch(reason => {
        assert.strictEqual(reason, error);
      });

      component.model = 'second';
      await tasksSettled();
      const recoveryOperation = component.composing as Promise<void>;
      assert.instanceOf(recoveryOperation, Promise);
      assert.notStrictEqual(recoveryOperation, rejectedOperation);
      assert.deepStrictEqual(calls, ['initial', 'first']);

      first.reject(error);
      await observedRejection;
      await recoveryOperation;
      await tasksSettled();

      assert.deepStrictEqual(calls, ['initial', 'first', 'second']);
      assert.strictEqual(component.composing, void 0);
      assert.strictEqual(component.composition, initialComposition);
      const capturedError = await rejectedOperation.then(
        () => void 0,
        reason => reason
      );
      assert.strictEqual(capturedError, error, 'later recovery does not change the captured rejected operation');

      component.model = 'third';
      await tasksSettled();
      const laterRejectedOperation = component.composing as Promise<void>;
      assert.instanceOf(laterRejectedOperation, Promise);
      const observedLaterRejection = laterRejectedOperation.catch(reason => {
        assert.strictEqual(reason, laterError);
      });
      third.reject(laterError);
      await observedLaterRejection;
      await tasksSettled();

      assert.deepStrictEqual(calls, ['initial', 'first', 'second', 'third']);
      assert.strictEqual(component.composing, void 0);

      component.model = 'fourth';
      await tasksSettled();
      assert.deepStrictEqual(calls, ['initial', 'first', 'second', 'third', 'fourth']);
      assert.strictEqual(component.composing, void 0);

      await fixture.stop(true);
    });

    it('keeps structural composition behind a pending model update', async function () {
      const update = new Deferred();
      const calls: string[] = [];

      const FirstComponent = CustomElement.define({
        name: 'first-model-update',
        template: 'first',
      }, class {
        public activate(model: string): void | Promise<void> {
          calls.push(`first:${model}:start`);
          if (model === 'pending') {
            return update.promise.then(() => { calls.push(`first:${model}:end`); });
          }
        }
      });
      const SecondComponent = CustomElement.define({
        name: 'second-model-update',
        template: 'second',
      }, class {
        public activate(model: string): void {
          calls.push(`second:${model}`);
        }
      });

      const fixture = createFixture(
        '<au-compose component.bind="component" model.bind="model" composing.bind="composing" composition.bind="composition"></au-compose>',
        class App {
          public component: unknown = FirstComponent;
          public model = 'initial';
          public composing: void | Promise<void>;
          public composition: ICompositionController | undefined;
        },
        [FirstComponent, SecondComponent],
      );
      const { component } = fixture;
      await tasksSettled();

      const initialComposition = component.composition;
      component.model = 'pending';
      await tasksSettled();
      component.component = SecondComponent;
      await tasksSettled();

      const composing = component.composing!;
      assert.instanceOf(composing, Promise);
      assert.deepStrictEqual(calls, ['first:initial:start', 'first:pending:start']);
      assert.strictEqual(component.composition, initialComposition);

      update.resolve();
      await composing;
      await tasksSettled();

      assert.deepStrictEqual(calls, [
        'first:initial:start',
        'first:pending:start',
        'first:pending:end',
        'second:pending',
      ]);
      assert.notStrictEqual(component.composition, initialComposition);
      assert.strictEqual(component.composing, void 0);

      await fixture.stop(true);
    });

    it('drops structural work queued before detaching while a model update is pending', async function () {
      const update = new Deferred();
      const calls: string[] = [];

      const FirstComponent = CustomElement.define({
        name: 'stopping-pending-model-update',
        template: 'first',
      }, class {
        public activate(model: string): void | Promise<void> {
          calls.push(`first:activate:${model}`);
          return model === 'pending' ? update.promise : void 0;
        }

        public detaching(): void {
          calls.push('first:detaching');
        }
      });
      const SecondComponent = CustomElement.define({
        name: 'skipped-queued-composition',
        template: 'second',
      }, class {
        public constructor() {
          calls.push('second:construct');
        }

        public activate(): void {
          calls.push('second:activate');
        }

        public detaching(): void {
          calls.push('second:detaching');
        }

        public dispose(): void {
          calls.push('second:dispose');
        }
      });

      const fixture = createFixture(
        '<au-compose component.bind="component" model.bind="model" composing.bind="composing"></au-compose>',
        class App {
          public component: unknown = FirstComponent;
          public model = 'initial';
          public composing: void | Promise<void>;
        },
        [FirstComponent, SecondComponent],
      );
      const { component } = fixture;
      await tasksSettled();

      component.model = 'pending';
      await tasksSettled();
      assert.instanceOf(component.composing, Promise);

      component.component = SecondComponent;
      await tasksSettled();
      const stop = Promise.resolve(fixture.stop(true));
      await Promise.resolve();

      assert.deepStrictEqual(calls, [
        'first:activate:initial',
        'first:activate:pending',
      ]);

      update.resolve();
      await stop;

      assert.deepStrictEqual(calls, [
        'first:activate:initial',
        'first:activate:pending',
        'first:detaching',
      ]);
      assert.strictEqual(component.composing, void 0);
    });

    it('does not compose a promised component that resolves after detaching starts', async function () {
      const componentLoad = new Deferred<unknown>();
      const calls: string[] = [];

      const FirstComponent = CustomElement.define({
        name: 'active-before-promised-replacement',
        template: 'first',
      }, class {
        public detaching(): void {
          calls.push('first:detaching');
        }
      });
      const SecondComponent = CustomElement.define({
        name: 'promised-replacement-after-stop',
        template: 'second',
      }, class {
        public constructor() {
          calls.push('second:construct');
        }

        public activate(): void {
          calls.push('second:activate');
        }

        public dispose(): void {
          calls.push('second:dispose');
        }
      });

      const fixture = createFixture(
        '<au-compose component.bind="component" composing.bind="composing"></au-compose>',
        class App {
          public component: unknown = FirstComponent;
          public composing: void | Promise<void>;
        },
        [FirstComponent, SecondComponent],
      );
      await fixture.started;

      fixture.component.component = componentLoad.promise;
      await tasksSettled();
      assert.instanceOf(fixture.component.composing, Promise);
      const stop = Promise.resolve(fixture.stop(true));

      componentLoad.resolve(SecondComponent);
      await stop;

      assert.deepStrictEqual(calls, ['first:detaching']);
      assert.strictEqual(fixture.appHost.querySelector('promised-replacement-after-stop'), null);
      assert.strictEqual(fixture.component.composing, void 0);
    });

    it('ignores component changes while an owned composition is detaching', async function () {
      const detaching = new Deferred();
      const calls: string[] = [];

      const FirstComponent = CustomElement.define({
        name: 'component-changing-during-detach',
        template: 'first',
      }, class {
        public detaching(): Promise<void> {
          calls.push('first:detaching');
          return detaching.promise;
        }

        public dispose(): void {
          calls.push('first:dispose');
        }
      });
      const LateComponent = CustomElement.define({
        name: 'late-component-during-detach',
        template: 'late',
      }, class {
        public constructor() {
          calls.push('late:construct');
        }

        public attaching(): void {
          calls.push('late:attaching');
        }

        public dispose(): void {
          calls.push('late:dispose');
        }
      });

      const fixture = createFixture(
        '<au-compose component.bind="component" flush-mode="async"></au-compose>',
        class App {
          public component: unknown = FirstComponent;
        },
        [FirstComponent, LateComponent],
      );
      await fixture.started;

      let auCompose!: AuCompose;
      fixture.au.root.controller.accept(controller => {
        if (controller.viewModel instanceof AuCompose) {
          auCompose = controller.viewModel;
          return true;
        }
      });
      fixture.component.component = LateComponent;
      assert.strictEqual(auCompose.component, LateComponent, 'the binding updates AuCompose while it is still active');

      const stop = Promise.resolve(fixture.stop(true));
      assert.deepStrictEqual(calls, ['first:detaching']);

      runTasks();
      assert.deepStrictEqual(calls, ['first:detaching'], 'inactive AuCompose rejects late structural work');

      detaching.resolve();
      await stop;

      assert.deepStrictEqual(calls, ['first:detaching', 'first:dispose']);
      assert.strictEqual(fixture.appHost.querySelector('late-component-during-detach'), null);
      assert.strictEqual(fixture.appHost.textContent, '');
    });

    it('preserves a pending model rejection when detaching cancels its queued successor', async function () {
      const update = new Deferred();
      const error = new Error('canceled model queue failed');
      const calls: string[] = [];
      const unhandled: unknown[] = [];
      let handler: (reason: unknown) => void;
      let disposeHandler: () => void;

      if (typeof process !== 'undefined' && typeof process.on === 'function') {
        handler = (reason: unknown) => unhandled.push(reason);
        process.on('unhandledRejection', handler);
        disposeHandler = () => process.off('unhandledRejection', handler);
      } else {
        handler = (event: PromiseRejectionEvent) => unhandled.push(event.reason);
        addEventListener('unhandledrejection', handler);
        disposeHandler = () => removeEventListener('unhandledrejection', handler);
      }

      const ModelComponent = CustomElement.define({
        name: 'rejecting-model-queue-during-stop',
        template: '',
      }, class {
        public activate(model: string): void | Promise<void> {
          calls.push(`activate:${model}`);
          return model === 'first' ? update.promise : void 0;
        }

        public detaching(): void {
          calls.push('detaching');
        }
      });

      const fixture = createFixture(
        '<au-compose component.bind="component" model.bind="model" composing.bind="composing"></au-compose>',
        class App {
          public component = ModelComponent;
          public model = 'initial';
          public composing: void | Promise<void>;
        },
        [ModelComponent],
      );
      await fixture.started;

      fixture.component.model = 'first';
      await tasksSettled();
      fixture.component.model = 'second';
      await tasksSettled();
      const stop = Promise.resolve(fixture.stop(true));

      try {
        update.reject(error);
        await assert.rejects(() => stop, error);
        await new Promise<void>(resolve => setTimeout(resolve));
      } finally {
        disposeHandler();
      }

      assert.deepStrictEqual(calls, [
        'activate:initial',
        'activate:first',
        'detaching',
      ]);
      assert.deepStrictEqual(unhandled, []);
      assert.strictEqual(fixture.component.composing, void 0);
      fixture.au.dispose();
    });

    it('detaches its composition after a pending model update rejects', async function () {
      const update = new Deferred();
      const calls: string[] = [];
      const error = new Error('pending model update failed');

      const ModelComponent = CustomElement.define({
        name: 'detaching-model-update',
        template: '',
      }, class {
        public activate(model: string): void | Promise<void> {
          calls.push(`activate:${model}`);
          if (model === 'pending') {
            return update.promise;
          }
        }

        public detaching(): void {
          calls.push('detaching');
        }
      });

      const fixture = createFixture(
        '<au-compose component.bind="component" model.bind="model" composing.bind="composing" composition.bind="composition"></au-compose>',
        class App {
          public component = ModelComponent;
          public model = 'initial';
          public composing: void | Promise<void>;
          public composition: ICompositionController | undefined;
        },
        [ModelComponent],
      );
      const { component } = fixture;
      await tasksSettled();

      let auCompose: AuCompose | undefined;
      fixture.au.root.controller.accept(controller => {
        if (controller.viewModel instanceof AuCompose) {
          auCompose = controller.viewModel;
          return true;
        }
      });
      assert.notStrictEqual(auCompose, void 0);

      component.model = 'pending';
      await tasksSettled();
      const modelUpdate = component.composing as Promise<void>;
      assert.instanceOf(modelUpdate, Promise);

      const observedModelRejection = modelUpdate.catch(reason => {
        assert.strictEqual(reason, error);
      });
      const detachResult = auCompose!.detaching(fixture.au.root.controller);
      assert.instanceOf(detachResult, Promise);
      let detachFulfilled = false;
      const observedDetachRejection = (detachResult as Promise<void>).then(
        () => { detachFulfilled = true; },
        reason => { assert.strictEqual(reason, error); }
      );

      await tasksSettled();
      assert.deepStrictEqual(calls, ['activate:initial', 'activate:pending']);
      assert.strictEqual(detachFulfilled, false);
      assert.strictEqual(component.composing, void 0);
      assert.strictEqual(component.composition, void 0);

      update.reject(error);
      await observedModelRejection;
      await observedDetachRejection;

      assert.deepStrictEqual(calls, [
        'activate:initial',
        'activate:pending',
        'detaching',
      ]);
      assert.strictEqual(detachFulfilled, false);

      await fixture.stop(true);
    });

    for (const cleanupKind of ['synchronous', 'asynchronous'] as const) {
      it(`aggregates a rejected model update with a ${cleanupKind} teardown failure`, async function () {
        const update = new Deferred();
        const calls: string[] = [];
        const updateError = new Error('model update failed');
        const cleanupError = new Error('composition teardown failed');

        const ModelComponent = CustomElement.define({
          name: `${cleanupKind}-failing-model-update-teardown`,
          template: '',
        }, class {
          public activate(model: string): void | Promise<void> {
            calls.push(`activate:${model}`);
            if (model === 'pending') {
              return update.promise;
            }
          }

          public detaching(): void | Promise<void> {
            calls.push('detaching');
            if (cleanupKind === 'synchronous') {
              throw cleanupError;
            }
            return Promise.reject(cleanupError);
          }
        });

        const fixture = createFixture(
          '<au-compose component.bind="component" model.bind="model" composing.bind="composing" composition.bind="composition"></au-compose>',
          class App {
            public component = ModelComponent;
            public model = 'initial';
            public composing: void | Promise<void>;
            public composition: ICompositionController | undefined;
          },
          [ModelComponent],
        );
        const { component } = fixture;
        await tasksSettled();

        let auCompose: AuCompose | undefined;
        fixture.au.root.controller.accept(controller => {
          if (controller.viewModel instanceof AuCompose) {
            auCompose = controller.viewModel;
            return true;
          }
        });
        assert.notStrictEqual(auCompose, void 0);
        const detachInitiator = component.composition!.controller;

        component.model = 'pending';
        await tasksSettled();
        const modelUpdate = component.composing as Promise<void>;
        assert.instanceOf(modelUpdate, Promise);
        const observedModelRejection = modelUpdate.catch(reason => {
          assert.strictEqual(reason, updateError);
        });

        const detachResult = auCompose!.detaching(detachInitiator) as Promise<void>;
        assert.instanceOf(detachResult, Promise);
        update.reject(updateError);

        await observedModelRejection;
        const aggregate = await detachResult.then(
          () => void 0,
          reason => reason
        );
        assert.instanceOf(aggregate, AggregateError);
        assert.deepStrictEqual(aggregate.errors, [updateError, cleanupError]);
        assert.strictEqual(aggregate.message, 'AuCompose operation failed during teardown cleanup');
        assert.deepStrictEqual(calls, ['activate:initial', 'activate:pending', 'detaching']);

        await tasksSettled();
        assert.strictEqual(component.composing, void 0);
        assert.strictEqual(component.composition, void 0);

        await fixture.stop(true);
      });
    }
  });
  it('rejects initial au-compose child activation and quiesces disposal before start settles', async function () {
    const attaching = new Deferred();
    const detaching = new Deferred();
    const error = new Error('initial composed child attaching failed');
    let child!: ComposedChild;
    let compositionHost!: HTMLElement;
    let detachingCalls = 0;
    let unbindingCalls = 0;
    let disposeCalls = 0;

    @customElement({ name: 'initial-composed-child', template: 'composed child' })
    class ComposedChild {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): Promise<void> {
        compositionHost = this.$controller.host!;
        return attaching.promise;
      }

      public detaching(): Promise<void> {
        ++detachingCalls;
        return detaching.promise;
      }

      public unbinding(): void {
        ++unbindingCalls;
      }

      public dispose(): void {
        ++disposeCalls;
      }
    }

    const fixture = createFixture(
      '<au-compose component.bind="component"></au-compose>',
      class {
        public readonly component = ComposedChild;
      },
      [ComposedChild],
      false,
    );
    const start = fixture.start() as Promise<void>;
    let settled = false;
    void start.then(
      () => { settled = true; },
      () => { settled = true; },
    );

    assert.ok(child, 'the initial composition enters its attaching hook');
    assert.strictEqual(compositionHost.isConnected, true);

    attaching.reject(error);
    const rollbackStarted = await waitForMicrotasks(() => detachingCalls > 0);
    const settledBeforeRollbackDrain = settled;
    detaching.resolve();

    assert.strictEqual(rollbackStarted, true, 'the composed child enters rollback');
    assert.strictEqual(settledBeforeRollbackDrain, false, 'start waits for asynchronous rollback');
    assert.strictEqual(detachingCalls, 1);
    assert.strictEqual(unbindingCalls, 0);

    assert.strictEqual(await captureRejection(start), error);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(unbindingCalls, 1);
    assert.strictEqual(disposeCalls, 1);
    assert.strictEqual(compositionHost.isConnected, false);
    assert.strictEqual(fixture.appHost.querySelector('initial-composed-child'), null);
    assert.strictEqual(fixture.appHost.textContent, '');

    await fixture.tearDown();
  });

  it('preflights a live controller owned by AuCompose', async function () {
    const gate = new Deferred();

    @customElement({ name: 'live-compose-disposal-child', template: 'child' })
    class Child {
      public detaching(): Promise<void> {
        return gate.promise;
      }
    }

    const fixture = createFixture(
      '<au-compose component.bind="component" composition.bind="composition"></au-compose>',
      class App {
        public component = Child;
        public composition?: { readonly controller: IHydratedController };
      },
      [Child],
    );
    await fixture.started;
    const root = fixture.au.root.controller;
    let auComposeController: IHydratedController | undefined;
    root.accept(controller => {
      if (controller.viewModel instanceof AuCompose) {
        auComposeController = controller;
        return true;
      }
    });
    assert.notStrictEqual(auComposeController, void 0);
    const composed = fixture.component.composition!.controller;
    const drain = composed.deactivate(composed, auComposeController!) as Promise<void>;

    assert.throws(() => root.dispose(), /AUR0510:.*lifecycle operation is running/i);
    assert.strictEqual(root.isActive, true);
    assert.notStrictEqual(root.viewModel, null);
    assert.notStrictEqual((composed as unknown as { nodes: unknown }).nodes, null);

    gate.resolve();
    await drain;
    await fixture.tearDown();
  });

  it('retains an old AuCompose controller in traversal until recomposition teardown settles', async function () {
    const gate = new Deferred();

    @customElement({ name: 'retiring-compose-child', template: 'old' })
    class RetiringChild {
      public detaching(): Promise<void> {
        return gate.promise;
      }
    }

    @customElement({ name: 'replacement-compose-child', template: 'new' })
    class ReplacementChild {}

    const fixture = createFixture(
      '<au-compose component.bind="component" composing.bind="composing" composition.bind="composition"></au-compose>',
      class App {
        public component: unknown = RetiringChild;
        public composing?: Promise<void> | void;
        public composition?: { readonly controller: IHydratedController };
      },
      [RetiringChild, ReplacementChild],
    );
    await fixture.started;
    const root = fixture.au.root.controller;
    const oldController = fixture.component.composition!.controller;

    fixture.component.component = ReplacementChild;
    await tasksSettled();
    const composing = fixture.component.composing;
    assert.instanceOf(composing, Promise);
    assert.notStrictEqual(fixture.component.composition!.controller, oldController);
    assert.throws(() => root.dispose(), /AUR0510:.*lifecycle operation is running/i);
    assert.strictEqual(root.isActive, true);
    assert.notStrictEqual((oldController as unknown as { nodes: unknown }).nodes, null);

    gate.resolve();
    await composing;
    fixture.assertText('new');
    await fixture.tearDown();
  });

  for (const failureKind of ['synchronous', 'asynchronous'] as const) {
    it(`removes an old AuCompose host after ${failureKind} recomposition teardown failure`, async function () {
      const error = new Error(`${failureKind} old composition teardown failed`);

      @customElement({ name: `${failureKind}-failing-retiring-child`, template: 'old' })
      class RetiringChild {
        public detaching(): void | Promise<void> {
          if (failureKind === 'synchronous') {
            throw error;
          }
          return Promise.reject(error);
        }
      }

      @customElement({ name: `${failureKind}-replacement-child`, template: 'new' })
      class ReplacementChild {}

      const fixture = createFixture(
        '<au-compose component.bind="component" composing.bind="composing" composition.bind="composition"></au-compose>',
        class App {
          public component: unknown = RetiringChild;
          public composing?: Promise<void> | void;
          public composition?: { readonly controller: IHydratedController };
        },
        [RetiringChild, ReplacementChild],
      );
      await fixture.started;

      if (failureKind === 'synchronous') {
        assert.throws(() => { fixture.component.component = ReplacementChild; }, error);
      } else {
        fixture.component.component = ReplacementChild;
        await tasksSettled();
        const composing = fixture.component.composing;
        assert.instanceOf(composing, Promise);
        await assert.rejects(() => composing as Promise<void>, error);
      }
      await tasksSettled();

      assert.strictEqual(fixture.appHost.querySelectorAll(`${failureKind}-failing-retiring-child`).length, 0);
      assert.strictEqual(fixture.appHost.querySelectorAll(`${failureKind}-replacement-child`).length, 1);
      fixture.assertText('new');
      assert.strictEqual(fixture.component.composing, void 0);

      await fixture.tearDown();
    });
  }

  it('disposes defensive multi-owner residue serially and reports its first owner error', async function () {
    const first = new Deferred();
    const firstError = new Error('first owned composition failed');
    const secondError = new Error('second owned composition failed');
    const calls: string[] = [];
    const fixture = createFixture('<au-compose template="owned"></au-compose>');
    await fixture.started;

    let auCompose!: AuCompose;
    const root = fixture.au.root.controller;
    root.accept(controller => {
      if (controller.viewModel instanceof AuCompose) {
        auCompose = controller.viewModel;
        return true;
      }
    });
    await fixture.stop();

    const internals = auCompose as unknown as {
      readonly _ownedCompositions: Set<ICompositionController>;
      _disposeOwnedCompositions(initiator: IHydratedController): void | Promise<void>;
    };
    assert.strictEqual(internals._ownedCompositions.size, 0);
    // Normal detaching has at most one owner after `_composing` settles. Populate
    // the defensive residue path directly so its ordering/error contract remains
    // proven if future composition work leaves multiple owners behind.
    internals._ownedCompositions.add({
      controller: {
        _disposeAfterDeactivate(): void { calls.push('dispose:first'); },
      },
      deactivate(): Promise<void> {
        calls.push('deactivate:first');
        return first.promise;
      },
    } as unknown as ICompositionController);
    internals._ownedCompositions.add({
      controller: {
        _disposeAfterDeactivate(): void { calls.push('dispose:second'); },
      },
      deactivate(): never {
        calls.push('deactivate:second');
        throw secondError;
      },
    } as unknown as ICompositionController);

    const cleanup = internals._disposeOwnedCompositions(root);
    assert.instanceOf(cleanup, Promise);
    assert.deepStrictEqual(calls, ['deactivate:first'], 'the second owner waits for first-owner cleanup');

    first.reject(firstError);
    await assert.rejects(() => cleanup as Promise<void>, firstError);
    assert.deepStrictEqual(calls, [
      'deactivate:first',
      'dispose:first',
      'deactivate:second',
      'dispose:second',
    ]);
    assert.strictEqual(internals._ownedCompositions.size, 0);
    await fixture.tearDown();
  });
});

async function captureRejection(promise: Promise<void>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  assert.fail('Expected promise to reject');
}

async function waitForMicrotasks(predicate: () => boolean): Promise<boolean> {
  for (let i = 0; i < 20 && !predicate(); ++i) {
    await Promise.resolve();
  }
  return predicate();
}
