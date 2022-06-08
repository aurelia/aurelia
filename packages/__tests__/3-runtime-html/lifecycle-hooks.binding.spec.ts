import {
  customAttribute,
  CustomElement,
  IController,
  lifecycleHooks,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.binding.spec.ts [synchronous]', function () {

  const hookSymbol = Symbol();
  let tracker: LifeycyleTracker | null = null;

  this.beforeEach(function () {
    tracker = new LifeycyleTracker();
  });

  @lifecycleHooks()
  class BindingLoggingHook<T> {
    binding(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      tracker.binding++;
      tracker.controllers.push(initiator);
    }
  }

  it('invokes global binding hooks', async function () {
    const { component } = await createFixture
      .html`\${message}`
      .deps(BindingLoggingHook)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.binding, 1);
  });

  it('invokes when registered both globally and locally', async function () {
    const { component } = await createFixture
      .component(CustomElement.define({ name: 'app', dependencies: [BindingLoggingHook] }))
      .html`\${message}`
      .deps(BindingLoggingHook)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.binding, 2);
    assert.deepStrictEqual(tracker.controllers, [component.$controller, component.$controller]);
  });

  it('invokes before the view model lifecycle', async function () {
    let bindingCallCount = 0;
    await createFixture
      .component(class App {
        binding() {
          assert.strictEqual(this[hookSymbol], hookSymbol);
          bindingCallCount++;
        }
      })
      .html``
      .deps(BindingLoggingHook)
      .build().started;

    assert.strictEqual(bindingCallCount, 1);
  });

  it('invokes global binding hooks for Custom attribute controller', async function () {
    let current: Square | null = null;
    @customAttribute('square')
    class Square {
      created() { current = this; }
    }

    await createFixture
      .html`<div square>`
      .deps(BindingLoggingHook, Square)
      .build().started;

    assert.instanceOf(current, Square);
    assert.strictEqual(tracker.binding, 2);
  });

  it('invokes binding hooks on Custom attribute', async function () {
    let current: Square | null = null;
    @customAttribute({ name: 'square', dependencies: [BindingLoggingHook] })
    class Square {
      created() { current = this; }
    }

    await createFixture
      .html`<div square>`
      .deps(Square)
      .build().started;

    assert.instanceOf(current, Square);
    assert.strictEqual(tracker.binding, 1);
  });

  it('does not invokes binding hooks on synthetic controller of repeat', async function () {
    await createFixture
      .html('<div repeat.for="i of 2">')
      .deps(BindingLoggingHook)
      .build().started;
    assert.strictEqual(tracker.binding, /* root CE + repeat CA */ 2);
  });

  class LifeycyleTracker {
    binding: number = 0;
    controllers: IController[] = [];
  }
});

describe('3-runtime-html/lifecycle-hooks.binding.spec.ts [asynchronous]', function () {

  const hookSymbol = Symbol();
  let tracker: AsyncLifeycyleTracker | null = null;

  this.beforeEach(function () {
    tracker = new AsyncLifeycyleTracker();
  });

  @lifecycleHooks()
  class BindingLoggingHook<T> {
    binding(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      tracker.trace('lch.start');
      return waitForTicks(5).then(() => tracker.trace('lch.end'));
    }
  }

  it('invokes global hook in parallel', async function () {
    await createFixture
      .component(class {
        binding() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html``
      .deps(BindingLoggingHook)
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
        static dependencies = [BindingLoggingHook];
        binding() {
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
      binding() {
        tracker.trace('square.start');
        return waitForTicks(1).then(() => tracker.trace('square.end'));
      }
    }

    await createFixture
      .component(class {
        static dependencies = [BindingLoggingHook];
        binding() {
          tracker.trace('comp.start');
          return waitForTicks(1).then(() => tracker.trace('comp.end'));
        }
      })
      .html`<div square>`
      .deps(Square)
      .build().started;

    assert.deepStrictEqual(tracker.logs, [
      // binding lifecycle resolves top down sequentially
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
