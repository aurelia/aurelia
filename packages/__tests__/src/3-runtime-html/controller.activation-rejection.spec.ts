import {
  customElement,
  CustomElement,
  type ICustomElementController,
  type IHydratedController,
  lifecycleHooks,
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

describe('3-runtime-html/controller.activation-rejection.spec.ts', function () {
  it('rejects an activation hook that returns its own queued deactivation drain', async function () {
    let child!: Child;
    const parentRef = { value: null! as IHydratedController };
    let cycle = false;

    @customElement({ name: 'self-awaiting-activation-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): void | Promise<void> {
        const parent = parentRef.value;
        return cycle
          ? this.$controller.deactivate(this.$controller, parent) as Promise<void>
          : void 0;
      }
    }

    const fixture = createFixture(
      '<self-awaiting-activation-child></self-awaiting-activation-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const parent = parentRef.value = fixture.au.root.controller;
    void child.$controller.deactivate(child.$controller, parent);
    cycle = true;

    const activation = child.$controller.activate(child.$controller, parent, parent.scope);
    assert.instanceOf(activation, Promise);
    await assert.rejects(() => activation as Promise<void>, /AUR0509:.*cannot await.*operation/i);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);

    await fixture.tearDown();
  });

  it('joins a child activated independently during ancestor binding', async function () {
    const gate = new Deferred();
    const calls: string[] = [];
    let child!: Child;

    @customElement({ name: 'independently-activated-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): Promise<void> {
        calls.push('child:attaching');
        return gate.promise;
      }

      public attached(): void {
        calls.push('child:attached');
      }
    }

    class App {
      public readonly $controller!: ICustomElementController<this>;

      public binding(): void {
        // Emulate a dynamic owner that starts a child with its own operation
        // before normal ancestor traversal reaches that controller.
        void child.$controller.activate(child.$controller, this.$controller, this.$controller.scope);
      }

      public attached(): void {
        calls.push('app:attached');
      }
    }

    const fixture = createFixture(
      '<independently-activated-child></independently-activated-child>',
      App,
      [Child],
      false,
    );
    const start = fixture.start();
    assert.instanceOf(start, Promise);
    await Promise.resolve();
    assert.deepStrictEqual(calls, ['child:attaching']);
    assert.strictEqual(fixture.au.isRunning, false, 'the ancestor remains owned by the child drain');

    gate.resolve();
    await start;
    assert.deepStrictEqual(calls, ['child:attaching', 'child:attached', 'app:attached']);
    await fixture.tearDown();
  });

  it('rejects an independently activated child that awaits its joined ancestor drain', async function () {
    const gate = new Deferred();
    let child!: Child;
    let ancestorController!: IHydratedController;

    @customElement({ name: 'joined-activation-cycle-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): Promise<void> {
        return gate.promise;
      }

      public attached(): Promise<void> {
        return ancestorController.activate(ancestorController, null, void 0) as Promise<void>;
      }
    }

    class App {
      public readonly $controller!: ICustomElementController<this>;

      public binding(): void {
        ancestorController = this.$controller;
        void (child.$controller.activate(
          child.$controller,
          this.$controller,
          this.$controller.scope,
        ) as Promise<void>).catch(() => {/* the ancestor drain owns this error */});
      }
    }

    const fixture = createFixture(
      '<joined-activation-cycle-child></joined-activation-cycle-child>',
      App,
      [Child],
      false,
    );
    const ancestorDrain = fixture.start() as Promise<void>;
    gate.resolve();

    await assert.rejects(() => ancestorDrain, /AUR0509:.*cannot await.*operation/i);
    assert.strictEqual(fixture.au.isRunning, false);
    assert.strictEqual(fixture.torn, true);
  });

  it('rejects a nested independent activation that awaits a transitive ancestor drain', async function () {
    const gate = new Deferred();
    let child!: Child;
    let parent!: Parent;
    let rootController!: IHydratedController;

    @customElement({ name: 'transitively-joined-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): Promise<void> {
        return gate.promise;
      }

      public attached(): Promise<void> {
        return rootController.activate(rootController, null, void 0) as Promise<void>;
      }
    }

    @customElement({ name: 'transitively-joined-parent', template: '<transitively-joined-child></transitively-joined-child>' })
    class Parent {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        parent = this;
      }

      public binding(): void {
        // Start a second independent operation. Normal parent traversal joins it
        // before normal root traversal joins this parent operation in turn.
        void (child.$controller.activate(
          child.$controller,
          this.$controller,
          this.$controller.scope,
        ) as Promise<void>).catch(() => {/* the ancestor drain owns this error */});
      }
    }

    class App {
      public readonly $controller!: ICustomElementController<this>;

      public binding(): void {
        rootController = this.$controller;
        void (parent.$controller.activate(
          parent.$controller,
          this.$controller,
          this.$controller.scope,
        ) as Promise<void>).catch(() => {/* the root drain owns this error */});
      }
    }

    const fixture = createFixture(
      '<transitively-joined-parent></transitively-joined-parent>',
      App,
      [Parent, Child],
      false,
    );
    const rootDrain = fixture.start() as Promise<void>;
    gate.resolve();

    await assert.rejects(() => rootDrain, /AUR0509:.*cannot await.*operation/i);
    assert.strictEqual(fixture.au.isRunning, false);
    assert.strictEqual(fixture.torn, true);
  });

  it('rejects a lifecycle-hook provider that returns its controller operation from a multi-provider phase', async function () {
    let laterHookCalls = 0;

    @lifecycleHooks()
    class SelfAwaitingHook {
      public attaching(vm: unknown, initiator: IHydratedController, parent: IHydratedController | null): Promise<void> {
        const controller = (vm as { readonly $controller: IHydratedController }).$controller;
        return controller.activate(initiator, parent, controller.scope) as Promise<void>;
      }
    }

    @lifecycleHooks()
    class LaterHook {
      public attaching(): void {
        ++laterHookCalls;
      }
    }

    const Child = CustomElement.define({
      name: 'provider-self-await-child',
      template: 'child',
      dependencies: [SelfAwaitingHook, LaterHook],
    }, class Child {
      public readonly $controller!: ICustomElementController<this>;

      public binding(): Promise<void> {
        // Promote the operation before the attaching providers run, making the
        // exact controller result available to the first provider.
        return Promise.resolve();
      }
    });

    const fixture = createFixture(
      '<provider-self-await-child></provider-self-await-child>',
      class {},
      [Child],
      false,
    );

    await assert.rejects(
      () => fixture.start() as Promise<void>,
      /AUR0509:.*cannot await.*operation/i,
    );
    assert.strictEqual(laterHookCalls, 0);
    assert.strictEqual(fixture.torn, true);
  });

  it('rejects a view-model hook that returns its controller operation from a multi-provider phase', async function () {
    @lifecycleHooks()
    class EarlierHook {
      public attaching(): void {/* noop */}
    }

    const Child = CustomElement.define({
      name: 'view-model-self-await-child',
      template: 'child',
      dependencies: [EarlierHook],
    }, class {
      public readonly $controller!: ICustomElementController<this>;

      public binding(): Promise<void> {
        return Promise.resolve();
      }

      public attaching(initiator: IHydratedController, parent: IHydratedController | null): Promise<void> {
        return this.$controller.activate(initiator, parent, this.$controller.scope) as Promise<void>;
      }
    });

    const fixture = createFixture(
      '<view-model-self-await-child></view-model-self-await-child>',
      class {},
      [Child],
      false,
    );

    await assert.rejects(
      () => fixture.start() as Promise<void>,
      /AUR0509:.*cannot await.*operation/i,
    );
    assert.strictEqual(fixture.torn, true);
  });

  it('reports a synchronous view-model failure from a multi-provider phase without manufacturing async work', async function () {
    const error = new Error('view-model attaching failed');

    @lifecycleHooks()
    class EarlierHook {
      public attaching(): void {/* noop */}
    }

    const Child = CustomElement.define({
      name: 'view-model-provider-throw-child',
      template: 'child',
      dependencies: [EarlierHook],
    }, class {
      public attaching(): void {
        throw error;
      }
    });

    const fixture = createFixture(
      '<view-model-provider-throw-child></view-model-provider-throw-child>',
      class {},
      [Child],
      false,
    );

    assert.throws(() => fixture.start(), error);
    assert.strictEqual(fixture.au.isRunning, false);
    assert.strictEqual(fixture.torn, true);
  });

  it('allows a parent hook to return a descendant result from the same operation', async function () {
    const gate = new Deferred();
    let child!: Child;

    @lifecycleHooks()
    class EarlierHook {
      public attaching(): void {/* noop */}
    }

    @customElement({ name: 'descendant-result-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): Promise<void> {
        return gate.promise;
      }
    }

    const Owner = CustomElement.define({
      name: 'descendant-result-owner',
      template: '<descendant-result-child></descendant-result-child>',
      dependencies: [EarlierHook, Child],
    }, class {
      public readonly $controller!: ICustomElementController<this>;

      public attaching(initiator: IHydratedController): Promise<void> {
        // Dynamic owners commonly start an owned view from their own hook. The
        // descendant result is safe: it settles before this owner participant.
        return child.$controller.activate(initiator, this.$controller, this.$controller.scope) as Promise<void>;
      }
    });

    const fixture = createFixture(
      '<descendant-result-owner></descendant-result-owner>',
      class {},
      [Owner],
      false,
    );
    const start = fixture.start() as Promise<void>;
    let settled = false;
    void start.then(
      () => { settled = true; },
      () => { settled = true; },
    );
    await Promise.resolve();
    assert.strictEqual(settled, false);

    gate.resolve();
    await start;
    fixture.assertText('child');
    await fixture.tearDown();
  });
});
