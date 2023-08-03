import {
  CustomElement,
  ICustomElementViewModel,
  IHydratedComponentController,
  lifecycleHooks,
  LifecycleHooks,
  LifecycleHooksLookup,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.resolve.spec.ts', function () {
  it('retrieves global hooks at root', async function () {
    class Hooks {
      public attaching() {/* empty */ }
    }
    const { au, startPromise, tearDown } = createFixture(`\${message}`, class App { }, [LifecycleHooks.define({}, Hooks)]);
    await startPromise;

    const hooks = (au.root.controller as IHydratedComponentController).lifecycleHooks as LifecycleHooksLookup<Hooks>;
    assert.strictEqual(hooks.attaching.length, 1);

    await tearDown();
  });

  it('retrieves global hooks at child', async function () {
    class Hooks {
      public attaching() {/* empty */ }
    }
    const { au, component, startPromise, tearDown } = createFixture(
      `<el component.ref="el">`,
      class App {
        public el: ICustomElementViewModel;
      },
      [
        CustomElement.define({
          name: 'el',
          dependencies: []
        }),
        LifecycleHooks.define({}, Hooks)
      ],
    );
    await startPromise;

    const hooks = (au.root.controller as IHydratedComponentController).lifecycleHooks as LifecycleHooksLookup<Hooks>;
    assert.strictEqual(hooks.attaching.length, 1);

    const childHooks = component.el.$controller!.lifecycleHooks as LifecycleHooksLookup<Hooks>;
    assert.strictEqual(childHooks.attaching.length, 1);

    await tearDown();
  });

  it('retrieves local hooks at child', async function () {
    class Hooks {
      public attaching() {/* empty */ }
    }
    const { au, component, startPromise, tearDown } = createFixture(
      `<el component.ref="el">`,
      class App {
        public el: ICustomElementViewModel;
      },
      [
        CustomElement.define({
          name: 'el',
          dependencies: [
            LifecycleHooks.define({}, Hooks)
          ]
        }),
      ],
    );
    await startPromise;

    const hooks = (au.root.controller as IHydratedComponentController).lifecycleHooks as LifecycleHooksLookup<Hooks>;
    assert.notStrictEqual(hooks.attaching?.length, 0);

    const childHooks = component.el.$controller!.lifecycleHooks as LifecycleHooksLookup<Hooks>;
    assert.strictEqual(childHooks.attaching.length, 1);

    await tearDown();
  });

  describe('<App/> -> <Child/> -> <Grand Child/>', function () {
    it('does not retrieve hooks in the middle layer', async function () {
      class Hooks {
        public attaching() {
          // empty
        }
      }
      class Hooks2 {
        public attaching() {
          // empty
        }
      }
      class DifferentHooks {
        public attaching() {
          // empty
        }
      }
      class DifferentHooks2 {
        public attaching() {
          // empty
        }
      }
      const { au, component } = await createFixture(
        `<el component.ref="el">`,
        class App {
          public el: ICustomElementViewModel & { elChild: ICustomElementViewModel };
        },
        [
          CustomElement.define({
            name: 'el',
            template: '<el-child component.ref="elChild">',
            dependencies: [
              LifecycleHooks.define({}, Hooks),
              LifecycleHooks.define({}, Hooks2),
              CustomElement.define({
                name: 'el-child',
                dependencies: [
                  LifecycleHooks.define({}, DifferentHooks),
                  LifecycleHooks.define({}, DifferentHooks2)
                ]
              })
            ]
          }),
        ],
      ).started;

      const hooks = (au.root.controller as IHydratedComponentController).lifecycleHooks as LifecycleHooksLookup<Hooks>;
      assert.notStrictEqual(hooks.attaching?.length, 0);

      const childHooks = component.el.$controller!.lifecycleHooks as LifecycleHooksLookup<Hooks>;
      assert.strictEqual(childHooks.attaching.length, 2);

      const grandChildHooks = component.el.elChild.$controller!.lifecycleHooks as LifecycleHooksLookup<DifferentHooks>;
      assert.strictEqual(grandChildHooks.attaching.length, 2);

      assert.strictEqual(childHooks.attaching.every(x => x.instance instanceof Hooks || x.instance instanceof Hooks2), true);
      assert.strictEqual(grandChildHooks.attaching.every(x => x.instance instanceof DifferentHooks || x.instance instanceof DifferentHooks2), true);
    });

    it('retrieves the same hooks Type twice as declaration', async function () {
      @lifecycleHooks()
      class Hooks {
        public attaching() {
          // empty
        }
      }

      @lifecycleHooks()
      class Hooks2 {
        public attaching() {
          // empty
        }
      }

      @lifecycleHooks()
      class DifferentHooks {
        public attaching() {
          // empty
        }
      }

      @lifecycleHooks()
      class DifferentHooks2 {
        public attaching() {
          // empty
        }
      }

      const { au, component } = await createFixture(
        `<el component.ref="el">`,
        class App {
          public el: ICustomElementViewModel & { elChild: ICustomElementViewModel };
        },
        [
          CustomElement.define({
            name: 'el',
            template: '<el-child component.ref="elChild">',
            dependencies: [
              Hooks,
              Hooks2,
              Hooks,
              Hooks2,
              CustomElement.define({
                name: 'el-child',
                dependencies: [
                  DifferentHooks,
                  DifferentHooks2,
                  DifferentHooks,
                  DifferentHooks2,
                ]
              })
            ]
          }),
        ],
      ).started;

      const hooks = (au.root.controller as IHydratedComponentController).lifecycleHooks as LifecycleHooksLookup<Hooks>;
      assert.notStrictEqual(hooks.attaching?.length, 0);

      const childHooks = component.el.$controller!.lifecycleHooks as LifecycleHooksLookup<Hooks>;
      assert.strictEqual(childHooks.attaching.length, 4);

      const grandChildHooks = component.el.elChild.$controller!.lifecycleHooks as LifecycleHooksLookup<DifferentHooks>;
      assert.strictEqual(grandChildHooks.attaching.length, 4);

      assert.strictEqual(childHooks.attaching.every(x => x.instance instanceof Hooks || x.instance instanceof Hooks2), true);
      assert.strictEqual(grandChildHooks.attaching.every(x => x.instance instanceof DifferentHooks || x.instance instanceof DifferentHooks2), true);
    });
  });
});
