import {
  customAttribute,
  CustomElement,
  IController,
  lifecycleHooks,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.attaching.spec.ts [synchronous]', function () {

  const hookSymbol = Symbol();
  let tracker: LifeycyleTracker | null = null;

  this.beforeEach(function () {
    tracker = new LifeycyleTracker();
  });

  @lifecycleHooks()
  class AttachingLoggingHook<T> {
    attaching(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      tracker.attaching++;
      tracker.controllers.push(initiator);
    }
  }

  it('invokes global attaching hooks', async function () {
    const { component } = await createFixture
      .html`\${message}`
      .deps(AttachingLoggingHook)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.attaching, 1);
  });

  it('invokes when registered both globally and locally', async function () {
    const { component } = await createFixture
      .component(CustomElement.define({ name: 'app', dependencies: [AttachingLoggingHook] }))
      .html`\${message}`
      .deps(AttachingLoggingHook)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.attaching, 2);
    assert.deepStrictEqual(tracker.controllers, [component.$controller, component.$controller]);
  });

  it('invokes before the view model lifecycle', async function () {
    let attachingCallCount = 0;
    await createFixture
      .component(class App {
        attaching() {
          assert.strictEqual(this[hookSymbol], hookSymbol);
          attachingCallCount++;
        }
      })
      .html``
      .deps(AttachingLoggingHook)
      .build().started;

    assert.strictEqual(attachingCallCount, 1);
  });

  it('invokes global attaching hooks for Custom attribute controller', async function () {
    let current: Square | null = null;
    @customAttribute('square')
    class Square {
      created() { current = this; }
    }

    await createFixture
      .html`<div square>`
      .deps(AttachingLoggingHook, Square)
      .build().started;

    assert.instanceOf(current, Square);
    assert.strictEqual(tracker.attaching, 2);
  });

  it('invokes attaching hooks on Custom attribute', async function () {
    let current: Square | null = null;
    @customAttribute({ name: 'square', dependencies: [AttachingLoggingHook] })
    class Square {
      created() { current = this; }
    }

    await createFixture
      .html`<div square>`
      .deps(Square)
      .build().started;

    assert.instanceOf(current, Square);
    assert.strictEqual(tracker.attaching, 1);
  });

  it('does not invokes attaching hooks on synthetic controller of repeat', async function () {
    await createFixture
      .html('<div repeat.for="i of 2">')
      .deps(AttachingLoggingHook)
      .build().started;
    assert.strictEqual(tracker.attaching, /* root CE + repeat CA */ 2);
  });

  class LifeycyleTracker {
    attaching: number = 0;
    controllers: IController[] = [];
  }
});

describe('3-runtime-html/lifecycle-hooks.attaching.spec.ts [asynchronous]', function () {

  const hookSymbol = Symbol();
  let tracker: AsyncLifeycyleTracker | null = null;

  this.beforeEach(function () {
    tracker = new AsyncLifeycyleTracker();
  });

  @lifecycleHooks()
  class AttachingLoggingHook<T> {
    async attaching(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      tracker.trace('lch.start');
      return waitForTicks(5).then(() => tracker.trace('lch.end'));
    }
  }

  it('invokes global hook in parallel', async function () {
    await createFixture
      .component(class {
        attaching() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html``
      .deps(AttachingLoggingHook)
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
        static dependencies = [AttachingLoggingHook];
        attaching() {
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
      attaching() {
        tracker.trace('square.start');
        return waitForTicks(1).then(() => tracker.trace('square.end'));
      }
    }

    await createFixture
      .component(class {
        static dependencies = [AttachingLoggingHook];
        attaching() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html`<div square>`
      .deps(Square)
      .build().started;

    assert.deepStrictEqual(tracker.logs, [
      'lch.start',
      'comp.start',
      'square.start',
      'comp.end',
      'square.end',
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
