import {
  customElement,
  CustomElement,
  type IController,
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
  it('waits for sibling activation, rolls back, and retains participant error order', async function () {
    const first = new Deferred();
    const second = new Deferred();
    const firstError = new Error('first attaching failed');
    const secondError = new Error('second attaching failed');
    const detached: number[] = [];
    const unbound: number[] = [];
    let fail = true;

    @customElement({ name: 'activation-rejection-child', template: '${id}', bindables: ['id'] })
    class Child {
      public id!: number;

      public attaching(): void | Promise<void> {
        if (!fail) {
          return;
        }
        return this.id === 0 ? first.promise : second.promise;
      }

      public detaching(): void {
        detached.push(this.id);
      }

      public unbinding(): void {
        unbound.push(this.id);
      }
    }

    const fixture = createFixture(
      '<activation-rejection-child id.bind="0"></activation-rejection-child>' +
      '<activation-rejection-child id.bind="1"></activation-rejection-child>',
      class {},
      [Child],
      false,
    );
    const start = fixture.start();
    assert.instanceOf(start, Promise);
    let settled = false;
    void (start as Promise<void>).then(
      () => { settled = true; },
      () => { settled = true; },
    );

    second.reject(secondError);
    await Promise.resolve();
    await Promise.resolve();
    assert.strictEqual(settled, false);
    assert.deepStrictEqual(detached, []);
    assert.deepStrictEqual(unbound, []);

    first.reject(firstError);
    await assert.rejects(() => start as Promise<void>, firstError);
    assert.deepStrictEqual(detached, [0, 1]);
    assert.deepStrictEqual(unbound, [0, 1]);
    assert.strictEqual(fixture.appHost.textContent, '');
    assert.strictEqual(fixture.au.isStarting, false);
    assert.strictEqual(fixture.au.isRunning, false);

    fail = false;
    await fixture.start();
    fixture.assertText('01');
    await fixture.tearDown();
  });

  it('rolls back a synchronous attaching throw before rethrowing synchronously', async function () {
    const error = new Error('synchronous attaching failed');
    let fail = false;
    let child!: Child;
    let detachingCalls = 0;
    let unbindingCalls = 0;

    @customElement({ name: 'sync-activation-rejection-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): void {
        if (fail) {
          throw error;
        }
      }

      public detaching(): void {
        ++detachingCalls;
      }

      public unbinding(): void {
        ++unbindingCalls;
      }
    }

    const fixture = createFixture(
      '<sync-activation-rejection-child></sync-activation-rejection-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const parent = fixture.au.root.controller;
    void child.$controller.deactivate(child.$controller, parent);
    detachingCalls = 0;
    unbindingCalls = 0;
    fail = true;

    assert.throws(
      () => child.$controller.activate(child.$controller, parent, parent.scope),
      error,
    );
    assert.strictEqual(detachingCalls, 1);
    assert.strictEqual(unbindingCalls, 1);
    assert.strictEqual(fixture.appHost.textContent, '');

    fail = false;
    await child.$controller.activate(child.$controller, parent, parent.scope);
    fixture.assertText('child');
    await fixture.tearDown();
  });

  it('returns the rollback drain when a synchronous attaching throw needs asynchronous compensation', async function () {
    const error = new Error('synchronous attaching failed before async rollback');
    const rollback = new Deferred();
    let child!: Child;
    let fail = false;

    @customElement({ name: 'async-rollback-attaching-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): void {
        if (fail) {
          throw error;
        }
      }

      public detaching(): void | Promise<void> {
        return fail ? rollback.promise : void 0;
      }
    }

    const fixture = createFixture(
      '<async-rollback-attaching-child></async-rollback-attaching-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const parent = fixture.au.root.controller;
    void child.$controller.deactivate(child.$controller, parent);
    fail = true;

    const activation = child.$controller.activate(child.$controller, parent, parent.scope);
    assert.instanceOf(activation, Promise);
    let settled = false;
    void (activation as Promise<void>).then(
      () => { settled = true; },
      () => { settled = true; },
    );
    await Promise.resolve();
    assert.strictEqual(settled, false);

    rollback.resolve();
    await assert.rejects(() => activation as Promise<void>, error);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(fixture.appHost.textContent, '');

    fail = false;
    await child.$controller.activate(child.$controller, parent, parent.scope);
    fixture.assertText('child');
    await fixture.tearDown();
  });

  it('returns the rollback drain when mounting throws before asynchronous compensation', async function () {
    const error = new Error('mount failed before async rollback');
    const rollback = new Deferred();
    let child!: Child;
    let blockRollback = false;

    @customElement({ name: 'async-rollback-mount-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): void | Promise<void> {
        return blockRollback ? rollback.promise : void 0;
      }
    }

    const fixture = createFixture(
      '<async-rollback-mount-child></async-rollback-mount-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const parent = fixture.au.root.controller;
    void child.$controller.deactivate(child.$controller, parent);
    const nodes = child.$controller.nodes!;
    const appendTo = nodes.appendTo;
    (nodes as unknown as { appendTo(): void }).appendTo = () => { throw error; };
    blockRollback = true;

    const activation = child.$controller.activate(child.$controller, parent, parent.scope);
    assert.instanceOf(activation, Promise);
    let settled = false;
    void (activation as Promise<void>).then(
      () => { settled = true; },
      () => { settled = true; },
    );
    await Promise.resolve();
    assert.strictEqual(settled, false);

    rollback.resolve();
    await assert.rejects(() => activation as Promise<void>, error);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);

    (nodes as unknown as { appendTo: typeof appendTo }).appendTo = appendTo;
    blockRollback = false;
    await child.$controller.activate(child.$controller, parent, parent.scope);
    fixture.assertText('child');
    await fixture.tearDown();
  });

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

    cycle = false;
    await child.$controller.activate(child.$controller, parent, parent.scope);
    fixture.assertText('child');
    await fixture.tearDown();
  });

  it('preserves an undefined async activation rejection after rollback', async function () {
    let fail = true;

    @customElement({ name: 'undefined-activation-rejection-child', template: 'child' })
    class Child {
      public attaching(): void | Promise<void> {
        return fail ? Promise.reject() : void 0;
      }
    }

    const fixture = createFixture(
      '<undefined-activation-rejection-child></undefined-activation-rejection-child>',
      class {},
      [Child],
      false,
    );
    let rejected = false;
    try {
      await fixture.start();
    } catch (error) {
      rejected = true;
      assert.strictEqual(error, void 0);
    }
    assert.strictEqual(rejected, true);
    assert.strictEqual(fixture.appHost.textContent, '');

    fail = false;
    await fixture.start();
    fixture.assertText('child');
    await fixture.tearDown();
  });

  it('rejects a descendant result locally while the initiator waits for sibling quiescence and rollback', async function () {
    const first = new Deferred();
    const second = new Deferred();
    const error = new Error('descendant attaching failed');
    const children: Child[] = [];

    @customElement({ name: 'local-activation-result-child', template: '${id}', bindables: ['id'] })
    class Child {
      public readonly $controller!: ICustomElementController<this>;
      public id!: number;

      public constructor() {
        children.push(this);
      }

      public attaching(): Promise<void> {
        return this.id === 0 ? first.promise : second.promise;
      }
    }

    const fixture = createFixture(
      '<local-activation-result-child id.bind="0"></local-activation-result-child>'
      + '<local-activation-result-child id.bind="1"></local-activation-result-child>',
      class {},
      [Child],
      false,
    );
    const start = fixture.start() as Promise<void>;
    assert.strictEqual(children.length, 2);
    const local = (children[0].$controller as unknown as {
      _operation: { result: { promise: Promise<void> } };
    })._operation.result.promise;

    let rootSettled = false;
    void start.then(
      () => { rootSettled = true; },
      () => { rootSettled = true; },
    );
    first.reject(error);
    await assert.rejects(() => local, error);
    assert.strictEqual(rootSettled, false);

    second.resolve();
    await assert.rejects(() => start, error);
    assert.strictEqual(fixture.appHost.textContent, '');
    await fixture.tearDown();
  });

  it('does not import a sibling cleanup failure into a superseded descendant result', async function () {
    const first = new Deferred();
    const second = new Deferred();
    const activationError = new Error('superseded child activation failed');
    const cleanupError = new Error('sibling rollback cleanup failed');
    const children: Child[] = [];

    @customElement({ name: 'local-suppressed-result-child', template: '${id}', bindables: ['id'] })
    class Child {
      public readonly $controller!: ICustomElementController<this>;
      public id!: number;

      public constructor() {
        children.push(this);
      }

      public attaching(): Promise<void> {
        return this.id === 0 ? first.promise : second.promise;
      }

      public unbinding(): void {
        if (this.id === 1) {
          throw cleanupError;
        }
      }
    }

    const fixture = createFixture(
      '<local-suppressed-result-child id.bind="0"></local-suppressed-result-child>'
      + '<local-suppressed-result-child id.bind="1"></local-suppressed-result-child>',
      class {},
      [Child],
      false,
    );
    const start = fixture.start() as Promise<void>;
    const root = fixture.au.root.controller;
    const firstLocal = (children[0].$controller as unknown as {
      _operation: { result: { promise: Promise<void> } };
    })._operation.result.promise;
    const rootDrain = root.deactivate(root, null) as Promise<void>;

    first.reject(activationError);
    await firstLocal;
    second.resolve();

    await assert.rejects(() => rootDrain, cleanupError);
    await assert.rejects(() => start, cleanupError);
    assert.strictEqual(children[0].$controller.isActive, false);
    assert.strictEqual(children[1].$controller.isActive, false);
    assert.strictEqual(root.isActive, false);

    await fixture.tearDown();
  });

  it('quiesces accepted providers but does not invoke later activation participants after a synchronous throw', async function () {
    const gate = new Deferred();
    const error = new Error('second provider failed synchronously');
    let vmAttachingCalls = 0;

    @lifecycleHooks()
    class FirstHook {
      public attaching(_vm: unknown, _initiator: IController): Promise<void> {
        return gate.promise;
      }
    }

    @lifecycleHooks()
    class SecondHook {
      public attaching(): void {
        throw error;
      }
    }

    const Child = CustomElement.define({
      name: 'provider-stop-activation-child',
      template: 'child',
      dependencies: [FirstHook, SecondHook],
    }, class {
      public attaching(): void {
        ++vmAttachingCalls;
      }
    });

    const fixture = createFixture(
      '<provider-stop-activation-child></provider-stop-activation-child>',
      class {},
      [Child],
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
    assert.strictEqual(vmAttachingCalls, 0);

    gate.resolve();
    await assert.rejects(() => start, error);
    assert.strictEqual(vmAttachingCalls, 0);
    assert.strictEqual(fixture.appHost.textContent, '');
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
        void child.$controller.activate(child.$controller, this.$controller, this.$controller.scope);
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
    assert.strictEqual(fixture.appHost.textContent, '');
    await fixture.tearDown();
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
        void child.$controller.activate(child.$controller, this.$controller, this.$controller.scope);
      }
    }

    class App {
      public readonly $controller!: ICustomElementController<this>;

      public binding(): void {
        rootController = this.$controller;
        void parent.$controller.activate(parent.$controller, this.$controller, this.$controller.scope);
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
    assert.strictEqual(fixture.appHost.textContent, '');
    await fixture.tearDown();
  });
});
