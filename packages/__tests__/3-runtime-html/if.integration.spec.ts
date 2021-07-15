import {
  AccessScopeExpression,
  BindingContext,
  Else,
  If,
  Scope,
  LifecycleFlags,
  Controller,
  CustomElementDefinition,
  IHydratableController,
  IRenderLocation,
  PropertyBindingRendererRegistration,
  TextBindingRendererRegistration,
  TextBindingInstruction,
  Interpolation,
  IWorkTracker,
  INodeObserverLocatorRegistration,
  CustomAttribute,
  IRendering,
} from '@aurelia/runtime-html';
import {
  eachCartesianJoin,
  assert,
  PLATFORM,
  createContainer,
  createFixture,
} from '@aurelia/testing';
import { Writable } from '@aurelia/kernel';

describe(`3-runtime-html/if.integration.spec.ts`, function () {
  function runActivateLifecycle(sut: If, flags: LifecycleFlags, scope: Scope): void {
    void sut.$controller.activate(sut.$controller, null, flags, scope);
  }
  function runDeactivateLifecycle(sut: If, flags: LifecycleFlags): void {
    void sut.$controller.deactivate(sut.$controller, null, flags);
  }

  interface Spec {
    t: string;
  }
  interface DuplicateOperationSpec extends Spec {
    activateTwice: boolean;
    deactivateTwice: boolean;
  }
  interface BindSpec extends Spec {
    ifPropName: string;
    elsePropName: string;
    ifText: string;
    elseText: string;

    value1: any;
    value2: any;
  }
  interface MutationSpec extends Spec {
    newValue1: any;
    newValue2: any;
  }
  interface FlagsSpec extends Spec {
    activateFlags1: LifecycleFlags;
    deactivateFlags1: LifecycleFlags;

    activateFlags2: LifecycleFlags;
    deactivateFlags2: LifecycleFlags;
  }

  const duplicateOperationSpecs: DuplicateOperationSpec[] = [
    { t: '1', activateTwice: false, deactivateTwice: false },
    { t: '2', activateTwice: true,  deactivateTwice: false },
    { t: '3', activateTwice: true,  deactivateTwice: true  },
    { t: '4', activateTwice: false, deactivateTwice: true  },
  ];

  const bindSpecs: BindSpec[] = [
    { t: '1', ifPropName: 'ifValue', elsePropName: 'elseValue', ifText: 'foo', elseText: 'bar', value1: true,  value2: true  },
    { t: '2', ifPropName: 'ifValue', elsePropName: 'elseValue', ifText: 'foo', elseText: 'bar', value1: true,  value2: false },
    { t: '3', ifPropName: 'ifValue', elsePropName: 'elseValue', ifText: 'foo', elseText: 'bar', value1: false, value2: true  },
    { t: '4', ifPropName: 'ifValue', elsePropName: 'elseValue', ifText: 'foo', elseText: 'bar', value1: false, value2: false },
  ];

  const none = LifecycleFlags.none;
  const bind = LifecycleFlags.fromBind;
  const unbind = LifecycleFlags.fromUnbind;

  const mutationSpecs: MutationSpec[] = [
    { t: '01', newValue1: false, newValue2: false, },
    { t: '02', newValue1: false, newValue2: true,  },
    { t: '03', newValue1: true,  newValue2: false, },
    { t: '04', newValue1: true,  newValue2: true,  },
  ];

  const flagsSpecs: FlagsSpec[] = [
    { t: '1', activateFlags1: none,            deactivateFlags1: none,              activateFlags2: none,            deactivateFlags2: none,              },
    { t: '2', activateFlags1: bind,            deactivateFlags1: unbind,            activateFlags2: bind,            deactivateFlags2: unbind,            },
  ];

  const container = createContainer().register(
    INodeObserverLocatorRegistration,
    PropertyBindingRendererRegistration,
    TextBindingRendererRegistration,
  );

  const marker = PLATFORM.document.createElement('au-m');
  marker.className = 'au';
  const text = PLATFORM.document.createTextNode('');
  const textTemplate = PLATFORM.document.createElement('template');
  textTemplate.content.append(marker, text);

  eachCartesianJoin(
    [duplicateOperationSpecs, bindSpecs, mutationSpecs, flagsSpecs],
    (duplicateOperationSpec, bindSpec, mutationSpec, flagsSpec) => {
      it(`verify if/else behavior - duplicateOperationSpec ${duplicateOperationSpec.t}, bindSpec ${bindSpec.t}, mutationSpec ${mutationSpec.t}, flagsSpec ${flagsSpec.t}, `, function () {
        const { activateTwice, deactivateTwice } = duplicateOperationSpec;
        const { ifPropName, elsePropName, ifText, elseText, value1, value2 } = bindSpec;
        const { newValue1, newValue2 } = mutationSpec;
        const { activateFlags1, deactivateFlags1, activateFlags2, deactivateFlags2 } = flagsSpec;

        // common stuff
        const baseFlags: LifecycleFlags = LifecycleFlags.none;

        const host = PLATFORM.document.createElement('div');
        const ifLoc = PLATFORM.document.createComment('au-end') as IRenderLocation;
        const elseLoc = PLATFORM.document.createComment('au-end') as IRenderLocation;
        ifLoc.$start = PLATFORM.document.createComment('au-start');
        elseLoc.$start = PLATFORM.document.createComment('au-start');
        host.append(ifLoc.$start, ifLoc, elseLoc.$start, elseLoc);

        const ifDef = CustomElementDefinition.create({
          name: 'if-view',
          template: textTemplate.content.cloneNode(true),
          instructions: [
            [
              new TextBindingInstruction(new Interpolation(['', ''], [new AccessScopeExpression(ifPropName)]), false),
            ],
          ],
          needsCompile: false,
        });
        const elseDef = CustomElementDefinition.create({
          name: 'else-view',
          template: textTemplate.content.cloneNode(true),
          instructions: [
            [
              new TextBindingInstruction(new Interpolation(['', ''], [new AccessScopeExpression(elsePropName)]), false),
            ],
          ],
          needsCompile: false,
        });

        const work = container.get(IWorkTracker);
        const rendering = container.get(IRendering);
        const ifFactory = rendering.getViewFactory(ifDef, container);
        const elseFactory = rendering.getViewFactory(elseDef, container);
        const sut = new If(ifFactory, ifLoc, work);
        const elseSut = new Else(elseFactory);
        const ifController = (sut as Writable<If>).$controller = Controller.forCustomAttribute(null, container, sut, (void 0)!);
        elseSut.link(LifecycleFlags.none, void 0!, { children: [ifController] } as unknown as IHydratableController, void 0!, void 0!, void 0!);

        const firstBindInitialNodesText: string = value1 ? ifText : elseText;
        const firstBindFinalNodesText = firstBindInitialNodesText;
        const firstAttachInitialHostText = value1 ? ifText : elseText;
        const firstAttachFinalHostText: string = newValue1 ? ifText : elseText;

        const secondBindInitialNodesText: string = value2 ? ifText : elseText;
        const secondBindFinalNodesText = secondBindInitialNodesText;
        const secondAttachInitialHostText = value2 ? ifText : elseText;
        const secondAttachFinalHostText: string = newValue2 ? ifText : elseText;

        // -- Round 1 --

        const ctx = BindingContext.create({
          [ifPropName]: ifText,
          [elsePropName]: elseText
        });
        const scope = Scope.create(ctx);

        sut.value = value1;

        runActivateLifecycle(sut, baseFlags | activateFlags1, scope);

        assert.strictEqual(sut.view.nodes.lastChild.previousSibling['textContent'], firstBindInitialNodesText, '$nodes.textContent #1');

        if (activateTwice) {
          runActivateLifecycle(sut, baseFlags | activateFlags1, scope);
        }

        assert.strictEqual(sut.view.nodes.lastChild.previousSibling['textContent'], firstBindFinalNodesText, '$nodes.textContent #2');

        assert.strictEqual(host.textContent, firstAttachInitialHostText, 'host.textContent #1');

        sut.value = newValue1;

        assert.strictEqual(host.textContent, firstAttachFinalHostText, 'host.textContent #2');

        runDeactivateLifecycle(sut, baseFlags | deactivateFlags1);
        if (deactivateTwice) {
          runDeactivateLifecycle(sut, baseFlags | deactivateFlags1);
        }

        assert.strictEqual(host.textContent, '', 'host.textContent #3');

        // unbind should not affect existing values but stops them from updating afterwards

        // -- Round 2 --

        sut.value = value2;

        runActivateLifecycle(sut, baseFlags | activateFlags2, scope);

        assert.strictEqual(sut.view.nodes.lastChild.previousSibling['textContent'], secondBindInitialNodesText, '$nodes.textContent #3');
        if (activateTwice) {
          runActivateLifecycle(sut, baseFlags | activateFlags2, scope);
        }

        assert.strictEqual(sut.view.nodes.lastChild.previousSibling['textContent'], secondBindFinalNodesText, '$nodes.textContent #4');

        assert.strictEqual(host.textContent, secondAttachInitialHostText, 'host.textContent #4');

        sut.value = newValue2;

        assert.strictEqual(host.textContent, secondAttachFinalHostText, 'host.textContent #5');

        runDeactivateLifecycle(sut, baseFlags | deactivateFlags2);
        if (deactivateTwice) {
          runDeactivateLifecycle(sut, baseFlags | deactivateFlags2);
        }

        assert.strictEqual(host.textContent, '', 'host.textContent #6');
      });
    });

  describe('with caching', function () {
    it('disables cache with "false" string', async function () {
      let callCount = 0;
      const { appHost, component, startPromise, tearDown } = createFixture(
        `<div if="value.bind: condition; cache: false" abc>hello`,
        class App {
          public condition: unknown = true;
        },
        [CustomAttribute.define('abc', class Abc {
          public constructor() {
            callCount++;
          }
        })]
      );

      await startPromise;
      assert.visibleTextEqual(appHost, 'hello');
      assert.strictEqual(callCount, 1);

      component.condition = false;
      assert.visibleTextEqual(appHost, '');

      component.condition = true;
      assert.visibleTextEqual(appHost, 'hello');
      assert.strictEqual(callCount, 2);

      await tearDown();

      assert.visibleTextEqual(appHost, '');
    });

    for (const falsyValue of [null, undefined, 0, NaN, false]) {
      it(`disables cache with fasly value: "${falsyValue}" string`, async function () {
        let callCount = 0;
        const { appHost, component, startPromise, tearDown } = createFixture(
          `<div if="value.bind: condition; cache.bind: ${falsyValue}" abc>hello`,
          class App {
            public condition: unknown = true;
          },
          [CustomAttribute.define('abc', class Abc {
            public constructor() {
              callCount++;
            }
          })]
        );

        await startPromise;
        assert.visibleTextEqual(appHost, 'hello');
        assert.strictEqual(callCount, 1);

        component.condition = false;
        assert.visibleTextEqual(appHost, '');

        component.condition = true;
        assert.visibleTextEqual(appHost, 'hello');
        assert.strictEqual(callCount, 2);

        await tearDown();

        assert.visibleTextEqual(appHost, '');
      });
    }

    it('disables cache on [else]', async function () {
      let callCount = 0;
      const { appHost, component, startPromise, tearDown } = createFixture(
        `<div if="value.bind: condition; cache: false" abc>hello</div><div else abc>world</div>`,
        class App {
          public condition: unknown = true;
        },
        [CustomAttribute.define('abc', class Abc {
          public constructor() {
            callCount++;
          }
        })]
      );

      await startPromise;
      assert.visibleTextEqual(appHost, 'hello');
      assert.strictEqual(callCount, 1);

      component.condition = false;
      assert.visibleTextEqual(appHost, 'world');
      assert.strictEqual(callCount, 2);

      component.condition = true;
      assert.visibleTextEqual(appHost, 'hello');
      assert.strictEqual(callCount, 3);

      component.condition = false;
      assert.visibleTextEqual(appHost, 'world');
      assert.strictEqual(callCount, 4);

      await tearDown();

      assert.visibleTextEqual(appHost, '');
    });

    it('does not affected nested [if]', async function () {
      let callCount = 0;
      const { appHost, component, startPromise, tearDown } = createFixture(
        `<div if="value.bind: condition; cache: false" abc>hello<span if.bind="condition2" abc> span`,
        class App {
          public condition: unknown = true;
          public condition2: unknown = true;
        },
        [CustomAttribute.define('abc', class Abc {
          public constructor() {
            callCount++;
          }
        })]
      );

      await startPromise;
      assert.visibleTextEqual(appHost, 'hello span');
      assert.strictEqual(callCount, 2);

      // change to false
      component.condition2 = false;
      assert.visibleTextEqual(appHost, 'hello');
      // then true again
      component.condition2 = true;
      assert.visibleTextEqual(appHost, 'hello span');
      // wouldn't create another view
      assert.strictEqual(callCount, 2);

      component.condition = false;
      assert.visibleTextEqual(appHost, '');

      component.condition = true;
      assert.visibleTextEqual(appHost, 'hello span');
      assert.strictEqual(callCount, 4);

      await tearDown();

      assert.visibleTextEqual(appHost, '');
    });

    it('works on subsequent activation when nested inside other [if]', async function () {
      let callCount = 0;
      const { appHost, component, startPromise, tearDown } = createFixture(
        `<div if.bind="condition" abc>hello<span if="value.bind: condition2; cache: false" abc> span`,
        class App {
          public condition: unknown = true;
          public condition2: unknown = true;
        },
        [CustomAttribute.define('abc', class Abc {
          public constructor() {
            callCount++;
          }
        })]
      );

      await startPromise;
      assert.visibleTextEqual(appHost, 'hello span');
      assert.strictEqual(callCount, 2);

      // change to false
      component.condition2 = false;
      assert.visibleTextEqual(appHost, 'hello');
      // then true again
      component.condition2 = true;
      assert.visibleTextEqual(appHost, 'hello span');
      // wouldn't create another view
      assert.strictEqual(callCount, 3);

      component.condition = false;
      assert.visibleTextEqual(appHost, '');

      component.condition = true;
      assert.visibleTextEqual(appHost, 'hello span');
      assert.strictEqual(callCount, 4);

      await tearDown();

      assert.visibleTextEqual(appHost, '');
    });
  });
});
