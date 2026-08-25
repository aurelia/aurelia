import {
  AuCompose,
  customElement,
  CustomElement,
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
  describe('post-start update ownership', function () {
    for (const flushMode of ['sync', 'async'] as const) {
      it(`keeps model-only activate work component-owned with flush-mode=${flushMode}`, async function () {
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
        assert.deepStrictEqual(calls, ['initial', 'first']);
        assert.strictEqual(component.composing, void 0);

        component.model = 'second';
        await tasksSettled();
        assert.deepStrictEqual(calls, ['initial', 'first', 'second']);
        assert.strictEqual(component.composing, void 0);

        second.resolve();
        await second.promise;
        await Promise.resolve();
        assert.deepStrictEqual(completed, ['second']);

        first.resolve();
        await first.promise;
        await Promise.resolve();
        assert.deepStrictEqual(completed, ['second', 'first']);
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

    it('does not let pending model work delay structural replacement or application teardown', async function () {
      const modelWork = new Deferred();
      const calls: string[] = [];

      const FirstComponent = CustomElement.define({
        name: 'component-with-pending-model-work',
        template: 'first',
      }, class {
        public activate(model: string): void | Promise<void> {
          calls.push(`first:activate:${model}`);
          return model === 'pending' ? modelWork.promise : void 0;
        }

        public detaching(): void {
          calls.push('first:detaching');
        }
      });
      const ReplacementComponent = CustomElement.define({
        name: 'replacement-during-model-work',
        template: 'replacement',
      }, class {
        public attaching(): void {
          calls.push('replacement:attaching');
        }

        public detaching(): void {
          calls.push('replacement:detaching');
        }
      });

      const fixture = createFixture(
        '<au-compose component.bind="component" model.bind="model" composing.bind="composing"></au-compose>',
        class App {
          public component: unknown = FirstComponent;
          public model = 'initial';
          public composing: void | Promise<void>;
        },
        [FirstComponent, ReplacementComponent],
      );
      await fixture.started;

      fixture.component.model = 'pending';
      await tasksSettled();
      assert.strictEqual(fixture.component.composing, void 0);

      fixture.component.component = ReplacementComponent;
      await tasksSettled();
      assert.deepStrictEqual(calls, [
        'first:activate:initial',
        'first:activate:pending',
        'replacement:attaching',
        'first:detaching',
      ]);
      fixture.assertText('replacement');

      await fixture.stop(true);
      assert.deepStrictEqual(calls, [
        'first:activate:initial',
        'first:activate:pending',
        'replacement:attaching',
        'first:detaching',
        'replacement:detaching',
      ]);

      modelWork.resolve();
      await modelWork.promise;
    });

    it('drops structural work queued behind a pending composition when detaching starts', async function () {
      const componentLoad = new Deferred<unknown>();
      const calls: string[] = [];

      const FirstComponent = CustomElement.define({
        name: 'active-before-queued-structural-work',
        template: 'first',
      }, class {
        public detaching(): void {
          calls.push('first:detaching');
        }
      });
      const LoadedComponent = CustomElement.define({
        name: 'loaded-after-structural-detach',
        template: 'loaded',
      }, class {
        public constructor() {
          calls.push('loaded:construct');
        }

        public attaching(): void {
          calls.push('loaded:attaching');
        }
      });
      const QueuedComponent = CustomElement.define({
        name: 'queued-after-pending-composition',
        template: 'queued',
      }, class {
        public constructor() {
          calls.push('queued:construct');
        }

        public attaching(): void {
          calls.push('queued:attaching');
        }
      });

      const fixture = createFixture(
        '<au-compose component.bind="component" composing.bind="composing"></au-compose>',
        class App {
          public component: unknown = FirstComponent;
          public composing: void | Promise<void>;
        },
        [FirstComponent, LoadedComponent, QueuedComponent],
      );
      const { component } = fixture;
      await tasksSettled();

      component.component = componentLoad.promise;
      await tasksSettled();
      assert.instanceOf(component.composing, Promise);

      component.component = QueuedComponent;
      await tasksSettled();
      const stop = Promise.resolve(fixture.stop(true));
      await Promise.resolve();

      assert.deepStrictEqual(calls, []);

      componentLoad.resolve(LoadedComponent);
      await stop;

      assert.deepStrictEqual(calls, ['first:detaching']);
      assert.strictEqual(component.composing, void 0);
      assert.strictEqual(fixture.appHost.querySelector('loaded-after-structural-detach'), null);
      assert.strictEqual(fixture.appHost.querySelector('queued-after-pending-composition'), null);
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

  });

  describe('structural activation ownership', function () {

    it('retires every composition created by a reentrant initial update', async function () {
      const attaching = new Deferred();
      let app!: App;
      let outerDisposeCalls = 0;
      let innerDisposeCalls = 0;

      @customElement({ name: 'reentrant-outer-composition', template: 'outer' })
      class OuterComposition {
        public binding(): void {
          // Re-enter the bindable while the outer queue is still inside work()
          // and has not yet published its Promise tail.
          app.component = InnerComposition;
        }

        public attaching(): Promise<void> {
          return attaching.promise;
        }

        public dispose(): void {
          ++outerDisposeCalls;
        }
      }

      @customElement({ name: 'reentrant-inner-composition', template: 'inner' })
      class InnerComposition {
        public dispose(): void {
          ++innerDisposeCalls;
        }
      }

      class App {
        public component: unknown = OuterComposition;

        public constructor() {
          app = this;
        }
      }

      const fixture = createFixture(
        '<au-compose component.bind="component"></au-compose>',
        App,
        [OuterComposition, InnerComposition],
        false,
      );
      const start = fixture.start() as Promise<void>;
      assert.instanceOf(start, Promise);
      assert.notStrictEqual(fixture.appHost.querySelector('reentrant-outer-composition'), null);
      assert.notStrictEqual(fixture.appHost.querySelector('reentrant-inner-composition'), null);

      attaching.resolve();
      await start;

      assert.strictEqual(outerDisposeCalls, 1);
      assert.strictEqual(innerDisposeCalls, 0);
      assert.strictEqual(fixture.appHost.querySelector('reentrant-outer-composition'), null);
      assert.notStrictEqual(fixture.appHost.querySelector('reentrant-inner-composition'), null);

      await fixture.stop(true);
      assert.strictEqual(innerDisposeCalls, 1);
      assert.strictEqual(fixture.appHost.textContent, '');
    });

    it('propagates synchronous initial composition activation failure to start', async function () {
      const error = new Error('synchronous initial composition activation failed');

      @customElement({ name: 'synchronously-failing-initial-composition', template: 'failing' })
      class FailingComposition {
        public attaching(): never {
          throw error;
        }
      }

      const fixture = createFixture(
        '<au-compose component.bind="component"></au-compose>',
        class App { public component = FailingComposition; },
        [FailingComposition],
        false,
      );

      assert.throws(() => fixture.start(), error);
      assert.strictEqual(fixture.torn, true);
    });

    it('retires a composition invalidated while controller activation is pending', async function () {
      const attaching = new Deferred();
      let detachingCalls = 0;
      let disposeCalls = 0;

      @customElement({ name: 'stable-before-controller-activation', template: 'stable' })
      class StableComposition {}

      @customElement({ name: 'invalidated-during-controller-activation', template: 'pending' })
      class PendingComposition {
        public attaching(): Promise<void> {
          return attaching.promise;
        }

        public detaching(): void {
          ++detachingCalls;
        }

        public dispose(): void {
          ++disposeCalls;
        }
      }

      const fixture = createFixture(
        '<au-compose component.bind="component" composing.bind="composing"></au-compose>',
        class App {
          public component: unknown = StableComposition;
          public composing: void | Promise<void>;
        },
        [StableComposition, PendingComposition],
      );
      await fixture.started;

      fixture.component.component = PendingComposition;
      await tasksSettled();
      const composing = fixture.component.composing;
      assert.instanceOf(composing, Promise);
      const stop = fixture.stop();
      assert.instanceOf(stop, Promise);

      attaching.resolve();
      await composing;
      await stop;

      assert.strictEqual(detachingCalls, 1);
      assert.strictEqual(disposeCalls, 1);
      assert.strictEqual(fixture.appHost.textContent, '');
      await fixture.tearDown();
    });

    it('retires a never-started composition invalidated during pre-composition activation', async function () {
      const activating = new Deferred();
      let bindingCalls = 0;
      let disposeCalls = 0;

      @customElement({ name: 'stable-before-precomposition-activation', template: 'stable' })
      class StableComposition {}

      @customElement({ name: 'invalidated-during-precomposition-activation', template: 'pending' })
      class PendingComposition {
        public activate(): Promise<void> {
          return activating.promise;
        }

        public binding(): void {
          ++bindingCalls;
        }

        public dispose(): void {
          ++disposeCalls;
        }
      }

      const fixture = createFixture(
        '<au-compose component.bind="component" composing.bind="composing"></au-compose>',
        class App {
          public component: unknown = StableComposition;
          public composing: void | Promise<void>;
        },
        [StableComposition, PendingComposition],
      );
      await fixture.started;

      fixture.component.component = PendingComposition;
      await tasksSettled();
      const composing = fixture.component.composing;
      assert.instanceOf(composing, Promise);
      const stop = fixture.stop();
      assert.instanceOf(stop, Promise);

      activating.resolve();
      await composing;
      await stop;

      assert.strictEqual(bindingCalls, 0, 'the invalidated controller never enters its lifecycle');
      assert.strictEqual(disposeCalls, 1);
      assert.strictEqual(fixture.appHost.querySelector('invalidated-during-precomposition-activation'), null);
      assert.strictEqual(fixture.appHost.textContent, '');
      await fixture.tearDown();
    });
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

});
