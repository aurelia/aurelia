import {
  customAttribute,
  CustomElement,
  IController,
  lifecycleHooks,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.hydrated.spec.ts', function () {

  const hookSymbol = Symbol();
  let tracker: LifeycyleTracker | null = null;

  this.beforeEach(function () {
    tracker = new LifeycyleTracker();
  });

  @lifecycleHooks()
  class HydratedLoggingHook<T> {
    hydrated(vm: T, controller: IController) {
      vm[hookSymbol] = controller[hookSymbol] = hookSymbol;
      tracker.hydrated++;
      tracker.controllers.push(controller);
    }
  }

  it('invokes global created hooks', async function () {
    const { component } = await createFixture
      .html`\${message}`
      .deps(HydratedLoggingHook)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.hydrated, 1);
  });

  it('invokes when registered both globally and locally', async function () {
    const { component } = await createFixture
      .component(CustomElement.define({ name: 'app', dependencies: [HydratedLoggingHook] }))
      .html`\${message}`
      .deps(HydratedLoggingHook)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(tracker.hydrated, 2);
    assert.deepStrictEqual(tracker.controllers, [component.$controller, component.$controller]);
  });

  it('invokes before the view model lifecycle', async function () {
    let hydratedCallCount = 0;
    await createFixture
      .component(class App {
        hydrated() {
          assert.strictEqual(this[hookSymbol], hookSymbol);
          hydratedCallCount++;
        }
      })
      .html``
      .deps(HydratedLoggingHook)
      .build().started;

    assert.strictEqual(hydratedCallCount, 1);
  });

  it('does not invoke hydrated hooks on Custom attribute', async function () {
    let current: Square | null = null;
    @customAttribute('square')
    class Square {
      hydrated() {
        throw new Error('No hydrated lifecycle on CA');
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
    assert.strictEqual(tracker.hydrated, 0);
  });

  class LifeycyleTracker {
    hydrated: number = 0;
    controllers: IController[] = [];
  }
});
