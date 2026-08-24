import {
  customElement,
  CustomElement,
  type IController,
  type ICustomElementController,
  type IHydratedController,
  lifecycleHooks,
  Repeat,
} from '@aurelia/runtime-html';
import type { IResolver } from '@aurelia/kernel';
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
  it('completes teardown before rejecting an async detaching error', async function () {
    const error = new Error('detaching failed');
    let child!: Child;
    let unbindingCalls = 0;
    let fail = true;

    @customElement({ name: 'rejected-detaching-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): void | Promise<void> {
        return fail ? Promise.reject(error) : void 0;
      }

      public unbinding(): void {
        ++unbindingCalls;
      }
    }

    const fixture = createFixture(
      '<rejected-detaching-child></rejected-detaching-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const host = fixture.appHost.querySelector('rejected-detaching-child')!;
    const result = child.$controller.deactivate(child.$controller, fixture.au.root.controller);

    assert.instanceOf(result, Promise);
    assert.strictEqual(
      child.$controller.deactivate(child.$controller, fixture.au.root.controller),
      result,
    );
    await assert.rejects(() => result as Promise<void>, error);
    assert.strictEqual(unbindingCalls, 1);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(host.textContent, '');

    fail = false;
    await child.$controller.activate(
      child.$controller,
      fixture.au.root.controller,
      fixture.au.root.controller.scope,
    );
    assert.strictEqual(child.$controller.isActive, true);
    assert.strictEqual(child.$controller.isBound, true);
    assert.strictEqual(host.textContent, 'child');

    await fixture.tearDown();
  });

  it('completes teardown before rejecting an async unbinding error', async function () {
    const error = new Error('unbinding failed');
    let child!: Child;
    let detachingCalls = 0;

    @customElement({ name: 'rejected-unbinding-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): void {
        ++detachingCalls;
      }

      public unbinding(): Promise<void> {
        return Promise.reject(error);
      }
    }

    const fixture = createFixture(
      '<rejected-unbinding-child></rejected-unbinding-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const host = fixture.appHost.querySelector('rejected-unbinding-child')!;
    const result = child.$controller.deactivate(child.$controller, fixture.au.root.controller);

    assert.instanceOf(result, Promise);
    await assert.rejects(() => result as Promise<void>, error);
    assert.strictEqual(detachingCalls, 1);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(host.textContent, '');

    await fixture.tearDown();
  });

  it('throws a synchronous hook error only after synchronous teardown completes', async function () {
    const error = new Error('synchronous detaching failed');
    let child!: Child;
    let unbindingCalls = 0;

    @customElement({ name: 'throwing-detaching-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): void {
        throw error;
      }

      public unbinding(): void {
        ++unbindingCalls;
      }
    }

    const fixture = createFixture(
      '<throwing-detaching-child></throwing-detaching-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const host = fixture.appHost.querySelector('throwing-detaching-child')!;

    assert.throws(
      () => child.$controller.deactivate(child.$controller, fixture.au.root.controller),
      error,
    );
    assert.strictEqual(unbindingCalls, 1);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(host.textContent, '');

    await fixture.tearDown();
  });

  it('waits for sibling teardown and rejects with the first participant error', async function () {
    const first = new Deferred();
    const second = new Deferred();
    const firstError = new Error('first child failed');
    const secondError = new Error('second child failed');
    const children: Child[] = [];
    const unbound: number[] = [];

    @customElement({ name: 'ordered-rejection-child', template: '${id}', bindables: ['id'] })
    class Child {
      public readonly $controller!: ICustomElementController<this>;
      public id!: number;

      public constructor() {
        children.push(this);
      }

      public detaching(): Promise<void> {
        return this.id === 0 ? first.promise : second.promise;
      }

      public unbinding(): void {
        unbound.push(this.id);
      }
    }

    const fixture = createFixture(
      '<ordered-rejection-child id.bind="0"></ordered-rejection-child>' +
      '<ordered-rejection-child id.bind="1"></ordered-rejection-child>',
      class {},
      [Child],
    );
    await fixture.started;

    const result = fixture.au.root.controller.deactivate(fixture.au.root.controller, null);
    assert.instanceOf(result, Promise);
    let settled = false;
    void (result as Promise<void>).then(
      () => { settled = true; },
      () => { settled = true; },
    );

    second.reject(secondError);
    await Promise.resolve();
    await Promise.resolve();
    assert.strictEqual(settled, false);
    assert.deepStrictEqual(unbound, []);

    first.reject(firstError);
    await assert.rejects(() => result as Promise<void>, firstError);
    assert.deepStrictEqual(unbound, [0, 1]);
    assert.strictEqual(children.every(child => !child.$controller.isActive && !child.$controller.isBound), true);
    assert.strictEqual(fixture.appHost.textContent, '');

    await fixture.tearDown();
  });

  it('waits for sibling unbinding and preserves an undefined first error', async function () {
    const first = new Deferred();
    const second = new Deferred();
    const children: Child[] = [];

    @customElement({ name: 'ordered-unbinding-child', template: 'child', bindables: ['id'] })
    class Child {
      public readonly $controller!: ICustomElementController<this>;
      public id!: number;

      public constructor() {
        children.push(this);
      }

      public unbinding(): Promise<void> {
        return this.id === 0 ? first.promise : second.promise;
      }
    }

    const fixture = createFixture(
      '<ordered-unbinding-child id.bind="0"></ordered-unbinding-child>' +
      '<ordered-unbinding-child id.bind="1"></ordered-unbinding-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const result = fixture.au.root.controller.deactivate(fixture.au.root.controller, null) as Promise<void>;
    let settled = false;
    void result.then(
      () => { settled = true; },
      () => { settled = true; },
    );

    second.reject(new Error('second unbinding failed'));
    await Promise.resolve();
    await Promise.resolve();
    assert.strictEqual(settled, false);

    first.reject();
    let rejected = false;
    try {
      await result;
    } catch (error) {
      rejected = true;
      assert.strictEqual(error, void 0);
    }
    assert.strictEqual(rejected, true);
    assert.strictEqual(children.every(child => !child.$controller.isActive && !child.$controller.isBound), true);

    await fixture.tearDown();
  });

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

  it('quiesces multiple lifecycle hook errors in registration order', async function () {
    const first = new Deferred();
    const second = new Deferred();
    const firstError = new Error('first lifecycle hook failed');
    const secondError = new Error('second lifecycle hook failed');
    let child!: { readonly $controller: ICustomElementController };

    @lifecycleHooks()
    class FirstHook {
      public detaching(_vm: unknown, _initiator: IController): Promise<void> {
        return first.promise;
      }
    }

    @lifecycleHooks()
    class SecondHook {
      public detaching(_vm: unknown, _initiator: IController): Promise<void> {
        return second.promise;
      }
    }

    const Child = CustomElement.define({
      name: 'multiple-rejection-hooks-child',
      template: 'child',
      dependencies: [FirstHook, SecondHook],
    }, class {
      public readonly $controller!: ICustomElementController;

      public constructor() {
        child = this;
      }
    });

    const fixture = createFixture(
      '<multiple-rejection-hooks-child></multiple-rejection-hooks-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const result = child.$controller.deactivate(child.$controller, fixture.au.root.controller) as Promise<void>;
    let settled = false;
    void result.then(
      () => { settled = true; },
      () => { settled = true; },
    );

    second.reject(secondError);
    await Promise.resolve();
    await Promise.resolve();
    assert.strictEqual(settled, false);

    first.reject(firstError);
    await assert.rejects(() => result, firstError);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);

    await fixture.tearDown();
  });

  it('joins a self-deactivating child into a later ancestor teardown', async function () {
    const gate = new Deferred();
    const error = new Error('self-owned child teardown failed');
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

    const childRejected = assert.rejects(() => childDrain, error);
    const rootRejected = assert.rejects(() => rootDrain, error);
    gate.reject(error);
    await Promise.all([childRejected, rootRejected]);
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

    assert.strictEqual(detachingCalls, 2, 'self-deactivation and compensation each detach once');
    assert.strictEqual(rootSettled, false, 'ancestor teardown waits for child compensation');

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

  it('does not run a queued activation after deactivation cleanup fails', async function () {
    const gate = new Deferred();
    const error = new Error('queued activation teardown failed');
    let child!: Child;
    let fail = true;

    @customElement({ name: 'failed-successor-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public detaching(): Promise<void> {
        return gate.promise;
      }

      public unbinding(): void {
        if (fail) {
          throw error;
        }
      }
    }

    const fixture = createFixture(
      '<failed-successor-child></failed-successor-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const parent = fixture.au.root.controller;
    const drain = child.$controller.deactivate(child.$controller, parent) as Promise<void>;
    assert.strictEqual(
      child.$controller.activate(child.$controller, parent, parent.scope),
      drain,
    );

    gate.resolve();
    await assert.rejects(() => drain, error);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(fixture.appHost.textContent, '');

    fail = false;
    await child.$controller.activate(child.$controller, parent, parent.scope);
    fixture.assertText('child');
    await fixture.tearDown();
  });

  it('rejects a detaching hook that returns its own queued activation drain', async function () {
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

    const drain = child.$controller.deactivate(child.$controller, parent);
    assert.instanceOf(drain, Promise);
    await assert.rejects(() => drain as Promise<void>, /AUR0509:.*cannot await.*operation/i);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);

    cycle = false;
    await child.$controller.activate(child.$controller, parent, parent.scope);
    fixture.assertText('child');
    await fixture.tearDown();
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

  it('contains node-removal errors and still unbinds the controller', async function () {
    const error = new Error('node removal failed');
    let child!: Child;
    let unbindingCalls = 0;

    @customElement({ name: 'node-cleanup-failure-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public unbinding(): void {
        ++unbindingCalls;
      }
    }

    const fixture = createFixture(
      '<node-cleanup-failure-child></node-cleanup-failure-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const nodes = child.$controller.nodes;
    const remove = nodes.remove;
    (nodes as unknown as { remove(): void }).remove = () => { throw error; };

    assert.throws(
      () => child.$controller.deactivate(child.$controller, fixture.au.root.controller),
      error,
    );
    assert.strictEqual(unbindingCalls, 1);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(child.$controller.isActive, false);

    (nodes as unknown as { remove: typeof remove }).remove = remove;
    await fixture.tearDown();
  });

  it('contains descendant node-removal errors during ancestor teardown', async function () {
    const error = new Error('descendant node removal failed');
    let child!: Child;
    let unbindingCalls = 0;

    @customElement({ name: 'descendant-node-cleanup-failure-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public unbinding(): void {
        ++unbindingCalls;
      }
    }

    const fixture = createFixture(
      '<descendant-node-cleanup-failure-child></descendant-node-cleanup-failure-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const nodes = child.$controller.nodes;
    const remove = nodes.remove;
    (nodes as unknown as { remove(): void }).remove = () => { throw error; };
    const root = fixture.au.root.controller;

    assert.throws(() => root.deactivate(root, null), error);
    assert.strictEqual(unbindingCalls, 1);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(root.isActive, false);

    (nodes as unknown as { remove: typeof remove }).remove = remove;
    await fixture.tearDown();
  });

  it('contains binding-unbind errors and publishes stable inactive state', async function () {
    const error = new Error('binding unbind failed');
    let child!: Child;

    @customElement({ name: 'binding-cleanup-failure-child', template: '${value}' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;
      public value = 'child';

      public constructor() {
        child = this;
      }
    }

    const fixture = createFixture(
      '<binding-cleanup-failure-child></binding-cleanup-failure-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const binding = child.$controller.bindings![0];
    const unbind = binding.unbind;
    (binding as unknown as { unbind(): void }).unbind = () => { throw error; };

    assert.throws(
      () => child.$controller.deactivate(child.$controller, fixture.au.root.controller),
      error,
    );
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(child.$controller.isActive, false);

    (binding as unknown as { unbind: typeof unbind }).unbind = unbind;
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

  it('propagates a synchronous released-view disposal error after stable teardown', async function () {
    const error = new Error('released view disposal failed');
    let disposeCalls = 0;

    @customElement({ name: 'released-disposal-child', template: 'child' })
    class Child {
      public dispose(): void {
        ++disposeCalls;
        throw error;
      }
    }

    const fixture = createFixture(
      '<released-disposal-child repeat.for="item of items"></released-disposal-child>',
      class { public items = [0]; },
      [Child],
    );
    await fixture.started;
    const repeat = findRepeat(fixture.au.root.controller);
    const view = repeat.views[0];
    view.release();

    assert.throws(() => view.deactivate(view, repeat.$controller), error);
    assert.strictEqual(disposeCalls, 1);
    assert.strictEqual(view.isActive, false);
    assert.strictEqual(view.isBound, false);

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

  it('makes reentrant deactivation from activation compensation a no-op', async function () {
    const attaching = new Deferred();
    let child!: Child;
    let blockActivation = false;
    let reenter = false;
    const parentRef = { value: null! as IHydratedController };

    @customElement({ name: 'compensation-reentrant-child', template: 'child' })
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
      '<compensation-reentrant-child></compensation-reentrant-child>',
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

  it('rejects the predecessor drain when queued reactivation fails synchronously', async function () {
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
    assert.strictEqual(child.$controller.isActive, false);
    failActivation = false;
    await fixture.tearDown();
  });

  it('settles predecessor drains with asynchronous queued reactivation success and failure', async function () {
    let detaching = new Deferred();
    let attaching = new Deferred();
    const error = new Error('queued asynchronous activation failed');
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

    detaching = new Deferred();
    attaching = new Deferred();
    const failedDrain = child.$controller.deactivate(child.$controller, parent) as Promise<void>;
    assert.strictEqual(child.$controller.activate(child.$controller, parent, parent.scope), failedDrain);

    detaching.resolve();
    await Promise.resolve();
    attaching.reject(error);
    await assert.rejects(() => failedDrain, error);
    assert.strictEqual(child.$controller.isActive, false);
    asyncActivation = false;
    await fixture.tearDown();
  });

  it('reports disposable resolver failure after completing controller disposal', async function () {
    const error = new Error('resolver disposal failed');
    let child!: Child;

    @customElement({ name: 'resolver-disposal-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }
    }

    const fixture = createFixture(
      '<resolver-disposal-child></resolver-disposal-child>',
      class {},
      [Child],
    );
    await fixture.started;
    const parent = fixture.au.root.controller;
    await child.$controller.deactivate(child.$controller, parent);
    const resolver: IResolver = {
      $isResolver: true,
      resolve: () => void 0,
      dispose: () => { throw error; },
    };
    child.$controller.container.registerResolver(Symbol('throwing resolver'), resolver, true);

    assert.throws(() => child.$controller.dispose(), error);
    assert.strictEqual(child.$controller.isActive, false);
    await fixture.tearDown();
  });
});
