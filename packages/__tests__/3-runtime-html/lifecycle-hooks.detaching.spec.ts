import {
  customAttribute,
  CustomElement,
  IController,
  lifecycleHooks,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.detaching.spec.ts [synchronous]', function () {
  let tracker: LifeycyleTracker | null = null;
  this.beforeEach(function () {
    tracker = new LifeycyleTracker();
  });

  const hookSymbol = Symbol();

  @lifecycleHooks()
  class DetachingLoggingHook<T> {
    detaching(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      tracker.detaching++;
      tracker.controllers.push(initiator);
    }
  }

  it('invokes global detaching hooks', async function () {
    const { component, tearDown } = await createFixture
      .html`\${message}`
      .deps(DetachingLoggingHook)
      .build().started;

    await tearDown();

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.detaching, 1);
  });

  it('invokes when registered both globally and locally', async function () {
    const { component, tearDown } = await createFixture
      .component(CustomElement.define({ name: 'app', dependencies: [DetachingLoggingHook] }))
      .html`\${message}`
      .deps(DetachingLoggingHook)
      .build().started;

    await tearDown();

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.detaching, 2);
    assert.deepStrictEqual(tracker.controllers, [component.$controller, component.$controller]);
  });

  it('invokes before the view model lifecycle', async function () {
    let detachingCallCount = 0;
    const { tearDown } = await createFixture
      .component(class App {
        detaching() {
          assert.strictEqual(this[hookSymbol], hookSymbol);
          detachingCallCount++;
        }
      })
      .html``
      .deps(DetachingLoggingHook)
      .build().started;

    await tearDown();

    assert.strictEqual(detachingCallCount, 1);
  });

  it('invokes global detaching hooks for Custom attribute controller', async function () {
    let current: Square | null = null;
    @customAttribute('square')
    class Square {
      created() { current = this; }
    }

    const { tearDown } = await createFixture
      .html`<div square>`
      .deps(DetachingLoggingHook, Square)
      .build().started;

    await tearDown();

    assert.instanceOf(current, Square);
    assert.strictEqual(tracker.detaching, 2);
  });

  it('invokes detaching hooks on Custom attribute', async function () {
    let current: Square | null = null;
    @customAttribute({ name: 'square', dependencies: [DetachingLoggingHook] })
    class Square {
      created() { current = this; }
    }

    const { tearDown } = await createFixture
      .html`<div square>`
      .deps(Square)
      .build().started;

    await tearDown();

    assert.instanceOf(current, Square);
    assert.strictEqual(tracker.detaching, 1);
  });

  it('does not invokes detaching hooks on synthetic controller of repeat', async function () {
    const { tearDown } = await createFixture
      .html('<div repeat.for="i of 2">')
      .deps(DetachingLoggingHook)
      .build().started;

    await tearDown();

    assert.strictEqual(tracker.detaching, /* root CE + repeat CA */ 2);
  });

  class LifeycyleTracker {
    constructor() {
      console.log('instance created');
    }
    detaching: number = 0;
    controllers: IController[] = [];
  }
});

describe('3-runtime-html/lifecycle-hooks.detaching.spec.ts [asynchronous]', function () {

  const hookSymbol = Symbol();
  let tracker: AsyncLifeycyleTracker | null = null;

  this.beforeEach(function () {
    tracker = new AsyncLifeycyleTracker();
  });

  @lifecycleHooks()
  class DetachingLoggingHook<T> {
    async detaching(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      tracker.trace('lch.start');
      return waitForTicks(5).then(() => tracker.trace('lch.end'));
    }
  }

  @lifecycleHooks()
  class DetachingLoggingHook2<T> {
    async detaching(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      tracker.trace('lch2.start');
      return waitForTicks(5).then(() => tracker.trace('lch2.end'));
    }
  }

  it('invokes global hook in parallel', async function () {
    const { tearDown } = await createFixture
      .component(class {
        detaching() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html``
      .deps(DetachingLoggingHook)
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
        static dependencies = [DetachingLoggingHook];
        detaching() {
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
      detaching() {
        tracker.trace('square.start');
        return waitForTicks(1).then(() => tracker.trace('square.end'));
      }
    }

    const { tearDown } = await createFixture
      .component(class {
        static dependencies = [DetachingLoggingHook];
        detaching() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html`<div square>`
      .deps(Square)
      .build().started;

    await tearDown();

    assert.deepStrictEqual(tracker.logs, [
      'square.start',
      'lch.start',
      'comp.start',
      'square.end',
      'comp.end',
      'lch.end',
    ]);
  });

  it('invokes hooks in the same order with registration', async function () {
    const { tearDown } = await createFixture
      .component(class {
        static dependencies = [DetachingLoggingHook2, DetachingLoggingHook];
        detaching() {
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
