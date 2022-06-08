import {
  customAttribute,
  CustomElement,
  IController,
  lifecycleHooks,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.bound.spec.ts [synchronous]', function () {

  const hookSymbol = Symbol();
  let tracker: LifeycyleTracker | null = null;

  this.beforeEach(function () {
    tracker = new LifeycyleTracker();
  });

  @lifecycleHooks()
  class BoundLoggingHook<T> {
    bound(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      tracker.bound++;
      tracker.controllers.push(initiator);
    }
  }

  it('invokes global bound hooks', async function () {
    const { component } = await createFixture
      .html`\${message}`
      .deps(BoundLoggingHook)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.bound, 1);
  });

  it('invokes when registered both globally and locally', async function () {
    const { component } = await createFixture
      .component(CustomElement.define({ name: 'app', dependencies: [BoundLoggingHook] }))
      .html`\${message}`
      .deps(BoundLoggingHook)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.bound, 2);
    assert.deepStrictEqual(tracker.controllers, [component.$controller, component.$controller]);
  });

  it('invokes before the view model lifecycle', async function () {
    let boundCallCount = 0;
    await createFixture
      .component(class App {
        bound() {
          assert.strictEqual(this[hookSymbol], hookSymbol);
          boundCallCount++;
        }
      })
      .html``
      .deps(BoundLoggingHook)
      .build().started;

    assert.strictEqual(boundCallCount, 1);
  });

  it('invokes global bound hooks for Custom attribute controller', async function () {
    let current: Square | null = null;
    @customAttribute('square')
    class Square {
      created() { current = this; }
    }

    await createFixture
      .html`<div square>`
      .deps(BoundLoggingHook, Square)
      .build().started;

    assert.instanceOf(current, Square);
    assert.strictEqual(tracker.bound, 2);
  });

  it('invokes bound hooks on Custom attribute', async function () {
    let current: Square | null = null;
    @customAttribute({ name: 'square', dependencies: [BoundLoggingHook] })
    class Square {
      created() { current = this; }
    }

    await createFixture
      .html`<div square>`
      .deps(Square)
      .build().started;

    assert.instanceOf(current, Square);
    assert.strictEqual(tracker.bound, 1);
  });

  it('does not invokes bound hooks on synthetic controller of repeat', async function () {
    await createFixture
      .html('<div repeat.for="i of 2">')
      .deps(BoundLoggingHook)
      .build().started;
    assert.strictEqual(tracker.bound, /* root CE + repeat CA */ 2);
  });

  class LifeycyleTracker {
    bound: number = 0;
    controllers: IController[] = [];
  }
});

describe('3-runtime-html/lifecycle-hooks.bound.spec.ts [asynchronous]', function () {

  const hookSymbol = Symbol();
  let tracker: AsyncLifeycyleTracker | null = null;

  this.beforeEach(function () {
    tracker = new AsyncLifeycyleTracker();
  });

  @lifecycleHooks()
  class boundLoggingHook<T> {
    bound(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      tracker.trace('lch.start');
      return waitForTicks(5).then(() => tracker.trace('lch.end'));
    }
  }

  it('invokes global hook in parallel', async function () {
    await createFixture
      .component(class {
        bound() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html``
      .deps(boundLoggingHook)
      .build().started;

    assert.deepStrictEqual(tracker.logs, [
      'lch.start',
      'comp.start',
      'comp.end',
      'lch.end',
    ]);
  });

  it('invokes local hooks in parallel', async function () {
    await createFixture
      .component(class {
        static dependencies = [boundLoggingHook];
        bound() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html``
      .build().started;

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
      bound() {
        tracker.trace('square.start');
        return waitForTicks(1).then(() => tracker.trace('square.end'));
      }
    }

    await createFixture
      .component(class {
        static dependencies = [boundLoggingHook];
        bound() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html`<div square>`
      .deps(Square)
      .build().started;

    assert.deepStrictEqual(tracker.logs, [
      // bound lifecycle resolves top down sequentially similiarly like binding
      // means children (square CA) will only be invoked
      // after parent (hooks + root CE) have been resolved
      'lch.start',
      'comp.start',
      'comp.end',
      'lch.end',
      'square.start',
      'square.end',
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
