import {
  customAttribute,
  CustomElement,
  IController,
  lifecycleHooks,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.hydrating.spec.ts', function () {

  const hookSymbol = Symbol();
  let tracker: LifeycyleTracker | null = null;

  this.beforeEach(function () {
    tracker = new LifeycyleTracker();
  });

  @lifecycleHooks()
  class HydratingLoggingHook<T> {
    hydrating(vm: T, controller: IController) {
      vm[hookSymbol] = controller[hookSymbol] = hookSymbol;
      tracker.hydrating++;
      tracker.controllers.push(controller);
    }
  }

  it('invokes global created hooks', async function () {
    const { component } = await createFixture
      .html`\${message}`
      .deps(HydratingLoggingHook)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.hydrating, 1);
  });

  it('invokes when registered both globally and locally', async function () {
    const { component } = await createFixture
      .component(CustomElement.define({ name: 'app', dependencies: [HydratingLoggingHook] }))
      .html`\${message}`
      .deps(HydratingLoggingHook)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.hydrating, 2);
    assert.deepStrictEqual(tracker.controllers, [component.$controller, component.$controller]);
  });

  it('invokes before the view model lifecycle', async function () {
    let hydratingCallCount = 0;
    await createFixture
      .component(class App {
        hydrating() {
          assert.strictEqual(this[hookSymbol], hookSymbol);
          hydratingCallCount++;
        }
      })
      .html``
      .deps(HydratingLoggingHook)
      .build().started;

    assert.strictEqual(hydratingCallCount, 1);
  });

  it('does not invoke hydrating hooks on Custom attribute', async function () {
    let current: Square | null = null;
    @customAttribute('square')
    class Square {
      hydrating() {
        throw new Error('No hydrating lifecycle on CA');
      }
      created() {
        current = this;
      }
    }

    await createFixture
      .html `<div square>`
      .deps(Square)
      .build().started;

    assert.instanceOf(current, Square);
    assert.strictEqual(tracker.hydrating, 0);
  });

  class LifeycyleTracker {
    hydrating: number = 0;
    controllers: IController[] = [];
  }
});
