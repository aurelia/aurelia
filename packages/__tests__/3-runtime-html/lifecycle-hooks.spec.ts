import {
  CustomElement,
  ICustomElementViewModel,
  IHydratedComponentController,
  LifecycleHooks,
  LifecycleHooksLookup,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/lifecycle-hooks.spec.ts', function () {
  it('retrieves global hooks at root', async function () {
    class Hooks {
      public attaching() {/* empty */}
    }
    const { au, startPromise, tearDown } = createFixture(`\${message}`, class App {}, [LifecycleHooks.define({}, Hooks)]);
    await startPromise;

    const hooks = (au.root.controller as IHydratedComponentController).lifecycleHooks as LifecycleHooksLookup<Hooks>;
    assert.strictEqual(hooks.attaching.length, 1);

    await tearDown();
  });

  it('retrieves global hooks at child', async function () {
    class Hooks {
      public attaching() {/* empty */}
    }
    const { au, component, startPromise, tearDown } = createFixture(
      `<el view-model.ref="el">`,
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
      public attaching() {/* empty */}
    }
    const { au, component, startPromise, tearDown } = createFixture(
      `<el view-model.ref="el">`,
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

  it('does not retrieve hooks in the middle layer', async function () {
    let hooksCall = 0;
    let differentHooksCall = 0;
    class Hooks {
      public attaching() {
        hooksCall++;
      }
    }
    class DifferentHooks {
      public attaching() {
        differentHooksCall++;
      }
    }
    const { au, component, startPromise, tearDown } = createFixture(
      `<el view-model.ref="el">`,
      class App {
        public el: ICustomElementViewModel & { elChild: ICustomElementViewModel };
      },
      [
        CustomElement.define({
          name: 'el',
          template: '<el-child view-model.ref="elChild">',
          dependencies: [
            LifecycleHooks.define({}, Hooks),
            CustomElement.define({
              name: 'el-child',
              dependencies: [
                LifecycleHooks.define({}, DifferentHooks)
              ]
            })
          ]
        }),
      ],
    );
    await startPromise;

    const hooks = (au.root.controller as IHydratedComponentController).lifecycleHooks as LifecycleHooksLookup<Hooks>;
    assert.notStrictEqual(hooks.attaching?.length, 0);

    const childHooks = component.el.$controller!.lifecycleHooks as LifecycleHooksLookup<Hooks>;
    assert.strictEqual(childHooks.attaching.length, 1);

    const grandChildHooks = component.el.elChild.$controller!.lifecycleHooks as LifecycleHooksLookup<DifferentHooks>;
    assert.strictEqual(grandChildHooks.attaching.length, 1);

    assert.strictEqual(hooksCall, 0);
    assert.strictEqual(differentHooksCall, 0);

    childHooks.attaching.forEach(x => x.instance.attaching(null!));
    grandChildHooks.attaching.forEach(x => x.instance.attaching(null!));

    assert.strictEqual(hooksCall, 1);
    assert.strictEqual(differentHooksCall, 1);

    await tearDown();
  });
});
