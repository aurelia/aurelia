/* eslint-disable @typescript-eslint/require-await */
import { Aurelia, customElement, bindable } from '@aurelia/runtime';
import { TestContext, assert } from '@aurelia/testing';

function createFixture() {
  const ctx = TestContext.createHTMLTestContext();
  const au = new Aurelia(ctx.container);
  const host = ctx.createElement('div');

  const calls = ctx.container.get(Calls);
  const component = ctx.container.get(Component);
  au.app({ component, host });

  return { ctx, au, host, calls, component };
}

class PromiseTracker {
  public promise: Promise<void>;
  public resolvedCount: number = 0;
  private $resolve: () => void;

  public constructor(
    private readonly calls: Calls,
    private readonly name: Exclude<keyof Calls, 'history'>,
  ) {
    this.promise = new Promise(resolve => this.$resolve = resolve);
  }

  public resolve(owner: string): void {
    ++this.resolvedCount;
    this.calls.history.push(`${owner}.${this.name}`);
    const $resolve = this.$resolve;
    this.promise = new Promise(resolve => this.$resolve = resolve);
    $resolve();
  }
}

class Calls {
  public readonly history: string[] = [];
  public readonly beforeBind: PromiseTracker = new PromiseTracker(this, 'beforeBind');
  public readonly afterBind: PromiseTracker = new PromiseTracker(this, 'afterBind');
  public readonly afterAttach: PromiseTracker = new PromiseTracker(this, 'afterAttach');
  public readonly afterAttachChildren: PromiseTracker = new PromiseTracker(this, 'afterAttachChildren');
  public readonly beforeDetach: PromiseTracker = new PromiseTracker(this, 'beforeDetach');
  public readonly beforeUnbind: PromiseTracker = new PromiseTracker(this, 'beforeUnbind');
  public readonly afterUnbind: PromiseTracker = new PromiseTracker(this, 'afterUnbind');
  public readonly afterUnbindChildren: PromiseTracker = new PromiseTracker(this, 'afterUnbindChildren');
}

@customElement({ name: 'a-1', template: 'a1' })
class A1 {
  public constructor(
    private readonly calls: Calls,
  ) {}

  public async beforeBind(): Promise<void> {
    this.calls.beforeBind.resolve('a1');
  }
  public async afterBind(): Promise<void> {
    this.calls.afterBind.resolve('a1');
  }
  public async afterAttach(): Promise<void> {
    this.calls.afterAttach.resolve('a1');
  }
  public async afterAttachChildren(): Promise<void> {
    this.calls.afterAttachChildren.resolve('a1');
  }
  public async beforeDetach(): Promise<void> {
    this.calls.beforeDetach.resolve('a1');
  }
  public async beforeUnbind(): Promise<void> {
    this.calls.beforeUnbind.resolve('a1');
  }
  public async afterUnbind(): Promise<void> {
    this.calls.afterUnbind.resolve('a1');
  }
  public async afterUnbindChildren(): Promise<void> {
    this.calls.afterUnbindChildren.resolve('a1');
  }
}

@customElement({ name: 'component', template: '<a-1 if.bind="showA1"></a-1>', dependencies: [A1] })
class Component {
  @bindable()
  public showA1: boolean = false;
}

describe('controller', function () {
  it('correctly handles beforeBind shortcircuit', async function () {
    const { au, calls, component } = createFixture();
    await au.start().wait();

    component.showA1 = true;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind'], `#1`);

    component.showA1 = false;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind'], `#2`);

    await au.stop().wait();
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterUnbind'], `#3`);
  });

  it('correctly handles afterBind shortcircuit', async function () {
    const { au, calls, component } = createFixture();
    await au.start().wait();

    component.showA1 = true;
    await calls.afterBind.promise;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind'], `#1`);

    component.showA1 = false;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind'], `#2`);

    await calls.beforeUnbind.promise;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.beforeUnbind'], `#3`);

    await calls.afterUnbind.promise;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.beforeUnbind', 'a1.afterUnbind'], `#4`);

    await au.stop().wait();
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.beforeUnbind', 'a1.afterUnbind'], `#5`);
  });

  it('correctly handles afterAttach shortcircuit', async function () {
    const { au, calls, component } = createFixture();
    await au.start().wait();

    component.showA1 = true;
    await calls.afterAttach.promise;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach'], `#1`);

    component.showA1 = false;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach'], `#2`);

    await calls.beforeDetach.promise;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach', 'a1.beforeDetach'], `#3`);

    await calls.beforeUnbind.promise;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach', 'a1.beforeDetach', 'a1.beforeUnbind'], `#4`);

    await calls.afterUnbind.promise;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach', 'a1.beforeDetach', 'a1.beforeUnbind', 'a1.afterUnbind'], `#5`);

    await au.stop().wait();
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach', 'a1.beforeDetach', 'a1.beforeUnbind', 'a1.afterUnbind'], `#6`);
  });

  it('correctly handles afterAttachChildren shortcircuit', async function () {
    const { au, calls, component } = createFixture();
    await au.start().wait();

    component.showA1 = true;
    await calls.afterAttachChildren.promise;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach', 'a1.afterAttachChildren'], `#1`);

    component.showA1 = false;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach', 'a1.afterAttachChildren'], `#2`);

    await calls.beforeDetach.promise;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach', 'a1.afterAttachChildren', 'a1.beforeDetach'], `#3`);

    await calls.beforeUnbind.promise;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach', 'a1.afterAttachChildren', 'a1.beforeDetach', 'a1.beforeUnbind'], `#4`);

    await calls.afterUnbind.promise;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach', 'a1.afterAttachChildren', 'a1.beforeDetach', 'a1.beforeUnbind', 'a1.afterUnbind'], `#5`);

    await calls.afterUnbindChildren.promise;
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach', 'a1.afterAttachChildren', 'a1.beforeDetach', 'a1.beforeUnbind', 'a1.afterUnbind', 'a1.afterUnbindChildren'], `#6`);

    await au.stop().wait();
    assert.deepStrictEqual(calls.history, ['a1.beforeBind', 'a1.afterBind', 'a1.afterAttach', 'a1.afterAttachChildren', 'a1.beforeDetach', 'a1.beforeUnbind', 'a1.afterUnbind', 'a1.afterUnbindChildren'], `#7`);
  });
});
