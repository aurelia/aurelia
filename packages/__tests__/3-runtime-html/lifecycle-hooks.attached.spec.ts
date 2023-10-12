import {
  customAttribute,
  CustomElement,
  IController,
  lifecycleHooks,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.attached.spec.ts', function () {
  describe('[synchronous]', function () {

    const hookSymbol = Symbol();
    class LifeycyleTracker {
      attached: number = 0;
      controllers: IController[] = [];
    }
    let tracker: LifeycyleTracker | null = null;

    this.beforeEach(function () {
      tracker = new LifeycyleTracker();
    });

    @lifecycleHooks()
    class AttachedLoggingHook<T> {
      attached(vm: T, initiator: IController) {
        vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
        tracker.attached++;
        tracker.controllers.push(initiator);
      }
    }

    it('invokes global attached hooks', async function () {
      const { component } = await createFixture
        .html`\${message}`
        .deps(AttachedLoggingHook)
        .build().started;

      assert.strictEqual(component[hookSymbol], hookSymbol);
      assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
      assert.strictEqual(tracker.attached, 1);
    });

    it('invokes when registered both globally and locally', async function () {
      const { component } = await createFixture
        .component(CustomElement.define({ name: 'app', dependencies: [AttachedLoggingHook] }))
        .html`\${message}`
        .deps(AttachedLoggingHook)
        .build().started;

      assert.strictEqual(component[hookSymbol], hookSymbol);
      assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
      assert.strictEqual(tracker.attached, 2);
      assert.deepStrictEqual(tracker.controllers, [component.$controller, component.$controller]);
    });

    it('invokes before the view model lifecycle', async function () {
      let attachedCallCount = 0;
      await createFixture
        .component(class App {
          attached() {
            assert.strictEqual(this[hookSymbol], hookSymbol);
            attachedCallCount++;
          }
        })
        .html``
        .deps(AttachedLoggingHook)
        .build().started;

      assert.strictEqual(attachedCallCount, 1);
    });

    it('invokes global attached hooks for Custom attribute controller', async function () {
      let current: Square | null = null;
      @customAttribute('square')
      class Square {
        created() { current = this; }
      }

      await createFixture
        .html`<div square>`
        .deps(AttachedLoggingHook, Square)
        .build().started;

      assert.instanceOf(current, Square);
      assert.strictEqual(tracker.attached, 2);
    });

    it('invokes attached hooks on Custom attribute', async function () {
      let current: Square | null = null;
      @customAttribute({ name: 'square', dependencies: [AttachedLoggingHook] })
      class Square {
        created() { current = this; }
      }

      await createFixture
        .html`<div square>`
        .deps(Square)
        .build().started;

      assert.instanceOf(current, Square);
      assert.strictEqual(tracker.attached, 1);
    });

    it('does not invokes attached hooks on synthetic controller of repeat', async function () {
      await createFixture
        .html('<div repeat.for="i of 2">')
        .deps(AttachedLoggingHook)
        .build().started;
      assert.strictEqual(tracker.attached, /* root CE + repeat CA */ 2);
    });
  });

  describe('[asynchronous]', function () {

    const hookSymbol = Symbol();
    let tracker: AsyncLifeycyleTracker | null = null;

    this.beforeEach(function () {
      tracker = new AsyncLifeycyleTracker();
    });

    @lifecycleHooks()
    class AttachedLoggingHook<T> {
      async attached(vm: T, initiator: IController) {
        vm[hookSymbol] = initiator[hookSymbol] = hookSymbol;
        tracker.trace('lch.start');
        return waitForTicks(5).then(() => tracker.trace('lch.end'));
      }
    }

    it('invokes global hook in parallel', async function () {
      await createFixture
        .component(class {
          attached() {
            tracker.trace('comp.start');
            return waitForTicks(1).then(() => tracker.trace('comp.end'));
          }
        })
        .html``
        .deps(AttachedLoggingHook)
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
          static dependencies = [AttachedLoggingHook];
          attached() {
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
        attached() {
          tracker.trace('square.start');
          return waitForTicks(1).then(() => tracker.trace('square.end'));
        }
      }

      await createFixture
        .component(class {
          static dependencies = [AttachedLoggingHook];
          attached() {
            tracker.trace('comp.start');
            return waitForTicks(1).then(() => tracker.trace('comp.end'));
          }
        })
        .html`<div square>`
        .deps(Square)
        .build().started;

      assert.deepStrictEqual(tracker.logs, [
        // parents (root component) attached should
        // only be called after all children attached (square attr)
        // have been called
        'square.start',
        'square.end',
        // then at the root level
        // lch and component are started in parallel
        'lch.start',
        'comp.start',
        'comp.end',
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
});
