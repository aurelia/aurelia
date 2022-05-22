import {
  CustomElement,
  IController,
  lifecycleHooks,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.resolve.spec.ts', function () {
  const hookSymbol = Symbol();

  @lifecycleHooks()
  class Hooks<T> {
    created(vm: T, controller: IController) {
      vm[hookSymbol] = controller[hookSymbol] = hookSymbol;
      const tracker = controller.container.get(LifeycyleTracker);
      tracker.created++;
      tracker.controllers.push(controller);
    }
  }

  it('invokes global created hooks', async function () {
    const { component, container } = await createFixture
      .html`\${message}`
      .deps(Hooks)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(container.get(LifeycyleTracker).created, 1);
  });

  it('invokes when registered both globally and locally', async function () {
    const { component, container } = await createFixture
      .component(CustomElement.define({ name: 'app', dependencies: [Hooks] }))
      .html`\${message}`
      .deps(Hooks)
      .build().started;

    assert.strictEqual(component[hookSymbol], hookSymbol);
    assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
    assert.strictEqual(container.get(LifeycyleTracker).created, 2);
    assert.deepStrictEqual(container.get(LifeycyleTracker).controllers, [component.$controller, component.$controller]);
  });

  it('invokes before the view model lifecycle', async function () {
    const createdCall = 0;
    await createFixture
      .component(class App {
        created() {
          assert.strictEqual(this[hookSymbol], hookSymbol);
        }
      })
      .html``
      .deps(Hooks)
      .build().started;

    assert.strictEqual(createdCall, 1);
  });

  class LifeycyleTracker {
    created: number = 0;
    controllers: IController[] = [];
  }
});
