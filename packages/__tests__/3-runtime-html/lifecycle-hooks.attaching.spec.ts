import { Registration } from '@aurelia/kernel';
import {
  customAttribute,
  CustomElement,
  IController,
  lifecycleHooks,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.attaching.spec.ts [synchronous]', function () {

  const hookSymbol = Symbol();

  @lifecycleHooks()
  class AttachingLoggingHook<T> {
    attaching(vm: T, initiator: IController) {
      vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
      const tracker = initiator.container.get(LifeycyleTracker);
      tracker.attaching++;
      tracker.controllers.push(initiator);
    }
  }

  it('invokes global created hooks', async function () {
    const { component, container } = await createFixture
      .html`\${message}`
      .deps(AttachingLoggingHook)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(container.get(LifeycyleTracker).attaching, 1);
  });

  it('invokes when registered both globally and locally', async function () {
    const { component, container } = await createFixture
      .component(CustomElement.define({ name: 'app', dependencies: [AttachingLoggingHook] }))
      .html`\${message}`
      .deps(AttachingLoggingHook)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(container.get(LifeycyleTracker).attaching, 2);
    assert.deepStrictEqual(container.get(LifeycyleTracker).controllers, [component.$controller, component.$controller]);
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

    const { container } = await createFixture
      .html `<div square>`
      .deps(AttachingLoggingHook, Square)
      .build().started;

    assert.instanceOf(current, Square);
    assert.strictEqual(container.get(LifeycyleTracker).attaching, 2);
  });

  it('invokes attaching hooks on Custom attribute', async function () {
    let current: Square | null = null;
    @customAttribute({ name: 'square', dependencies: [AttachingLoggingHook] })
    class Square {
      created() { current = this; }
    }

    const { container } = await createFixture
      .html `<div square>`
      .deps(Square)
      .build().started;

    assert.instanceOf(current, Square);
    assert.strictEqual(container.get(LifeycyleTracker).attaching, 1);
  });

  it('does not invokes attaching hooks on synthetic controller of repeat', async function () {
    const { container } = await createFixture
      .html('<div repeat.for="i of 2">')
      .deps(AttachingLoggingHook)
      .build().started;
    assert.strictEqual(container.get(LifeycyleTracker).attaching, /* root CE + repeat CA */ 2);
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
    tracker = null;
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
      .deps(AsyncLifeycyleTracker, AttachingLoggingHook)
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
      .deps(AsyncLifeycyleTracker)
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
      .deps(AsyncLifeycyleTracker, Square)
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
    static register(c) {
      return c.register(Registration.instance(AsyncLifeycyleTracker, new AsyncLifeycyleTracker()));
    }

    logs: string[] = [];
    private constructor() {
      tracker = this;
    }

    trace(msg: string): void {
      this.logs.push(msg);
    }
  }
});
