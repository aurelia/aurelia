import {
  customElement,
  type IBinding,
  type ICustomElementController,
  type IHydratedController,
  Repeat,
} from '@aurelia/runtime-html';
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

function abandonTerminalFixture(fixture: { readonly testHost: HTMLElement }): void {
  Object.defineProperty(fixture, 'torn', { configurable: true, value: true });
  fixture.testHost.remove();
}

function findRepeat(root: IHydratedController): Repeat {
  let repeat: Repeat | undefined;
  root.accept(controller => {
    if (controller.viewModel instanceof Repeat) {
      repeat = controller.viewModel;
      return true;
    }
  });
  assert.notStrictEqual(repeat, void 0);
  return repeat!;
}

describe('3-runtime-html/controller.deactivation-rejection.spec.ts', function () {
  it('keeps fully synchronous successful deactivation inline', async function () {
    let child!: Child;

    @customElement({ name: 'sync-deactivation-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): void {/* noop */}
      public unbinding(): void {/* noop */}
    }

    const fixture = createFixture(
      '<sync-deactivation-child></sync-deactivation-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const internals = child.$controller as unknown as { _operation: unknown };

    const result = child.$controller.deactivate(child.$controller, fixture.au.root.controller);
    assert.strictEqual(result, void 0);
    assert.strictEqual(internals._operation, null);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);

    const activation = child.$controller.activate(
      child.$controller,
      fixture.au.root.controller,
      fixture.au.root.controller.scope,
    );
    assert.strictEqual(activation, void 0);
    assert.strictEqual(internals._operation, null);
    assert.strictEqual(child.$controller.isActive, true);

    await fixture.tearDown();
  });

  it('joins a self-deactivating child into a later ancestor teardown', async function () {
    const gate = new Deferred();
    let child!: Child;
    let detachingCalls = 0;

    @customElement({ name: 'joined-self-deactivation-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): Promise<void> {
        ++detachingCalls;
        return gate.promise;
      }
    }

    const fixture = createFixture(
      '<joined-self-deactivation-child></joined-self-deactivation-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const root = fixture.au.root.controller;
    const childDrain = child.$controller.deactivate(child.$controller, root) as Promise<void>;
    const rootDrain = root.deactivate(root, null) as Promise<void>;
    assert.instanceOf(childDrain, Promise);
    assert.instanceOf(rootDrain, Promise);
    assert.notStrictEqual(rootDrain, childDrain);

    let rootSettled = false;
    void rootDrain.then(
      () => { rootSettled = true; },
      () => { rootSettled = true; },
    );
    await Promise.resolve();
    assert.strictEqual(rootSettled, false);

    gate.resolve();
    await Promise.all([childDrain, rootDrain]);
    assert.strictEqual(detachingCalls, 1);
    assert.strictEqual(root.isActive, false);

    await fixture.tearDown();
  });

  it('joins a self-activating child into a later ancestor teardown', async function () {
    const attaching = new Deferred();
    const detaching = new Deferred();
    let child!: Child;
    let blockActivation = false;
    let detachingCalls = 0;

    @customElement({ name: 'joined-self-activation-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): void | Promise<void> {
        return blockActivation ? attaching.promise : void 0;
      }

      public detaching(): void | Promise<void> {
        ++detachingCalls;
        return blockActivation ? detaching.promise : void 0;
      }
    }

    const fixture = createFixture(
      '<joined-self-activation-child></joined-self-activation-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const root = fixture.au.root.controller;
    await child.$controller.deactivate(child.$controller, root);
    blockActivation = true;

    const childDrain = child.$controller.activate(child.$controller, root, root.scope) as Promise<void>;
    const rootDrain = root.deactivate(root, null) as Promise<void>;
    assert.instanceOf(childDrain, Promise);
    assert.instanceOf(rootDrain, Promise);
    assert.notStrictEqual(rootDrain, childDrain);

    let rootSettled = false;
    void rootDrain.then(
      () => { rootSettled = true; },
      () => { rootSettled = true; },
    );
    attaching.resolve();
    await Promise.resolve();
    await Promise.resolve();

    assert.strictEqual(detachingCalls, 2, 'self-deactivation and cancellation each detach once');
    assert.strictEqual(rootSettled, false, 'ancestor teardown waits for child cancellation');

    detaching.resolve();
    await Promise.all([childDrain, rootDrain]);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(root.isActive, false);

    await fixture.tearDown();
  });

  it('serializes activation requested during teardown and coalesces the latest desired state', async function () {
    let gate = new Deferred();
    let child!: Child;

    @customElement({ name: 'opposite-transition-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): Promise<void> {
        return gate.promise;
      }
    }

    const fixture = createFixture(
      '<opposite-transition-child></opposite-transition-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const parent = fixture.au.root.controller;

    const firstDrain = child.$controller.deactivate(child.$controller, parent) as Promise<void>;
    const queuedActivation = child.$controller.activate(child.$controller, parent, parent.scope);
    assert.strictEqual(queuedActivation, firstDrain);
    assert.throws(() => child.$controller.dispose(), /AUR0510:.*lifecycle operation is running/i);

    gate.resolve();
    await firstDrain;
    assert.strictEqual(child.$controller.isActive, true);
    assert.strictEqual(fixture.appHost.textContent, 'child');

    gate = new Deferred();
    const secondDrain = child.$controller.deactivate(child.$controller, parent) as Promise<void>;
    assert.strictEqual(
      child.$controller.activate(child.$controller, parent, parent.scope),
      secondDrain,
    );
    assert.strictEqual(
      child.$controller.deactivate(child.$controller, parent),
      secondDrain,
    );
    gate.resolve();
    await secondDrain;
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(fixture.appHost.textContent, '');

    await fixture.tearDown();
  });

  it('reports a detaching hook that returns its own queued activation drain', async function () {
    let child!: Child;
    const parentRef = { value: null! as IHydratedController };
    let cycle = false;

    @customElement({ name: 'self-awaiting-deactivation-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): void | Promise<void> {
        const parent = parentRef.value;
        return cycle
          ? this.$controller.activate(this.$controller, parent, parent.scope) as Promise<void>
          : void 0;
      }
    }

    const fixture = createFixture(
      '<self-awaiting-deactivation-child></self-awaiting-deactivation-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const parent = parentRef.value = fixture.au.root.controller;
    cycle = true;

    assert.throws(
      () => child.$controller.deactivate(child.$controller, parent),
      /AUR0509:.*cannot await.*operation/i,
    );

    abandonTerminalFixture(fixture);
  });

  it('rejects a direct self-await cycle between child teardown and its ancestor drain', async function () {
    let child!: Child;
    const rootRef = { value: null! as ICustomElementController };
    let rootDrain!: Promise<void>;

    @customElement({ name: 'cyclic-self-deactivation-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): Promise<void> {
        const root = rootRef.value;
        return rootDrain = root.deactivate(root, null) as Promise<void>;
      }
    }

    const fixture = createFixture(
      '<cyclic-self-deactivation-child></cyclic-self-deactivation-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const root = rootRef.value = fixture.au.root.controller;
    const childDrain = child.$controller.deactivate(child.$controller, root) as Promise<void>;
    assert.instanceOf(childDrain, Promise);
    assert.instanceOf(rootDrain, Promise);

    await Promise.all([
      assert.rejects(() => childDrain, /AUR0509:.*cannot await an ancestor drain/i),
      assert.rejects(() => rootDrain, /AUR0509:.*cannot await an ancestor drain/i),
    ]);
    assert.strictEqual(root.isActive, false);
    await fixture.tearDown();
  });

  it('preflights descendant operations before disposing a controller subtree', async function () {
    const gate = new Deferred();
    let child!: Child;

    @customElement({ name: 'live-disposal-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): Promise<void> {
        return gate.promise;
      }
    }

    const fixture = createFixture(
      '<live-disposal-child></live-disposal-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const root = fixture.au.root.controller;
    const drain = child.$controller.deactivate(child.$controller, root) as Promise<void>;

    assert.throws(() => root.dispose(), /AUR0510:.*lifecycle operation is running/i);
    assert.strictEqual(root.isActive, true);
    assert.notStrictEqual(root.viewModel, null);
    assert.notStrictEqual(child.$controller.viewModel, null);

    gate.resolve();
    await drain;
    await fixture.tearDown();
  });

  it('does not cache a released synthetic view that has a queued activation', async function () {
    const gate = new Deferred();

    @customElement({ name: 'released-successor-child', template: 'child' })
    class Child {
      public detaching(): Promise<void> {
        return gate.promise;
      }
    }

    const fixture = createFixture(
      '<released-successor-child repeat.for="item of items"></released-successor-child>',
      class { public items = [0]; },
      [Child],
    );
    await fixture.started;
    const repeat = findRepeat(fixture.au.root.controller);
    const internals = repeat as unknown as {
      _factory: {
        setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
        create(parent?: unknown): { dispose(): void };
      };
    };
    internals._factory.setCacheSize('*', false);
    const view = repeat.views[0];
    view.release();
    const drain = view.deactivate(view, repeat.$controller) as Promise<void>;
    assert.strictEqual(
      view.activate(view, repeat.$controller, repeat.$controller.scope),
      drain,
    );

    gate.resolve();
    await drain;
    assert.strictEqual(view.isActive, true);
    const cached = internals._factory.create(repeat.$controller);
    assert.notStrictEqual(cached, view, 'an active successor must not remain obtainable from the view cache');
    cached.dispose();

    await fixture.tearDown();
  });

  it('reports disposal failure requested while asynchronous view teardown is pending', async function () {
    const gate = new Deferred();
    const error = new Error('deferred view disposal failed');

    @customElement({ name: 'deferred-disposal-child', template: 'child' })
    class Child {
      public detaching(): Promise<void> {
        return gate.promise;
      }

      public dispose(): void {
        throw error;
      }
    }

    const fixture = createFixture(
      '<deferred-disposal-child repeat.for="item of items"></deferred-disposal-child>',
      class { public items = [0]; },
      [Child],
    );
    await fixture.started;
    const repeat = findRepeat(fixture.au.root.controller);
    const view = repeat.views[0];
    const drain = view.deactivate(view, repeat.$controller) as Promise<void>;

    // Dynamic owners cannot synchronously dispose a view whose controller still
    // owns teardown. They transfer disposal to that local operation boundary.
    (view as unknown as { _disposeAfterDeactivate(): void })._disposeAfterDeactivate();
    gate.resolve();

    await assert.rejects(() => drain, error);
    assert.strictEqual(view.isActive, false);
    await fixture.tearDown();
  });

  it('treats repeated ancestor-owned descendant deactivation as the same teardown', async function () {
    const gate = new Deferred();
    let child!: Child;
    let childDetachingCalls = 0;

    @customElement({ name: 'repeated-descendant-deactivation-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): Promise<void> {
        ++childDetachingCalls;
        return gate.promise;
      }
    }

    @customElement({
      name: 'repeated-descendant-deactivation-owner',
      template: '<repeated-descendant-deactivation-child></repeated-descendant-deactivation-child>',
      dependencies: [Child],
    })
    class Owner {
      public readonly $controller!: ICustomElementController<this>;

      public detaching(initiator: IHydratedController): void {
        // A deeply integrated owner may already have asked an owned child to
        // stop before its own hook runs. The repeated request must not restart it.
        void child.$controller.deactivate(initiator, this.$controller);
      }
    }

    const fixture = createFixture(
      '<repeated-descendant-deactivation-owner></repeated-descendant-deactivation-owner>',
      class {},
      [Owner],
    );
    await fixture.started;
    const stop = fixture.stop() as Promise<void>;
    assert.strictEqual(childDetachingCalls, 1);

    gate.resolve();
    await stop;
    assert.strictEqual(childDetachingCalls, 1);
    await fixture.tearDown();
  });

  it('makes reentrant deactivation from activation cancellation a no-op', async function () {
    const attaching = new Deferred();
    let child!: Child;
    let blockActivation = false;
    let reenter = false;
    const parentRef = { value: null! as IHydratedController };

    @customElement({ name: 'cancellation-reentrant-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): void | Promise<void> {
        return blockActivation ? attaching.promise : void 0;
      }

      public detaching(): void {
        if (reenter) {
          void this.$controller.deactivate(this.$controller, parentRef.value);
        }
      }
    }

    const fixture = createFixture(
      '<cancellation-reentrant-child></cancellation-reentrant-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const parent = parentRef.value = fixture.au.root.controller;
    await child.$controller.deactivate(child.$controller, parent);

    blockActivation = true;
    reenter = true;
    const activation = child.$controller.activate(child.$controller, parent, parent.scope) as Promise<void>;
    const cancellation = child.$controller.deactivate(child.$controller, parent);
    assert.strictEqual(cancellation, activation);

    attaching.resolve();
    await activation;
    assert.strictEqual(child.$controller.isActive, false);
    await fixture.tearDown();
  });

  it('settles a predecessor drain after asynchronous queued reactivation', async function () {
    const detaching = new Deferred();
    const attaching = new Deferred();
    let child!: Child;
    let asyncActivation = false;

    @customElement({ name: 'async-failed-reactivation-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): void | Promise<void> {
        return asyncActivation ? attaching.promise : void 0;
      }

      public detaching(): Promise<void> {
        return detaching.promise;
      }
    }

    const fixture = createFixture(
      '<async-failed-reactivation-child></async-failed-reactivation-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const parent = fixture.au.root.controller;
    asyncActivation = true;
    const successfulDrain = child.$controller.deactivate(child.$controller, parent) as Promise<void>;
    assert.strictEqual(child.$controller.activate(child.$controller, parent, parent.scope), successfulDrain);

    detaching.resolve();
    await Promise.resolve();
    attaching.resolve();
    await successfulDrain;
    assert.strictEqual(child.$controller.isActive, true);
    await fixture.tearDown();
  });

  for (const settlement of ['resolve', 'reject'] as const) {
    it(`ignores a late ${settlement} from an operation ended by a synchronous sibling error`, async function () {
      const gate = new Deferred();
      const error = new Error('later sibling detaching failed');

      @customElement({ name: `late-${settlement}-detaching-child`, template: 'async' })
      class AsyncChild {
        public detaching(): Promise<void> {
          return gate.promise;
        }
      }

      @customElement({ name: `throwing-${settlement}-detaching-child`, template: 'sync' })
      class ThrowingChild {
        public detaching(): void {
          throw error;
        }
      }

      const fixture = createFixture(
        `<late-${settlement}-detaching-child></late-${settlement}-detaching-child>`
        + `<throwing-${settlement}-detaching-child></throwing-${settlement}-detaching-child>`,
        class {},
        [AsyncChild, ThrowingChild],
      );
      await fixture.started;
      const root = fixture.au.root.controller;
      const internals = root as unknown as { readonly _operation: unknown; readonly _detachingStack: number };

      assert.throws(() => root.deactivate(root, null), error);
      assert.strictEqual(internals._operation, null);
      assert.strictEqual(internals._detachingStack, 0);

      if (settlement === 'resolve') {
        gate.resolve();
      } else {
        gate.reject(new Error('late detaching rejection'));
      }
      await Promise.resolve();
      await Promise.resolve();

      assert.strictEqual(internals._operation, null);
      assert.strictEqual(internals._detachingStack, 0);
      abandonTerminalFixture(fixture);
    });
  }

  it('reports a synchronous detaching error inline', async function () {
    const error = new Error('synchronous detaching failed');
    let child!: Child;

    @customElement({ name: 'throwing-detaching-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): void {
        throw error;
      }
    }

    const fixture = createFixture(
      '<throwing-detaching-child></throwing-detaching-child>',
      class {},
      [Child],
    );
    await fixture.started;

    assert.throws(
      () => child.$controller.deactivate(child.$controller, fixture.au.root.controller),
      error,
    );
    abandonTerminalFixture(fixture);
  });

  it('reports a synchronous unbinding hook error without admitting later teardown hooks', async function () {
    const error = new Error('child unbinding failed');
    let laterUnbindingCalls = 0;

    @customElement({ name: 'throwing-unbinding-child', template: 'first' })
    class ThrowingChild {
      public unbinding(): void {
        throw error;
      }
    }

    @customElement({ name: 'later-unbinding-child', template: 'second' })
    class LaterChild {
      public unbinding(): void {
        ++laterUnbindingCalls;
      }
    }

    class App {
      public detaching(): Promise<void> {
        return Promise.resolve();
      }
    }

    const fixture = createFixture(
      '<throwing-unbinding-child></throwing-unbinding-child>'
      + '<later-unbinding-child></later-unbinding-child>',
      App,
      [ThrowingChild, LaterChild],
    );
    await fixture.started;
    const root = fixture.au.root.controller;

    await assert.rejects(() => root.deactivate(root, null) as Promise<void>, error);
    assert.strictEqual(laterUnbindingCalls, 0);
    abandonTerminalFixture(fixture);
  });

  it('reports a descendant binding error at its unbind boundary', async function () {
    const error = new Error('descendant binding unbind failed');

    @customElement({ name: 'throwing-binding-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public binding(): void {
        const binding: IBinding = {
          isBound: true,
          bind() {/* noop */},
          unbind() { throw error; },
          get() { return void 0; },
        };
        this.$controller.addBinding(binding);
      }

      public detaching(): Promise<void> {
        return Promise.resolve();
      }
    }

    const fixture = createFixture(
      '<throwing-binding-child></throwing-binding-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const root = fixture.au.root.controller;

    await assert.rejects(() => root.deactivate(root, null) as Promise<void>, error);
    abandonTerminalFixture(fixture);
  });

  it('reports an initiator binding error at its unbind boundary', async function () {
    const error = new Error('initiator binding unbind failed');

    class App {
      public readonly $controller!: ICustomElementController<this>;

      public binding(): void {
        const binding: IBinding = {
          isBound: true,
          bind() {/* noop */},
          unbind() { throw error; },
          get() { return void 0; },
        };
        this.$controller.addBinding(binding);
      }

      public detaching(): Promise<void> {
        return Promise.resolve();
      }
    }

    const fixture = createFixture('app', App);
    await fixture.started;
    const root = fixture.au.root.controller;

    await assert.rejects(() => root.deactivate(root, null) as Promise<void>, error);
    abandonTerminalFixture(fixture);
  });

  it('reports a synchronous queued activation error through the predecessor drain', async function () {
    const detaching = new Deferred();
    const error = new Error('queued synchronous activation failed');
    let child!: Child;
    let failActivation = false;

    @customElement({ name: 'sync-failed-reactivation-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public binding(): void {
        if (failActivation) {
          throw error;
        }
      }

      public detaching(): Promise<void> {
        return detaching.promise;
      }
    }

    const fixture = createFixture(
      '<sync-failed-reactivation-child></sync-failed-reactivation-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const parent = fixture.au.root.controller;
    const drain = child.$controller.deactivate(child.$controller, parent) as Promise<void>;
    failActivation = true;
    assert.strictEqual(child.$controller.activate(child.$controller, parent, parent.scope), drain);

    detaching.resolve();
    await assert.rejects(() => drain, error);
    abandonTerminalFixture(fixture);
  });

  it('reports an asynchronous queued activation error through the predecessor drain', async function () {
    const detaching = new Deferred();
    const attaching = new Deferred();
    const error = new Error('queued asynchronous activation failed');
    let child!: Child;
    let failActivation = false;

    @customElement({ name: 'async-failed-reactivation-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): void | Promise<void> {
        return failActivation ? attaching.promise : void 0;
      }

      public detaching(): Promise<void> {
        return detaching.promise;
      }
    }

    const fixture = createFixture(
      '<async-failed-reactivation-child></async-failed-reactivation-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const parent = fixture.au.root.controller;
    const drain = child.$controller.deactivate(child.$controller, parent) as Promise<void>;
    failActivation = true;
    assert.strictEqual(child.$controller.activate(child.$controller, parent, parent.scope), drain);

    detaching.resolve();
    await Promise.resolve();
    attaching.reject(error);
    await assert.rejects(() => drain, error);
    abandonTerminalFixture(fixture);
  });
});
