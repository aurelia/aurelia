import { Registration } from '@aurelia/kernel';
import {
  Aurelia,
  CustomAttribute,
  CustomElement,
  ICustomElementViewModel,
  IHydratedController,
  ISSRContext,
  type ISSRScope,
  customElement,
} from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
import { assert, createFixture, TestContext } from '@aurelia/testing';

describe(`3-runtime-html/if.integration.spec.ts`, function () {
  class EventLog {
    public readonly events: string[] = [];
    public log(event: string) {
      this.events.push(event);
    }
  }

  describe('with caching', function () {
    it('disables cache with "false" string', async function () {
      let callCount = 0;
      const { appHost, component, tearDown } = await createFixture(
        `<div if="value.bind: condition; cache: false" abc>hello`,
        class App {
          public condition: unknown = true;
        },
        [CustomAttribute.define('abc', class Abc {
          public constructor() {
            callCount++;
          }
        })]
      ).started;

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
        const { appHost, component, tearDown } = await createFixture(
          `<div if="value.bind: condition; cache.bind: ${falsyValue}" abc>hello`,
          class App {
            public condition: unknown = true;
          },
          [CustomAttribute.define('abc', class Abc {
            public constructor() {
              callCount++;
            }
          })]
      ).started;

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
      const { appHost, component, tearDown } = await createFixture(
        `<div if="value.bind: condition; cache: false" abc>hello</div><div else abc>world</div>`,
        class App {
          public condition: unknown = true;
        },
        [CustomAttribute.define('abc', class Abc {
          public constructor() {
            callCount++;
          }
        })]
      ).started;

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
      const { appHost, component, tearDown } = await createFixture(
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
      ).started;

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
      const { appHost, component, tearDown } = await createFixture(
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
      ).started;

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

    it('works with interpolation as only child of <template>', async function () {
      const { assertText, component, tearDown } = createFixture(
        '<div><template if.bind="on">${name}</template>',
        { on: false, name: 'a' }
      );

      assertText('');

      component.on = true;
      await tasksSettled();
      assertText('a');

      void tearDown();

      assertText('');
    });

    it('works with interpolation + leading + trailing text inside template', async function () {
      const { assertText, component, tearDown } = createFixture(
        '<div><template if.bind="on">hey ${name}</template>',
        { on: false, name: 'a' }
      );

      assertText('');

      component.on = true;
      await tasksSettled();
      assertText('hey a');

      void tearDown();

      assertText('');
    });

    it('works with interpolation as only child of <template> + else', async function () {
      const { assertText, component, tearDown } = createFixture(
        '<template if.bind="on">${name}</template><template else>${name + 1}</template>',
        { on: false, name: 'a' }
      );

      assertText('a1');

      component.on = true;
      await tasksSettled();
      assertText('a');

      void tearDown();

      assertText('');
    });

    describe('else structural association', function () {
      const GapMarker = CustomAttribute.define('else-gap-marker', class {});

      @customElement({ name: 'else-gap-element', template: 'gap' })
      class GapElement {}

      const invalidGaps: readonly {
        name: string;
        markup: string;
        dependencies?: unknown[];
        value?: string;
      }[] = [
        { name: 'significant text', markup: 'gap' },
        { name: 'a non-breaking space', markup: '\u00a0' },
        { name: 'an interpolation', markup: '${value}' },
        { name: 'an initially empty interpolation', markup: '${value}', value: '' },
        { name: 'a let element', markup: '<let gap.bind="value"></let>' },
        { name: 'a local template declaration', markup: '<template as-custom-element="else-gap-local">gap</template>' },
        { name: 'a plain element', markup: '<p>gap</p>' },
        { name: 'an element with an unregistered attribute', markup: '<p else-gap-marker>gap</p>' },
        { name: 'a registered custom attribute', markup: '<p else-gap-marker>gap</p>', dependencies: [GapMarker] },
        { name: 'an unregistered custom element', markup: '<else-gap-element></else-gap-element>' },
        { name: 'a registered custom element', markup: '<else-gap-element></else-gap-element>', dependencies: [GapElement] },
        { name: 'another template controller', markup: '<p repeat.for="i of 1">gap</p>' },
        { name: 'a plain template', markup: '<template>gap</template>' },
      ];

      for (const { name, markup, dependencies, value = 'value' } of invalidGaps) {
        it(`rejects else after ${name}`, function () {
          assert.throws(() => createFixture(
            `<div if.bind="condition">if</div>${markup}<div else>else</div>`,
            { condition: false, value },
            dependencies,
          ), /AUR0810/);
        });
      }

      it('rejects else without a preceding sibling', function () {
        assert.throws(() => createFixture('<div else>else</div>'), /AUR0810/);
      });

      it('allows formatting whitespace and comments between if and else', function () {
        const { appHost, component } = createFixture(
          '<div if.bind="condition">if</div>\n  <!-- formatting -->\n  <div else>else</div>',
          { condition: true },
        );

        assert.strictEqual(appHost.textContent!.trim(), 'if');
        component.condition = false;
        assert.strictEqual(appHost.textContent!.trim(), 'else');
      });

      it('associates adjacent branches through preserved SSR markers', async function () {
        class App {
          public show = false;
        }

        const AppElement = CustomElement.define({
          name: 'ssr-adjacent-if-else',
          template: [
            '<div if.bind="show" data-branch="if">if</div>',
            '\n  <!-- formatting -->\n  ',
            '<div else data-branch="else">else</div>',
          ].join(''),
        }, App);

        const serverContext = TestContext.create();
        serverContext.container.register(
          Registration.instance(ISSRContext, { preserveMarkers: true }),
        );
        const serverHost = serverContext.doc.body.appendChild(
          serverContext.createElement('ssr-adjacent-if-else'),
        );
        const serverAu = new Aurelia(serverContext.container).app({
          host: serverHost,
          component: AppElement,
        });

        let markup: string;
        try {
          await serverAu.start();
          markup = serverHost.innerHTML;
          assert.strictEqual(serverHost.textContent!.trim(), 'else');
          assert.strictEqual(
            (markup.match(/<!--au-->/g) ?? []).length,
            2,
            'server rendering preserves the target marker for each branch',
          );
        } finally {
          await serverAu.stop(true);
          serverAu.dispose();
          serverHost.remove();
        }

        const clientContext = TestContext.create();
        const clientHost = clientContext.doc.body.appendChild(
          clientContext.createElement('ssr-adjacent-if-else'),
        );
        clientHost.innerHTML = markup;
        const serverElse = clientHost.querySelector('[data-branch="else"]');
        assert.notStrictEqual(serverElse, null);

        const ssrScope: ISSRScope = {
          name: 'ssr-adjacent-if-else',
          children: [{
            type: 'if',
            state: { value: false },
            views: [{ nodeCount: 1, children: [] }],
          }],
        };
        const clientAu = new Aurelia(clientContext.container);
        try {
          const root = await clientAu.hydrate({
            host: clientHost,
            component: AppElement,
            ssrScope,
          });
          try {
            const component = root.controller.viewModel as App;
            assert.strictEqual(
              clientHost.querySelector('[data-branch="else"]'),
              serverElse,
              'the server-rendered else branch is adopted',
            );

            component.show = true;
            await tasksSettled();
            assert.strictEqual(clientHost.textContent!.trim(), 'if');

            component.show = false;
            await tasksSettled();
            assert.strictEqual(clientHost.textContent!.trim(), 'else');
            assert.strictEqual(
              clientHost.querySelector('[data-branch="else"]'),
              serverElse,
              'the adopted cached else view is reused',
            );
          } finally {
            await root.deactivate();
            root.dispose();
          }
        } finally {
          clientAu.dispose();
          clientHost.remove();
        }
      });

      it('does not let a nested if in an intervening element claim the outer else', function () {
        assert.throws(() => createFixture(
          [
            '<div if.bind="outer">outer-if</div>',
            '<section><span if.bind="inner">inner-if</span></section>',
            '<div else>outer-else</div>',
          ].join(''),
          { outer: true, inner: false },
        ), /AUR0810/);
      });

      it('keeps adjacent conditional pairs independent', function () {
        const { assertText, component } = createFixture(
          [
            '<div if.bind="first">a</div>',
            '<div else>b</div>',
            '<div if.bind="second">c</div>',
            '<div else>d</div>',
          ].join(''),
          { first: true, second: false },
        );

        assertText('ad');
        component.first = false;
        component.second = true;
        assertText('bc');
      });

      it('associates projected branches within the same slot', function () {
        @customElement({
          name: 'else-slot-host',
          template: '<au-slot name="content"></au-slot>',
        })
        class SlotHost {}

        const { assertText, component } = createFixture(
          [
            '<else-slot-host>',
            '<div au-slot="content" if.bind="condition">if</div>',
            '<div au-slot="content" else>else</div>',
            '</else-slot-host>',
          ].join(''),
          { condition: true },
          [SlotHost],
        );

        assertText('if');
        component.condition = false;
        assertText('else');
      });

      it('rejects projected branches from different slots with AUR0810', function () {
        @customElement({
          name: 'else-multi-slot-host',
          template: '<au-slot name="first"></au-slot><au-slot name="second"></au-slot>',
        })
        class MultiSlotHost {}

        assert.throws(() => createFixture(
          [
            '<else-multi-slot-host>',
            '<div au-slot="first" if.bind="condition">if</div>',
            '<div au-slot="second" else>else</div>',
            '</else-multi-slot-host>',
          ].join(''),
          { condition: false },
          [MultiSlotHost],
        ), /AUR0810/);
      });

      it('does not join branches unwrapped from separate projection templates', function () {
        @customElement({
          name: 'else-template-slot-host',
          template: '<au-slot name="content"></au-slot>',
        })
        class TemplateSlotHost {}

        assert.throws(() => createFixture(
          [
            '<else-template-slot-host>',
            '<template au-slot="content"><div if.bind="condition">if</div></template>',
            '<template au-slot="content"><div else>else</div></template>',
            '</else-template-slot-host>',
          ].join(''),
          { condition: false },
          [TemplateSlotHost],
        ), /AUR0810/);
      });

      it('associates each repeated pair within its own view', async function () {
        const { assertText, component } = createFixture(
          [
            '<div repeat.for="item of items">',
            '<span if.bind="item.visible">${item.name}-if</span>',
            '<span else>${item.name}-else</span>',
            '</div>',
          ].join(''),
          {
            items: [
              { name: 'a', visible: true },
              { name: 'b', visible: false },
            ],
          },
        );

        assertText('a-ifb-else');
        component.items[1].visible = true;
        assertText('a-ifb-if');

        component.items.unshift({ name: 'c', visible: false });
        await tasksSettled();
        assertText('c-elsea-ifb-if');

        component.items.splice(1, 1);
        await tasksSettled();
        assertText('c-elseb-if');
      });
    });

    {
      @customElement({ name: 'c-1', template: 'c-1' })
      class CeOne implements ICustomElementViewModel {

        private static id: number = 0;
        public static inject = [EventLog];
        public constructor(private readonly log: EventLog) { }

        binding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
          this.log.log('c-1 binding enter');
          const id = CeOne.id;
          CeOne.id++;
          if (id % 2 === 0) throw new Error('Synthetic test error');
          this.log.log('c-1 binding leave');
        }
      }

      class Root {
        public showC1: boolean = false;
      }

      it('Once an activation errs, further successful activation of the same elements is still possible - without else', async function () {
        const { component, appHost, container, stop } = createFixture(
          `<c-1 if.bind="showC1"></c-1>`,
          Root,
          [EventLog, CeOne],
        );

        const eventLog = container.get(EventLog);

        assert.html.textContent(appHost, '', 'init');
        assert.deepStrictEqual(eventLog.events, [], 'init log');

        // trigger component activation - expect error
        await activateC1(false, 1);

        // deactivate c-1
        await deactivateC1(2);

        // activate c-1 again - expect success
        await activateC1(true, 3);

        // deactivate c-1
        await deactivateC1(4);

        // activate c-1 again - expect error
        await activateC1(false, 5);

        // deactivate c-1
        await deactivateC1(6);

        // activate c-1 again - expect success
        await activateC1(true, 7);

        await stop();

        async function deactivateC1(round: number) {
          eventLog.events.length = 0;
          component.showC1 = false;
          await tasksSettled();
          assert.html.textContent(appHost, '', `round#${round} - c-1 deactivation - DOM`);
          assert.deepStrictEqual(eventLog.events, [], `round#${round} - c-1 deactivation - log`);
        }

        async function activateC1(success: boolean, round: number) {
          try {
            eventLog.events.length = 0;
            component.showC1 = true;
            if (!success) assert.fail(`round#${round} - c-1 activation should have failed`);
          } catch (e) {
            if (success) throw e;
          }
          assert.html.textContent(appHost, success ? 'c-1' : '', `round#${round} - c-1 activation triggered - DOM`);
          assert.deepStrictEqual(eventLog.events, ['c-1 binding enter', ...(success ? ['c-1 binding leave'] : [])], `round#${round} - c-1 activation triggered - log`);
        }
      });
    }
    {
      @customElement({ name: 'c-1', template: 'c-1' })
      class CeOne implements ICustomElementViewModel {

        private static id: number = 0;
        public static inject = [EventLog];
        public constructor(private readonly log: EventLog) { }

        binding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
          this.log.log('c-1 binding enter');
          const id = CeOne.id;
          CeOne.id++;
          if (id % 2 === 0) throw new Error('Synthetic test error');
          this.log.log('c-1 binding leave');
        }
      }

      @customElement({ name: 'c-2', template: 'c-2' })
      class CeTwo implements ICustomElementViewModel { }

      class Root {
        public showC1: boolean = false;
      }

      it('Once an activation errs, further successful activation of the same elements is still possible - with else', async function () {
        const { component, appHost, container, stop } = createFixture(
          `<c-1 if.bind="showC1"></c-1><c-2 else></c-2>`,
          Root,
          [EventLog, CeOne, CeTwo],
        );

        const eventLog = container.get(EventLog);

        assert.html.textContent(appHost, 'c-2', 'init');
        assert.deepStrictEqual(eventLog.events, [], 'init log');

        // trigger component activation - expect error
        await activateC1(false, 1);

        // deactivate c-1
        await deactivateC1(2);

        // activate c-1 again - expect success
        await activateC1(true, 3);

        // deactivate c-1
        await deactivateC1(4);

        // activate c-1 again - expect error
        await activateC1(false, 5);

        // deactivate c-1
        await deactivateC1(6);

        // activate c-1 again - expect success
        await activateC1(true, 7);

        await stop();

        async function deactivateC1(round: number) {
          eventLog.events.length = 0;
          component.showC1 = false;
          await tasksSettled();
          assert.html.textContent(appHost, 'c-2', `round#${round} - c-1 deactivation - DOM`);
          assert.deepStrictEqual(eventLog.events, [], `round#${round} - c-1 deactivation - log`);
        }

        async function activateC1(success: boolean, round: number) {
          try {
            eventLog.events.length = 0;
            component.showC1 = true;
            if (!success) assert.fail(`round#${round} - c-1 activation should have failed`);
          } catch (e) {
            if (success) throw e;
          }
          assert.html.textContent(appHost, success ? 'c-1' : '', `round#${round} - c-1 activation triggered - DOM`);
          assert.deepStrictEqual(eventLog.events, ['c-1 binding enter', ...(success ? ['c-1 binding leave'] : [])], `round#${round} - c-1 activation triggered - log`);
        }
      });
    }
  });
});
