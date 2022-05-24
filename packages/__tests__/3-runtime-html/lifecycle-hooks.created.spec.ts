import {
  customAttribute,
  CustomElement,
  IController,
  ICustomAttributeController,
  lifecycleHooks,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.created.spec.ts', function () {

  const hookSymbol = Symbol();

  @lifecycleHooks()
  class CreatedLoggingHook<T> {
    created(vm: T, controller: IController) {
      vm[hookSymbol] = controller[hookSymbol] = hookSymbol;
      const tracker = controller.container.get(LifeycyleTracker);
      tracker.created++;
      tracker.controllers.push(controller);
    }
  }

  describe('custom elements', function () {
    it('invokes global created hooks', async function () {
      const { component, container } = await createFixture
        .html`\${message}`
        .deps(CreatedLoggingHook)
        .build().started;

      assert.strictEqual(component[hookSymbol], hookSymbol);
      assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
      assert.strictEqual(container.get(LifeycyleTracker).created, 1);
    });

    it('invokes when registered both globally and locally', async function () {
      const { component, container } = await createFixture
        .component(CustomElement.define({ name: 'app', dependencies: [CreatedLoggingHook] }))
        .html`\${message}`
        .deps(CreatedLoggingHook)
        .build().started;

      assert.strictEqual(component[hookSymbol], hookSymbol);
      assert.strictEqual(component.$controller[hookSymbol], hookSymbol);
      assert.strictEqual(container.get(LifeycyleTracker).created, 2);
      assert.deepStrictEqual(container.get(LifeycyleTracker).controllers, [component.$controller, component.$controller]);
    });

    it('invokes before the view model lifecycle', async function () {
      let createdCall = 0;
      await createFixture
        .component(class App {
          created() {
            assert.strictEqual(this[hookSymbol], hookSymbol);
            createdCall++;
          }
        })
        .html``
        .deps(CreatedLoggingHook)
        .build().started;

      assert.strictEqual(createdCall, 1);
    });
  });

  describe('custom attributes', function () {
    const caHooksSymbol = Symbol();
    let current: Square | null = null;

    @customAttribute({
      name: 'square',
      dependencies: [CreatedLoggingHook]
    })
    class Square {
      $controller: ICustomAttributeController;
      created() {
        assert.strictEqual(this[hookSymbol], hookSymbol);
        this[caHooksSymbol] = true;
        current = this;
      }
    }

    const baseTemplate = `<div square>`;

    it('invokes global created hooks', async function () {
      await createFixture
        .html`${baseTemplate}`
        .deps(Square, CreatedLoggingHook)
        .build().started;

      assert.instanceOf(current, Square);
      assert.strictEqual(current?.[caHooksSymbol], true);
      assert.strictEqual(current?.[hookSymbol], hookSymbol);
    });

    it('invokes when registered both globally and locally', async function () {
      const { component, container } = await createFixture
        .html`${baseTemplate}`
        .deps(Square, CreatedLoggingHook)
        .build().started;

      assert.strictEqual(container.get(LifeycyleTracker).created, 2);
      assert.deepStrictEqual(container.get(LifeycyleTracker).controllers, [current.$controller, component.$controller]);
    });
  });

  class LifeycyleTracker {
    created: number = 0;
    controllers: IController[] = [];
  }
});
