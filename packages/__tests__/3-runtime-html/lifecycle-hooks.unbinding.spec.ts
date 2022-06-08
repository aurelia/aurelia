import {
  customAttribute,
  CustomElement,
  IController,
  lifecycleHooks,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.unbinding.spec.ts [synchronous]', function () {
  let tracker: LifeycyleTracker | null = null;
  this.beforeEach(function () {
    tracker = new LifeycyleTracker();
  });

  const hookSymbol = Symbol();

  @lifecycleHooks()
  class UnbindingLoggingHook<T> {
    unbinding(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      tracker.unbinding++;
      tracker.controllers.push(initiator);
    }
  }

  it('invokes global unbinding hooks', async function () {
    const { component, tearDown } = await createFixture
      .html`\${message}`
      .deps(UnbindingLoggingHook)
      .build().started;

    await tearDown();

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.unbinding, 1);
  });

  it('invokes when registered both globally and locally', async function () {
    const { component, tearDown } = await createFixture
      .component(CustomElement.define({ name: 'app', dependencies: [UnbindingLoggingHook] }))
      .html`\${message}`
      .deps(UnbindingLoggingHook)
      .build().started;

    await tearDown();

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.unbinding, 2);
    assert.deepStrictEqual(tracker.controllers, [component.$controller, component.$controller]);
  });

  it('invokes before the view model lifecycle', async function () {
    let unbindingCallCount = 0;
    const { tearDown } = await createFixture
      .component(class App {
        unbinding() {
          assert.strictEqual(this[hookSymbol], hookSymbol);
          unbindingCallCount++;
        }
      })
      .html``
      .deps(UnbindingLoggingHook)
      .build().started;

    await tearDown();

    assert.strictEqual(unbindingCallCount, 1);
  });

  it('invokes global unbinding hooks for Custom attribute controller', async function () {
    let current: Square | null = null;
    @customAttribute('square')
    class Square {
      created() { current = this; }
    }

    const { tearDown } = await createFixture
      .html`<div square>`
      .deps(UnbindingLoggingHook, Square)
      .build().started;

    await tearDown();

    assert.instanceOf(current, Square);
    assert.strictEqual(tracker.unbinding, 2);
  });

  it('invokes unbinding hooks on Custom attribute', async function () {
    let current: Square | null = null;
    @customAttribute({ name: 'square', dependencies: [UnbindingLoggingHook] })
    class Square {
      created() { current = this; }
    }

    const { tearDown } = await createFixture
      .html`<div square>`
      .deps(Square)
      .build().started;

    await tearDown();

    assert.instanceOf(current, Square);
    assert.strictEqual(tracker.unbinding, 1);
  });

  it('does not invokes unbinding hooks on synthetic controller of repeat', async function () {
    const { tearDown } = await createFixture
      .html('<div repeat.for="i of 2">')
      .deps(UnbindingLoggingHook)
      .build().started;

    await tearDown();

    assert.strictEqual(tracker.unbinding, /* root CE + repeat CA */ 2);
  });

  class LifeycyleTracker {
    unbinding: number = 0;
    controllers: IController[] = [];
  }
});

describe('3-runtime-html/lifecycle-hooks.unbinding.spec.ts [asynchronous]', function () {

  const hookSymbol = Symbol();
  let tracker: AsyncLifeycyleTracker | null = null;

  this.beforeEach(function () {
    tracker = new AsyncLifeycyleTracker();
  });

  @lifecycleHooks()
  class UnbindingLoggingHook<T> {
    unbinding(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      tracker.trace('lch.start');
      return waitForTicks(5).then(() => tracker.trace('lch.end'));
    }
  }

  @lifecycleHooks()
  class UnbindingLoggingHook2<T> {
    unbinding(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      tracker.trace('lch2.start');
      return waitForTicks(5).then(() => tracker.trace('lch2.end'));
    }
  }

  it('invokes global hook in parallel', async function () {
    const { tearDown } = await createFixture
      .component(class {
        unbinding() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html``
      .deps(UnbindingLoggingHook)
      .build().started;

    await tearDown();

    assert.deepStrictEqual(tracker.logs, [
      'lch.start',
      'comp.start',
      'comp.end',
      'lch.end',
    ]);
  });

  it('invokes local hooks in parallel', async function () {
    const { tearDown } = await createFixture
      .component(class {
        static dependencies = [UnbindingLoggingHook];
        unbinding() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html``
      .build().started;

    await tearDown();

    assert.deepStrictEqual(tracker.logs, [
      'lch.start',
      'comp.start',
      'comp.end',
      'lch.end',
    ]);
  });

  it('invokes global hooks in parallel for CA', async function () {
    @customAttribute('square')
    class Square {
      unbinding() {
        tracker.trace('square.start');
        return waitForTicks(1).then(() => tracker.trace('square.end'));
      }
    }

    const { tearDown } = await createFixture
      .component(class {
        unbinding() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html`<div square>`
      .deps(Square, UnbindingLoggingHook)
      .build().started;

    await tearDown();

    assert.deepStrictEqual(tracker.logs, [
      // unbinding starts bottom up
      'lch.start',
      'square.start',
      'lch.start',
      'comp.start',
      'square.end',
      'comp.end',
      'lch.end',
      'lch.end',
    ]);
  });

  it('invokes hooks in the same order with registration', async function () {
    const { tearDown } = await createFixture
      .component(class {
        static dependencies = [UnbindingLoggingHook2, UnbindingLoggingHook];
        unbinding() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html``
      .build().started;

    await tearDown();

    assert.deepStrictEqual(tracker.logs, [
      'lch2.start',
      'lch.start',
      'comp.start',
      'comp.end',
      'lch2.end',
      'lch.end',
    ]);
  });

  const waitForTicks = async (count: number) => {
    while (count-- > 0) {
      await Promise.resolve();
    }
  };

  class AsyncLifeycyleTracker {
    logs: string[] = [];
    trace(msg: string): void {
      this.logs.push(msg);
    }
  }
});
